import React from "react";
import { Box, CircularProgress, ThemeProvider } from "@mui/material";
import demoTheme from "../DarkMode/customTheme";
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
