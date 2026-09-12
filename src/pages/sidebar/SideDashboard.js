import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import logo from "../../assets/coop.gif";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { GlobalStyles, createTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import propicture from "../../assets/profile_avatar.jpg";
import {
  Add,
  AdminPanelSettings,
  Atm,
  ChangeCircle,
  Explore,
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
} from "@mui/icons-material";
import { useAuthContext } from "../../context/AuthContext";
import { isDemoMode } from "../../demo/demoApi";
import { GrGlobe } from "react-icons/gr";
import { TbActivityHeartbeat, TbWorld, TbWorldDollar } from "react-icons/tb";
import { MdOutlinePersonPinCircle } from "react-icons/md";
// import { TbStatusChange } from "react-icons/tb";
// import customTheme from "../../DarkMode/customTheme";
// import DarkMode from "../../DarkMode/DarkMode";

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
        permission: "view_branch",
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
        permission: "view_district",
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
    permission: "administration",
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
      // {
      //   segment: "bulkrequest",
      //   title: "Bulk POS Request",
      //   icon: <List />,
      // },
      // {
      //   segment: "relocate",
      //   title: "Relocate POS",
      //   icon: <TbStatusChange />,
      // },
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

/** Toolpad mini flyouts are position:fixed without top — pin them beside the hovered item. */
function MiniSidebarFlyoutFix() {
  React.useEffect(() => {
    const positionFlyout = (event) => {
      const item = event.target.closest?.(".MuiDrawer-paper .MuiListItem-root");
      if (!item?.querySelector(".MuiTypography-caption")) return;

      const paper = item.querySelector(".MuiPaper-root");
      const container = paper?.parentElement;
      const drawer = item.closest(".MuiDrawer-paper");
      if (!container || !paper || !drawer) return;

      const itemRect = item.getBoundingClientRect();
      // Place past the drawer edge (divider/scrollbar), not on top of it
      const drawerRect = drawer.getBoundingClientRect();
      container.style.position = "fixed";
      container.style.left = `${drawerRect.right + 2}px`;
      container.style.top = `${itemRect.top}px`;
      container.style.transform = "none";
      container.style.paddingLeft = "0px";
      container.style.zIndex = "1600";
      paper.style.transform = "none";
    };

    document.addEventListener("mouseover", positionFlyout, true);
    return () => document.removeEventListener("mouseover", positionFlyout, true);
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
        styles={(theme) => ({
          ".MuiDrawer-paper, .MuiDrawer-paper nav": {
            scrollbarWidth: "thin",
            scrollbarColor: `${alpha(theme.palette.text.primary, 0.28)} transparent`,
          },
          ".MuiDrawer-paper::-webkit-scrollbar, .MuiDrawer-paper nav::-webkit-scrollbar":
            {
              width: 4,
            },
          ".MuiDrawer-paper::-webkit-scrollbar-track, .MuiDrawer-paper nav::-webkit-scrollbar-track":
            {
              background: "transparent",
            },
          ".MuiDrawer-paper::-webkit-scrollbar-thumb, .MuiDrawer-paper nav::-webkit-scrollbar-thumb":
            {
              backgroundColor: alpha(theme.palette.text.primary, 0.28),
              borderRadius: 8,
            },
          ".MuiDrawer-paper::-webkit-scrollbar-thumb:hover, .MuiDrawer-paper nav::-webkit-scrollbar-thumb:hover":
            {
              backgroundColor: alpha(theme.palette.text.primary, 0.42),
            },
          ".MuiDrawer-paper .MuiListItem-root": {
            paddingLeft: "8px !important",
            paddingRight: "8px !important",
          },
          ".MuiDrawer-paper .MuiListItemButton-root": {
            borderRadius: 10,
            margin: "2px 0",
            width: "100%",
            minHeight: 48,
            boxSizing: "border-box",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
            transition: "background-color 0.2s ease, color 0.2s ease",
          },
          ".MuiDrawer-paper .MuiListItemButton-root .MuiListItemIcon-root": {
            minWidth: "36px !important",
            width: 36,
            height: 36,
            marginRight: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--mui-palette-text-secondary)",
            backgroundColor: "transparent",
            transition: "color 0.2s ease",
          },
          ".MuiDrawer-paper .MuiListItemButton-root .MuiListItemText-root": {
            marginLeft: 12,
            flex: 1,
          },
          ".MuiDrawer-paper .MuiListItemButton-root .MuiListItemText-root .MuiTypography-root":
            {
              color: "var(--mui-palette-text-primary)",
              transition: "color 0.2s ease",
            },
          ".MuiDrawer-paper .MuiListItemButton-root .MuiListItemIcon-root svg": {
            fontSize: 22,
            color: "inherit",
          },
          // react-icons (e.g. Cybersource GrGlobe) — follow icon color, not hardcoded black
          ".MuiDrawer-paper .MuiListItemIcon-root svg, .MuiDrawer-paper .MuiListItemIcon-root svg *":
            {
              color: "inherit !important",
              stroke: "currentColor !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root > .MuiSvgIcon-root": {
            color: "var(--mui-palette-text-primary)",
            transition: "color 0.2s ease",
          },
          ".MuiDrawer-paper .MuiTypography-caption": {
            color: "var(--mui-palette-text-primary)",
          },
          // Mini MAIN sidebar items only (have caption under icon) — not flyout children
          ".MuiDrawer-paper .MuiListItem-root:has(.MuiTypography-caption)": {
            paddingLeft: "4px !important",
            paddingRight: "4px !important",
            overflow: "visible !important",
          },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption)":
            {
              position: "relative",
              justifyContent: "center !important",
              minHeight: 60,
              paddingLeft: "0 !important",
              paddingRight: "0 !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption) > .MuiBox-root":
            {
              left: "0 !important",
              top: "-2px !important",
              width: "100%",
              display: "flex !important",
              justifyContent: "center",
              alignItems: "center",
            },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption) .MuiListItemIcon-root":
            {
              marginLeft: "0 !important",
              marginRight: "0 !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption) .MuiTypography-caption":
            {
              left: "50% !important",
              width: "calc(100% - 8px) !important",
              transform: "translateX(-50%) !important",
              textAlign: "center !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root:has(.MuiTypography-caption) > .MuiSvgIcon-root":
            {
              position: "absolute !important",
              top: "50%",
              right: 2,
              margin: 0,
              fontSize: 18,
              transform: "translateY(-50%) rotate(-90deg)",
              zIndex: 1,
            },
          ".MuiDrawer-paper .MuiListItem-root:has(.MuiTypography-caption) .MuiPaper-root":
            {
              transform: "none !important",
              minWidth: 220,
              boxShadow: theme.shadows[8],
            },
          // Flyout children keep normal left-aligned row (icon + label)
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root": {
            justifyContent: "flex-start !important",
            minHeight: 40,
            paddingLeft: "12px !important",
            paddingRight: "12px !important",
          },
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root > .MuiBox-root":
            {
              left: "0 !important",
              width: "auto",
              display: "inline-flex",
            },
          ".MuiDrawer-paper .MuiPaper-root .MuiListItemButton-root > .MuiSvgIcon-root":
            {
              position: "static !important",
              transform: "none !important",
            },
          // Hover / selected — use CSS vars so dark theme stays light text
          ".MuiDrawer-paper .MuiListItemButton-root:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
          ".MuiDrawer-paper .MuiListItemButton-root:hover .MuiListItemIcon-root":
            {
              color: "var(--mui-palette-primary-main)",
              backgroundColor: "transparent",
            },
          ".MuiDrawer-paper .MuiListItemButton-root:hover .MuiListItemText-root .MuiTypography-root":
            {
              color: "var(--mui-palette-text-primary) !important",
              fontWeight: 600,
            },
          ".MuiDrawer-paper .MuiListItemButton-root:hover .MuiTypography-caption":
            {
              color: "var(--mui-palette-text-primary) !important",
            },
          ".MuiDrawer-paper .MuiListItemButton-root:hover > .MuiSvgIcon-root": {
            color: "var(--mui-palette-text-primary)",
          },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
          },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root":
            {
              color: "var(--mui-palette-primary-main)",
              backgroundColor: "transparent",
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
              color: "var(--mui-palette-text-primary)",
            },
          ".MuiDrawer-paper .MuiListItemButton-root.Mui-selected:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
          },
          // Dark theme: keep labels + chevrons white (incl. children flyout)
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root .MuiListItemText-root .MuiTypography-root':
            {
              color: "#fff",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root:hover .MuiListItemText-root .MuiTypography-root, [data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiListItemText-root .MuiTypography-root':
            {
              color: "#fff !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiTypography-caption':
            {
              color: "#fff",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root > .MuiSvgIcon-root, [data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root:hover > .MuiSvgIcon-root, [data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root.Mui-selected > .MuiSvgIcon-root':
            {
              color: "#fff !important",
            },
          '[data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root:hover .MuiListItemIcon-root, [data-toolpad-color-scheme="dark"] .MuiDrawer-paper .MuiListItemButton-root.Mui-selected .MuiListItemIcon-root':
            {
              color: "#fff",
            },
        })}
      />
      <DashboardLayout>
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
