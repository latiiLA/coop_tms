import { Box } from "@mui/material";
import React from "react";
import ViewATM from "./ViewATM";

const ManageAtm = ({ role }) => {
  return (
    <Box>
      <ViewATM role="admin" />
    </Box>
  );
};

export default ManageAtm;
