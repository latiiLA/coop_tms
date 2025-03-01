import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const MerchantUpload = () => {
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
      const response = await axios.get(`${apiUrl}/pos/getPOSMerchant`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("terminal per merchant list", response.data.result);

      setRows(
        response.data.result.map((row, index) => ({
          id: index + 1,
          ...row,
        }))
      );
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

  const columns = [
    {
      field: "MERCHANT_NAME",
      headerName: "MERCHANT_NAME",
      type: "string",
      flex: 1,
    },
    {
      field: "RETAILER_NUMBER",
      headerName: "RETAILER_NUMBER",
      type: "string",
      flex: 0.8,
    },
    {
      field: "MCC",
      headerName: "MCC",
      type: "string",
      flex: 0.5,
    },
    {
      field: "BRANCH",
      headerName: "BRANCH",
      type: "string",
      flex: 1,
    },
    {
      field: "ACCOUNT_DEBIT",
      headerName: "ACCOUNT_DEBIT",
      type: "string",
      flex: 0.8,
    },
    {
      field: "ADDRESS1",
      headerName: "ADDRESS1",
      type: "string",
      flex: 0.8,
    },
    {
      field: "PHONE1",
      headerName: "PHONE1",
      type: "string",
      flex: 0.7,
    },
  ];

  const exportToXLS = () => {
    if (rows.length === 0) {
      toast.error("No data available to export!");
      return;
    }

    let allFields = Object.keys(rows[0]); // Get all available fields
    allFields = allFields.slice(1);

    // Convert full dataset to exportable format
    const dataToExport = rows.map((row) =>
      allFields.reduce((acc, field) => {
        acc[field] = row[field] || "";
        return acc;
      }, {})
    );

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Merchant Data");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.ms-excel" });

    saveAs(data, "Merchant_Bulk_Upload.xlsx");
  };

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
        <Button
          variant="contained"
          color="primary"
          onClick={exportToXLS}
          style={{ marginBottom: 10 }}
        >
          Export Merchant Config
        </Button>
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

export default MerchantUpload;
