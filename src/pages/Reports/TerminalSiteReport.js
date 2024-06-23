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
    field: "type",
    headerName: "ATM Type",
    flex: 1,
  },
  {
    field: "onsite",
    headerName: "Onsite Terminals",
    flex: 1,
  },
  {
    field: "offsite",
    headerName: "Offsite Terminals",
    flex: 1,
  },
  {
    field: "total",
    headerName: "Total Terminals",
    flex: 1,
  },
];

async function fetchRows() {
  const response = await axios.get(
    "http://localhost:8000/terminal/getSiteCounts"
  );
  return response.data.data; // Adjust this line based on your JSON structure
}

const TerminalSiteReport = () => {
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const rows = dataRows.map((row, index) => ({
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
      <Typography variant="h4">Terminal Site Report</Typography>
      <Box
        sx={{
          width: "100%",
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            "& .MuiCheckbox-root": {
              color: "#fff",
            },
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#0693e3",
            color: "#fff !important",
          },
          "& .MuiTablePagination-root": {
            backgroundColor: "#0693e3",
            color: "#fff !important",
          },
          "& .MuiTablePagination-actions button": {
            color: "#fff",
          },
          "& .MuiDataGrid-sortIcon": {
            color: "#fff",
          },
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none !important",
          },
          "& .MuiPaginationItem-root": {
            color: "#fff !important",
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

export default TerminalSiteReport;
