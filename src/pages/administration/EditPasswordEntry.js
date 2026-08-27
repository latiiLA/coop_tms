import React, { useEffect, useRef, useState } from "react";
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
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CustomSelect } from "../../components/CustomFields";

const EditPasswordEntry = () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const hasShownToast = useRef(false);

  // ============================================
  // Row passed from PasswordVault
  // ============================================

  const row = location.state?.row;

  // ============================================
  // Password visibility
  // ============================================

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const environment = [
    { value: "production", label: "Production" },
    { value: "test", label: "Test" },
  ];

  // ============================================
  // Redirect if no row was passed
  // ============================================

  useEffect(() => {
    if (!row) {
      toast.error("Password entry not found");
      navigate("/password");
    }
  }, [row, navigate]);

  // ============================================
  // Fetch ALL users
  // Same logic as CreatePasswordEntry
  // ============================================

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!hasShownToast.current) {
          toast.error("User is not authenticated");
          hasShownToast.current = true;
        }

        navigate("/home");
        return;
      }

      try {
        const response = await axios.get(
          `${apiUrl}/auth/getUser`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        console.log("Users:", response.data.users);

        setUsers(response.data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch users."
        );

        navigate("/home");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [apiUrl, navigate]);

  // ============================================
  // Current assigned user IDs
  //
  // row.assignedUsers can be:
  //
  // [
  //   { _id: "...", username: "john" },
  //   { _id: "...", username: "admin" }
  // ]
  //
  // Convert them to:
  //
  // ["id1", "id2"]
  // ============================================

  const assignedUserIds =
    row?.assignedUsers?.map((user) =>
      typeof user === "object"
        ? user._id
        : user
    ) || [];

  // ============================================
  // Initial Formik values
  // ============================================

  const INITIAL_FORM_STATE = {
    serverName: row?.serverName || "",
    serverIP: row?.serverIP || "",
    serverOS: row?.serverOS || "",
    environment: row?.environment || "",
    serverUsername: row?.serverUsername || "",
    serverPassword: row?.serverPassword || "",
    assignedUsers: assignedUserIds,
  };

  // ============================================
  // Validation
  // ============================================

  const FORM_VALIDATION = Yup.object().shape({
    serverName: Yup.string()
      .required("Server Name is required")
      .min(
        3,
        "Server Name must be at least 3 characters"
      ),

    serverIP: Yup.string()
      .required("Server IP Address is required")
      .matches(
        /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
        "Invalid IP Address format"
      )
      .test(
        "is-valid-ip",
        "Invalid IP Address",
        (value) => {
          if (!value) return false;

          const parts = value.split(".");

          if (parts.length !== 4) {
            return false;
          }

          return parts.every((part) => {
            const num = parseInt(part, 10);

            return (
              !isNaN(num) &&
              num >= 0 &&
              num <= 255
            );
          });
        }
      ),

    serverOS: Yup.string().required(
      "Server OS is required"
    ),

    serverOS: Yup.string().required(
      "Environment is required"
    ),

    serverUsername: Yup.string().required(
      "Server Username is required"
    ),

    serverPassword: Yup.string().required(
      "Server Password is required"
    ),

    assignedUsers: Yup.array()
      .min(
        1,
        "At least one assigned user is required"
      )
      .required(
        "At least one assigned user is required"
      ),
  });

  // ============================================
  // Submit
  // ============================================

  const handleSubmit = async (
    values,
    { setSubmitting }
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    if (!row?._id) {
      toast.error("Password entry ID is missing");
      return;
    }

    console.log(
      "Updated password entry:",
      values
    );

    try {
      const response = await axios.put(
        `${apiUrl}/password/editPasswordEntry/${row._id}`,
        {
          serverName: values.serverName,
          serverIP: values.serverIP,
          serverOS: values.serverOS,
          environment: values.environment,
          serverUsername: values.serverUsername,
          serverPassword: values.serverPassword,
          assignedUsers: values.assignedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(
        response.data.message ||
          "Password entry updated successfully."
      );

      navigate("/password/vault");
    } catch (error) {
      console.error(
        "Error updating password entry:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update password entry."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // No row
  // ============================================

  if (!row) {
    return null;
  }

  // ============================================
  // UI
  // ============================================

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
        <Formik
          initialValues={INITIAL_FORM_STATE}
          validationSchema={FORM_VALIDATION}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            errors,
            touched,
            values,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form>
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
                  }}
                >
                  Edit Password Entry
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
                  {/* LEFT */}

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
                    <Field
                      as={TextField}
                      name="serverName"
                      label="Server Name"
                      variant="outlined"
                      fullWidth
                      error={
                        touched.serverName &&
                        !!errors.serverName
                      }
                      helperText={
                        <ErrorMessage name="serverName" />
                      }
                    />

                    <Field
                      as={TextField}
                      name="serverIP"
                      label="Server IP"
                      variant="outlined"
                      fullWidth
                      error={
                        touched.serverIP &&
                        !!errors.serverIP
                      }
                      helperText={
                        <ErrorMessage name="serverIP" />
                      }
                    />

                    <Field
                      as={TextField}
                      name="serverOS"
                      label="Server OS"
                      variant="outlined"
                      fullWidth
                      error={
                        touched.serverOS &&
                        !!errors.serverOS
                      }
                      helperText={
                        <ErrorMessage name="serverOS" />
                      }
                    />
                  </Box>

                  {/* RIGHT */}

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
                    <Field
                      as={TextField}
                      name="serverUsername"
                      label="Server Username"
                      variant="outlined"
                      fullWidth
                      error={
                        touched.serverUsername &&
                        !!errors.serverUsername
                      }
                      helperText={
                        <ErrorMessage name="serverUsername" />
                      }
                    />

                    <CustomSelect
                        name="environment"
                        label="Environment"
                        options={environment}
                    />

                    {/* PASSWORD */}

                    <FormControl
                      variant="outlined"
                      fullWidth
                      error={
                        touched.serverPassword &&
                        !!errors.serverPassword
                      }
                    >
                      <InputLabel htmlFor="server-password">
                        Server Password
                      </InputLabel>

                      <Field
                        as={OutlinedInput}
                        id="server-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="serverPassword"
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

                      <ErrorMessage
                        name="serverPassword"
                        component="div"
                        style={{
                          color: "red",
                          marginTop: "4px",
                        }}
                      />
                    </FormControl>
                  </Box>
                </Box>

                {/* =====================================
                    ASSIGNED USERS
                ====================================== */}

                <FormControl
                  component="fieldset"
                  fullWidth
                  sx={{ mt: 2 }}
                  error={
                    touched.assignedUsers &&
                    !!errors.assignedUsers
                  }
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
                    {loadingUsers ? (
                      <Typography>
                        Loading users...
                      </Typography>
                    ) : users.length === 0 ? (
                      <Typography
                        color="text.secondary"
                      >
                        No users found.
                      </Typography>
                    ) : (
                      users.map((user) => (
                        <FormControlLabel
                          key={user._id}
                          control={
                            <Checkbox
                              checked={values.assignedUsers.includes(
                                user._id
                              )}
                              onChange={(event) => {
                                const userId =
                                  user._id;

                                if (
                                  event.target.checked
                                ) {
                                  setFieldValue(
                                    "assignedUsers",
                                    [
                                      ...values.assignedUsers,
                                      userId,
                                    ]
                                  );
                                } else {
                                  setFieldValue(
                                    "assignedUsers",
                                    values.assignedUsers.filter(
                                      (id) =>
                                        id !== userId
                                    )
                                  );
                                }
                              }}
                            />
                          }
                          label={user.username}
                        />
                      ))
                    )}
                  </FormGroup>

                  <ErrorMessage
                    name="assignedUsers"
                    component="div"
                    style={{
                      color: "red",
                      marginTop: "4px",
                    }}
                  />
                </FormControl>

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
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{
                      width: {
                        lg: "25%",
                      },
                    }}
                  >
                    {isSubmitting
                      ? "Updating..."
                      : "Update Password Entry"}
                  </Button>
                </Box>
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default EditPasswordEntry;