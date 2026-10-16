import {
  Box,
  Button,
  Chip,
  Collapse,
  alpha,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CustomSelect, CustomTextField } from "../../components/CustomFields";
import { pos_sites } from "../../components/DropDownFormData";
import {
  Check,
  CloudUpload,
  Memory,
  PointOfSale,
  Storefront,
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import ComboBox from "../../components/ComboBox";
import { useAuthContext } from "../../context/AuthContext";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const STEPS = [
  {
    label: "Terminal",
    hint: "Where it lives",
    icon: <PointOfSale fontSize="small" />,
  },
  {
    label: "Merchant",
    hint: "Who it serves",
    icon: <Storefront fontSize="small" />,
  },
  {
    label: "Machine",
    hint: "Device & agreement",
    icon: <Memory fontSize="small" />,
  },
];

// Fields owned by each step, so "Next" can validate only what it shows.
const STEP_FIELDS = [
  ["terminalId", "district", "site", "branchName"],
  [
    "merchantName",
    "merchantId",
    "merchantAddress",
    "merchantPhonenumber",
    "contactPhonenumber",
    "posCbsAccount",
    "contactName",
    "businessType",
  ],
  ["serialNumber", "serviceNumber", "staticIp"],
];

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Human labels for the "still needed" hint under the step actions.
const FIELD_LABELS = {
  terminalId: "Terminal ID",
  district: "District",
  site: "Terminal Site",
  branchName: "Branch",
  merchantName: "Merchant Name",
  merchantId: "Merchant ID",
  merchantAddress: "Merchant Address",
  merchantPhonenumber: "Merchant Phone",
  contactPhonenumber: "Contact Phone",
  contactName: "Contact Name",
  posCbsAccount: "CBS Account",
  businessType: "Business Type",
  serialNumber: "Serial Number",
  serviceNumber: "Service Number",
  staticIp: "Static IP",
};

const isEmpty = (value) =>
  value === "" || value === null || value === undefined;

// A light-weight block: coloured accent bar, icon heading, then a field grid.
const Block = ({ title, hint, icon, children }) => (
  <Box sx={{ position: "relative", pl: { xs: 0, sm: 2.5 } }}>
    <Box
      sx={{
        position: "absolute",
        left: 0,
        top: 1,
        bottom: 1,
        width: 3,
        borderRadius: 2,
        display: { xs: "none", sm: "block" },
        background: (t) =>
          `linear-gradient(180deg, ${t.palette.primary.main}, ${alpha(
            t.palette.primary.main,
            0.15
          )})`,
      }}
    />
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
      <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
    </Stack>
    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
      {hint}
    </Typography>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      {children}
    </Box>
  </Box>
);

const AddPOS = () => {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [step, setStep] = useState(0);

  const { currentUser } = useAuthContext();
  // District-scoped users are pinned to their own district; the server enforces
  // this too, so the field is disabled rather than merely pre-filled.
  const userDistrict = currentUser?.district || "";

  const formikRef = useRef(null);
  const [selectedDistrict, setSelectedDistrict] = useState(userDistrict);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > MAX_FILE_BYTES) {
      toast.error("File is too large. Maximum size is 5 MB.");
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => setSelectedFile(null);

  const initialValues = {
    serialNumber: "",
    terminalId: "",
    branchName: "",
    district: userDistrict,
    site: "",
    merchantId: "",
    merchantName: "",
    contactName: "",
    merchantAddress: "",
    merchantPhonenumber: "",
    posCbsAccount: "",
    staticIp: "",
    serviceNumber: "",
    businessType: "",
    contactPhonenumber: "",
  };

  const phoneRegExp = /^[0-9]{9}$/;

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string().required("Serial number is required."),
    terminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be 8 characters")
      .max(8, "Terminal ID must be 8 characters"),

    branchName: Yup.string().required("Branch Name is required"),
    district: Yup.string().required("District is required"),
    site: Yup.string().required("Terminal site assignment is required"),
    merchantId: Yup.string()
      .required("Merchant ID is required")
      .min(15, "Merchant ID must be 15 characters")
      .max(15, "Merchant ID must be 15 characters"),
    merchantName: Yup.string().required("Merchant name is required"),
    contactName: Yup.string().required("Contact name is required"),
    merchantAddress: Yup.string().required("Merchant Address is required"),
    merchantPhonenumber: Yup.string()
      .required("Phone Number is required")
      .matches(phoneRegExp, "Phone number must be 9 digits")
      .min(9, "Phone number is short. it must be 9 digits")
      .max(9, "Phone number is long. it must be 9 digits"),
    contactPhonenumber: Yup.string()
      .required("Phone Number is required")
      .matches(phoneRegExp, "Phone number must be 9 digits")
      .min(9, "Phone number is short. it must be 9 digits")
      .max(9, "Phone number is long. it must be 9 digits"),
    posCbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(13, "CBS Account must be at least 13 characters"),
    serviceNumber: Yup.string()
      .required("Service number is required")
      .min(9, "Service number is short. it must be minimum of 9 digits")
      .max(13, "Service number is long. it must be maximim of 13 digits"),
    businessType: Yup.string().required("Business type is required"),
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

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }

    const formData = new FormData();
    Object.keys(values).forEach((key) => formData.append(key, values[key]));
    if (selectedFile) formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${apiUrl}/pos/createPos`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success(response.data.message);
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
      setSubmitLoading(false);
    }
  };

  const handleReset = ({ resetForm, setFieldValue }) => {
    resetForm();
    setSelectedFile(null);
    setSelectedDistrict(userDistrict);
    setBranches([]);
    setStep(0);
    if (userDistrict) setFieldValue("district", userDistrict);
  };

  // Validate only the fields the current step shows, then advance.
  const handleNext = async ({ validateForm, setTouched }) => {
    const errors = await validateForm();
    const fields = STEP_FIELDS[step];
    const invalid = fields.filter((name) => errors[name]);

    if (invalid.length > 0) {
      // Reveal the errors on this step without touching the other steps.
      const touched = {};
      invalid.forEach((name) => {
        touched[name] = true;
      });
      setTouched(touched);
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  // District-scoped users: pin the district and load their branch list.
  useEffect(() => {
    if (userDistrict) {
      setSelectedDistrict(userDistrict);
      formikRef.current?.setFieldValue("district", userDistrict);
    }
  }, [userDistrict]);

  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
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

        const formattedDistricts = response.data.alldistricts
          .filter(
            (district) =>
              !userDistrict || String(district._id) === String(userDistrict)
          )
          .map((district) => ({
            value: district._id,
            label: district.districtName.toString(),
          }));
        setDistricts(formattedDistricts);
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
        navigate("/home");
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [navigate, userDistrict]);

  useEffect(() => {
    if (!selectedDistrict) {
      setBranches([]);
      return;
    }

    const fetchBranches = async () => {
      setLoadingBranches(true);
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
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [selectedDistrict]);

  return (
    <Box sx={{ width: { xs: "100%", lg: "960px" }, mx: "auto", mt: 2 }}>
      {/* Heading */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary">
          POS Administration
        </Typography>
        <Typography variant="h5" fontWeight={600}>
          Add New POS Terminal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Three short steps — you can go back and change anything before
          submitting.
        </Typography>
      </Box>

      <Formik
        innerRef={formikRef}
        initialValues={initialValues}
        validationSchema={FORM_VALIDATION}
        onSubmit={handleSubmit}
        validateOnMount
      >
        {({
          values,
          isValid,
          resetForm,
          validateForm,
          setTouched,
          handleChange,
          setFieldValue,
        }) => {
          const missingOnStep = STEP_FIELDS[step].filter((name) =>
            isEmpty(values[name])
          );

          return (
          <Form>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "240px 1fr" },
                gap: { xs: 2, lg: 4 },
                alignItems: "start",
              }}
            >
              {/* Progress rail — horizontal on mobile, vertical on desktop */}
              <Box
                sx={{
                  position: { lg: "sticky" },
                  top: { lg: 88 },
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: { xs: "block", lg: "none" } }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    Step {step + 1} of {STEPS.length}
                  </Typography>
                  <Stepper activeStep={step} alternativeLabel>
                    {STEPS.map((s) => (
                      <Step key={s.label}>
                        <StepLabel icon={s.icon}>{s.label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                <Stack
                  spacing={1}
                  sx={{ display: { xs: "none", lg: "flex" } }}
                >
                  <Typography variant="overline" color="text.secondary">
                    Setup
                  </Typography>
                  {STEPS.map((s, index) => {
                    const state =
                      index < step ? "done" : index === step ? "active" : "todo";
                    return (
                      <Stack
                        key={s.label}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: "default",
                          bgcolor:
                            state === "active"
                              ? (t) => alpha(t.palette.primary.main, 0.08)
                              : "transparent",
                        }}
                      >
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            flexShrink: 0,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            color:
                              state === "todo"
                                ? "text.secondary"
                                : "primary.contrastText",
                            bgcolor:
                              state === "todo"
                                ? (t) => alpha(t.palette.text.secondary, 0.16)
                                : "primary.main",
                          }}
                        >
                          {state === "done" ? (
                            <Check fontSize="small" />
                          ) : (
                            index + 1
                          )}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight={state === "active" ? 700 : 500}
                            color={
                              state === "todo" ? "text.secondary" : "text.primary"
                            }
                          >
                            {s.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.hint}
                          </Typography>
                        </Box>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>

              {/* Step content */}
              <Box>
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Collapse in={step === 0} unmountOnExit timeout={200}>
                    <Block
                      title="Terminal"
                      hint="Identify the terminal and where it is installed."
                      icon={<PointOfSale fontSize="small" />}
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
                        disabled={!!userDistrict || loadingDistricts}
                        onChange={(e) => {
                          handleChange(e);
                          setSelectedDistrict(e.target.value);
                          setBranches([]);
                        }}
                      />
                      <CustomSelect
                        name="site"
                        label="Terminal Site"
                        options={pos_sites}
                        required
                      />
                      <CustomSelect
                        name="branchName"
                        label="Branch Name"
                        options={branches}
                        disabled={branches.length === 0 || loadingBranches}
                      />
                    </Block>
                  </Collapse>

                  <Collapse in={step === 1} unmountOnExit timeout={200}>
                    <Block
                      title="Merchant"
                      hint="The business this terminal serves."
                      icon={<Storefront fontSize="small" />}
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
                        name="contactPhonenumber"
                        label="Contact Phone Number"
                        required
                      />
                      <CustomTextField
                        name="contactName"
                        label="Contact Name"
                        required
                      />
                      <CustomTextField
                        name="posCbsAccount"
                        label="CBS Account"
                        required
                      />
                      <CustomTextField
                        name="businessType"
                        label="Business Type"
                        required
                      />
                    </Block>
                  </Collapse>

                  <Collapse in={step === 2} unmountOnExit timeout={200}>
                    <Block
                      title="Machine"
                      hint="Pick up the device and attach the signed agreement."
                      icon={<Memory fontSize="small" />}
                    >
                      <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                        <Field name="serialNumber" component={ComboBox} />
                      </Box>
                      <CustomTextField
                        name="serviceNumber"
                        label="Service Number"
                        required
                      />
                      <CustomTextField
                        name="staticIp"
                        label="Static IP Address"
                        required
                      />

                      <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            display: "block",
                            mb: 1,
                          }}
                        >
                          POS Agreement (Optional)
                        </Typography>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
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
                          {selectedFile ? (
                            <Chip
                              label={`${selectedFile.name} · ${formatFileSize(
                                selectedFile.size
                              )}`}
                              color="primary"
                              variant="outlined"
                              onDelete={handleRemoveFile}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              PDF, JPG or PNG · max 5 MB
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Block>
                  </Collapse>
                </Box>

                {/* Actions */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="text"
                    onClick={() => handleReset({ resetForm, setFieldValue })}
                    disabled={submitLoading}
                    sx={{ visibility: step === 0 ? "hidden" : "visible" }}
                  >
                    Reset
                  </Button>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                      disabled={step === 0 || submitLoading}
                    >
                      Back
                    </Button>

                    {step < STEPS.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={() => handleNext({ validateForm, setTouched })}
                      >
                        Next
                      </Button>
                    ) : (
                      <LoadingButton
                        loading={submitLoading}
                        type="submit"
                        variant="contained"
                        disabled={!isValid}
                      >
                        Create Terminal
                      </LoadingButton>
                    )}
                  </Stack>
                </Stack>

                {/* Live record of what this step still needs */}
                {missingOnStep.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      Still needed on this step
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {missingOnStep.map((name) => (
                        <Chip
                          key={name}
                          size="small"
                          variant="outlined"
                          label={FIELD_LABELS[name] || name}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>
          </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default AddPOS;