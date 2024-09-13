import React, { useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  Grid,
  Divider,
} from "@mui/material";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BugReport, Build } from "@mui/icons-material";
import { useTheme } from "@emotion/react";

const Feedback = () => {
  const navigate = useNavigate();
  const hasShownToast = useRef(false);
  const theme = useTheme();

  // Initial form states
  const INITIAL_FORM_STATE = {
    bugDescription: "",
    steps: "",
    expectedBehaviour: "",
  };

  const INITIAL_FORM_STATE2 = {
    service: "",
    feedback: "",
    expectedResult: "",
  };

  // Validation schemas
  const FORM_VALIDATION = Yup.object().shape({
    bugDescription: Yup.string().required("Bug description is required"),
    steps: Yup.string().required("Steps to reproduce the issue are required"),
    expectedBehaviour: Yup.string().required("Expected behaviour is required"),
  });

  const FORM_VALIDATION2 = Yup.object().shape({
    service: Yup.string().required("Service type is required"),
    feedback: Yup.string().required("Service feedback is required"),
    expectedResult: Yup.string().required("Expected result is required"),
  });

  // Generic submit handler
  const handleSubmit = async (data, endpoint, { resetForm }) => {
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
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(
        `${apiUrl}/feedback/${endpoint}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      resetForm();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          width: { xs: "100%", sm: "100%", md: "90%" },
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "center", mb: 3 }}>
          Send Feedback
        </Typography>

        <Grid container spacing={1}>
          {/* Bug Feedback Form */}
          <Grid item xs={12} md={5.5}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Report a Bug
                <BugReport
                  sx={{
                    fontSize: 30,
                    color: theme.palette.primary.main,
                    mr: 1,
                  }}
                />
              </Typography>
              <Formik
                initialValues={INITIAL_FORM_STATE}
                validationSchema={FORM_VALIDATION}
                onSubmit={(values, formikHelpers) =>
                  handleSubmit(values, "bug", formikHelpers)
                }
              >
                {({ errors, touched }) => (
                  <Form>
                    <Field
                      as={TextField}
                      multiline
                      rows={4}
                      name="bugDescription"
                      label="Bug Description"
                      variant="standard"
                      fullWidth
                      error={touched.bugDescription && !!errors.bugDescription}
                      helperText={<ErrorMessage name="bugDescription" />}
                      sx={{ mb: 2 }}
                    />
                    <Field
                      as={TextField}
                      multiline
                      rows={4}
                      name="steps"
                      label="Steps to Reproduce"
                      variant="standard"
                      fullWidth
                      error={touched.steps && !!errors.steps}
                      helperText={<ErrorMessage name="steps" />}
                      sx={{ mb: 2 }}
                    />
                    <Field
                      as={TextField}
                      multiline
                      rows={4}
                      name="expectedBehaviour"
                      label="Expected Behaviour"
                      variant="standard"
                      fullWidth
                      error={
                        touched.expectedBehaviour && !!errors.expectedBehaviour
                      }
                      helperText={<ErrorMessage name="expectedBehaviour" />}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" type="submit" fullWidth>
                      Submit Bug Report
                    </Button>
                  </Form>
                )}
              </Formik>
            </Box>
          </Grid>

          {/* Vertical Divider */}
          <Grid
            item
            xs={12}
            md={1}
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Divider orientation="vertical" sx={{ height: "100%" }} />
          </Grid>

          {/* Service Improvement Form */}
          <Grid item xs={12} md={5.5}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, display: "flex", alignItems: "center" }}
              >
                Suggest an Improvement
                <Build
                  sx={{
                    fontSize: 30,
                    color: theme.palette.secondary.main,
                    mr: 1,
                    height: "100%",
                  }}
                />
              </Typography>
              <Formik
                initialValues={INITIAL_FORM_STATE2}
                validationSchema={FORM_VALIDATION2}
                onSubmit={(values, formikHelpers) =>
                  handleSubmit(values, "feedback", formikHelpers)
                }
              >
                {({ errors, touched }) => (
                  <Form>
                    <Field
                      as={TextField}
                      multiline
                      rows={4}
                      name="service"
                      label="Service"
                      variant="standard"
                      fullWidth
                      error={touched.service && !!errors.service}
                      helperText={<ErrorMessage name="service" />}
                      sx={{ mb: 2 }}
                    />
                    <Field
                      as={TextField}
                      multiline
                      rows={4}
                      name="feedback"
                      label="Service Feedback"
                      variant="standard"
                      fullWidth
                      error={touched.feedback && !!errors.feedback}
                      helperText={<ErrorMessage name="feedback" />}
                      sx={{ mb: 2 }}
                    />
                    <Field
                      as={TextField}
                      multiline
                      rows={4}
                      name="expectedResult"
                      label="Expected Result"
                      variant="standard"
                      fullWidth
                      error={touched.expectedResult && !!errors.expectedResult}
                      helperText={<ErrorMessage name="expectedResult" />}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" type="submit" fullWidth>
                      Submit Feedback
                    </Button>
                  </Form>
                )}
              </Formik>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default Feedback;
