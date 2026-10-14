import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
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

// Mirrors ROLE_RANK in coop_tms_server/Controllers/userController.js. The server
// enforces the ceiling on its own; this copy only keeps unusable options out of
// the dropdown so the UI never offers a role the API will reject.
const ROLE_RANK = {
  user: 1,
  posuser: 2,
  posauthorizer: 3,
  posadmin: 4,
  admin: 5,
  useradmin: 5,
  superadmin: 6,
  supersuperadmin: 7,
};

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "posuser", label: "POS User" },
  { value: "posauthorizer", label: "POS Request Authorizer" },
  { value: "posadmin", label: "POS Admin" },
  { value: "admin", label: "Admin" },
  { value: "useradmin", label: "User Admin" },
  { value: "superadmin", label: "Superadmin" },
  { value: "supersuperadmin", label: "Super Super Admin" },
];

export default function ViewUsers() {
  const navigate = useNavigate();
  const { permissions, currentUser } = useAuthContext();
  const can = (perm) => isDemoMode() || permissions?.includes(perm);

  // The roles this signed-in user is allowed to hand out. Anyone holding
  // edit_user_role can assign up to their own level, never above it.
  const actorRank = ROLE_RANK[currentUser?.role] ?? 0;
  const assignableRoles = ROLE_OPTIONS.filter(
    (option) => ROLE_RANK[option.value] <= actorRank
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataRows, setDataRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

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

  const handleResetPassword = async (rowId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not an authenticated user.");
      navigate("/home");
      return;
    }
    try {
      await axios.patch(
        `${apiUrl}/auth/resetPassword/${rowId}`,
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
      toast.success("Password reset is successfull.");
    } catch (error) {
      // console.error("Error resetting user password:", error);
      toast.error("Error: while resetting user password.");
    }
  };

  const handleEditOpen = (row) => {
    setEditRow(row);
    setEditRole(row.role || "");
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setEditRow(null);
    setEditRole("");
    setSavingRole(false);
  };

  const handleRoleSave = async () => {
    if (!editRow) return;

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
        { role: editRole },
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
      toast.success(
        response.data.message || "User role updated successfully."
      );
    } catch (error) {
      // The server refuses a role above the caller's own, or a self-change, and
      // says which; surface that rather than a generic failure.
      toast.error(
        error.response?.data?.message || "Error: while updating user role."
      );
      setSavingRole(false);
    }
  };

  // The current role is always offered so the Select has a matching value, even
  // in the rare case it sits above the caller's ceiling.
  const dialogRoleOptions = assignableRoles.some(
    (option) => option.value === editRow?.role
  )
    ? assignableRoles
    : [
        ...ROLE_OPTIONS.filter((option) => option.value === editRow?.role),
        ...assignableRoles,
      ];

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
          {can("edit_user_role") && params.row._id !== currentUser?.id && (
            <Tooltip title="Edit Role">
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
        sx={{
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
          },
          margin: 1,
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          showToolbar
          slots={{ toolbar: GridToolbar }}
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
      <Dialog open={openEdit} onClose={handleEditClose} fullWidth maxWidth="xs">
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {editRow
              ? `Change the role for ${
                  editRow.firstName || editRow.username || "this user"
                }.`
              : ""}
          </DialogContentText>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel id="edit-role-label">Role</InputLabel>
            <Select
              labelId="edit-role-label"
              label="Role"
              value={editRole}
              onChange={(event) => setEditRole(event.target.value)}
            >
              {dialogRoleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleRoleSave}
            color="primary"
            variant="contained"
            disabled={savingRole || !editRole || editRole === editRow?.role}
          >
            {savingRole ? <CircularProgress size={18} /> : "Save"}
          </Button>
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
