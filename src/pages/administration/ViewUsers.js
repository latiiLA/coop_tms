import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { LockOpen, Search } from "@mui/icons-material";
import LoadingSpinner from "../../components/LoadingSpinner";
import { isDemoMode } from "../../demo/demoApi";
import { gridContainerSx, PermissionGridToolbar } from "../../components/gridStyles";

// Mirrors the department list on CreateUser.
const DEPARTMENT_OPTIONS = [
  { value: "digital banking", label: "Digital Banking" },
  { value: "monitoring", label: "Monitoring" },
  {
    value: "Merchant/Agent Growth and Support",
    label: "Merchant/Agent Growth and Support",
  },
  {
    value: "Accounts and Finance Team",
    label: "Accounts and Finance Team",
  },
];

// The fields CreateUser collects, minus password. Password changes stay on the
// Reset Password action (its own permission), so editing a profile can never be
// used to sign in as the user being edited.
const EMPTY_EDIT_FORM = {
  firstName: "",
  fatherName: "",
  gfatherName: "",
  email: "",
  department: "",
  username: "",
  roleId: "",
};

const EDIT_FORM_TEXT_FIELDS = [
  { name: "firstName", label: "First Name" },
  { name: "fatherName", label: "Father Name" },
  { name: "gfatherName", label: "Grand Father Name" },
  { name: "email", label: "Email", type: "email" },
  { name: "username", label: "Username" },
];

export default function ViewUsers() {
  const navigate = useNavigate();
  const { permissions, currentUser } = useAuthContext();
  const can = (perm) => isDemoMode() || permissions?.includes(perm);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataRows, setDataRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [savingRole, setSavingRole] = useState(false);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [resetRow, setResetRow] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetting, setResetting] = useState(false);
  const [issuedPassword, setIssuedPassword] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  // Roles this signed-in user may assign (rank ceiling from DB).
  const actorRank =
    roleOptions.find(
      (r) =>
        r.name === currentUser?.role ||
        String(r._id) === String(currentUser?.roleId)
    )?.rank ?? 0;
  const assignableRoles = roleOptions.filter(
    (option) => (option.rank ?? 0) <= actorRank
  );

  // District + role lists for the edit dialog.
  useEffect(() => {
    const fetchMeta = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const [districtRes, rolesRes] = await Promise.all([
          axios.get(`${apiUrl}/district/getDistrict`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${apiUrl}/rbac/roles?lean=true`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
        ]);
        setDistrictOptions(
          (districtRes.data.alldistricts || []).map((district) => ({
            value: district._id,
            label: district.districtName,
          }))
        );
        setRoleOptions(
          (rolesRes.data.roles || []).map((r) => ({
            _id: r._id,
            value: r._id,
            name: r.name,
            label: r.displayName || r.name,
            rank: r.rank ?? 0,
            requiresDistrict: !!r.requiresDistrict,
          }))
        );
      } catch (error) {
        // Lists are only needed for edit dialog; ignore failures here.
      }
    };
    fetchMeta();
  }, [apiUrl]);

  // State to store the name of the user who created the terminal
  // const [createdByName, setCreatedByName] = useState("default");
  // const handleUsersName = async (userId) => {
  //   const token = localStorage.getItem("token");

  //   if (!token) {
  //     toast.error("User is not authenticated");
  //     navigate("/home");
  //     return null; // Exit the function if no token is found
  //   }

  //   try {
  //     const apiUrl = process.env.REACT_APP_API_URL;
  //     const response = await axios.get(
  //       `${apiUrl}/auth/getUsersName`, // Use the correct endpoint
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //         params: { userId }, // Pass userId as a query parameter
  //         withCredentials: true,
  //       }
  //     );
  //     return response.data.usersName; // Return the fetched user's name
  //   } catch (error) {
  //     if (error.response?.data?.message) {
  //       toast.error(error.response.data.message);
  //     } else {
  //       toast.error(error.message);
  //     }

  //     return null; // Signal failure with a return value
  //   }
  // };
  // useEffect(() => {
  //   const fetchCreatedByName = async () => {
  //     console.log("from row", dataRows);
  //     const userName = await handleUsersName(dataRows.createdBy);
  //     console.log("username after fetch", userName);
  //     setCreatedByName(userName);
  //   };

  //   fetchCreatedByName();
  // }, [handleUsersName]);

  const handleClickOpen = (rowId) => {
    setSelectedRowId(rowId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRowId(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRowId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }
    try {
      await axios.patch(
        `${apiUrl}/auth/deleteUser/${selectedRowId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const updatedData = await fetchRows();
      setDataRows(updatedData);

      handleClose();
      toast.success("User successfully deleted.");
    } catch (error) {
      // console.error("Error deleting user:", error);
      toast.error(error.response.data.message);
      handleClose();
    }
  };

  const handleReset = async (rowId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not an authenticated user.");
      navigate("/home");
      return;
    }
    try {
      await axios.patch(
        `${apiUrl}/auth/resetCount/${rowId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const updatedData = await fetchRows();
      setDataRows(updatedData);
      toast.success("Password count is successfully reset.");
    } catch (error) {
      // console.error("Error resetting wrong password count", error);
      toast.error("Error: while resetting wrong password count.");
    }
  };

  const handleResetPassword = (rowId) => {
    setResetRow(dataRows.find((r) => r._id === rowId) || { _id: rowId });
    setResetPasswordValue("");
    setIssuedPassword("");
  };

  const handleResetClose = () => {
    setResetRow(null);
    setResetPasswordValue("");
    setIssuedPassword("");
  };

  const submitResetPassword = async () => {
    const rowId = resetRow?._id;
    if (!rowId) return;
    const typed = resetPasswordValue.trim();
    if (typed && typed.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not an authenticated user.");
      navigate("/home");
      return;
    }
    setResetting(true);
    try {
      const response = await axios.patch(
        `${apiUrl}/auth/resetPassword/${rowId}`,
        typed ? { password: typed } : {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setIssuedPassword(response.data?.temporaryPassword || typed);
      const updatedData = await fetchRows();
      setDataRows(updatedData);
      toast.success("Password reset is successful.");
    } catch (error) {
      // console.error("Error resetting user password:", error);
      toast.error(
        error.response?.data?.message || "Error: while resetting user password."
      );
    } finally {
      setResetting(false);
    }
  };

  const buildEditForm = (row) => ({
    firstName: row.firstName || "",
    fatherName: row.fatherName || "",
    gfatherName: row.gfatherName || "",
    email: row.email || "",
    department: row.department || "",
    username: row.username || "",
    roleId: row.roleId
      ? String(row.roleId._id || row.roleId)
      : roleOptions.find((r) => r.name === row.role)?._id || "",
    district: row.district ? String(row.district._id || row.district) : "",
  });

  const handleEditOpen = (row) => {
    setEditRow(row);
    setEditForm(buildEditForm(row));
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setEditRow(null);
    setEditForm({ ...EMPTY_EDIT_FORM, district: "" });
    setSavingRole(false);
  };

  const handleEditFieldChange = (field) => (event) => {
    setEditForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const selectedEditRole = roleOptions.find(
    (r) => String(r._id) === String(editForm.roleId)
  );

  const handleEditSave = async () => {
    if (!editRow) return;

    // Every field is required on the model, so catch blanks up front rather
    // than bouncing off the validator.
    const requiredFields = selectedEditRole?.requiresDistrict
      ? Object.keys(EMPTY_EDIT_FORM).filter((f) => f !== "department")
      : Object.keys(EMPTY_EDIT_FORM);
    const missing = requiredFields.filter(
      (field) => !String(editForm[field] || "").trim()
    );
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    if (selectedEditRole?.requiresDistrict && !editForm.district) {
      toast.error("Please select a district for district roles.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    setSavingRole(true);
    try {
      const response = await axios.patch(
        `${apiUrl}/auth/updateUser/${editRow._id}`,
        {
          ...editForm,
          department: selectedEditRole?.requiresDistrict
            ? ""
            : editForm.department,
          district: selectedEditRole?.requiresDistrict
            ? editForm.district
            : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const updatedData = await fetchRows();
      setDataRows(updatedData);
      handleEditClose();
      toast.success(response.data.message || "User updated successfully.");
    } catch (error) {
      // The server refuses a self-change, a target or role above the caller's
      // own, and a duplicate email/username, and says which; surface that
      // rather than a generic failure.
      toast.error(
        error.response?.data?.message || "Error: while updating the user."
      );
      setSavingRole(false);
    }
  };

  // A Select needs a matching option for its value even when the value sits
  // outside the list - an older department string, or a role above the
  // caller's ceiling.
  const withCurrentOption = (options, value) =>
    value && !options.some((option) => option.value === value)
      ? [{ value, label: value }, ...options]
      : options;

  const dialogRoleOptions = withCurrentOption(
    assignableRoles,
    editForm.roleId
  );
  const dialogDepartmentOptions = withCurrentOption(
    DEPARTMENT_OPTIONS,
    editForm.department
  );

  const editDirty =
    !!editRow &&
    (Object.keys(EMPTY_EDIT_FORM).some((field) => {
      if (field === "roleId") {
        const original =
          editRow.roleId
            ? String(editRow.roleId._id || editRow.roleId)
            : roleOptions.find((r) => r.name === editRow.role)?._id || "";
        return String(editForm.roleId || "") !== String(original || "");
      }
      return editForm[field] !== (editRow[field] || "");
    }) ||
      String(editForm.district || "") !==
        String(editRow.district?._id || editRow.district || ""));

  // console.log("created by", createdByName);

  const columns = [
    { field: "id", headerName: "No", flex: 0.1 },
    { field: "username", headerName: "Username", flex: 0.4 },
    {
      field: "fullName",
      headerName: "Full name",
      sortable: false,
      valueGetter: (value, row) =>
        `${row.firstName || ""} ${row.fatherName || ""} ${
          row.gfatherName || ""
        }`,
      flex: 0.6,
    },
    { field: "department", headerName: "Department", flex: 0.4 },
    { field: "role", headerName: "Role", flex: 0.4 },
    { field: "createdBy", headerName: "createdBy", flex: 0.3 },
    { field: "createdAt", headerName: "Date Created", flex: 0.5,
      valueFormatter: (value) => {
        if (!value) return "";
        const date = new Date(value);
        return date.toLocaleString("en-US", 
          { 
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit", 
          });
      },
    },
    { field: "status", headerName: "Status", flex: 0.3 },
    { field: "wrongPasswordCount", headerName: "WrongPwd", flex: 0.3 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.4,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "100%", // Ensure the Box takes the full height of the cell
            // width: "100%",
            margin: "auto",
          }}
        >
          {can("edit_user_role") &&
            params.row._id !== currentUser?.id &&
            (can("super_access") ||
              (roleOptions.find((r) => r.name === params.row.role)?.rank ??
                0) < actorRank) && (
            <Tooltip title="Edit User">
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleEditOpen(params.row)}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {can("unlock_account") && (
            <Tooltip title="Reset Password Count">
              <IconButton
                color="primary"
                size="small"
                onClick={() => handleReset(params.row._id)}
                margin="auto"
              >
                <LockOpen />
              </IconButton>
            </Tooltip>
          )}

          {can("reset_password") && (
              <Tooltip title="Reset Password">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleResetPassword(params.row._id)}
                >
                  <LockResetIcon />
                </IconButton>
              </Tooltip>
          )}
          {can("delete_user") && (
              <Tooltip title="Delete User">
                <IconButton
                  color="secondary"
                  size="small"
                  onClick={() => handleClickOpen(params.row._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  async function fetchRows() {
    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return [];
    }
    try {
      const response = await axios.get(`${apiUrl}/auth/getUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data.users;
    } catch (error) {
      // console.error("Error fetching data:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
      return [];
    }
  }

  useEffect(() => {
    async function loadRows() {
      try {
        const data = await fetchRows();
        setDataRows(data);
      } catch (error) {
        // console.error("Error fetching data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = dataRows.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

  const filteredRows = rows.filter((row) => {
    const searchLower = searchText.toLowerCase();

    return (
      String(row.username || "").toLowerCase().includes(searchLower) ||
      String(row.firstName || "").toLowerCase().includes(searchLower) ||
      String(row.fatherName || "").toLowerCase().includes(searchLower) ||
      String(row.gfatherName || "").toLowerCase().includes(searchLower) ||
      String(row.department || "").toLowerCase().includes(searchLower) ||
      String(row.role || "").toLowerCase().includes(searchLower) ||
      String(row.status || "").toLowerCase().includes(searchLower)
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
          Users
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
        sx={gridContainerSx}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          showToolbar
          slots={{ toolbar: PermissionGridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 15 },
            },
          }}
          pageSizeOptions={[15, 30, 50]}
          autoHeight
          checkboxSelection
        />
      </Box>
      <Dialog open={openEdit} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {editRow
              ? `Editing ${editRow.firstName || editRow.username || "user"}.`
              : ""}
          </DialogContentText>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              mt: 1,
            }}
          >
            {EDIT_FORM_TEXT_FIELDS.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.type || "text"}
                size="small"
                fullWidth
                value={editForm[field.name]}
                onChange={handleEditFieldChange(field.name)}
              />
            ))}
            {!selectedEditRole?.requiresDistrict && (
              <FormControl fullWidth size="small">
                <InputLabel id="edit-department-label">Department</InputLabel>
                <Select
                  labelId="edit-department-label"
                  label="Department"
                  value={editForm.department}
                  onChange={handleEditFieldChange("department")}
                >
                  {dialogDepartmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth size="small">
              <InputLabel id="edit-role-label">Role</InputLabel>
              <Select
                labelId="edit-role-label"
                label="Role"
                value={editForm.roleId}
                onChange={handleEditFieldChange("roleId")}
              >
                {dialogRoleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedEditRole?.requiresDistrict && (
              <FormControl fullWidth size="small">
                <InputLabel id="edit-district-label">District</InputLabel>
                <Select
                  labelId="edit-district-label"
                  label="District"
                  value={editForm.district || ""}
                  onChange={handleEditFieldChange("district")}
                >
                  {withCurrentOption(districtOptions, editForm.district).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            color="primary"
            variant="contained"
            disabled={savingRole || !editDirty}
          >
            {savingRole ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(resetRow)} onClose={handleResetClose} fullWidth maxWidth="xs">
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {issuedPassword ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                The password for {resetRow?.username || "this user"} has been reset.
                Share it securely; they must change it at next login.
              </DialogContentText>
              <TextField
                fullWidth
                label="New password"
                value={issuedPassword}
                InputProps={{ readOnly: true }}
              />
              <Button
                sx={{ mt: 1 }}
                onClick={() => {
                  navigator.clipboard?.writeText(issuedPassword);
                  toast.success("Password copied.");
                }}
              >
                Copy
              </Button>
            </>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Assign a password for {resetRow?.username || "this user"}, or leave it
                empty to generate a random one. The user must change it at next login.
              </DialogContentText>
              <TextField
                fullWidth
                label="Password (optional)"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                helperText="At least 8 characters"
                autoComplete="new-password"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {issuedPassword ? (
            <Button onClick={handleResetClose}>Done</Button>
          ) : (
            <>
              <Button onClick={handleResetClose} disabled={resetting}>
                Cancel
              </Button>
              <Button
                onClick={submitResetPassword}
                variant="contained"
                disabled={resetting}
              >
                {resetting ? <CircularProgress size={20} /> : "Reset Password"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
