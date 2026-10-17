import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import {
  DashboardHeader,
  DashboardLayout,
} from "@toolpad/core/DashboardLayout";
import logo from "../../assets/coop.gif";
import {
  Link as ReactRouterLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Footer from "../../components/Footer";
import { GlobalStyles, createTheme } from "@mui/material";
import propicture from "../../assets/profile_avatar.jpg";
import {
  Add,
  AdminPanelSettings,
  Atm,
  ChangeCircle,
  Home as HomeIcon,
  IntegrationInstructions,
  PointOfSale,
  SummarizeOutlined,
  ManageSearch,
  SettingsInputComponent,
  BookmarkAdd,
  GroupWork,
  Bookmark,
  ControlPointDuplicate,
  MoveDown,
  Folder,
  TrackChanges,
  PersonAdd,
  ManageAccounts,
  Feedback,
  BugReport,
  Analytics,
  LocalActivity,
  DeviceHub,
  AirlineStops,
  ApprovalRounded,
  SettingsApplications,
  Person2,
  Password,
  Cancel,
  RemoveDone,
  SaveAlt,
  PasswordOutlined,
  Key,
  Security,
  FolderTwoTone,
  ViewAgenda,
  StopCircleTwoTone,
  Shield,
} from "@mui/icons-material";
import { useAuthContext } from "../../context/AuthContext";
import { isDemoMode } from "../../demo/demoApi";
import { GrGlobe } from "react-icons/gr";
import { TbWorldDollar } from "react-icons/tb";

// Detail/edit screens live outside list segments (e.g. /edit, /posdetail).
// Remap them so Toolpad keeps the parent sidebar item selected.
const DETAIL_PATH_TO_NAV = {
  "/edit": "/atm/manageterminal",
  "/viewdetail": "/atm/manageterminal",
  "/atmdetail": "/atm/manageterminal",
  "/editpos": "/pos/managepos",
  "/posdetail": "/pos/managepos",
  "/approverequest": "/request/authorizedrequests",
  "/editrequest": "/request/request",
  "/requestdetail": "/request/requests",
  "/password/edit": "/password/vault",
  "/password/details": "/password/vault",
};

const navPathnameFor = (pathname) =>
  DETAIL_PATH_TO_NAV[pathname] || pathname;

const ToolpadNavLink = React.forwardRef(function ToolpadNavLink(
  { href, history, ...rest },
  ref
) {
  return (
    <ReactRouterLink
      ref={ref}
      to={href}
      replace={history === "replace"}
      {...rest}
    />
  );
});

const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "home",
    title: "Home",
    icon: <HomeIcon />,
  },
  {
    segment: "dashboard",
    title: "ATM Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "posdashboard",
    title: "POS Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "reports",
    title: "Reports",
    icon: <BarChartIcon />,
    children: [
      {
        segment: "generalreport",
        title: "Terminal Report",
        icon: <SummarizeOutlined />,
      },
      {
        segment: "posreports",
        title: "POS Reports",
        icon: <BarChartIcon />,
      },
    ],
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Administrations",
    permission: "view_pos",
  },
  {
    segment: "atm",
    title: "ATM Administration",
    icon: <Atm />,
    permission: "atm",
    children: [
      {
        segment: "add",
        title: "Create ATM",
        permission: "create_terminal",
        icon: <Add />,
      },
      {
        segment: "manageterminal",
        title: "Manage ATM",
        permission: "view_terminal",
        icon: <ManageSearch />,
      },
      {
        segment: "relocatedterminal",
        title: "Relocated ATM",
        permission: "view_relocated_terminal",
        icon: <MoveDown />,
      },
      {
        segment: "addbranch",
        title: "Add Branch",
        permission: "create_branch",
        icon: <DescriptionIcon />,
      },
      {
        segment: "viewbranch",
        title: "Branch Code",
        // Admin catalog — not for district-scoped roles (they keep view_branch for POS forms).
        permission: "view_all_districts",
        icon: <DescriptionIcon />,
      },
      {
        segment: "ports",
        title: "Create Port",
        permission: "create_port",
        icon: <GroupWork />,
      },
      {
        segment: "viewports",
        title: "Manage Port",
        permission: "view_port",
        icon: <SettingsInputComponent />,
      },
      {
        segment: "adddistrict",
        title: "Add District",
        permission: "create_district",
        icon: <DescriptionIcon />,
      },
      {
        segment: "viewdistrict",
        title: "Explore District",
        // Admin catalog — not for district-scoped roles (they keep view_district for POS forms).
        permission: "view_all_districts",
        icon: <DescriptionIcon />,
      },
      {
        segment: "command",
        title: "Create Commands",
        permission: "create_command",
        icon: <BookmarkAdd />,
      },
      {
        segment: "viewcommands",
        title: "Explore Commands",
        permission: "view_command",
        icon: <Bookmark />,
      },
    ],
  },
  {
    segment: "pos",
    title: "POS Administration",
    permission: "pos",
    icon: <PointOfSale />,
    children: [
      {
        segment: "addpos",
        title: "Create POS",
        permission: "create_pos",
        icon: <ControlPointDuplicate />,
      },
      {
        segment: "managepos",
        title: "Manage POS",
        permission: "view_pos",
        icon: <Folder />,
      },
      {
        segment: "relocatedpos",
        title: "Relocated POS",
        permission: "view_relocated_pos",
        icon: <MoveDown />,
      },
      {
        segment: "masconfig",
        title: "MAS Config",
        permission: "mas_config",
        icon: <SaveAlt />,
      },
      {
        segment: "devices",
        title: "POS Devices",
        permission: "view_device",
        icon: <DeviceHub />,
      },
    ],
  },
  {
    segment: "cybersource",
    title: "Cybersource Administration",
    icon: <GrGlobe/>,
    permission: "create_cybersource_terminal",
    children: [
      {
        segment: "create",
        title: "Create Cybersource",
        permission: "create_cybersource_terminal",
        icon: <TbWorldDollar />,
      },
      {
        segment: "view",
        title: "Manage Cybersource",
        permission: "view_cybersource_terminal",
        icon: <ViewAgenda />,
      },
      {
        segment: "deactivated",
        title: "Deactivated Cybersource",
        permission: "view_deactivated_cybersource_terminal",
        icon: <StopCircleTwoTone />,
      },
    ],
  },
  {
    segment: "administration",
    title: "System Administration",
    icon: <AdminPanelSettings />,
    children: [
      {
        segment: "createuser",
        title: "Create User",
        permission: "create_user",
        icon: <PersonAdd />,
      },
      {
        segment: "manageuser",
        title: "Manage User",
        permission: "manage_user",
        icon: <ManageAccounts />,
      },
      {
        segment: "manageroles",
        title: "Manage Roles",
        permission: "manage_role",
        icon: <Shield />,
      },
      {
        segment: "managepermissions",
        title: "Manage Permissions",
        permission: "manage_permission",
        icon: <Key />,
      },
      {
        segment: "viewfeedback",
        title: "Explore Feedback",
        permission: "view_feedback",
        icon: <Feedback />,
      },
      {
        segment: "viewbug",
        title: "Explore Bug",
        permission: "view_bug",
        icon: <BugReport />,
      },
      {
        segment: "analytics",
        title: "Analytics",
        permission: "analytics",
        icon: <Analytics />,
      },
      {
        segment: "activitylog",
        title: "Activity Log",
        permission: "activity_log",
        icon: <LocalActivity />,
      },
    ],
  },
  {
    kind: "divider",
    permission: "view_request",
  },
  {
    kind: "header",
    title: "POS Requests",
    permission: "view_request",
  },
  {
    segment: "request",
    title: "POS Requests",
    permission: "request",
    icon: <PointOfSale />,
    children: [
      {
        segment: "request",
        title: "Request POS",
        permission: "request_pos",
        icon: <Add />,
      },
      {
        segment: "requests",
        title: "New POS Requests",
        permission: "view_new_pos_request",
        icon: <TrackChanges />,
      },
      {
        segment: "sendrequests",
        title: "Authorize Requests",
        permission: "send_request",
        icon: <ApprovalRounded />,
      },
      {
        segment: "authorizedrequests",
        title: "All Requests",
        permission: "view_authorized_request",
        icon: <FolderTwoTone />,
      },
      {
        segment: "relocationrequests",
        title: "Relocation Requests",
        permission: "view_relocation_request",
        icon: <AirlineStops />,
      },
      {
        segment: "requeststatus",
        title: "Request Status",
        permission: "view_request_status",
        icon: <ChangeCircle />,
      },
      {
        segment: "rejectedrequests",
        title: "Rejected Requests",
        permission: "view_rejected_request",
        icon: <RemoveDone />,
      },
      {
        segment: "deletedrequests",
        title: "Deleted Requests",
        permission: "view_deleted_request",
        icon: <Cancel />,
      },
    ],
  },
  {
    kind: "divider",
    permission: "view_password_entry"
  },
  {
    kind: "header",
    title: "Password Manager",
    permission: "view_password_entry"
  },
  {
    segment: "password",
    title: "Password Manager",
    permission: "password",
    icon: <Security />,
    children: [
      {
        segment: "entry",
        title: "Password Entry",
        permission: "create_password_entry",
        icon: <Key />,
      },
      {
        segment: "vault",
        title: "Password Vault",
        permission: "view_password_entry",
        icon: <PasswordOutlined />,
      },
    ]
  },
  {
    kind: "divider",
    permission: "view_system_manual",
  },
  {
    kind: "header",
    title: "Manual",
    permission: "view_system_manual",
  },
  {
    segment: "manual",
    title: "Manual",
    permission: "manual",
    icon: <IntegrationInstructions />,
    children: [
      {
        segment: "systemmanual",
        title: "System Manual",
        permission: "view_system_manual",
        icon: <DescriptionIcon />,
      },
      {
        segment: "atmcreationmanual",
        title: "ATM Creation Manual",
        permission: "view_atm_creation_manual",
        icon: <DescriptionIcon />,
      },
      {
        segment: "poscreationmanual",
        title: "POS Creation Manual",
        permission: "view_pos_creation_manual",
        icon: <DescriptionIcon />,
      },
      {
        segment: "cbslinkmanual",
        title: "CBS Account Link Manual",
        permission: "view_cbs_account_link_manual",
        icon: <DescriptionIcon />,
      },
       {
        segment: "merchantguide",
        title: "POS Merchant Guide",
        permission: "view_merchant_guide",
        icon: <DescriptionIcon />,
      },
      {
        segment: "branchguide",
        title: "POS Branch Manual",
        permission: "view_branch_guide",
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    kind: "divider",
    permission: "user_profile"
  },
  {
    kind: "header",
    title: "Settings",
    permission: "user_profile"
  },
  {
    segment: "settings",
    title: "Settings",
    permission: "setting",
    icon: <SettingsApplications />,
    children: [
      {
        segment: "profile",
        title: "Profile",
        permission: "user_profile",
        icon: <Person2 />,
      },
      {
        segment: "changepassword",
        permission: "change_password",
        title: "Change Password",
        icon: <Password />,
      },
    ],
  },
];

// Matches Toolpad docs demo theme
const toolpadTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed";

/** Prefer saved preference; otherwise Toolpad default (expanded). */
function getStoredSidebarCollapsed() {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved === null) return false;
    return JSON.parse(saved) === true;
  } catch {
    return false;
  }
}

/** Persist desktop sidebar collapse via the layout header toggle. */
function PersistSidebarHeader(props) {
  const { onToggleMenu, ...rest } = props;

  const handleToggleMenu = React.useCallback(
    (isExpanded) => {
      // Only persist desktop/tablet permanent drawer (md+), not mobile temp drawer
      const isDesktop =
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 600px)").matches;
      if (isDesktop) {
        try {
          localStorage.setItem(
            SIDEBAR_COLLAPSED_KEY,
            JSON.stringify(!isExpanded)
          );
        } catch {
          // ignore quota / private mode
        }
      }
      onToggleMenu?.(isExpanded);
    },
    [onToggleMenu]
  );

  return <DashboardHeader {...rest} onToggleMenu={handleToggleMenu} />;
}

/**
 * Toolpad mini flyouts are position:fixed without a reliable top.
 * Pin them beside the hovered item and clamp into the viewport so
 * bottom items (Settings, Manual, Password…) keep all children visible.
 */
function MiniSidebarFlyoutFix() {
  React.useEffect(() => {
    let rafId = 0;

    const placeFlyout = (item) => {
      const paper = item.querySelector(".MuiPaper-root");
      const container = paper?.parentElement;
      const drawer = item.closest(".MuiDrawer-paper");
      if (!container || !paper || !drawer) return;

      const itemRect = item.getBoundingClientRect();
      const drawerRect = drawer.getBoundingClientRect();
      const margin = 10;
      const viewportH = window.innerHeight;
      const maxH = Math.max(160, viewportH - margin * 2);

      // Invisible left padding bridges the gap so hover isn't lost en route.
      const bridge = 8;
      container.style.position = "fixed";
      container.style.left = `${drawerRect.right}px`;
      container.style.transform = "none";
      container.style.paddingLeft = `${bridge}px`;
      container.style.zIndex = "1600";
      container.style.pointerEvents = "auto";

      paper.style.transform = "none";
      paper.style.maxHeight = `${maxH}px`;
      paper.style.overflowY = "auto";
      paper.style.overflowX = "hidden";

      const paperH = paper.getBoundingClientRect().height || paper.scrollHeight;
      let top = itemRect.top;

      // Prefer aligning with the hovered row; if it would clip below, shift up.
      if (top + paperH > viewportH - margin) {
        top = viewportH - margin - paperH;
      }
      // Tall menus (e.g. Manual): pin to top and scroll inside the flyout.
      if (top < margin) {
        top = margin;
      }

      container.style.top = `${top}px`;
    };

    const schedulePlace = (item) => {
      cancelAnimationFrame(rafId);
      // Double rAF: wait until Toolpad mounts/measures the flyout paper.
      rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => placeFlyout(item));
      });
    };

    const onMouseOver = (event) => {
      const item = event.target.closest?.(".MuiDrawer-paper .MuiListItem-root");
      if (!item?.querySelector(".MuiTypography-caption")) return;
      if (!item.querySelector(".MuiPaper-root")) return;
      schedulePlace(item);
    };

    const onScrollOrResize = () => {
      const open = document.querySelector(
        ".MuiDrawer-paper .MuiListItem-root:has(.MuiTypography-caption):hover .MuiPaper-root"
      );
      const item = open?.closest(".MuiListItem-root");
      if (item) schedulePlace(item);
    };

    document.addEventListener("mouseover", onMouseOver, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mouseover", onMouseOver, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, []);

  return null;
}

function SideDashboard(props) {
  const navigate = useNavigate();
  const { permissions, currentUser } = useAuthContext();

  // Filter navigation items based on permissions
  const hasPermission = (permissions, permission) => {
    return permissions?.includes(permission);
  };

  const filterNavigation = (items, permissions) => {
    return items
      .map((item) => {
        // Divider/header doesn't require permission
        if (!item.permission && !item.children) {
          return item;
        }

        // Filter children
        if (item.children) {
          const filteredChildren = filterNavigation(
            item.children,
            permissions
          );

          // If the parent itself has permission,
          // or at least one child is accessible,
          // keep the parent.
          if (
            (!item.permission ||
              hasPermission(permissions, item.permission)) &&
            filteredChildren.length > 0
          ) {
            return {
              ...item,
              children: filteredChildren,
            };
          }

          if (filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren,
            };
          }

          // Parent has no accessible children
          // and no own permission
          if (!item.permission) {
            return null;
          }
        }

        // Normal item
        if (
          !item.permission ||
          hasPermission(permissions, item.permission)
        ) {
          return item;
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredNavigation = (
    isDemoMode()
      ? NAVIGATION.map((item) => {
          if (item.segment === "password" || item.permission === "view_password_entry" || item.permission === "password") {
            return null;
          }
          if (item.children) {
            return {
              ...item,
              children: item.children.filter(
                (child) =>
                  child.permission !== "view_password_entry" &&
                  child.permission !== "create_password_entry"
              ),
            };
          }
          return item;
        }).filter(Boolean)
      : filterNavigation(NAVIGATION, permissions)
  );

  // Session state
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    if (currentUser) {
      setSession({
        user: {
          name: `${currentUser.firstName} ${currentUser.fatherName}`,
          email: `${currentUser.username}`,
          image: { propicture },
        },
      });
    }
  }, [currentUser]);

  const authentication = React.useMemo(
    () => ({
      signIn: () => {
        if (currentUser) {
          setSession({
            user: {
              name: `${currentUser.firstName} ${currentUser.fatherName}`,
              email: `${currentUser.username}`,
              image: { propicture },
            },
          });
        }
      },
      signOut: () => {
        setSession(null);
        navigate("/logout");
      },
      profile: () => {
        navigate("/profile");
      },
      account: () => {
        navigate("/accounts");
      },
    }),
    [navigate, currentUser]
  );

  const [defaultSidebarCollapsed] = React.useState(getStoredSidebarCollapsed);

  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigateImpl = React.useCallback(
    (url, { history = "auto" } = {}) => {
      if (history === "auto" || history === "push") return navigate(url);
      if (history === "replace") return navigate(url, { replace: true });
      throw new Error(`Invalid history option: ${history}`);
    },
    [navigate]
  );
  // Override Toolpad's router pathname so orphan detail URLs still highlight
  // the list page they came from (ReactRouterAppProvider spreads props after
  // its own router, so this wins).
  const selectionRouter = React.useMemo(
    () => ({
      pathname: navPathnameFor(pathname),
      searchParams,
      navigate: navigateImpl,
      Link: ToolpadNavLink,
    }),
    [pathname, searchParams, navigateImpl]
  );

  // Prevent rendering until currentUser is available
  if (!currentUser) {
    return null; // Or a loader/spinner if preferred
  }

  return (
    <ReactRouterAppProvider
      session={session}
      authentication={authentication}
      navigation={filteredNavigation}
      theme={toolpadTheme}
      router={selectionRouter}
      branding={{
        title: (
          <Typography variant="h5" fontSize="20px">
            TMS
          </Typography>
        ),
        logo: <img src={logo} alt="logo" />,
      }}
    >
      <MiniSidebarFlyoutFix />
      <GlobalStyles
        styles={{
          // Prefer CSS vars so light/dark scheme switches actually update colors.
          // (theme.palette.* baked into GlobalStyles often sticks to light values.)
          ".MuiDrawer-paper": {
            borderRight:
              "1px solid color-mix(in srgb, var(--mui-palette-divider) 80%, transparent)",
            backgroundColor: "var(--mui-palette-background-paper)",
            backgroundImage:
              "linear-gradient(180deg, color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent) 0%, transparent 160px)",
            color: "var(--mui-palette-text-primary)",
          },
          ".MuiDrawer-paper, .MuiDrawer-paper nav": {
            scrollbarWidth: "thin",
            scrollbarColor:
              "color-mix(in srgb, var(--mui-palette-text-primary) 30%, transparent) transparent",
          },
          ".MuiDrawer-paper > div, .MuiDrawer-paper nav": {
            overflowY: "auto",
            overflowX: "hidden",
          },
          ".MuiDrawer-paper::-webkit-scrollbar, .MuiDrawer-paper nav::-webkit-scrollbar, .MuiDrawer-paper .MuiPaper-root::-webkit-scrollbar":
            {
              width: 4,
            },
          ".MuiDrawer-paper::-webkit-scrollbar-track, .MuiDrawer-paper nav::-webkit-scrollbar-track, .MuiDrawer-paper .MuiPaper-root::-webkit-scrollbar-track":
            {
              background: "transparent",
            },
          ".MuiDrawer-paper::-webkit-scrollbar-thumb, .MuiDrawer-paper nav::-webkit-scrollbar-thumb, .MuiDrawer-paper .MuiPaper-root::-webkit-scrollbar-thumb":
            {
              backgroundColor:
                "color-mix(in srgb, var(--mui-palette-text-primary) 30%, transparent)",
              borderRadius: 8,
            },
          ".MuiDrawer-paper::-webkit-scrollbar-thumb:hover, .MuiDrawer-paper nav::-webkit-scrollbar-thumb:hover, .MuiDrawer-paper .MuiPaper-root::-webkit-scrollbar-thumb:hover":
            {
              backgroundColor:
                "color-mix(in srgb, var(--mui-palette-text-primary) 45%, transparent)",
            },
          ".MuiDrawer-paper .MuiListItem-root": {
            paddingLeft: "8px !important",
            paddingRight: "8px !important",
          },
          ".MuiDrawer-paper .MuiListItemButton-root": {
            borderRadius: 12,
            margin: "2px 0",
            width: "100%",
            minHeight: 48,
            boxSizing: "border-box",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
            color: "var(--mui-palette-text-primary)",
            transition:
              "background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease",
          },
          ".MuiDrawer-paper .MuiListItemButton-root .MuiListItemIcon-root": {
            minWidth: "36px !important",
            width: 36,
            height: 36,
            marginRight: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            color: "var(--mui-palette-text-secondary)",
            backgroundColor: "transparent",
            transition: "color 0.2s ease, background-color 0.2s ease",
          },
          ".MuiDrawer-paper .MuiListItemButton-root .MuiListItemText-root": {
            marginLeft: 12,
            flex: 1,
          },
          ".MuiDrawer-paper .MuiListItemButton-root .MuiListItemText-root .MuiTypography-root":
            {
              color: "var(--mui-palette-text-primary) !important",
              transition: "color 0.2s ease",
            },
          ".MuiDrawer-paper .MuiListItemButton-root .MuiListItemIcon-root svg": {
            fontSize: 22,
            color: "inherit",
          },
          ".MuiDrawer-paper .MuiListItemIcon-root svg, .MuiDrawer-paper .MuiListItemIcon-root svg *":
            {
              color: "inherit !important",
              stroke: "currentColor !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root > .MuiSvgIcon-root": {
            color: "var(--mui-palette-text-secondary)",
            transition: "color 0.2s ease, opacity 0.2s ease",
          },
          ".MuiDrawer-paper .MuiTypography-caption": {
            color: "var(--mui-palette-text-secondary) !important",
          },
          ".MuiDrawer-paper .MuiListSubheader-root": {
            lineHeight: 1.4,
            minHeight: 28,
            paddingTop: 6,
            paddingBottom: 2,
            opacity: 0.8,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: "0.68rem",
            color: "var(--mui-palette-text-secondary) !important",
            backgroundColor: "transparent !important",
          },
          ".MuiDrawer-paper .MuiDivider-root": {
            margin: "6px 12px",
            borderColor:
              "color-mix(in srgb, var(--mui-palette-divider) 85%, transparent)",
          },
          ".MuiDrawer-paper:has(.MuiTypography-caption) .MuiListSubheader-root": {
            display: "none",
          },
          ".MuiDrawer-paper:has(.MuiTypography-caption) .MuiDivider-root": {
            margin: "4px 10px",
          },
          // Mini MAIN items
          ".MuiDrawer-paper .MuiListItem-root:has(.MuiTypography-caption)": {
            overflow: "visible !important",
          },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption)": {
            position: "relative",
            justifyContent: "center !important",
            minHeight: 58,
            paddingLeft: "6px !important",
            paddingRight: "6px !important",
            borderRadius: 14,
          },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption) > .MuiBox-root":
            {
              position: "absolute !important",
              left: "50% !important",
              top: "calc(50% - 7px) !important",
              transform: "translate(-50%, -50%) !important",
              width: "auto",
              display: "flex !important",
              justifyContent: "center",
              alignItems: "center",
            },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption) .MuiListItemIcon-root":
            {
              marginLeft: "0 !important",
              marginRight: "0 !important",
              width: 34,
              height: 34,
              borderRadius: 10,
            },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption) .MuiTypography-caption":
            {
              left: "50% !important",
              transform: "translateX(-50%) !important",
              textAlign: "center !important",
              maxWidth: 56,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.62rem",
              lineHeight: 1.15,
              fontWeight: 600,
              opacity: 0.95,
              color: "var(--mui-palette-text-primary) !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption) > .MuiSvgIcon-root":
            {
              position: "absolute !important",
              top: "38%",
              right: 1,
              margin: 0,
              fontSize: 14,
              opacity: 0.65,
              transform: "translateY(-50%) rotate(-90deg)",
              zIndex: 1,
              color: "var(--mui-palette-text-secondary) !important",
            },
          // Flyout — scheme-aware surface (never bake light paper into dark)
          ".MuiDrawer-paper .MuiListItem-root:has(.MuiTypography-caption) .MuiPaper-root":
            {
              transform: "none !important",
              minWidth: 236,
              maxWidth: 288,
              borderRadius: 14,
              padding: "8px",
              backgroundImage: "none !important",
              backgroundColor: "var(--mui-palette-background-paper) !important",
              color: "var(--mui-palette-text-primary) !important",
              border:
                "1px solid color-mix(in srgb, var(--mui-palette-divider) 95%, transparent)",
              boxShadow:
                "0 12px 40px color-mix(in srgb, var(--mui-palette-common-black) 22%, transparent)",
            },
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root": {
            justifyContent: "flex-start !important",
            minHeight: 40,
            margin: "2px 0",
            paddingLeft: "10px !important",
            paddingRight: "10px !important",
            borderRadius: 10,
            color: "var(--mui-palette-text-primary) !important",
          },
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root > .MuiBox-root":
            {
              position: "static !important",
              left: "0 !important",
              top: "auto !important",
              transform: "none !important",
              width: "auto",
              display: "inline-flex",
            },
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root .MuiListItemIcon-root":
            {
              width: 32,
              height: 32,
              minWidth: "32px !important",
              color: "var(--mui-palette-text-secondary) !important",
              backgroundColor: "transparent !important",
            },
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root .MuiListItemText-root .MuiTypography-root":
            {
              color: "var(--mui-palette-text-primary) !important",
              fontWeight: 500,
            },
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root > .MuiSvgIcon-root":
            {
              position: "static !important",
              transform: "none !important",
            },
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root .MuiTypography-caption":
            {
              display: "none",
            },
          // Hover / selected
          ".MuiDrawer-paper .MuiListItemButton-root:hover": {
            backgroundColor:
              "color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent)",
          },
          ".MuiDrawer-paper .MuiListItemButton-root:hover .MuiListItemIcon-root": {
            color: "var(--mui-palette-primary-main) !important",
            backgroundColor:
              "color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent)",
          },
          ".MuiDrawer-paper .MuiListItemButton-root:hover .MuiListItemText-root .MuiTypography-root":
            {
              color: "var(--mui-palette-text-primary) !important",
              fontWeight: 600,
            },
          ".MuiDrawer-paper .MuiListItemButton-root:hover .MuiTypography-caption": {
            color: "var(--mui-palette-text-primary) !important",
            opacity: 1,
          },
          ".MuiDrawer-paper .MuiListItemButton-root:hover > .MuiSvgIcon-root": {
            color: "var(--mui-palette-text-primary) !important",
            opacity: 0.95,
          },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected": {
            backgroundColor:
              "color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent)",
            boxShadow: "inset 3px 0 0 var(--mui-palette-primary-main)",
          },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root":
            {
              color: "var(--mui-palette-primary-main) !important",
              backgroundColor:
                "color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent)",
            },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiListItemText-root .MuiTypography-root":
            {
              color: "var(--mui-palette-text-primary) !important",
              fontWeight: 600,
            },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiTypography-caption":
            {
              color: "var(--mui-palette-text-primary) !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected > .MuiSvgIcon-root":
            {
              color: "var(--mui-palette-text-primary) !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected:hover": {
            backgroundColor:
              "color-mix(in srgb, var(--mui-palette-primary-main) 22%, transparent)",
          },
          // Dark scheme: elevated charcoal flyout + high-contrast labels/icons
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper': {
            backgroundColor: "#141414",
            backgroundImage:
              "linear-gradient(180deg, color-mix(in srgb, var(--mui-palette-primary-main) 14%, transparent) 0%, transparent 180px)",
            borderRightColor: "rgba(255,255,255,0.08)",
          },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItem-root:has(.MuiTypography-caption) .MuiPaper-root':
            {
              backgroundColor: "#1f1f1f !important",
              color: "#f5f5f5 !important",
              border: "1px solid rgba(255,255,255,0.12) !important",
              boxShadow:
                "0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root':
            {
              color: "#f5f5f5 !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root .MuiListItemText-root .MuiTypography-root':
            {
              color: "#f5f5f5 !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root .MuiListItemIcon-root':
            {
              color: "rgba(255,255,255,0.72) !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root:hover':
            {
              backgroundColor:
                "color-mix(in srgb, var(--mui-palette-primary-main) 22%, transparent) !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root:hover .MuiListItemIcon-root':
            {
              color: "#fff !important",
              backgroundColor:
                "color-mix(in srgb, var(--mui-palette-primary-main) 24%, transparent) !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root .MuiListItemText-root .MuiTypography-root':
            {
              color: "#f5f5f5 !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiTypography-caption':
            {
              color: "rgba(255,255,255,0.88) !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root .MuiListItemIcon-root':
            {
              color: "rgba(255,255,255,0.78) !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root > .MuiSvgIcon-root':
            {
              color: "rgba(255,255,255,0.7) !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root:hover .MuiListItemIcon-root, [data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root':
            {
              color: "#fff !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root:hover > .MuiSvgIcon-root, [data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root.Mui-selected > .MuiSvgIcon-root':
            {
              color: "#fff !important",
            },
          // Light scheme flyout polish
          '[data-toolpad-color-scheme="light"] .MuiDrawer-paper .MuiListItem-root:has(.MuiTypography-caption) .MuiPaper-root':
            {
              backgroundColor: "#ffffff !important",
              color: "rgba(0,0,0,0.87) !important",
              border: "1px solid rgba(0,0,0,0.08) !important",
              boxShadow:
                "0 12px 36px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)",
            },
        }}
      />
      <DashboardLayout
        defaultSidebarCollapsed={defaultSidebarCollapsed}
        slots={{ header: PersistSidebarHeader }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100vh",
          }}
        >
          <Outlet />
          <Box
            sx={{
              padding: "1rem",
              display: "flex",
              justifyContent: "center",
              marginTop: "auto",
            }}
          >
            <Footer />
          </Box>
        </Box>
      </DashboardLayout>
    </ReactRouterAppProvider>
  );
}

export default SideDashboard;
