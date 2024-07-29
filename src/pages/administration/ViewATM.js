import React, { useEffect, useState, useRef } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Edit, Preview, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useAuthContext } from "../../context/AuthContext";

export default function ViewATM() {
  const navigate = useNavigate();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("user");
  const [open, setOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const hasShownToast = useRef(false);
  const apiUrl = process.env.API_URL;

  const columns = [
    { field: "id", headerName: "No", type: "number", width: 10 },
    { field: "unitId", headerName: "Unit ID", type: "number", flex: 1 },
    { field: "terminalId", headerName: "Terminal ID", flex: 1 },
    { field: "terminalName", headerName: "Terminal Name", flex: 1 },
    { field: "branchName", headerName: "Branch Name", flex: 1 },
    { field: "acceptorLocation", headerName: "Acceptor Location", flex: 1 },
    { field: "cbsAccount", headerName: "CBS Account", flex: 1 },
    { field: "port", headerName: "Port", flex: 1 },
    { field: "ipAddress", headerName: "IP Address", flex: 1 },
    { field: "type", headerName: "ATM TYPE" },
    { field: "site", headerName: "Terminal Site" },
    { field: "createdAt", headerName: "CreatedAt", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
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
          <Tooltip title="Delete Terminal">
            <IconButton
              color="secondary"
              size="small"
              disabled={role === "user"}
              style={{ display: role === "user" ? "none" : "inline-flex" }}
              onClick={() => handleClickOpen(params.row._id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No authentication token found");
      if (!hasShownToast.current) {
        toast.error("User is not authenticated");
        hasShownToast.current = true;
      }
      navigate("/home");
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/terminal/getTerminal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setDataRows(response.data.terminals);
      setRole(response.data.role);
    } catch (error) {
      console.error("Error fetching terminals:", error);
      setError(error.message); // Set the error state
      if (!hasShownToast.current) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
        hasShownToast.current = true;
      }
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRows();
  }, []);

  const handleClickOpen = (rowId) => {
    setSelectedRowId(rowId);
    console.log("selected port id", rowId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRowId(null);
  };

  const handleConfirmDelete = async (row) => {
    if (!selectedRowId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        if (!hasShownToast.current) {
          toast.error("User is not authenticated");
          hasShownToast.current = true;
        }
        navigate("/home"); // Redirect to the home page
        return []; // Exit the function and return an empty array
      }
      await axios.patch(
        `${apiUrl}/terminal/deleteTerminal/${selectedRowId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Refresh data after deletion
      fetchRows();
      toast.success("Terminal successfully deleted.");
      handleClose();
    } catch (error) {
      console.error("Error deleting terminal:", error);
      toast.error("Failed to delete terminal.");
    }
  };

  const rows =
    dataRows?.map((row, index) => ({
      id: index + 1,
      ...row,
    })) ?? [];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4">All ATM Terminals</Typography>
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
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        />
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this terminal?
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
