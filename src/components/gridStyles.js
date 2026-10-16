import React from "react";
import { GridToolbar } from "@mui/x-data-grid";
import { useAuthContext } from "../context/AuthContext";
import { isDemoMode } from "../demo/demoApi";
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

// Returns the toolbar component for the current user's permissions.
export const useGridToolbar = () => {
  const { permissions } = useAuthContext();
  const canExport = isDemoMode() || permissions?.includes("export_data");
  return canExport ? GridToolbar : CustomToolbar;
};

// Stable toolbar slot component: GridToolbar with export_data, else CustomToolbar.
export const PermissionGridToolbar = (props) => {
  const Toolbar = useGridToolbar();
  return <Toolbar {...props} />;
};
