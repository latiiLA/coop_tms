import { Box, Card, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CustomSelect, CustomTextField } from "./CustomFields";

import LoadingButton from "@mui/lab/LoadingButton";

const CreateBranch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);

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

        const formattedDistricts = response.data.alldistricts.map(
          (district) => ({
            value: district._id,
            label: district.districtName,
          })
        );
        setDistricts(formattedDistricts);
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || error.message}`);
        navigate("/home");
      }
    };

    fetchRows();
  }, []);

  const initialValues = {
    branchCode: "",
    companyName: "",
    district: "",
    mnemonic: "",
    address: "",
  };

  const FORM_VALIDATION = Yup.object().shape({
    branchCode: Yup.string()
      .required("Branch code is required.")
      .min(9, "Branch code must be 9 characters.")
      .max(9, "Branch code must be 9 characters."),
    companyName: Yup.string().required("Branch Name is required"),
    district: Yup.string().required("District is required"),
    mnemonic: Yup.string(),
    address: Yup.string().required("Address is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/home");
      return;
    }

    try {
      const response = await axios.post(
        `${apiUrl}/branch/createBranch`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      resetForm();
      navigate("/viewbranch");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", margin: 1 }}>
        <Card
          sx={{
            p: 3,
            paddingTop: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            width: { xs: "100%", sm: "80%", md: "75%", lg: "60%" },
            position: "relative",
          }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={FORM_VALIDATION}
            onSubmit={handleSubmit}
            validateOnMount
          >
            {({ isValid }) => (
              <Form>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    Add Branch Information
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      paddingX: 3,
                    }}
                  >
                    <CustomTextField
                      name="branchCode"
                      label="Branch Code"
                      required
                    />
                    <CustomTextField
                      name="companyName"
                      label="Branch Name"
                      required
                    />
                    <CustomTextField name="mnemonic" label="Mnemonic" />
                    <CustomSelect
                      name="district"
                      label="District"
                      options={districts}
                      required
                    />
                    <CustomTextField name="address" label="Address" required />
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
                  <LoadingButton
                    loading={loading}
                    type="submit"
                    variant="contained"
                    color="primary"
                    width={200}
                  >
                    Submit
                  </LoadingButton>
                </Box>
              </Form>
            )}
          </Formik>
        </Card>
      </Box>
    </Box>
  );
};

export default CreateBranch;
