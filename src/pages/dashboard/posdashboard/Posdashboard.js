import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  GridLegacy as Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  alpha,
  keyframes,
  useTheme,
} from "@mui/material";
import {
  Download,
  PointOfSale,
  Storefront,
  TrendingUp,
  Map as MapIcon,
} from "@mui/icons-material";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { apiGet } from "../../../demo/demoApi";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const STATUS_COLORS = {
  Active: "#00AEEF",
  New: "#4CAF50",
  Stopped: "#F44336",
  ToBeRelocated: "#FF9800",
};

const authConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  };
};

const StatCard = ({ label, value, hint, icon, accent, delay = 0 }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2.25,
        height: "100%",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        animation: `${fadeUp} 0.5s ease-out ${delay}s both`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {hint && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {hint}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            borderRadius: 1,
            bgcolor: alpha(accent || theme.palette.primary.main, 0.12),
            color: accent || "primary.main",
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
};

const Panel = ({ title, action, children, delay = 0 }) => (
  <Box
    sx={{
      p: 2.25,
      height: "100%",
      bgcolor: "background.paper",
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
      animation: `${fadeUp} 0.55s ease-out ${delay}s both`,
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {action}
    </Stack>
    {children}
  </Box>
);

const Posdashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [selectedType, setSelectedType] = useState("Daily");
  const [chartData, setChartData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartText = theme.palette.text.secondary;
  const gridStroke = alpha(theme.palette.text.primary, 0.12);

  const fetchTrend = async (reportType = "Daily") => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/home");
      return;
    }

    const endpoint =
      reportType === "Weekly"
        ? "getWeeklyReport"
        : reportType === "Monthly"
          ? "getMonthlyReport"
          : "getDailyReport";

    try {
      setTrendLoading(true);
      setError(null);
      const response = await apiGet(`${apiUrl}/pos/${endpoint}`, authConfig());
      setChartData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Failed to load growth trend.");
      setChartData([]);
    } finally {
      setTrendLoading(false);
    }
  };

  const fetchOverview = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/home");
      return;
    }

    try {
      setOverviewLoading(true);
      const [districtRes, branchRes] = await Promise.all([
        apiGet(`${apiUrl}/pos/getPOSCountPerDistrict`, authConfig()),
        apiGet(`${apiUrl}/pos/getPOSCountPerBranch`, authConfig()),
      ]);

      setDistrictData(
        (districtRes.data?.result || [])
          .map((item) => ({
            district: item.districtName,
            count: item.count || 0,
          }))
          .sort((a, b) => b.count - a.count)
      );

      setBranchData(
        (branchRes.data?.result || [])
          .map((item) => ({
            branch: item.branchName,
            total: item.totalCount || 0,
            statusCounts: item.statusCounts || {},
          }))
          .sort((a, b) => b.total - a.total)
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load POS overview data."
      );
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchTrend(selectedType);
  }, [selectedType]);

  const metrics = useMemo(() => {
    const statusTotals = {
      Active: 0,
      New: 0,
      Stopped: 0,
      ToBeRelocated: 0,
    };

    branchData.forEach((branch) => {
      Object.keys(statusTotals).forEach((key) => {
        statusTotals[key] += branch.statusCounts?.[key] || 0;
      });
    });

    const totalPos =
      districtData.reduce((sum, d) => sum + d.count, 0) ||
      branchData.reduce((sum, b) => sum + b.total, 0);

    const latest = chartData[chartData.length - 1]?.Total_POS_Terminals_Created;
    const previous = chartData[chartData.length - 2]?.Total_POS_Terminals_Created;
    const periodDelta =
      latest != null && previous != null ? Math.max(latest - previous, 0) : null;

    const weekAgo = chartData[chartData.length - 8]?.Total_POS_Terminals_Created;
    const added7d =
      selectedType === "Daily" && latest != null && weekAgo != null
        ? Math.max(latest - weekAgo, 0)
        : null;

    return {
      totalPos,
      statusTotals,
      periodDelta,
      added7d,
      activeShare: totalPos
        ? Math.round((statusTotals.Active / totalPos) * 100)
        : 0,
      topDistrict: districtData[0],
      topBranch: branchData[0],
      branchCount: branchData.length,
      districtCount: districtData.length,
    };
  }, [branchData, districtData, chartData, selectedType]);

  const insights = useMemo(() => {
    const items = [];
    if (metrics.totalPos) {
      items.push(
        `${metrics.activeShare}% of POS terminals are Active (${metrics.statusTotals.Active.toLocaleString()}).`
      );
    }
    if (metrics.topDistrict) {
      items.push(
        `Top district: ${metrics.topDistrict.district} with ${metrics.topDistrict.count.toLocaleString()} POS.`
      );
    }
    if (metrics.topBranch) {
      items.push(
        `Top branch: ${metrics.topBranch.branch} (${metrics.topBranch.total.toLocaleString()} terminals).`
      );
    }
    if (metrics.added7d != null) {
      items.push(
        `${metrics.added7d} POS added over the last 7 days.`
      );
    } else if (metrics.periodDelta != null) {
      items.push(
        `+${metrics.periodDelta} since the previous ${selectedType.toLowerCase()} point.`
      );
    }
    if (metrics.statusTotals.Stopped) {
      items.push(
        `${metrics.statusTotals.Stopped.toLocaleString()} terminals are Stopped and may need follow-up.`
      );
    }
    return items.slice(0, 4);
  }, [metrics, selectedType]);

  const statusPie = useMemo(
    () =>
      Object.entries(metrics.statusTotals)
        .map(([label, value], id) => ({ id, label, value }))
        .filter((item) => item.value > 0),
    [metrics.statusTotals]
  );

  const districtChartData = useMemo(
    () => districtData.slice(0, 10),
    [districtData]
  );

  const handleReportExport = (reportData, reportType) => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    let keyLabel = "Grouping";
    if (reportType === "Daily") keyLabel = "Date";
    else if (reportType === "Weekly") keyLabel = "Week";
    else if (reportType === "Monthly") keyLabel = "Month";

    const dataForExport = [
      [`${reportType} POS Growth Report`],
      [keyLabel, "Total POS Terminals"],
      ...reportData.map((item) => [item.key, item.Total_POS_Terminals_Created]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataForExport);
    worksheet["!cols"] = [{ wch: 22 }, { wch: 22 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBlob = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBlob], { type: "application/octet-stream" }),
      `${reportType}_POS_Report.xlsx`
    );
  };

  const tickFormatter = (value) => {
    if (selectedType === "Daily") return String(value).slice(5);
    if (selectedType === "Monthly") return String(value);
    return String(value).replace("Week ", "W");
  };

  if (overviewLoading && trendLoading) {
    return (
      <Box
        sx={{
          minHeight: 360,
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress size={36} />
          <Typography color="text.secondary">Loading POS dashboard…</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 3.5 }, bgcolor: "background.default" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "flex-end" }}
        spacing={2}
        sx={{ mb: 3, animation: `${fadeUp} 0.45s ease-out both` }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            POS Dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 560 }}>
            Growth, coverage, and status across merchants and branches.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="pos-report-type-label">Period</InputLabel>
            <Select
              labelId="pos-report-type-label"
              value={selectedType}
              label="Period"
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => handleReportExport(chartData, selectedType)}
            sx={{ textTransform: "none" }}
          >
            Export trend
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/pos/managepos")}
            sx={{ textTransform: "none" }}
          >
            Manage POS
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total POS"
            value={metrics.totalPos.toLocaleString()}
            hint={`${metrics.districtCount} districts · ${metrics.branchCount} branches`}
            icon={<PointOfSale fontSize="small" />}
            delay={0.05}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active"
            value={metrics.statusTotals.Active.toLocaleString()}
            hint={`${metrics.activeShare}% of fleet`}
            icon={<Storefront fontSize="small" />}
            accent="#00AEEF"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="New"
            value={metrics.statusTotals.New.toLocaleString()}
            hint={`${metrics.statusTotals.ToBeRelocated} to relocate`}
            icon={<TrendingUp fontSize="small" />}
            accent="#4CAF50"
            delay={0.15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label={selectedType === "Daily" ? "Added (7 days)" : "Period change"}
            value={
              (selectedType === "Daily"
                ? metrics.added7d
                : metrics.periodDelta) != null
                ? `+${(selectedType === "Daily"
                    ? metrics.added7d
                    : metrics.periodDelta
                  ).toLocaleString()}`
                : "—"
            }
            hint={`${selectedType} growth view`}
            icon={<MapIcon fontSize="small" />}
            accent="#ed6c02"
            delay={0.2}
          />
        </Grid>
      </Grid>

      {insights.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            bgcolor: alpha(
              theme.palette.primary.main,
              theme.palette.mode === "dark" ? 0.08 : 0.04
            ),
            animation: `${fadeUp} 0.5s ease-out 0.18s both`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <TrendingUp color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              What the data says
            </Typography>
          </Stack>
          <Grid container spacing={1.25}>
            {insights.map((text) => (
              <Grid item xs={12} md={6} key={text}>
                <Typography variant="body2" color="text.secondary">
                  • {text}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Panel title={`${selectedType} POS growth`} delay={0.22}>
            {trendLoading ? (
              <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
                <CircularProgress size={32} />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : chartData.length === 0 ? (
              <Typography color="text.secondary">No growth data yet.</Typography>
            ) : (
              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 12, left: -8, bottom: 8 }}
                  >
                    <defs>
                      <linearGradient id="posTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={theme.palette.primary.main}
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor={theme.palette.primary.main}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      dataKey="key"
                      tick={{ fill: chartText, fontSize: 11 }}
                      tickFormatter={tickFormatter}
                      interval="preserveStartEnd"
                      minTickGap={24}
                    />
                    <YAxis tick={{ fill: chartText, fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                      labelFormatter={(label) => String(label)}
                    />
                    <Area
                      type="monotone"
                      dataKey="Total_POS_Terminals_Created"
                      name="POS terminals"
                      stroke={theme.palette.primary.main}
                      fill="url(#posTrendFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid item xs={12} md={7}>
          <Panel
            title="POS by district"
            delay={0.26}
            action={
              <Button
                size="small"
                onClick={() => navigate("/reports/posreports")}
                sx={{ textTransform: "none" }}
              >
                Reports
              </Button>
            }
          >
            {districtChartData.length === 0 ? (
              <Typography color="text.secondary">No district data yet.</Typography>
            ) : (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={districtChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" tick={{ fill: chartText, fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="district"
                      width={110}
                      tick={{ fill: chartText, fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                    <Bar dataKey="count" name="POS" fill="#00bcd4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid item xs={12} md={5}>
          <Panel title="Status mix" delay={0.3}>
            {statusPie.length === 0 ? (
              <Typography color="text.secondary">No status data yet.</Typography>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <PieChart
                  colors={statusPie.map((s) => STATUS_COLORS[s.label] || "#9E9E9E")}
                  series={[
                    {
                      data: statusPie,
                      innerRadius: 45,
                      outerRadius: 85,
                      paddingAngle: 2,
                    },
                  ]}
                  width={280}
                  height={260}
                />
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid item xs={12}>
          <Panel title="Top branches by POS count" delay={0.34}>
            {branchData.length === 0 ? (
              <Typography color="text.secondary">No branch data yet.</Typography>
            ) : (
              <Grid container spacing={1.25}>
                {branchData.slice(0, 8).map((branch, index) => (
                  <Grid item xs={12} sm={6} md={3} key={`${branch.branch}-${index}`}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          index === 0 ? 0.1 : 0.04
                        ),
                        border: 1,
                        borderColor: "divider",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={index === 0 ? 700 : 600}
                        noWrap
                        title={branch.branch}
                      >
                        {index + 1}. {branch.branch}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                        {branch.total.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {branch.statusCounts?.Active || 0} active ·{" "}
                        {branch.statusCounts?.New || 0} new ·{" "}
                        {branch.statusCounts?.Stopped || 0} stopped
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Panel>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Posdashboard;
