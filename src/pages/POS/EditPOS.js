import { Box, Button, Card, TextField, Typography } from "@mui/material";
import { Form, Field, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomSelect, CustomTextField } from "../../components/CustomFields";
import { pos_sites, pos_status } from "../../components/DropDownFormData";
import { useAuthContext } from "../../context/AuthContext";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingButton from "@mui/lab/LoadingButton";
import ComboBox from "../../components/ComboBox";

const EditPOS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { row } = location.state;
  const { role } = useAuthContext();
  console.log("console rows", row);
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(
    row?.branchName?.district?._id || ""
  );

  const phoneRegExp = /^[0-9]{9}$/;

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string().required("Serial number is required"),
    terminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),

    branchName: Yup.string().required("Branch Name is required"),
    district: Yup.string().required("District is required"),
    site: Yup.string().required("Terminal site assignment is required"),
    merchantId: Yup.string(),
    merchantName: Yup.string().required("Merchant name is required"),
    merchantAddress: Yup.string().required("Merchant Address is required"),
    merchantPhonenumber: Yup.string()
      .required("Phone Number is required")
      .matches(phoneRegExp, "Phone number must be 9 digits"),
    posCbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(12, "CBS Account must be at least 12 characters"),
    serviceNumber: Yup.string()
          .required("Service number is required")
          .min(9, "Service number is short. it must be minimum of 9 digits")
          .max(13, "Service number is long. it must be maximim of 13 digits"),
    contactPhonenumber: Yup.string()
      .required("Contact Phonenumber is required")
      .matches(phoneRegExp, "Contact phone number must be 9 digits"),
    businessType: Yup.string()
      .required("Business Type is required"),
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
    configVersion: Yup.number(),
    configuredDate: Yup.date(),
    comment: Yup.string(),
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


    console.log("row in edit", row)

    try {
      const response = await axios.put(
        `${apiUrl}/pos/updatePos/${row._id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      resetForm();
      navigate("/posdetail", {
        state: {
          isRequest: false,
          relocated: false,
          row: {
            ...response.data.posTerminal,
            districtName: row.district,
            branchName: row.branchName,
            serialNumber: row.serialNumber,
          },
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
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          margin: "auto",
          justifyContent: "center",
        }}
      >
        <Card
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            margin: "auto",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            width: { xs: "100%", sm: "95%", md: "90%" },
            position: "relative",
          }}
        >
          <Formik
            initialValues={{
              ...row,
              branchName: row?.branchName?._id,
              district: row?.branchName?.district?._id,
              serialNumber: row?.serialNumber?._id,
              configuredDate: row?.configuredDate
                ? new Date(row.configuredDate).toISOString().split("T")[0]
                : "",
            }}
            validationSchema={FORM_VALIDATION}
            onSubmit={handleSubmit}
            validateOnMount
          >
            {({ isValid, errors, resetForm, validateForm, handleChange }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    Edit POS Information
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "50%",
                      }}
                    >
                      <Field
                        name="serialNumber"
                        component={ComboBox}
                        label="Serial Number"
                        required
                      />

                      <CustomTextField name="terminalId" label="Terminal ID" />
                      <CustomTextField
                        name="merchantName"
                        label="Merchant Name"
                        required
                      />
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
                      <CustomTextField
                        name="contactName"
                        label="Contact Name"
                        required
                      />
                      <CustomTextField
                        name="contactPhonenumber"
                        label="Contact Phone Number"
                        required
                      />
                      <CustomTextField
                        name="merchantId"
                        label="Merchant ID"
                        required
                      />
                      <CustomTextField
                        name="posCbsAccount"
                        label="CBS Account"
                        required
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "50%",
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
                        name="branchName"
                        label="Branch Name"
                        options={branches}
                        onChange={(e) => {
                          handleChange(e);
                          validateForm();
                        }}
                        disabled={branches.length === 0}
                        required
                      />
                      <CustomSelect
                        name="site"
                        label="Terminal Site *"
                        options={pos_sites}
                        required
                        onChange={(e) => {
                          handleChange(e);
                          validateForm();
                        }}
                      />
                      <CustomTextField
                        name="businessType"
                        label="Business Type"
                        required
                      />
                      <CustomTextField
                        name="serviceNumber"
                        label="service Number"
                        required
                      />
                      <CustomTextField
                        name="staticIp"
                        label="Static IP Address"
                        required
                      />
                      <Box sx={{display: "flex", flexDirection: "row", gap: 2}}>
                        <CustomTextField
                          name="configVersion"
                          label="Config Version"
                          required
                        />
                        <Field name="configuredDate">
                          {({ field, meta }) => (
                            <TextField
                              {...field}
                              label="Configured Date"
                              type="date"
                              fullWidth
                              InputLabelProps={{
                                shrink: true,
                              }}
                              error={meta.touched && Boolean(meta.error)}
                              helperText={meta.touched && meta.error}
                            />
                          )}
                        </Field>
                      </Box>
                      <CustomSelect
                        name="status"
                        label="Status"
                        options={pos_status}
                        required
                        onChange={(e) => {
                          handleChange(e);
                          validateForm();
                        }}
                      />
                      <CustomTextField name="comment" label="Comment" />
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    margin: "auto",
                    gap: 2,
                    marginTop: 2,
                  }}
                >
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    type="Submit"
                  >
                    Update
                  </LoadingButton>
                  {/* <Button
                    onClick={() =>
                      role === "posuser"
                        ? navigate("/request/managepos")
                        : navigate("/pos/managepos")
                    }
                  >
                    View POS
                  </Button> */}
                  <Button onClick={() => navigate(-1)}>Back</Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Card>
      </Box>
    </Box>
  );
};

export default EditPOS;
