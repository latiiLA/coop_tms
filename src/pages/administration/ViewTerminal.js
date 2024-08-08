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
  Divider,
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
import ViewTerminalGridComponent from "../../components/ViewTerminalGridComponent";

export default function ViewTerminal() {
  const navigate = useNavigate();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("user");
  const [open, setOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const hasShownToast = useRef(false);
  const apiUrl = process.env.REACT_APP_API_URL;

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
        return; // Exit the function without making further requests
      }

      // Send delete request
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

      // Refresh data and show success message
      fetchRows();
      toast.success("Terminal successfully deleted.");
      handleClose(); // Close any open dialogs or modals
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

  const crmRows = "CRM" ? rows.filter((row) => row.type === "CRM") : rows;
  const ncrRows = "ATM" ? rows.filter((row) => row.type === "NCR") : rows;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "Column",
        gap: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        All Terminals
      </Typography>
      <ViewTerminalGridComponent rows={rows} />
      {/* <Divider /> */}
      <Typography variant="h4" gutterBottom>
        CRM Terminals
      </Typography>
      <ViewTerminalGridComponent rows={crmRows} />
      {/* <Divider /> */}
      <Typography variant="h4" gutterBottom>
        NCR Terminals
      </Typography>
      <ViewTerminalGridComponent rows={ncrRows} />
    </Box>
  );
}
