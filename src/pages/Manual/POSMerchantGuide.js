import { Box } from "@mui/material";
import React from "react";

const POSMerchantGuide = () => {
  // Replace with the modified Google Drive preview URL
  const pdfUrl = `https://drive.google.com/file/d/1IAWF5DnLQ5v-hzzW27C_Kb4d6Cdiy07j/preview`;

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
        title="Merchant POS User Guide"
        src={pdfUrl}
        frameBorder="0"
        height="100%"
        width="100%"
      ></iframe>
    </Box>
  );
};

export default POSMerchantGuide;
