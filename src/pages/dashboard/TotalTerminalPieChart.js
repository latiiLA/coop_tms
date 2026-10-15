import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography } from "@mui/material";
import React from "react";

function countTerminalTypes(data) {
  let ncrCount = 0;
  let crmCount = 0;
  let crm2Count = 0;

  data.forEach((item) => {
    if (item.type === "NCR") {
      ncrCount++;
    }
    if (item.type === "CRM") {
      crmCount++;
    }
    if (item.type === "CRM2") {
      crm2Count++;
    }
  });

  return { ncrCount, crmCount, crm2Count };
}

const TotalTerminalPieChart = ({ data }) => {
  const counts = countTerminalTypes(data);
  const pieData = [
    { id: 0, value: counts.ncrCount, label: "NCR" },
    { id: 1, value: counts.crmCount, label: "CRM" },
    { id: 2, value: counts.crm2Count, label: "CRM2" },
  ].filter((d) => d.value > 0);

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginTop: 5 }}>
      <Box>
        <Typography>Total Active Terminals</Typography>
        <PieChart
          colors={["#FF6F00", "#00AEEF", "#7E57C2"]}
          series={[
            {
              data: pieData,
            },
          ]}
          width={250}
          height={200}
        />
      </Box>
      <Box sx={{ maxWidth: 250 }}>
        <Typography variant="body2" color="textSecondary">
          The chart displays the count of NCR, CRM, and CRM2 terminals. Each
          slice represents the proportion of terminals of each type, providing a
          quick overview of the terminal distribution.
        </Typography>
      </Box>
    </Box>
  );
};

export default TotalTerminalPieChart;
