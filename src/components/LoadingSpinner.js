import React from "react";
import { Box, CircularProgress, ThemeProvider } from "@mui/material";
import demoTheme from "../DarkMode/customTheme";
const LoadingSpinner = () => {
  return (
    <ThemeProvider theme={demoTheme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    </ThemeProvider>
  );
};

export default LoadingSpinner;
