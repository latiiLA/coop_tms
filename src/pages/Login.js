import React, { useState } from "react";
import left_image2 from "../assets/login.avif";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Card,
  CardMedia,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import coop from "../assets/coop.gif";
import { Lock, Person } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import { AppProvider } from "@toolpad/core/AppProvider";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  DEMO_PASSWORD,
  DEMO_USERNAME,
  demoLogin,
  isDemoMode,
} from "../demo/demoApi";

const Login = () => {
  const INITIAL_FORM_STATE = {
    username: "",
    password: "",
  };

  const FORM_VALIDATION = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const navigate = useNavigate();
  const { setRole, setPermissions, setCurrentUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (user_data) => {
    const apiUrl = process.env.REACT_APP_API_URL;

    setLoading(true);

    try {
      let data;
      if (isDemoMode()) {
        data = await demoLogin(user_data.username, user_data.password);
      } else {
        const response = await axios.post(
          `${apiUrl}/auth/loginUser`,
          {
            username: user_data.username,
            password: user_data.password,
          },
          { withCredentials: true }
        );
        data = response.data;
      }

      if (!data.token) {
        throw new Error("Authentication token was not returned.");
      }

      const token = data.token;

      // Store only the JWT
      localStorage.setItem("token", token);

      // Decode JWT for frontend state
      const decoded = jwtDecode(token);

      const user = {
        id: decoded.user._id || decoded.user.id,
        role: decoded.user?.role || decoded.role,
        status: decoded.user.status,
        firstName: decoded.user.firstName,
        fatherName: decoded.user.fatherName,
        username: decoded.user.username,
        district: decoded.user.district || null,
        permissions: decoded.permissions || [],
      };

      // Update AuthContext
      setCurrentUser(user);
      setRole(user.role);
      setPermissions(user.permissions);

      if (user.status === "New") {
        navigate("/changepassword");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        `Login Error: ${
          error.response?.data?.message || error.message
        }`
      );

      setCurrentUser(null);
      setRole(null);
      setPermissions([]);

      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppProvider>
      {/* minHeight (not height) so the page scrolls instead of clipping when
          the mobile keyboard opens. */}
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 980,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            display: "grid",
            // Image above the form on mobile, beside it from md up.
            gridTemplateAreas: { xs: '"media" "form"', md: '"media form"' },
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          <CardMedia
            image={left_image2}
            alt=""
            sx={{
              gridArea: "media",
              // Capped on mobile so the artwork never pushes the form off
              // screen; fills the row from md up.
              height: { xs: 132, sm: 168, md: "100%" },
              minHeight: { md: 480 },
              objectFit: "cover",
            }}
          />

          <Box
            sx={{
              gridArea: "form",
              p: { xs: 3, sm: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Formik
              initialValues={INITIAL_FORM_STATE}
              validationSchema={FORM_VALIDATION}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form
                  noValidate
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  <Stack alignItems="center" spacing={1}>
                    {/* Wide (300x122) transparent logo: show it whole, never
                        squeezed into a square, on a light backing in dark mode. */}
                    <Box
                      component="img"
                      src={coop}
                      alt="Cooperative Bank of Oromia"
                      sx={(theme) => ({
                        display: "block",
                        width: { xs: 180, sm: 220 },
                        maxWidth: "100%",
                        height: "auto",
                        objectFit: "contain",
                        borderRadius: 2,
                        p: 1,
                        bgcolor:
                          theme.palette.mode === "dark" ? "common.white" : "transparent",
                      })}
                    />
                    <Typography variant="h4" fontWeight={700}>
                      TMS
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      Login
                    </Typography>
                    {isDemoMode() && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center" }}
                      >
                        Demo: {DEMO_USERNAME} / {DEMO_PASSWORD}
                      </Typography>
                    )}
                  </Stack>

                  <Stack spacing={2}>
                    <Field
                      as={TextField}
                      name="username"
                      label="Username"
                      variant="outlined"
                      fullWidth
                      autoFocus
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      error={touched.username && !!errors.username}
                      helperText={<ErrorMessage name="username" />}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Field
                      as={TextField}
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      variant="outlined"
                      fullWidth
                      autoComplete="current-password"
                      error={touched.password && !!errors.password}
                      helperText={<ErrorMessage name="password" />}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
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
                        ),
                      }}
                    />
                  </Stack>

                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    loading={loading}
                    loadingPosition="center"
                  >
                    Login
                  </LoadingButton>
                </Form>
              )}
            </Formik>
          </Box>
        </Card>
      </Box>
    </AppProvider>
  );
};

export default Login;