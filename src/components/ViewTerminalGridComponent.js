import { ContentCopy, Edit, Preview } from "@mui/icons-material";
import { Box, Divider, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import CustomToolbar from "./CustomToolbar";

const ViewTerminalGridComponent = ({ rows, isRelocated }) => {
  const navigate = useNavigate();
  const { role } = useAuthContext();
  const columns = [
    // { field: "id", headerName: "No", type: "number", width: 10 },
    { field: "unitId", headerName: "Unit ID", type: "number", flex: 0.1 },
    { field: "terminalId", headerName: "Terminal ID", flex: 0.6 },
    { field: "terminalName", headerName: "Terminal Name", flex: 1 },
    { field: "branchName", headerName: "Branch Name", flex: 1 },
    { field: "district", headerName: "District", flex: 0.8 },
    { field: "cbsAccount", headerName: "CBS Account", flex: 0.8 },
    { field: "port", headerName: "Port", flex: 0.1 },
    { field: "ipAddress", headerName: "IP Address", flex: 1 },
    { field: "type", headerName: "Type", flex: 0.1 },
    { field: "site", headerName: "Site", flex: 0.5 },
    { field: "status", headerName: "Status", flex: 0.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
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
          <Tooltip title="Copy Terminal Information">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleCopy(params.row)}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
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
    ${rowData.branchName}
    ${rowData.district}
    ${rowData.cbsAccount}
    ${rowData.port}
    ${rowData.ipAddress}
    ${rowData.type}
    ${rowData.site}
    ${rowData.status}
  `;

    navigator.clipboard
      .writeText(rowText)
      .then(() => {
        toast.success("Terminal details copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy branch details.");
      });
  };

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

export default ViewTerminalGridComponent;
