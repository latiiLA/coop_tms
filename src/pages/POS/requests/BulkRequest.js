import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BulkRequest = () => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (sheetData.length > 0) {
          // Create columns from the first row
          const newColumns = sheetData[0].map((header, index) => ({
            field: `column_${index}`,
            headerName: header || `Column ${index + 1}`,
            flex: 1,
          }));

          // Create rows from the remaining data
          const newRows = sheetData.slice(1).map((row, rowIndex) => {
            const rowData = {};
            row.forEach((cell, cellIndex) => {
              rowData[`column_${cellIndex}`] = cell;
            });
            return { id: rowIndex + 1, ...rowData };
          });

          setColumns(newColumns);
          setRows(newRows);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }
    try {
      // Replace the URL with your server endpoint
      console.log("inside handle bulk submit", rows);
      const response = await axios.post(
        `${apiUrl}/request/bulkrequest`,
        { rows },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("Bulk request submitted successfully:", response.data);
      alert("Bulk request submitted successfully!");
    } catch (error) {
      console.error("Error submitting bulk request:", error);
      alert("Error submitting bulk request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ margin: 2 }}>
      <Box sx={{ marginBottom: 2, display: "flex", gap: 2 }}>
        <Button variant="contained" component="label">
          Upload Excel File
          <input
            type="file"
            hidden
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
          />
        </Button>
        {rows.length > 0 && (
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit Bulk Request
          </Button>
        )}
      </Box>
      <Box sx={{ width: "100%" }}>
        {columns.length > 0 && rows.length > 0 && (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
          />
        )}
      </Box>
    </Box>
  );
};

export default BulkRequest;
