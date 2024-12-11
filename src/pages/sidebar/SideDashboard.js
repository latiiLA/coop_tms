import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { useDemoRouter } from "@toolpad/core/internal";
import logo from "../../assets/coop.gif";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import {
  Avatar,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Popover,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  useColorScheme,
} from "@mui/material";
import { AccountPreview } from "@toolpad/core/Account";
import propicture from "../../assets/profile_avatar.jpg";
import { useTheme } from "../../context/ThemeProvider";
import {
  Add,
  AdminPanelSettings,
  Atm,
  ChangeCircle,
  Explore,
  IntegrationInstructions,
  Link,
  PointOfSale,
  List,
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
} from "@mui/icons-material";
import { useAuthContext } from "../../context/AuthContext";
import { TbStatusChange } from "react-icons/tb";

const NAVIGATION = [
  {
    kind: "header",
    title: "Main items",
    roles: ["superadmin", "admin", "user"],
  },
  {
    segment: "dashboard",
    title: "ATM Dashboard",
    icon: <DashboardIcon />,
    roles: ["superadmin", "admin", "user"],
  },
  {
    segment: "posdashboard",
    title: "POS Dashboard",
    icon: <DashboardIcon />,
    roles: ["superadmin", "admin", "posuser"],
  },
  {
    segment: "view",
    title: "Explore Terminal",
    icon: <Explore />,
    roles: ["user"],
  },
  {
    segment: "links",
    title: "Links",
    icon: <Link />,
    roles: ["superadmin", "admin", "user"],
  },
  {
    segment: "reports",
    title: "Reports",
    icon: <BarChartIcon />,
    roles: ["superadmin", "admin", "user"],
    children: [
      {
        segment: "generalreport",
        title: "Terminal Report",
        icon: <SummarizeOutlined />,
        roles: ["admin", "user"],
      },
    ],
  },

  {
    kind: "divider",
    roles: ["superadmin", "admin"],
  },

  {
    kind: "header",
    title: "Requests",
    roles: ["posuser"],
  },
  {
    segment: "request",
    title: "POS Requests",
    icon: <PointOfSale />,
    roles: ["posuser"],
    children: [
      {
        segment: "request",
        title: "Request POS",
        icon: <Add />,
      },

      // {
      //   segment: "bulkrequest",
      //   title: "Bulk POS Request",
      //   icon: <List />,
      // },
      {
        segment: "viewpos",
        title: "Explore POS",
        icon: <Explore />,
      },
      {
        segment: "relocate",
        title: "Relocate POS",
        icon: <TbStatusChange />,
      },
      {
        segment: "requeststatus",
        title: "Request Status",
        icon: <ChangeCircle />,
      },
    ],
  },
  {
    kind: "header",
    title: "Administrations",
    roles: ["superadmin", "admin"],
  },
  {
    segment: "atm",
    title: "ATM Administration",
    icon: <Atm />,
    roles: ["superadmin", "admin"],
    children: [
      {
        segment: "add",
        title: "Create ATM",
        icon: <Add />,
      },

      {
        segment: "manageterminal",
        title: "Manage ATM",
        icon: <ManageSearch />,
      },
      {
        segment: "relocatedterminal",
        title: "Relocated ATM",
        icon: <TbStatusChange />,
      },
      {
        segment: "viewports",
        title: "Manage Port",
        icon: <SettingsInputComponent />,
      },
      {
        segment: "viewbranch",
        title: "Branch Code",
        icon: <DescriptionIcon />,
      },

      {
        segment: "viewcommands",
        title: "Explore Commands",
        icon: <Bookmark />,
      },

      {
        segment: "command",
        title: "Create Commands",
        icon: <BookmarkAdd />,
      },
      {
        segment: "createbranch",
        title: "Create Branch",
        icon: <DescriptionIcon />,
      },
      {
        segment: "ports",
        title: "Create Port",
        icon: <GroupWork />,
      },
    ],
  },
  {
    segment: "pos",
    title: "POS Administration",
    icon: <PointOfSale />,
    roles: ["superadmin", "admin"],
    children: [
      {
        segment: "addpos",
        title: "Create POS",
        icon: <ControlPointDuplicate />,
      },
      {
        segment: "managepos",
        title: "Manage POS",
        icon: <Folder />,
      },
      {
        segment: "relocatedpos",
        title: "Relocated POS",
        icon: <MoveDown />,
      },
      {
        segment: "requests",
        title: "POS Requests",
        icon: <TrackChanges />,
      },
    ],
  },

  {
    segment: "administration",
    title: "System Administration",
    icon: <AdminPanelSettings />,
    roles: ["superadmin"],
    children: [
      {
        segment: "createuser",
        title: "Create User",
        icon: <PersonAdd />,
      },
      {
        segment: "manageuser",
        title: "Manage User",
        icon: <ManageAccounts />,
      },
      {
        segment: "viewfeedback",
        title: "Explore Feedback",
        icon: <Feedback />,
      },
      {
        segment: "viewbug",
        title: "Explore Bug",
        icon: <BugReport />,
      },
      {
        segment: "analytics",
        title: "Analytics",
        icon: <Analytics />,
      },
      {
        segment: "activitylog",
        title: "Activity Log",
        icon: <LocalActivity />,
      },
    ],
  },
  {
    kind: "divider",
    roles: ["superadmin"],
  },
  {
    kind: "header",
    title: "Manual",
    roles: ["superadmin", "admin", "posuser"],
  },
  {
    segment: "manual",
    title: "Manual",
    icon: <IntegrationInstructions />,
    roles: ["superadmin", "admin"],
    children: [
      {
        segment: "systemmanual",
        title: "System Manual",
        icon: <DescriptionIcon />,
      },
      {
        segment: "atmcreationmanual",
        title: "ATM Creation Manual",
        icon: <DescriptionIcon />,
      },

      {
        segment: "poscreationmanual",
        title: "POS Creation Manual",
        icon: <DescriptionIcon />,
      },

      {
        segment: "cbslinkmanual",
        title: "CBS Account Link Manual",
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: "usermanual",
    title: "User Manual",
    icon: <IntegrationInstructions />,
    roles: ["posuser"],
    children: [
      {
        segment: "merchantguide",
        title: "POS Merchant Guide",
        icon: <DescriptionIcon />,
      },
      {
        segment: "branchguide",
        title: "POS Merchant Manual",
        icon: <DescriptionIcon />,
      },
    ],
  },
  //   {
  //     segment: "integrations",
  //     title: "Integrations",
  //     icon: <LayersIcon />,
  //   },
];

const demoTheme = createTheme({
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

function DemoPageContent({ pathname }) {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();

  React.useEffect(() => {
    navigate(pathname);
  }, [pathname]);
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

function SideDashboard(props) {
  const navigate = useNavigate();
  const { window } = props;
  const { darkMode, toggleTheme } = useTheme();
  const { role, currentUser } = useAuthContext();

  // Filter navigation items based on roles
  const filteredNavigation = NAVIGATION.filter((item) => {
    if (item.roles) {
      return item.roles.includes(role);
    }
    // If no `roles` property, include the item by default
    return item.roles.includes("user");
  });

  const router = useDemoRouter("/home");
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
      theme={demoTheme}
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
