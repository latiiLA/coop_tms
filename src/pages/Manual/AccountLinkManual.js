import { Box } from "@mui/material";
import React from "react";

const AccountLinkManual = () => {
  // Replace with the modified Google Drive preview URL
  const pdfUrl = `https://docs.google.com/document/d/1WsOkMMuY4UHkzQHxIpMXP_sLcI0jAAGeRdSjSpxEBQk/preview`;

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
        title="Terminal Creation Manual"
        src={pdfUrl}
        frameBorder="0"
        height="100%"
        width="100%"
      ></iframe>
    </Box>
  );
};

export default AccountLinkManual;
