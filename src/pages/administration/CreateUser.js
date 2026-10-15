import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  Divider,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Visibility,
  VisibilityOff,
  PersonAddAlt1,
  Badge,
  AdminPanelSettings,
  Key,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const DEPARTMENTS = [
  { value: "digital banking", label: "Digital Banking" },
  { value: "monitoring", label: "Monitoring" },
  { value: "Merchant/Agent Growth and Support", label: "Merchant/Agent Growth and Support" },
  { value: "Accounts and Finance Team", label: "Accounts and Finance Team" },
];

const INITIAL_FORM_STATE = {
  firstName: "",
  fatherName: "",
  gfatherName: "",
  email: "",
  roleId: "",
  department: "",
  district: "",
  username: "",
  password: "",
};

const buildValidation = (roles) =>
  Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .required("First name is required")
      .min(3, "First name must be at least 3 characters"),
    fatherName: Yup.string().trim().required("Father name is required"),
    gfatherName: Yup.string().trim().required("Grandfather name is required"),
    email: Yup.string()
      .trim()
      .email("Invalid email")
      .required("Email is required"),
    roleId: Yup.string().required("Role is required"),
    district: Yup.string().when("roleId", {
      is: (roleId) =>
        !!roles.find((r) => r._id === roleId)?.requiresDistrict,
      then: (schema) =>
        schema.required("District is required for district roles"),
      otherwise: (schema) => schema.notRequired(),
    }),
    department: Yup.string().when("roleId", {
      is: (roleId) =>
        !roles.find((r) => r._id === roleId)?.requiresDistrict,
      then: (schema) => schema.required("Department is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    username: Yup.string().trim().required("Username is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
  });

const Section = ({ icon, title, subtitle, children }) => (
  <Box sx={{ mb: 1 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
      {icon}
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
    </Box>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {subtitle}
      </Typography>
    )}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        columnGap: 2,
        rowGap: 0.5,
        mt: subtitle ? 0 : 1,
      }}
    >
      {children}
    </Box>
  </Box>
);

const CreateUser = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [roles, setRoles] = useState([]);
  const hasShownToast = useRef(false);
  const apiUrl = process.env.REACT_APP_API_URL;

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
        setDistricts(
          (districtRes.data.alldistricts || []).map((district) => ({
            value: district._id,
            label: district.districtName,
          }))
        );
        setRoles(
          (rolesRes.data.roles || []).map((r) => ({
            _id: r._id,
            name: r.name,
            label: r.displayName || r.name,
            requiresDistrict: !!r.requiresDistrict,
            rank: r.rank ?? 0,
          }))
        );
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    };
    fetchMeta();
  }, [apiUrl]);

  const handleSubmit = async (data, { resetForm, setSubmitting }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      if (!hasShownToast.current) {
        toast.error("User is not authenticated");
        hasShownToast.current = true;
      }
      navigate("/home");
      return;
    }
    const selected = roles.find((r) => r._id === data.roleId);
    const districtUser = !!selected?.requiresDistrict;
    try {
      const response = await axios.post(
        `${apiUrl}/auth/createUser`,
        {
          firstName: data.firstName.trim(),
          fatherName: data.fatherName.trim(),
          gfatherName: data.gfatherName.trim(),
          email: data.email.trim(),
          roleId: data.roleId,
          // A district user belongs to a district, not a department.
          department: districtUser ? undefined : data.department,
          district: districtUser ? data.district : undefined,
          username: data.username.trim(),
          password: data.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      resetForm();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: { xs: 1, md: 2 } }}>
      <Card sx={{ width: "100%", maxWidth: 900, borderRadius: 2, overflow: "hidden" }}>
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <PersonAddAlt1 color="primary" fontSize="large" />
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Add New User
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the details below to create an account.
            </Typography>
          </Box>
        </Box>

        <Formik
          initialValues={INITIAL_FORM_STATE}
          validationSchema={buildValidation(roles)}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            setFieldTouched,
            isSubmitting,
            submitCount,
            resetForm,
          }) => {
            const selectedRole = roles.find((r) => r._id === values.roleId);
            const districtUser = !!selectedRole?.requiresDistrict;
            const fieldProps = (name) => ({
              name,
              value: values[name],
              onChange: handleChange,
              onBlur: handleBlur,
              fullWidth: true,
              error: Boolean(touched[name] && errors[name]),
              helperText: touched[name] && errors[name] ? errors[name] : " ",
            });
            const errorCount = Object.keys(errors).length;

            const onRoleChange = (e) => {
              const next = e.target.value;
              setFieldValue("roleId", next);
              const nextRole = roles.find((r) => r._id === next);
              if (nextRole?.requiresDistrict) {
                setFieldValue("department", "");
                setFieldTouched("department", false, false);
              } else {
                setFieldValue("district", "");
                setFieldTouched("district", false, false);
              }
            };

            return (
              <Form noValidate>
                <Box sx={{ px: { xs: 2, md: 4 }, pt: 2 }}>
                  {submitCount > 0 && errorCount > 0 && (
                    <Alert severity="error" sx={{ mb: 1.5 }}>
                      Please fix {errorCount} field{errorCount > 1 ? "s" : ""} below.
                    </Alert>
                  )}

                  <Section
                    icon={<Badge color="action" />}
                    title="Personal information"
                  >
                    <TextField label="First name" {...fieldProps("firstName")} />
                    <TextField label="Father name" {...fieldProps("fatherName")} />
                    <TextField label="Grandfather name" {...fieldProps("gfatherName")} />
                    <TextField label="Email" type="email" {...fieldProps("email")} />
                  </Section>

                  <Divider sx={{ mb: 1.5 }} />

                  <Section
                    icon={<AdminPanelSettings color="action" />}
                    title="Access"
                    subtitle={
                      districtUser
                        ? "District users only see and act on their own district's POS data, so they have no department."
                        : "Head-office users belong to a department."
                    }
                  >
                    <TextField
                      select
                      label="Role"
                      {...fieldProps("roleId")}
                      onChange={onRoleChange}
                    >
                      {roles.length === 0 && (
                        <MenuItem disabled value="">
                          Loading roles...
                        </MenuItem>
                      )}
                      {roles.map((option) => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    {districtUser ? (
                      <TextField select label="District" {...fieldProps("district")}>
                        {districts.length === 0 && (
                          <MenuItem disabled value="">
                            No districts found
                          </MenuItem>
                        )}
                        {districts.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField select label="Department" {...fieldProps("department")}>
                        {DEPARTMENTS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Section>

                  <Divider sx={{ mb: 1.5 }} />

                  <Section icon={<Key color="action" />} title="Login credentials">
                    <TextField
                      label="Username"
                      autoComplete="off"
                      {...fieldProps("username")}
                    />
                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...fieldProps("password")}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword((s) => !s)}
                              onMouseDown={(e) => e.preventDefault()}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Section>
                </Box>

                <Box
                  sx={{
                    px: { xs: 2, md: 4 },
                    py: 1.25,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1.5,
                    borderTop: 1,
                    borderColor: "divider",
                    bgcolor: "action.hover",
                  }}
                >
                  <Button
                    variant="outlined"
                    disabled={isSubmitting}
                    onClick={() => resetForm()}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? <CircularProgress size={18} color="inherit" /> : <PersonAddAlt1 />
                    }
                  >
                    {isSubmitting ? "Creating..." : "Create user"}
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      </Card>
    </Box>
  );
};

export default CreateUser;
