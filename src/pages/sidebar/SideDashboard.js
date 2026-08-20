import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import logo from "../../assets/coop.gif";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { Avatar, createTheme, IconButton, Tooltip } from "@mui/material";
import propicture from "../../assets/profile_avatar.jpg";
import {
  Add,
  AdminPanelSettings,
  Atm,
  ChangeCircle,
  Explore,
  IntegrationInstructions,
  Link,
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
} from "@mui/icons-material";
import { useAuthContext } from "../../context/AuthContext";
// import { TbStatusChange } from "react-icons/tb";
// import customTheme from "../../DarkMode/customTheme";
// import DarkMode from "../../DarkMode/DarkMode";

const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
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
    segment: "links",
    title: "Links",
    icon: <Link />,
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
        segment: "viewports",
        title: "Manage Port",
        permission: "view_port",
        icon: <SettingsInputComponent />,
      },
      {
        segment: "viewbranch",
        title: "Branch Code",
        permission: "view_branch",
        icon: <DescriptionIcon />,
      },
      {
        segment: "viewcommands",
        title: "Explore Commands",
        permission: "view_command",
        icon: <Bookmark />,
      },
      {
        segment: "command",
        title: "Create Commands",
        permission: "create_command",
        icon: <BookmarkAdd />,
      },
      {
        segment: "adddistrict",
        title: "Add District",
        permission: "create_district",
        icon: <DescriptionIcon />,
      },
      {
        segment: "addbranch",
        title: "Add Branch",
        permission: "create_branch",
        icon: <DescriptionIcon />,
      },
      {
        segment: "ports",
        title: "Create Port",
        permission: "create_port",
        icon: <GroupWork />,
      },
      {
        segment: "viewdistrict",
        title: "Explore District",
        permission: "view_district",
        icon: <DescriptionIcon />,
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

function DemoPageContent({ pathname }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate(pathname);
  }, [pathname]);
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

const defaultTheme = createTheme();

function SideDashboard(props) {
  // const { theme, toggleTheme } = use;
  const navigate = useNavigate();
  const { role, permissions, currentUser } = useAuthContext();

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

  const filteredNavigation = filterNavigation(
    NAVIGATION,
    permissions
  );

  const initialRoute = window.location.pathname || "/home";
  const router = useDemoRouter(initialRoute);
  // console.log("router", router.pathname);

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

  function ToolbarActionsSearch() {
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenUserMenu = (event) => {
      setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };
    return (
      <Tooltip title="Open setting">
        <IconButton onClick={handleOpenUserMenu}>
          <Avatar alt="User Photo" src={propicture} />
        </IconButton>
      </Tooltip>
    );
  }

  // Prevent rendering until currentUser is available
  if (!currentUser) {
    return null; // Or a loader/spinner if preferred
  }

  return (
    <AppProvider
      session={session}
      authentication={authentication}
      navigation={filteredNavigation}
      router={router}
      // theme={defaultTheme}
      branding={{
        title: (
          <Typography variant="h5" fontSize="20px">
            TMS
          </Typography>
        ),
        logo: <img src={logo} alt="logo" />,
      }}
    >
      <DashboardLayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100vh",
          }}
        >
          <DemoPageContent pathname={router.pathname} />
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
    </AppProvider>
  );
}

export default SideDashboard;
