import React from "react";
import Lottie from "lottie-react";
import TMSAnimation from "../assets/animatewelcome.lottie"; // Replace with your Lottie JSON file
import { useTheme } from "@mui/material";

const AnimatedHomePage = () => {
  const theme = useTheme();
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Welcome to Terminal Management System</h1>
      <Lottie
        animationData={TMSAnimation}
        style={{ width: 300, height: 300 }}
        sx={{ backgroundColor: theme.palette.background.default }}
      />
      <p>Connecting Terminals with Banks Seamlessly</p>
    </div>
  );
};

export default AnimatedHomePage;
