import { Box, Button, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";

const columns = [
  {
    field: "id",
    headerName: "No",
    flex: 1,
  },
  {
    field: "_id",
    headerName: "Type",
    flex: 1,
  },
  {
    field: "count",
    headerName: "Total Operational Terminals",
    flex: 1,
  },
];

// const rows = [
//   {
//     id: 1,
//     type: "NCR",
//     no_terminals: "12",
//   },
//   {
//     id: 2,
//     type: "CRM",
//     no_terminals: "500",
//   },
// ];

// Mock function for demonstration
async function fetchRows() {
  const response = await axios.get(
    "http://localhost:8000/terminal/getTerminalCounts"
  ); // Replace with your actual API endpoint
  return response.data.terminalsCount; // Adjust this line based on your JSON structure
}

const TerminalTypeReports = () => {
  const [data_rows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function loadRows() {
      try {
        const data = await fetchRows();
        setDataRows(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRows();
  }, []);

  useEffect(() => {
    async function loadRows() {
      try {
        const data = await fetchRows();
        setDataRows(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadRows();
  }, []);

  const rows = data_rows.map((row, index) => ({
    id: index + 1,
    ...row,
  }));
  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }
  return (
    <Box>
      <Typography variant="h4">Total Terminals Added</Typography>

      <Box
        sx={{
          //   height: 400,
          width: "auto",
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#0693e3",
          },
        }}
      >
        <DataGrid
          {...rows}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          rows={rows}
          columns={columns}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default TerminalTypeReports;
