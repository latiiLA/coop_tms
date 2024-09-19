import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Utility function to mask PAN
const maskPAN = (pan) => {
  if (!pan) return "";
  pan = pan.trim();
  const length = pan.length;
  if (length <= 9) return pan; // Return unchanged if PAN is too short
  const firstFive = pan.slice(0, 5);
  const lastFour = pan.slice(-4);
  const maskedPart = "*".repeat(length - 9); // Mask the middle part
  return `${firstFive}${maskedPart}${lastFour}`;
};

const ViewTransaction = () => {
  const navigate = useNavigate();
  const { role } = useAuthContext();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const { terminalId, startDate, endDate } = location.state || {};

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/switch/getTransaction`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
        params: { terminalId, startDate, endDate },
      });

      // Check if the response data is an array
      if (Array.isArray(response.data)) {
        const transactions = response.data.map((row, index) => ({
          id: index + 1, // Unique identifier for DataGrid
          termId: row[0] || "",
          pan: maskPAN(row[1]) || "",
          trandate: new Date(row[2]).toLocaleDateString() || "",
          txn_start_time: row[3] ? new Date(row[3]).toLocaleString() : "", // Format date and time
          txn_end_time: row[4] ? new Date(row[4]).toLocaleString() : "", // Format date and time
          trace: row[5] || "", // Assuming index 5 for trace number
          amount: row[6] || "",
          respcode: row[7] || "", // Assuming index 6 for response code
        }));

        setDataRows(transactions);
      } else {
        console.error("Unexpected response structure:", response.data);
        toast.error("Unexpected data format received from the server.");
      }
    } catch (error) {
      setError(error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (terminalId && startDate && endDate) {
      fetchRows();
    }
  }, [terminalId, startDate, endDate]);

  const columns = [
    { field: "termId", headerName: "Terminal ID", flex: 1 },
    {
      field: "pan",
      headerName: "Masked PAN",
      flex: 1,
    },
    {
      field: "trandate",
      headerName: "Transaction Date",
      flex: 1,
    },
    {
      field: "txn_start_time",
      headerName: "Txn Start Time",
      flex: 1,
    },
    {
      field: "txn_end_time",
      headerName: "Txn End Time",
      flex: 1,
    },
    {
      field: "trace",
      headerName: "Trace NO",
      flex: 1,
    },
    { field: "amount", headerName: "Amount", flex: 1 },
    // {
    //   field: "respcode",
    //   headerName: "Response Code",
    //   flex: 1,
    // },
  ];

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
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />} // Add back arrow icon
          sx={{
            backgroundColor: "#0693e3", // Custom color
            ":hover": {
              backgroundColor: "#045c9f", // Hover effect
            },
            padding: "0.5rem 1.5rem", // Add padding for a balanced look
            fontWeight: "bold", // Bold text
          }}
          onClick={() => {
            navigate("/transaction");
          }}
        >
          Back
        </Button>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: "#0693e3",
            fontWeight: "bold",
            letterSpacing: "0.05rem",
            height: "100%",
            margin: "auto",
          }}
        >
          Transaction Processed by Terminal{" "}
          <span style={{ color: "#ff5722" }}>{terminalId}</span> from{" "}
          <span style={{ color: "#4caf50" }}>{startDate}</span> to{" "}
          <span style={{ color: "#4caf50" }}>{endDate}</span>
        </Typography>
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
            fontSize: 13,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#0693e3",
            color: "#fff",
          },
        }}
      >
        <DataGrid
          rows={dataRows}
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
        />
      </Box>
    </Box>
  );
};

export default ViewTransaction;
