import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import InventoryUpload from "./InventoryUpload";
import MerchantUpload from "./MerchantUpload";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

const MASConfig = () => {
  const [value, setValue] = useState(0); // State for the active tab

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Tabs value={value} onChange={handleChange} aria-label="Config Tabs">
          <Tab label="Inventory Upload" />
          <Tab label="Merchant Upload" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <InventoryUpload />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <MerchantUpload />
      </TabPanel>
    </Box>
  );
};

export default MASConfig;
