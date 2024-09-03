import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Search } from "@mui/icons-material";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";
import ViewTerminalGridComponent from "../../components/ViewTerminalGridComponent";

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

export default function ViewRelocated() {
  const navigate = useNavigate();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("user");
  const [value, setValue] = useState(0); // State for the active tab
  const [searchText, setSearchText] = useState(""); // State for search input
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/terminal/getRelocatedTerminal`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setDataRows(response.data.terminals);
      setRole(response.data.role);
    } catch (error) {
      console.error("Error fetching terminals:", error);
      setError(error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const rows =
    dataRows?.map((row, index) => ({
      id: index + 1,
      ...row,
    })) ?? [];

  // Filtered rows
  const filteredRows = rows
    .filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key]).toLowerCase().includes(searchText.toLowerCase())
      )
    )
    .sort((a, b) => {
      // First sort by type (CRM should come first)
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      // Sort by unitId numerically or by localeCompare for strings
      if (typeof a.unitId === "string" && typeof b.unitId === "string") {
        return a.unitId.localeCompare(b.unitId);
      }
      return (a.unitId || 0) - (b.unitId || 0); // Handle cases where unitId might be missing or non-numeric
    });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  // Split sorted rows into CRM and NCR
  const crmRows = filteredRows.filter((row) => row.type === "CRM");
  const ncrRows = filteredRows.filter((row) => row.type === "NCR");

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
        <Tabs value={value} onChange={handleChange} aria-label="Terminal Tabs">
          <Tab label="All Relocated Terminals" />
          <Tab label="Relocated CRM Terminals" />
          <Tab label="Relocated NCR Terminals" />
        </Tabs>
        <TextField
          label="Search"
          value={searchText}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <TabPanel value={value} index={0}>
        <ViewTerminalGridComponent rows={filteredRows} isRelocated={true} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <ViewTerminalGridComponent rows={crmRows} isRelocated={true} />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <ViewTerminalGridComponent rows={ncrRows} isRelocated={true} />
      </TabPanel>
    </Box>
  );
}
