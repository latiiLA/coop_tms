import React, { useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as yup from "yup";
import LoadingButton from "@mui/lab/LoadingButton";
import { CloudUpload, Download } from "@mui/icons-material";
import fileUrl from "../../../assets/POS_Request_Template.xlsx";

const BulkRequest = () => {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const phoneRegExp = /^[0-9]{9}$/;

  // Define the Yup validation schema for each row
  const rowSchema = yup.object().shape({
    column_1: yup.string().required("POS District is required"),
    column_2: yup.string().required("POS Branch Name is required"),
    column_3: yup.string().required("Merchant Name is required"),
    column_4: yup
      .string()
      .required("POS Type/Site(Merchant or Branch) is required")
      .test(
        "is-merchant-or-branch",
        "POS Type Must be either 'Merchant' or 'Branch' (case-insensitive)",
        (value) =>
          value && ["merchant", "branch"].includes(value.trim().toLowerCase())
      ),
    column_5: yup
      .string()
      .required("POS CBS Account is required")
      .min(13, "The CBS account should be exactly 13 characters.")
      .max(13, "The CBS account should be exactly 13 characters."),
    column_6: yup.string().required("Contact Name is required"),
    column_7: yup
      .string()
      .required("Merchant Phone Number is required")
      .matches(phoneRegExp, "Phone number must be 9 digits"),
    column_8: yup.string().required("Merchant Address is required"),
    column_9: yup
      .string()
      .required("Serial number is required.")
      .min(16, "Serial number must at least 16 character.")
      .max(16, "Serial number must at least 16 character."),
    column_10: yup
      .string()
      .required("Service number is required")
      .matches(phoneRegExp, "Phone number must be 10 digits"),
    column_11: yup
      .string()
      .required("IP Address is required")
      .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP Address format")
      .test("is-valid-ip", "Invalid IP Address", (value) => {
        const parts = value.split(".");
        if (parts.length !== 4) return false;
        return parts.every((part) => {
          const num = parseInt(part, 10);
          return !isNaN(num) && num >= 0 && num <= 255;
        });
      }),
  });

  const handleFileChange = (event) => {
    console.log("File selected: ", event.target.files[0]); // Log the selected file
    setSelectedFile(event.target.files[0]);
    handleFileUpload(event);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (e) => {
    console.log("Handle upload is called");
    const file = e.target.files[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log("Sheet data: ", sheetData); // Log the sheet data

        if (sheetData.length > 0) {
          const newColumns = sheetData[0].map((header, index) => ({
            field: `column_${index}`,
            headerName: header || `Column ${index + 1}`,
            flex: 1,
          }));

          const newRows = [];
          for (let rowIndex = 1; rowIndex < sheetData.length; rowIndex++) {
            const row = sheetData[rowIndex];
            const rowData = {};
            row.forEach((cell, cellIndex) => {
              rowData[`column_${cellIndex}`] = cell;
            });

            try {
              await rowSchema.validate(rowData, { abortEarly: false });
              newRows.push({
                id: rowIndex + 1,
                ...rowData,
                uploadedFile: null,
              });
            } catch (err) {
              setRows([]);
              setColumns([]);
              toast.error(
                `Row ${rowIndex + 1} validation errors: ${err.errors.join(", ")}`
              );
              return;
            }
          }

          // Update state with valid rows and columns
          setRows(newRows);
          setColumns(newColumns);
        }
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Please upload a valid Excel file.");
    }
  };

  const handleSubmit = async () => {
    console.log("Submit called, sending request..."); // Log the submit trigger
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }

    try {
      console.log("Sending rows to backend:", rows); // Log the data being sent
      const response = await axios.post(
        `${apiUrl}/request/bulkrequest`,
        { rows },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("The request has been successfully updated.");
      navigate("/posdetail", {
        state: {
          isRequest: false,
          relocated: false,
          rows,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setRows([]);
    setColumns([]);
    setSelectedFile(null);
    fileInputRef.current.value = null;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "POS_Request_Template";
    link.click();
  };

  return (
    <Box sx={{ margin: 2, gap: 2 }}>
      <Box sx={{ marginBottom: 2, display: "flex", gap: 2 }}>
        <Typography variant="h5">Bulk Request</Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
        >
          {selectedFile ? "Change Request File" : "Upload Request File"}
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            key={selectedFile ? selectedFile.name : "new"}
          />
        </Button>
        {selectedFile && (
          <Typography variant="body2" sx={{ marginY: "auto" }}>
            {selectedFile.name}
          </Typography>
        )}
        {rows.length > 0 && (
          <>
            <LoadingButton
              loading={loading}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit Bulk Request
            </LoadingButton>
            <Button variant="contained" onClick={handleCancelRequest}>
              Cancel Request
            </Button>
          </>
        )}
        <Button
          startIcon={<Download />}
          variant="contained"
          onClick={handleDownload}
        >
          Request Template
        </Button>
      </Box>
      <Box sx={{ width: "100%" }}>
        {columns.length > 0 && rows.length > 0 && (
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection={false}
            autoHeight
          />
        )}
      </Box>
    </Box>
  );
};

export default BulkRequest;
