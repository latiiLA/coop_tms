import React, { useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  Chip,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";

const PasswordEntryDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [showPassword, setShowPassword] = React.useState(false);
  // Fetched from the reveal endpoint; the entry passed through navigation no
  // longer carries the secret.
  const [serverPassword, setServerPassword] = React.useState("");
  const [passwordHistory, setPasswordHistory] = React.useState([]);
  const [revealedHistory, setRevealedHistory] = React.useState({});
  const [visibleHistory, setVisibleHistory] = React.useState({});
  const { permissions } = useAuthContext();

  const formatWhen = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatPerson = (user) => {
    if (!user) return "N/A";
    if (typeof user === "string") return user;
    const name = `${user.firstName || ""} ${user.fatherName || ""}`.trim();
    return name || user.username || "N/A";
  };

  const formatDateOnly = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const daysUntilExpiry = (value) => {
    if (!value) return null;
    const expiry = new Date(value);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.round((expiry.getTime() - today.getTime()) / 86400000);
  };

  // Row passed from PasswordVault
  const row = location.state?.row;

  // Redirect if opened directly without state
  useEffect(() => {
    if (!row) {
      toast.error("Password entry not found");
      navigate("/password");
    }
  }, [row, navigate]);

  // Reveal the password for this entry.
  useEffect(() => {
    const fetchPassword = async () => {
      if (!row?._id) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(
          `${apiUrl}/password/revealPasswordEntry/${row._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        setServerPassword(response.data?.serverPassword ?? "");
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to reveal the server password."
        );
      }
    };

    fetchPassword();
  }, [row?._id, apiUrl]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!row?._id) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(
          `${apiUrl}/password/passwordHistory/${row._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        setPasswordHistory(response.data?.history || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load password history."
        );
      }
    };

    fetchHistory();
  }, [row?._id, apiUrl]);

  const revealHistoryItem = async (historyId) => {
    if (revealedHistory[historyId] !== undefined) {
      setVisibleHistory((prev) => ({
        ...prev,
        [historyId]: !prev[historyId],
      }));
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        `${apiUrl}/password/revealPasswordHistory/${row._id}/${historyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setRevealedHistory((prev) => ({
        ...prev,
        [historyId]: response.data?.password ?? "",
      }));
      setVisibleHistory((prev) => ({ ...prev, [historyId]: true }));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reveal the previous password."
      );
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (!row) {
    return null;
  }

  const remaining = daysUntilExpiry(row.passwordExpiresOn);
  const updates = [...(row.updates || [])].reverse();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        margin: 1,
      }}
    >
      <Card
        sx={{
          p: 3,
          px: 5,
          borderRadius: 2,
          width: {
            xs: "100%",
            sm: "80%",
            md: "70%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              textAlign: "center",
              mb: 1,
            }}
          >
            Password Entry Details
          </Typography>

          {/* =====================================
              SERVER INFORMATION
          ====================================== */}

          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "column",
                md: "column",
                lg: "row",
              },
              gap: 5,
            }}
          >
            {/* LEFT SIDE */}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: {
                  md: "100%",
                  lg: "50%",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Access"
                value={row.accessKind === "web" ? "Web" : "SSH"}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />

              <TextField
                label={row.accessKind === "web" ? "Name" : "Server Name"}
                value={row.serverName || ""}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />

              {row.accessKind === "web" ? (
                <TextField
                  label="Web address"
                  value={row.webAddress || ""}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              ) : (
                <>
                  <TextField
                    label="Server IP"
                    value={row.serverIP || ""}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <TextField
                    label="Server OS"
                    value={row.serverOS || ""}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </>
              )}
            </Box>

            {/* RIGHT SIDE */}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: {
                  md: "100%",
                  lg: "50%",
                },
                gap: 2,
              }}
            >
              <TextField
                label={row.accessKind === "web" ? "Username" : "Server Username"}
                value={row.serverUsername || ""}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />

              <TextField
                label="Environment"
                value={row.environment || ""}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />

              {/* PASSWORD */}

              <FormControl
                variant="outlined"
                fullWidth
              >
                <InputLabel htmlFor="server-password">
                  {row.accessKind === "web" ? "Admin password" : "Server Password"}
                </InputLabel>

                <OutlinedInput
                  id="server-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={serverPassword}
                  readOnly
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword
                            ? "hide password"
                            : "show password"
                        }
                        onClick={
                          handleClickShowPassword
                        }
                        onMouseDown={
                          handleMouseDownPassword
                        }
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  label={row.accessKind === "web" ? "Admin password" : "Server Password"}
                />
              </FormControl>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  label="Password expires on"
                  value={
                    row.passwordExpiresOn
                      ? formatDateOnly(row.passwordExpiresOn)
                      : "Not set"
                  }
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
                {remaining !== null && remaining < 0 && (
                  <Chip label="Expired" color="error" />
                )}
                {remaining !== null && remaining >= 0 && remaining <= 5 && (
                  <Chip label="Expiring soon" color="warning" />
                )}
              </Box>
            </Box>
          </Box>


          {/* =====================================
              ASSIGNED USERS
          ====================================== */}

        {permissions?.includes("edit_password_entry") && (

          <FormControl
            component="fieldset"
            fullWidth
            sx={{ mt: 2 }}
          >
            <FormLabel component="legend">
              Assigned Users
            </FormLabel>

            <FormGroup
              sx={{
                mt: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 2,
                maxHeight: 250,
                overflowY: "auto",
              }}
            >
              {row.assignedUsers?.length > 0 ? (
                row.assignedUsers.map((user) => {
                  const userId =
                    typeof user === "object"
                      ? user._id
                      : user;

                  const username =
                    typeof user === "object"
                      ? user.username
                      : user;

                  return (
                    <FormControlLabel
                      key={userId}
                      control={
                        <Checkbox
                          checked
                          disabled
                        />
                      }
                      label={username}
                    />
                  );
                })
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No assigned users.
                </Typography>
              )}
            </FormGroup>
          </FormControl>

        )}

          {/* =====================================
              CREATED INFORMATION
          ====================================== */}

          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                md: "row",
              },
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Created By"
              value={
                row.createdBy
                  ? `${row.createdBy.firstName || ""} ${
                      row.createdBy.fatherName || ""
                    }`.trim()
                  : "N/A"
              }
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />

            <TextField
              label="Created At"
              value={formatWhen(row.createdAt)}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="h6">Update history</Typography>
            {updates.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No updates recorded yet.
              </Typography>
            ) : (
              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Updated by</TableCell>
                    <TableCell>Updated at</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {updates.map((update, index) => (
                    <TableRow key={`${update.at || "at"}-${index}`}>
                      <TableCell>{formatPerson(update.by)}</TableCell>
                      <TableCell>{formatWhen(update.at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="h6">Password history</Typography>
            {passwordHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No previous passwords.
              </Typography>
            ) : (
              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Changed by</TableCell>
                    <TableCell>Changed at</TableCell>
                    <TableCell>Password</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {passwordHistory.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.changedBy || "N/A"}</TableCell>
                      <TableCell>{formatWhen(item.changedAt)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>
                            {visibleHistory[item._id]
                              ? revealedHistory[item._id]
                              : "••••••••"}
                          </span>
                          <IconButton
                            size="small"
                            aria-label={
                              visibleHistory[item._id]
                                ? "hide previous password"
                                : "show previous password"
                            }
                            onClick={() => revealHistoryItem(item._id)}
                          >
                            {visibleHistory[item._id] ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>


          {/* =====================================
              BUTTONS
          ====================================== */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default PasswordEntryDetails;
