import React, { useMemo, useRef, useState } from "react";
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

  const districts = useDistrictOptions();
  const { branches, branchesLoaded } = useBranchOptions(selectedDistrict);
  const { availablePorts, portsLoaded } = useAvailablePorts(selectedSite, selectedType);
  const portOptions = toPortOptions(availablePorts);
  const validationSchema = useMemo(() => buildAtmSchema(availablePorts), [availablePorts]);

  const handleCreate = async (values) => {
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
                      if (values) handleCreate(values);
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