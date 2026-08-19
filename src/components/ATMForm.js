import React, { useState, useEffect } from "react";
import { Box, Typography, Card, Button, FormHelperText } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { atm_types, atm_status, sites } from "./DropDownFormData";
import { CustomSelect, CustomTextField } from "./CustomFields";
import { useAuthContext } from "../context/AuthContext";

const fetchAvailablePorts = async (
  portSiteAssignment,
  portAssignment,
  currentPort
) => {
  // console.log(portSiteAssignment, portAssignment, "before fetch");
  try {
    const apiUrl = process.env.REACT_APP_API_URL;
    const response = await axios.get(`${apiUrl}/port/getAssignedPorts`, {
      params: {
        portSiteAssignment,
        portAssignment,
        currentPort,
      },
    });

    // Handle response
    // console.log(response.data.availablePorts);
    return response.data.availablePorts || [];
  } catch (error) {
    // console.error("Error fetching available ports:", error);
    toast.error("Error fetching available ports:");
    return [];
  }
};

const ATMForm = ({
  initialValues = {
    type: "",
    unitId: "",
    terminalId: "",
    terminalName: "",
    branchName: "",
    district: "",
    site: "",
    cbsAccount: "",
    port: "",
    ipAddress: "",
    relocatedTo: "",
    remark: ""
  },
  onSubmit,
  isEdit,
}) => {
  const [selectedType, setSelectedType] = useState(initialValues.type || "");
  const [selectedSite, setSelectedSite] = useState(initialValues.site || "");
  const [districts, setDistricts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialValues?.branchName?.district?._id || ""
  );
  const { role, permissions } = useAuthContext();
  const navigate = useNavigate();

  const [availablePorts, setAvailablePorts] = useState([]);

  const FORM_VALIDATION = Yup.object().shape({
    type: Yup.string().required("ATM Type is required"),
    unitId: Yup.number().required("Unit ID is required"),
    terminalId: Yup.string()
      .required("Terminal ID is required")
      .min(8, "Terminal ID must be at least 8 characters"),
    terminalName: Yup.string().required("Terminal Name is required"),
    branchName: Yup.string().required("Branch Name is required"),
    district: Yup.string().required("District ID is required"),
    site: Yup.string().required("Terminal site assignment is required"),
    cbsAccount: Yup.string()
      .required("CBS Account is required")
      .min(12, "CBS Account must be at least 12 characters"),
    port: Yup.number().test(
      "is-valid-port",
      "Port must be a valid selection",
      (value) => availablePorts.includes(value)
    ),
    relocatedTo: Yup.string(),
    remark: Yup.string(),
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
    // console.log(
    //   "useEffect triggered with site:",
    //   selectedSite,
    //   "and type:",
    //   selectedType
    // );

    const fetchPorts = async () => {
      if (selectedSite && selectedType) {
        try {
          const ports = await fetchAvailablePorts(
            selectedSite,
            selectedType,
            initialValues.port
          );
          // console.log("Fetched ports:", ports);
          setAvailablePorts(ports);
        } catch (error) {
          // console.error("Error fetching ports:", error);
          setAvailablePorts([]);
        }
      } else {
        // Optionally handle cases where site or type is not selected yet
        setAvailablePorts([]);
      }
    };

    fetchPorts();
  }, [selectedSite, selectedType, initialValues.port]);

  useEffect(() => {
    const fetchRows = async () => {
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

        console.log("API Response:", response.data); // Log the response

        const formattedDistricts = response.data.alldistricts.map(
          (district) => ({
            value: district._id,
            label: district.districtName.toString(),
          })
        );
        setDistricts(formattedDistricts);
        console.log("Formatted Districts:", formattedDistricts);
      } catch (error) {
        console.log("Error Details:", error); // Log the error
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
        navigate("/home");
      }
    };

    fetchRows();
  }, [navigate]);

  useEffect(() => {
    console.log("selectedDistrict", selectedDistrict);
    if (selectedDistrict) {
      const fetchBranches = async () => {
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
        }
      };
      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [selectedDistrict]);

  // console.log("initial values in ATM FORM are", initialValues);

  return (
    <Box sx={{ width: "100%", marginY: 1, marginX: 10 }}>
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        {isEdit
          ? "Update Terminal Information"
          : "Add New Terminal Information"}
      </Typography>
      <Card
        sx={{
          py: 4,
          px: 5,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: 2,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          width: { xs: "100%", sm: "95%", md: "90%" },
          margin: "auto",
        }}
      >
        <Formik
          initialValues={{
            ...initialValues,
            branchName: initialValues?.branchName?._id,
            district: initialValues?.branchName?.district?._id,
          }}
          validationSchema={FORM_VALIDATION}
          onSubmit={onSubmit}
          validateOnMount
          validateOnChange
          validateOnBlur
        >
          {({ isValid, isSubmitting, validateForm, handleChange }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 5 }}>
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
                        handleChange(e);
                        validateForm();
                      }}
                    />
                    <CustomTextField name="unitId" label="Unit ID" />
                    <CustomTextField name="terminalId" label="Terminal ID" />
                    <CustomTextField
                      name="terminalName"
                      label="Terminal Name"
                    />

                    <CustomSelect
                      name="district"
                      label="District"
                      options={districts}
                      onChange={(e) => {
                        handleChange(e);
                        setSelectedDistrict(e.target.value);
                        setBranches([]);
                        validateForm();
                      }}
                    />

                    <CustomSelect
                      name="branchName"
                      label="Branch Name"
                      options={branches}
                      onChange={(e) => {
                        handleChange(e);
                        validateForm();
                      }}
                      disabled={branches.length === 0}
                    />
                    {isEdit && permissions?.includes("edit_terminal") &&(
                      <>
                        <CustomTextField name="remark" label="Remark" />
                      </>
                    )}
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
                        setAvailablePorts([]);
                        handleChange(e);
                        validateForm();
                      }}
                    />
                    {/* <CustomTextField
                      name="prevport"
                      label="Previous Port"
                      value={initialValues.port || "No previous port"}
                      disabled
                    /> */}
                    <CustomSelect
                      name="port"
                      label="Port"
                      options={availablePorts.map((port) => ({
                        value: port,
                        label: port.toString(),
                      }))}
                      onChange={(e) => {
                        handleChange(e);
                        validateForm(); // Trigger form validation after port selection
                      }}
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
                    {isEdit && permissions?.includes("edit_terminal") &&(
                      <>
                        <CustomTextField name="relocatedTo" label="Relocated To" />
                      </>
                    )}
                    
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  // disabled={!isValid || isSubmitting}
                >
                  {isEdit ? "Update" : "Submit"}
                </Button>
                {isEdit && (
                  <Button onClick={() => navigate("/atm/manageterminal")}>
                    View Terminals
                  </Button>
                )}
              </Box>
            </Form>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default ATMForm;
