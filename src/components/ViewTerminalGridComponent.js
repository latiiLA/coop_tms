import React, { useState } from "react";
import { Edit, Preview } from "@mui/icons-material";
import { Box, IconButton, Tooltip, TextField, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const ViewTerminalGridComponent = ({ rows }) => {
  const navigate = useNavigate();
  const { role } = useAuthContext();

  // State for search text and filtered rows
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState(rows);

  // Columns configuration
  const columns = [
    { field: "unitId", headerName: "Unit ID", type: "number", flex: 0.1 },
    { field: "terminalId", headerName: "Terminal ID", flex: 0.6 },
    { field: "terminalName", headerName: "Terminal Name", flex: 1 },
    { field: "branchName", headerName: "Branch Name", flex: 1 },
    { field: "district", headerName: "District", flex: 0.8 },
    { field: "cbsAccount", headerName: "CBS Account", flex: 1 },
    { field: "port", headerName: "Port", flex: 0.1 },
    { field: "ipAddress", headerName: "IP Address", flex: 1 },
    { field: "type", headerName: "Type", flex: 0.5 },
    { field: "site", headerName: "Site", flex: 0.5 },
    { field: "status", headerName: "Status", flex: 0.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            margin: "auto",
            alignItems: "center",
          }}
        >
          <Tooltip title="Edit Terminal">
            <IconButton
              color="primary"
              size="small"
              disabled={role === "user"}
              style={{ display: role === "user" ? "none" : "inline-flex" }}
              onClick={() => navigate("/edit", { state: { row: params.row } })}
            >
              <Edit />
            </IconButton>
          </Tooltip>
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
        </Box>
      ),
    },
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Handle search button click
  const handleSearchClick = () => {
    const lowercasedFilter = searchText.toLowerCase();
    const filteredData = rows.filter((item) => {
      return Object.keys(item).some((key) =>
        String(item[key]).toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredRows(filteredData);
  };

  // Handle reset button click
  const handleResetClick = () => {
    setSearchText(""); // Clear the search input
    setFilteredRows(rows); // Reset the DataGrid to show all rows
  };

  return (
    <Box>
      <Box
        sx={{
          marginBottom: 2,
          display: "flex",
          justifyContent: "space-between",
          width: "50%",
        }}
      >
        <TextField
          label="Search"
          value={searchText}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          style={{ marginRight: "10px", width: "250px" }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearchClick}
          style={{ marginRight: "10px" }}
        >
          Search
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleResetClick}>
          Reset
        </Button>
      </Box>
      <Box
        sx={{
          width: "auto",
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
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
          rows={filteredRows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default ViewTerminalGridComponent;
