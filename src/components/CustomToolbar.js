import {
  ColumnsPanelTrigger,
  ExportCsv,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid";
import {
  FileDownloadOutlined,
  FilterList,
  ViewColumn,
} from "@mui/icons-material";
import { useAuthContext } from "../context/AuthContext";
import { isDemoMode } from "../demo/demoApi";

/**
 * Data Grid v8 toolbar: columns, filters, optional CSV export.
 * Page-level search fields stay outside the toolbar (avoid a second search box).
 */
export function PermissionGridToolbar() {
  const { can, permissions } = useAuthContext();
  const showExport =
    isDemoMode() || can("export_data") || permissions?.includes("export_data");

  return (
    <Toolbar>
      <ColumnsPanelTrigger render={<ToolbarButton />} aria-label="Columns">
        <ViewColumn fontSize="small" />
      </ColumnsPanelTrigger>

      <FilterPanelTrigger render={<ToolbarButton />} aria-label="Filters">
        <FilterList fontSize="small" />
      </FilterPanelTrigger>

      {showExport && (
        <ExportCsv
          render={<ToolbarButton />}
          options={{ fileName: "exported-data" }}
          aria-label="Export CSV"
        >
          <FileDownloadOutlined fontSize="small" />
        </ExportCsv>
      )}
    </Toolbar>
  );
}

export default PermissionGridToolbar;
