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

export default function ManagePOS() {
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
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/pos/getPos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setDataRows(response.data.posTerminals);
      setRole(response.data.role);
      console.log("pos", response.data.posTerminals);
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
    dataRows?.map((row, index) => ({
      id: index + 1,
      ...row,
    })) ?? [];

  let filteredRows = rows.filter((row) =>
    Object.keys(row).some((key) => {
      if (key === "branchName") {
        return String(row[key]?.companyName)
          .toLowerCase()
          .includes(searchText.toLowerCase());
      } else if (key === "district") {
        return String(row[key]?.districtName)
          .toLowerCase()
          .includes(searchText.toLowerCase());
      } else if (key === "serialNumber") {
        return String(row[key]?.serialNumber)
          .toLowerCase()
          .includes(searchText.toLowerCase());
      } else {
        return String(row[key])
          .toLowerCase()
          .includes(searchText.toLowerCase());
      }
    })
  );

  // console.log(filteredRows, "filtered");

  // Split sorted rows into CRM and NCR
  const branchRows = filteredRows.filter((row) => row.site === "BRANCH");
  const merchantRows = filteredRows.filter((row) => row.site === "MERCHANT");

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

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
          <Tab label="All POS" />
          <Tab label="Merchant POS" />
          <Tab label="Branch POS" />
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
        <ViewPOSGridComponent requestType="posInfo" rows={filteredRows} />
      </TabPanel>

      <TabPanel value={value} index={1}>
        <ViewPOSGridComponent requestType="posInfo" rows={merchantRows} />
      </TabPanel>

      <TabPanel value={value} index={2}>
        <ViewPOSGridComponent requestType="posInfo" rows={branchRows} />
      </TabPanel>
    </Box>
  );
}
