import React from "react";
import Sidebar from "../pages/sidebar/Sidebar";
import Header from "../components/Header";
import { Box } from "@mui/material";
import { useTheme } from "@emotion/react";
import Footer from "../components/Footer";
import { useAuthContext } from "../context/AuthContext";

const Layout = ({ children }) => {
  const theme = useTheme();
  const { role } = useAuthContext();

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          width: "18vw",
          minHeight: "100vh",
        }}
      >
        {role && <Sidebar />}
      </Box>

      <Box
        sx={{
          width: "82vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          minHeight: "100vh",
        }}
      >
        {role && <Header />}

        <Box sx={{ padding: 2, flexGrow: 1 }}>{children}</Box>
        <Box sx={{ padding: 2, display: "flex", justifyContent: "center" }}>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
