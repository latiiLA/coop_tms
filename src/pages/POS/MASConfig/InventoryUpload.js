import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const InventoryUpload = () => {
  const navigate = useNavigate();
  const [copiedData, setCopiedData] = React.useState("");
  let [rows, setRows] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]); 

  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/pos/getPOSInventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("inventory list", response.data.inventory);

      setRows(response.data.inventory);
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
      field: "serialNumber",
      headerName: "Serial Number",
      type: "String",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      type: "string",
      flex: 0.7,
    },
    {
      field: "trsm",
      headerName: "TRSM",
      type: "string",
      flex: 1,
    },
    {
      field: "terminalId",
      headerName: "Terminal Id",
      type: "string",
      flex: 0.7,
    },
    {
      field: "vendor",
      headerName: "Vendor",
      type: "string",
      flex: 0.7,
    },
    {
      field: "brand",
      headerName: "Brand",
      type: "string",
      flex: 0.5
    },
    {
      field: "networkType",
      headerName: "Network Type",
      type: "string",
      flex: 0.7,
    },
    {
      field: "entryDate",
      headerName: "Entry Date",
      type: "Date",
      flex: 0.7,
    },
    {
      field: "statusDate",
      headerName: "Status Date",
      type: "Date",
      flex: 0.7,
    },
    {
      field: "remarks",
      headerName: "Remarks",
      type: "Date",
      flex: 0.6,
    },
  ];

const exportToXLS = () => {
  // const rowsToExport = rows.filter((row) => selectedRows.includes(row.id));

    // Map the selected rows data to match the format for exporting
    const dataToExport = rows.map((row) =>
      columns.reduce((acc, column) => {
        acc[column.headerName] = row[column.field];
        return acc;
      }, {})
    );

  // Convert JSON data to a worksheet
  const ws = XLSX.utils.json_to_sheet(dataToExport);

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "DataGrid");

  // Write the workbook to a binary array (Excel 97-2003 format)
  const excelBuffer = XLSX.write(wb, { bookType: "xls", type: "array" });

  // Create a Blob from the array buffer for downloading
  const data = new Blob([excelBuffer], { type: "application/vnd.ms-excel" });

  // Trigger the download
  saveAs(data, "Inventory_Bulk_Upload.xls");
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
        <Button variant="contained" color="primary" onClick={exportToXLS} style={{ marginBottom: 10 }}>
          Export to Excel
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
          onSelectionModelChange={(newSelectionModel) => {
          setSelectedRows(newSelectionModel); // Update selectedRows state
        }}
        selectionModel={selectedRows} 
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

export default InventoryUpload;
