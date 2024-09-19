import { Box, Button, Typography, Paper, useTheme } from "@mui/material";
import React from "react";

const Links = () => {
  const theme = useTheme(); // Access the theme for dynamic styling
  const isDarkMode = theme.palette.mode === "dark"; // Check if the current theme is dark mode

  return (
    <Paper
      elevation={3}
      sx={{
        padding: "2rem",
        maxWidth: "600px",
        margin: "auto",
        borderRadius: "8px",
        backgroundColor: theme.palette.background.paper, // Dynamic background color based on theme
        textAlign: "center",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: theme.palette.primary.main, // Dynamic text color from the theme
          fontWeight: "bold",
          marginBottom: "2rem",
        }}
      >
        Internal Links
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            backgroundColor: theme.palette.background.default, // Dynamic background color based on theme
            borderRadius: "8px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "500",
              color: theme.palette.text.primary, // Dynamic text color
            }}
          >
            Power BI
          </Typography>
          <Button
            variant="contained"
            href="http://10.185.15.9:9502/analytics"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: theme.palette.primary.main, // Button color from the theme
              ":hover": { backgroundColor: theme.palette.primary.dark }, // Darker shade on hover
              width: "15rem",
            }}
          >
            Power BI Dashboard
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            backgroundColor: theme.palette.background.default,
            borderRadius: "8px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "500",
              color: theme.palette.text.primary, // Dynamic text color
            }}
          >
            IST GUI
          </Typography>
          <Button
            variant="contained"
            href="http://10.185.11.11:8001/IST-CBOSwitch/login.jsp"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              backgroundColor: theme.palette.primary.main,
              ":hover": { backgroundColor: theme.palette.primary.dark },
              width: "15rem",
            }}
          >
            IST Switch GUI
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Links;
