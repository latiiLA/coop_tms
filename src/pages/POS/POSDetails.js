import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileOpen,
  PointOfSale,
  Storefront,
  AssignmentTurnedIn,
  LocalShipping,
  Settings,
} from "@mui/icons-material";
import PdfBlobViewer from "../../components/PdfBlobViewer";

const EMPTY = "—";

// "First Father" from a populated user ref; — when missing or unpopulated.
const personName = (user) => {
  if (!user || typeof user !== "object") return EMPTY;
  const name = [user.firstName, user.fatherName].filter(Boolean).join(" ");
  return name || user.username || EMPTY;
};

// Accepts ISO strings and the server's pre-formatted "PPpp" strings.
const formatDate = (value) => {
  if (!value) return EMPTY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const show = (value) =>
  value === null || value === undefined || value === "" ? EMPTY : value;

const STATUS_COLORS = {
  Active: "success",
  Approved: "success",
  New: "info",
  Authorized: "info",
  ToBeRelocated: "warning",
  RelocationAuthorized: "warning",
  Stopped: "default",
  Rejected: "error",
  Deleted: "error",
};

const STATUS_LABELS = {
  ToBeRelocated: "Relocation Requested",
  RelocationAuthorized: "Relocation Authorized",
};

const RELOCATION_STATUSES = ["ToBeRelocated", "RelocationAuthorized"];

const Field = ({ label, value }) => (
  <Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
    >
      {label}
    </Typography>
    <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
      {show(value)}
    </Typography>
  </Box>
);

const Section = ({ title, icon, children }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      height: "100%",
    }}
  >
    <CardContent>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {children}
      </Box>
    </CardContent>
  </Card>
);

const POSDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRequest, isRelocated, row } = location.state || {};

  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfPath, setPdfPath] = useState("");

  const handlePdfView = (filepath) => {
    setPdfPath(filepath);
    setPdfOpen(true);
  };

  const status = row?.status;
  const hasRelocation =
    !isRequest &&
    !!row &&
    (RELOCATION_STATUSES.includes(status) ||
      !!row.assignRelocationAuthorizer ||
      !!row.relocationAuthorizedBy ||
      !!row.relocationRejectedBy);

  const iconSx = { color: "primary.main" };

  return (
    <Box sx={{ width: { xs: "100%", sm: "95%", md: "90%" }, mx: "auto", mt: 2 }}>
      {/* Header */}
      <Card
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 2,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="overline" color="text.secondary">
              {isRequest ? "Request Details" : "POS Details"}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {row?.merchantName || EMPTY}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(!isRequest || isRelocated) && `Terminal ${show(row?.terminalId)}`}
              {!isRequest && ` · Merchant ${show(row?.merchantId)}`}
              {` · S/N ${show(row?.serialNumber?.serialNumber)}`}
            </Typography>
          </Box>
          {status && (
            <Chip
              label={STATUS_LABELS[status] || status}
              color={STATUS_COLORS[status] || "default"}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>
      </Card>

      {!row && (
        <Typography color="text.secondary" textAlign="center" sx={{ my: 3 }}>
          No record selected. Go back and open Details from the list.
        </Typography>
      )}

      {row && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Section title="Terminal" icon={<PointOfSale sx={iconSx} />}>
              {(!isRequest || isRelocated) && (
                <Field label="Terminal ID" value={row.terminalId} />
              )}
              <Field label="Serial Number" value={row.serialNumber?.serialNumber} />
              <Field label="Terminal Site" value={row.site} />
              <Field label="Static IP Address" value={row.staticIp} />
              <Field label="Service Number" value={row.serviceNumber} />
              <Field label="CBS Account" value={row.posCbsAccount} />
            </Section>
          </Box>

          <Box>
            <Section title="Merchant & Location" icon={<Storefront sx={iconSx} />}>
              {!isRequest && <Field label="Merchant ID" value={row.merchantId} />}
              <Field label="Merchant Name" value={row.merchantName} />
              <Field label="Business Type" value={row.businessType} />
              <Field label="Branch" value={row.branchName?.companyName} />
              <Field label="District" value={row.branchName?.district?.districtName} />
              <Field label="Merchant Address" value={row.merchantAddress} />
              <Field label="Contact Name" value={row.contactName} />
              <Field label="Contact Phone" value={row.contactPhonenumber} />
              <Field label="Merchant Phone" value={row.merchantPhonenumber} />
            </Section>
          </Box>

          <Box sx={{ gridColumn: { md: hasRelocation ? "auto" : "1 / -1" } }}>
            <Section
              title={isRequest ? "Request & Approval" : "Request, Approval & Audit"}
              icon={<AssignmentTurnedIn sx={iconSx} />}
            >
              {!isRequest && (
                <>
                  <Field label="Request Created By" value={personName(row.reqCreatedBy)} />
                  <Field label="Request Authorized By" value={personName(row.reqAuthorizedBy)} />
                </>
              )}
              <Field label="Created By" value={personName(row.createdBy)} />
              {isRequest && (
                <Field
                  label="Assigned User"
                  value={personName(row.assignAuthorizationUser)}
                />
              )}
              {isRequest && row.reqAuthorizedBy && (
                <Field label="Request Authorized By" value={personName(row.reqAuthorizedBy)} />
              )}
              {isRequest && status === "Rejected" && (
                <Field label="Rejected By" value={personName(row.rejectedBy)} />
              )}
              {isRequest && status === "Approved" && (
                <Field label="Approved By" value={personName(row.approvedBy)} />
              )}
              {!isRequest && row.deleteRequestedBy && !hasRelocation && (
                <Field
                  label="POS Termination Requested By"
                  value={personName(row.deleteRequestedBy)}
                />
              )}
              {!isRequest && row.deletedBy && !["Relocated", "Stopped"].includes(status) && (
                <Field label="POS Terminated By" value={personName(row.deletedBy)} />
              )}
              <Field label="Created At" value={formatDate(row.createdAt)} />
              <Field label="Updated At" value={formatDate(row.updatedAt)} />
              {isRequest && <Field label="Remark" value={row.remark} />}
              {!isRequest && row.comment && <Field label="Comment" value={row.comment} />}
            </Section>
          </Box>

          {hasRelocation && (
            <Box>
              <Section title="Relocation" icon={<LocalShipping sx={iconSx} />}>
                <Field label="Relocation Status" value={STATUS_LABELS[status] || status} />
                <Field
                  label="Relocation Authorizer (Assigned)"
                  value={personName(row.assignRelocationAuthorizer)}
                />
                <Field label="Requested By" value={personName(row.deleteRequestedBy)} />
                {row.relocationAuthorizedBy && (
                  <Field
                    label="Relocation Authorized By"
                    value={personName(row.relocationAuthorizedBy)}
                  />
                )}
                {row.relocationRejectedBy && (
                  <Field
                    label="Relocation Rejected By"
                    value={personName(row.relocationRejectedBy)}
                  />
                )}
                {row.relocationRejectedBy && (
                  <Field label="Rejected At" value={formatDate(row.relocationRejectedAt)} />
                )}
                {status === "Relocated" && (
                  <Field label="Relocated By" value={personName(row.deletedBy)} />
                )}
                {status === "Stopped" && (
                  <Field label="Stopped By" value={personName(row.deletedBy)} />
                )}
                <Field label="Last Updated" value={formatDate(row.updatedAt)} />
                {row.remark && <Field label="Remark" value={row.remark} />}
              </Section>
            </Box>
          )}

          {!isRequest && (
            <Box sx={{ gridColumn: { md: row.file ? "auto" : "1 / -1" } }}>
              <Section title="Configuration" icon={<Settings sx={iconSx} />}>
                <Field label="Config Version" value={row.configVersion} />
                <Field
                  label="Config Date"
                  value={
                    row.configuredDate
                      ? new Date(row.configuredDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : EMPTY
                  }
                />
                {row.configuredBy && (
                  <Field label="Configured By" value={personName(row.configuredBy)} />
                )}
              </Section>
            </Box>
          )}

          {row.file && (
            <Box sx={{ gridColumn: { md: isRequest ? "1 / -1" : "auto" } }}>
              <Section title="Merchant Agreement" icon={<FileOpen sx={iconSx} />}>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Button
                    variant="contained"
                    onClick={() => handlePdfView(row.file.filePath)}
                    startIcon={<FileOpen />}
                  >
                    View {row.file.fileName}
                  </Button>
                  <PdfBlobViewer
                    filePath={pdfPath}
                    fileName={row.file.fileName}
                    open={pdfOpen}
                    onClose={() => setPdfOpen(false)}
                  />
                </Box>
              </Section>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Button onClick={() => navigate("/")}>Home</Button>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </Box>
  );
};

export default POSDetails;
