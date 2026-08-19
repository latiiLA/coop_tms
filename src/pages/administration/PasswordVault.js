import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  InputAdornment,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PreviewIcon from "@mui/icons-material/Preview";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { LockOpen, Search } from "@mui/icons-material";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PasswordVault() {
  const navigate = useNavigate();
  const { role, permissions } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataRows, setDataRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleClickOpen = (rowId) => {
    setSelectedRowId(rowId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRowId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRowId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }
    try {
      await axios.patch(
        `${apiUrl}/auth/deletePasswordEntry/${selectedRowId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const updatedData = await fetchRows();
      setDataRows(updatedData);

      handleClose();
      toast.success("Password entry successfully deleted.");
    } catch (error) {
      // console.error("Error deleting user:", error);
      toast.error(error.response.data.message);
      handleClose();
    }
  };

  const handleReset = async (rowId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not an authenticated user.");
      navigate("/home");
      return;
    }
    try {
      await axios.patch(
        `${apiUrl}/auth/resetCount/${rowId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const updatedData = await fetchRows();
      setDataRows(updatedData);
      toast.success("Password count is successfully reset.");
    } catch (error) {
      // console.error("Error resetting wrong password count", error);
      toast.error("Error: while resetting wrong password count.");
    }
  };

  const columns = [
    { field: "id", headerName: "No", flex: 0.1 },
    { field: "serverName", headerName: "Server Name", flex: 0.4 },
    {
      field: "serverIP",
      headerName: "Server IP",
      flex: 0.6,
    },
    { field: "serverOS", headerName: "Operating System", flex: 0.4 },
    { field: "serverUsername", headerName: "Username", flex: 0.4 },
    { field: "serverPassword", headerName: "Password", flex: 0.4},
    { field: "createdBy", headerName: "Created By",
        valueGetter: (value, row) => row.createdBy?.firstName + " " + row.createdBy?.fatherName || "N/A", 
        flex: 0.6 
    },
    { field: "createdAt", headerName: "Created At",
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
      flex: 0.3 
    },
    { field: "status", headerName: "Status", flex: 0.3 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.4,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "100%", // Ensure the Box takes the full height of the cell
            // width: "100%",
            margin: "auto",
          }}
        >
          {permissions?.includes("edit_password_entry") && (
            <Tooltip title="Edit Password Entry">
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleReset(params.row._id)}
                margin="auto"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {permissions?.includes("view_password_entry_detail") && (
              <Tooltip title="View Password Entry">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleReset(params.row._id)}
                >
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
          )}
          {permissions?.includes("delete_password_entry") && (
              <Tooltip title="Delete Password Entry">
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={() => handleClickOpen(params.row._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  async function fetchRows() {
    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return [];
    }
    try {
      const response = await axios.get(`${apiUrl}/password/getPasswordEntry`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("password entries", response.data.passwordEntries)
      return response.data.passwordEntries;
    } catch (error) {
      // console.error("Error fetching data:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
      return [];
    }
  }

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

  const rows = dataRows.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

  const filteredRows = rows.filter((row) => {
    const searchLower = searchText.toLowerCase();

    return (
      String(row.serverName || "").toLowerCase().includes(searchLower) ||
      String(row.serverIP || "").toLowerCase().includes(searchLower) ||
      String(row.serverOS || "").toLowerCase().includes(searchLower) ||
      String(row.serverUsername || "").toLowerCase().includes(searchLower) ||
      String(row.serverPassword || "").toLowerCase().includes(searchLower) ||
      String(row.createdBy.firstName || "").toLowerCase().includes(searchLower) ||
      String(row.createdBy.fatherName || "").toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

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
          Password Vault
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
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
          },
          margin: 1,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 15 },
            },
          }}
          pageSizeOptions={[15, 30, 50]}
          autoHeight
          checkboxSelection
        />
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
