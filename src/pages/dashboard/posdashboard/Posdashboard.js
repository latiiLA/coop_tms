import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const Posdashboard = () => {
  const [selectedType, setSelectedType] = useState("Daily");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchData = async (reportType = "Daily") => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home"); // Redirect to the home page
      return;
    }

    let searchedReport = "getDailyReport";
    if (reportType === "Weekly") {
      searchedReport = "getWeeklyReport";
    } else if (reportType === "Monthly") {
      searchedReport = "getMonthlyReport";
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiUrl}/pos/${searchedReport}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setChartData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedType);
  }, [selectedType]); // Dependency array to prevent infinite requests

  const handleChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleReportExport = (reportData, reportType) => {
    if (!reportData || reportData.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Determine the label for the "Key" column
    let keyLabel = "Grouping";
    if (reportType === "Daily") keyLabel = "Date";
    else if (reportType === "Weekly") keyLabel = "Week";
    else if (reportType === "Monthly") keyLabel = "Month";

    // Prepare data for Excel
    const dataForExport = [
      [`${reportType} Report`], // Title row
      [keyLabel, "Total POS Terminals"], // Header row
      ...reportData.map((item) => [item.key, item.Total_POS_Terminals_Created]), // Data rows
    ];

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(dataForExport);

    // Define column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Column A: Key column width
      { wch: 20 }, // Column B: Total POS Terminals column width
    ];

    // Apply styles
    const headerStyle = {
      font: { bold: true },
      border: {
        top: { style: "thick", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    const borderStyle = {
      border: {
        top: { style: "thin", color: { rgb: "#ffffff" } },
        bottom: { style: "thin", color: { rgb: "#000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } },
      },
    };

    // Iterate through cells and apply styles
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;

        // Apply header style for header row
        if (R === 1) {
          worksheet[cellAddress].s = headerStyle;
        } else {
          // Apply border style for other rows
          worksheet[cellAddress].s = borderStyle;
        }
      }
    }

    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Export the workbook
    const excelBlob = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Use FileSaver.js to trigger the download
    const fileBlob = new Blob([excelBlob], {
      type: "application/octet-stream",
    });
    saveAs(fileBlob, `${reportType}_Report.xlsx`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "inherit",
        margin: 2,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="terminal-type-select-label">Report Type</InputLabel>
          <Select
            labelId="terminal-type-select-label"
            id="terminal-type-select"
            value={selectedType}
            label="Report Type"
            onChange={handleChange}
            sx={{ width: "48%" }}
          >
            <MenuItem value="Daily">Daily</MenuItem>
            <MenuItem value="Weekly">Weekly</MenuItem>
            <MenuItem value="Monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => handleReportExport(chartData, selectedType)}
        >
          Export Dashboard Report
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              angle={-30}
              dataKey="key"
              tickFormatter={chartData.Total_POS_Terminals_Created}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Total_POS_Terminals_Created" fill="#00bcd4">
              <LabelList
                dataKey="Total_POS_Terminals_Created"
                position="top" // Position above the bar
                style={{ fontSize: 25, fontWeight: "Bold", fill: "#ff9800" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Typography>No data available</Typography>
      )}
    </Box>
  );
};

export default Posdashboard;
