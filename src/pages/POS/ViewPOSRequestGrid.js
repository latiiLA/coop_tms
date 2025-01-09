import { ContentCopy, Edit, Preview } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import CustomToolbar from "../../components/CustomToolbar";

const ViewPOSRequestGrid = ({ rows, isRelocated }) => {
  const navigate = useNavigate();
  // console.log("grid request", rows);

  const { role } = useAuthContext();
  // console.log(pings);
  const columns = [
    // { field: "id", headerName: "No", type: "number", width: 10 },
    {
      field: "serialNumber",
      headerName: "Serial No",
      type: "String",
      flex: 0.5,
      valueGetter: (params) => params?.serialNumber || "N/A",
    },
    { field: "merchantName", headerName: "Merchant Name", flex: 1 },
    {
      field: "branchName",
      headerName: "Branch Name",
      flex: 1,
      valueGetter: (params) => params?.companyName || "N/A",
    },
    {
      field: "district",
      headerName: "District",
      flex: 0.5,
      valueGetter: (params) => params?.districtName || "N/A",
    },
    { field: "site", headerName: "Site", flex: 0.5 },
    { field: "contactName", headerName: "Contact Name", flex: 0.8 },
    { field: "posCbsAccount", headerName: "CBS Account", flex: 0.8 },
    { field: "serviceNumber", headerName: "Service Number", flex: 0.6 },
    { field: "staticIp", headerName: "IP Address", flex: 0.9 },
    { field: "status", headerName: "Status", flex: 0.5 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
            height: "100%",
            margin: "auto",
            alignItems: "center",
          }}
        >
          {!isRelocated && (
            <Tooltip title="Edit Request">
              <IconButton
                color="primary"
                size="small"
                disabled={
                  params.row.status === "Approved" ||
                  (params.row.status === "Rejected" &&
                    (role === "admin" || role === "superadmin"))
                }
                // style={{
                //   display:
                //     role === "user" || role === "posuser"
                //       ? "none"
                //       : "inline-flex",
                // }}
                onClick={() => {
                  if (role === "admin" || role === "superadmin") {
                    navigate("/approverequest", {
                      state: { row: params.row },
                    });
                  } else {
                    navigate("/request/request", {
                      state: { row: params.row, isEdit: true },
                    });
                  }
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View Request">
            <IconButton
              color="primary"
              size="small"
              onClick={() =>
                navigate("/posdetail", {
                  state: { isRequest: true, row: params.row },
                })
              }
            >
              <Preview />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy Request Information">
            <IconButton
              color="primary"
              size="small"
              onClick={() => handleCopy(params.row)}
            >
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleCopy = (rowData) => {
    // Format the row data into a string
    const rowText = `
    ${rowData.serialNumber.serialNumber}
    ${rowData.merchantName}
    ${rowData.branchName.companyName}
    ${rowData.district.districtName}
    ${rowData.site}
    ${rowData.merchantAddress}
    ${rowData.merchantPhonenumber}
    ${rowData.posCbsAccount}
    ${rowData.serviceNumber}
    ${rowData.staticIp}
    ${rowData.status}
  `;

    // Check if the Clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(rowText)
        .then(() => {
          toast.success("Request details copied to clipboard!");
        })
        .catch((err) => {
          // console.error("Failed to copy:", err);
          toast.error("Failed to copy request details.");
        });
    } else {
      // Fallback for HTTP or unsupported browsers
      fallbackCopyText(rowText);
    }
  };

  // Fallback method using a temporary textarea for older browsers or HTTP
  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Prevent scrolling to the bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy"); // Fallback to execCommand for unsupported environments
      toast.success("POS request details copied to clipboard!");
    } catch (err) {
      // console.error("Fallback: Failed to copy:", err);
      toast.error("Failed to copy POS request details.");
    }

    // Remove the textarea element after copying
    document.body.removeChild(textArea);
  };

  return (
    <Box>
      <Box
        sx={{
          width: "auto",
          margin: 1,
          "& .super-app-theme--header": {
            backgroundColor: "#0693e3",
          },
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "#0693e3",
            color: "#fff",
            fontSize: 13,
            fontWeight: "bold",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#0693e3",
            color: "#fff",
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
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          slots={
            role !== "user"
              ? { toolbar: GridToolbar }
              : { toolbar: CustomToolbar }
          }
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 20 },
            },
          }}
          pageSizeOptions={[20, 50, 100]}
          autoHeight
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default ViewPOSRequestGrid;
