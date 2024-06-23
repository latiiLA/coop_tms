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
} from "@mui/material";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";

const AddATM = () => {
  const atm_type = [
    { value: "CRM", label: "CRM" },
    { value: "NCR", label: "NCR" },
  ];
  const site = [
    { value: "ONSITE", label: "ONSITE" },
    { value: "OFFSITE", label: "OFFSITE" },
  ];
  const INITIAL_FORM_STATE = {
    type: "",
    unitId: "",
    terminalId: "",
    terminalName: "",
    branchName: "",
    acceptorLocation: "",
    site: "",
    cbsAccount: "",
    port: "",
    ipAddress: "",
  };

  const FORM_VALIDATION = Yup.object().shape({
    type: Yup.string().required("ATM Type is required"),
    unitId: Yup.string()
      .required("Unit ID is required")
      .min(3, "Unit ID must be at least 3 digit number"),

    terminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),
    terminalName: Yup.string().required("Terminal Name is required"),
    branchName: Yup.string().required("Branch Name is required"),
    acceptorLocation: Yup.string().required("Acceptor Location is required"),
    site: Yup.string().required("Termial site assignment is required"),
    cbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(
        12,
        "CBS Account must be at least 12 character: For example: ETB1000500010151"
      ),
    port: Yup.number()
      .required("Port is required")
      .min(1000, "Port must be at least 4 digit number: For example: 6800")
      .max(9999, "Port must be at least 4 digit number: For example: 6800")
      .test("is-valid-port", "Port must be a 4-digit integer", (value) => {
        if (!Number.isInteger(value)) return false; // Check if it's an integer
        if (value < 1000 || value > 9999) return false; // Check if it's a 4-digit number
        return true;
      }),
    ipAddress: Yup.string()
      .required("IP Address is required")
      .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP Address format")
      .test("is-valid-ip", "Invalid IP Address", (value) => {
        const parts = value.split(".");
        if (parts.length !== 4) return false; // Check if it has 4 parts
        return parts.every((part) => {
          const num = parseInt(part);
          return !isNaN(num) && num >= 0 && num <= 255; // Check if each part is between 0 and 255
        });
      }),
  });

  const handleSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/terminal/createTerminal",
        {
          unitId: data.unitId,
          type: data.type,
          terminalId: data.terminalId,
          terminalName: data.terminalName,
          branchName: data.branchName,
          acceptorLocation: data.acceptorLocation,
          site: data.site,
          cbsAccount: data.cbsAccount,
          port: data.port,
          ipAddress: data.ipAddress,
        }
      );

      console.log("New ATM is added:", response.data);
      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        console.error("Error adding an ATM:", error);
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
                  Add New ATM Terminal Information
                </Typography>
                <Typography variant="h6">ATM Information</Typography>
                <FormControl
                  variant="outlined"
                  fullWidth
                  error={touched.type && !!errors.type}
                >
                  <InputLabel id="type-label">ATM TYPE</InputLabel>
                  <Field
                    as={Select}
                    name="type"
                    labelId="type-label"
                    label="ATM TYPE"
                  >
                    {atm_type.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="type"
                    component="div"
                    style={{ color: "red" }}
                  />
                </FormControl>
                <Field
                  as={TextField}
                  name="unitId"
                  label="Unit ID"
                  variant="outlined"
                  fullWidth
                  error={touched.unitId && !!errors.unitId}
                  helperText={<ErrorMessage name="unitId" />}
                />
                <Field
                  as={TextField}
                  name="terminalId"
                  label="Terminal ID"
                  variant="outlined"
                  fullWidth
                  error={touched.terminalId && !!errors.terminalId}
                  helperText={<ErrorMessage name="terminalId" />}
                />
                <Field
                  as={TextField}
                  name="terminalName"
                  label="Terminal Name"
                  variant="outlined"
                  fullWidth
                  error={touched.terminalName && !!errors.terminalName}
                  helperText={<ErrorMessage name="terminalName" />}
                />
                <Field
                  as={TextField}
                  name="branchName"
                  label="Branch Name"
                  variant="outlined"
                  fullWidth
                  error={touched.branchName && !!errors.branchName}
                  helperText={<ErrorMessage name="branchName" />}
                />
                <Field
                  as={TextField}
                  name="acceptorLocation"
                  label="Acceptor Location"
                  variant="outlined"
                  fullWidth
                  error={touched.acceptorLocation && !!errors.acceptorLocation}
                  helperText={<ErrorMessage name="acceptorLocation" />}
                />
                <FormControl
                  variant="outlined"
                  fullWidth
                  error={touched.site && !!errors.site}
                >
                  <InputLabel id="site-label">Terminal Site</InputLabel>
                  <Field
                    as={Select}
                    name="site"
                    labelId="site-label"
                    label="Site"
                  >
                    {site.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="site"
                    component="div"
                    style={{ color: "red" }}
                  />
                </FormControl>
                <Field
                  as={TextField}
                  name="cbsAccount"
                  label="CBS Account"
                  variant="outlined"
                  fullWidth
                  error={touched.cbsAccount && !!errors.cbsAccount}
                  helperText={<ErrorMessage name="cbsAccount" />}
                />
                <Typography variant="h6">Config Information</Typography>
                <Field
                  as={TextField}
                  name="port"
                  label="Port"
                  variant="outlined"
                  fullWidth
                  error={touched.port && !!errors.port}
                  helperText={<ErrorMessage name="port" />}
                />
                <Field
                  as={TextField}
                  name="ipAddress"
                  label="IP Address"
                  variant="outlined"
                  fullWidth
                  error={touched.ipAddress && !!errors.ipAddress}
                  helperText={<ErrorMessage name="ipAddress" />}
                />
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

export default AddATM;
