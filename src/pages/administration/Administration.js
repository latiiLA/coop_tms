import { Box, Divider, Typography } from "@mui/material";
import React from "react";

import CreateUser from "./CreateUser";
import ViewUsers from "./ViewUsers";
import ViewFeedback from "../../components/ViewFeedback";
import ViewBugs from "../../components/ViewBugs";

import UserActivityLog from "./UserActivityLog";
import Analytics from "../dashboard/Analytics";

const Administration = () => {
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
        <Typography variant="h4">Create User</Typography>
        <CreateUser />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Manage Users</Typography>
        <ViewUsers />
      </Box>
      <Divider />

      <Box>
        <Typography variant="h4">Analytics</Typography>
        <Analytics />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Activity Log</Typography>
        <UserActivityLog />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Explore Feedback</Typography>
        <ViewFeedback />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Explore Bug</Typography>
        <ViewBugs />
      </Box>
    </Box>
  );
};

export default Administration;
