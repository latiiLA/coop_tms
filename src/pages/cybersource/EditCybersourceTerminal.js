import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
} from "@mui/material";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { CustomSelect } from "../../components/CustomFields";

const EditCybersourceTerminal = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  // Get row passed from previous component
  const { row } = location.state || {};

  const hasShownToast = useRef(false);

  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const cbsc_types = [
    { value: "ECOMMERCE", label: "Ecommerce" },
    { value: "AFT", label: "AFT" },
  ];

  const cbsc_status = [
    { value: "New", label: "New" },
    { value: "Active", label: "Active" },
    { value: "Deactivated", label: "Deactivated"},
  ];

  // --------------------------------------------------
  // Initial values from row
  // --------------------------------------------------

  const INITIAL_FORM_STATE = {
    merchantName: row?.merchantName || "",
    cbscMerchantID: row?.cbscMerchantID || "",
    cboMerchantID: row?.cboMerchantID || "",
    terminalID: row?.terminalID || "",
    cbsAccount: row?.cbsAccount || "",
    cbscType: row?.cbscType || "",

    // Depending on your API structure
    district:
      row?.branchID?.district?._id || "",

    branchID:
      row?.branchID?._id || "",
    status: row?.status || "",
  };

  const FORM_VALIDATION = Yup.object().shape({
    merchantName: Yup.string()
      .required("Merchant name is required")
      .min(3, "Merchant name must be at least 3 characters"),

    cbscMerchantID: Yup.string().required(
      "Cybersource merchant ID is required"
    ),

    cboMerchantID: Yup.string().required(
      "CBO merchant ID is required"
    ),

    terminalID: Yup.string().required(
      "Terminal ID is required"
    ),

    cbsAccount: Yup.string().required(
      "CBS account is required"
    ),

    cbscType: Yup.string().required(
      "Cybersource type is required"
    ),

    branchID: Yup.string().required(
      "Branch Name is required"
    ),
  });

  // --------------------------------------------------
  // Fetch districts
  // --------------------------------------------------

  useEffect(() => {
    const fetchDistricts = async () => {
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
          `${apiUrl}/district/getDistrict`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        const formattedDistricts =
          response.data.alldistricts.map((district) => ({
            value: district._id,
            label: district.districtName,
          }));

        setDistricts(formattedDistricts);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch districts"
        );
      }
    };

    fetchDistricts();
  }, [apiUrl, navigate]);

  // --------------------------------------------------
  // Set initial district from row
  // --------------------------------------------------

  useEffect(() => {
    const districtId =
      row?.branchID?.district?._id || "";

    if (districtId) {
      setSelectedDistrict(districtId);
    }
  }, [row]);

  // --------------------------------------------------
  // Fetch branches when district changes
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedDistrict) {
      setBranches([]);
      return;
    }

    const fetchBranches = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${apiUrl}/branch/getBranch`,
          {
            params: {
              districtId: selectedDistrict,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        const formattedBranches =
          response.data.branches.map((branch) => ({
            value: branch._id,
            label: branch.companyName,
          }));

        setBranches(formattedBranches);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to fetch branches"
        );
      }
    };

    fetchBranches();
  }, [selectedDistrict, apiUrl]);

  // --------------------------------------------------
  // Update terminal
  // --------------------------------------------------

  const handleSubmit = async (data, { setSubmitting }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      console.log("Updating cybersource terminal:", data);

      const response = await axios.put(
        `${apiUrl}/cybersource/editCybersourceTerminal/${row?._id}`,
        {
          merchantName: data.merchantName,
          cbscMerchantID: data.cbscMerchantID,
          cboMerchantID: data.cboMerchantID,
          terminalID: data.terminalID,
          cbsAccount: data.cbsAccount,
          cbscType: data.cbscType,
          branchID: data.branchID,
          status: data.status,
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
          "Cybersource terminal updated successfully"
      );

      console.log("Updating cybersource terminal after:", response.data.updatedTerminal);

      navigate("/cybersource/detail", { 
        state: { 
          row: response?.data?.updatedTerminal
        } 
      });
    } catch (error) {
      console.error("Error updating terminal:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update Cybersource terminal"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // No row
  // --------------------------------------------------

  if (!row) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          No terminal data was provided.
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/cybersource")}
        >
          Back
        </Button>
      </Box>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: 2,
          width: {
            xs: "100%",
            sm: "75%",
            md: "60%",
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
            handleChange,
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
                    mb: 1,
                  }}
                >
                  Edit Cybersource Terminal
                </Typography>

                {/* District */}
                <CustomSelect
                  name="district"
                  label="District"
                  options={districts}
                  value={values.district}
                  onChange={(e) => {
                    const districtId = e.target.value;

                    setFieldValue(
                      "district",
                      districtId
                    );

                    // Clear branch when district changes
                    setFieldValue("branchID", "");

                    setSelectedDistrict(
                      districtId
                    );
                  }}
                />

                {/* Branch */}
                <CustomSelect
                  name="branchID"
                  label="Branch Name"
                  options={branches}
                  value={values.branchID}
                  onChange={(e) => {
                    setFieldValue(
                      "branchID",
                      e.target.value
                    );
                  }}
                  disabled={
                    branches.length === 0
                  }
                />


                {/* Merchant Name */}
                <Field
                  as={TextField}
                  name="merchantName"
                  label="Merchant Name"
                  variant="outlined"
                  fullWidth
                  error={
                    touched.merchantName &&
                    !!errors.merchantName
                  }
                  helperText={
                    <ErrorMessage name="merchantName" />
                  }
                />

                {/* CBSC Merchant ID */}
                <Field
                  as={TextField}
                  name="cbscMerchantID"
                  label="Cybersource Merchant ID"
                  variant="outlined"
                  fullWidth
                  error={
                    touched.cbscMerchantID &&
                    !!errors.cbscMerchantID
                  }
                  helperText={
                    <ErrorMessage name="cbscMerchantID" />
                  }
                />

                {/* CBO Merchant ID */}
                <Field
                  as={TextField}
                  name="cboMerchantID"
                  label="CBO Merchant ID"
                  variant="outlined"
                  fullWidth
                  error={
                    touched.cboMerchantID &&
                    !!errors.cboMerchantID
                  }
                  helperText={
                    <ErrorMessage name="cboMerchantID" />
                  }
                />

                {/* Terminal ID */}
                <Field
                  as={TextField}
                  name="terminalID"
                  label="Terminal ID"
                  variant="outlined"
                  fullWidth
                  error={
                    touched.terminalID &&
                    !!errors.terminalID
                  }
                  helperText={
                    <ErrorMessage name="terminalID" />
                  }
                />

                {/* CBS Account */}
                <Field
                  as={TextField}
                  name="cbsAccount"
                  label="CBS Account"
                  variant="outlined"
                  fullWidth
                  error={
                    touched.cbsAccount &&
                    !!errors.cbsAccount
                  }
                  helperText={
                    <ErrorMessage name="cbsAccount" />
                  }
                />

                {/* Cybersource Type */}
                <CustomSelect
                  name="cbscType"
                  label="Cybersource Type"
                  options={cbsc_types}
                />

                {/* Status */}
                <CustomSelect
                  name="status"
                  label="Status Type"
                  options={cbsc_status}
                />

                {/* Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() =>
                      navigate("/cybersource/view")
                    }
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Updating..."
                      : "Update Cybersource Terminal"}
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

export default EditCybersourceTerminal;