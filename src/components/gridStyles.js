// Shared DataGrid container styling (same layout as Manage POS, no header colour).
export const gridContainerSx = {
  width: "auto",
  margin: 1,
  "& .MuiDataGrid-columnHeader": {
    fontSize: 13,
    fontWeight: "bold",
  },
};

// Re-export toolbar (named export avoids default-import TDZ / circular HMR crashes).
export { PermissionGridToolbar } from "./CustomToolbar";
