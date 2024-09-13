import { Box } from "@mui/material";
import React from "react";

const PowerBI = () => {
  return (
    <Box>
      <iframe
        title="Power BI"
        width="100%"
        height="600"
        src="http://10.185.15.9:9502/analytics/saw.dll?bieehome"
        frameborder="0"
        allowFullScreen="true"
      ></iframe>
    </Box>
  );
};

export default PowerBI;
