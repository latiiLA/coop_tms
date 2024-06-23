import React from "react";
import { Box, TextField, Typography, Button, Card } from "@mui/material";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";

const Edit = () => {
  const INITIAL_FORM_STATE = {
    unitId: "",
    terminalId: "",
    terminalName: "",
    branchName: "",
    acceptorLocation: "",
    cbsAccount: "",
    port: "",
    ipAddress: "",
  };

  const FORM_VALIDATION = Yup.object().shape({
    unitId: Yup.number()
      .required("Unit ID is required")
      .min(3, "Unit ID must be at least 3 digit number"),
    terminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),
    terminalName: Yup.string().required("Terminal Name is required"),
    branchName: Yup.string().required("Branch Name is required"),
    acceptorLocation: Yup.string().required("Acceptor Location is required"),
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
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          width: { xs: "100%", sm: "75%", md: "60%" },
        }}
      >
        <Formik
          initialValues={INITIAL_FORM_STATE}
          validationSchema={FORM_VALIDATION}
          onSubmit={(values) => {
            console.log(values);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h5" sx={{ textAlign: "center" }}>
                  Add New ATM Terminal Information
                </Typography>
                <Typography variant="h6">ATM Information</Typography>
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

export default Edit;
