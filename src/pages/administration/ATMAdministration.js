import { Box, Divider, Typography } from "@mui/material";
import React from "react";

import CreateUser from "./CreateUser";
import ViewUsers from "./ViewUsers";
import ViewFeedback from "../../components/ViewFeedback";
import ViewBugs from "../../components/ViewBugs";

import UserActivityLog from "./UserActivityLog";
import Analytics from "../dashboard/Analytics";
import AddTerminal from "./AddTerminal";
import Port from "./Port";
import ManageTerminal from "./ManageTerminal";
import ViewRelocated from "./ViewRelocated";
import ViewPort from "./ViewPort";
import ViewBranch from "../../components/ViewBranch";
import Commands from "./ViewCommands";
import CreateCommands from "./CreateCommands";

const ATMAdminitration = () => {
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
        <Typography variant="h4">Create ATM</Typography>
        <AddTerminal />
      </Box>
      <Divider />

      <Box>
        <Typography variant="h4">Manage ATM</Typography>
        <ManageTerminal />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Relocated ATM</Typography>
        <ViewRelocated />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Manage Port</Typography>
        <ViewPort />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Branch Code</Typography>
        <ViewBranch />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Explore Commands</Typography>
        <Commands />
      </Box>
      <Divider />

      <Box>
        <Typography variant="h4">Create Port</Typography>
        <Port />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Create Commands</Typography>
        <CreateCommands />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Create Branch</Typography>
        {/* <CreateBranch /> */}
      </Box>
    </Box>
  );
};

export default ATMAdminitration;
