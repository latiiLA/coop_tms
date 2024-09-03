import { Box, Typography } from "@mui/material";
import React from "react";
import ViewTerminalGridComponent from "../../components/ViewTerminalGridComponent";

const ViewRelocatedNCR = ({ rows }) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Relocated/Stopped CRM Terminals
      </Typography>
      <ViewTerminalGridComponent rows={rows} />
    </Box>
  );
};

export default ViewRelocatedNCR;
