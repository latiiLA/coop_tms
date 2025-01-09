import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { toast } from "react-hot-toast";

const TerminalCountPerDistrict = () => {
  const [selectedType, setSelectedType] = useState("All");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch data from backend
  const fetchData = async (terminalType) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Redirecting to home...");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/terminal/getTerminalDataPerDistrict`,
        {
          params: { terminalType },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const transformedData = response.data.data.map((item) => ({
        district: item.districtName,
        mnemonic: item.mnemonic,
        CRM: item.CRM || 0,
        NCR: item.NCR || 0,
        Total: (item.CRM || 0) + (item.NCR + 0),
      }));
      setChartData(transformedData);
      console.log("Response:", response);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedType);
  }, [selectedType]);

  // Colors for types
  const getColorForType = (type) => {
    const colors = {
      CRM: "#00bcd4", // Cyan
      NCR: "#ff9800", // Orange
    };
    return colors[type] || "#8884d8"; // Default color
  };

  return (
    <Box sx={{ width: "100%", height: 350, margin: "auto", paddingBottom: 2 }}>
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel id="terminal-type-select-label">Terminal Type</InputLabel>
        <Select
          labelId="terminal-type-select-label"
          id="terminal-type-select"
          value={selectedType}
          label="Terminal Type"
          onChange={(e) => setSelectedType(e.target.value)}
          sx={{ width: "43%" }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="CRM">CRM</MenuItem>
          <MenuItem value="NCR">NCR</MenuItem>
        </Select>
      </FormControl>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mnemonic" />
          <YAxis />
          <Tooltip />
          <Legend />
          {["CRM", "NCR"].map((type) => (
            <Bar key={type} dataKey={type} fill={getColorForType(type)} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TerminalCountPerDistrict;
