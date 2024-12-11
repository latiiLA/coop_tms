import { Box, Button, Card, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomSelect, CustomTextField } from "../../components/CustomFields";
import { request_status } from "../../components/DropDownFormData";
import axios from "axios";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Download } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";

const ApprovePOSRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [posTerminalId, setPosTerminalId] = useState("");
  // const [status, setStatus] = useState("");
  const location = useLocation();
  const { row } = location.state;

  // console.log(row, "row");

  const handleSubmit = async (values, { resetForm }) => {
    console.log("inside handle submit approval", values);
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }
    try {
      const response = await axios.post(`${apiUrl}/request/approve`, values, {
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

  const handleReject = async (row) => {
    console.log("inside handle reject request");
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }
    try {
      const response = await axios.post(
        `${apiUrl}/request/reject`,
        { row },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      navigate("/posdetail", { state: { row } });
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      // setSubmitting(false);
      setLoading(false);
    }
  };

  const requestedrows = { ...row, posTerminalId };

  const phoneRegExp = /^[0-9]{10}$/;

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string().required("Serial number is required"),
    posTerminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),
    merchantId: Yup.string()
      .required("Merchant ID is required")
      .min(15, "Merchant ID must be at least 8 characters"),
    posBranchName: Yup.string().required("Branch Name is required"),
    posDistrict: Yup.string().required("District is required"),
    posSite: Yup.string().required("Terminal site assignment is required"),
    merchantName: Yup.string().required("Merchant name is required"),
    merchantAddress: Yup.string().required("Merchant Address is required"),
    contactName: Yup.string().required("Contact Name is required"),
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

  const handleDownload = () => {
    // Assumes the file path is relative to the server's public directory.
    console.log("file", row.file.filePath);
    const link = document.createElement("a");
    link.href = `${process.env.REACT_APP_BASE_URL}/${row.file.filePath}`; // Adjust this based on server configuration
    link.download = row.file.fileName;
    link.click();
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
            initialValues={requestedrows}
            validationSchema={FORM_VALIDATION}
            onSubmit={handleSubmit}
            validateOnMount
          >
            {(isValid, resetForm) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    Approve Request
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { md: "row", xs: "column" },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: { md: "50%", xs: "100%" },
                      }}
                    >
                      <CustomTextField
                        name="posTerminalId"
                        label="Terminal ID"
                        required
                      />

                      <CustomTextField
                        name="serialNumber"
                        label="Serial Number"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="merchantName"
                        label="Merchant Name"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posBranchName"
                        label="Branch Name"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posDistrict"
                        label="District"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posSite"
                        label="Terminal Site"
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      <CustomTextField
                        name="merchantAddress"
                        label="Merchant Address"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="contactName"
                        label="Contact Name"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="merchantPhonenumber"
                        label="Merchant Phone Number"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posCbsAccount"
                        label="CBS Account"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: { md: "50%", xs: "100%" },
                      }}
                    >
                      <CustomTextField
                        name="merchantId"
                        label="Merchant ID"
                        required
                      />
                      <CustomTextField
                        name="simCardNumber"
                        label="SIM Card Number"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="staticIp"
                        label="Static IP Address"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="createdBy"
                        label="Created By"
                        disabled
                      />
                      <CustomTextField
                        name="createdAt"
                        label="Created At"
                        disabled
                      />

                      <CustomTextField
                        name="updatedAt"
                        label="Updated At"
                        disabled
                      />
                      <CustomTextField
                        name="status"
                        label="Request Status"
                        disabled
                      />

                      {/* <CustomSelect
                        name="status"
                        label="Status"
                        // default={status}
                        options={request_status}
                      /> */}
                      <CustomTextField name="remark" label="Remark" />
                      {/* Download Button */}

                      {row.file && (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 3,
                            justifyContent: "left",
                            alignItems: "center",
                          }}
                        >
                          <Typography>Merchant Agreement</Typography>

                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDownload}
                            startIcon={<Download />}
                          >
                            Download {row.file.fileName}
                          </Button>
                        </Box>
                      )}
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
                    Approve
                  </LoadingButton>
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    onClick={() => handleReject(row)}
                    style={{ backgroundColor: "red", color: "white" }}
                  >
                    Reject
                  </LoadingButton>

                  <Button onClick={() => navigate("/viewrequests")}>
                    View Requests
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

export default ApprovePOSRequest;
