import React, { useState } from "react";
import {
  Drawer,
  Toolbar,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Collapse,
  Avatar,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import coop from "../../assets/coop.gif";
import {
  Dashboard,
  Atm,
  Assessment,
  AddBox,
  Summarize,
  AdminPanelSettings,
  Add,
  PersonAdd,
  Outlet,
  ManageSearch,
  ManageAccounts,
  SettingsInputComposite,
  SettingsApplications,
  Logout,
} from "@mui/icons-material";

const drawerWidth = "18%";

const Sidebar = () => {
  const theme = useTheme();
  console.log("theme value in sidebar ", theme);
  const navigate = useNavigate();
  const [openAdmin, setOpenAdmin] = useState(false);
  const handleAdminClick = () => {
    setOpenAdmin(!openAdmin);
  };

  const [openReport, setOpenReport] = useState(false);
  const handleReportClick = () => {
    setOpenReport(!openReport);
  };

  return (
    <Box>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          {/* <IconButton sx={{}} onClick={() => setOpenDrawer(!openDrawer)}>
            <MenuIcon />
          </IconButton> */}
          <Box>
            <Avatar
              src={coop}
              sx={{
                width: 100,
                borderRadius: 0,
                objectFit: "cover",
                marginY: "auto",
              }}
            />
          </Box>
          <Typography variant="h4">ATM</Typography>
        </Toolbar>
        <Divider />
        <List>
          {[
            { text: "Dashboard", path: "/dashboard", icon: <Dashboard /> },
            { text: "Explore ATM", path: "/view", icon: <Atm /> },
            // { text: "Edit ATM", path: "/edit" },
            // { text: "Manual", path: "/manual" },
            { text: "Reports", path: "/report", icon: <Assessment /> },
            {
              text: "Administration",
              path: "/administration",
              icon: <AdminPanelSettings />,
            },
            { text: "Logout", path: "/logout", icon: <Logout /> },
          ].map((item, index) =>
            item.text === "Administration" ? (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleAdminClick}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {openAdmin ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openAdmin} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {[
                      { text: "Create ATM", path: "/add", icon: <Add /> },
                      {
                        text: "Create User",
                        path: "/createuser",
                        icon: <PersonAdd />,
                      },
                      {
                        text: "Create Port",
                        path: "/ports",
                        icon: <Outlet />,
                      },
                      {
                        text: "Manage ATM",
                        path: "/manage_atm",
                        icon: <ManageSearch />,
                      },
                      {
                        text: "Manage User",
                        path: "/viewuser",
                        icon: <ManageAccounts />,
                      },
                      {
                        text: "Manage Port",
                        path: "/viewports",
                        icon: <SettingsInputComposite />,
                      },

                      // { text: "Add Commands", path: "/new_command" },
                      // { text: "View Commands", path: "/commands" },
                      {
                        text: "Settings",
                        path: "/settings",
                        icon: <SettingsApplications />,
                      },
                    ].map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => navigate(subItem.path)}
                        >
                          <ListItemIcon>{subItem.icon}</ListItemIcon>
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : item.text === "Reports" ? (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleReportClick}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {openReport ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openReport} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {[
                      {
                        text: "Terminal Report",
                        path: "/terminalreport",
                        icon: <AddBox />,
                      },
                      {
                        text: "General Terminal Report",
                        path: "/generalreport",
                        icon: <Summarize />,
                      },
                    ].map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => navigate(subItem.path)}
                        >
                          <ListItemIcon>{subItem.icon}</ListItemIcon>
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
        <Divider />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
