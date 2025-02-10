import { Alert, AlertTitle, Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";

const POSPerBranch = () => {
  const navigate = useNavigate();
  const [copiedData, setCopiedData] = React.useState("");
  let [rows, setRows] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(0);

  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/pos/getPOSCountPerBranch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("terminal per district list", response.data.result);

      setRows(response.data.result);
    } catch (error) {
      // console.error("Error fetching terminals:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  rows =
    rows?.map((row, index) => ({
      id: index + 1,
      ...row,
    })) ?? [];

  const columns = [
    {
      field: "branchName",
      headerName: "Branch Name",
      type: "string",
      flex: 1,
    },
    {
      field: "count",
      headerName: "Total No. of POS",
      type: "string",
      flex: 1,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <Box>
      <Box
        sx={{
          width: "auto",
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-root": {
            overflow: "hidden",
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowY: "hidden !important",
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            display: "none",
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
            display: "none",
          },
          marginX: 1,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          checkboxSelection
          onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
        />
        <Alert severity="info" sx={{ width: "100%", mt: 1 }}>
          <AlertTitle>Copied data:</AlertTitle>
          <code
            style={{
              display: "block",
              maxHeight: 200,
              overflow: "auto",
              whiteSpace: "pre-line",
            }}
          >
            {copiedData}
          </code>
        </Alert>
      </Box>
    </Box>
  );
};

export default POSPerBranch;
