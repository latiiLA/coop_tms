import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import { GridToolbarExport } from "@mui/x-data-grid";

const CustomToolbar = ({ role }) => {
  const showExportButton = useMemo(() => role === "user", [role]);

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
