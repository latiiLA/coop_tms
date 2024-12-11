import { Box, Button, Card, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomTextField } from "./../../components/CustomFields";
import { Download } from "@mui/icons-material";
import toast from "react-hot-toast";

const POSDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRequest, isRelocated, row } = location.state;
  // console.log("console", row);

  const handleDownload = () => {
    try {
      if (!row?.file?.filePath || !row?.file?.fileName) {
        console.error("File information is missing");
        return;
      }

      // Construct the full file URL
      const fileUrl = `${process.env.REACT_APP_API_URL}\${row.file.filePath}`;
      console.log("Downloading file from:", fileUrl);

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = row.file.fileName;

      // Append link to the document, trigger the click, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // console.error("Error downloading the file:", error);
      toast.error("Error downloading the file");
    }
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
                    {isRequest ? "Request Details" : "POS Details"}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { md: "row", xs: "column" },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: { md: "50%", xs: "100%" },
                      }}
                    >
                      {!isRequest && (
                        <CustomTextField
                          name="posTerminalId"
                          label="Terminal ID"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                      <CustomTextField
                        name="serialNumber"
                        label="Serial Number"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="merchantName"
                        label="Merchant Name"
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
                        name="posCbsAccount"
                        label="CBS Account"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="contactName"
                        label="Contact Name"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="merchantPhonenumber"
                        label="Merchant Phone Number"
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="merchantAddress"
                        label="Merchant Address"
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
                        width: { md: "50%", xs: "100%" },
                      }}
                    >
                      {!isRequest && (
                        <CustomTextField
                          name="merchantId"
                          label="Merchant ID"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}

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
                      {isRelocated && (
                        <CustomTextField
                          name="deletedBy"
                          label="Relocated By"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
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
                      {isRequest && (
                        <CustomTextField
                          name="remark"
                          label="Remark"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                      {/* Download Button */}
                      {row.file && (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            gap: 3,
                            justifyContent: "left",
                            alignItems: "center",
                          }}
                        >
                          <Typography>Merchant Agreement</Typography>

                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDownload}
                            startIcon={<Download />}
                          >
                            Download {row.file.fileName}
                          </Button>
                        </Box>
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

export default POSDetails;
