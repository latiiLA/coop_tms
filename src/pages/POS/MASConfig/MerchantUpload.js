import { Alert, AlertTitle, Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";

const MerchantUpload = () => {
  const navigate = useNavigate();
  const [copiedData, setCopiedData] = React.useState("");
  let [rows, setRows] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(0);

  const fetchRows = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // console.error("No authentication token found");
      toast.error("User is not authenticated");
      navigate("/home");
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/pos/getPOSCountPerDistrict`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("terminal per district list", response.data.result);

      setRows(response.data.result);
    } catch (error) {
      // console.error("Error fetching terminals:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  rows =
    rows?.map((row, index) => ({
      id: index + 1,
      ...row,
    })) ?? [];

  const columns = [
    {
      field: "merchantName",
      headerName: "MERCHANT_NAME",
      type: "string",
      flex: 1,
    },
    // {
    //   field: "merchantSegment",
    //   headerName: "MERCHANT_SEGMENT",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "sector",
    //   headerName: "SECTOR",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "subGroupNumber",
    //   headerName: "SUB_GROUP_NUMBER",
    //   type: "string",
    //   flex: 1,
    // },
    {
      field: "merchantId",
      headerName: "RETAILER_NUMBER",
      type: "string",
      flex: 1,
    },
    // {
    //   field: "city",
    //   headerName: "CITY",
    //   type: "string",
    //   flex: 1,
    // },
    {
      field: "mcc",
      headerName: "MCC",
      type: "string",
      flex: 1,
    },
    // {
    //   field: "cis",
    //   headerName: "CIS",
    //   type: "string",
    //   flex: 1,
      // },
    {
      field: "branchName",
      headerName: "BRANCH",
      type: "string",
      flex: 1,
    },
    {
      field: "posCBSAccount",
      headerName: "ACCOUNT_DEBIT",
      type: "string",
      flex: 1,
    },
    // {
    //   field: "posCBSAccount",
    //   headerName: "ACCOUNT_CREDIT",
    //   type: "string",
    //   flex: 1,
    // },
    {
      field: "merchantAddress",
      headerName: "ADDRESS1",
      type: "string",
      flex: 1,
    },
    // {
    //   field: "address2",
    //   headerName: "ADDRESS2",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "address3",
    //   headerName: "ADDRESS3",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "altMerchantName",
    //   headerName: "ALT_MERCHANT_NAME",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "altAddress",
    //   headerName: "ALT_ADDRESS",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "altCity",
    //   headerName: "ALT_CITY",
    //   type: "string",
    //   flex: 1,
    // },
    {
      field: "merchantPhonenumber",
      headerName: "PHONE1",
      type: "string",
      flex: 1,
    },
    // {
    //   field: "phone2",
    //   headerName: "PHONE2",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "fax",
    //   headerName: "FAX",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "mobile",
    //   headerName: "MOBILE",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "mobile2",
    //   headerName: "MOBILE2",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "poBox",
    //   headerName: "PO_BOX",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "zipCode",
    //   headerName: "ZIP_CODE",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "riskLevel",
    //   headerName: "RISK_LEVEL",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "transactionClassCode",
    //   headerName: "TRANSACTION_CLASS_CODE",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "sector",
    //   headerName: "COM1",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com2",
    //   headerName: "COM2",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com3",
    //   headerName: "COM3",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com4",
    //   headerName: "COM4",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com5",
    //   headerName: "COM5",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com6",
    //   headerName: "COM6",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com7",
    //   headerName: "COM7",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com8",
    //   headerName: "COM8",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com9",
    //   headerName: "COM9",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "com10",
    //   headerName: "COM10",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "terminalType",
    //   headerName: "TERMINAL_TYPE",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "terminalVendor",
    //   headerName: "TERMINAL_VENDOR",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "terminalBrand",
    //   headerName: "TERMINAL_BRAND",
    //   type: "string",
    //   flex: 1,
    // },

    // {
    //   field: "noOfTerminals",
    //   headerName: "NO_OF_TERMINALS",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "emailOfAddress",
    //   headerName: "EMAIL_OF_ADDRESS",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "emailOfContact",
    //   headerName: "EMAIL_OF_CONTACT",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "merchantProducts",
    //   headerName: "MERCHANT_PRODUCTS",
    //   type: "string",
    //   flex: 1,
    // },
    // {
    //   field: "fileName",
    //   headerName: "FILENAME",
    //   type: "string",
    //   flex: 1,
    // },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <Box>
      <Box
        sx={{
          width: "auto",
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-root": {
            overflow: "hidden",
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowY: "hidden !important",
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
            display: "none",
          },
          "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
            display: "none",
          },
          marginX: 1,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          checkboxSelection
          onClipboardCopy={(copiedString) => setCopiedData(copiedString)}
        />
        <Alert severity="info" sx={{ width: "100%", mt: 1 }}>
          <AlertTitle>Copied data:</AlertTitle>
          <code
            style={{
              display: "block",
              maxHeight: 200,
              overflow: "auto",
              whiteSpace: "pre-line",
            }}
          >
            {copiedData}
          </code>
        </Alert>
      </Box>
    </Box>
  );
};

export default MerchantUpload;
