import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import axios from "axios";
import { useEffect, useState } from "react";

async function fetchRows() {
  const response = await axios.get(
    "http://localhost:8000/terminal/getTerminal"
  ); // Replace with your actual API endpoint
  // console.log("fethRows", response.data.terminals);
  return response.data.terminals; // Adjust this line based on your JSON structure
}
export default function View({ role }) {
  const [data_rows, setDataRows] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [edited, setEdited] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const allColumns = [
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
      renderCell: (params) =>
        editingRow === params.row.id ? (
          <TextField
            name="terminalId"
            value={edited.terminalId}
            onChange={handleInputChange}
            fullWidth
            width="auto"
          />
        ) : (
          params.row.terminalId
        ),
    },
    {
      field: "terminalName",
      headerName: "Terminal Name",
      flex: 1,
      renderCell: (params) =>
        editingRow === params.row.id ? (
          <TextField
            name="terminalName"
            value={edited.terminalName}
            onChange={handleInputChange}
          />
        ) : (
          params.row.terminalName
        ),
    },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 1,
      renderCell: (params) =>
        editingRow === params.row.id ? (
          <TextField
            name="branchName"
            value={edited.branchName}
            onChange={handleInputChange}
          />
        ) : (
          params.row.branchName
        ),
    },

    {
      field: "acceptorLocation",
      headerName: "Acceptor Location",
      flex: 1,
      renderCell: (params) =>
        editingRow === params.row.id ? (
          <TextField
            name="acceptorLocation"
            value={edited.acceptorLocation}
            onChange={handleInputChange}
          />
        ) : (
          params.row.acceptorLocation
        ),
    },
    {
      field: "cbsAccount",
      headerName: "CBS Account",
      flex: 1,
      renderCell: (params) =>
        editingRow === params.row.id ? (
          <TextField
            name="cbsAccount"
            value={edited.cbsAccount}
            onChange={handleInputChange}
          />
        ) : (
          params.row.cbsAccount
        ),
    },
    {
      field: "port",
      headerName: "Port",
      flex: 1,
      renderCell: (params) =>
        editingRow === params.row.id ? (
          <TextField
            fullWidth
            name="port"
            value={edited.port}
            onChange={handleInputChange}
          />
        ) : (
          params.row.port
        ),
    },
    {
      field: "ipAddress",
      headerName: "IP Address",
      flex: 1,
      renderCell: (params) =>
        editingRow === params.row.id ? (
          <TextField
            fullWidth
            name="ipAddress"
            value={edited.ipAddress}
            onChange={handleInputChange}
          />
        ) : (
          params.row.ipAddress
        ),
    },
    {
      field: "type",
      headerName: "ATM TYPE",
    },
    {
      field: "createdAt",
      headerName: "CreatedAt",
      flex: 1,
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
        <div
          sx={{ display: "flex", flexDirection: "row", gap: 5, width: "100%" }}
        >
          {editingRow === params.row.id ? (
            <IconButton
              color="primary"
              size="small"

              // onClick={() => handleDelete(params.row.id)}
            >
              <SaveAsIcon />
            </IconButton>
          ) : (
            <Box>
              <IconButton
                color="primary"
                size="small"
                disable={!role}
                onClick={() => handleEdit(params.row)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="primary"
                size="small"
                disable={!role}
                // onClick={() => handleDelete(params.row.id)}
              >
                <SaveAsIcon />
              </IconButton>
              <IconButton
                color="secondary"
                size="small"
                // onClick={() => handleDelete(params.row.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </div>
      ),
    },
  ];

  const handleEdit = (row) => {
    setEditingRow(row.id);
    setEdited({ ...row });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEdited({ ...edited, [name]: value });
  };

  const columns =
    role === "user"
      ? allColumns.filter((col) => col.field !== "actions")
      : role === "admin"
        ? allColumns
        : allColumns.filter((col) => col.field !== "actions"); // Modify this part if you want to apply a different filter for other roles

  useEffect(() => {
    async function loadRows() {
      try {
        const data = await fetchRows();
        setDataRows(data);
      } catch (error) {
        // console.error("Error fetching data:", error);
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

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4">All ATM Terminals</Typography>
      <Box
        sx={{
          height: 400,
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
          rows={rows}
          columns={columns}
          isRowEditable={true}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          sx={
            {
              // ".MuiDataGrid-columnSeparator": {
              //   display: "none",
              // },
              // "&.MuiDataGrid-root": {
              //   border: "none",
              // },
            }
          }
        />
      </Box>
    </Box>
  );
}
