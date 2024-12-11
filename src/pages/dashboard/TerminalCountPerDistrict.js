import React, { useState } from "react";
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

// Function to transform and filter data
const transformData = (data, selectedType) => {
  const districtData = {};

  data.forEach(({ district, type }) => {
    if (!districtData[district]) {
      districtData[district] = {};
    }

    if (!districtData[district][type]) {
      districtData[district][type] = 0;
    }

    districtData[district][type] += 1;
  });

  const chartData = Object.keys(districtData).map((district) => {
    const entry = { district };
    let total = 0;
    Object.keys(districtData[district]).forEach((type) => {
      if (selectedType === "All" || selectedType === type) {
        entry[type] = districtData[district][type];
        total += districtData[district][type];
      }
    });
    entry["Total"] = total;
    return entry;
  });

  // Sort districts by total counts (sum of all types) from highest to lowest
  chartData.sort((a, b) => b["Total"] - a["Total"]); // Sort in descending order

  const types = selectedType === "All" ? ["CRM", "NCR"] : [selectedType];

  return { chartData, types };
};

// Tooltip Component
const CustomTooltip = ({ payload, label }) => {
  if (payload && payload.length) {
    const { district, ...typeCounts } = payload[0].payload;
    const total = payload[0].payload["Total"];

    return (
      <div className="custom-tooltip">
        <p>{`District: ${district}`}</p>
        {Object.keys(typeCounts).map(
          (type) =>
            type !== "Total" && (
              <p key={type}>{`${type}: ${typeCounts[type]}`}</p>
            )
        )}
        <p>{`Total: ${total}`}</p>
      </div>
    );
  }
  return null;
};

// Bar Chart Component
const TerminalCountPerDistrict = ({ data }) => {
  const [selectedType, setSelectedType] = useState("All");

  const { chartData, types } = transformData(data, selectedType);

  const getColorForType = (type) => {
    const colors = {
      CRM: "#00bcd4", // Cyan
      NCR: "#ff9800", // Orange
    };
    return colors[type] || "#8884d8"; // Default color if type is not CRM or NCR
  };

  const formatDistrictName = (name) => {
    const nameMap = {
      "Central Finfine": "C. Finfine",
      "South Finfine": "S. Finfine",
      "North Finfine": "N. Finfine",
      "West Finfine": "W. Finfine",
      "East Finfine": "E. Finfine",
      // Add more mappings as needed
    };
    return nameMap[name] || name;
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
          sx={{ width: "48%" }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="CRM">CRM</MenuItem>
          <MenuItem value="NCR">NCR</MenuItem>
        </Select>
      </FormControl>

      <ResponsiveContainer>
        <BarChart data={chartData} stackOffset="sign">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="district"
            tickFormatter={formatDistrictName} // Format district names
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {types.map((type) => (
            <Bar
              key={type}
              dataKey={type}
              stackId="a"
              fill={getColorForType(type)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TerminalCountPerDistrict;
