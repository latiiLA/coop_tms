import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack, Badge, LocationOn, Lock, Storefront } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CustomSelect } from "../../components/CustomFields";
import { useAuthContext } from "../../context/AuthContext";
import { FieldSlot, FormTextField, Section } from "../POS/requests/RequestPOS";

const CBSC_TYPES = [
  { value: "ECOMMERCE", label: "Ecommerce" },
  { value: "AFT", label: "AFT" },
];

const INITIAL_FORM_STATE = {
  district: "",
  branchID: "",
  merchantName: "",
  cbscMerchantID: "",
  cboMerchantID: "",
  terminalID: "",
  cbsAccount: "",
  cbscType: "",
};

const FORM_VALIDATION = Yup.object().shape({
  district: Yup.string().required("District is required"),
  branchID: Yup.string().required("Branch Name is required"),
  merchantName: Yup.string()
    .trim()
    .required("Merchant name is required")
    .min(3, "Merchant name must be at least 3 characters")
    .max(200, "Merchant name is too long"),
  cbscMerchantID: Yup.string().trim().required("Cybersource merchant ID is required").max(200),
  cboMerchantID: Yup.string().trim().required("CBO merchant ID is required").max(200),
  terminalID: Yup.string().trim().required("Terminal ID is required").max(200),
  cbsAccount: Yup.string().trim().required("CBS account is required").max(200),
  cbscType: Yup.string()
    .required("Cybersource type is required")
    .oneOf(CBSC_TYPES.map((t) => t.value), "Invalid Cybersource type"),
});

const idOf = (v) => (v && typeof v === "object" ? v._id : v);

const CreateCybersourceTerminal = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const userDistrict = idOf(currentUser?.district) || "";

  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [pendingValues, setPendingValues] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(userDistrict);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }
    (async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/district/getDistrict`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setDistricts(
          (response.data?.alldistricts || []).map((d) => ({
            value: d._id,
            label: String(d.districtName ?? ""),
          }))
        );
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!selectedDistrict) {
      setBranches([]);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/branch/getBranch`, {
          params: { districtId: selectedDistrict },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        });
        if (!cancelled) {
          setBranches(
            (response.data?.branches || []).map((b) => ({ value: b._id, label: b.companyName }))
          );
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            `Error fetching branches: ${error.response?.data?.message || error.message}`
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDistrict]);

  const handleCreate = async (values, resetForm) => {
    if (submittingRef.current) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cybersource/createCybersourceTerminal`,
        {
          merchantName: values.merchantName.trim(),
          cbscMerchantID: values.cbscMerchantID.trim(),
          cboMerchantID: values.cboMerchantID.trim(),
          terminalID: values.terminalID.trim(),
          cbsAccount: values.cbsAccount.trim(),
          cbscType: values.cbscType,
          branchID: values.branchID,
        },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(response.data?.message || "Cybersource terminal created successfully");
      // Existing behaviour: stay on the page with a fresh form.
      resetForm({ values: { ...INITIAL_FORM_STATE, district: userDistrict } });
      setSelectedDistrict(userDistrict);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const iconSx = { fontSize: 20 };
  const labelOf = (options, value) =>
    options.find((o) => String(o.value) === String(value))?.label || value || "-";

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 2 }}>
      <Box sx={{ width: { xs: "100%", sm: "95%", md: "90%", lg: "80%" }, px: { xs: 1, sm: 0 } }}>
        <Formik
          initialValues={{ ...INITIAL_FORM_STATE, district: userDistrict }}
          validationSchema={FORM_VALIDATION}
          onSubmit={(values) => {
            if (!loading) setPendingValues(values);
          }}
        >
          {({ setFieldValue, setFieldTouched, resetForm }) => {
            const setSelect = (name, value) => {
              setFieldTouched(name, true, false);
              setFieldValue(name, value, true);
            };
            return (
              <Form noValidate>
                <Stack spacing={2}>
                  {/* Header */}
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      New Cybersource Terminal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fields marked * are required.
                    </Typography>
                  </Box>

                  {/* 1. Location */}
                  <Section
                    step={1}
                    title="Location"
                    subtitle="Branch the terminal belongs to"
                    icon={<LocationOn sx={iconSx} />}
                  >
                    <FieldSlot name="district">
                      <CustomSelect
                        name="district"
                        label="District *"
                        options={districts}
                        disabled={!!userDistrict}
                        onChange={(e) => {
                          setSelect("district", e.target.value);
                          setSelectedDistrict(e.target.value);
                          setBranches([]);
                          setFieldTouched("branchID", false, false);
                          setFieldValue("branchID", "", false);
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
                    <FieldSlot name="branchID">
                      <CustomSelect
                        name="branchID"
                        label="Branch Name *"
                        options={branches}
                        onChange={(e) => setSelect("branchID", e.target.value)}
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
                  </Section>

                  {/* 2. Merchant */}
                  <Section
                    step={2}
                    title="Merchant"
                    subtitle="Merchant and settlement account"
                    icon={<Storefront sx={iconSx} />}
                  >
                    <FieldSlot name="merchantName">
                      <FormTextField
                        name="merchantName"
                        label="Merchant Name"
                        required
                        helperText="At least 3 characters"
                      />
                    </FieldSlot>
                    <FieldSlot name="cbsAccount">
                      <FormTextField name="cbsAccount" label="CBS Account" required />
                    </FieldSlot>
                  </Section>

                  {/* 3. Cybersource */}
                  <Section
                    step={3}
                    title="Cybersource"
                    subtitle="Type and identifiers"
                    icon={<Badge sx={iconSx} />}
                  >
                    <FieldSlot name="cbscType">
                      <CustomSelect
                        name="cbscType"
                        label="Cybersource Type *"
                        options={CBSC_TYPES}
                        onChange={(e) => setSelect("cbscType", e.target.value)}
                      />
                      <Box sx={{ minHeight: 20, mt: 0.5 }} />
                    </FieldSlot>
                    <FieldSlot name="terminalID">
                      <FormTextField
                        name="terminalID"
                        label="Terminal ID"
                        required
                        helperText="Must be unique"
                      />
                    </FieldSlot>
                    <FieldSlot name="cbscMerchantID">
                      <FormTextField
                        name="cbscMerchantID"
                        label="Cybersource Merchant ID"
                        required
                        helperText="Must be unique"
                      />
                    </FieldSlot>
                    <FieldSlot name="cboMerchantID">
                      <FormTextField name="cboMerchantID" label="CBO Merchant ID" required />
                    </FieldSlot>
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
                      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} disabled={loading}>
                        Back
                      </Button>
                      <LoadingButton
                        loading={loading}
                        disabled={loading}
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ minWidth: 200 }}
                      >
                        Add Cybersource Terminal
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
                  <DialogTitle>Confirm New Cybersource Terminal</DialogTitle>
                  <DialogContent>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Create this Cybersource terminal?
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        columnGap: 2,
                        rowGap: 0.5,
                      }}
                    >
                      {[
                        ["District", labelOf(districts, pendingValues?.district)],
                        ["Branch", labelOf(branches, pendingValues?.branchID)],
                        ["Merchant Name", pendingValues?.merchantName],
                        ["CBS Account", pendingValues?.cbsAccount],
                        ["Type", labelOf(CBSC_TYPES, pendingValues?.cbscType)],
                        ["Terminal ID", pendingValues?.terminalID],
                        ["Cybersource Merchant ID", pendingValues?.cbscMerchantID],
                        ["CBO Merchant ID", pendingValues?.cboMerchantID],
                      ].map(([label, value]) => (
                        <React.Fragment key={label}>
                          <Typography variant="body2" color="text.secondary">
                            {label}
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                            {value || "-"}
                          </Typography>
                        </React.Fragment>
                      ))}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button color="secondary" disabled={loading} onClick={() => setPendingValues(null)}>
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      disabled={loading}
                      onClick={() => {
                        const values = pendingValues;
                        setPendingValues(null);
                        if (values) handleCreate(values, resetForm);
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

export default CreateCybersourceTerminal;