import { Box, Button, Card, Typography } from "@mui/material";
import { Form, Formik, Field } from "formik";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomSelect, CustomTextField } from "../../components/CustomFields";
import axios from "axios";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { Download } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import ComboBox from "../../components/ComboBox";

const ApprovePOSRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { row } = location.state;
  console.log(row, "row");
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(
    row?.branchName?.district?._id || ""
  );
  const [isRejecting, setIsRejecting] = useState(false);

  // const [status, setStatus] = useState("");

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
      navigate(-1);
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
      // resetForm();
      navigate(-1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      // setSubmitting(false);
      setLoading(false);
    }
  };

  // const requestedrows = { ...row, terminalId };

  const phoneRegExp = /^[0-9]{9}$/;

  const FORM_VALIDATION = (isRejecting) =>
    Yup.object().shape({
      serialNumber: Yup.string().required("Serial number is required"),
      branchName: Yup.string().required("Branch Name is required"),
      district: Yup.string().required("District is required"),
      site: Yup.string().required("Terminal site assignment is required"),
      merchantName: Yup.string().required("Merchant name is required"),
      merchantAddress: Yup.string().required("Merchant Address is required"),
      contactName: Yup.string().required("Contact Name is required"),
      merchantPhonenumber: Yup.string()
        .required("Phone Number is required")
        .matches(phoneRegExp, "Phone number must be 9 digits")
        .min(9, "Phone number is short. it must be 9 digits")
        .max(9, "Phone number is long. it must be 9 digits"),
      posCbsAccount: Yup.string()
        .required("CBS Account is required")
        .min(
          12,
          "CBS Account must be at least 12 characters, eg. ETB1000200010222"
        ),
      serviceNumber: Yup.string()
        .required("Service Number is required")
        .matches(phoneRegExp, "Phone number must be 9 digits")
        .min(9, "Service number is short. it must be 9 digits")
        .max(9, "Service number is long. it must be 9 digits"),
      contactPhonenumber: Yup.string()
        .required("Phone Number is required")
        .matches(phoneRegExp, "Phone number must be 9 digits")
        .min(9, "Phone number is short. it must be 9 digits")
        .max(9, "Phone number is long. it must be 9 digits"),
      businessType: Yup.string()
        .required("Business type is required"),
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
      terminalId: isRejecting
        ? Yup.string().notRequired()
        : Yup.string()
            .required("Merchant ID is required")
            .min(8, "Terminal ID is short. it must be  8 characters")
            .max(8, "Terminal ID is long. it must be 8 characters"),

      merchantId: isRejecting
        ? Yup.string().notRequired()
        : Yup.string()
            .required("Merchant ID is required")
            .min(15, "Merchant ID is short. it must be 15 characters")
            .max(15, "Merchant ID is long. it must be 15 characters"),
      remark: isRejecting
        ? Yup.string().required("Remark is required for rejection")
        : Yup.string(),
    });

  const handleDownload = () => {
    console.log("file", row.file.filePath);
    const link = document.createElement("a");
    link.href = `${process.env.REACT_APP_BASE_URL}/${row.file.filePath}`;
    link.download = row.file.fileName;
    link.click();
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
              terminalId: "",
              merchantId: "",
              remark: "",
            }}
            validationSchema={FORM_VALIDATION(isRejecting)}
            onSubmit={(values, { resetForm }) => {
              if (isRejecting) {
                // Handle rejection
                handleReject(values, { resetForm });
              } else {
                // Handle approval
                handleSubmit(values, { resetForm });
              }
            }}
            validateOnMount
          >
            {({
              values,
              errors,
              touched,
              isValid,
              validateForm,
              handleChange,
              setFieldValue,
              resetForm,
            }) => (
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
                      {row.status === "Authorized" && (
                        <CustomTextField
                          name="terminalId"
                          label="Terminal ID"
                          required
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Field
                          name="serialNumber"
                          component={ComboBox}
                          disabled={true}
                        />
                      </Box>
                      <CustomTextField
                        name="merchantName"
                        label="Merchant Name"
                        InputProps={{
                          readOnly: true,
                        }}
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
                        disabled={true}
                      />

                      <CustomSelect
                        name="branchName"
                        label="Branch Name"
                        options={branches}
                        onChange={(e) => {
                          handleChange(e);
                          validateForm();
                        }}
                        disabled={true}
                        required
                      />

                      <CustomTextField
                        name="site"
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
                      <CustomTextField
                        name="businessType"
                        label="Business Type"
                        disabled
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
                        name="serviceNumber"
                        label="Service Number"
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
                        name="contactPhonenumber"
                        label="Contact Phone Number"
                        disabled
                      />                 
                      <CustomTextField
                        name="createdBy"
                        label="Created By"
                        value={
                          (row?.createdBy?.firstName || "Unknown") +
                          " " +
                          (row?.createdBy?.fatherName || "Unknown")
                        }
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
                        InputProps={{
                          readOnly: true,
                        }}
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
                    onClick={() => setIsRejecting(false)}
                  >
                    Approve
                  </LoadingButton>
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    style={{ backgroundColor: "red", color: "white" }}
                    onClick={async () => {
                      setIsRejecting(true)
                      if (!values.remark || values.remark.trim() === "") {
                        toast.error("Remark is required for rejection.");
                        return;
                      }
                      handleReject(values);
                    }}
                  >
                    Reject
                  </LoadingButton>

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

export default ApprovePOSRequest;
