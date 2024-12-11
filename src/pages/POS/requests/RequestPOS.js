import { Box, Button, Card, Divider, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CustomSelect,
  CustomTextField,
} from "../../../components/CustomFields";
import { districts, pos_sites } from "../../../components/DropDownFormData";
import LoadingSpinner from "../../../components/LoadingSpinner";
import LoadingButton from "@mui/lab/LoadingButton";
import { CloudUpload } from "@mui/icons-material";

const RequestPOS = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const initialValues = {
    serialNumber: "",
    posBranchName: "",
    posDistrict: "",
    posSite: "",
    merchantId: "",
    merchantName: "",
    merchantAddress: "",
    merchantPhonenumber: "",
    posCbsAccount: "",
    staticIp: "",
    simCardNumber: "",
  };

  const phoneRegExp = /^[0-9]{10}$/;

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string().required("Serial number is required"),
    posBranchName: Yup.string().required("Branch name is required"),
    posDistrict: Yup.string().required("District is required"),
    posSite: Yup.string().required("Terminal site assignment is required"),
    merchantId: Yup.string(),
    merchantName: Yup.string().required("Merchant name is required"),
    merchantAddress: Yup.string().required("Merchant address is required"),
    merchantPhonenumber: Yup.string()
      .required("Phone number is required")
      .matches(phoneRegExp, "Phone number must be 10 digits"),
    posCbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(12, "CBS Account must be at least 12 characters"),
    simCardNumber: Yup.string()
      .required("SIM Card Number is required")
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

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

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
      const response = await axios.post(
        `${apiUrl}/request/newRequest`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      resetForm();
      setSelectedFile(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", margin: 1 }}>
        <Card
          sx={{
            paddingTop: 1,
            paddingBottom: 3,
            paddingX: 3,
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
            {({ isValid, errors, resetForm }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    Request New POS Configuration
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
                        <CustomSelect
                          name="posDistrict"
                          label="District *"
                          options={districts}
                          required
                        />
                        <CustomSelect
                          name="posSite"
                          label="Terminal Site *"
                          options={pos_sites}
                          required
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          gap: 1,
                          width: { xs: "100%", md: "49%" },
                        }}
                      >
                        <CustomTextField
                          name="posBranchName"
                          label="Branch Name"
                          required
                          width
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
                          name="contactName"
                          label="Contact Name"
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

                      <CustomTextField
                        name="posCbsAccount"
                        label="CBS Account"
                        required
                        sx={{ width: { xs: "100%", md: "49%" } }}
                      />
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
                          flexDirection: { md: "row", xs: "column" },
                          gap: 2,
                        }}
                      >
                        <CustomTextField
                          name="serialNumber"
                          label="Serial Number"
                          required
                        />
                        <CustomTextField
                          name="simCardNumber"
                          label="SIM Card Number"
                          required
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { md: "row", xs: "column" },
                          gap: 2,
                        }}
                      >
                        <CustomTextField
                          name="staticIp"
                          label="Static IP Address"
                          required
                          sx={{ width: { md: "49%", xs: "100%" } }}
                        />
                        {/* File Upload Section */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography>Upload Merchant Agreement</Typography>
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

export default RequestPOS;
