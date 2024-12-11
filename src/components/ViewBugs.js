import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const ViewBugs = () => {
  const navigate = useNavigate();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRows = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/feedback/getBugs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      //   console.log(response.data.bug);
      setBugs(response.data.bug || []);
    } catch (error) {
      //   console.error("Error fetching branches:", error);
      setError(error.response?.data?.message || error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRows();
  }, []);
  const columns = [
    { field: "id", headerName: "No", type: "number", width: 10 },
    {
      field: "bugDescription",
      headerName: "Bug",
      type: "string",
      flex: 0.7,
    },
    {
      field: "steps",
      headerName: "Steps to Recreate",
      type: "string",
      flex: 1,
    },
    {
      field: "expectedBehaviour",
      headerName: "Expected Behaviour",
      type: "string",
      flex: 1,
    },
    {
      field: "createdBy",
      headerName: "Feedback Sender",
      type: "string",
      flex: 0.5,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.3,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            margin: "auto",
            alignItems: "center",
          }}
        ></Box>
      ),
    },
  ];
  const index = 0;
  const rows = bugs.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

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
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#0693e3",
            color: "#fff",
          },
          "& .MuiDataGrid-root": {
            overflow: "hidden",
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowY: "hidden !important", // Hides the vertical scrollbar
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            display: "none", // Hides the scrollbar for WebKit browsers
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
            display: "none",
          },
          margin: 1,
        }}
      >
        <DataGrid
          slots={{ toolbar: GridToolbar }}
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default ViewBugs;
