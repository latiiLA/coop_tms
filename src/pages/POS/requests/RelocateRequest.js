import { Box, Button, Card, Typography } from "@mui/material";
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
import {
  pos_status,
  districts,
  pos_sites,
} from "../../../components/DropDownFormData";
import LoadingSpinner from "../../../components/LoadingSpinner";

const RelocatedRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    serialNumber: "",
    posTerminalId: "",
    posTerminalName: "",
    posBranchName: "",
    posDistrict: "",
    posSite: "",
    posCbsAccount: "",
    merchantId: "",
    staticIp: "",
    simCardNumber: "",
  };

  const phoneRegExp = /^[0-9]{10}$/;

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string().required("Serial number is required"),
    posTerminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),
    posTerminalName: Yup.string().required("Terminal Name is required"),
    posBranchName: Yup.string().required("Branch Name is required"),
    posDistrict: Yup.string().required("District is required"),
    posSite: Yup.string().required("Terminal site assignment is required"),
    merchantId: Yup.string().required("Assigned Merchant is required"),
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
    status: Yup.string().required("Status is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }
    try {
      const response = await axios.post(
        `${apiUrl}/pos/relocationrequest`,
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
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      // setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", margin: 1 }}>
        <Card
          sx={{
            p: 3,
            px: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            width: { xs: "100%", sm: "95%", md: "90%" },
            position: "relative",
          }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={FORM_VALIDATION}
            onSubmit={handleSubmit}
            validateOnMount
          >
            {({ isValid, resetForm }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    Request POS Relocation
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "row", gap: 5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "50%",
                      }}
                    >
                      <CustomTextField
                        name="serialNumber"
                        label="Relocated POS Serial Number"
                      />
                      <CustomTextField
                        name="terminalId"
                        label="Relocated POS Terminal ID"
                      />

                      <CustomTextField
                        name="posTerminalName"
                        label="New Terminal Name"
                      />
                      <CustomSelect
                        name="toDistrict"
                        label="New District"
                        options={districts}
                      />
                      <CustomTextField
                        name="toBranchName"
                        label="New Branch Name"
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
                      <CustomTextField
                        name="merchantId"
                        label="New Merchant ID"
                      />
                      <CustomTextField
                        name="posCbsAccount"
                        label="CBS Account"
                      />
                      <CustomSelect
                        name="posSite"
                        label="New Terminal Site"
                        options={pos_sites}
                      />
                      <CustomTextField
                        name="simCardNumber"
                        label="New SIM Card Number"
                      />
                      <CustomTextField
                        name="staticIp"
                        label="New Static IP Address"
                      />

                      {/* <CustomSelect
                        name="status"
                        label="Status"
                        options={pos_status}
                      /> */}
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
                  <Button type="submit" variant="contained" color="primary">
                    Send Request
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>

          {loading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <LoadingSpinner />
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default RelocatedRequest;
