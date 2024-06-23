import { Box, IconButton, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

async function fetchRows() {
  const response = await axios.get("http://localhost:8000/port/getports"); // Replace with your actual API endpoint
  return response.data.ports; // Adjust this line based on your JSON structure
}

const ViewPort = () => {
  const [data_rows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const rows = data_rows.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

  const columns = [
    {
      field: "id",
      headerName: "No",
    },
    {
      field: "portName",
      headerName: "Port Name",
      type: "string",
      flex: 1,
    },
    {
      field: "portNumber",
      headerName: "port Number",
      type: "string",
      flex: 1,
    },
    {
      field: "portAssignment",
      headerName: "Port ATM Type Usage",
      type: "string",
      flex: 1,
    },
    {
      field: "portSiteAssignment",
      headerName: "Port ATM Site Usage",
      type: "string",
      flex: 1,
    },
    {
      field: "usedPorts",
      headerName: "Used Ports",
      type: "string",
      flex: 1,
    },
    {
      field: "portCapacity",
      headerName: "Port Max Capacity",
      type: "string",
      flex: 1,
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            width: "auto",
          }}
        >
          <IconButton
            color="secondary"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleDelete = (id) => {
    // Add your delete logic here
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }
  return (
    <Box>
      <Typography>All ports</Typography>
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
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row._id}
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

export default ViewPort;
