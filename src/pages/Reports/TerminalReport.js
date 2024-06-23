import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import View from "../../components/View";
import axios from "axios";
import { CSVLink } from "react-csv";

async function fetchRows() {
  const response = await axios.get(
    "http://localhost:8000/terminal/getTerminal"
  ); // Replace with your actual API endpoint
  console.log("fethRows", response.data.terminals);
  return response.data.terminals; // Adjust this line based on your JSON structure
}

// const ExportCSV = ({ data }) => {
//   const headers = [
//     { label: "No", key: "id" },
//     { label: "ATM Type", key: "type" },
//     { label: "Onsite Terminals", key: "onsite" },
//     { label: "Offsite Terminals", key: "offsite" },
//     { label: "Total Terminals", key: "total" },
//   ];

//   return (
//     <Button variant="contained" color="primary">
//       <CSVLink
//         data={data}
//         headers={headers}
//         filename="data_export.csv"
//         style={{ textDecoration: "none", color: "white" }}
//       >
//         Export CSV
//       </CSVLink>
//     </Button>
//   );
// };

const TerminalReport = () => {
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const columns = [
    { field: "id", headerName: "No", type: "number", width: 10 },
    {
      field: "unitId",
      headerName: "Unit ID",
      type: "number",
      flex: 1,
    },
    {
      field: "terminalId",
      headerName: "Terminal ID",
      flex: 1,
    },
    {
      field: "terminalName",
      headerName: "Terminal Name",
      flex: 1,
    },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 1,
    },

    {
      field: "acceptorLocation",
      headerName: "Acceptor Location",
      flex: 1,
    },
    {
      field: "cbsAccount",
      headerName: "CBS Account",
      flex: 1,
    },
    {
      field: "port",
      headerName: "Port",
      flex: 1,
    },
    {
      field: "ipAddress",
      headerName: "IP Address",
      flex: 1,
    },
    {
      field: "type",
      headerName: "ATM TYPE",
    },
    {
      field: "dateCreated",
      headerName: "DateCreated",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
  ];

  useEffect(() => {
    async function loadRows() {
      try {
        const data = await fetchRows();
        setDataRows(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
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
      <Typography variant="h4">Terminal Report</Typography>
      <Box
        sx={{
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
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default TerminalReport;
