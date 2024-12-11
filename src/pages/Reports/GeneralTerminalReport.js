import { Box, Typography } from "@mui/material";
import React from "react";
import TerminalSiteReport from "./TerminalSiteReport";

const GeneralTerminalReport = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        margin: 1,
      }}
    >
      <TerminalSiteReport />
    </Box>
  );
};

export default GeneralTerminalReport;
