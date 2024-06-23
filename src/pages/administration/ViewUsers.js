import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import axios from "axios";

const columns = [
  {
    field: "id",
    headerName: "No",
  },
  {
    field: "username",
    headerName: "Username",
    flex: 1,
  },

  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    valueGetter: (value, row) =>
      `${row.firstName || ""} ${row.fatherName || ""} ${row.gfatherName || ""}`,
    flex: 1,
  },
  {
    field: "department",
    headerName: "Department",
    flex: 1,
  },
  {
    field: "role",
    headerName: "Role",
    flex: 1,
  },
  {
    field: "createdAt",
    headerName: "DateCreated",
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1,
  },

  {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    renderCell: (params) => (
      <IconButton
        color="secondary"
        size="small"
        // onClick={() => handleDelete(params.row.id)}
      >
        <DeleteIcon />
      </IconButton>
    ),
  },
];

// const rows = [
//   {
//     id: 1,
//     unitId: 1,
//     terminalId: "EFDC0122",
//     terminalName: "Nekemte",
//     branchName: "Nekemte",
//     acceptorLocation: "Nekemte",
//     cbsAccount: "ETB10005000102222",
//     port: "6800",
//     ipAddress: "198.563.25.3",
//     status: "Done",
//     dateCreated: "06/06/2024",
//   },
//   {
//     id: 2,
//     unitId: 1,
//     terminalId: "EFD0122",
//     terminalName: "Nekemte",
//     branchName: "Nekemte",
//     acceptorLocation: "Nekemte",
//     cbsAccount: "ETB10005000102222",
//     port: "6800",
//     ipAddress: "198.563.255.333",
//     status: "Done",
//     dateCreated: "6/6/2024",
//   },
//   {
//     id: 3,
//     unitId: 444,
//     terminalId: "EFD0122",
//     terminalName: "Nekemte",
//     branchName: "Nekemte",
//     acceptorLocation: "Nekemte",
//     cbsAccount: "ETB10005000102222",
//     port: "6800",
//     ipAddress: "198.563.25.3",
//     status: "Done",
//     dateCreated: "6/6/2024",
//   },
//   { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
//   { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
//   { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
//   { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
//   { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
//   { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
// ];

async function fetchRows() {
  const response = await axios.get("http://localhost:8000/auth/getUser"); // Replace with your actual API endpoint
  return response.data.users; // Adjust this line based on your JSON structure
}

export default function ViewUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data_rows, setDataRows] = useState([]);

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

  console.log(rows);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="h4">User Management</Typography>
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
        }}
      >
        <DataGrid
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
}
