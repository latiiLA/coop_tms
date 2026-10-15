import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Field, Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomSelect } from "../../components/CustomFields";
import { pos_sites } from "../../components/DropDownFormData";
import * as Yup from "yup";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  ArrowBack,
  FileOpen,
  LocationOn,
  Router,
  Settings,
  Storefront,
} from "@mui/icons-material";
import ComboBox from "../../components/ComboBox";
import PdfBlobViewer from "../../components/PdfBlobViewer";
import { useAuthContext } from "../../context/AuthContext";
import { isDemoMode } from "../../demo/demoApi";
import { FieldSlot, FormTextField, Section } from "./requests/RequestPOS";
// Start from the full row we came in with (it already has populated names
// for createdBy, branchName, etc.) and apply the server's updated values on
// top. When the server returns only an id for a field the row has populated,
// keep the populated object if it is the same record so names still show.
const idOf = (v) => (v && typeof v === "object" ? v._id : v);
const mergeUpdatedRow = (row, updated) => {
  const merged = { ...row };
  Object.entries(updated || {}).forEach(([key, value]) => {
    const current = row?.[key];
    if (
      current &&
      typeof current === "object" &&
      !Array.isArray(current) &&
      current._id &&
      String(idOf(current)) === String(idOf(value))
    ) {
      return; // same reference, keep the populated version
    }
    merged[key] = value;
  });
  return merged;
};

const phoneRegExp = /^[0-9]{9}$/;

const FORM_VALIDATION = Yup.object().shape({
  serialNumber: Yup.string().required("Serial number is required"),
  terminalId: Yup.string()
    .trim()
    .required("Terminal ID is required")
    .length(8, "Terminal ID must be exactly 8 characters"),
  branchName: Yup.string().required("Branch Name is required"),
  district: Yup.string().required("District is required"),
  site: Yup.string().required("Terminal site assignment is required"),
  merchantId: Yup.string()
    .trim()
    .required("Merchant ID is required")
    .length(15, "Merchant ID must be exactly 15 characters"),
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
    .trim()
    .min(9, "Service number is short. it must be minimum of 9 characters")
    .max(13, "Service number is long. it must be maximum of 13 characters"),
  contactPhonenumber: Yup.string()
    .required("Contact Phonenumber is required")
    .matches(phoneRegExp, "Contact phone number must be 9 digits"),
  businessType: Yup.string().required("Business Type is required"),
  staticIp: Yup.string()
    .required("IP Address is required")
    .matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Invalid IP Address format")
    .test("is-valid-ip", "Invalid IP Address", (value) =>
      (value || "").split(".").every((part) => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255;
      })
    ),
  status: Yup.string()
    .required("Status is required")
    .test(
      "allowed-status",
      "This status cannot be set through edit",
      // "New" is only offered when it is the current (unchanged) status.
      (value) =>
        value === "New" || EDIT_STATUS_OPTIONS.some((o) => o.value === value)
    ),
  configVersion: Yup.number()
    .typeError("Config version must be a number")
    .nullable(),
  configuredDate: Yup.date().typeError("Invalid date").nullable(),
  comment: Yup.string().max(1000, "Comment must be at most 1000 characters"),
});

// Fields sent to the server (it also allow-lists them).
const SUBMIT_FIELDS = [
  "serialNumber",
  "terminalId",
  "branchName",
  "district",
  "site",
  "posCbsAccount",
  "businessType",
  "serviceNumber",
  "staticIp",
  "merchantId",
  "contactName",
  "contactPhonenumber",
  "merchantName",
  "merchantAddress",
  "merchantPhonenumber",
  "status",
  "configVersion",
  "configuredDate",
  "comment",
];

// Statuses that can be chosen through edit (server enforces the same rule).
// Stopped and the relocation-workflow statuses have dedicated flows.
const EDIT_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "InActive", label: "InActive" },
  { value: "Relocated", label: "Relocated" },
];
const RELOCATION_WORKFLOW_STATUSES = ["ToBeRelocated", "RelocationAuthorized"];

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

const EditPOS = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const row = location.state?.row || null;
  const { currentUser, permissions } = useAuthContext();
  const can = (perm) => isDemoMode() || permissions?.includes(perm);
  const canEditConfiguredDate = can("edit_pos");
  const userDistrict = idOf(currentUser?.district) || "";
  const initialDistrict =
    idOf(row?.branchName?.district) || idOf(row?.district) || userDistrict || "";

  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [pendingValues, setPendingValues] = useState(null);
  const [attachmentOpen, setAttachmentOpen] = useState(false);

  const handleSubmit = async (values) => {
    if (submittingRef.current) return;
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/home");
      return;
    }

    const payload = {};
    SUBMIT_FIELDS.forEach((key) => {
      if (values[key] !== undefined) payload[key] = values[key];
    });
    payload.comment = (values.comment || "").trim(); // new note, appended by server
    payload.updatedAt = row.updatedAt; // optimistic concurrency check on the server
    delete payload.district; // server derives the district from the branch
    if (!canEditConfiguredDate) delete payload.configuredDate;

    submittingRef.current = true;
    setLoading(true);
    try {
      const response = await axios.put(
        `${apiUrl}/pos/updatePos/${row._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      navigate("/posdetail", {
        replace: true,
        state: {
          isRequest: false,
          relocated: false,
          row: mergeUpdatedRow(row, response.data.posTerminal),
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!row) return;
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
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setDistricts(
          (response.data?.alldistricts || []).map((district) => ({
            value: district._id,
            label: String(district.districtName ?? ""),
          }))
        );
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    };
    fetchDistricts();
  }, [navigate, row]);

  useEffect(() => {
    if (!selectedDistrict) {
      setBranches([]);
      return undefined;
    }
    let cancelled = false;
    const fetchBranches = async () => {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL;
      try {
        const response = await axios.get(`${apiUrl}/branch/getBranch`, {
          params: { districtId: selectedDistrict },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (cancelled) return;
        setBranches(
          (response.data?.branches || []).map((branch) => ({
            value: branch._id,
            label: branch.companyName,
          }))
        );
      } catch (error) {
        if (!cancelled) {
          toast.error(
            `Error fetching branches: ${
              error.response?.data?.message || error.message
            }`
          );
        }
      }
    };
    fetchBranches();
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict]);

  if (!row) {
    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Alert severity="warning">
          No POS terminal was selected. Open this page from the POS list.
        </Alert>
        <Box>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>
      </Box>
    );
  }

  const iconSx = { fontSize: 20 };
  const currentStatus = row?.status || "";
  const inRelocationWorkflow = RELOCATION_WORKFLOW_STATUSES.includes(currentStatus);
  // The current value is shown even when it can't be chosen; only "New" may
  // be kept unchanged (the server rejects other non-allowed values).
  const statusOptions =
    currentStatus && !EDIT_STATUS_OPTIONS.some((o) => o.value === currentStatus)
      ? [
          {
            value: currentStatus,
            label: `${currentStatus} (current${currentStatus === "New" ? "" : ", not selectable"})`,
          },
          ...EDIT_STATUS_OPTIONS,
        ]
      : EDIT_STATUS_OPTIONS;

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 2 }}>
      <Box sx={{ width: { xs: "100%", sm: "95%", md: "90%", lg: "80%" }, px: { xs: 1, sm: 0 } }}>
        <Formik
          initialValues={{
            serialNumber: idOf(row?.serialNumber) || "",
            terminalId: row?.terminalId || "",
            branchName: idOf(row?.branchName) || "",
            district: initialDistrict,
            site: row?.site || "",
            posCbsAccount: row?.posCbsAccount || "",
            businessType: row?.businessType || "",
            serviceNumber: row?.serviceNumber || "",
            staticIp: row?.staticIp || "",
            merchantId: row?.merchantId || "",
            contactName: row?.contactName || "",
            contactPhonenumber: row?.contactPhonenumber || "",
            merchantName: row?.merchantName || "",
            merchantAddress: row?.merchantAddress || "",
            merchantPhonenumber: row?.merchantPhonenumber || "",
            status: row?.status || "",
            configVersion: row?.configVersion ?? "",
            configuredDate: toDateInput(row?.configuredDate),
            comment: "",
          }}
          validationSchema={FORM_VALIDATION}
          onSubmit={(values) => {
            if (!loading) setPendingValues(values);
          }}
        >
          {({ setFieldValue, setFieldTouched }) => {
            const handleSelect = (name) => (e) => {
              setFieldTouched(name, true, false);
              setFieldValue(name, e.target.value, true);
            };
            return (
              <Form noValidate>
                <Stack spacing={2}>
                  {/* Header */}
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Edit POS Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Terminal {row?.terminalId || "-"} · {row?.merchantName || "-"}.
                      Fields marked * are required.
                    </Typography>
                  </Box>

                  {inRelocationWorkflow && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      This POS is in the relocation workflow ({currentStatus}).
                      Complete or reject the relocation before editing it.
                    </Alert>
                  )}

                  {/* 1. Location */}
                  <Section
                    step={1}
                    title="Location"
                    subtitle="Where the terminal is installed"
                    icon={<LocationOn sx={iconSx} />}
                  >
                    <FieldSlot name="district">
                      <CustomSelect
                        name="district"
                        label="District *"
                        options={districts}
                        onChange={(e) => {
                          handleSelect("district")(e);
                          setSelectedDistrict(e.target.value);
                          setBranches([]);
                          setFieldTouched("branchName", true, false);
                          setFieldValue("branchName", "", true);
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5, ml: 1.5, minHeight: 20 }}
                      >
                        Changing the district clears the branch
                      </Typography>
                    </FieldSlot>
                    <FieldSlot name="branchName">
                      <CustomSelect
                        name="branchName"
                        label="Branch Name *"
                        options={branches}
                        onChange={handleSelect("branchName")}
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
                        onChange={handleSelect("site")}
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
                    <FieldSlot name="merchantId">
                      <FormTextField name="merchantId" label="Merchant ID" />
                    </FieldSlot>
                  </Section>

                  {/* 3. Terminal & Network */}
                  <Section
                    step={3}
                    title="Terminal & Network"
                    subtitle="Device, connectivity and settlement account"
                    icon={<Router sx={iconSx} />}
                  >
                    <FieldSlot name="terminalId">
                      <FormTextField name="terminalId" label="Terminal ID" required />
                    </FieldSlot>
                    <FieldSlot name="serialNumber">
                      <Field name="serialNumber" component={ComboBox} disabled />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5, ml: 0.5 }}
                      >
                        Serial number cannot be changed here. Relocate the POS
                        to use a different device.
                      </Typography>
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
                      <FormTextField name="posCbsAccount" label="CBS Account" required />
                    </FieldSlot>
                  </Section>

                  {/* 4. Configuration & Status */}
                  <Section
                    step={4}
                    title="Configuration & Status"
                    subtitle="Terminal status, configuration and notes"
                    icon={<Settings sx={iconSx} />}
                  >
                    <FieldSlot name="status">
                      <CustomSelect
                        name="status"
                        label="Status *"
                        options={statusOptions}
                        onChange={handleSelect("status")}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5, ml: 1.5, minHeight: 20 }}
                      >
                        Stopping uses the dedicated stop flow; Relocated closes this POS.
                      </Typography>
                    </FieldSlot>
                    <FieldSlot name="configVersion">
                      <FormTextField
                        name="configVersion"
                        label="Config Version"
                        inputProps={{ inputMode: "numeric" }}
                      />
                    </FieldSlot>
                    <FieldSlot name="configuredDate">
                      <FormTextField
                        name="configuredDate"
                        label="Configured Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        disabled={!canEditConfiguredDate}
                        helperText={
                          canEditConfiguredDate
                            ? "Leave empty to clear"
                            : "Requires edit permission"
                        }
                      />
                    </FieldSlot>
                    {row?.comment && (
                      <FieldSlot name="commentHistory" full>
                        <TextField
                          label="Comment History"
                          value={row.comment}
                          variant="outlined"
                          size="medium"
                          fullWidth
                          multiline
                          maxRows={8}
                          helperText=" "
                          InputProps={{ readOnly: true }}
                        />
                      </FieldSlot>
                    )}
                    <FieldSlot name="comment" full>
                      <FormTextField
                        name="comment"
                        label="Add Comment"
                        multiline
                        minRows={2}
                        inputProps={{ maxLength: 1000 }}
                        helperText="Optional. Added to the comment history with your name and date."
                      />
                    </FieldSlot>
                    {row?.file?.filePath && (
                      <FieldSlot name="attachment" full>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 1 }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            Merchant Agreement
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={() => setAttachmentOpen(true)}
                            startIcon={<FileOpen />}
                          >
                            View {row.file.fileName || "attachment"}
                          </Button>
                        </Box>
                        <PdfBlobViewer
                          filePath={row.file.filePath}
                          fileName={row.file.fileName}
                          open={attachmentOpen}
                          onClose={() => setAttachmentOpen(false)}
                        />
                      </FieldSlot>
                    )}
                  </Section>

                  {/* Sticky footer, same as RequestPOS */}
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
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <LoadingButton
                        loading={loading}
                        disabled={loading || inRelocationWorkflow}
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ minWidth: 200 }}
                      >
                        Update POS
                      </LoadingButton>
                    </Stack>
                  </Paper>
                </Stack>

                <Dialog
                  open={Boolean(pendingValues)}
                  onClose={() => !loading && setPendingValues(null)}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>Confirm Update</DialogTitle>
                  <DialogContent>
                    Save changes to terminal{" "}
                    <strong>{pendingValues?.terminalId || row?.terminalId || "-"}</strong>{" "}
                    ({pendingValues?.merchantName || row?.merchantName || "-"})?
                    {pendingValues?.status && pendingValues.status !== row?.status && (
                      <>
                        <br />
                        Status will change from <strong>{row?.status || "-"}</strong> to{" "}
                        <strong>{pendingValues.status}</strong>.
                      </>
                    )}
                    {pendingValues?.status === "Relocated" && pendingValues.status !== row?.status && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Marking this POS as Relocated closes it; it can no longer be edited.
                      </Alert>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button
                      color="secondary"
                      disabled={loading}
                      onClick={() => setPendingValues(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      disabled={loading}
                      onClick={() => {
                        const values = pendingValues;
                        setPendingValues(null);
                        if (values) handleSubmit(values);
                      }}
                    >
                      Confirm
                    </Button>
                  </DialogActions>
                </Dialog>
              </Form>
            );
          }}
        </Formik>
      </Box>
    </Box>
  );
};

export default EditPOS;