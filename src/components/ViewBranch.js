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
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ViewBranch() {
  const navigate = useNavigate();
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [value, setValue] = useState(0); // State for the active tab
  const [searchText, setSearchText] = useState(""); // State for search input

  const fetchRows = async () => {
    const token = localStorage.getItem("token");
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!token) {
      console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/branch/getBranch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log(response);
      setDataRows(response.data.branches || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError(error.response?.data?.message || error.message);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (branchCode) => {
    // Check if the Clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(branchCode)
        .then(() => {
          toast.success("Terminal details copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
          toast.error("Failed to copy terminal details.");
        });
    } else {
      // Fallback for HTTP or unsupported browsers
      fallbackCopyText(branchCode);
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
      toast.success("Terminal details copied to clipboard!");
    } catch (err) {
      console.error("Fallback: Failed to copy:", err);
      toast.error("Failed to copy terminal details.");
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  };

  const columns = [
    { field: "id", headerName: "No", type: "number", width: 10 },
    {
      field: "branchCode",
      headerName: "Branch Code",
      type: "string",
      flex: 0.7,
    },
    {
      field: "companyName",
      headerName: "Branch Name",
      type: "string",
      flex: 0.7,
    },
    {
      field: "address",
      headerName: "Address",
      type: "string",
      flex: 1,
    },
    {
      field: "mnemonic",
      headerName: "Mnemonic",
      type: "string",
      flex: 0.5,
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
          <Tooltip title="Copy Branch Code">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleCopy(params.row.branchCode)}
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
    const searchLower = searchText.toLowerCase();
    return (
      row.branchCode.toLowerCase().includes(searchLower) ||
      row.companyName.toLowerCase().includes(searchLower) ||
      row.address.toLowerCase().includes(searchLower) ||
      row.mnemonic.toLowerCase().includes(searchLower)
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
        sx={{ display: "flex", flexDirection: "row", gap: 2, paddingBottom: 2 }}
      >
        <Typography
          variant="h4"
          sx={{ height: "100%", marginTop: "auto" }}
          gutterBottom
        >
          Branch Codes
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
