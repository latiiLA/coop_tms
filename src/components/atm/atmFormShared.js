import React, { useEffect, useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { ArrowBack, Lock, LocationOn, Router, Storefront } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { CustomSelect } from "../CustomFields";
import { atm_types, sites } from "../DropDownFormData";
import { FieldSlot, FormTextField, Section } from "../../pages/POS/requests/RequestPOS";

// Shared by AddTerminal and EditTerminal: field config, validation, data
// hooks and the three form sections, so both pages stay identical.

export const idOf = (v) => (v && typeof v === "object" ? v._id : v);

// Stopped / Relocated / Deleted ATMs are frozen: never editable (the server
// refuses with 409 as well).
export const RETIRED_ATM_STATUSES = ["Stopped", "Relocated", "Deleted"];
export const isRetiredAtm = (row) =>
  !!row &&
  (row.isDeleted === true ||
    row.portReleased === true ||
    RETIRED_ATM_STATUSES.includes(row.status));
export const retiredAtmMessage = (row) =>
  `This ATM is ${row?.status || "retired"} and can no longer be edited.`;

export const ATM_INITIAL_VALUES = {
  type: "",
  unitId: "",
  terminalId: "",
  terminalName: "",
  district: "",
  branchName: "",
  site: "",
  port: "",
  cbsAccount: "",
  ipAddress: "",
};

export const isValidIPv4 = (value) => {
  if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value || "")) return false;
  return value.split(".").every((part) => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
};

// Same rules as the server's validateTerminalInput.
export const buildAtmSchema = (availablePorts, extra = {}) =>
  Yup.object().shape({
    type: Yup.string().required("ATM Type is required"),
    unitId: Yup.string()
      .trim()
      .required("Unit ID is required")
      .matches(/^\d+$/, "Unit ID must be a whole number"),
    terminalId: Yup.string()
      .trim()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),
    terminalName: Yup.string().trim().required("Terminal Name is required"),
    district: Yup.string().required("District is required"),
    branchName: Yup.string().required("Branch Name is required"),
    site: Yup.string().required("Terminal site assignment is required"),
    port: Yup.string()
      .required("Port is required")
      .test("is-valid-port", "Port must be a valid selection", (value) =>
        availablePorts.some((p) => String(p.portNumber) === String(value))
      ),
    cbsAccount: Yup.string()
      .trim()
      .required("CBS Account is required")
      .min(12, "CBS Account must be at least 12 characters"),
    ipAddress: Yup.string()
      .trim()
      .required("IP Address is required")
      .test("is-valid-ip", "Invalid IP Address", (value) => isValidIPv4(value)),
    ...extra,
  });

export const trimValues = (values) =>
  Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
  );

export const labelOf = (options, value) =>
  options.find((o) => String(o.value) === String(value))?.label || value || "-";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const useDistrictOptions = () => {
  const [districts, setDistricts] = useState([]);
  useEffect(() => {
    if (!localStorage.getItem("token")) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/district/getDistrict`,
          { headers: authHeaders(), withCredentials: true }
        );
        if (!cancelled) {
          setDistricts(
            (response.data?.alldistricts || []).map((d) => ({
              value: d._id,
              label: String(d.districtName ?? ""),
            }))
          );
        }
      } catch (error) {
        if (!cancelled) toast.error(`Error: ${error.response?.data?.message || error.message}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return districts;
};

export const useBranchOptions = (districtId) => {
  const [branches, setBranches] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setBranches([]);
    setLoaded(false);
    if (!districtId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/branch/getBranch`, {
          params: { districtId },
          headers: authHeaders(),
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
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [districtId]);
  return { branches, branchesLoaded: loaded };
};

// Ports with free capacity for site + type. `current` ({ port, site, type })
// keeps an edited terminal's own port selectable even when the port is full,
// because that slot is already counted for this terminal.
export const useAvailablePorts = (site, type, current) => {
  const [ports, setPorts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const curPort = current?.port;
  const curSite = current?.site;
  const curType = current?.type;
  useEffect(() => {
    setPorts([]);
    setLoaded(false);
    if (!site || !type) return undefined;
    let cancelled = false;
    (async () => {
      let list = [];
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/port/getAssignedPorts`, {
          headers: authHeaders(),
          params: { portSiteAssignment: site, portAssignment: type },
        });
        list = response.data?.availablePorts || [];
      } catch (error) {
        if (!cancelled) toast.error("Error fetching available ports");
      }
      if (cancelled) return;
      if (
        curPort !== undefined &&
        curPort !== null &&
        curPort !== "" &&
        site === curSite &&
        type === curType &&
        !list.some((p) => String(p.portNumber) === String(curPort))
      ) {
        list = [
          { portNumber: curPort, portSiteAssignment: site, portAssignment: type, isCurrent: true },
          ...list,
        ];
      }
      setPorts(list);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [site, type, curPort, curSite, curType]);
  return { availablePorts: ports, portsLoaded: loaded };
};

export const toPortOptions = (ports, currentPort) =>
  ports.map((p) => ({
    value: `${p.portNumber}`,
    label: `${p.portNumber} - ${p.portSiteAssignment ?? ""} - ${p.portAssignment ?? ""}${
      String(p.portNumber) === String(currentPort ?? "") ? " (current)" : ""
    }`,
  }));

const iconSx = { fontSize: 20 };
const captionSx = { display: "block", mt: 0.5, ml: 1.5, minHeight: 20 };

// The three sections (Terminal, Location, Network & Account).
// `formik` = { setFieldValue, setFieldTouched }.
export const AtmFormSections = ({
  formik,
  districts,
  branches,
  branchesLoaded,
  userDistrict,
  selectedDistrict,
  selectedSite,
  selectedType,
  portOptions,
  portsLoaded,
  onDistrictChange,
  onTypeChange,
  onSiteChange,
}) => {
  const { setFieldValue, setFieldTouched } = formik;
  const setSelect = (name, value) => {
    setFieldTouched(name, true, false);
    setFieldValue(name, value, true);
  };
  const clearField = (name) => {
    setFieldTouched(name, false, false);
    setFieldValue(name, "", false);
  };

  return (
    <>
      {/* 1. Terminal */}
      <Section
        step={1}
        title="Terminal"
        subtitle="ATM type and identification"
        icon={<Storefront sx={iconSx} />}
      >
        <FieldSlot name="type">
          <CustomSelect
            name="type"
            label="ATM Type *"
            options={atm_types}
            onChange={(e) => {
              setSelect("type", e.target.value);
              onTypeChange(e.target.value);
              clearField("port");
            }}
          />
          <Box sx={{ minHeight: 20, mt: 0.5 }} />
        </FieldSlot>
        <FieldSlot name="unitId">
          <FormTextField
            name="unitId"
            label="Unit ID"
            required
            helperText="Whole number, unique per ATM type"
            inputProps={{ inputMode: "numeric" }}
          />
        </FieldSlot>
        <FieldSlot name="terminalId">
          <FormTextField
            name="terminalId"
            label="Terminal ID"
            required
            helperText="At least 8 characters"
          />
        </FieldSlot>
        <FieldSlot name="terminalName">
          <FormTextField name="terminalName" label="Terminal Name" required />
        </FieldSlot>
      </Section>

      {/* 2. Location */}
      <Section
        step={2}
        title="Location"
        subtitle="Where the ATM is installed"
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
              onDistrictChange(e.target.value);
              clearField("branchName");
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ...captionSx, display: "flex", alignItems: "center", gap: 0.5 }}
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
            onChange={(e) => setSelect("branchName", e.target.value)}
            disabled={branches.length === 0}
          />
          <Typography variant="caption" color="text.secondary" sx={captionSx}>
            {!selectedDistrict
              ? "Choose a district first"
              : branches.length === 0
              ? branchesLoaded
                ? "No branches found for this district"
                : "Loading branches..."
              : `${branches.length} branch${branches.length > 1 ? "es" : ""} available`}
          </Typography>
        </FieldSlot>
        <FieldSlot name="site">
          <CustomSelect
            name="site"
            label="Terminal Site *"
            options={sites}
            onChange={(e) => {
              setSelect("site", e.target.value);
              onSiteChange(e.target.value);
              clearField("port");
            }}
          />
          <Box sx={{ minHeight: 20, mt: 0.5 }} />
        </FieldSlot>
      </Section>

      {/* 3. Network & Account */}
      <Section
        step={3}
        title="Network & Account"
        subtitle="Switch port, IP address and settlement account"
        icon={<Router sx={iconSx} />}
      >
        <FieldSlot name="port">
          <CustomSelect
            name="port"
            label="Port *"
            options={portOptions}
            onChange={(e) => setSelect("port", e.target.value)}
            disabled={portOptions.length === 0}
          />
          <Typography
            variant="caption"
            color={portsLoaded && portOptions.length === 0 ? "error" : "text.secondary"}
            sx={captionSx}
          >
            {!selectedSite || !selectedType
              ? "Choose the ATM type and site first"
              : !portsLoaded
              ? "Loading ports..."
              : portOptions.length === 0
              ? "No available ports for the selected site and type"
              : `${portOptions.length} port${portOptions.length === 1 ? "" : "s"} available`}
          </Typography>
        </FieldSlot>
        <FieldSlot name="ipAddress">
          <FormTextField
            name="ipAddress"
            label="IP Address"
            required
            helperText="IPv4, e.g. 10.0.0.25"
          />
        </FieldSlot>
        <FieldSlot name="cbsAccount">
          <FormTextField
            name="cbsAccount"
            label="CBS Account"
            required
            helperText="At least 12 characters"
          />
        </FieldSlot>
      </Section>
    </>
  );
};

// Sticky footer, same as RequestPOS.
export const AtmFormFooter = ({ loading, submitLabel, onBack, disabled = false }) => (
  <Paper
    elevation={3}
    sx={{ position: "sticky", bottom: 0, zIndex: 2, borderRadius: 2, px: { xs: 2, md: 3 }, py: 1.5 }}
  >
    <Stack
      direction={{ xs: "column-reverse", sm: "row" }}
      spacing={1.5}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
    >
      <Button startIcon={<ArrowBack />} onClick={onBack} disabled={loading}>
        Back
      </Button>
      <LoadingButton
        loading={loading}
        disabled={loading || disabled}
        type="submit"
        variant="contained"
        color="primary"
        sx={{ minWidth: 200 }}
      >
        {submitLabel}
      </LoadingButton>
    </Stack>
  </Paper>
);

// label/value grid used in the confirm dialogs. rows: [label, value][]
export const ConfirmRows = ({ rows }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 2, rowGap: 0.5 }}>
    {rows.map(([label, value]) => (
      <React.Fragment key={label}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
          {value === undefined || value === null || value === "" ? "-" : value}
        </Typography>
      </React.Fragment>
    ))}
  </Box>
);