import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography } from "@mui/material";

const StatusPieChart = ({ data }) => {
  // Function to count statuses and include all possible statuses
  function countStatuses(terminals) {
    // Initialize counts for all possible statuses
    const statusCounts = {
      Active: 0,
      Inactive: 0,
      New: 0,
      Relocated: 0,
      Stopped: 0,
      Unknown: 0,
    };

    // Count the occurrences of each status
    terminals.forEach((terminal) => {
      const status = terminal.status?.trim() || "Unknown"; // Handle missing or empty statuses
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        statusCounts["Unknown"]++;
      }
    });

    return statusCounts;
  }

  // Count statuses from filtered data
  const statusCounts = countStatuses(data);

  // Prepare data for pie chart
  const pieData = Object.keys(statusCounts)
    .map((status, index) => ({
      id: index,
      value: statusCounts[status],
      label: status,
    }))
    .filter((dataItem) => dataItem.value > 0); // Filter out zero values

  // Reorder colors to match the order of statuses in pieData
  const colorMapping = {
    Active: "#00AEEF", // Blue for Active
    Relocated: "#FF6F00", // Orange for Relocated
    New: "#4CAF50", // Green for New
    Inactive: "#FF5722", // Dark Orange for Inactive
    Stopped: "#FF0000", // Red for Stopped
    Unknown: "#9E9E9E", // Gray for Unknown
  };

  // Prepare colors array based on pieData
  const colors = pieData.map(
    (dataItem) => colorMapping[dataItem.label] || "#9E9E9E"
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1, // Reduced gap
      }}
    >
      <Box>
        <Typography variant="body2" color="textSecondary">
          Number of Terminals per Status
        </Typography>
        <PieChart
          series={[{ data: pieData }]}
          colors={colors} // Apply reordered colors
          width={250}
          height={200}
          legend={false} // Remove the legend
        />
      </Box>
      <Box sx={{ maxWidth: 250 }}>
        <Typography variant="body2" color="textSecondary">
          This chart displays the distribution of terminal statuses. Each slice
          represents the proportion of terminals in each status category.
        </Typography>
      </Box>
    </Box>
  );
};

export default StatusPieChart;
