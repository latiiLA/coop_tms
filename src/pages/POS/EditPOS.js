import { Box, Button, Card, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomSelect, CustomTextField } from "../../components/CustomFields";
import { pos_sites, pos_status } from "../../components/DropDownFormData";
import { useAuthContext } from "../../context/AuthContext";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";

const EditPOS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { row } = location.state;
  const { role } = useAuthContext();
  // console.log("console", row);
  const [loading, setLoading] = useState(false);

  const phoneRegExp = /^[0-9]{10}$/;

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string().required("Serial number is required"),
    posTerminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),

    posBranchName: Yup.string().required("Branch Name is required"),
    posDistrict: Yup.string().required("District is required"),
    posSite: Yup.string().required("Terminal site assignment is required"),
    merchantId: Yup.string(),
    merchantName: Yup.string().required("Merchant name is required"),
    merchantAddress: Yup.string().required("Merchant Address is required"),
    merchantPhonenumber: Yup.string()
      .required("Phone Number is required")
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

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    console.log("handle pos creation", values);
    if (!token) {
      navigate("/home");
      return;
    }

    try {
      const response = await axios.patch(`${apiUrl}/pos/updatepos`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

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
            initialValues={row}
            validationSchema={FORM_VALIDATION}
            onSubmit={handleSubmit}
            validateOnMount
          >
            {() => (
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
                      <CustomTextField
                        name="serialNumber"
                        label="Serial Number"
                      />
                      <CustomTextField
                        name="posTerminalId"
                        label="POS Terminal ID"
                      />
                      <CustomTextField
                        name="merchantName"
                        label="Merchant Name"
                      />
                      <CustomTextField
                        name="merchantAddress"
                        label="Merchant Address"
                      />
                      <CustomTextField
                        name="merchantPhonenumber"
                        label="Merchant Phone Number"
                      />
                      <CustomTextField
                        name="contactName"
                        label="Contact Name"
                      />
                      <CustomTextField
                        name="posBranchName"
                        label="Branch Name"
                      />
                      <CustomTextField name="merchantId" label="Merchant ID" />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "50%",
                      }}
                    >
                      <CustomTextField name="posDistrict" label="District" />
                      <CustomSelect
                        name="posSite"
                        label="Terminal Site *"
                        options={pos_sites}
                        required
                      />
                      <CustomTextField
                        name="posCbsAccount"
                        label="CBS Account"
                      />
                      <CustomTextField
                        name="simCardNumber"
                        label="SIM Card Number"
                      />
                      <CustomTextField
                        name="staticIp"
                        label="Static IP Address"
                      />
                      <CustomSelect
                        name="status"
                        label="Status"
                        options={pos_status}
                      />
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
                  <Button variant="contained" type="Submit">
                    Update
                  </Button>
                  <Button
                    onClick={() =>
                      role === "posuser"
                        ? navigate("/request/managepos")
                        : navigate("/pos/managepos")
                    }
                  >
                    View POS
                  </Button>
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
