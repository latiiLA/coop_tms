import React, { useMemo, useRef, useState } from "react";
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
  Typography,
} from "@mui/material";
import { ArrowBack, EventNote } from "@mui/icons-material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomSelect } from "../../components/CustomFields";
import { atm_status } from "../../components/DropDownFormData";
import { useAuthContext } from "../../context/AuthContext";
import { FieldSlot, FormTextField, Section } from "../POS/requests/RequestPOS";
import {
  ATM_INITIAL_VALUES,
  AtmFormFooter,
  AtmFormSections,
  ConfirmRows,
  buildAtmSchema,
  idOf,
  isRetiredAtm,
  labelOf,
  retiredAtmMessage,
  toPortOptions,
  trimValues,
  useAvailablePorts,
  useBranchOptions,
  useDistrictOptions,
} from "../../components/atm/atmFormShared";

const RETIRING_STATUSES = ["Stopped", "Relocated"];
const MAX_REMARK_LENGTH = 500;

const STATUS_RULES = {
  status: Yup.string().required("Status is required"),
  relocatedTo: Yup.string()
    .trim()
    .max(200, "At most 200 characters")
    .when("status", {
      is: "Relocated",
      then: (s) => s.required("Relocated To is required when the status is Relocated"),
    }),
  remark: Yup.string().trim().max(MAX_REMARK_LENGTH, `At most ${MAX_REMARK_LENGTH} characters`),
};

const FIELD_LABELS = [
  ["type", "Type"],
  ["unitId", "Unit ID"],
  ["terminalId", "Terminal ID"],
  ["terminalName", "Terminal Name"],
  ["district", "District"],
  ["branchName", "Branch"],
  ["site", "Site"],
  ["port", "Port"],
  ["ipAddress", "IP Address"],
  ["cbsAccount", "CBS Account"],
  ["status", "Status"],
  ["relocatedTo", "Relocated To"],
  ["remark", "Remark"],
];

const str = (v) => (v === undefined || v === null ? "" : String(v));

const toFormValues = (row) => ({
  ...ATM_INITIAL_VALUES,
  type: str(row.type),
  unitId: str(row.unitId),
  terminalId: str(row.terminalId),
  terminalName: str(row.terminalName),
  district: str(idOf(row.district) || idOf(row.branchName?.district)),
  branchName: str(idOf(row.branchName)),
  site: str(row.site),
  port: str(row.port),
  cbsAccount: str(row.cbsAccount),
  ipAddress: str(row.ipAddress),
  status: str(row.status) || "New",
  relocatedTo: str(row.relocatedTo),
  remark: str(row.remark),
});

const EditTerminalForm = ({ row }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const userDistrict = idOf(currentUser?.district) || "";

  const initialValues = useMemo(() => toFormValues(row), [row]);
  // Stopped / Relocated ATMs are read-only (server refuses with 409 too).
  const locked = isRetiredAtm(row);
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [pending, setPending] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(initialValues.district);
  const [selectedType, setSelectedType] = useState(initialValues.type);
  const [selectedSite, setSelectedSite] = useState(initialValues.site);

  const districts = useDistrictOptions();
  const { branches, branchesLoaded } = useBranchOptions(selectedDistrict);
  const current = useMemo(
    () => ({ port: initialValues.port, site: initialValues.site, type: initialValues.type }),
    [initialValues]
  );
  const { availablePorts, portsLoaded } = useAvailablePorts(selectedSite, selectedType, current);
  const portOptions = toPortOptions(availablePorts, initialValues.port);
  const validationSchema = useMemo(
    () => buildAtmSchema(availablePorts, STATUS_RULES),
    [availablePorts]
  );

  // Keep the current status selectable even if it is not in the dropdown list.
  const statusOptions = atm_status.some((o) => o.value === initialValues.status)
    ? atm_status
    : [{ value: initialValues.status, label: initialValues.status }, ...atm_status];

  const display = (key, values) => {
    if (key === "district") return labelOf(districts, values.district);
    if (key === "branchName") {
      if (values.branchName === initialValues.branchName && row.branchName?.companyName) {
        return labelOf(branches, values.branchName) === values.branchName
          ? row.branchName.companyName
          : labelOf(branches, values.branchName);
      }
      return labelOf(branches, values.branchName);
    }
    return values[key];
  };

  const handleUpdate = async (values) => {
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
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/terminal/updateTerminal/${row._id}`,
        { ...trimValues(values), updatedAt: row.updatedAt },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(response.data?.message || "Terminal successfully updated.");
      navigate("/atmdetail", { state: { row: response.data?.terminal } });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 2 }}>
      <Box sx={{ width: { xs: "100%", sm: "95%", md: "90%", lg: "80%" }, px: { xs: 1, sm: 0 } }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (loading || locked) return;
            const trimmed = trimValues(values);
            const changes = FIELD_LABELS.filter(
              ([key]) => str(trimmed[key]) !== str(initialValues[key])
            ).map(([key, label]) => [
              label,
              `${str(display(key, initialValues)) || "-"} → ${str(display(key, trimmed)) || "-"}`,
            ]);
            if (changes.length === 0) {
              toast("No changes to save.");
              return;
            }
            setPending({ values, changes });
          }}
        >
          {({ values, setFieldValue, setFieldTouched }) => {
            const retiring =
              RETIRING_STATUSES.includes(values.status) &&
              values.status !== initialValues.status;
            return (
              <Form noValidate>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Update ATM Terminal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row.terminalName || row.terminalId || ""} · Fields marked * are required.
                    </Typography>
                  </Box>

                  {locked && (
                    <Alert severity="warning" variant="outlined">
                      {retiredAtmMessage(row)} The details below are read-only.
                    </Alert>
                  )}

                  {/* Read-only for retired ATMs: block all input in the sections. */}
                  <Box
                    component="fieldset"
                    disabled={locked}
                    aria-disabled={locked}
                    sx={{
                      border: 0,
                      p: 0,
                      m: 0,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      ...(locked && { pointerEvents: "none", opacity: 0.7 }),
                    }}
                  >
                  <AtmFormSections
                    formik={{ setFieldValue, setFieldTouched }}
                    districts={districts}
                    branches={branches}
                    branchesLoaded={branchesLoaded}
                    userDistrict={userDistrict}
                    selectedDistrict={selectedDistrict}
                    selectedSite={selectedSite}
                    selectedType={selectedType}
                    portOptions={portOptions}
                    portsLoaded={portsLoaded}
                    onDistrictChange={setSelectedDistrict}
                    onTypeChange={setSelectedType}
                    onSiteChange={setSelectedSite}
                  />

                  {/* 4. Status (edit only, kept from the old ATMForm) */}
                  <Section
                    step={4}
                    title="Status"
                    subtitle="Lifecycle status, relocation and remarks"
                    icon={<EventNote sx={{ fontSize: 20 }} />}
                  >
                    <FieldSlot name="status">
                      <CustomSelect
                        name="status"
                        label="Status *"
                        options={statusOptions}
                        onChange={(e) => {
                          setFieldTouched("status", true, false);
                          setFieldValue("status", e.target.value, true);
                        }}
                      />
                      <Typography
                        variant="caption"
                        color={retiring ? "warning.main" : "text.secondary"}
                        sx={{ display: "block", mt: 0.5, ml: 1.5, minHeight: 20 }}
                      >
                        {retiring
                          ? "Retires the terminal and frees its port. It can't be edited afterwards."
                          : ""}
                      </Typography>
                    </FieldSlot>
                    <FieldSlot name="relocatedTo">
                      <FormTextField
                        name="relocatedTo"
                        label="Relocated To"
                        required={values.status === "Relocated"}
                        helperText="Required when the status is Relocated"
                      />
                    </FieldSlot>
                    <FieldSlot name="remark">
                      <FormTextField
                        name="remark"
                        label="Remark"
                        helperText={`Optional, at most ${MAX_REMARK_LENGTH} characters`}
                      />
                    </FieldSlot>
                  </Section>
                  </Box>

                  <AtmFormFooter
                    loading={loading}
                    submitLabel="Update Terminal"
                    disabled={locked}
                    onBack={() => navigate(-1)}
                  />
                </Stack>

                <Dialog
                  open={Boolean(pending)}
                  onClose={() => !loading && setPending(null)}
                  fullWidth
                  maxWidth="sm"
                >
                  <DialogTitle>Confirm Terminal Update</DialogTitle>
                  <DialogContent>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Save these changes to {row.terminalId || "this terminal"}?
                    </Typography>
                    <ConfirmRows rows={pending?.changes || []} />
                    {pending && RETIRING_STATUSES.includes(pending.values.status) &&
                      pending.values.status !== initialValues.status && (
                        <Typography variant="body2" color="warning.main" sx={{ mt: 1.5 }}>
                          The terminal will be marked {pending.values.status} and its port released.
                        </Typography>
                      )}
                  </DialogContent>
                  <DialogActions>
                    <Button color="secondary" disabled={loading} onClick={() => setPending(null)}>
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      disabled={loading}
                      onClick={() => {
                        const values = pending?.values;
                        setPending(null);
                        if (values) handleUpdate(values);
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

const EditTerminal = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const row = state?.row;

  if (!row || !row._id) {
    return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, maxWidth: 480, width: "100%" }}>
          <Typography variant="h6" gutterBottom>
            No terminal selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Open this page from a terminal's details to edit it.
          </Typography>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </Paper>
      </Box>
    );
  }
  return <EditTerminalForm row={row} />;
};

export default EditTerminal;