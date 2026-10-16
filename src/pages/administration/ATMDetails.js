import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Atm,
  Edit,
  Storefront,
  AssignmentTurnedIn,
  SettingsEthernet,
  TravelExplore,
} from "@mui/icons-material";
import PdfBlobViewer from "../../components/PdfBlobViewer";
import { isRetiredAtm, retiredAtmMessage } from "../../components/atm/atmFormShared";
import { useAuthContext } from "../../context/AuthContext";
import { isDemoMode } from "../../demo/demoApi";

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

// Terminal statuses come from terminalController: New (default), and the
// lifecycle values set on delete / relocation.
const STATUS_COLORS = {
  Active: "success",
  New: "info",
  Relocated: "warning",
  Stopped: "default",
  Deleted: "error",
};

const STATUS_LABELS = {
  Relocated: "Relocated",
  Stopped: "Stopped",
};

// Terminals are relocated (or deleted) outright; there is no request stage.
const LIFECYCLE_STATUSES = ["Relocated", "Stopped", "Deleted"];

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

const ATMDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { row, isRelocated } = location.state || {};
  const { permissions } = useAuthContext();
  const canEdit = isDemoMode() || permissions?.includes("edit_terminal");
  const editLocked = Boolean(isRelocated) || isRetiredAtm(row);

  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfPath, setPdfPath] = useState("");

  const handlePdfView = (filepath) => {
    setPdfPath(filepath);
    setPdfOpen(true);
  };

  // The district is populated on the terminal directly by getAllTerminal and
  // nested under branchName by getTerminal; support both shapes.
  const districtName =
    row?.district?.districtName || row?.branchName?.district?.districtName;

  const status = row?.status;
  const isLifecycle = LIFECYCLE_STATUSES.includes(status);

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
              {isRelocated ? "Relocated ATM Details" : "ATM Details"}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {row?.terminalName || EMPTY}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Type ${show(row?.type)}`}
              {` · Terminal ID ${show(row?.terminalId)}`}
              {` · Unit ID ${show(row?.unitId)}`}
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
            <Section title="Terminal" icon={<Atm sx={iconSx} />}>
              <Field label="Unit ID" value={row.unitId} />
              <Field label="Terminal ID" value={row.terminalId} />
              <Field label="Terminal Name" value={row.terminalName} />
              <Field label="Type" value={row.type} />
              <Field label="Terminal Site" value={row.site} />
              <Field label="Status" value={STATUS_LABELS[status] || status} />
            </Section>
          </Box>

          <Box>
            <Section title="Location" icon={<Storefront sx={iconSx} />}>
              <Field label="Branch" value={row.branchName?.companyName} />
              <Field label="District" value={districtName} />
              <Field label="Terminal Site" value={row.site} />
            </Section>
          </Box>

          <Box>
            <Section
              title={isLifecycle ? "Lifecycle & Audit" : "Audit"}
              icon={<AssignmentTurnedIn sx={iconSx} />}
            >
              <Field label="Created By" value={personName(row.createdBy)} />
              {isLifecycle && (
                <Field
                  label={status === "Deleted" ? "Deleted By" : "Relocated By"}
                  value={personName(row.deletedBy)}
                />
              )}
              {isLifecycle && status === "Relocated" && (
                <Field label="Relocated To" value={row.relocatedTo} />
              )}
              {isLifecycle && row.remark && (
                <Field label="Remark" value={row.remark} />
              )}
              <Field label="Created At" value={formatDate(row.createdAt)} />
              <Field label="Updated At" value={formatDate(row.updatedAt)} />
            </Section>
          </Box>

          <Box>
            <Section title="Connectivity" icon={<SettingsEthernet sx={iconSx} />}>
              <Field label="IP Address" value={row.ipAddress} />
              <Field label="Port" value={row.port} />
              <Field label="CBS Account" value={row.cbsAccount} />
            </Section>
          </Box>

          {row.file && (
            <Box>
              <Section title="Documents" icon={<TravelExplore sx={iconSx} />}>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Button
                    variant="contained"
                    onClick={() => handlePdfView(row.file.filePath)}
                    startIcon={<TravelExplore />}
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
        {canEdit && row?._id && (
          <Tooltip title={editLocked ? retiredAtmMessage(row) : "Edit Terminal"}>
            {/* span: a disabled button can't show a tooltip itself */}
            <span>
              <Button
                variant="contained"
                startIcon={<Edit />}
                disabled={editLocked}
                onClick={() => navigate("/edit", { state: { row } })}
              >
                Edit
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default ATMDetails;