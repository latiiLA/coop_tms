import { Box, Button, Card, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CustomSelect,
  CustomTextField,
} from "../../../components/CustomFields";
import { request_status } from "../../../components/DropDownFormData";

const EditRequests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { row } = location.state;
  console.log("console", row);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          margin: "auto",
          justifyContent: "center",
        }}
      >
        <Card
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            margin: "auto",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            width: { xs: "100%", sm: "95%", md: "90%" },
            position: "relative",
          }}
        >
          <Formik initialValues={row}>
            {() => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="h5" sx={{ textAlign: "center" }}>
                    Request Details
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: "50%",
                      }}
                    >
                      <CustomTextField
                        name="serialNumber"
                        label="Serial Number"
                      />
                      <CustomTextField
                        name="posTerminalName"
                        label="Terminal Name"
                      />
                      <CustomTextField
                        name="posBranchName"
                        label="Branch Name"
                      />
                      <CustomTextField name="posDistrict" label="District" />
                      <CustomTextField name="posSite" label="Terminal Site" />
                      <CustomTextField
                        name="merchantId"
                        label="Assigned Merchant ID"
                      />
                      <CustomTextField
                        name="posCbsAccount"
                        label="CBS Account"
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
                      <CustomTextField
                        name="simCardNumber"
                        label="SIM Card Number"
                      />
                      <CustomTextField
                        name="staticIp"
                        label="Static IP Address"
                      />
                      <CustomTextField name="createdBy" label="Created By" />
                      <CustomTextField name="createdAt" label="Created At" />

                      <CustomTextField name="updatedAt" label="Updated At" />

                      <CustomSelect
                        name="status"
                        label="Status"
                        options={request_status}
                      />
                      <CustomTextField name="remark" label="Remark" />
                    </Box>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Card>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            margin: "auto",
            gap: 2,
            marginTop: 2,
          }}
        >
          <Button onClick={() => navigate("/")}>Home</Button>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditRequests;
