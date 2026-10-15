import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Badge, Delete, Edit, ExpandMore, VpnKey } from "@mui/icons-material";
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

const emptyForm = {
  name: "",
  displayName: "",
  description: "",
  rank: 1,
  isProtected: false,
  permissions: [],
};
const NO_ACCESS = "You don't have permission to manage roles";

// Why a role can't be deleted ("" when it can).
const deleteBlockReason = (row) => {
  if (row?.name === "supersuperadmin") return "The super admin role can't be deleted";
  if (row?.isSystem) return "System roles can't be deleted";
  return "";
};

export default function ManageRoles() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const { permissions } = useAuthContext();
  // Same permission the route requires; actions are disabled without it.
  const canManage = isDemoMode() || !!permissions?.includes("manage_role");

  const [rows, setRows] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const busyRef = useRef(false);

  const token = () => localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    const auth = token();
    if (!auth) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${auth}` },
        withCredentials: true,
      };
      const [rolesRes, permsRes] = await Promise.all([
        axios.get(`${apiUrl}/rbac/roles`, config),
        axios.get(`${apiUrl}/rbac/permissions`, config),
      ]);
      setRows(
        (rolesRes.data?.roles || []).map((r, i) => ({
          id: r._id || i,
          ...r,
        }))
      );
      setAllPermissions(permsRes.data?.permissions || []);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const permissionsByGroup = useMemo(() => {
    const map = {};
    for (const p of allPermissions) {
      const g = p.group || "General";
      if (!map[g]) map[g] = [];
      map[g].push(p);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      displayName: row.displayName || "",
      description: row.description || "",
      rank: row.rank ?? 1,
      isProtected: !!row.isProtected,
      permissions: [...(row.permissions || [])],
    });
    setDialogOpen(true);
  };

  const togglePermission = (name) => {
    setForm((f) => {
      const has = f.permissions.includes(name);
      return {
        ...f,
        permissions: has
          ? f.permissions.filter((p) => p !== name)
          : [...f.permissions, name],
      };
    });
  };

  const toggleGroup = (groupPerms, checked) => {
    const names = groupPerms.map((p) => p.name);
    setForm((f) => {
      const without = f.permissions.filter((p) => !names.includes(p));
      return {
        ...f,
        permissions: checked ? [...without, ...names] : without,
      };
    });
  };

  const handleSave = async () => {
    if (busyRef.current) return;
    const auth = token();
    if (!auth) return;
    if (!form.displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    const payload = {
      name: form.name || form.displayName,
      displayName: form.displayName.trim(),
      description: form.description,
      rank: Number(form.rank) || 1,
      isProtected: !!form.isProtected,
      permissions: form.permissions,
    };
    const config = {
      headers: { Authorization: `Bearer ${auth}` },
      withCredentials: true,
    };
    busyRef.current = true;
    setSaving(true);
    try {
      if (editing) {
        await axios.patch(`${apiUrl}/rbac/roles/${editing._id}`, payload, config);
        toast.success("Role updated");
      } else {
        await axios.post(`${apiUrl}/rbac/roles`, payload, config);
        toast.success("Role created");
      }
      setDialogOpen(false);
      fetchData();
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
      await axios.delete(`${apiUrl}/rbac/roles/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${auth}` },
        withCredentials: true,
      });
      toast.success("Role deleted");
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      busyRef.current = false;
      setDeleting(false);
    }
  };

  const columns = [
    { field: "displayName", headerName: "Display Name", flex: 1 },
    { field: "name", headerName: "Slug", flex: 0.8 },
    { field: "rank", headerName: "Rank", flex: 0.4 },
    {
      field: "permCount",
      headerName: "Permissions",
      flex: 0.5,
      valueGetter: (_v, row) => row.permissions?.length || 0,
    },
    {
      field: "isSystem",
      headerName: "System",
      flex: 0.4,
      valueGetter: (_v, row) => (row.isSystem ? "Yes" : "No"),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.6,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: (params) => {
        const blocked = deleteBlockReason(params.row);
        return (
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
            <Tooltip title={!canManage ? NO_ACCESS : blocked || "Delete"}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={!canManage || !!blocked}
                  onClick={() => setDeleteTarget(params.row)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  if (loading && rows.length === 0) return <LoadingSpinner />;

  const isSuper = editing?.name === "supersuperadmin";
  const iconSx = { fontSize: 20 };

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
                Manage Roles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Roles group permissions and are assigned to users.
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
                  Add Role
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
          maxWidth="md"
        >
          <DialogTitle>{editing ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Section
                step={1}
                title="Role"
                subtitle="Name, rank and protection"
                icon={<Badge sx={iconSx} />}
              >
                <FieldSlot name="displayName">
                  <TextField
                    label="Display Name"
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                    helperText=" "
                    fullWidth
                    required
                  />
                </FieldSlot>
                <FieldSlot name="name">
                  <TextField
                    label="Slug (optional)"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    disabled={!!editing?.isSystem || isSuper}
                    helperText="Lowercase identifier, e.g. posadmin"
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
                    helperText=" "
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </FieldSlot>
                <FieldSlot name="rank">
                  <TextField
                    label="Rank"
                    type="number"
                    value={form.rank}
                    onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value }))}
                    disabled={isSuper}
                    helperText=" "
                    fullWidth
                  />
                </FieldSlot>
                <FieldSlot name="isProtected">
                  <FormControlLabel
                    sx={{ mt: 1 }}
                    control={
                      <Checkbox
                        checked={form.isProtected}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, isProtected: e.target.checked }))
                        }
                        disabled={isSuper}
                      />
                    }
                    label="Protected account role"
                  />
                </FieldSlot>
              </Section>

              <Section
                step={2}
                title={`Permissions (${form.permissions.length})`}
                subtitle="Tick a group to select all of its permissions"
                icon={<VpnKey sx={iconSx} />}
              >
                <FieldSlot name="permissions" full>
                  <Box sx={{ maxHeight: 420, overflow: "auto" }}>
                    {permissionsByGroup.map(([group, perms]) => {
                      const allChecked = perms.every((p) =>
                        form.permissions.includes(p.name)
                      );
                      return (
                        <Accordion key={group} disableGutters variant="outlined">
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <FormControlLabel
                              onClick={(e) => e.stopPropagation()}
                              control={
                                <Checkbox
                                  checked={allChecked}
                                  indeterminate={
                                    !allChecked &&
                                    perms.some((p) => form.permissions.includes(p.name))
                                  }
                                  onChange={(e) => toggleGroup(perms, e.target.checked)}
                                />
                              }
                              label={`${group} (${perms.length})`}
                            />
                          </AccordionSummary>
                          <AccordionDetails>
                            <FormGroup
                              sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                columnGap: 2,
                                alignItems: "start",
                              }}
                            >
                              {perms.map((p) => (
                                <FormControlLabel
                                  key={p._id || p.name}
                                  control={
                                    <Checkbox
                                      checked={form.permissions.includes(p.name)}
                                      onChange={() => togglePermission(p.name)}
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography variant="body2">{p.name}</Typography>
                                      {p.description ? (
                                        <Typography variant="caption" color="text.secondary">
                                          {p.description}
                                        </Typography>
                                      ) : null}
                                    </Box>
                                  }
                                />
                              ))}
                            </FormGroup>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Box>
                </FieldSlot>
              </Section>
            </Stack>
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
          <DialogTitle>Delete Role</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              Delete the role{" "}
              <strong>{deleteTarget?.displayName || deleteTarget?.name}</strong>? It must not
              be assigned to any users.
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
