import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
} from "@mui/material";

const CybersourceTerminalDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { row } = location.state || {};

  if (!row) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">
          Cybersource terminal information not found.
        </Typography>

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/cybersource")}
        >
          Back to Cybersource Terminals
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        margin: 2,
      }}
    >
      <Card
        sx={{
          p: 4,
          px: 5,
          width: { xs: "100%", sm: "75%", md: "60%" },
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            textAlign: "center",
            mb: 3,
          }}
        >
          Cybersource Terminal Details
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            name="district"
            label="District"
            variant="outlined"
            fullWidth
            InputProps={{
                readOnly: true,
            }}
            defaultValue={row?.branchID?.district?.districtName}
          />

          <TextField
            name="branchName"
            label="Branch Name"
            variant="outlined"
            fullWidth
            InputProps={{
                readOnly: true,
            }}
            defaultValue={row?.branchID?.companyName}
          />

          <TextField
            label="Merchant Name"
            value={row.merchantName || ""}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="Cybersource Merchant ID"
            value={row.cbscMerchantID || ""}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="CBO Merchant ID"
            value={row.cboMerchantID || ""}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="Terminal ID"
            value={row.terminalID || ""}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="CBS Account"
            value={row.cbsAccount || ""}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="Cybersource Type"
            value={row.cbscType || ""}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="Status"
            value={row.status || ""}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="Created By"
            value={row?.createdBy?.firstName + " " + row?.createdBy?.fatherName + " " + row?.createdBy?.gfatherName || ""}
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

            {row?.lastUpdatedBy &&
                <TextField
                    label="Last Updated By"
                    value={row?.lastUpdatedBy?.firstName + " " + row?.lastUpdatedBy?.fatherName + " " + row?.lastUpdatedBy?.gfatherName || ""}
                    fullWidth
                    InputProps={{
                    readOnly: true,
                    }}
                />
            }

          <TextField
            label="Created At"
            value={
                row.createdAt
                    ? new Date(row.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    })
                    : ""
                }
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          <TextField
            label="Updated At"
            value={
                row.updatedAt
                    ? new Date(row.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                    })
                    : ""
                }
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          {row?.status === "Deactivated" &&
            <>
                <TextField
                    label="Deactivated By"
                    value={row?.deactivatedBy?.firstName + " " + row?.deactivatedBy?.fatherName + " " + row?.deactivatedBy?.gfatherName || ""}
                    fullWidth
                    InputProps={{
                    readOnly: true,
                    }}
                />

                <TextField
                    label="Deactivated At"
                    value={
                        row.deactivatedAt
                            ? new Date(row.deactivatedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            })
                            : ""
                        }
                    fullWidth
                    InputProps={{
                    readOnly: true,
                    }}
                />
              </>
            }
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate("/cybersource/deactivated")}
          >
            Back to Deactivated Cybersource Terminals
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default CybersourceTerminalDetail;