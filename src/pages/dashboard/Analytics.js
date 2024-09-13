import { Box } from "@mui/material";
import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import LoadingSpinner from "../../components/LoadingSpinner";

const Analytics = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  // Conditionally render iframes based on theme mode
  const iframeSrc =
    theme.palette.mode === "light"
      ? "https://lookerstudio.google.com/embed/reporting/a6988f20-99c8-4bd3-a946-66877d8657e8/page/kIV1C"
      : "https://lookerstudio.google.com/embed/reporting/cbe3d0d2-5ed7-47b7-8043-c72264baa115/page/kIV1C";

  return (
    <Box>
      {loading && <LoadingSpinner />}
      <iframe
        title="Coop TMS Analytics"
        width="100%"
        height="620"
        src={iframeSrc}
        style={{ border: 0 }}
        allowFullScreen
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
        loading="lazy"
      />
    </Box>
  );
};

export default Analytics;
