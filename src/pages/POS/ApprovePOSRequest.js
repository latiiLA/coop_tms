import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import * as Yup from "yup";
import {
  ArrowBack,
  AssignmentTurnedIn,
  FileOpen,
  History,
  LocationOn,
  Router,
  Storefront,
} from "@mui/icons-material";
import {
  FieldSlot,
  FormTextField,
  Section,
} from "./requests/RequestPOS";
import LoadingButton from "@mui/lab/LoadingButton";
import PdfBlobViewer from "../../components/PdfBlobViewer";

const STATUS_COLORS = {
  New: "info",
  Authorized: "warning",
  Approved: "success",
  Rejected: "error",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const personName = (user) =>
  user && typeof user === "object"
    ? [user.firstName, user.fatherName].filter(Boolean).join(" ") || "-"
    : "-";

// Read-only value styled like RequestPOS inputs (outlined, medium, not greyed).
const ReadOnlyField = ({ label, value, full, multiline }) => (
  <FieldSlot full={full}>
    <TextField
      label={label}
      value={value === undefined || value === null || value === "" ? "-" : value}
      variant="outlined"
      size="medium"
      fullWidth
      multiline={multiline}
      helperText=" "
      InputProps={{ readOnly: true }}
    />
  </FieldSlot>
);
const ApprovePOSRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rejectionLoading, setRejectionLoading] = useState(false);
  const location = useLocation();
  const row = location.state?.row || null;

  // Pending confirmation: { type: "approve" | "reject", values }
  const [confirmAction, setConfirmAction] = useState(null);
  // Same in-page attachment viewer as POSDetails (has its own Download button).
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const busy = loading || rejectionLoading;
  const canAct = row?.status === "Authorized";

  const handleActionError = (error) => {
    toast.error(
      error.response?.data?.message || error.message || "Something went wrong"
    );
    // 409: the request was already approved/rejected elsewhere - leave the page.
    if (error.response?.status === 409) navigate(-1);
  };

  const handleSubmit = async (values, { resetForm } = {}) => {
    if (busy) return;
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }
    setLoading(true);
    try {
      // Only send what the approver assigns; the server reads the rest.
      const payload = {
        _id: row._id,
        terminalId: values.terminalId?.trim(),
        merchantId: values.merchantId?.trim(),
        remark: values.remark?.trim() || "",
      };
      const response = await axios.post(`${apiUrl}/request/approve`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      toast.success(response.data.message);
      if (resetForm) resetForm();
      navigate(-1);
    } catch (error) {
      handleActionError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (values) => {
    if (busy) return;
    const remark = values.remark?.trim() || "";
    if (remark.length < 3) {
      toast.error("A rejection remark of at least 3 characters is required.");
      return;
    }
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }
    setRejectionLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/request/reject`,
        { row: { _id: row._id, remark } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      navigate(-1);
    } catch (error) {
      handleActionError(error);
    } finally {
      setRejectionLoading(false);
    }
  };

  // Only the approver-editable fields are validated. The read-only request
  // fields are not sent and are validated by the server from stored data, so a
  // legacy value there must not silently block approval.
  const FORM_VALIDATION = Yup.object().shape({
    terminalId: Yup.string()
      .trim()
      .required("Terminal ID is required")
      .length(8, "Terminal ID must be 8 characters"),
    merchantId: Yup.string()
      .trim()
      .required("Merchant ID is required")
      .length(15, "Merchant ID must be 15 characters"),
    remark: Yup.string().max(500, "Remark must be at most 500 characters"),
  });



  if (!row) {
    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Alert severity="warning">
          No request was selected. Open this page from the request list.
        </Alert>
        <Box>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>
      </Box>
    );
  }

  const districtName =
    row?.branchName?.district?.districtName || row?.district?.districtName;

  const iconSx = { fontSize: 20 };
  const fieldsDisabled = !canAct || busy;

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 2 }}>
      <Box sx={{ width: { xs: "100%", sm: "95%", md: "90%", lg: "80%" }, px: { xs: 1, sm: 0 } }}>
        <Formik
          initialValues={{ terminalId: "", merchantId: "", remark: "" }}
          validationSchema={FORM_VALIDATION}
          onSubmit={(values) => {
            // Approve goes through a confirmation dialog.
            if (!busy) setConfirmAction({ type: "approve", values });
          }}
        >
          {({ values, resetForm }) => (
            <Form noValidate>
              <Stack spacing={2}>
                {/* Header */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Box>
                    <Typography variant="h5" fontWeight={600}>
                      Approve POS Configuration Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {row?.merchantName || "-"} · Serial{" "}
                      {row?.serialNumber?.serialNumber || "-"} · Submitted{" "}
                      {formatDate(row?.createdAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={row?.status || "Unknown"}
                    color={STATUS_COLORS[row?.status] || "default"}
                  />
                </Stack>

                {!canAct && (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    This request is in status "{row?.status || "-"}" and can only
                    be approved or rejected while it is Authorized.
                  </Alert>
                )}

                <Section
                  step={1}
                  title="Location"
                  subtitle="Where the terminal will be installed"
                  icon={<LocationOn sx={iconSx} />}
                >
                  <ReadOnlyField label="District" value={districtName} />
                  <ReadOnlyField label="Terminal Site" value={row?.site} />
                  <ReadOnlyField label="Branch" value={row?.branchName?.companyName} />
                </Section>

                <Section
                  step={2}
                  title="Merchant"
                  subtitle="Business and contact details"
                  icon={<Storefront sx={iconSx} />}
                >
                  <ReadOnlyField label="Merchant Name" value={row?.merchantName} />
                  <ReadOnlyField label="Business Type" value={row?.businessType} />
                  <ReadOnlyField label="Merchant Address" value={row?.merchantAddress} />
                  <ReadOnlyField label="Contact Name" value={row?.contactName} />
                  <ReadOnlyField label="Merchant Phone Number" value={row?.merchantPhonenumber} />
                  <ReadOnlyField label="Contact Phone Number" value={row?.contactPhonenumber} />
                  <ReadOnlyField label="CBS Account" value={row?.posCbsAccount} />
                </Section>

                <Section
                  step={3}
                  title="Device & Network"
                  subtitle="Terminal hardware and connectivity"
                  icon={<Router sx={iconSx} />}
                >
                  <ReadOnlyField label="Serial Number" value={row?.serialNumber?.serialNumber} />
                  <ReadOnlyField label="Service Number" value={row?.serviceNumber} />
                  <ReadOnlyField label="Static IP Address" value={row?.staticIp} />
                </Section>

                <Section
                  step={4}
                  title="Request History"
                  subtitle="Who submitted and authorized this request"
                  icon={<History sx={iconSx} />}
                >
                  <ReadOnlyField label="Requested By" value={personName(row?.createdBy)} />
                  <ReadOnlyField label="Authorized By" value={personName(row?.reqAuthorizedBy)} />
                  <ReadOnlyField label="Created At" value={formatDate(row?.createdAt)} />
                  <ReadOnlyField label="Last Updated" value={formatDate(row?.updatedAt)} />
                  {row?.remark && (
                    <ReadOnlyField label="Previous Remark" value={row.remark} full multiline />
                  )}
                  {row?.file?.filePath && (
                    <FieldSlot full>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flexWrap: "wrap",
                          mb: 1,
                        }}
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

                <Section
                  step={5}
                  title="Approval"
                  subtitle="Assign terminal identifiers, or reject with a reason"
                  icon={<AssignmentTurnedIn sx={iconSx} />}
                >
                  <FieldSlot name="terminalId">
                    <FormTextField
                      name="terminalId"
                      label="Terminal ID"
                      required
                      disabled={fieldsDisabled}
                      inputProps={{ maxLength: 8 }}
                      helperText={`Exactly 8 characters (${(values.terminalId || "").length}/8)`}
                    />
                  </FieldSlot>
                  <FieldSlot name="merchantId">
                    <FormTextField
                      name="merchantId"
                      label="Merchant ID"
                      required
                      disabled={fieldsDisabled}
                      inputProps={{ maxLength: 15 }}
                      helperText={`Exactly 15 characters (${(values.merchantId || "").length}/15)`}
                    />
                  </FieldSlot>
                  <FieldSlot name="remark" full>
                    <FormTextField
                      name="remark"
                      label="Remark"
                      multiline
                      minRows={3}
                      disabled={fieldsDisabled}
                      inputProps={{ maxLength: 500 }}
                      helperText={`Optional for approval; required (min 3 characters) to reject (${(values.remark || "").length}/500)`}
                    />
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
                    <Button
                      startIcon={<ArrowBack />}
                      onClick={() => navigate(-1)}
                      disabled={busy}
                    >
                      Back
                    </Button>
                    <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5}>
                      <LoadingButton
                        loading={rejectionLoading}
                        disabled={fieldsDisabled}
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          if ((values.remark?.trim() || "").length < 3) {
                            toast.error(
                              "A rejection remark of at least 3 characters is required."
                            );
                            return;
                          }
                          setConfirmAction({ type: "reject", values });
                        }}
                      >
                        Reject
                      </LoadingButton>
                      <LoadingButton
                        loading={loading}
                        disabled={fieldsDisabled}
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ minWidth: 200 }}
                      >
                        Approve
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>

              <Dialog
                open={Boolean(confirmAction)}
                onClose={() => !busy && setConfirmAction(null)}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>
                  {confirmAction?.type === "reject"
                    ? "Confirm Rejection"
                    : "Confirm Approval"}
                </DialogTitle>
                <DialogContent>
                  {confirmAction?.type === "reject" ? (
                    <>
                      Reject the request for{" "}
                      <strong>{row?.merchantName || "-"}</strong>?
                      <br />
                      Reason: {confirmAction?.values?.remark?.trim()}
                    </>
                  ) : (
                    <>
                      Approve the request for{" "}
                      <strong>{row?.merchantName || "-"}</strong> with Terminal
                      ID <strong>{confirmAction?.values?.terminalId?.trim()}</strong>{" "}
                      and Merchant ID{" "}
                      <strong>{confirmAction?.values?.merchantId?.trim()}</strong>?
                      {confirmAction?.values?.remark?.trim() && (
                        <>
                          <br />
                          Remark: {confirmAction.values.remark.trim()}
                        </>
                      )}
                    </>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button
                    color="secondary"
                    disabled={busy}
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color={confirmAction?.type === "reject" ? "error" : "primary"}
                    disabled={busy}
                    onClick={() => {
                      const action = confirmAction;
                      setConfirmAction(null);
                      if (action?.type === "reject") {
                        handleReject(action.values);
                      } else if (action) {
                        handleSubmit(action.values, { resetForm });
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default ApprovePOSRequest;
