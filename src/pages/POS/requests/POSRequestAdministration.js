import { Box, Divider, Typography } from "@mui/material";
import React from "react";

import ViewPOSRequests from "../ViewPOSRequests";
import RequestPOS from "./RequestPOS";
import RelocatedRequest from "./RelocateRequest";
import RequestStatus from "./RequestStatus";
import ManagePOS from "../ManagePOS";
import RelocatedPOS from "../RelocatedPOS";

const POSRequestAdministration = () => {
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
        <Typography variant="h4">Request POS</Typography>
        <RequestPOS />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Explore POS</Typography>
        <ManagePOS />
      </Box>
      <Divider />

      <Box>
        <Typography variant="h4">Relocate POS</Typography>
        <RelocatedRequest />
      </Box>
      <Divider />
      <Box>
        <Typography variant="h4">Request Status</Typography>
        <RequestStatus />
      </Box>
      <Divider />
    </Box>
  );
};

export default POSRequestAdministration;
