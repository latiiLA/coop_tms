import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { CopyAll, Search } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Commands({ role = "admin" }) {
  const [data_rows, setDataRows] = useState([]);
  const [edited, setEdited] = useState({});
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate()

  const fetchRows = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    const response = await axios.get(`${apiUrl}/command/getCommand`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
    return response.data.commands;
  }

  const handleCopy = (rowData) => {
    // Format the row data into a string
    console.log(rowData);
    const rowText = `
    ${rowData.example}
  `;

    const textArea = document.createElement("textarea");
    textArea.value = rowText;
    textArea.style.position = "fixed"; // Prevent scrolling to the bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy"); // Fallback to execCommand for unsupported environments
      toast.success("Load example copied.");
    } catch (err) {
      // console.error("Fallback: Failed to copy:", err);
      toast.error("Failed to copy load example.");
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  };

  useEffect(() => {
    async function loadRows() {
      try {
        const data = await fetchRows();
        setDataRows(data);
      } catch (error) {
        // console.error("Error fetching data:", error);
      }
    }

    loadRows();
  }, []);

  const rows = data_rows.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

  const allColumns = [
    {
      field: "id",
      headerName: "No",
      flex: 0.1,
    },
    {
      field: "command",
      headerName: "Command",
      type: "string",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      type: "string",
      flex: 1,
    },
    {
      field: "example",
      headerName: "Example",
      type: "string",
      flex: 1,
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 0.3,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "left",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton color="primary" onClick={() => handleCopy(params.row)}>
            <CopyAll />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleDelete = (id) => {
    // Add your delete logic here
  };

  const columns =
    role === "user"
      ? allColumns.filter((col) => col.field !== "actions")
      : role === "admin"
        ? allColumns
        : allColumns.filter((col) => col.field !== "actions");

  const filteredRows = rows.filter((row) => {
    // Perform case-insensitive search in all text fields
    const searchLower = searchText.toLowerCase();
    return (
      row.command.toLowerCase().includes(searchLower) ||
      row.description.toLowerCase().includes(searchLower) ||
      row.example.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          margin: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{ height: "100%", marginTop: "auto" }}
          gutterBottom
        >
          Commands
        </Typography>
        <TextField
          label="Search"
          value={searchText}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box
        sx={{
          width: "auto",
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
          },
          margin: 1,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          autoHeight
          checkboxSelection
        />
      </Box>
    </Box>
  );
}
