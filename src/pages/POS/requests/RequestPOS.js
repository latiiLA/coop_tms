import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Form, Formik, Field, useField, useFormikContext } from "formik";
import * as Yup from "yup";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomSelect } from "../../../components/CustomFields";
import { pos_sites } from "../../../components/DropDownFormData";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  ArrowBack,
  CloudUpload,
  Close,
  InsertDriveFile,
  LocationOn,
  Lock,
  Router,
  Storefront,
  VerifiedUser,
} from "@mui/icons-material";
import ComboBox from "../../../components/ComboBox";
import { useAuthContext } from "../../../context/AuthContext";

// Mirrors the server upload rules (coop_tms_server/Middleware/upload.js).
const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Human-readable labels used by the error summary.
const FIELD_LABELS = {
  district: "District",
  site: "Terminal Site",
  branchName: "Branch",
  merchantName: "Merchant Name",
  merchantPhonenumber: "Merchant Phone Number",
  merchantAddress: "Merchant Address",
  businessType: "Business Type",
  contactName: "Contact Name",
  contactPhonenumber: "Contact Phone Number",
  serialNumber: "Serial Number",
  serviceNumber: "Service Number",
  staticIp: "Static IP Address",
  posCbsAccount: "CBS Account",
  assignAuthorizationUser: "Authorizing User",
};

// Display order for the error summary / scroll-to-first-error.
const FIELD_ORDER = Object.keys(FIELD_LABELS);

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Text field showing a helper hint until the field is touched (or the form
// is submitted), then the validation error in its place.
// Id of a ref that may be populated ({ _id }) or a plain id string.
const refId = (v) => (v && typeof v === "object" ? v._id : v) || "";

export const FormTextField = ({ label, helperText, required, ...props }) => {
  const [field, meta] = useField(props);
  const showError = meta.touched && !!meta.error;
  return (
    <TextField
      {...field}
      {...props}
      id={`field-${props.name}`}
      label={label}
      required={required}
      error={showError}
      helperText={showError ? meta.error : helperText || " "}
      variant="outlined"
      size="medium"
      fullWidth
    />
  );
};

// Wrapper that gives each field a scroll anchor for the error summary.
export const FieldSlot = ({ name, full, children }) => (
  <Box
    data-field={name}
    sx={{ gridColumn: full ? "1 / -1" : "auto", scrollMarginTop: 96 }}
  >
    {children}
  </Box>
);

export const Section = ({ step, title, subtitle, icon, children }) => (
  <Card variant="outlined" sx={{ borderRadius: 2 }}>
    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary" lineHeight={1.2}>
            Step {step}
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} lineHeight={1.3}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          columnGap: 2,
          rowGap: 1,
        }}
      >
        {children}
      </Box>
    </CardContent>
  </Card>
);

// After a failed submit attempt, scrolls to and focuses the first invalid
// field (per-field messages show the errors; no summary box).
const ScrollToFirstError = () => {
  const { errors, submitCount, isSubmitting } = useFormikContext();
  const lastHandled = useRef(0);

  const invalidFields = FIELD_ORDER.filter((name) => errors[name]);

  useEffect(() => {
    if (submitCount === 0 || submitCount === lastHandled.current) return;
    if (isSubmitting) return;
    lastHandled.current = submitCount;
    if (invalidFields.length === 0) return;
    const first = document.querySelector(`[data-field="${invalidFields[0]}"]`);
    if (first) {
      first.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = first.querySelector("input, textarea, [role='combobox'], [role='button']");
      if (input && typeof input.focus === "function") {
        input.focus({ preventScroll: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitCount, isSubmitting]);

  return null;
};

const RequestPOSForm = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const { row, isEdit } = location.state || {};
  // Initiator may change serial only while the request is still New.
  const canEditSerial = !isEdit || row?.status === "New";
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(row?.file || null);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const { currentUser } = useAuthContext();
  const userDistrict = currentUser?.district || "";
  const formikRef = useRef(null);

  // Edit is initiator-only (server also enforces). Block deep-links / stale state.
  useEffect(() => {
    if (!isEdit || !row) return;
    const creatorId =
      row?.createdBy && typeof row.createdBy === "object"
        ? row.createdBy._id
        : row?.createdBy;
    if (
      !currentUser?.id ||
      !creatorId ||
      String(creatorId) !== String(currentUser.id)
    ) {
      toast.error("Only the request initiator can edit this request.");
      navigate("/request/requeststatus", { replace: true });
    }
  }, [isEdit, row, currentUser?.id, navigate]);
  // Accept populated refs or plain ids (some endpoints return ids only).
  const [selectedDistrict, setSelectedDistrict] = useState(
    refId(row?.district) || userDistrict
  );
  const [users, setUsers] = useState([]);
  // True once the authorizer list for the selected district has loaded.
  const [usersLoaded, setUsersLoaded] = useState(false);
  const noDistrictAuthorizer = Boolean(selectedDistrict) && usersLoaded && users.length === 0;

  // Authorizers for the request's district: its district authorizers, or
  // head-office authorizers when it has none (decided by the server).
  // Refetched whenever the district changes.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return undefined;
    }
    let cancelled = false;
    setUsersLoaded(false);
    (async () => {
      try {
        const response = await axios.get(`${apiUrl}/auth/getAuthorizingUser`, {
          headers: { Authorization: `Bearer ${token}` },
          params: selectedDistrict ? { district: selectedDistrict } : {},
          withCredentials: true,
        });
        if (cancelled) return;
        const list = response.data?.users || [];
        setUsers(list);
        setUsersLoaded(true);
        // Only district authorizers of this district are valid (no fallback),
        // so a selected/current assignee not in the list is cleared.
        const formik = formikRef.current;
        const selected = formik?.values?.assignAuthorizationUser;
        if (selected && !list.some((u) => String(u._id) === String(selected))) {
          formik.setFieldValue("assignAuthorizationUser", "", false);
        }
      } catch (error) {
        if (!cancelled) {
          setUsers([]);
          setUsersLoaded(false);
          toast.error(`Error: ${error.response?.data?.message || error.message}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrict]);

  console.log("row", row);
  console.log("selected", selectedFile);

  const initialValues = {
    serialNumber: row?.serialNumber?._id || "",
    branchName: refId(row?.branchName) || "",
    district: refId(row?.district) || userDistrict,
    site: row?.site || "",
    merchantName: row?.merchantName || "",
    merchantAddress: row?.merchantAddress || "",
    merchantPhonenumber: row?.merchantPhonenumber || "",
    contactName: row?.contactName || "",
    posCbsAccount: row?.posCbsAccount || "",
    staticIp: row?.staticIp || "",
    serviceNumber: row?.serviceNumber || "",
    contactPhonenumber: row?.contactPhonenumber || "",
    businessType: row?.businessType || "",
    assignAuthorizationUser: String(refId(row?.assignAuthorizationUser) || ""),
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
          response.data.alldistricts
            .filter((district) => !userDistrict || String(district._id) === String(userDistrict))
            .map((district) => ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // District users: district is fixed to their own (the server enforces it too).
  useEffect(() => {
    if (userDistrict) {
      setSelectedDistrict(userDistrict);
      formikRef.current?.setFieldValue("district", userDistrict);
    }
  }, [userDistrict]);

  useEffect(() => {
    if (row?.file) {
      setSelectedFile(row?.file); // If editing, pre-fill the selected file
    }
  }, [row?.file]);

  const phoneRegExp = /^[0-9]{9}$/;

  const FORM_VALIDATION = Yup.object().shape({
    serialNumber: Yup.string().required("Serial number is required"),
    branchName: Yup.string().required("Branch name is required"),
    district: Yup.string().required("District is required"),
    site: Yup.string().required("Terminal type assignment is required"),
    merchantName: Yup.string().required("Merchant name is required"),
    merchantAddress: Yup.string().required("Merchant address is required"),
    merchantPhonenumber: Yup.string()
      .required("Phone number is required")
      .matches(phoneRegExp, "Phone number must be 9 digits")
      .min(9, "Phone number is short. it must be 9 digits")
      .max(9, "Phone number is long. it must be 9 digits"),
    contactName: Yup.string().required("Contact name is required"),
    contactPhonenumber: Yup.string()
      .required("Phone number is required")
      .matches(phoneRegExp, "Phone number must be 9 digits")
      .min(9, "Phone number is short. it must be 9 digits")
      .max(9, "Phone number is long. it must be 9 digits"),
    posCbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(13, "CBS Account is short. it must be at least 13 characters")
      .max(13, "CBS Account is long. it must be at least 13 characters"),
    serviceNumber: Yup.string()
      .required("Service number should is required")
      .min(9, "Service number is short. it must be minimum of 9 digits")
      .max(13, "Service number is long. it must be maximum of 13 digits"),
    businessType: Yup.string().required("Business type is required"),
    assignAuthorizationUser: Yup.string().required("Authorizing user is required"),
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

  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File is too large (${formatFileSize(file.size)}). Maximum is 5 MB.`);
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    // In edit mode this returns to "keep the existing agreement".
    setSelectedFile(isEdit ? row?.file || null : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // A newly chosen File vs. the stored agreement object from the request row.
  const isNewFile = typeof File !== "undefined" && selectedFile instanceof File;
  const selectedFileName = selectedFile?.name || selectedFile?.fileName || "";
  const selectedFileSize = selectedFile?.size ?? selectedFile?.fileSize;
  // The agreement is required: a new upload, or (edit) the stored file.
  const hasAgreement = isNewFile || Boolean(selectedFile?.filePath || selectedFile?.fileName);
  const [fileTouched, setFileTouched] = useState(false);
  const fileError = fileTouched && !hasAgreement;

  const handleSubmit = async (values, { resetForm }) => {
    // The signed POS agreement is required (an existing stored file counts).
    if (!hasAgreement) {
      setFileTouched(true);
      toast.error("Please attach the signed POS agreement file.");
      return;
    }
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }

    // Create FormData object and populate it with values and file.
    // When serial is locked (not New), force the original device id.
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (isEdit && key === "serialNumber" && !canEditSerial) {
        formData.append(
          key,
          row?.serialNumber?._id || row?.serialNumber || values.serialNumber
        );
        return;
      }
      formData.append(key, values[key]);
    });
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
        if (userDistrict) formikRef.current?.setFieldValue("district", userDistrict);
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

  const iconSx = { fontSize: 20 };

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 2 }}>
      <Box sx={{ width: { xs: "100%", sm: "95%", md: "90%", lg: "80%" }, px: { xs: 1, sm: 0 } }}>
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={FORM_VALIDATION}
          onSubmit={handleSubmit}
          validateOnMount
        >
          {({ handleChange, validateForm, isSubmitting }) => (
            <Form noValidate>
              <Stack spacing={2}>
                {/* Header */}
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {!isEdit
                      ? "Request New POS Configuration"
                      : "Edit POS Configuration Request"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fields marked * are required. The request is sent to the
                    selected authorizer for review.
                  </Typography>
                </Box>

                <ScrollToFirstError />

                {/* 1. Location */}
                <Section
                  step={1}
                  title="Location"
                  subtitle="Where the terminal will be installed"
                  icon={<LocationOn sx={iconSx} />}
                >
                  <FieldSlot name="district">
                    <CustomSelect
                      name="district"
                      label="District *"
                      options={districts}
                      disabled={!!userDistrict}
                      onChange={(e) => {
                        handleChange(e);
                        const districtId = e.target.value;
                        setSelectedDistrict(districtId); // Ensure this is set correctly
                        setBranches([]); // Reset branches before fetching new data
                        validateForm();
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, ml: 1.5, minHeight: 20 }}
                    >
                      {userDistrict ? (
                        <>
                          <Lock sx={{ fontSize: 14 }} /> Locked to your district
                        </>
                      ) : (
                        "Select a district to load its branches"
                      )}
                    </Typography>
                  </FieldSlot>
                  <FieldSlot name="branchName">
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5, ml: 1.5, minHeight: 20 }}
                    >
                      {branches.length === 0
                        ? selectedDistrict
                          ? "No branches loaded for this district yet"
                          : "Choose a district first"
                        : `${branches.length} branch${branches.length > 1 ? "es" : ""} available`}
                    </Typography>
                  </FieldSlot>
                  <FieldSlot name="site">
                    <CustomSelect
                      name="site"
                      label="Terminal Site *"
                      options={pos_sites}
                      required
                    />
                    <Box sx={{ minHeight: 20, mt: 0.5 }} />
                  </FieldSlot>
                </Section>

                {/* 2. Merchant */}
                <Section
                  step={2}
                  title="Merchant"
                  subtitle="Business and contact details"
                  icon={<Storefront sx={iconSx} />}
                >
                  <FieldSlot name="merchantName">
                    <FormTextField name="merchantName" label="Merchant Name" required />
                  </FieldSlot>
                  <FieldSlot name="businessType">
                    <FormTextField
                      name="businessType"
                      label="Business Type"
                      required
                      helperText="e.g. Supermarket, Pharmacy"
                    />
                  </FieldSlot>
                  <FieldSlot name="merchantAddress">
                    <FormTextField name="merchantAddress" label="Merchant Address" required />
                  </FieldSlot>
                  <FieldSlot name="contactName">
                    <FormTextField name="contactName" label="Contact Name" required />
                  </FieldSlot>
                  <FieldSlot name="merchantPhonenumber">
                    <FormTextField
                      name="merchantPhonenumber"
                      label="Merchant Phone Number"
                      required
                      helperText="9 digits, e.g. 911234567"
                      inputProps={{ inputMode: "numeric", maxLength: 9 }}
                    />
                  </FieldSlot>
                  <FieldSlot name="contactPhonenumber">
                    <FormTextField
                      name="contactPhonenumber"
                      label="Contact Phone Number"
                      required
                      helperText="9 digits, e.g. 911234567"
                      inputProps={{ inputMode: "numeric", maxLength: 9 }}
                    />
                  </FieldSlot>
                </Section>

                {/* 3. Terminal & Network */}
                <Section
                  step={3}
                  title="Terminal & Network"
                  subtitle="Device, connectivity and settlement account"
                  icon={<Router sx={iconSx} />}
                >
                  <FieldSlot name="serialNumber">
                    <Field
                      name="serialNumber"
                      component={ComboBox}
                      disabled={!canEditSerial}
                    />
                    {isEdit && !canEditSerial && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5, ml: 0.5 }}
                      >
                        Serial number can only be changed while the request is
                        New. Relocate the POS to use a different device.
                      </Typography>
                    )}
                  </FieldSlot>
                  <FieldSlot name="serviceNumber">
                    <FormTextField
                      name="serviceNumber"
                      label="Service Number"
                      required
                      helperText="9 to 13 digits"
                    />
                  </FieldSlot>
                  <FieldSlot name="staticIp">
                    <FormTextField
                      name="staticIp"
                      label="Static IP Address"
                      required
                      helperText="IPv4, e.g. 10.0.0.25"
                    />
                  </FieldSlot>
                  <FieldSlot name="posCbsAccount">
                    <FormTextField
                      name="posCbsAccount"
                      label="CBS Account"
                      required
                      helperText="13 characters"
                      inputProps={{ maxLength: 13 }}
                    />
                  </FieldSlot>
                </Section>

                {/* 4. Authorization & Attachment */}
                <Section
                  step={4}
                  title="Authorization & Agreement"
                  subtitle="Who reviews the request, and the signed POS agreement"
                  icon={<VerifiedUser sx={iconSx} />}
                >
                  <FieldSlot name="assignAuthorizationUser">
                    <FormTextField
                      select
                      name="assignAuthorizationUser"
                      label="Assign Authorization User"
                      required
                      error={noDistrictAuthorizer}
                      disabled={noDistrictAuthorizer}
                      helperText={
                        noDistrictAuthorizer
                          ? "No authorizer is set up for this district; a request can't be initiated until one is added."
                          : !selectedDistrict
                          ? "Choose a district first"
                          : "The authorizer who will review this request"
                      }
                      onChange={handleChange}
                    >
                      {/* Only this district's authorizers; a current assignee who
                          is no longer valid is not offered (and is cleared). */}
                      {users.map((user) => (
                        <MenuItem key={user._id} value={String(user._id)}>
                          {[user.firstName, user.fatherName, user.gfatherName]
                            .filter(Boolean)
                            .join(" ") || user.username}
                        </MenuItem>
                      ))}
                    </FormTextField>
                  </FieldSlot>

                  <FieldSlot name="file">
                    <Box
                      sx={{
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="body2" fontWeight={600}>
                          POS Agreement *
                        </Typography>
                        {isEdit && hasAgreement && (
                          <Chip size="small" label="Replace file (current file kept)" variant="outlined" />
                        )}
                      </Stack>

                      {selectedFile ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ bgcolor: "action.hover", borderRadius: 1, px: 1.5, py: 1 }}
                        >
                          <InsertDriveFile color="primary" />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" noWrap title={selectedFileName}>
                              {selectedFileName || "Selected file"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {[
                                formatFileSize(selectedFileSize),
                                isNewFile ? "new upload" : "current file",
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </Typography>
                          </Box>
                          {(isNewFile || !isEdit) && (
                            <Tooltip title={isEdit ? "Keep current file" : "Remove file"}>
                              <IconButton size="small" onClick={handleRemoveFile} aria-label="Remove file">
                                <Close fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color={fileError ? "error" : "text.secondary"}>
                          {fileError
                            ? "The signed POS agreement file is required."
                            : "No file selected"}
                        </Typography>
                      )}

                      <Box>
                        <Button
                          variant="outlined"
                          component="label"
                          size="small"
                          startIcon={<CloudUpload />}
                        >
                          {selectedFile ? "Change File" : "Upload File"}
                          <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            onChange={handleFileChange}
                            accept={ACCEPTED_FILE_TYPES}
                          />
                        </Button>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        PDF, JPG or PNG · max 5 MB
                      </Typography>
                    </Box>
                  </FieldSlot>
                </Section>

                {/* Sticky footer */}
                <Paper
                  elevation={3}
                  sx={{
                    position: "sticky",
                    bottom: 0,
                    zIndex: 2,
                    borderRadius: 2,
                    px: { xs: 2, md: 3 },
                    py: 1.5,
                  }}
                >
                  <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                  >
                    <Button
                      startIcon={<ArrowBack />}
                      onClick={() => navigate(-1)}
                      disabled={loading || isSubmitting}
                    >
                      Back
                    </Button>
                    <LoadingButton
                      loading={loading || isSubmitting}
                      disabled={loading || isSubmitting || noDistrictAuthorizer}
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ minWidth: 200 }}
                    >
                      {isEdit ? "Update Request" : "Add Request"}
                    </LoadingButton>
                  </Stack>
                </Paper>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

// Add and Edit share the /request/request route, so React Router reuses the
// same instance (Edit -> Add kept the edit row, file and option lists).
// Keying by location.key remounts the form on every navigation, giving a
// clean Add form or a fresh Edit form for the row in location.state.
const RequestPOS = () => {
  const location = useLocation();
  return <RequestPOSForm key={location.key} />;
};

export default RequestPOS;
