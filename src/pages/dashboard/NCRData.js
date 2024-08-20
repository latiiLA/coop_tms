import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import StatusPieChart from "./StatusPieChart"; // Ensure correct import path
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NCRData = () => {
  const [terminals, setTerminals] = useState([]);
  const [filteredTerminals, setFilteredTerminals] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const navigate = useNavigate();
  const hasShownToast = useRef(false);

  useEffect(() => {
    async function fetchTerminals() {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        if (!hasShownToast.current) {
          toast.error("User is not authenticated");
          hasShownToast.current = true; // Mark that the toast has been shown
        }
        navigate("/home"); // Redirect to the home page
        return; // Exit the function without setting state
      }

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/terminal/getAllTerminal`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        console.log("fetchRows", response.data.terminals);
        setTerminals(response.data.terminals); // Set data to state
      } catch (error) {
        console.error("Error fetching data:", error);
        if (!hasShownToast.current) {
          toast.error(
            `Error: ${error.response?.data?.message || error.message}`
          );
          hasShownToast.current = true;
        }
        navigate("/home");
      }
    }
    fetchTerminals();
  }, [navigate]);

  useEffect(() => {
    if (selectedType === "All") {
      setFilteredTerminals(terminals);
    } else {
      setFilteredTerminals(terminals.filter((t) => t.type === selectedType));
    }
  }, [selectedType, terminals]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          label="Type"
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="CRM">CRM</MenuItem>
          <MenuItem value="NCR">NCR</MenuItem>
        </Select>
      </FormControl>

      <StatusPieChart data={filteredTerminals} />
    </Box>
  );
};

export default NCRData;
