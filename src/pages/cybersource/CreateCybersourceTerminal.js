import React, { useEffect, useRef, useState } from "react";
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
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { CustomSelect } from "../../components/CustomFields";

const CreateCybersourceTerminal = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const hasShownToast = useRef(false); // Use ref to track if the toast has been shown

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  
  const [error, setError] = useState(null);
  const { role, permissions } = useAuthContext();
  const [loading, setLoading] = useState(true);

  const cbsc_types = [
    { value: "ECOMMERCE", label: "Ecommerce" },
    { value: "AFT", label: "AFT"},
  ];


  const INITIAL_FORM_STATE = {
    merchantName: "",
    cbscMerchantID: "",
    cboMerchantID: "",
    terminalID: "",
    cbsAccount: "",
    cbscType: "",
    branchID: ""
  };

  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const FORM_VALIDATION = Yup.object().shape({
    merchantName: Yup.string()
      .required("Merchant name is required")
      .min(3, "Merchant name must be at least 3 characters"),
    cbscMerchantID: Yup.string().required("Cybersource merchant ID is required"),
    cboMerchantID: Yup.string().required("CBO merchant ID is required"),
    terminalID: Yup.string().required("Terminal ID is required"),
    cbsAccount: Yup.string().required("CBS account  is required"),
    cbscType: Yup.string().required("Cybersource type is required"),
    branchID: Yup.string().required("Branch Name is required")
  });

  const handleSubmit = async (data, { resetForm, validateForm, handleChange }) => {
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
    console.log("data for cybersource terminal", data)
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(
        `${apiUrl}/cybersource/createCybersourceTerminal`,
        {
          merchantName: data.merchantName,
          cbscMerchantID: data.cbscMerchantID,
          cboMerchantID: data.cboMerchantID,
          terminalID: data.terminalID,
          cbsAccount: data.cbsAccount,
          cbscType: data.cbscType,
          branchID: data.branchID,
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

    useEffect(() => {
      const fetchRows = async () => {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.REACT_APP_API_URL;
  
        if (!token) {
          toast.error("User is not authenticated");
          navigate("/home");
          return;
        }
  
        try {
          const response = await axios.get(`${apiUrl}/district/getDistrict`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
  
          console.log("API Response:", response.data); // Log the response
  
          const formattedDistricts = response.data.alldistricts.map(
            (district) => ({
              value: district._id,
              label: district.districtName.toString(),
            })
          );
          setDistricts(formattedDistricts);
          console.log("Formatted Districts:", formattedDistricts);
        } catch (error) {
          console.log("Error Details:", error); // Log the error
          toast.error(`Error: ${error.response?.data?.message || error.message}`);
          navigate("/home");
        }
      };
  
      fetchRows();
    }, [navigate]);
  
    useEffect(() => {
      console.log("selectedDistrict", selectedDistrict);
      if (selectedDistrict) {
        const fetchBranches = async () => {
          const token = localStorage.getItem("token");
          const apiUrl = process.env.REACT_APP_API_URL;
          try {
            const response = await axios.get(`${apiUrl}/branch/getBranch`, {
              params: { districtId: selectedDistrict },
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            });
            setBranches(
              response.data.branches.map((branch) => ({
                value: branch._id,
                label: branch.companyName,
              }))
            );
          } catch (error) {
            toast.error(
              `Error fetching branches: ${
                error.response?.data?.message || error.message
              }`
            );
          }
        };
        fetchBranches();
      } else {
        setBranches([]);
      }
    }, [selectedDistrict]);

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
          width: { xs: "100%", sm: "75%", md: "60%" },
        }}
      >
        <Formik
          initialValues={{
            ...INITIAL_FORM_STATE,
            branchID: INITIAL_FORM_STATE?.branchID?._id,
            district: INITIAL_FORM_STATE?.branchID?.district?._id,
          }}
          validationSchema={FORM_VALIDATION}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers);
          }}
          validateOnChange
          validateOnBlur
          validateOnMount
        >
          {({ errors, touched, resetForm, values, setFieldValue, handleChange, validateForm, }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h5" sx={{ textAlign: "center" }}>
                  New Cybersource Terminal
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: {xs: "column", sm: "column", md: "column", lg: "column"},
                    gap: 1,
                  }}
                >
                                    <CustomSelect
                    name="district"
                    label="District"
                    options={districts}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedDistrict(e.target.value);
                      setBranches([]);
                      validateForm();
                    }}
                  />

                  <CustomSelect
                    name="branchID"
                    label="Branch Name"
                    options={branches}
                    onChange={(e) => {
                      handleChange(e);
                      validateForm();
                    }}
                    disabled={branches.length === 0}
                  />

                  <Field
                    as={TextField}
                    name="merchantName"
                    label="Merchant Name"
                    variant="outlined"
                    fullWidth
                    error={touched.merchantName && !!errors.merchantName}
                    helperText={<ErrorMessage name="merchantName" />}
                  />
                  <Field
                    as={TextField}
                    name="cbscMerchantID"
                    label="Cybersource Merchant ID"
                    variant="outlined"
                    fullWidth
                    error={touched.cbscMerchantID && !!errors.cbscMerchantID}
                    helperText={<ErrorMessage name="cbscMerchantID" />}
                  />
                  <Field
                    as={TextField}
                    name="cboMerchantID"
                    label="CBO Merchant ID"
                    variant="outlined"
                    fullWidth
                    error={touched.cboMerchantID && !!errors.cboMerchantID}
                    helperText={<ErrorMessage name="cboMerchantID" />}
                  />

                  <Field
                    as={TextField}
                    name="terminalID"
                    label="Terminal ID"
                    variant="outlined"
                    fullWidth
                    error={touched.terminalID && !!errors.terminalID}
                    helperText={<ErrorMessage name="terminalID" />}
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

                  <CustomSelect
                    name="cbscType"
                    label="Cybersource Type"
                    options={cbsc_types}
                  />
                </Box>

                <Button
                  variant="contained"
                  type="submit"
                  sx={{ width: {lg:"40%"}, margin: "auto" }}
                >
                  Add Cybersource Terminal
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default CreateCybersourceTerminal;
