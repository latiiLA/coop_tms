import { Box, Typography } from "@mui/material";
import React from "react";
import Sidebar from "../sidebar/Sidebar";
import Header from "../../components/Header";

const Dashboard = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: "inherit",
      }}
    >
      <Typography variant="h4">Dashboard</Typography>
      {/* <Box>
        <Port />
      </Box> */}
    </Box>
  );
};

export default Dashboard;
