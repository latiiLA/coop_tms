import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import {
  ATM_INITIAL_VALUES,
  AtmFormFooter,
  AtmFormSections,
  ConfirmRows,
  buildAtmSchema,
  idOf,
  labelOf,
  toPortOptions,
  trimValues,
  useAvailablePorts,
  useBranchOptions,
  useDistrictOptions,
} from "../../components/atm/atmFormShared";

const fetchSuggestedUnitId = async (type) => {
  const token = localStorage.getItem("token");
  if (!token || !type) return null;
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/terminal/suggestUnitId`,
    {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
      params: { type },
    }
  );
  const value = response.data?.suggestedUnitId;
  return value === undefined || value === null ? null : String(value);
};

const AddTerminal = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const userDistrict = idOf(currentUser?.district) || "";

  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [pendingValues, setPendingValues] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(userDistrict);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const formikRef = useRef(null);

  const districts = useDistrictOptions();
  const { branches, branchesLoaded } = useBranchOptions(selectedDistrict);
  const { availablePorts, portsLoaded } = useAvailablePorts(selectedSite, selectedType);
  const portOptions = toPortOptions(availablePorts);
  const validationSchema = useMemo(() => buildAtmSchema(availablePorts), [availablePorts]);

  useEffect(() => {
    if (!selectedType) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchSuggestedUnitId(selectedType);
        if (cancelled || !next) return;
        // Refresh when ATM type changes (CRM/CRM2 share a sequence; NCR is separate).
        formikRef.current?.setFieldValue("unitId", next, false);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error.response?.data?.message || "Could not load the suggested unit ID."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedType]);

  const handleCreate = async (values, setFieldValue) => {
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
        `${process.env.REACT_APP_API_URL}/terminal/createTerminal`,
        trimValues(values),
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(response.data?.message || "The terminal is successfully created.");
      // Existing behaviour: open the new terminal's detail page.
      navigate("/atmdetail", { state: { row: response.data?.terminal } });
    } catch (error) {
      const next = error.response?.data?.suggestedUnitId;
      if (next != null && setFieldValue) {
        setFieldValue("unitId", String(next), false);
      }
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
          innerRef={formikRef}
          initialValues={{ ...ATM_INITIAL_VALUES, district: userDistrict }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (!loading) setPendingValues(values);
          }}
        >
          {({ setFieldValue, setFieldTouched }) => (
            <Form noValidate>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    Add New ATM Terminal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fields marked * are required.
                  </Typography>
                </Box>

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

                <AtmFormFooter
                  loading={loading}
                  submitLabel="Add Terminal"
                  onBack={() => navigate(-1)}
                />
              </Stack>

              <Dialog
                open={Boolean(pendingValues)}
                onClose={() => !loading && setPendingValues(null)}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>Confirm New Terminal</DialogTitle>
                <DialogContent>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Create this ATM terminal?
                  </Typography>
                  <ConfirmRows
                    rows={[
                      ["Type", pendingValues?.type],
                      ["Unit ID", pendingValues?.unitId],
                      ["Terminal ID", pendingValues?.terminalId],
                      ["Terminal Name", pendingValues?.terminalName],
                      ["District", labelOf(districts, pendingValues?.district)],
                      ["Branch", labelOf(branches, pendingValues?.branchName)],
                      ["Site", pendingValues?.site],
                      ["Port", pendingValues?.port],
                      ["IP Address", pendingValues?.ipAddress],
                      ["CBS Account", pendingValues?.cbsAccount],
                    ]}
                  />
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
                      if (values) handleCreate(values, setFieldValue);
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

export default AddTerminal;