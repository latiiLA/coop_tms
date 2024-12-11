import { Box, Button, Card, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomTextField } from "../../../components/CustomFields";

const RequestDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { row } = location.state;
  console.log("console", row);

  const handleDownload = () => {
    // Assumes the file path is relative to the server's public directory.
    console.log("file", row.file.filePath);
    const link = document.createElement("a");
    link.href = `${process.env.REACT_APP_BASE_URL}/${row.file.filePath}`; // Adjust this based on server configuration
    link.download = row.file.fileName;
    link.click();
  };

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
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posTerminalName"
                        label="Terminal Name"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posBranchName"
                        label="Branch Name"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posDistrict"
                        label="District"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posSite"
                        label="Terminal Site"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="merchantId"
                        label="Assigned Merchant ID"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="posCbsAccount"
                        label="CBS Account"
                        InputProps={{
                          readOnly: true,
                        }}
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
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="staticIp"
                        label="Static IP Address"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="createdBy"
                        label="Created By"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="createdAt"
                        label="Created At"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="updatedAt"
                        label="Updated At"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="status"
                        label="Status"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="remark"
                        label="Remark"
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      {/* Download Button */}
                      {row.file && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleDownload}
                        >
                          Download {row.file.fileName}
                        </Button>
                      )}
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

export default RequestDetails;
