import { Box, Typography } from "@mui/material";
import React from "react";
import Sidebar from "./sidebar/Sidebar";
import Rightside from "./rightside/Rightside";

const Home = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        // background: "red",
      }}
    >
      <Typography variant="h4"> Welcome</Typography>
    </Box>
  );
};

export default Home;
