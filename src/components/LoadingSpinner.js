import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { AppProvider } from "@toolpad/core/AppProvider";
const LoadingSpinner = () => {
  return (
    <AppProvider>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    </AppProvider>
  );
};

export default LoadingSpinner;
