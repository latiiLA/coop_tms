import React from "react";
import Lottie from "lottie-react";
import TMSAnimation from "./tms-animation.json"; // Replace with your Lottie JSON file

const AnimatedHomePage = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Welcome to Terminal Management System</h1>
      <Lottie
        animationData={TMSAnimation}
        style={{ width: 300, height: 300 }}
      />
      <p>Connecting Terminals with Banks Seamlessly</p>
    </div>
  );
};

export default AnimatedHomePage;
