import {
  Block,
  CheckCircle,
  ContentCopy,
  Delete,
  Edit,
  Preview,
} from "@mui/icons-material";
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
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import LoadingButton from "@mui/lab/LoadingButton";
import axios from "axios";
import { isDemoMode } from "../../demo/demoApi";
import { gridContainerSx, PermissionGridToolbar } from "../../components/gridStyles";

// POS requests may only be edited while New or Rejected (server enforces 409).
const EDITABLE_REQUEST_STATUSES = ["New", "Rejected"];

const ViewPOSRequestGrid = ({
  rows: initialRows,
  isRelocated,
  isRequestApproval,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copiedData, setCopiedData] = React.useState("");
  const [rowsState, setRowsState] = useState(initialRows);
  const [selectedRow, setSelectedRow] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [rejectRow, setRejectRow] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const { permissions, currentUser } = useAuthContext();
  const can = (perm) => isDemoMode() || permissions?.includes(perm);
  const isRequestInitiator = (row) => {
    const creatorId =
      row?.createdBy && typeof row.createdBy === "object"
        ? row.createdBy._id
        : row?.createdBy;
    return (
      !!currentUser?.id &&
      !!creatorId &&
      String(creatorId) === String(currentUser.id)
    );
  };

  useEffect(() => {
    setRowsState(initialRows);
    setSelectedIds([]);
  }, [initialRows]);

  // Normalizes DataGrid v7 (array) and v8 ({ type, ids }) selection models.
  const handleSelectionChange = (model) => {
    if (Array.isArray(model)) {
      setSelectedIds(model);
    } else if (model?.type === "exclude") {
      const excluded = model.ids || new Set();
      setSelectedIds(
        (rowsState || []).map((r) => r.id).filter((id) => !excluded.has(id))
      );
    } else {
      setSelectedIds(Array.from(model?.ids || []));
    }
  };

  const rowsToSend =
    selectedIds.length > 0
      ? (rowsState || []).filter((r) => selectedIds.includes(r.id))
      : rowsState || [];
  const columns = [
    // { field: "id", headerName: "No", type: "number", width: 10 },
    {
      field: "serialNumber",
      headerName: "Serial No",
      type: "String",
      flex: 0.5,
      valueGetter: (value) => value?.serialNumber || "N/A",
    },
    { field: "merchantName", headerName: "Merchant Name", flex: 1 },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 1,
      valueGetter: (value) => value?.companyName || "N/A",
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
          {/* Keep icons in place (disabled) so columns stay aligned. */}
          {!isRelocated &&
            params.row.isDeleted === false &&
            can("edit_request") &&
            (() => {
              const isInitiator = isRequestInitiator(params.row);
              const statusOk = EDITABLE_REQUEST_STATUSES.includes(
                params.row.status
              );
              const editable = isInitiator && statusOk;
              const title = !isInitiator
                ? "Only the request initiator can edit this request"
                : statusOk
                  ? "Edit Request"
                  : `Only New or Rejected requests can be edited (status: ${params.row.status})`;
              return (
                <Tooltip title={title}>
                  <span>
                    <IconButton
                      color="primary"
                      size="small"
                      disabled={!editable}
                      onClick={() =>
                        navigate("/request/request", {
                          state: { row: params.row, isEdit: true },
                        })
                      }
                    >
                      <Edit />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })()}
          {/* Approvers: the approve page (was reached through the Edit icon). */}
          {!isRelocated &&
            params.row.isDeleted === false &&
            can("approve_pos") &&
            !isDemoMode() &&
            (() => {
              const approvable = params.row.status === "Authorized";
              return (
                <Tooltip
                  title={
                    approvable
                      ? "Review / Approve Request"
                      : `Only Authorized requests can be approved (status: ${params.row.status})`
                  }
                >
                  <span>
                    <IconButton
                      color="success"
                      size="small"
                      disabled={!approvable}
                      onClick={() =>
                        navigate("/approverequest", {
                          state: { row: params.row },
                        })
                      }
                    >
                      <CheckCircle />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })()}
          {can("view_request_detail") && (
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
          )}
          <Tooltip title="Copy Request Information">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleCopy(params.row)}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
          {isRequestApproval &&
            can("reject_pos_request") &&
            params.row.isDeleted === false &&
            (() => {
              const rejectable = params.row.status === "New";
              return (
                <Tooltip
                  title={
                    rejectable
                      ? "Reject Request"
                      : `Only New requests can be rejected (status: ${params.row.status})`
                  }
                >
                  <span>
                    <IconButton
                      color="error"
                      size="small"
                      disabled={!rejectable}
                      onClick={() => {
                        setRejectReason("");
                        setRejectRow(params.row);
                      }}
                    >
                      <Block />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })()}
          {can("delete_request") &&
            params.row.isDeleted === false &&
            (() => {
              const isInitiator = isRequestInitiator(params.row);
              const statusOk =
                params.row.status === "New" ||
                params.row.status === "Rejected";
              const deletable = isInitiator && statusOk;
              const title = !isInitiator
                ? "Only the request initiator can delete this request"
                : statusOk
                  ? "Delete Request"
                  : `Only New or Rejected requests can be deleted (status: ${params.row.status})`;
              return (
                <Tooltip title={title}>
                  <span>
                    <IconButton
                      color="secondary"
                      size="small"
                      disabled={!deletable}
                      onClick={() => handleDeleteRequest(params.row._id)}
                    >
                      <Delete />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            })()}
        </Box>
      ),
    },
  ];

  const handleCopy = (rowData) => {
    // Format the row data into a string
    const rowText = `
    ${rowData.serialNumber?.serialNumber || "-"}
    ${rowData.merchantName || "-"}
    ${rowData.branchName?.companyName || "-"}
    ${rowData.district?.districtName || rowData.branchName?.district?.districtName || "-"}
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
              toast.error("Failed to copy request details.");
        });
    } else {
      // Fallback for HTTP or unsupported browsers
      fallbackCopyText(rowText);
    }
  };

  const handleDelete = async (row) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }

    setLoading(true);
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
      if (onRefresh) {
        onRefresh();
      } else {
        setRowsState((prev) => (prev || []).filter((r) => r._id !== row));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (rejectLoading || !rejectRow) return;
    const reason = rejectReason.trim();
    if (reason.length < 3) {
      toast.error("Please enter a rejection reason (at least 3 characters).");
      return;
    }
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/home");
      return;
    }
    setRejectLoading(true);
    try {
      const row = {
        _id: rejectRow._id,
        remark: reason,
        merchantName: rejectRow.merchantName,
        serialNumber: rejectRow.serialNumber?.serialNumber || "-",
        createdBy: rejectRow.createdBy?._id || rejectRow.createdBy,
      };
      const response = await axios.post(
        `${apiUrl}/request/reject`,
        { row },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      const rejectedId = rejectRow._id;
      setRejectRow(null);
      setRejectReason("");
      if (onRefresh) {
        onRefresh();
      } else {
        setRowsState((prev) => (prev || []).filter((r) => r._id !== rejectedId));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setRejectLoading(false);
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
      toast.error("Failed to copy POS request details.");
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  };

  const handleOpenSendConfirm = () => {
    if (loading) return;
    if (rowsToSend.length === 0) {
      toast.error("There is no request to be authorized!");
      return;
    }
    setConfirmSendOpen(true);
  };

  const handleSend = async (rows) => {
    if (loading) return;
    if (!rows || rows.length === 0) {
      toast.error("There is no request to be authorized!");
      return;
    }
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }

    setLoading(true);
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
      const sentIds = new Set(rows.map((r) => r._id));
      setSelectedIds([]);
      if (onRefresh) {
        onRefresh();
      } else {
        setRowsState((prev) => (prev || []).filter((r) => !sentIds.has(r._id)));
      }
    } catch (error) {
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
        sx={gridContainerSx}
      >
        <DataGrid
          rows={rowsState}
          columns={columns}
          showToolbar
          slots={{ toolbar: PermissionGridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          checkboxSelection
          onRowSelectionModelChange={handleSelectionChange}
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
      {isRequestApproval && can("send_request") && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LoadingButton
            variant="contained"
            loading={loading}
            disabled={loading || rowsToSend.length === 0}
            onClick={handleOpenSendConfirm}
          >
            {loading
              ? "Processing..."
              : selectedIds.length > 0
              ? `Approve and Send Selected Requests (${rowsToSend.length})`
              : "Approve and Send All Requests"}
          </LoadingButton>
        </Box>
      )}
      <Dialog
        open={confirmSendOpen}
        onClose={() => !loading && setConfirmSendOpen(false)}
      >
        <DialogTitle>Confirm Send</DialogTitle>
        <DialogContent>
          Approve and send {rowsToSend.length}{" "}
          {selectedIds.length > 0 ? "selected " : ""}
          request{rowsToSend.length === 1 ? "" : "s"}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSendOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={loading}
            onClick={() => {
              setConfirmSendOpen(false);
              handleSend(rowsToSend);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(rejectRow)}
        onClose={() => !rejectLoading && setRejectRow(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Reject request for{" "}
            <strong>{rejectRow?.merchantName || "-"}</strong> (Serial:{" "}
            {rejectRow?.serialNumber?.serialNumber || "-"})?
          </Typography>
          <TextField
            autoFocus
            label="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            required
            error={rejectReason.length > 0 && rejectReason.trim().length < 3}
            helperText="At least 3 characters"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectRow(null)}
            color="secondary"
            disabled={rejectLoading}
          >
            Cancel
          </Button>
          <LoadingButton
            color="error"
            loading={rejectLoading}
            disabled={rejectReason.trim().length < 3}
            onClick={handleConfirmReject}
          >
            Reject
          </LoadingButton>
        </DialogActions>
      </Dialog>
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
