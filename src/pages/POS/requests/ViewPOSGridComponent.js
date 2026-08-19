import {
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
  TextField,
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

  // dialog box for config version
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configVersion, setConfigVersion] = useState("0002");
  const [selectedConfigData, setSelectedConfigData] = useState(null);

  const { role, permissions } = useAuthContext();
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
    { field: "posCbsAccount", headerName: "CBS Account", flex: 0.5 },
    { field: "serviceNumber", headerName: "Service Number", flex: 0.6 },
    { field: "staticIp", headerName: "IP Address", flex: 0.8 },
    { field: "status", headerName: "Status", flex: 0.5 },
    {
      field: "district",
      headerName: "District",
      flex: 0.5,
      valueGetter: (value, row) => row?.branchName?.district?.districtName || "N/A",
    },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 0.5,
      valueGetter: (params) => params?.companyName || "N/A",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 0.5,
    },
    // {
    //   field: "updatedAt",
    //   headerName: "Updated At",
    //   flex: 0.5,
    // },
    // Actions Column    
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
            {!isRelocated && permissions?.includes("edit_pos") &&(
              <Tooltip title="Edit POS">
                <Box>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() =>
                      navigate("/editpos", { state: { row: params.row } })
                    }
                  >
                    <Edit />
                  </IconButton>
                </Box>
              </Tooltip>
            )}
            {!isRelocated && detailType && permissions?.includes("view_request_detail") && (
              <Tooltip Tooltip title="View Request">
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
            {!detailType && permissions?.includes("view_pos_detail") && (
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
            {/* <Tooltip title="Copy POS Information">
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleCopy(params.row)}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip> */}
            {permissions?.includes("request_pos_termination") && (params.row.status === "New" || params.row.status === "Active") && (
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
            {!isRelocated && permissions?.includes("generate_pos_config") && (
              <Tooltip title="Generate Config">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => {
                    setSelectedConfigData(params.row);
                    setConfigVersion("0002");
                    setConfigDialogOpen(true);
                  }}
                >
                  <GrConfigure />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ]

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

  const handleConfig = async (configData, selectedVersion) => {
    const HOSTIP = process.env.REACT_APP_HOSTIP;
    const HOSTPORT = process.env.REACT_APP_HOSTPORT;

    console.log("config data", configData);

    let MCC = 5411;
    if (configData.site === "BRANCH") {
      MCC = 6010;
    }

    let configVersion = selectedVersion || "0002";
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
      const folderName = `ConfigurationUpdatedFile_V${configVersion}`;
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
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Generate Configuration</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Configuration Version"
            value={configVersion}
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value.replace(/\D/g, "");
              setConfigVersion(value);
            }}
            placeholder="0002"
            helperText="Enter the configuration version, e.g. 0002"
            inputProps={{
              maxLength: 4,
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setConfigDialogOpen(false);
              setSelectedConfigData(null);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedConfigData) {
                toast.error("No terminal selected.");
                return;
              }

              if (!configVersion) {
                toast.error("Please enter a configuration version.");
                return;
              }

              setConfigDialogOpen(false);

              await handleConfig(
                selectedConfigData,
                configVersion
              );

              setSelectedConfigData(null);
            }}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewPOSGridComponent;
