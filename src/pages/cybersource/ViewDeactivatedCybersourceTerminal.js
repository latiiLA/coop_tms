import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, IconButton, InputAdornment, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import { Edit, Preview, Search } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuthContext } from "../../context/AuthContext";

export default function ViewDeactivatedCybersourceTerminal() {
  const navigate = useNavigate();
  const { role, permissions } = useAuthContext();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(0);
  const [searchText, setSearchText] = useState(""); // State for search input

  const columns = [
    { field: "id", headerName: "No", type: "String", flex: 0.3 },
    {
      field: "branchID",
      headerName: "Branch Name",
      flex: 1,
      valueGetter: (params) => {
        return params?.companyName || "N/A";
      },
    },
    {
      field: "district",
      headerName: "District",
      flex: 0.7,
      valueGetter: (value, row) => {
        return row?.branchID?.district?.districtName || "N/A";
      },
    },
    {
      field: "merchantName",
      headerName: "Merchant Name",
      type: "string",
      flex: 1,
    },
    {
      field: "cbscMerchantID",
      headerName: "CBSC Merchant ID",
      type: "string",
      flex: 1,
    },
    {
      field: "cboMerchantID",
      headerName: "CBO Merchant ID",
      type: "string",
      flex: 1,
    },
    {
      field: "terminalID",
      headerName: "terminal ID",
      type: "string",
      flex: 1,
    },
    {
      field: "cbscType",
      headerName: "CBSC Type",
      type: "string",
      flex: 1,
      renderCell: (params) =>
        params.value ? params.value.toUpperCase() : "",
    },
    {
      field: "status",
      headerName: "Status",
      type: "string",
      flex: 1,
    },
        {
          field: "actions",
          headerName: "Actions",
          flex: 0.9,
          renderCell: (params) => (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                width: "100%",
                height: "100%",
                margin: "auto",
                alignItems: "center",
              }}
            >
              {!params.status == "Deactivated" && permissions?.includes("edit_cybersource_terminal") && (
                <Tooltip title="Edit Terminal">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() =>
                      navigate("/cybersource/edit", { state: { row: params.row } })
                    }
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
              {permissions?.includes("view_cybersource_terminal_detail") &&
                <Tooltip title="View Cybersource Terminal">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() =>
                      navigate("/cybersource/detail", { state: { row: params.row } })
                    }
                  >
                    <Preview />
                  </IconButton>
                </Tooltip>
              }
            </Box>
          ),
        },
  ];

  const fetchRows = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/cybersource/getDeactivatedCybersourceTerminal`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      // console.log(response);
      setDataRows(response.data.cybersourceTerminals || []);
    } catch (error) {
      // console.error("Error fetching branches:", error);
      setError(error.response?.data?.message || error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const rows = dataRows.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

  const filteredRows = rows.filter((row) => {
  // Filter by selected tab
  const matchesType =
    value === 0 ||
    (value === 1 && row.cbscType?.toUpperCase() === "ECOMMERCE") ||
    (value === 2 && row.cbscType?.toUpperCase() === "AFT");

  // Filter by search
  const searchLower = searchText.toLowerCase();

  const matchesSearch =
    row.merchantName?.toLowerCase().includes(searchLower) ||
    row.cbscMerchantID?.toLowerCase().includes(searchLower) ||
    row.cboMerchantID?.toLowerCase().includes(searchLower) ||
    row.terminalID?.toLowerCase().includes(searchLower) ||
    row.cbsAccount?.toLowerCase().includes(searchLower) ||
    row.cbscType?.toLowerCase().includes(searchLower) ||
    String(row.branchID?.companyName || "")
      .toLowerCase()
      .includes(searchLower) ||
    String(row.branchID?.district?.districtName || "")
      .toLowerCase()
      .includes(searchLower);

    return matchesType && matchesSearch;
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          margin: 1,
        }}
      >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Tabs value={value} onChange={handleChange} aria-label="Cybersource Tabs">
          <Tab label="All Deactivated Cybersources" />
          <Tab label="Ecommerce Deactivated Cybersources" />
          <Tab label="AFT Deactivated Cybersources" />
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
      </Box>
      <Box
        sx={{
          width: "auto",
          margin: 1,
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-root": {
            overflow: "hidden",
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowY: "hidden !important", // Hides the vertical scrollbar
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            display: "none", // Hides the scrollbar for WebKit browsers
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
            display: "none",
          },
        }}
      >
        <DataGrid
          slots={{ toolbar: GridToolbar }}
          rows={filteredRows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
}
