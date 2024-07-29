import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  OutlinedInput,
  FilledInput,
} from "@mui/material";

import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { role, setRole } = useAuthContext();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const [showPassword2, setShowPassword2] = React.useState(false);
  const handleClickShowPassword2 = () => setShowPassword2((show) => !show);

  const handleMouseDownPassword2 = (event) => {
    event.preventDefault();
  };
  const [showPassword3, setShowPassword3] = React.useState(false);
  const handleClickShowPassword3 = () => setShowPassword3((show) => !show);

  const handleMouseDownPassword3 = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (update_data) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/login");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8000/auth/forgotPassword",
        {
          password: update_data.password,
          newPassword: update_data.newPassword,
          confirmNewPassword: update_data.confirmNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("Forgot password is successful:", response.data);

      const data = response.data; // updated to directly access response data

      if (data.error) {
        throw new Error(data.error);
      }
      // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", data, data.data.status);

      // // Store the token in localStorage
      // const token = response.data.token; // Adjust this line based on your JSON structure
      // localStorage.setItem("token", token);
      // setRole(data.data.role);
      // if (data.data.status === "New") {
      //   navigate("/forgotpassword");
      // } else {

      toast.success("password changed successfully.");
      navigate("/home");
      // }
    } catch (error) {
      console.error("Error changing password in:", error);
      toast.error(
        `Login Error: ${error.response?.data?.message || error.message}`
      );
      // setRole(null);
      // navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const INITIAL_FORM_STATE = {
    password: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const FORM_VALIDATION = Yup.object().shape({
    password: Yup.string().required("Current password is required"),
    newPassword: Yup.string().required("New password is required"),
    confirmNewPassword: Yup.string().required(
      "Confirm new password is required"
    ),
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: 2,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          width: { xs: "100%", sm: "75%", md: "60%" },
        }}
      >
        <Formik
          initialValues={INITIAL_FORM_STATE}
          validationSchema={FORM_VALIDATION}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h5" sx={{ textAlign: "center" }}>
                  Update password
                </Typography>

                <FormControl
                  variant="outlined"
                  error={touched.password && !!errors.password}
                  fullWidth
                >
                  <InputLabel htmlFor="outlined-adornment-password">
                    Current Password
                  </InputLabel>
                  <Field
                    as={OutlinedInput}
                    id="outlined-adornment-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Current Password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    style={{ color: "red" }}
                  />
                </FormControl>

                <FormControl
                  variant="outlined"
                  error={touched.newPassword && !!errors.newPassword}
                  fullWidth
                >
                  <InputLabel htmlFor="outlined-adornment-password2">
                    New Password
                  </InputLabel>
                  <Field
                    as={OutlinedInput}
                    id="outlined-adornment-password2"
                    type={showPassword2 ? "text" : "password"}
                    name="newPassword"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword2}
                          onMouseDown={handleMouseDownPassword2}
                          edge="end"
                        >
                          {showPassword2 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="New Password"
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    style={{ color: "red" }}
                  />
                </FormControl>
                <FormControl
                  variant="outlined"
                  error={touched.newPassword && !!errors.newPassword}
                  fullWidth
                >
                  <InputLabel htmlFor="outlined-adornment-password3">
                    Confirm New Password
                  </InputLabel>
                  <Field
                    as={OutlinedInput}
                    id="outlined-adornment-password3"
                    type={showPassword3 ? "text" : "password"}
                    name="confirmNewPassword"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword3}
                          onMouseDown={handleMouseDownPassword3}
                          edge="end"
                        >
                          {showPassword3 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Confirm New Password"
                  />
                  <ErrorMessage
                    name="confirmNewPassword"
                    component="div"
                    style={{ color: "red" }}
                  />
                </FormControl>

                <Button variant="contained" type="submit">
                  Submit
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
