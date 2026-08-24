import { Box, Button, Card, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomTextField } from "./../../components/CustomFields";
import { FileOpen } from "@mui/icons-material";
import toast from "react-hot-toast";
import PdfBlobViewer from "../../components/PdfBlobViewer";

const POSDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRequest, isRelocated, row } = location.state;
  console.log("console", row);

  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfPath, setPdfPath] = useState("");

  const handleDownload = () => {
    try {
      if (!row?.file?.filePath || !row?.file?.fileName) {
        console.error("File information is missing");
        return;
      }

      // Construct the full file URL
      const fileUrl = `${process.env.REACT_APP_API_URL}/${row.file.filePath}`;
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
  const handlePdfView = (filepath) => {
    setPdfPath(filepath);
    setPdfOpen(true);
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
                      {(!isRequest || isRelocated) && (
                        <CustomTextField
                          name="terminalId"
                          label="Terminal ID"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
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
                        name="serialNumber"
                        label="Serial Number"
                        value={row?.serialNumber?.serialNumber}
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
                        name="branchName"
                        label="Branch Name"
                        value={row?.branchName?.companyName || "Unknown"}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="district"
                        label="District"
                        value={row?.branchName?.district?.districtName || "Unknown"}
                        InputProps={{
                          readOnly: true,
                        }}
                      />

                      <CustomTextField
                        name="site"
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
                        name="contactPhonenumber"
                        label="Contact Phone Number"
                        value={row?.contactPhonenumber || "Unknown"}
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
                      <CustomTextField
                        name="businessType"
                        label="Business Type"
                        value={row?.businessType || "Unknown"}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      <CustomTextField
                        name="serviceNumber"
                        label="Service Number"
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
                      
                      {!isRequest && (
                        <>
                          <CustomTextField
                            name="reqCreatedBy"
                            label="Request Created By"
                            value={
                              (row?.reqCreatedBy?.firstName || "Unknown") +
                              " " +
                              (row?.reqCreatedBy?.fatherName || "Unknown")
                            }
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                          <CustomTextField
                            name="reqAuthorizedBy"
                            label="Request Authorized By"
                            value={
                              (row?.reqAuthorizedBy?.firstName || "Unknown") +
                              " " +
                              (row?.reqAuthorizedBy?.fatherName || "Unknown")
                            }
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </>
                      )}
                      <CustomTextField
                        name="createdBy"
                        label="Created By"
                        value={
                          (row?.createdBy?.firstName || "Unknown") +
                          " " +
                          (row?.createdBy?.fatherName || "Unknown")
                        }
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                      {row?.configuredBy && (
                        <CustomTextField
                          name="configuredBy"
                          label="Configured By"
                          InputProps={{ readOnly: true }}
                          value={
                            (row?.configuredBy?.firstName || "Unknown") +
                            " " +
                            (row?.configuredBy?.fatherName || "Unknown")
                          }
                        />
                      )}
                      {isRequest && row?.reqAuthorizedBy && (
                        <CustomTextField
                          name="reqAuthorizedBy"
                          label="Request Authorized By"
                          InputProps={{
                            readOnly: true,
                          }}
                          value={
                            (row?.reqAuthorizedBy?.firstName || "Unknown") +
                            " " +
                            (row?.reqAuthorizedBy?.fatherName || "Unknown")
                          }
                        />
                      )}
                      {!isRequest && row?.deleteRequestedBy && (
                        <Box sx={{display: "flex", flexDirection: "row", gap: 2}}>
                        <CustomTextField
                          name="deleteRequestedBy"
                          label="POS Termination Requested By"
                          InputProps={{
                            readOnly: true,
                          }}
                          value={
                            (row?.deleteRequestedBy?.firstName || "Unknown") +
                            " " +
                            (row?.deleteRequestedBy?.fatherName || "Unknown")
                          }
                        />
                        {row?.deletedBy &&
                        <CustomTextField
                          name="deletedBy"
                          label="POS Terminated By"
                          InputProps={{
                            readOnly: true,
                          }}
                          value={
                            (row?.deletedBy?.firstName || "Unknown") +
                            " " +
                            (row?.deletedBy?.fatherName || "Unknown")
                          }
                        />
                        }
                        </Box>
                      )}
                      {/* <Box sx={{display: "flex", flexDirection: "row", gap: 2}}> */}
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
                      {/* </Box> */}
                      <CustomTextField
                        name="configVersion"
                        label="Config Version"
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

                      {isRequest && row?.status === "Rejected" && (
                        <CustomTextField
                          name="rejectedBy"
                          label="Rejected By"
                          InputProps={{
                            readOnly: true,
                          }}
                          value={
                            (row?.rejectedBy?.firstName || "Unknown") +
                            " " +
                            (row?.rejectedBy?.fatherName || "Unknown")
                          }
                        />
                      )}
                      {isRequest && row?.status === "Approved" && (
                        <CustomTextField
                          name="approvedBy"
                          label="Approved By"
                          InputProps={{
                            readOnly: true,
                          }}
                          value={
                            (row?.approvedBy?.firstName || "Unknown") +
                            " " +
                            (row?.approvedBy?.fatherName || "Unknown")
                          }
                        />
                      )}

                      {isRequest && (
                        <CustomTextField
                          name="remark"
                          label="Remark"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                      {!isRequest && row?.comment && (
                        <CustomTextField
                          name="comment"
                          label="Comment"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      )}
                      
                      {/* Download Button */}
                      {row?.file && (
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

                          {/* <Button
                            variant="contained"
                            color="primary"
                            onClick={handleDownload}
                            startIcon={<Download />}
                          >
                            Download {row?.file?.fileName}
                          </Button> */}
                          <Button
                            variant="contained"
                            onClick={() =>
                              handlePdfView(
                                `${process.env.REACT_APP_API_URL}/${row.file.filePath}`
                              )
                            }
                            startIcon={<FileOpen />}
                          >
                            View {row?.file?.fileName}
                          </Button>
                          {/* PdfBlobViewer will open when pdfOpen is true */}
                          <PdfBlobViewer
                            filePath={pdfPath}
                            open={pdfOpen}
                            onClose={() => setPdfOpen(false)}
                          />
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
