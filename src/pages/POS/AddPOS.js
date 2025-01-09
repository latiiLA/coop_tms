import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CustomSelect, CustomTextField } from "../../components/CustomFields";
import { pos_sites } from "../../components/DropDownFormData";
import { CloudUpload } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import ComboBox from "../../components/ComboBox";

const AddPOS = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const initialValues = {
    serialNumber: "",
    terminalId: "",
    branchName: "",
    district: "",
    site: "",
    merchantId: "",
    merchantName: "",
    contactName: "",
    merchantAddress: "",
    merchantPhonenumber: "",
    posCbsAccount: "",
    staticIp: "",
    serviceNumber: "",
  };

  const phoneRegExp = /^[0-9]{10}$/;

  // Tom@J-Class.com

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string()
      .required("Serial number is required."),
    terminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be 8 characters")
      .max(8, "Terminal ID must be 8 characters"),

    branchName: Yup.string().required("Branch Name is required"),
    district: Yup.string().required("District is required"),
    site: Yup.string().required("Terminal site assignment is required"),
    merchantId: Yup.string().required("Merchant ID is required")
      .min(15, "Merchant ID must be 15 characters")
      .max(15, "Merchant ID must be 15 characters"),
    merchantName: Yup.string().required("Merchant name is required"),
    contactName: Yup.string().required("Contact name is required"),
    merchantAddress: Yup.string().required("Merchant Address is required"),
    merchantPhonenumber: Yup.string()
      .required("Phone Number is required")
      .matches(phoneRegExp, "Phone number must be 10 digits"),
    posCbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(13, "CBS Account must be at least 13 characters"),
    serviceNumber: Yup.string()
      .required("Service number is required")
      .matches(phoneRegExp, "Phone number must be 10 digits"),
    staticIp: Yup.string()
      .required("IP Address is required")
      .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP Address format")
      .test("is-valid-ip", "Invalid IP Address", (value) => {
        const parts = value.split(".");
        if (parts.length !== 4) return false;
        return parts.every((part) => {
          const num = parseInt(part, 10);
          return !isNaN(num) && num >= 0 && num <= 255;
        });
      }),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    console.log("handle pos creation", values);
    if (!token) {
      navigate("/home");
      return;
    }

    // Create FormData object and populate it with values and file
    const formData = new FormData();
    Object.keys(values).forEach((key) => formData.append(key, values[key]));
    if (selectedFile) formData.append("file", selectedFile);

    // Log the FormData content to check if all fields are appended correctly
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post(`${apiUrl}/pos/createPos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success(response.data.message);
      resetForm();
      navigate("/posdetail", {
        state: {
          isRequest: false,
          relocated: false,
          row: response.data.posTerminal,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      // setSubmitting(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRows = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchRows();
  }, [navigate]);

  useEffect(() => {
    console.log("selectedDistrict", selectedDistrict);
    if (selectedDistrict) {
      setLoading(true);
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
        } finally {
          setLoading(false);
        }
      };
      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [selectedDistrict]);

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", margin: 1 }}>
        <Card
          sx={{
            p: 3,
            paddingTop: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            width: { xs: "100%", sm: "100%", md: "90%", lg: "80%" },
            position: "relative",
          }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={FORM_VALIDATION}
            onSubmit={handleSubmit}
            validateOnMount
          >
            {({
              isValid,
              errors,
              touched,
              resetForm,
              validateForm,
              handleChange,
            }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    Add New POS Terminal Information
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      paddingX: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold" }}>
                        Terminal Information
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          gap: 2,
                        }}
                      >
                        <CustomTextField
                          name="terminalId"
                          label="POS Terminal ID"
                          required
                        />
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
                          endAdornment={
                            loading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : null
                          }
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          gap: 2,
                        }}
                      >
                        <CustomSelect
                          name="site"
                          label="Terminal Site *"
                          options={pos_sites}
                          required
                        />
                        <CustomSelect
                          name="branchName"
                          label="Branch Name"
                          options={branches}
                          onChange={(e) => {
                            handleChange(e);
                            validateForm();
                          }}
                          disabled={branches.length === 0}
                          endAdornment={
                            loading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : null
                          }
                        />
                      </Box>
                    </Box>
                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold" }}>
                        Merchant Information
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          gap: 2,
                        }}
                      >
                        <CustomTextField
                          name="merchantName"
                          label="Merchant Name"
                          required
                        />
                        <CustomTextField
                          name="merchantId"
                          label="Merchant ID"
                          required
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          gap: 2,
                        }}
                      >
                        <CustomTextField
                          name="merchantAddress"
                          label="Merchant Address"
                          required
                        />
                        <CustomTextField
                          name="merchantPhonenumber"
                          label="Merchant Phone Number"
                          required
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          gap: 2,
                        }}
                      >
                        <CustomTextField
                          name="posCbsAccount"
                          label="CBS Account"
                          required
                        />
                        <CustomTextField
                          name="contactName"
                          label="Contact Name"
                          required
                        />
                      </Box>
                    </Box>
                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Typography sx={{ fontWeight: "bold" }}>
                        POS Machine Information
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          gap: 2,
                          justifyContent: "space-between",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Field name="serialNumber" component={ComboBox} />
                          
                        </Box>

                        <CustomTextField
                          name="serviceNumber"
                          label="Service Number"
                          required
                          sx={{ flex: 1 }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: {
                            xs: "column",
                            md: "column",
                            lg: "row",
                          },
                          gap: 2,
                        }}
                      >
                        <CustomTextField
                          name="staticIp"
                          label="Static IP Address"
                          sx={{ width: { xs: "100%", md: "49%" } }}
                          required
                        />
                        {/* File Upload Section */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography>
                            Upload POS Agreement (Optional)
                          </Typography>
                          <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                          >
                            {selectedFile ? "Change File" : "Upload File"}
                            <input
                              type="file"
                              hidden
                              onChange={handleFileChange}
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                          </Button>
                          {selectedFile && (
                            <Typography variant="body2">
                              {selectedFile.name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <LoadingButton
                    loading={loading}
                    type="submit"
                    variant="contained"
                    color="primary"
                    width={200}
                  >
                    Submit
                  </LoadingButton>
                </Box>
              </Form>
            )}
          </Formik>
        </Card>
      </Box>
    </Box>
  );
};

export default AddPOS;
