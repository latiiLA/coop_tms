import { Box, Card, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CustomTextField } from "./CustomFields";

import LoadingButton from "@mui/lab/LoadingButton";

const CreateDistrict = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    districtName: "",
    mnemonic: "",
    address: "",
  };

  const FORM_VALIDATION = Yup.object().shape({
    districtName: Yup.string().required("Branch Name is required"),
    mnemonic: Yup.string().required("Mnemonic is required"),
    address: Yup.string().required("Address is required"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("token");

    // console.log("handle pos creation", values);
    if (!token) {
      navigate("/home");
      return;
    }

    console.log("inside handle submit create district", values);

    try {
      const response = await axios.post(
        `${apiUrl}/district/createDistrict`,
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
      navigate("/atm/viewdistrict");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Something went wrong"
      );
    } finally {
      // setSubmitting(false);
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
            {({ isValid, errors, resetForm }) => (
              <Form>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    Add District
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
                      name="districtName"
                      label="District Name"
                      required
                    />

                    <CustomTextField
                      name="mnemonic"
                      label="Mnemonic"
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

export default CreateDistrict;
