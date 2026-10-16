import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit, Key } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";
import {
  gridContainerSx,
  PermissionGridToolbar,
} from "../../../components/gridStyles";
import { useAuthContext } from "../../../context/AuthContext";
import { isDemoMode } from "../../../demo/demoApi";
import { FieldSlot, Section } from "../../POS/requests/RequestPOS";

const emptyForm = { name: "", description: "", group: "General" };
const NO_ACCESS = "You don't have permission to manage permissions";

export default function ManagePermissions() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { permissions } = useAuthContext();
  // Same permission the route requires; actions are disabled without it.
  const canManage = isDemoMode() || !!permissions?.includes("manage_permission");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const busyRef = useRef(false);

  const token = () => localStorage.getItem("token");

  const fetchPermissions = useCallback(async () => {
    const auth = token();
    if (!auth) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(`${apiUrl}/rbac/permissions`, {
        headers: { Authorization: `Bearer ${auth}` },
        withCredentials: true,
      });
      setRows(
        (data?.permissions || []).map((p, i) => ({
          id: p._id || i,
          ...p,
        }))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, navigate]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      description: row.description || "",
      group: row.group || "General",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (busyRef.current) return;
    const auth = token();
    if (!auth) return;
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = {
      name: form.name.trim().toLowerCase(),
      description: form.description,
      group: form.group,
    };
    const config = {
      headers: { Authorization: `Bearer ${auth}` },
      withCredentials: true,
    };
    busyRef.current = true;
    setSaving(true);
    try {
      if (editing) {
        await axios.patch(`${apiUrl}/rbac/permissions/${editing._id}`, payload, config);
        toast.success("Permission updated");
      } else {
        await axios.post(`${apiUrl}/rbac/permissions`, payload, config);
        toast.success("Permission created");
      }
      setDialogOpen(false);
      fetchPermissions();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (busyRef.current) return;
    const auth = token();
    if (!auth || !deleteTarget?._id) return;
    busyRef.current = true;
    setDeleting(true);
    try {
      await axios.delete(`${apiUrl}/rbac/permissions/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${auth}` },
        withCredentials: true,
      });
      toast.success("Permission deleted");
      setDeleteTarget(null);
      fetchPermissions();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      busyRef.current = false;
      setDeleting(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1.2 },
    { field: "group", headerName: "Group", flex: 0.7 },
    { field: "description", headerName: "Description", flex: 1.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Tooltip title={canManage ? "Edit" : NO_ACCESS}>
            <span>
              <IconButton
                size="small"
                color="primary"
                disabled={!canManage}
                onClick={() => openEdit(params.row)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={canManage ? "Delete" : NO_ACCESS}>
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={!canManage}
                onClick={() => setDeleteTarget(params.row)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading && rows.length === 0) return <LoadingSpinner />;

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 2 }}>
      <Box sx={{ width: { xs: "100%", sm: "95%", md: "90%" }, px: { xs: 1, sm: 0 } }}>
        <Stack spacing={2}>
          {/* Header, same as RequestPOS */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Manage Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Permissions that can be assigned to roles.
              </Typography>
            </Box>
            <Tooltip title={canManage ? "" : NO_ACCESS}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={openCreate}
                  disabled={!canManage}
                >
                  Add Permission
                </Button>
              </span>
            </Tooltip>
          </Stack>

          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
              <Box sx={gridContainerSx}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  autoHeight
                  loading={loading}
                  showToolbar
                  slots={{ toolbar: PermissionGridToolbar }}
                  pageSizeOptions={[20, 50, 100]}
                  initialState={{
                    pagination: { paginationModel: { page: 0, pageSize: 20 } },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Dialog
          open={dialogOpen}
          onClose={() => !saving && setDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>{editing ? "Edit Permission" : "Create Permission"}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Section
                step={1}
                title="Permission"
                subtitle="Identifier, group and description"
                icon={<Key sx={{ fontSize: 20 }} />}
              >
                <FieldSlot name="name">
                  <TextField
                    label="Name (snake_case)"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    disabled={!!editing}
                    required
                    helperText={editing ? "The name can't be changed" : "e.g. view_pos"}
                    fullWidth
                  />
                </FieldSlot>
                <FieldSlot name="group">
                  <TextField
                    label="Group"
                    value={form.group}
                    onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                    helperText=" "
                    fullWidth
                  />
                </FieldSlot>
                <FieldSlot name="description" full>
                  <TextField
                    label="Description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </FieldSlot>
              </Section>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" disabled={saving} onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              onClick={handleSave}
              loading={saving}
              disabled={saving || !canManage}
            >
              Save
            </LoadingButton>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!deleteTarget}
          onClose={() => !deleting && setDeleteTarget(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Delete Permission</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Delete the permission <strong>{deleteTarget?.name}</strong>? It must not be
              assigned to any role.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <LoadingButton
              color="error"
              variant="contained"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
