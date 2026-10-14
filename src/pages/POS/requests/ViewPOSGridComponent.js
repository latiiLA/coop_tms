import {
  CheckCircle,
  Cancel,
  Edit,
  MoveDown,
  Preview,
  Stop,
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
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useAuthContext } from "../../../context/AuthContext";
import CustomToolbar from "../../../components/CustomToolbar";
import { GrConfigure } from "react-icons/gr";
import axios from "axios";
import { isDemoMode } from "../../../demo/demoApi";

const ViewPOSGridComponent = ({
  rows,
  isRelocated,
  isRelocatedReq,
  detailType,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedData, setCopiedData] = React.useState("");
  const [authorizers, setAuthorizers] = useState([]);
  const [selectedAuthorizer, setSelectedAuthorizer] = useState("");
  const [remark, setRemark] = useState("");
  const [loadingAuthorizers, setLoadingAuthorizers] = useState(false);
  const [decisionDialog, setDecisionDialog] = useState({
    open: false,
    action: null, // "approve" | "reject"
    rowId: null,
  });
  const [decisionRemark, setDecisionRemark] = useState("");
  const [completeDialog, setCompleteDialog] = useState({
    open: false,
    status: null, // "Relocated" | "Stopped"
    rowId: null,
  });

  // dialog box for config version
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configVersion, setConfigVersion] = useState("0002");
  const [selectedConfigData, setSelectedConfigData] = useState(null);

  const { role, permissions } = useAuthContext();
  const can = (perm) => isDemoMode() || permissions?.includes(perm);
  // console.log(pings);
  const columns = [
    {
      field: "serialNumber",
      headerName: "Serial No",
      type: "String",
      flex: 0.5,
      valueGetter: (value) => value?.serialNumber || "N/A",
    },
    { field: "terminalId", headerName: "Terminal ID", flex: 0.6 },
    { field: "merchantId", headerName: "Merchant Id", flex: 0.8 },
    { field: "merchantName", headerName: "Merchant Name", flex: 1 },
    { field: "site", headerName: "Site", flex: 0.5 },
    { field: "merchantAddress", headerName: "Address", flex: 0.5 },
    { field: "posCbsAccount", headerName: "CBS Account", flex: 0.5 },
    { field: "serviceNumber", headerName: "Service Number", flex: 0.6 },
    { field: "staticIp", headerName: "IP Address", flex: 0.8 },
    { field: "configVersion", headerName: "Config Version", flex: 0.3 },
    { field: "status", headerName: "Status", flex: 0.5 },
    {
      field: "district",
      headerName: "District",
      flex: 0.5,
      valueGetter: (value, row) => row?.branchName?.district?.districtName || "N/A",
    },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 0.5,
      valueGetter: (value) => value?.companyName || "N/A",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 0.5,
    },
    // {
    //   field: "updatedAt",
    //   headerName: "Updated At",
    //   flex: 0.5,
    // },
    // Actions Column    
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
            {!isRelocated &&
              can("edit_pos") &&
              (!isRelocatedReq ||
                params.row.status === "RelocationAuthorized") && (
              <Tooltip title="Edit POS">
                <Box>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() =>
                      navigate("/editpos", { state: { row: params.row } })
                    }
                  >
                    <Edit />
                  </IconButton>
                </Box>
              </Tooltip>
            )}
            {!isRelocated && detailType && can("view_request_detail") && (
              <Tooltip Tooltip title="View Request">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() =>
                    navigate("/requestdetail", {
                      state: { row: params.row },
                    })
                  }
                >
                  <Preview />
                </IconButton>
              </Tooltip>
            )}
            {!detailType && can("view_pos_detail") && (
              <Tooltip title="View POS">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() =>
                    navigate("/posdetail", {
                      state: {
                        isRequest: false,
                        relocated: false,
                        row: params.row,
                      },
                    })
                  }
                >
                  <Preview />
                </IconButton>
              </Tooltip>
            )}
            {/* <Tooltip title="Copy POS Information">
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleCopy(params.row)}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip> */}
            {!isRelocatedReq &&
              can("request_pos_termination") &&
              (params.row.status === "New" ||
                params.row.status === "Active") && (
              <Tooltip title="Stop POS">
                <IconButton
                  sx={{ color: "#ff0000" }}
                  size="small"
                  onClick={() => handleRelocate(params.row._id)}
                >
                  <Stop />
                </IconButton>
              </Tooltip>
            )}
            {isRelocatedReq &&
              params.row.status === "ToBeRelocated" &&
              can("authorize_pos_relocation") && (
                <Tooltip title="Approve Relocation">
                  <IconButton
                    color="success"
                    size="small"
                    onClick={() =>
                      openDecisionDialog("approve", params.row._id)
                    }
                  >
                    <CheckCircle />
                  </IconButton>
                </Tooltip>
              )}
            {isRelocatedReq &&
              params.row.status === "ToBeRelocated" &&
              can("reject_pos_relocation") && (
                <Tooltip title="Reject Relocation">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() =>
                      openDecisionDialog("reject", params.row._id)
                    }
                  >
                    <Cancel />
                  </IconButton>
                </Tooltip>
              )}
            {isRelocatedReq &&
              params.row.status === "RelocationAuthorized" &&
              can("edit_pos") && (
                <Tooltip title="Complete Relocation">
                  <IconButton
                    color="success"
                    size="small"
                    onClick={() =>
                      openCompleteDialog("Relocated", params.row._id)
                    }
                  >
                    <MoveDown />
                  </IconButton>
                </Tooltip>
              )}
            {isRelocatedReq &&
              params.row.status === "RelocationAuthorized" &&
              can("stop_pos") && (
                <Tooltip title="Mark as Stopped">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() =>
                      openCompleteDialog("Stopped", params.row._id)
                    }
                  >
                    <Stop />
                  </IconButton>
                </Tooltip>
              )}
            {!isRelocated && !isRelocatedReq && can("generate_pos_config") && (
              <Tooltip title="Generate Config">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => {
                    setSelectedConfigData(params.row);
                    setConfigVersion("0002");
                    setConfigDialogOpen(true);
                  }}
                >
                  <GrConfigure />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ]

  const fetchAuthorizers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    setLoadingAuthorizers(true);
    try {
      const response = await axios.get(`${apiUrl}/auth/getAuthorizingUser`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setAuthorizers(response.data.users || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load authorizers"
      );
      setAuthorizers([]);
    } finally {
      setLoadingAuthorizers(false);
    }
  };

  const handleDelete = async (row) => {
    if (!selectedAuthorizer) {
      toast.error("Please assign an authorizer");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/pos/relocate/${row}`,
        {
          assignRelocationAuthorizer: selectedAuthorizer,
          remark: remark.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      setOpenDialog(false);
      setSelectedRow(null);
      setSelectedAuthorizer("");
      setRemark("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfig = async (configData, selectedVersion) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    const configVersion = String(selectedVersion || "0002")
      .replace(/\D/g, "")
      .padStart(4, "0");
    const folderName = `ConfigurationFile_V${configVersion}`;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(
        `${apiUrl}/pos/generateConfig`,
        { id: configData._id, version: selectedVersion },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"] || "";
      if (
        !contentType.includes("zip") &&
        !contentType.includes("octet-stream")
      ) {
        const text = await response.data.text();
        let message = "Error generating config file.";
        try {
          message = JSON.parse(text).message || message;
        } catch {
          /* ignore */
        }
        toast.error(message);
        return;
      }

      const blob = new Blob([response.data], { type: "application/zip" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${folderName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success("successfully generated config file");
    } catch (error) {
      let message = "Error generating config file.";
      const data = error.response?.data;
      if (data instanceof Blob) {
        try {
          const parsed = JSON.parse(await data.text());
          message = parsed.message || message;
        } catch {
          /* ignore */
        }
      } else if (data?.message) {
        message = data.message;
      }
      toast.error(message);
    }
  };

  const handleRelocate = (row) => {
    setSelectedRow(row);
    setSelectedAuthorizer("");
    setRemark("");
    setOpenDialog(true);
    fetchAuthorizers();
  };

  const handleConfirmRelocate = () => {
    handleDelete(selectedRow);
  };

  const handleCancel = () => {
    setOpenDialog(false);
    setSelectedRow(null);
    setSelectedAuthorizer("");
    setRemark("");
  };

  const openDecisionDialog = (action, rowId) => {
    setDecisionRemark("");
    setDecisionDialog({ open: true, action, rowId });
  };

  const closeDecisionDialog = () => {
    setDecisionDialog({ open: false, action: null, rowId: null });
    setDecisionRemark("");
  };

  const openCompleteDialog = (status, rowId) => {
    setCompleteDialog({ open: true, status, rowId });
  };

  const closeCompleteDialog = () => {
    setCompleteDialog({ open: false, status: null, rowId: null });
  };

  const handleRelocationDecision = async () => {
    const { action, rowId } = decisionDialog;
    if (!action || !rowId) return;

    if (action === "reject" && decisionRemark.trim().length < 3) {
      toast.error("Remark is required (at least 3 characters) to reject");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/home");
      return;
    }

    const endpoint =
      action === "approve"
        ? `${apiUrl}/pos/authorizeRelocation/${rowId}`
        : `${apiUrl}/pos/rejectRelocation/${rowId}`;

    try {
      const response = await axios.put(
        endpoint,
        { remark: decisionRemark.trim() || undefined },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success(
        action === "approve"
          ? `${response.data.message} Sent to POS admin for relocation.`
          : response.data.message
      );
      closeDecisionDialog();
      onRefresh?.();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRelocation = async () => {
    const { status, rowId } = completeDialog;
    if (!status || !rowId) return;

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/home");
      return;
    }

    try {
      const response = await axios.put(
        `${apiUrl}/pos/completeRelocation/${rowId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      closeCompleteDialog();
      onRefresh?.();
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
        sx={{
          width: "auto",
          margin: 1,
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          loading={loading}
          showToolbar
          slots={{
            toolbar: role === "user" ? CustomToolbar : GridToolbar,
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
      <Dialog open={openDialog} onClose={handleCancel} fullWidth maxWidth="xs">
        <DialogTitle>Stop / Terminate POS</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            Are you sure you want to stop/terminate this POS? An authorizer must
            approve the request.
            <TextField
              select
              required
              fullWidth
              label="Assign Authorizer"
              value={selectedAuthorizer}
              onChange={(e) => setSelectedAuthorizer(e.target.value)}
              disabled={loadingAuthorizers || loading}
              helperText={
                loadingAuthorizers
                  ? "Loading authorizers..."
                  : "Select a POS Request Authorizer"
              }
            >
              {authorizers.length === 0 && !loadingAuthorizers ? (
                <MenuItem disabled value="">
                  No authorizers available
                </MenuItem>
              ) : (
                authorizers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.fatherName} {user.gfatherName}
                  </MenuItem>
                ))
              )}
            </TextField>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Remark (optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRelocate}
            color="primary"
            variant="contained"
            disabled={loading || loadingAuthorizers || !selectedAuthorizer}
          >
            {loading ? "Processing..." : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={decisionDialog.open}
        onClose={closeDecisionDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {decisionDialog.action === "approve"
            ? "Approve Relocation Request"
            : "Reject Relocation Request"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {decisionDialog.action === "approve"
              ? "Approve this stop/relocation request? It will move to POS admin to complete the relocation."
              : "Reject this stop/relocation request? The POS will return to Active status."}
            <TextField
              fullWidth
              multiline
              minRows={2}
              required={decisionDialog.action === "reject"}
              label={
                decisionDialog.action === "reject"
                  ? "Remark (required)"
                  : "Remark (optional)"
              }
              value={decisionRemark}
              onChange={(e) => setDecisionRemark(e.target.value)}
              disabled={loading}
              helperText={
                decisionDialog.action === "reject"
                  ? "Explain why this request is rejected (min 3 characters)"
                  : undefined
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDecisionDialog}
            color="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRelocationDecision}
            color={decisionDialog.action === "approve" ? "success" : "error"}
            variant="contained"
            disabled={
              loading ||
              (decisionDialog.action === "reject" &&
                decisionRemark.trim().length < 3)
            }
          >
            {loading
              ? "Processing..."
              : decisionDialog.action === "approve"
                ? "Approve"
                : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={completeDialog.open}
        onClose={closeCompleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {completeDialog.status === "Relocated"
            ? "Complete Relocation"
            : "Mark POS as Stopped"}
        </DialogTitle>
        <DialogContent>
          {completeDialog.status === "Relocated"
            ? "Mark this POS as Relocated? This completes the authorized relocation request and cannot be undone."
            : "Mark this POS as Stopped? This completes the authorized stop request and cannot be undone."}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeCompleteDialog}
            color="secondary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompleteRelocation}
            color={completeDialog.status === "Relocated" ? "success" : "error"}
            variant="contained"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : completeDialog.status === "Relocated"
                ? "Mark Relocated"
                : "Mark Stopped"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Generate Configuration</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Configuration Version"
            value={configVersion}
            onChange={(e) => {
              // Only allow numbers
              const value = e.target.value.replace(/\D/g, "");
              setConfigVersion(value);
            }}
            placeholder="0002"
            helperText="Enter the configuration version, e.g. 0002"
            inputProps={{
              maxLength: 4,
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setConfigDialogOpen(false);
              setSelectedConfigData(null);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedConfigData) {
                toast.error("No terminal selected.");
                return;
              }

              if (!configVersion) {
                toast.error("Please enter a configuration version.");
                return;
              }

              setConfigDialogOpen(false);

              await handleConfig(
                selectedConfigData,
                configVersion
              );

              setSelectedConfigData(null);
            }}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewPOSGridComponent;
