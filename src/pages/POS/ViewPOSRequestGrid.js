import { ContentCopy, Delete, Edit, Preview } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import CustomToolbar from "../../components/CustomToolbar";
import LoadingButton from "@mui/lab/LoadingButton";
import axios from "axios";

const ViewPOSRequestGrid = ({
  rows: initialRows,
  isRelocated,
  isRequestApproval,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copiedData, setCopiedData] = React.useState("");
  // console.log("grid request", rows);
  const [rowsState, setRowsState] = useState(initialRows);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { role, permissions } = useAuthContext();

  useEffect(() => {
    setRowsState(initialRows);
  }, []);
  
  // console.log(pings);
  const columns = [
    // { field: "id", headerName: "No", type: "number", width: 10 },
    {
      field: "serialNumber",
      headerName: "Serial No",
      type: "String",
      flex: 0.5,
      valueGetter: (params) => params?.serialNumber || "N/A",
    },
    { field: "merchantName", headerName: "Merchant Name", flex: 1 },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 1,
      valueGetter: (params) => params?.companyName || "N/A",
    },
    {
      field: "district",
      headerName: "District",
      flex: 0.5,
      valueGetter: (value, row) => row?.branchName?.district?.districtName || "N/A",
    },
    { field: "site", headerName: "Site", flex: 0.5 },
    { field: "contactName", headerName: "Contact Name", flex: 0.8 },
    { field: "merchantAddress", headerName: "Address", flex: 0.5 },
    { field: "posCbsAccount", headerName: "CBS Account", flex: 0.8 },
    { field: "serviceNumber", headerName: "Service Number", flex: 0.6 },
    { field: "staticIp", headerName: "IP Address", flex: 0.9 },
    { field: "status", headerName: "Status", flex: 0.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
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
          {!isRelocated && params.row.isDeleted === false && (permissions?.includes("edit_request") || permissions?.includes("approve_pos")) && (
            <Tooltip title="Edit Request">
              <Box>
                <IconButton
                  color="primary"
                  size="small"
                  disabled={
                    ((permissions?.includes("edit_request") && params.row.status === "Authorized") || params.row.status === "Approved" || 
                    ((params.row.status === "New" || params.row.status === "Rejected") && permissions?.includes("approve_pos")))
                  }
                  onClick={() => {
                    if (permissions?.includes("approve_pos")) {
                      navigate("/approverequest", {
                        state: { row: params.row },
                      });
                    } else {
                      navigate("/request/request", {
                        state: { row: params.row, isEdit: true },
                      });
                    }
                  }}
                >
                  <Edit />
                </IconButton>
              </Box>
            </Tooltip>
          )}
          {permissions?.includes("view_request_detail") &&
            <Tooltip title="View Request">
              <IconButton
                color="primary"
                size="small"
                onClick={() =>
                  navigate("/posdetail", {
                    state: { isRequest: true, row: params.row },
                  })
                }
              >
                <Preview />
              </IconButton>
            </Tooltip>
          }
          <Tooltip title="Copy Request Information">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleCopy(params.row)}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
          {permissions?.includes("delete_request") &&
            params.row.isDeleted === false &&
            (params.row.status === "New" ||
              params.row.status === "Rejected") && (
              <Tooltip title="Delete Request">
                <Box>
                  <IconButton
                    color="secondary"
                    size="small"
                    onClick={() => handleDeleteRequest(params.row._id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Tooltip>
            )}
        </Box>
      ),
    },
  ];

  const handleCopy = (rowData) => {
    // Format the row data into a string
    const rowText = `
    ${rowData.serialNumber.serialNumber}
    ${rowData.merchantName}
    ${rowData.branchName.companyName}
    ${rowData.district.districtName}
    ${rowData.site}
    ${rowData.merchantAddress}
    ${rowData.merchantPhonenumber}
    ${rowData.posCbsAccount}
    ${rowData.serviceNumber}
    ${rowData.staticIp}
    ${rowData.status}
  `;

    // Check if the Clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(rowText)
        .then(() => {
          toast.success("Request details copied to clipboard!");
        })
        .catch((err) => {
          // console.error("Failed to copy:", err);
          toast.error("Failed to copy request details.");
        });
    } else {
      // Fallback for HTTP or unsupported browsers
      fallbackCopyText(rowText);
    }
  };

  const handleDelete = async (row) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    console.log("handle request deletion", row);
    if (!token) {
      navigate("/home");
      return;
    }

    try {
      const response = await axios.patch(
        `${apiUrl}/request/deleteRequest/${row}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      // setSubmitting(false);
      setLoading(false);
    }
  };

  const handleDeleteRequest = (row) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    setOpenDialog(false);
    handleDelete(selectedRow);
  };

  const handleCancel = () => {
    setOpenDialog(false);
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
      toast.success("POS request details copied to clipboard!");
    } catch (err) {
      // console.error("Fallback: Failed to copy:", err);
      toast.error("Failed to copy POS request details.");
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  };

  const handleSend = async (rows) => {
    setLoading(true)
    if (rows.length === 0) {
      toast.error("There is no request to be authorized!");
      return;
    }
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }

    // Create FormData object and populate it with values and file

    console.log("rows to send", rows);

    try {
      const response = await axios.post(
        `${apiUrl}/request/sendRequests`,
        { rows },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      setRowsState([]);
    } catch (error) {
      setLoading(false)
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
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
            overflowY: "hidden !important",
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            display: "none",
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
            display: "none",
          },
        }}
      >
        <DataGrid
          rows={rowsState}
          columns={columns}
          slots={
            role !== "user"
              ? { toolbar: GridToolbar }
              : { toolbar: CustomToolbar }
          }
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          checkboxSelection
          onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
        />
      </Box>
      <Alert severity="info" sx={{ width: "100%", mt: 1 }}>
        <AlertTitle>Copied data:</AlertTitle>
        <code
          style={{
            display: "block",
            maxHeight: 200,
            overflow: "auto",
            whiteSpace: "pre-line",
          }}
        >
          {copiedData}
        </code>
      </Alert>
      {isRequestApproval && role === "posauthorizer" && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          loading={loading}
          onClick={() => handleSend(rowsState)}
        >
          <LoadingButton variant="contained">
            {loading ? "Processing..." : "Approve and Send All Requests"}
          </LoadingButton>
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete POS request? This action cannot be
          undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="primary"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewPOSRequestGrid;
