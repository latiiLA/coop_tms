import React, { useEffect, useState } from "react";
import {
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link, useNavigate } from "react-router-dom";
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
  Home,
  LocalActivity,
} from "@mui/icons-material";
import { useAuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import HomeLink from "../../components/HomeLink";

const drawerWidth = "18%";

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openAdmin, setOpenAdmin] = useState(true);
  const [openReport, setOpenReport] = useState(true);
  const { role, loading } = useAuthContext();

  useEffect(() => {
    console.log("Role updated:", role);
  }, [role]);

  if (!role) {
    return null; // Hide the sidebar if no role is present
  }

  const handleAdminClick = () => {
    setOpenAdmin(!openAdmin);
  };

  const handleReportClick = () => {
    setOpenReport(!openReport);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: theme.palette.background.paper, // Adapt to theme
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <HomeLink />
          <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
            TMS
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {[
            {
              text: "Home",
              path: "/home",
              icon: <Home sx={{ color: theme.palette.primary.main }} />,
            },
            {
              text: "Dashboard",
              path: "/dashboard",
              icon: <Dashboard sx={{ color: theme.palette.primary.main }} />,
            },
            ...(role === "user"
              ? [
                  {
                    text: "Explore ATM",
                    path: "/view",
                    icon: <Atm sx={{ color: theme.palette.primary.main }} />,
                  },
                ]
              : []),
            {
              text: "Reports",
              path: "/report",
              icon: <Assessment sx={{ color: theme.palette.primary.main }} />,
            },
          ].map((item, index) =>
            item.text === "Reports" ? (
              <React.Fragment key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleReportClick}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ color: theme.palette.text.primary }}
                    />
                    {openReport ? (
                      <ExpandLess sx={{ color: theme.palette.text.primary }} />
                    ) : (
                      <ExpandMore sx={{ color: theme.palette.text.primary }} />
                    )}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openReport} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {[
                      // {
                      //   text: "Terminal Report",
                      //   path: "/terminalreport",
                      //   icon: (
                      //     <AddBox sx={{ color: theme.palette.primary.main }} />
                      //   ),
                      // },
                      {
                        text: "General Report",
                        path: "/generalreport",
                        icon: (
                          <Summarize
                            sx={{ color: theme.palette.primary.main }}
                          />
                        ),
                      },
                    ].map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => navigate(subItem.path)}
                        >
                          <ListItemIcon>{subItem.icon}</ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            sx={{ color: theme.palette.text.primary }}
                          />
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
                  <ListItemText
                    primary={item.text}
                    sx={{ color: theme.palette.text.primary }}
                  />
                </ListItemButton>
              </ListItem>
            )
          )}

          {/* Render "Administration" section only if the role is "admin" */}
          {(role === "admin" || role === "superadmin") && (
            <React.Fragment key="Administration">
              <ListItem disablePadding>
                <ListItemButton onClick={handleAdminClick}>
                  <ListItemIcon>
                    <AdminPanelSettings
                      sx={{ color: theme.palette.primary.main }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Administration"
                    sx={{ color: theme.palette.text.primary }}
                  />
                  {openAdmin ? (
                    <ExpandLess sx={{ color: theme.palette.text.primary }} />
                  ) : (
                    <ExpandMore sx={{ color: theme.palette.text.primary }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={openAdmin} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {[
                    {
                      text: "Create ATM",
                      path: "/add",
                      icon: <Add sx={{ color: theme.palette.primary.main }} />,
                    },
                    ...(role === "superadmin"
                      ? [
                          {
                            text: "Create User",
                            path: "/createuser",
                            icon: (
                              <PersonAdd
                                sx={{ color: theme.palette.primary.main }}
                              />
                            ),
                          },
                        ]
                      : []),
                    {
                      text: "Create Port",
                      path: "/ports",
                      icon: (
                        <Outlet sx={{ color: theme.palette.primary.main }} />
                      ),
                    },
                    {
                      text: "Manage Terminal",
                      path: "/manageterminal",
                      icon: (
                        <ManageSearch
                          sx={{ color: theme.palette.primary.main }}
                        />
                      ),
                    },
                    {
                      text: "Manage User",
                      path: "/viewuser",
                      icon: (
                        <ManageAccounts
                          sx={{ color: theme.palette.primary.main }}
                        />
                      ),
                    },
                    {
                      text: "Manage Port",
                      path: "/viewports",
                      icon: (
                        <SettingsInputComposite
                          sx={{ color: theme.palette.primary.main }}
                        />
                      ),
                    },
                    ...(role === "superadmin"
                      ? [
                          {
                            text: "Activity Log",
                            path: "/activitylog",
                            icon: (
                              <LocalActivity
                                sx={{ color: theme.palette.primary.main }}
                              />
                            ),
                          },
                        ]
                      : []),
                    // {
                    //   text: "Settings",
                    //   path: "/settings",
                    //   icon: (
                    //     <SettingsApplications
                    //       sx={{ color: theme.palette.primary.main }}
                    //     />
                    //   ),
                    // },
                  ].map((subItem) => (
                    <ListItem key={subItem.text} disablePadding>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => navigate(subItem.path)}
                      >
                        <ListItemIcon>{subItem.icon}</ListItemIcon>
                        <ListItemText
                          primary={subItem.text}
                          sx={{ color: theme.palette.text.primary }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          )}
        </List>
        <Divider />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
