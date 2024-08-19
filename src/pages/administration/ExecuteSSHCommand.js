import React, { useState } from "react";
import axios from "axios";

const ExecuteSSHCommand = () => {
  const [output, setOutput] = useState("");

  const handleExecuteCommand = async () => {
    try {
      const token = localStorage.getItem("token"); // If your API requires authentication
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/executecommand/load`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token if needed
          },
        }
      );

      // Display the command output
      setOutput(response.data.output);
    } catch (error) {
      console.error("Error executing command:", error);
      setOutput("Failed to execute command");
    }
  };

  return (
    <div>
      <h2>Execute Command</h2>
      <button onClick={handleExecuteCommand}>Execute</button>
      <pre>{output}</pre>
    </div>
  );
};

export default ExecuteSSHCommand;
