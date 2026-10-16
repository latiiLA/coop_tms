import React from "react";
import CustomToolbar from "./CustomToolbar";

// Shared DataGrid container styling (same layout as Manage POS, no header colour).
export const gridContainerSx = {
  width: "auto",
  margin: 1,
  "& .MuiDataGrid-columnHeader": {
    fontSize: 13,
    fontWeight: "bold",
  },
};

// Stable toolbar slot: v8 Toolbar with export gated by export_data inside CustomToolbar.
export const PermissionGridToolbar = (props) => <CustomToolbar {...props} />;
