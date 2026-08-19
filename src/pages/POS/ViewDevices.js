import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ContentCopy, Search } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ViewDevices() {
  const navigate = useNavigate();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState(""); // State for search input

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
      const response = await axios.get(`${apiUrl}/device/getDevice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log(response);
      setDataRows(response.data.devices || []);
    } catch (error) {
      // console.error("Error fetching branches:", error);
      setError(error.response?.data?.message || error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (serialNumber) => {
    // Check if the Clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(serialNumber)
        .then(() => {
          toast.success("Serial Number copied to clipboard!");
        })
        .catch((err) => {
          // console.error("Failed to copy:", err);
          toast.error("Failed to copy Serial Number.");
        });
    } else {
      // Fallback for HTTP or unsupported browsers
      fallbackCopyText(serialNumber);
    }
  };

  // Fallback method using a temporary textarea for older browsers or HTTP
  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Prevent scrolling to the bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy"); // Fallback to execCommand for unsupported environments
      toast.success("Serial Number copied to clipboard!");
    } catch (err) {
      // console.error("Fallback: Failed to copy:", err);
      toast.error("Failed to copy Serial Number code.");
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  };

  const columns = [
    { field: "id", headerName: "No", type: "string", flex: 0.1 },
    {
      field: "serialNumber",
      headerName: "SerialNumber",
      type: "string",
      flex: 1,
    },
    {
      field: "deviceType",
      headerName: "Device Type",
      type: "string",
      flex: 0.7,
    },
    {
      field: "status",
      headerName: "Status",
      type: "string",
      flex: 0.7,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.3,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            margin: "auto",
            alignItems: "center",
          }}
        >
          <Tooltip title="Copy Serial Number">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleCopy(params.row.serialNumber)}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  useEffect(() => {
    fetchRows();
  }, []); // Add any necessary dependencies here

  const rows = dataRows.map((row, index) => ({
    id: index + 1,
    ...row,
  }));
  const filteredRows = rows.filter((row) => {
    // Perform case-insensitive search in all text fields
    const searchLower = searchText.toUpperCase();
    return (
      row.serialNumber.toUpperCase().includes(searchLower) ||
      row.deviceType.toUpperCase().includes(searchLower) ||
      row.status.toUpperCase().includes(searchLower)
    );
  });

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
        <Typography
          variant="h5"
          sx={{ height: "100%", marginTop: "auto" }}
          gutterBottom
        >
          Device List
        </Typography>
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
