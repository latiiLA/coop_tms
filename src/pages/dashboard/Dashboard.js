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
  Atm,
  Hub,
  Place,
  TrendingUp,
  CheckCircleOutline,
} from "@mui/icons-material";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../demo/demoApi";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const STATUS_COLORS = {
  Active: "#00AEEF",
  Relocated: "#FF6F00",
  New: "#4CAF50",
  Inactive: "#FF5722",
  Stopped: "#F44336",
  Unknown: "#9E9E9E",
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

const countStatuses = (terminals) => {
  const statusCounts = {
    Active: 0,
    Inactive: 0,
    New: 0,
    Relocated: 0,
    Stopped: 0,
    Unknown: 0,
  };

  terminals.forEach((terminal) => {
    const status = terminal.status?.trim() || "Unknown";
    if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
      statusCounts[status] += 1;
    } else {
      statusCounts.Unknown += 1;
    }
  });

  return statusCounts;
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(true);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [terminals, setTerminals] = useState([]);
  const [siteCounts, setSiteCounts] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [pingSummary, setPingSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");

  const chartText = theme.palette.text.secondary;
  const gridStroke = alpha(theme.palette.text.primary, 0.12);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("User is not authenticated");
        navigate("/home");
        return;
      }

      try {
        setLoading(true);
        const [allTerminalsRes, siteRes, districtRes, pingRes] =
          await Promise.all([
            apiGet(`${apiUrl}/terminal/getAllTerminal`, authConfig()),
            apiGet(`${apiUrl}/terminal/getSiteCounts`, authConfig()),
            apiGet(`${apiUrl}/terminal/getTerminalDataPerDistrict`, {
              ...authConfig(),
              params: { terminalType: "All" },
            }),
            apiGet(`${apiUrl}/ping/getPings`, authConfig()).catch(() => null),
          ]);

        if (cancelled) return;

        setTerminals(allTerminalsRes.data?.terminals || []);
        setSiteCounts(siteRes.data?.data || []);
        setDistrictData(
          (districtRes.data?.data || []).map((item) => ({
            district: item.districtName || item.district,
            mnemonic: item.mnemonic || item.districtName || item.district,
            CRM: item.CRM || 0,
            NCR: item.NCR || 0,
            total: (item.CRM || 0) + (item.NCR || 0),
          }))
        );

        const pings = pingRes?.data?.pings;
        if (Array.isArray(pings)) {
          const alive = pings.filter((p) => p.pingStatus === true).length;
          setPingSummary({
            alive,
            unreachable: pings.length - alive,
            total: pings.length,
          });
        }
      } catch (error) {
        toast.error(
          `Error: ${error.response?.data?.message || error.message}`
        );
        navigate("/home");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, navigate]);

  const fetchDistrictData = async (terminalType) => {
    try {
      setDistrictLoading(true);
      const response = await apiGet(
        `${apiUrl}/terminal/getTerminalDataPerDistrict`,
        {
          ...authConfig(),
          params: { terminalType },
        }
      );
      setDistrictData(
        (response.data?.data || []).map((item) => ({
          district: item.districtName || item.district,
          mnemonic: item.mnemonic || item.districtName || item.district,
          CRM: item.CRM || 0,
          NCR: item.NCR || 0,
          total: (item.CRM || 0) + (item.NCR || 0),
        }))
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load district data."
      );
    } finally {
      setDistrictLoading(false);
    }
  };

  const filteredTerminals = useMemo(() => {
    if (statusFilter === "All") return terminals;
    return terminals.filter((t) => t.type === statusFilter);
  }, [terminals, statusFilter]);

  const metrics = useMemo(() => {
    const ncr = terminals.filter((t) => t.type === "NCR").length;
    const crm = terminals.filter((t) => t.type === "CRM").length;
    const total = terminals.length;
    const statusCounts = countStatuses(terminals);

    const onsite = siteCounts.reduce((sum, s) => sum + (s.onsite || 0), 0);
    const offsite = siteCounts.reduce((sum, s) => sum + (s.offsite || 0), 0);

    const topDistrict = [...districtData].sort((a, b) => b.total - a.total)[0];

    return {
      total,
      ncr,
      crm,
      statusCounts,
      onsite,
      offsite,
      offsiteShare:
        onsite + offsite
          ? Math.round((offsite / (onsite + offsite)) * 100)
          : 0,
      activeShare: total
        ? Math.round((statusCounts.Active / total) * 100)
        : 0,
      ncrShare: total ? Math.round((ncr / total) * 100) : 0,
      topDistrict,
      districtCount: districtData.length,
    };
  }, [terminals, siteCounts, districtData]);

  const insights = useMemo(() => {
    const items = [];
    if (metrics.total) {
      items.push(
        `Fleet is ${metrics.ncrShare}% NCR and ${100 - metrics.ncrShare}% CRM (${metrics.total.toLocaleString()} terminals).`
      );
      items.push(
        `${metrics.activeShare}% are Active (${metrics.statusCounts.Active.toLocaleString()}).`
      );
    }
    if (metrics.onsite + metrics.offsite > 0) {
      items.push(
        `${metrics.offsiteShare}% are Offsite (${metrics.offsite} of ${metrics.onsite + metrics.offsite}).`
      );
    }
    if (metrics.topDistrict) {
      items.push(
        `Highest coverage: ${metrics.topDistrict.district} (${metrics.topDistrict.total} ATMs).`
      );
    }
    if (pingSummary?.total) {
      const up = Math.round((pingSummary.alive / pingSummary.total) * 100);
      items.push(
        `Network reachability: ${up}% (${pingSummary.alive}/${pingSummary.total}).`
      );
    }
    if (metrics.statusCounts.Stopped) {
      items.push(
        `${metrics.statusCounts.Stopped} terminals are Stopped and may need attention.`
      );
    }
    return items.slice(0, 4);
  }, [metrics, pingSummary]);

  const statusPie = useMemo(() => {
    const counts = countStatuses(filteredTerminals);
    return Object.entries(counts)
      .map(([label, value], id) => ({ id, label, value }))
      .filter((item) => item.value > 0);
  }, [filteredTerminals]);

  const typePie = useMemo(
    () =>
      [
        { id: 0, value: metrics.ncr, label: "NCR" },
        { id: 1, value: metrics.crm, label: "CRM" },
      ].filter((d) => d.value > 0),
    [metrics.ncr, metrics.crm]
  );

  const sitePie = useMemo(
    () =>
      [
        { id: 0, value: metrics.onsite, label: "Onsite" },
        { id: 1, value: metrics.offsite, label: "Offsite" },
      ].filter((d) => d.value > 0),
    [metrics.onsite, metrics.offsite]
  );

  const districtChartData = useMemo(
    () => [...districtData].sort((a, b) => b.total - a.total),
    [districtData]
  );

  if (loading) {
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
          <Typography color="text.secondary">Loading ATM dashboard…</Typography>
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
            ATM Dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 560 }}>
            Fleet health, site mix, and district coverage across NCR and CRM
            terminals.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          <Button
            variant="outlined"
            onClick={() => navigate("/reports/generalreport")}
            sx={{ textTransform: "none" }}
          >
            Terminal reports
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/atm/manageterminal")}
            sx={{ textTransform: "none" }}
          >
            Manage terminals
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total ATMs"
            value={metrics.total.toLocaleString()}
            hint={`${metrics.ncr} NCR · ${metrics.crm} CRM`}
            icon={<Atm fontSize="small" />}
            delay={0.05}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active"
            value={metrics.statusCounts.Active.toLocaleString()}
            hint={`${metrics.activeShare}% of fleet`}
            icon={<CheckCircleOutline fontSize="small" />}
            accent="#00AEEF"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Offsite share"
            value={`${metrics.offsiteShare}%`}
            hint={`${metrics.offsite} offsite · ${metrics.onsite} onsite`}
            icon={<Place fontSize="small" />}
            accent="#ed6c02"
            delay={0.15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label={pingSummary ? "Reachable" : "Districts"}
            value={
              pingSummary
                ? `${Math.round(
                    (pingSummary.alive / Math.max(pingSummary.total, 1)) * 100
                  )}%`
                : metrics.districtCount.toLocaleString()
            }
            hint={
              pingSummary
                ? `${pingSummary.alive} up · ${pingSummary.unreachable} down`
                : "With ATM coverage"
            }
            icon={<Hub fontSize="small" />}
            accent="#7b1fa2"
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
          <Panel
            title="ATM terminals by district"
            delay={0.22}
            action={
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="atm-district-type-label">Type</InputLabel>
                <Select
                  labelId="atm-district-type-label"
                  value={districtFilter}
                  label="Type"
                  onChange={(e) => {
                    const value = e.target.value;
                    setDistrictFilter(value);
                    fetchDistrictData(value);
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="CRM">CRM</MenuItem>
                  <MenuItem value="NCR">NCR</MenuItem>
                </Select>
              </FormControl>
            }
          >
            {districtLoading ? (
              <Box sx={{ py: 8, display: "grid", placeItems: "center" }}>
                <CircularProgress size={32} />
              </Box>
            ) : districtChartData.length === 0 ? (
              <Typography color="text.secondary">No district data yet.</Typography>
            ) : (
              <Box sx={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={districtChartData}
                    margin={{ top: 8, right: 12, left: -8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      dataKey="mnemonic"
                      tick={{ fill: chartText, fontSize: 11 }}
                    />
                    <YAxis tick={{ fill: chartText, fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                    <Legend />
                    {(districtFilter === "All" || districtFilter === "NCR") && (
                      <Bar dataKey="NCR" fill="#ff9800" name="NCR" stackId="a" />
                    )}
                    {(districtFilter === "All" || districtFilter === "CRM") && (
                      <Bar dataKey="CRM" fill="#00bcd4" name="CRM" stackId="a" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid item xs={12} md={4}>
          <Panel
            title="Status mix"
            delay={0.26}
            action={
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel id="atm-status-type-label">Type</InputLabel>
                <Select
                  labelId="atm-status-type-label"
                  value={statusFilter}
                  label="Type"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="CRM">CRM</MenuItem>
                  <MenuItem value="NCR">NCR</MenuItem>
                </Select>
              </FormControl>
            }
          >
            {statusPie.length === 0 ? (
              <Typography color="text.secondary">No status data yet.</Typography>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <PieChart
                  colors={statusPie.map(
                    (s) => STATUS_COLORS[s.label] || "#9E9E9E"
                  )}
                  series={[
                    {
                      data: statusPie,
                      innerRadius: 45,
                      outerRadius: 85,
                      paddingAngle: 2,
                    },
                  ]}
                  width={280}
                  height={250}
                />
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid item xs={12} md={4}>
          <Panel title="Type mix" delay={0.3}>
            {typePie.length === 0 ? (
              <Typography color="text.secondary">No type data yet.</Typography>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <PieChart
                  colors={["#ff9800", "#00bcd4"]}
                  series={[
                    {
                      data: typePie,
                      innerRadius: 45,
                      outerRadius: 85,
                      paddingAngle: 2,
                    },
                  ]}
                  width={280}
                  height={250}
                />
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid item xs={12} md={4}>
          <Panel title="Onsite vs Offsite" delay={0.34}>
            {sitePie.length === 0 ? (
              <Typography color="text.secondary">No site data yet.</Typography>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <PieChart
                  colors={["#2e7d32", "#ed6c02"]}
                  series={[
                    {
                      data: sitePie,
                      innerRadius: 45,
                      outerRadius: 85,
                      paddingAngle: 2,
                    },
                  ]}
                  width={280}
                  height={250}
                />
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid item xs={12}>
          <Panel title="Top districts by ATM count" delay={0.38}>
            {districtChartData.length === 0 ? (
              <Typography color="text.secondary">No district data yet.</Typography>
            ) : (
              <Grid container spacing={1.25}>
                {districtChartData.slice(0, 8).map((d, index) => (
                  <Grid item xs={12} sm={6} md={3} key={d.district}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        height: "100%",
                        border: 1,
                        borderColor: "divider",
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          index === 0 ? 0.1 : 0.04
                        ),
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={index === 0 ? 700 : 600}
                        noWrap
                        title={d.district}
                      >
                        {index + 1}. {d.district}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                        {d.total.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.NCR} NCR · {d.CRM} CRM
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

export default Dashboard;
