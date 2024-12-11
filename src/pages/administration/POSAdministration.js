import { Box, Divider, Typography } from "@mui/material";
import React from "react";

import CreateUser from "./CreateUser";
import ViewUsers from "./ViewUsers";
import ViewFeedback from "../../components/ViewFeedback";
import ViewBugs from "../../components/ViewBugs";

import UserActivityLog from "./UserActivityLog";
import Analytics from "../dashboard/Analytics";
import AddPOS from "../POS/AddPOS";
import ManagePOS from "../POS/ManagePOS";
import RelocatedPOS from "../POS/RelocatedPOS";
import ViewPOSRequests from "../POS/ViewPOSRequests";

const POSAdministration = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        padding: 2,
      }}
    >
      <Box>
        <Typography variant="h4">Create POS</Typography>
        <AddPOS />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Manage POS</Typography>
        <ManagePOS />
      </Box>
      <Divider />

      <Box>
        <Typography variant="h4">Relocated POS</Typography>
        <RelocatedPOS />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">POS Requests</Typography>
        <ViewPOSRequests />
      </Box>
      <Divider />
    </Box>
  );
};

export default POSAdministration;
