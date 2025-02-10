import { Box, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import POSMerchantGuide from "./POSMerchantGuide";
import POSBranchGuide from "./POSBranchGuide";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{
        flexGrow: 1,
        display: value === index ? "flex" : "none",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

const AllPOSUserManual = () => {
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Tabs Container */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 5 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="User Manual Tabs"
        >
          <Tab label="POS Merchant Guide" />
          <Tab label="POS Branch Guide" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <TabPanel value={value} index={0}>
          <POSMerchantGuide />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <POSBranchGuide />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default AllPOSUserManual;
