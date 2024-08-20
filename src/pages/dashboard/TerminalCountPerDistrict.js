import React from "react";
import { Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Function to transform and filter data
const transformData = (data) => {
  const districtData = {};
  const totalCounts = {};

  data.forEach(({ district, type }) => {
    if (!districtData[district]) {
      districtData[district] = {};
      totalCounts[district] = 0;
    }

    if (!districtData[district][type]) {
      districtData[district][type] = 0;
    }

    districtData[district][type] += 1;
    totalCounts[district] += 1;
  });

  const chartData = Object.keys(districtData).map((district) => {
    const entry = { district };
    Object.keys(districtData[district]).forEach((type) => {
      entry[type] = districtData[district][type];
    });
    entry["Total"] = totalCounts[district];
    return entry;
  });

  const types = [...new Set(data.map((item) => item.type)), "Total"];

  return { chartData, types };
};

// Line Chart Component
const TerminalCountPerDistrict = ({ data }) => {
  const { chartData, types } = transformData(data);

  const getColorForType = (type) => {
    const colors = {
      NCR: "#8884d8",
      CRM: "#82ca9d",
      "Type 1": "#ff7300",
      "Type 2": "#ffc658",
      "Type 3": "#d84c8e",
      Total: "#ff7300",
    };
    return colors[type] || "#000";
  };

  return (
    <Box sx={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="district" />
          <YAxis />
          <Tooltip />
          <Legend />
          {types.map((type) => (
            <Line
              key={type}
              type="monotone"
              dataKey={type}
              stroke={getColorForType(type)}
              dot={false} // Hide dots for better line visibility
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TerminalCountPerDistrict;
