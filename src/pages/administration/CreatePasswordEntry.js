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
import { Search, Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CustomSelect } from "../../components/CustomFields";

const userMatchesQuery = (user, query) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [user.username, user.firstName, user.fatherName, user.gfatherName, user.email]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(needle);
};

const userLabel = (user) =>
  [user.username, [user.firstName, user.fatherName].filter(Boolean).join(" ")].filter(Boolean).join(" — ");

const CreatePasswordEntry = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const hasShownToast = useRef(false); // Use ref to track if the toast has been shown

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  
  const [, setError] = useState(null);
  const [dataRows, setDataRows] = useState([]); // user data
  const [, setLoading] = useState(true);
  const [userQuery, setUserQuery] = useState("");


  const environment = [
    { value: "production", label: "Production" },
    { value: "test", label: "Test" },
  ];

  const accessKinds = [
    { value: "ssh", label: "SSH" },
    { value: "web", label: "Web" },
  ];

  const ipSchema = Yup.string()
    .required("Server IP Address is required")
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP Address format")
    .test("is-valid-ip", "Invalid IP Address", (value) => {
      if (!value) return false;
      const parts = value.split(".");
      if (parts.length !== 4) return false;
      return parts.every((part) => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255;
      });
    });

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

  const visibleUsers = dataRows.filter((user) => userMatchesQuery(user, userQuery));

  const INITIAL_FORM_STATE = {
    accessKind: "ssh",
    serverName: "",
    serverIP: "",
    serverOS: "",
    webAddress: "",
    environment: "",
    serverUsername: "",
    serverPassword: "",
    passwordExpiresOn: "",
    assignedUsers: [],
  };

  const FORM_VALIDATION = Yup.object().shape({
    serverName: Yup.string()
      .required("Server Name is required")
      .min(3, "Server Name must be at least 3 characters"),
    accessKind: Yup.string().oneOf(["ssh", "web"]).required("Access type is required"),
    serverIP: Yup.string().when("accessKind", {
      is: "web",
      then: (schema) => schema.notRequired(),
      otherwise: () => ipSchema,
    }),
    serverOS: Yup.string().when("accessKind", {
      is: "web",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required("Server OS is required"),
    }),
    webAddress: Yup.string().when("accessKind", {
      is: "web",
      then: (schema) => schema.trim().required("Web address is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    environment: Yup.string().required("Environment is required"),
    serverUsername: Yup.string().required("Server Username is required"),
    serverPassword: Yup.string().required("Server Password is required"),
    passwordExpiresOn: Yup.string(),
    assignedUsers: Yup.array().required("Atleast one assigned user is required")
  });

  const handleSubmit = async (data, { resetForm }) => {
    // console.log("handle submit", data.firstName);
    const token = localStorage.getItem("token");
    if (!token) {
      // console.error("No authentication token found");
      if (!hasShownToast.current) {
        toast.error("User is not authenticated");
        hasShownToast.current = true;
      }
      navigate("/home");
      return; // Exit the fun
      // ction if no token is found
    }
    console.log("data for password entry", data)
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(
        `${apiUrl}/password/createPasswordEntry`,
        {
          accessKind: data.accessKind,
          serverName: data.serverName,
          serverIP: data.serverIP,
          serverOS: data.serverOS,
          webAddress: data.webAddress,
          environment: data.environment,
          serverUsername: data.serverUsername,
          serverPassword: data.serverPassword,
          passwordExpiresOn: data.passwordExpiresOn,
          assignedUsers: data.assignedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

    //   console.log("New password entry is created:", response.data);
      resetForm();
      toast.success(response.data.message);
    } catch (error) {
      // console.error("Error creating a password entry:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        // console.error("Error adding an user:", error);
        toast.error(error.message);
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        margin: 1,
      }}
    >
      <Card
        sx={{
          p: 3,
          px: 5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: 2,
          width: { xs: "100%", sm: "80%", md: "70%" },
        }}
      >
        <Formik
          initialValues={INITIAL_FORM_STATE}
          validationSchema={FORM_VALIDATION}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers);
          }}
        >
          {({ errors, touched, resetForm, values, setFieldValue }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h5" sx={{ textAlign: "center" }}>
                  New Password Entry
                </Typography>
                <CustomSelect
                  name="accessKind"
                  label="Access"
                  options={accessKinds}
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: {xs: "column", sm: "column", md: "column", lg: "row"},
                    gap: 5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: {md: "100%", lg: "50%"},
                      gap: 2,
                    }}
                  >
                    <Field
                      as={TextField}
                      name="serverName"
                      label={values.accessKind === "web" ? "Name" : "Server Name"}
                      variant="outlined"
                      fullWidth
                      error={touched.serverName && !!errors.serverName}
                      helperText={<ErrorMessage name="serverName" />}
                    />
                    {values.accessKind === "web" ? (
                      <Field
                        as={TextField}
                        name="webAddress"
                        label="Web address"
                        variant="outlined"
                        fullWidth
                        error={touched.webAddress && !!errors.webAddress}
                        helperText={<ErrorMessage name="webAddress" />}
                      />
                    ) : (
                      <>
                        <Field
                          as={TextField}
                          name="serverIP"
                          label="Server IP"
                          variant="outlined"
                          fullWidth
                          error={touched.serverIP && !!errors.serverIP}
                          helperText={<ErrorMessage name="serverIP" />}
                        />
                        <Field
                          as={TextField}
                          name="serverOS"
                          label="Server OS"
                          variant="outlined"
                          fullWidth
                          error={touched.serverOS && !!errors.serverOS}
                          helperText={<ErrorMessage name="serverOS" />}
                        />
                      </>
                    )}
                  </Box>
                  
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: {md: "100%", lg: "50%"},
                      gap: 2,
                    }}
                  >

                    {/* <Typography variant="h6">Login Information</Typography> */}
                    <Field
                      as={TextField}
                      name="serverUsername"
                      label={values.accessKind === "web" ? "Username" : "Server Username"}
                      variant="outlined"
                      fullWidth
                      error={touched.serverUsername && !!errors.serverUsername}
                      helperText={<ErrorMessage name="serverUsername" />}
                    />
                    <CustomSelect
                        name="environment"
                        label="Environment"
                        options={environment}
                    />
                    <FormControl
                      variant="outlined"
                      error={touched.serverPassword && !!errors.serverPassword}
                      fullWidth
                    >
                      <InputLabel htmlFor="outlined-adornment-password">
                        {values.accessKind === "web" ? "Admin password" : "Server Password"}
                      </InputLabel>
                      <Field
                        as={OutlinedInput}
                        id="outlined-adornment-password"
                        type={showPassword ? "text" : "password"}
                        name="serverPassword"
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
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
                        label={values.accessKind === "web" ? "Admin password" : "Server Password"}
                      />
                      <ErrorMessage
                        name="serverPassword"
                        component="div"
                        style={{ color: "red" }}
                      />
                    </FormControl>
                    <Field
                      as={TextField}
                      name="passwordExpiresOn"
                      label="Password expires on"
                      type="date"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      helperText="Optional. Leave blank if this password does not expire."
                    />
                  </Box>
                </Box>
                <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                    <FormLabel component="legend">
                        Assigned Users
                    </FormLabel>
                    <TextField
                      value={userQuery}
                      onChange={(event) => setUserQuery(event.target.value)}
                      label="Search users"
                      size="small"
                      fullWidth
                      sx={{ mt: 1 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />

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
                        {visibleUsers.map((user) => (
                        <FormControlLabel
                            key={user._id}
                            control={
                            <Checkbox
                                checked={values.assignedUsers.includes(user._id)}
                                onChange={(event) => {
                                const userId = user._id;

                                if (event.target.checked) {
                                    setFieldValue("assignedUsers", [
                                    ...values.assignedUsers,
                                    userId,
                                    ]);
                                } else {
                                    setFieldValue(
                                    "assignedUsers",
                                    values.assignedUsers.filter(
                                        (id) => id !== userId
                                    )
                                    );
                                }
                                }}
                            />
                            }
                            label={userLabel(user)}
                        />
                        ))}
                        {dataRows.length > 0 && visibleUsers.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No users match your search.
                          </Typography>
                        )}
                    </FormGroup>
                </FormControl>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ width: {lg:"25%"}, margin: "auto" }}
                >
                  Add Password Entry
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default CreatePasswordEntry;
