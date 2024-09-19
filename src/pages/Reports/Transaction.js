import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { CurrencyExchange, Search } from "@mui/icons-material";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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

const Transaction = () => {
  const navigate = useNavigate();
  const { role, setRole } = useAuthContext();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(0); // State for the active tab
  const [searchText, setSearchText] = useState(""); // State for search input

  // State to store dates for each row
  const [dates, setDates] = useState({});

  const handleDateChange = (id, field, newValue) => {
    console.log(`Updating ${field} for ID ${id}:`, newValue); // Log newValue
    setDates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: newValue,
      },
    }));
  };

  const columns = [
    { field: "unitId", headerName: "Unit ID", flex: 0.5 },
    { field: "terminalId", headerName: "Terminal ID", flex: 1 },
    { field: "terminalName", headerName: "Terminal Name", flex: 1 },
    { field: "branchName", headerName: "Branch Name", flex: 1 },
    { field: "type", headerName: "Type", flex: 0.3 },
    { field: "onlineStatus", headerName: "NetXMS Online Status", flex: 1 },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <DatePicker
            value={dates[params.id]?.startDate || dayjs(params.row.startDate)}
            onChange={(date) => handleDateChange(params.id, "startDate", date)}
            format="YYYY-MM-DD"
            slotProps={{ textField: { variant: "outlined", size: "small" } }}
          />
        </Box>
      ),
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <DatePicker
            value={dates[params.id]?.endDate || dayjs(params.row.endDate)}
            onChange={(date) => handleDateChange(params.id, "endDate", date)}
            format="YYYY-MM-DD"
            slotProps={{ textField: { variant: "outlined", size: "small" } }}
            minDate={dates[params.id]?.startDate || dayjs(params.row.startDate)} // Prevents end date from being earlier than start date
          />
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        const startDate = dates[params.id]?.startDate
          ? dayjs(dates[params.id].startDate).format("YYYY-MM-DD")
          : dayjs(params.row.startDate).isValid()
          ? dayjs(params.row.startDate).format("YYYY-MM-DD")
          : null;

        const endDate = dates[params.id]?.endDate
          ? dayjs(dates[params.id].endDate).format("YYYY-MM-DD")
          : dayjs(params.row.endDate).isValid()
          ? dayjs(params.row.endDate).format("YYYY-MM-DD")
          : null;

        return (
          <Tooltip title="View Terminal's Transaction">
            <IconButton
              color="primary"
              size="small"
              onClick={() =>
                navigate("/viewtransaction", {
                  state: {
                    terminalId: params.row.terminalId,
                    startDate, // Use the updated startDate
                    endDate, // Use the updated endDate
                  },
                })
              }
            >
              <CurrencyExchange />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/terminal/getTerminal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // Parse dates into Date objects if necessary
      const terminals = response.data.terminals.map((terminal) => ({
        ...terminal,
        startDate: dayjs(terminal.startDate),
        endDate: dayjs(terminal.endDate),
      }));

      // console.log(terminals);

      setDataRows(terminals);
      setRole(response.data.role);
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
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const rows = dataRows.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

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

  const crmRows = filteredRows.filter((row) => row.type === "CRM");
  const ncrRows = filteredRows.filter((row) => row.type === "NCR");

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Terminal Tabs"
            >
              <Tab label="All Terminals" />
              <Tab label="CRM Terminals" />
              <Tab label="NCR Terminals" />
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
            <Box
              sx={{
                width: "auto",
                "& .super-app-theme--header": {
                  backgroundColor: "#0693e3",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#0693e3",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#0693e3",
                  color: "#fff",
                },
              }}
            >
              <DataGrid
                rows={filteredRows}
                columns={columns}
                components={{
                  Toolbar: role !== "user" ? GridToolbar : CustomToolbar,
                }}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 20 },
                  },
                }}
                pageSizeOptions={[20, 50, 100]}
                autoHeight
                checkboxSelection
              />
            </Box>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Box
              sx={{
                width: "auto",
                "& .super-app-theme--header": {
                  backgroundColor: "#0693e3",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#0693e3",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#0693e3",
                  color: "#fff",
                },
              }}
            >
              <DataGrid
                rows={crmRows}
                columns={columns}
                components={{
                  Toolbar: role !== "user" ? GridToolbar : CustomToolbar,
                }}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 20 },
                  },
                }}
                pageSizeOptions={[20, 50, 100]}
                autoHeight
                checkboxSelection
              />
            </Box>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Box
              sx={{
                width: "auto",
                "& .super-app-theme--header": {
                  backgroundColor: "#0693e3",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#0693e3",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#0693e3",
                  color: "#fff",
                },
              }}
            >
              <DataGrid
                rows={ncrRows}
                columns={columns}
                components={{
                  Toolbar: role !== "user" ? GridToolbar : CustomToolbar,
                }}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 20 },
                  },
                }}
                pageSizeOptions={[20, 50, 100]}
                autoHeight
                checkboxSelection
              />
            </Box>
          </TabPanel>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Transaction;
