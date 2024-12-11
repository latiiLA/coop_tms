import { Margin } from "@mui/icons-material";
import { Box } from "@mui/material";
import React from "react";

const POSBranchGuide = () => {
  // Replace with the modified Google Drive preview URL
  const pdfUrl = `https://drive.google.com/file/d/1P5-38V9HDj1zY3Wagjyai3fS031glUGF/preview`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        marginY: 1,
        marginX: "auto",
        height: "100%",
        width: "70%",
        border: 1,
      }}
    >
      <iframe
        title="Branch POS User Guide"
        src={pdfUrl}
        frameBorder="0"
        height="100%"
        width="100%"
      ></iframe>
    </Box>
  );
};

export default POSBranchGuide;
