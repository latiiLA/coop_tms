import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  FormHelperText,
} from "@mui/material";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";

const fetchAvailablePorts = async (portSiteAssignment, portAssignment) => {
  console.log(portSiteAssignment, portAssignment, "before fetch");
  try {
    const response = await axios.get(
      "http://localhost:8000/port/getAssignedPorts",
      {
        params: {
          portSiteAssignment,
          portAssignment,
        },
      }
    );

    // Handle response
    console.log(response.data.availablePorts);
    return response.data.availablePorts || [];
  } catch (error) {
    console.error("Error fetching available ports:", error);
    toast.error("Error fetching available ports:");
    return [];
  }
};

const CustomTextField = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <TextField
      {...field}
      {...props}
      label={label}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      variant="outlined"
      fullWidth
    />
  );
};

const CustomSelect = ({ label, options, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <FormControl
      variant="outlined"
      fullWidth
      error={meta.touched && Boolean(meta.error)}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        {...field}
        {...props}
        label={label}
        value={field.value || ""} // Ensure value prop is not undefined
        onChange={(e) => {
          field.onChange(e);
          props.onChange && props.onChange(e);
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {meta.touched && meta.error ? (
        <FormHelperText>{meta.error}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

const ATMForm = ({
  initialValues = {},
  onSubmit,
  onChange,
  changedData = {},
  isEdit,
}) => {
  const [selectedType, setSelectedType] = useState(initialValues.type || "");
  const [selectedSite, setSelectedSite] = useState(initialValues.site || "");
  // const [selectedPort, setSelectedPort] = useState(initialValues.site || "");

  const [availablePorts, setAvailablePorts] = useState([]);
  const atm_types = [
    { value: "CRM", label: "CRM" },
    { value: "NCR", label: "NCR" },
  ];

  const sites = [
    { value: "ONSITE", label: "ONSITE" },
    { value: "OFFSITE", label: "OFFSITE" },
  ];

  const atm_status = [
    { value: "New", label: "New" },
    { value: "Active", label: "Active" },
  ];

  const FORM_VALIDATION = Yup.object().shape({
    type: Yup.string().required("ATM Type is required"),
    unitId: Yup.string()
      .required("Unit ID is required")
      .min(3, "Unit ID must be at least 3 characters"),
    terminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),
    terminalName: Yup.string().required("Terminal Name is required"),
    branchName: Yup.string().required("Branch Name is required"),
    acceptorLocation: Yup.string().required("Acceptor Location is required"),
    site: Yup.string().required("Terminal site assignment is required"),
    cbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(12, "CBS Account must be at least 12 characters"),
    // port: Yup.number()
    //   .required("Port is required")
    //   .test("is-valid-port", "Port must be a valid selection", (value) =>
    //     availablePorts.includes(value)
    //   ),
    ipAddress: Yup.string()
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

  useEffect(() => {
    console.log(
      "useEffect triggered with site:",
      selectedSite,
      "and type:",
      selectedType
    );

    const fetchPorts = async () => {
      if (selectedSite && selectedType) {
        try {
          const ports = await fetchAvailablePorts(selectedSite, selectedType);
          console.log("Fetched ports:", ports);
          setAvailablePorts(ports);
        } catch (error) {
          console.error("Error fetching ports:", error);
          setAvailablePorts([]);
        }
      } else {
        // Optionally handle cases where site or type is not selected yet
        setAvailablePorts([]);
      }
    };

    fetchPorts();
  }, [selectedSite, selectedType]);

  return (
    <Card
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: 2,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        width: { xs: "100%", sm: "95%", md: "90%" },
      }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={FORM_VALIDATION}
        onSubmit={onSubmit}
        validateOnMount
      >
        {({ isValid, isSubmitting, handleChange }) => (
          <Form>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h5" sx={{ textAlign: "center" }}>
                {isEdit
                  ? "Update Terminal Information"
                  : "Add New ATM Terminal Information"}
              </Typography>
              <Typography variant="h6">ATM Information</Typography>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    width: "50%",
                  }}
                >
                  <CustomSelect
                    name="type"
                    label="ATM Type"
                    options={atm_types}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setAvailablePorts([]); // Clear ports on type change
                    }}
                  />
                  <CustomTextField name="unitId" label="Unit ID" />
                  <CustomTextField name="terminalId" label="Terminal ID" />
                  <CustomTextField name="terminalName" label="Terminal Name" />
                  <CustomTextField name="branchName" label="Branch Name" />
                  <CustomTextField
                    name="acceptorLocation"
                    label="Acceptor Location"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    width: "50%",
                  }}
                >
                  <CustomSelect
                    name="site"
                    label="Terminal Site"
                    options={sites}
                    onChange={(e) => {
                      setSelectedSite(e.target.value);
                      setAvailablePorts([]); // Clear ports on site change
                    }}
                  />
                  <CustomSelect
                    name="port"
                    label="Port"
                    options={availablePorts.map((port) => ({
                      value: port,
                      label: port.toString(),
                    }))}
                    // onChange={(e) => {
                    //   setSelectedPort(e.target.value); // setAvailablePorts([]); // Clear ports on site change
                    // }}
                    disabled={!selectedSite} // Disable port selection if no site selected
                  />
                  {availablePorts.length === 0 &&
                    selectedSite &&
                    selectedType && (
                      <FormHelperText error>
                        No available ports for selected site and type.
                      </FormHelperText>
                    )}
                  <CustomTextField name="cbsAccount" label="CBS Account" />
                  <CustomTextField name="ipAddress" label="IP Address" />
                  {isEdit && (
                    <CustomSelect
                      name="status"
                      label="Status"
                      options={atm_status}
                    />
                  )}
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isValid || isSubmitting}
              >
                {isEdit ? "Update" : "Submit"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default ATMForm;
