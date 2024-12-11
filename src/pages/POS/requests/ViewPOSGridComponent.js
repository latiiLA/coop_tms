import {
  Cancel,
  CheckCircle,
  ContentCopy,
  Edit,
  Preview,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography,
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

const ViewPOSGridComponent = ({ rows, isRelocated, detailType }) => {
  const navigate = useNavigate();

  const { role } = useAuthContext();
  // console.log(pings);
  const columns = [
    // { field: "id", headerName: "No", type: "number", width: 10 },
    {
      field: "serialNumber",
      headerName: "Serial No",
      type: "String",
      flex: 0.5,
    },
    { field: "posTerminalId", headerName: "Terminal ID", flex: 0.6 },
    { field: "merchantName", headerName: "Merchant Name", flex: 1 },
    { field: "posBranchName", headerName: "Branch Name", flex: 1 },
    { field: "posDistrict", headerName: "District", flex: 0.5 },
    { field: "posSite", headerName: "Site", flex: 0.5 },
    { field: "merchantId", headerName: "Merchant Id", flex: 0.8 },
    { field: "posCbsAccount", headerName: "CBS Account", flex: 0.8 },
    { field: "simCardNumber", headerName: "SIM Card No", flex: 0.6 },
    { field: "staticIp", headerName: "IP Address", flex: 0.8 },
    { field: "status", headerName: "Status", flex: 0.5 },
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
              <IconButton
                color="primary"
                size="small"
                disabled={role === "user" || role === "posuser"}
                style={{
                  display:
                    role === "user" || role === "posuser"
                      ? "none"
                      : "inline-flex",
                }}
                onClick={() =>
                  navigate("/editpos", { state: { row: params.row } })
                }
              >
                <Edit />
              </IconButton>
            </Tooltip>
          )}
          {detailType && (
            <Tooltip Tooltip title="View POS">
              <IconButton
                color="primary"
                size="small"
                onClick={() =>
                  navigate("/requestdetail", { state: { row: params.row } })
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
          {!isRelocated && (
            <Tooltip title="Generate Config">
              <IconButton
                color="primary"
                size="small"
                disabled={role === "user"}
                style={{
                  display:
                    role === "user" || role === "posuser"
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
  ];

  const handleCopy = (rowData) => {
    // Format the row data into a string
    const rowText = `
    ${rowData.serialNumber}
    ${rowData.posTerminalId}
    ${rowData.merchantName}
    ${rowData.posBranchName}
    ${rowData.posDistrict}
    ${rowData.posSite}
    ${rowData.merchantId}
    ${rowData.merchantAddress}
    ${rowData.merchantPhonenumber}
    ${rowData.posCbsAccount}
    ${rowData.simCardNumber}
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
    const HOSTIP = "10.1.162.10";
    const PORT = 5858;
    let MCC = 5411;
    if (configData === "Branch") {
      MCC = 6010;
    }

    let configVersion = configData.configVersion || "0001";
    configVersion = configVersion.toString().padStart(4, "0");

    try {
      const prmFileContent = await (await fetch(prmFile)).text();

      // Replace specific lines in the `.PRM` file
      let updatedPrmFile = prmFileContent
        .replace(/^HDR1=.*$/m, `HDR1=${configData.merchantName}`)
        .replace(/^HDR2=.*$/m, `HDR2=${configData.merchantAddress}`)
        .replace(/^HDR3=.*$/m, `HDR3=${configData.merchantPhonenumber}`)
        .replace(/^MID=.*$/m, `MID=${configData.merchantId}`)
        .replace(/^TID=.*$/m, `TID=${configData.posTerminalId}`)
        .replace(/^HOSTIP=.*$/m, `HOSTIP=${HOSTIP}`)
        .replace(/^PORT=.*$/m, `PORT=${PORT}`)
        .replace(/^\*MCC=.*$/m, `*MCC=${MCC}`);

      // Initialize JSZip
      const zip = new JSZip();
      zip.file("00055556.PRM", updatedPrmFile);

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
        zip.file(fileName, content);
      }

      // Generate ZIP file
      const zipContent = await zip.generateAsync({ type: "blob" });

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipContent);
      link.download = `ConfigurationFile_V${configVersion}.zip`;
      link.click();
      toast.success("successfully generated config file");
    } catch (error) {
      // console.error("Error generating configuration ZIP:", error);
      toast.error("Error generating config file.");
    }
  };

  return (
    <Box>
      <Box
        sx={{
          width: "auto",
          margin: 1,
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#0693e3",
            color: "#fff",
          },
          "& .MuiDataGrid-root": {
            overflow: "hidden",
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowY: "hidden !important", // Hides the vertical scrollbar
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            display: "none", // Hides the scrollbar for WebKit browsers
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
            display: "none",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          slots={
            role !== "user"
              ? { toolbar: GridToolbar }
              : { toolbar: CustomToolbar }
          }
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default ViewPOSGridComponent;
