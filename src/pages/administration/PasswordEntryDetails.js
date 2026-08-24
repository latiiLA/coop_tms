import React, { useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";

const PasswordEntryDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = React.useState(false);
  const { permissions } = useAuthContext();

  // Row passed from PasswordVault
  const row = location.state?.row;

  // Redirect if opened directly without state
  useEffect(() => {
    if (!row) {
      toast.error("Password entry not found");
      navigate("/password");
    }
  }, [row, navigate]);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (!row) {
    return null;
  }

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
                label="Server Name"
                value={row.serverName || ""}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />

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
                label="Server Username"
                value={row.serverUsername || ""}
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
                  Server Password
                </InputLabel>

                <OutlinedInput
                  id="server-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={row.serverPassword || ""}
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
                  label="Server Password"
                />
              </FormControl>
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
              value={
                row.createdAt
                  ? new Date(
                      row.createdAt
                    ).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : ""
              }
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
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