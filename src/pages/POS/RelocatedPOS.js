import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  Box,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import ViewPOSGridComponent from "./requests/ViewPOSGridComponent";

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

export default function RelocatedPOS() {
  const navigate = useNavigate();
  const [dataRows, setDataRows] = useState([]);
  const [pings, setPings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState("user");
  const [value, setValue] = useState(0); // State for the active tab
  const [searchText, setSearchText] = useState(""); // State for search input
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/pos/getRelocatedPos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setDataRows(response.data.posTerminals);
      setRole(response.data.role);
    } catch (error) {
      // console.error("Error fetching terminals:", error);
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
    dataRows
      ?.map((row, index) => ({
        id: index + 1,
        ...row,
      }))
      .reverse() ?? [];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  // Split sorted rows into CRM and NCR
  const branchRows = rows.filter((row) => row.posSite === "Branch");
  const merchantRows = rows.filter((row) => row.posSite === "Merchant");

  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Tabs value={value} onChange={handleChange} aria-label="Terminal Tabs">
          <Tab label="Relocated POS" />
          <Tab label="Relocated Merchant POS" />
          <Tab label="Relocated Branch POS" />
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
        <ViewPOSGridComponent isRelocated={true} rows={rows} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <ViewPOSGridComponent isRelocated={true} rows={merchantRows} />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <ViewPOSGridComponent isRelocated={true} rows={branchRows} />
      </TabPanel>
    </Box>
  );
}
