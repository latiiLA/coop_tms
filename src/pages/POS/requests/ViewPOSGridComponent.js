import {
  ContentCopy,
  Delete,
  Download,
  Edit,
  Preview,
  Stop,
} from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/AuthContext";
import CustomToolbar from "../../../components/CustomToolbar";
import { GrConfigure } from "react-icons/gr";
import JSZip from "jszip";
import prmFile from "../../../assets/posconfig/00055556.PRM";
import emvApplications from "../../../assets/posconfig/EMV_Applications.xml";
import emvCtlsAppsScheme from "../../../assets/posconfig/EMV_CTLS_Apps_SchemeSpecific.xml";
import emvCtlsKeysTest from "../../../assets/posconfig/EMV_CTLS_Keys_test.xml";
import emvCtlsKeys from "../../../assets/posconfig/EMV_CTLS_Keys.xml";
import emvCtlsTerminal from "../../../assets/posconfig/EMV_CTLS_Terminal.xml";
import emvKeys from "../../../assets/posconfig/EMV_Keys.xml";
import emvTerminal from "../../../assets/posconfig/EMV_Terminal.xml";
import axios from "axios";
import * as XLSX from "xlsx";

const ViewPOSGridComponent = ({
  rows,
  isRelocated,
  isRelocatedReq,
  detailType,
}) => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedData, setCopiedData] = React.useState("");

  const { role } = useAuthContext();
  // console.log(pings);
  const columns = [
    {
      field: "serialNumber",
      headerName: "Serial No",
      type: "String",
      flex: 0.5,
      valueGetter: (params) => {
        return params?.serialNumber || "N/A";
      },
    },
    { field: "terminalId", headerName: "Terminal ID", flex: 0.6 },
    { field: "merchantId", headerName: "Merchant Id", flex: 0.8 },
    { field: "merchantName", headerName: "Merchant Name", flex: 1 },
    { field: "site", headerName: "Site", flex: 0.5 },
    { field: "merchantAddress", headerName: "Address", flex: 0.5 },
    { field: "posCbsAccount", headerName: "CBS Account", flex: 0.8 },
    { field: "serviceNumber", headerName: "Service Number", flex: 0.6 },
    { field: "staticIp", headerName: "IP Address", flex: 0.8 },
    { field: "status", headerName: "Status", flex: 0.5 },
    {
      field: "district",
      headerName: "District",
      flex: 0.5,
      valueGetter: (params) => params?.districtName || "N/A",
    },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 1,
      valueGetter: (params) => params?.companyName || "N/A",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 0.5,
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      flex: 0.5,
    },
    // Actions Column (Still using renderCell because it involves buttons)
    ...(!isRelocated
      ? [
          {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                  width: "100%",
                  height: "100%",
                  margin: "auto",
                  alignItems: "center",
                }}
              >
                {!isRelocated && (
                  <Tooltip title="Edit POS">
                    <Box>
                      <IconButton
                        color="primary"
                        size="small"
                        disabled={
                          role === "user" ||
                          role === "posuser" ||
                          role === "user" ||
                          role === "posauthorizer"
                        }
                        style={{
                          display:
                            role === "user" ||
                            role === "posuser" ||
                            role === "posauthorizer"
                              ? "none"
                              : "inline-flex",
                        }}
                        onClick={() =>
                          navigate("/editpos", { state: { row: params.row } })
                        }
                      >
                        <Edit />
                      </IconButton>
                    </Box>
                  </Tooltip>
                )}
                {detailType && (
                  <Tooltip Tooltip title="View POS">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() =>
                        navigate("/requestdetail", {
                          state: { row: params.row },
                        })
                      }
                    >
                      <Preview />
                    </IconButton>
                  </Tooltip>
                )}
                {!detailType && (
                  <Tooltip title="View POS">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() =>
                        navigate("/posdetail", {
                          state: {
                            isRequest: false,
                            relocated: false,
                            row: params.row,
                          },
                        })
                      }
                    >
                      <Preview />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Copy POS Information">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleCopy(params.row)}
                  >
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
                {role === "posuser" && (
                  <Tooltip title="Stop POS">
                    <IconButton
                      sx={{ color: "#ff0000" }}
                      size="small"
                      onClick={() => handleRelocate(params.row._id)}
                    >
                      <Stop />
                    </IconButton>
                  </Tooltip>
                )}
                {!isRelocated && (
                  <Tooltip title="Generate Config">
                    <IconButton
                      color="primary"
                      size="small"
                      disabled={role === "user"}
                      style={{
                        display:
                          role === "user" ||
                          role === "posuser" ||
                          role === "posauthorizer"
                            ? "none"
                            : "inline-flex",
                      }}
                      onClick={() => handleConfig(params.row)}
                    >
                      <GrConfigure />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  const handleCopy = (rowData) => {
    // Format the row data into a string
    const rowText = `
    ${rowData.serialNumber.serialNumber}
    ${rowData.terminalId}
    ${rowData.merchantName}
    ${rowData.branchName.companyName}
    ${rowData.district.districtName}
    ${rowData.site}
    ${rowData.merchantId}
    ${rowData.merchantAddress}
    ${rowData.merchantPhonenumber}
    ${rowData.posCbsAccount}
    ${rowData.serviceNumber}
    ${rowData.staticIp}
    ${rowData.status}
  `;

    // Check if the Clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(rowText)
        .then(() => {
          toast.success("POS details copied to clipboard!");
        })
        .catch((err) => {
          // console.error("Failed to copy:", err);
          toast.error("Failed to copy POS details.");
        });
    } else {
      // Fallback for HTTP or unsupported browsers
      fallbackCopyText(rowText);
    }
  };

  const handleDelete = async (row) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    console.log("handle pos creation", row);
    if (!token) {
      navigate("/home");
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/pos/relocate/${row}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      // setSubmitting(false);
      setLoading(false);
    }
  };

  // Fallback method using a temporary textarea for older browsers or HTTP
  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Prevent scrolling to the bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy"); // Fallback to execCommand for unsupported environments
      toast.success("POS Terminal details copied to clipboard!");
    } catch (err) {
      // console.error("Fallback: Failed to copy:", err);
      toast.error("Failed to copy POS terminal details.");
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  };

  const handleConfig = async (configData) => {
    const HOSTIP = process.env.REACT_APP_HOSTIP;
    const HOSTPORT = process.env.REACT_APP_HOSTPORT;

    console.log("config data", configData);

    let MCC = 5411;
    if (configData.site === "BRANCH") {
      MCC = 6010;
    }

    let configVersion = configData.configVersion || "0002";
    configVersion = configVersion.toString().padStart(4, "0");

    try {
      const prmFileContent = await (await fetch(prmFile)).text();

      // Replace specific lines in the `.PRM` file
      let updatedPrmFile = prmFileContent
        .replace(/^HDR1=.*$/m, `HDR1=${configData.merchantName}`)
        .replace(/^HDR2=.*$/m, `HDR2=${configData.merchantAddress}`)
        .replace(/^HDR3=.*$/m, `HDR3=TEL: ${configData.merchantPhonenumber}`)
        .replace(/^MID=.*$/m, `MID=${configData.merchantId}`)
        .replace(/^TID=.*$/m, `TID=${configData.terminalId}`)
        .replace(/^HOSTIP=.*$/m, `HOSTIP=${HOSTIP}`)
        .replace(/^PORT=.*$/m, `PORT=${HOSTPORT}`)
        .replace(/^\*MCC=.*$/m, `*MCC=${MCC}`);

      // Initialize JSZip
      const zip = new JSZip();

      // Create a folder with the same name as the zip file
      const folderName = `ConfigurationFile_V${configVersion}`;
      const folder = zip.folder(folderName);

      folder.file("00055556.PRM", updatedPrmFile);

      // Add other files to the ZIP
      const fileContents = {
        "EMV_Applications.xml": emvApplications,
        "EMV_CTLS_Apps_SchemeSpecific.xml": emvCtlsAppsScheme,
        "EMV_CTLS_Keys_test.xml": emvCtlsKeysTest,
        "EMV_CTLS_Keys.xml": emvCtlsKeys,
        "EMV_CTLS_Terminal.xml": emvCtlsTerminal,
        "EMV_Keys.xml": emvKeys,
        "EMV_Terminal.xml": emvTerminal,
      };

      for (const [fileName, filePath] of Object.entries(fileContents)) {
        const content = await (await fetch(filePath)).text();
        folder.file(fileName, content);
      }

      // Generate ZIP file
      const zipContent = await zip.generateAsync({ type: "blob" });

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipContent);
      link.download = `${folderName}.zip`;
      link.click();
      toast.success("successfully generated config file");
    } catch (error) {
      // console.error("Error generating configuration ZIP:", error);
      toast.error("Error generating config file.");
    }
  };

  const handleRelocate = (row) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  // Function to confirm relocation and proceed with delete
  const handleConfirmRelocate = () => {
    setOpenDialog(false);
    handleDelete(selectedRow);
  };

  const handleCancel = () => {
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box
        sx={{
          width: "auto",
          margin: 1,
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          loading={loading}
          slots={
            role !== "user"
              ? { toolbar: GridToolbar }
              : { toolbar: CustomToolbar }
          }
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          checkboxSelection
          onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
        />
      </Box>
      <Alert severity="info" sx={{ width: "100%", mt: 1 }}>
        <AlertTitle>Copied data:</AlertTitle>
        <code
          style={{
            display: "block",
            maxHeight: 200,
            overflow: "auto",
            whiteSpace: "pre-line",
          }}
        >
          {copiedData}
        </code>
      </Alert>
      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle>Confirm Relocation</DialogTitle>
        <DialogContent>
          Are you sure you want to stop/terminate POS? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRelocate}
            color="primary"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewPOSGridComponent;
