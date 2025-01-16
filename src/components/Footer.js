import { Box, Typography } from "@mui/material";
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Box>
      <Typography fontSize={10}>
        {" "}
        &copy; {currentYear} Cooperative Bank of Oromia. All Rights Reserved |
        Designed, Built and Maintained by{" "}
        <a
          href="https://www.linkedin.com/in/latiiLA/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          Lata Amenu
        </a>
      </Typography>
    </Box>
  );
};

export default Footer;
