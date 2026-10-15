import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  Box,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import ViewPOSRequestGrid from "../ViewPOSRequestGrid";

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

export default function SendRequests() {
  const navigate = useNavigate();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(0); // State for the active tab
  const [searchText, setSearchText] = useState(""); // State for search input
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/request/getSavedRequest`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setDataRows(response.data.newRequests || []);
    } catch (error) {
      setError(error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const allRows =
    dataRows?.map((row, index) => ({
      id: index + 1,
      ...row,
    })) ?? [];

  // Case-insensitive search over the text shown in the grid.
  const getSearchableText = (row) =>
    [
      row.serialNumber?.serialNumber,
      row.merchantName,
      row.branchName?.companyName,
      row.branchName?.district?.districtName,
      row.district?.districtName,
      row.site,
      row.contactName,
      row.merchantAddress,
      row.posCbsAccount,
      row.serviceNumber,
      row.staticIp,
      row.status,
    ]
      .filter((v) => v !== undefined && v !== null)
      .map((v) => String(v).toLowerCase())
      .join(" ");

  const query = searchText.trim().toLowerCase();
  const rows = query
    ? allRows.filter((row) => getSearchableText(row).includes(query))
    : allRows;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  // Split sorted rows into CRM and NCR
  const merchantRequest = rows.filter((row) => row.site === "MERCHANT");
  const branchRequest = rows.filter((row) => row.site === "BRANCH");

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
          <Tab label={`All New Requests (${rows.length})`} />
          <Tab label={`All Merchant Requests (${merchantRequest.length})`} />
          <Tab label={`All Branch Requests (${branchRequest.length})`} />
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
      {[rows, merchantRequest, branchRequest].map((tabRows, index) => (
        <TabPanel value={value} index={index} key={index}>
          <ViewPOSRequestGrid
            rows={tabRows}
            isRequestApproval={true}
            onRefresh={fetchRows}
          />
        </TabPanel>
      ))}
    </Box>
  );
}
