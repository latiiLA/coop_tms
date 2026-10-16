import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import { GridToolbarExport } from "@mui/x-data-grid";
import { useAuthContext } from "../context/AuthContext";

// Restricted toolbar for users without export_data.
const CustomToolbar = () => {
  const { can } = useAuthContext();
  const showExportButton = useMemo(() => can("export_data"), [can]);

  return (
    <GridToolbarContainer>
      {/* Common toolbar items */}
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      {/* Conditionally render the export button */}
      {showExportButton && (
        <GridToolbarExport
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{ fileName: "exported-data" }}
        />
      )}
    </GridToolbarContainer>
  );
};

export default CustomToolbar;
