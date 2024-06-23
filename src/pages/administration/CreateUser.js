import React from "react";
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
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { Password, Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateUser = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const INITIAL_FORM_STATE = {
    firstName: "",
    fatherName: "",
    gfatherName: "",
    email: "",
    department: "",
    role: "",
    username: "",
    password: "",
  };

  const FORM_VALIDATION = Yup.object().shape({
    firstName: Yup.string()
      .required("First Name is required")
      .min(3, "First Name must be at least 3 characters"),
    fatherName: Yup.string().required("Father Name is required"),
    gfatherName: Yup.string().required("Grand Father Name is required"),
    email: Yup.string().email("Invalid Email").required("Email is required"),
    department: Yup.string().required("Department is required"),
    role: Yup.string().required("Role is required"),
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });
  const role = [
    { value: "editor", label: "Editor" },
    { value: "viewer", label: "Viewer" },
    // Add more options as needed
  ];

  const department = [
    { value: "digital banking", label: "Digital Banking" },
    { value: "monitoring", label: "Monitoring" },
    // Add more options as needed
  ];

  const handleSubmit = async (data) => {
    console.log("handle submit", data.firstName);
    try {
      const response = await axios.post(
        "http://localhost:8000/auth/createUser",
        {
          firstName: data.firstName,
          fatherName: data.fatherName,
          gfatherName: data.gfatherName,
          email: data.email,
          department: data.department,
          role: data.role,
          username: data.username,
          password: data.password,
        }
      );
      console.log("New user is created:", response.data);
      toast.success(response.data.message);
      // setfirstName("");
      // setlastName("");
      // setEmail("");
      // setPassword("");
      // setconfirmPassword("");
      // navigate("/login");
      // You can redirect the user to the newly created post or update the post list
    } catch (error) {
      console.error("Error creating a user:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        console.error("Error adding an user:", error);
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
        // alignItems: "center",
        // marginTop: 8,
      }}
    >
      <Card
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          // border: "2px solid #dee2e6",
          borderRadius: 2,
          // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
                  Add New User
                </Typography>
                <Typography variant="h6">User Information</Typography>
                <Field
                  as={TextField}
                  name="firstName"
                  label="First Name"
                  variant="outlined"
                  fullWidth
                  error={touched.firstName && !!errors.firstName}
                  helperText={<ErrorMessage name="firstName" />}
                />
                <Field
                  as={TextField}
                  name="fatherName"
                  label="Father Name"
                  variant="outlined"
                  fullWidth
                  error={touched.fatherName && !!errors.fatherName}
                  helperText={<ErrorMessage name="fatherName" />}
                />

                <Field
                  as={TextField}
                  name="gfatherName"
                  label="GrandFather Name"
                  variant="outlined"
                  fullWidth
                  error={touched.gfatherName && !!errors.gfatherName}
                  helperText={<ErrorMessage name="gfatherName" />}
                />
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  variant="outlined"
                  fullWidth
                  error={touched.email && !!errors.email}
                  helperText={<ErrorMessage name="email" />}
                />

                <FormControl
                  variant="outlined"
                  fullWidth
                  error={touched.department && !!errors.department}
                >
                  <InputLabel id="department-label">Department</InputLabel>
                  <Field
                    as={Select}
                    name="department"
                    labelId="department-label"
                    label="Department"
                    // helperText={<ErrorMessage name="role" />}
                  >
                    {department.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="department"
                    component="div"
                    style={{ color: "red" }}
                  />
                </FormControl>

                <FormControl
                  variant="outlined"
                  fullWidth
                  error={touched.role && !!errors.role}
                >
                  <InputLabel id="role-label">Role</InputLabel>
                  <Field
                    as={Select}
                    name="role"
                    labelId="role-label"
                    label="Role"
                    // helperText={<ErrorMessage name="role" />}
                  >
                    {role.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="role"
                    component="div"
                    style={{ color: "red" }}
                  />
                </FormControl>

                <Typography variant="h6">Login Information</Typography>
                <Field
                  as={TextField}
                  name="username"
                  label="Username"
                  variant="outlined"
                  fullWidth
                  error={touched.username && !!errors.username}
                  helperText={<ErrorMessage name="username" />}
                />
                {/* <Field
                  as={TextField}
                  name="password"
                  label="Password"
                  variant="outlined"
                  type="password"
                  fullWidth
                /> */}
                <FormControl
                  variant="outlined"
                  error={touched.password && !!errors.password}
                  fullWidth
                >
                  <InputLabel htmlFor="outlined-adornment-password">
                    Password
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
                    label="Password"
                  />
                  <ErrorMessage
                    name="password"
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

export default CreateUser;
