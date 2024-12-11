import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography } from "@mui/material";
import React from "react";

function countTerminalTypes(data) {
  let ncrCount = 0;
  let crmCount = 0;

  data.forEach((item) => {
    if (item.type === "NCR") {
      ncrCount++;
    }
    if (item.type === "CRM") {
      crmCount++;
    }
  });

  return { ncrCount, crmCount };
}

const TotalTerminalPieChart = ({ data }) => {
  const counts = countTerminalTypes(data);

  return (
    <Box sx={{ display: "flex", alignItems: "center", marginTop: 5 }}>
      <Box>
        <Typography>Total Active Terminals</Typography>
        <PieChart
          colors={["#FF6F00", "#00AEEF"]}
          series={[
            {
              data: [
                { id: 0, value: counts.ncrCount, label: "NCR" },
                { id: 1, value: counts.crmCount, label: "CRM" },
              ],
            },
          ]}
          width={250}
          height={200}
          // legend={{
          //   position: "right",
          //   itemStyle: { color: "#333" },
          // }}
        />
      </Box>
      <Box sx={{ maxWidth: 250 }}>
        <Typography variant="body2" color="textSecondary">
          The chart displays the count of NCR and CRM terminals. Each slice
          represents the proportion of terminals of each type, providing a quick
          overview of the terminal distribution.
        </Typography>
      </Box>
    </Box>
  );
};

export default TotalTerminalPieChart;
