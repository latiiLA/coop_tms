import { Box, Button, Card, Divider, Typography } from "@mui/material";
import { Form, Formik, Field, useFormikContext } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CustomSelect,
  CustomTextField,
} from "../../../components/CustomFields";
import { pos_sites } from "../../../components/DropDownFormData";
import LoadingButton from "@mui/lab/LoadingButton";
import { CloudUpload } from "@mui/icons-material";
import ComboBox from "../../../components/ComboBox";

const RequestPOS = () => {
  const location = useLocation();
  const { row, isEdit } = location.state || {};
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(row?.file || null);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(
    row?.district?._id || ""
  );
  const [currentSerialNumber, setSerialNumber] = useState(
    row?.serialNumber?.serialNumber || null
  );

  console.log("row", row);
  console.log("selected", selectedFile);

  const initialValues = {
    serialNumber: row?.serialNumber._id || "",
    branchName: row?.branchName._id || "",
    district: row?.district._id || "",
    site: row?.site || "",
    merchantName: row?.merchantName || "",
    merchantAddress: row?.merchantAddress || "",
    merchantPhonenumber: row?.merchantPhonenumber || "",
    contactName: row?.contactName || "",
    posCbsAccount: row?.posCbsAccount || "",
    staticIp: row?.staticIp || "",
    serviceNumber: row?.serviceNumber || "",
  };

  useEffect(() => {
    const fetchDistricts = async () => {
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

        setDistricts(
          response.data.alldistricts.map((district) => ({
            value: district._id,
            label: district.districtName,
          }))
        );
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
        navigate("/home");
      }
    };

    fetchDistricts();
  }, [navigate]);

  useEffect(() => {
    console.log("Selected district in branch:", selectedDistrict);

    if (selectedDistrict) {
      const fetchBranches = async () => {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.REACT_APP_API_URL;

        console.log("Token:", token); // Log the token to ensure it's available
        console.log("API URL:", apiUrl); // Log the API URL

        try {
          const response = await axios.get(`${apiUrl}/branch/getBranch`, {
            params: { districtId: selectedDistrict },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });

          console.log("Response from API:", response); // Log the full response for debugging

          if (response.data.branches && response.data.branches.length > 0) {
            setBranches(
              response.data.branches.map((branch) => ({
                value: branch._id,
                label: branch.companyName,
              }))
            );
            console.log("Selected Branches:", response.data.branches);
          } else {
            console.log("No branches found.");
          }
        } catch (error) {
          toast.error(
            `Error fetching branches: ${error.response?.data?.message || error.message}`
          );
          console.error("Error fetching branches:", error); // Log the error for debugging
        }
      };

      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (row?.file) {
      setSelectedFile(row?.file); // If editing, pre-fill the selected file
    }
  }, [row?.file]);

  const phoneRegExp = /^[0-9]{10}$/;

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string().required("Serial number is required"),
    branchName: Yup.string().required("Branch name is required"),
    district: Yup.string().required("District is required"),
    site: Yup.string().required("Terminal type assignment is required"),
    merchantName: Yup.string().required("Merchant name is required"),
    merchantAddress: Yup.string().required("Merchant address is required"),
    merchantPhonenumber: Yup.string()
      .required("Phone number is required")
      .matches(phoneRegExp, "Phone number must be 10 digits"),
    posCbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(13, "CBS Account is short. it must be at least 13 characters")
      .max(13, "CBS Account is long. it must be at least 13 characters"),
    serviceNumber: Yup.string()
      .required("Service number should is required")
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
    console.log("sent to req contr", values);
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
      if (isEdit) {
        const response = await axios.put(
          `${apiUrl}/request/updateRequest/${row._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        // console.log("The ATM is successfully updated:", response.data);
        toast.success(response.data.message);
        navigate("/request/requeststatus");
      } else {
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
      }
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
            {({
              isValid,
              errors,
              resetForm,
              validateForm,
              handleChange,
              setFieldValue,
            }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    {!isEdit
                      ? "Request New POS Configuration"
                      : "Edit POS configuration"}
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
                          name="district"
                          label="District *"
                          options={districts}
                          onChange={(e) => {
                            handleChange(e);
                            const districtId = e.target.value;
                            setSelectedDistrict(districtId); // Ensure this is set correctly
                            setBranches([]); // Reset branches before fetching new data
                            console.log("Selected District:", districtId); // Log selected district
                            validateForm();
                          }}
                        />
                        <CustomSelect
                          name="site"
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
                        <CustomSelect
                          name="branchName"
                          label="Branch Name *"
                          options={branches}
                          onChange={(e) => {
                            handleChange(e);
                            validateForm();
                          }}
                          disabled={branches.length === 0}
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
                        <Box sx={{ flex: 1 }}>
                          <Field name="serialNumber" component={ComboBox} />
                        </Box>
                        <CustomTextField
                          name="serviceNumber"
                          label="Service Number"
                          sx={{ flex: 1 }}
                          required
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: {
                            lg: "row",
                            md: "column",
                            xs: "column",
                          },
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
                            flex: 1,
                          }}
                        >
                          <Typography>
                            {isEdit
                              ? "Upload New POS Agreement (Optional)"
                              : "Upload POS Agreement"}
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
                    {isEdit ? "Update" : "Submit"}
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
