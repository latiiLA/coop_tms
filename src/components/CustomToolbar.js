import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { useMemo } from "react";
import { GridToolbarExport } from "@mui/x-data-grid";
import { SaveAlt } from "@mui/icons-material";

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
