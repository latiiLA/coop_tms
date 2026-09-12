import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  GridLegacy as Grid,
  Stack,
  Typography,
  alpha,
  keyframes,
  useTheme,
} from "@mui/material";
import {
  ArrowForward,
  Atm,
  Dashboard,
  Hub,
  Link as LinkIcon,
  OpenInNew,
  Place,
  PointOfSale,
  TrendingUp,
} from "@mui/icons-material";
import { useAuthContext } from "../context/AuthContext";
import { apiGet, isDemoMode } from "../demo/demoApi";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const INTERNAL_LINKS = [
  {
    label: "Power BI",
    href: "http://10.185.15.9:9502/analytics",
    action: "Power BI Dashboard",
  },
  {
    label: "IST GUI",
    href: "https://10.12.11.11:8002/IST-CBOSwitch",
    action: "IST Switch GUI",
  },
  {
    label: "Coop IT Service Management",
    href: "https://itservicemanagement.coopbank.local:8080/",
    action: "IT Service Management",
  },
  {
    label: "Cortex Web",
    href: "https://10.12.11.90:4443/cortex-web",
    action: "Cortex Web GUI",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const authConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  };
};

const can = (permissions, permission) =>
  !permission || permissions?.includes(permission);

const MiniStat = ({ label, value, hint, delay = 0 }) => (
  <Box
    sx={{
      p: 1.75,
      height: "100%",
      bgcolor: "background.paper",
      border: 1,
      borderColor: "divider",
      borderRadius: 1,
      animation: `${fadeUp} 0.45s ease-out ${delay}s both`,
    }}
  >
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.35, lineHeight: 1.2 }}>
      {value}
    </Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        {hint}
      </Typography>
    )}
  </Box>
);

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, permissions } = useAuthContext();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [loading, setLoading] = useState(true);
  const [atmTotal, setAtmTotal] = useState(0);
  const [atmActive, setAtmActive] = useState(0);
  const [atmStopped, setAtmStopped] = useState(0);
  const [ncr, setNcr] = useState(0);
  const [crm, setCrm] = useState(0);
  const [onsite, setOnsite] = useState(0);
  const [offsite, setOffsite] = useState(0);
  const [atmDistricts, setAtmDistricts] = useState([]);
  const [posTotal, setPosTotal] = useState(0);
  const [posActive, setPosActive] = useState(0);
  const [posNew, setPosNew] = useState(0);
  const [posStopped, setPosStopped] = useState(0);
  const [posDistricts, setPosDistricts] = useState([]);
  const [posBranches, setPosBranches] = useState(0);
  const [posAdded7d, setPosAdded7d] = useState(null);
  const [pingSummary, setPingSummary] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(null);

  const firstName = currentUser?.firstName || currentUser?.username || "there";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!localStorage.getItem("token")) {
        setLoading(false);
        return;
      }

      try {
        const requests = [
          apiGet(`${apiUrl}/terminal/getTerminalCounts`, authConfig()),
          apiGet(`${apiUrl}/terminal/getAllTerminal`, authConfig()),
          apiGet(`${apiUrl}/terminal/getSiteCounts`, authConfig()),
          apiGet(`${apiUrl}/terminal/getTerminalDataPerDistrict`, {
            ...authConfig(),
            params: { terminalType: "All" },
          }),
          apiGet(`${apiUrl}/pos/getPOSCountPerDistrict`, authConfig()),
          apiGet(`${apiUrl}/pos/getPOSCountPerBranch`, authConfig()),
          apiGet(`${apiUrl}/pos/getDailyReport`, authConfig()),
          apiGet(`${apiUrl}/ping/getPings`, authConfig()).catch(() => null),
        ];

        if (permissions?.includes("view_new_pos_request")) {
          requests.push(
            apiGet(`${apiUrl}/request/getNewRequest`, authConfig()).catch(
              () => null
            )
          );
        }

        const results = await Promise.allSettled(requests);
        if (cancelled) return;

        const value = (i) =>
          results[i]?.status === "fulfilled" ? results[i].value?.data : null;

        const counts = value(0)?.terminalsCount || [];
        const ncrCount = counts.find((t) => t._id === "NCR")?.count || 0;
        const crmCount = counts.find((t) => t._id === "CRM")?.count || 0;
        setNcr(ncrCount);
        setCrm(crmCount);

        const terminals = value(1)?.terminals || [];
        setAtmTotal(
          counts.reduce((sum, t) => sum + (t.count || 0), 0) || terminals.length
        );
        setAtmActive(
          terminals.filter((t) => t.status?.trim() === "Active").length
        );
        setAtmStopped(
          terminals.filter((t) => t.status?.trim() === "Stopped").length
        );

        const sites = value(2)?.data || [];
        setOnsite(sites.reduce((sum, s) => sum + (s.onsite || 0), 0));
        setOffsite(sites.reduce((sum, s) => sum + (s.offsite || 0), 0));

        const atmByDistrict = (value(3)?.data || [])
          .map((item) => ({
            district: item.districtName || item.district,
            total: (item.CRM || 0) + (item.NCR || 0),
          }))
          .sort((a, b) => b.total - a.total);
        setAtmDistricts(atmByDistrict);

        const districts = (value(4)?.result || [])
          .map((item) => ({
            district: item.districtName || item.district,
            count: item.count || 0,
          }))
          .sort((a, b) => b.count - a.count);
        setPosDistricts(districts);
        setPosTotal(districts.reduce((sum, d) => sum + d.count, 0));

        const branches = value(5)?.result || [];
        setPosBranches(branches.length);
        setPosActive(
          branches.reduce((sum, b) => sum + (b.statusCounts?.Active || 0), 0)
        );
        setPosNew(
          branches.reduce((sum, b) => sum + (b.statusCounts?.New || 0), 0)
        );
        setPosStopped(
          branches.reduce((sum, b) => sum + (b.statusCounts?.Stopped || 0), 0)
        );

        const daily = Array.isArray(value(6)) ? value(6) : [];
        const latest = daily[daily.length - 1]?.Total_POS_Terminals_Created;
        const weekAgo = daily[daily.length - 8]?.Total_POS_Terminals_Created;
        if (latest != null && weekAgo != null) {
          setPosAdded7d(Math.max(latest - weekAgo, 0));
        }

        const pings = value(7)?.pings;
        if (Array.isArray(pings)) {
          const alive = pings.filter((p) => p.pingStatus === true).length;
          setPingSummary({
            alive,
            unreachable: pings.length - alive,
            total: pings.length,
          });
        }

        if (permissions?.includes("view_new_pos_request")) {
          const reqData = value(8);
          const list = reqData?.newRequests;
          if (Array.isArray(list)) setPendingRequests(list.length);
        }
      } catch (error) {
        console.error("Home summary failed:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, permissions]);

  const overall = useMemo(() => {
    const siteTotal = onsite + offsite;
    return {
      fleetTotal: atmTotal + posTotal,
      atmActiveShare: atmTotal
        ? Math.round((atmActive / atmTotal) * 100)
        : 0,
      posActiveShare: posTotal
        ? Math.round((posActive / posTotal) * 100)
        : 0,
      offsiteShare: siteTotal
        ? Math.round((offsite / siteTotal) * 100)
        : 0,
      topAtm: atmDistricts[0],
      topPos: posDistricts[0],
      reachableShare: pingSummary?.total
        ? Math.round((pingSummary.alive / pingSummary.total) * 100)
        : null,
    };
  }, [
    atmTotal,
    posTotal,
    atmActive,
    posActive,
    onsite,
    offsite,
    atmDistricts,
    posDistricts,
    pingSummary,
  ]);

  const highlights = useMemo(() => {
    const items = [];
    items.push(
      `Network footprint: ${overall.fleetTotal.toLocaleString()} terminals (${atmTotal.toLocaleString()} ATM · ${posTotal.toLocaleString()} POS).`
    );
    if (atmTotal) {
      items.push(
        `ATM health: ${overall.atmActiveShare}% active · ${ncr} NCR / ${crm} CRM · ${overall.offsiteShare}% offsite.`
      );
    }
    if (posTotal) {
      items.push(
        `POS health: ${overall.posActiveShare}% active · ${posNew} new · ${posStopped} stopped · ${posBranches} branches.`
      );
    }
    if (overall.topAtm || overall.topPos) {
      const parts = [];
      if (overall.topAtm) {
        parts.push(
          `ATM lead district ${overall.topAtm.district} (${overall.topAtm.total})`
        );
      }
      if (overall.topPos) {
        parts.push(
          `POS lead district ${overall.topPos.district} (${overall.topPos.count})`
        );
      }
      items.push(parts.join(" · ") + ".");
    }
    if (posAdded7d != null) {
      items.push(`${posAdded7d} POS terminals added in the last 7 days.`);
    }
    if (overall.reachableShare != null) {
      items.push(
        `ATM reachability: ${overall.reachableShare}% (${pingSummary.alive}/${pingSummary.total}).`
      );
    }
    if (pendingRequests != null) {
      items.push(
        `${pendingRequests} POS request${pendingRequests === 1 ? "" : "s"} waiting for action.`
      );
    }
    if (atmStopped) {
      items.push(`${atmStopped} ATM terminals are Stopped.`);
    }
    return items.slice(0, 6);
  }, [
    overall,
    atmTotal,
    posTotal,
    ncr,
    crm,
    posNew,
    posStopped,
    posBranches,
    posAdded7d,
    pingSummary,
    pendingRequests,
    atmStopped,
  ]);

  const jumpLinks = useMemo(() => {
    const links = [
      {
        label: "Manage terminals",
        to: "/atm/manageterminal",
        permission: "view_terminal",
      },
      {
        label: "Manage POS",
        to: "/pos/managepos",
        permission: "view_pos",
      },
      {
        label: "Terminal reports",
        to: "/reports/generalreport",
      },
      {
        label: "POS reports",
        to: "/reports/posreports",
        permission: "view_pos",
      },
    ];
    return links.filter((l) => can(permissions, l.permission));
  }, [permissions]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <CircularProgress size={34} />
          <Typography color="text.secondary">Loading overview…</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 }, bgcolor: "background.default" }}>
      <Stack
        spacing={1}
        sx={{ mb: 3, animation: `${fadeUp} 0.45s ease-out both` }}
      >
        <Typography variant="h4" fontWeight={700} color="primary">
          {getGreeting()}, {firstName}
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 620 }}>
          Overall TMS snapshot across ATM and POS. Use the dashboards for full
          charts and deep detail.
        </Typography>
      </Stack>

      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid item xs={6} md={3}>
          <MiniStat
            label="Total fleet"
            value={overall.fleetTotal.toLocaleString()}
            hint="ATM + POS"
            delay={0.04}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MiniStat
            label="ATM active"
            value={`${overall.atmActiveShare}%`}
            hint={`${atmActive.toLocaleString()} of ${atmTotal.toLocaleString()}`}
            delay={0.08}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MiniStat
            label="POS active"
            value={`${overall.posActiveShare}%`}
            hint={`${posActive.toLocaleString()} of ${posTotal.toLocaleString()}`}
            delay={0.12}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MiniStat
            label={overall.reachableShare != null ? "Reachable ATMs" : "ATM offsite"}
            value={
              overall.reachableShare != null
                ? `${overall.reachableShare}%`
                : `${overall.offsiteShare}%`
            }
            hint={
              overall.reachableShare != null
                ? `${pingSummary.alive} up · ${pingSummary.unreachable} down`
                : `${offsite} offsite · ${onsite} onsite`
            }
            delay={0.16}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2.5,
              height: "100%",
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              animation: `${fadeUp} 0.5s ease-out 0.18s both`,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                }}
              >
                <Atm fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  ATM network
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ncr} NCR · {crm} CRM · {atmDistricts.length} districts
                </Typography>
              </Box>
            </Stack>

            <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.1 }}>
              {atmTotal.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {atmActive.toLocaleString()} active · {atmStopped} stopped ·{" "}
              {overall.offsiteShare}% offsite
            </Typography>
            {overall.topAtm && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1, mb: 2 }}>
                <Place fontSize="inherit" color="action" sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">
                  Top district: {overall.topAtm.district} ({overall.topAtm.total})
                </Typography>
              </Stack>
            )}
            {!overall.topAtm && <Box sx={{ mb: 2 }} />}

            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => navigate("/dashboard")}
              sx={{ textTransform: "none" }}
            >
              Open ATM dashboard
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box
            sx={{
              p: 2.5,
              height: "100%",
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              animation: `${fadeUp} 0.5s ease-out 0.22s both`,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 1,
                  bgcolor: alpha("#2e7d32", 0.12),
                  color: "#2e7d32",
                }}
              >
                <PointOfSale fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  POS network
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {posDistricts.length} districts · {posBranches} branches
                  {posAdded7d != null ? ` · +${posAdded7d} / 7d` : ""}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.1 }}>
              {posTotal.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {posActive.toLocaleString()} active · {posNew} new · {posStopped} stopped
            </Typography>
            {overall.topPos && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1, mb: 2 }}>
                <TrendingUp fontSize="inherit" color="action" sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">
                  Top district: {overall.topPos.district} ({overall.topPos.count})
                </Typography>
              </Stack>
            )}
            {!overall.topPos && <Box sx={{ mb: 2 }} />}

            <Button
              variant="contained"
              color="success"
              endIcon={<ArrowForward />}
              onClick={() => navigate("/posdashboard")}
              sx={{ textTransform: "none" }}
            >
              Open POS dashboard
            </Button>
          </Box>
        </Grid>
      </Grid>

      {highlights.length > 0 && (
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            bgcolor: alpha(
              theme.palette.primary.main,
              theme.palette.mode === "dark" ? 0.08 : 0.04
            ),
            animation: `${fadeUp} 0.5s ease-out 0.26s both`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Hub color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              Overall picture
            </Typography>
          </Stack>
          <Grid container spacing={1}>
            {highlights.map((text) => (
              <Grid item xs={12} md={6} key={text}>
                <Typography variant="body2" color="text.secondary">
                  • {text}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {jumpLinks.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
          sx={{ mb: 2.5, animation: `${fadeUp} 0.5s ease-out 0.3s both` }}
        >
          <Dashboard fontSize="small" color="action" />
          {jumpLinks.map((link) => (
            <Button
              key={link.to}
              size="small"
              variant="outlined"
              onClick={() => navigate(link.to)}
              sx={{ textTransform: "none" }}
            >
              {link.label}
            </Button>
          ))}
        </Stack>
      )}

      {!isDemoMode() && (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          animation: `${fadeUp} 0.5s ease-out 0.34s both`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <LinkIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={700}>
            Internal links
          </Typography>
        </Stack>
        <Grid container spacing={1.5}>
          {INTERNAL_LINKS.map((item) => (
            <Grid item xs={12} sm={6} key={item.href}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "background.default",
                  height: "100%",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {item.label}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: "none", flexShrink: 0 }}
                >
                  {item.action}
                </Button>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>
      )}
    </Box>
  );
};

export default Home;
