import { ContentCopy, Edit, Preview } from "@mui/icons-material";
import { Alert, AlertTitle, Box, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import CustomToolbar from "./CustomToolbar";
import { GrConfigure } from "react-icons/gr";
import axios from "axios";

const ViewTerminalGridComponent = ({ rows, isRelocated }) => {
  const navigate = useNavigate();
  const { role, permissions } = useAuthContext();
  const [copiedData, setCopiedData] = React.useState("");
  // console.log(pings);

  const [open, setOpen] = useState(false);
  const [configData, setConfigData] = useState("");

  const columns = [
    // { field: "id", headerName: "No", type: "number", width: 10 },
    { field: "unitId", headerName: "Unit ID", type: "number", flex: 0.4 },
    { field: "terminalId", headerName: "Terminal ID", flex: 0.6 },
    { field: "terminalName", headerName: "Terminal Name", flex: 1 },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 1,
      valueGetter: (params) => {
        return params?.companyName || "N/A";
      },
    },
    {
      field: "district",
      headerName: "District",
      flex: 0.7,
      valueGetter: (value, row) => {
        return row?.branchName?.district?.districtName || "N/A";
      },
    },
    { field: "cbsAccount", headerName: "CBS Account", flex: 0.8 },
    { field: "port", headerName: "Port", flex: 0.1 },
    { field: "ipAddress", headerName: "IP Address", flex: 0.8 },
    { field: "type", headerName: "Type", flex: 0.1 },
    { field: "site", headerName: "Site", flex: 0.4 },
    { field: "status", headerName: "Status", flex: 0.5 },
    { field: "createdAt", headerName: "CreatedAt", flex: 0.5, 
      valueFormatter: (value) => {
        if (!value) return "";
        const date = new Date(value);
        return date.toLocaleString("en-US", 
          { 
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit", 
          });
      },
    },
    { field: "updatedAt", headerName: "UpdatedAt", flex: 0.5,
       valueFormatter: (value) => {
        if (!value) return "";
        const date = new Date(value);
        return date.toLocaleString("en-US", 
          { 
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit", 
          });
      },
    },
    // // ip_terminal_id
    // {!isRelocated && (
    //   {
    //     field: "EJ",
    //     headerName: "EJ",
    //     flex: 0.1,
    //     renderCell: (params) => (
    //       <Box
    //         sx={{
    //           display: "flex",
    //           flexDirection: "row",
    //           justifyContent: "space-around",
    //           width: "100%",
    //           height: "100%",
    //           margin: "auto",
    //           alignItems: "center",
    //         }}
    //       >
    //         <Tooltip title="Download EJ File">
    //           <IconButton
    //             color="primary"
    //             size="small"
    //             onClick={() => handleEJFile(params.row)}
    //           >
    //             <Download />
    //           </IconButton>
    //         </Tooltip>
    //       </Box>
    //     ),
    //   })},
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.9,
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
          {!isRelocated && permissions?.includes("edit_terminal") && (
            <Tooltip title="Edit Terminal">
              <IconButton
                color="primary"
                size="small"
                disabled={role === "user"}
                style={{ display: role === "user" ? "none" : "inline-flex" }}
                onClick={() =>
                  navigate("/edit", { state: { row: params.row } })
                }
              >
                <Edit />
              </IconButton>
            </Tooltip>
          )}
          {permissions?.includes("view_terminal_detail") &&
            <Tooltip title="View Terminal">
              <IconButton
                color="primary"
                size="small"
                onClick={() =>
                  navigate("/viewdetail", { state: { row: params.row } })
                }
              >
                <Preview />
              </IconButton>
            </Tooltip>
          }
          {/* <Tooltip title="Copy Terminal Information">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleCopy(params.row)}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip> */}
          {!isRelocated && permissions?.includes("generate_terminal_config") && (
            <Tooltip title="Generate Config">
              <IconButton
                color="primary"
                size="small"
                disabled={role === "user"}
                style={{ display: role === "user" ? "none" : "inline-flex" }}
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
    ${rowData.unitId}
    ${rowData.terminalId}
    ${rowData.terminalName}
    ${rowData.branchName.companyName}
    ${rowData.district.districtName}
    ${rowData.cbsAccount}
    ${rowData.port}
    ${rowData.ipAddress}
    ${rowData.type}
    ${rowData.site}
    ${rowData.status}
  `;

    // Check if the Clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(rowText)
        .then(() => {
          toast.success("Copied to clipboard!");
        })
        .catch((err) => {
          // console.error("Failed to copy:", err);
          toast.error("Failed to copy.");
        });
    } else {
      // Fallback for HTTP or unsupported browsers
      fallbackCopyText(rowText);
    }
  };

  const handlePortName = async (portNumber) => {
    console.log(portNumber);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return; // Exit the function if no token is found
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(
        `${apiUrl}/port/getPortName`, // Use the correct endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { portNumber }, // Pass portNumber as a query parameter
          withCredentials: true,
        }
      );
      // console.log("return inside handleportName", response.data.portName);
      return response.data.portName; // Return the fetched port name
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }

      return null; // Signal failure with a return value
    }
  };

  const handleConfig = async (row) => {
    let type = "CBOBNA";
    if (row.type === "NCR") {
      type = "CBONCR";
    }
    // console.log(rowData);

    const portName = await handlePortName(row.port);
    console.log("inside handle config", portName);
    const portNameLowercase = String(portName).toLowerCase();

    const rowData = `port.name  atm.1.${type}.${row.unitId}  CurrentNode  DnAtmServer  external  listen  <cmmt:CMMT_${portName}.*.${row.port}|${row.ipAddress}.*::cmmt_${portNameLowercase}>`;
    // setConfigData(configData); // Set config data
    // setOpen(true); // Open dialo
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(rowData)
        .then(() => {
          toast.success("Copied to clipboard!");
        })
        .catch((err) => {
          // console.error("Failed to copy:", err);
          toast.error("Failed to copy.");
        });
    } else {
      // Fallback for HTTP or unsupported browsers
      fallbackCopyText(rowData);
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
      toast.success("Copied to clipboard!");
    } catch (err) {
      // console.error("Fallback: Failed to copy:", err);
      toast.error("Failed to copy.");
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  };

  // const handleClose = () => {
  //   setOpen(false);
  // };

  return (
    <Box>
      <Box
        sx={{
          width: "auto",
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
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
          marginX: 1,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          slots={
            // role !== "user"
              // ? 
              { 
                toolbar: GridToolbar
              }
              // : { toolbar: CustomToolbar }
          }
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          checkboxSelection
          onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
        />
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
        {/* Dialog for Config Data */}
        {/* <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Configuration Data</DialogTitle>
          <DialogContent>
            <Typography variant="body1">{configData}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                configCopy(configData);
                handleClose();
              }}
              color="primary"
            >
              Copy
            </Button>
          </DialogActions>
        </Dialog> */}
      </Box>
    </Box>
  );
};

export default ViewTerminalGridComponent;
