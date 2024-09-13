import { Box } from "@mui/material";
import React from "react";

const PowerBI = () => {
  return (
    <Box>
      <iframe
        title="Power BI"
        width="100%"
        height="600"
        src="http://10.185.15.9:9502/analytics"
        frameBorder="0"
        allowFullScreen="true"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </Box>
  );
};

export default PowerBI;
