import React, { useState } from "react";
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
  IconButton,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";
import HomeLink from "../../components/HomeLink";
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
  LocalActivity,
  Home,
  Link,
  ListAlt,
  Archive,
  Analytics,
  Feedback,
  BugReport,
  ReportProblem,
  CurrencyExchange,
} from "@mui/icons-material";
import { useAuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openAdmin, setOpenAdmin] = useState(true);
  const [openReport, setOpenReport] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  //to change the color of the selected button
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  // Handler to set the active link
  const handleClick = (path) => {
    setActiveLink(path);
  };

  const { role, loading } = useAuthContext();

  if (!role) {
    return null;
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
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: "15%", // This should match the sidebar width in Layout
          flexShrink: 0,
          height: "100%",
          "& .MuiDrawer-paper": {
            width: "15%",
            height: "100%",
            boxSizing: "border-box",
            overflowY: "auto",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
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
                    {!isCollapsed && (
                      <ListItemText
                        primary={item.text}
                        sx={{ color: theme.palette.text.primary }}
                      />
                    )}
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
                      {
                        text: "General Report",
                        path: "/generalreport",
                        icon: (
                          <Summarize
                            sx={{ color: theme.palette.primary.main }}
                          />
                        ),
                      },
                      {
                        text: "Transaction",
                        path: "/transaction",
                        icon: (
                          <CurrencyExchange
                            sx={{ color: theme.palette.primary.main }}
                          />
                        ),
                      },
                      {
                        text: "Links",
                        path: "/links",
                        icon: (
                          <Link sx={{ color: theme.palette.primary.main }} />
                        ),
                      },

                      ...(role === "admin" || role === "superadmin"
                        ? [
                            {
                              text: "Analytics",
                              path: "/analytics",
                              icon: (
                                <Analytics
                                  sx={{ color: theme.palette.primary.main }}
                                />
                              ),
                            },
                          ]
                        : []),
                    ].map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() => navigate(subItem.path)}
                        >
                          <ListItemIcon>{subItem.icon}</ListItemIcon>
                          {!isCollapsed && (
                            <ListItemText
                              primary={subItem.text}
                              sx={{ color: theme.palette.text.primary }}
                            />
                          )}
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
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.text}
                      sx={{ color: theme.palette.text.primary }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            )
          )}

          {(role === "admin" || role === "superadmin") && (
            <React.Fragment key="Administration">
              <ListItem disablePadding>
                <ListItemButton onClick={handleAdminClick}>
                  <ListItemIcon>
                    <AdminPanelSettings
                      sx={{ color: theme.palette.primary.main }}
                    />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary="Administration"
                      sx={{ color: theme.palette.text.primary }}
                    />
                  )}
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
                      text: "Manage ATM",
                      path: "/manageterminal",
                      icon: (
                        <ManageSearch
                          sx={{ color: theme.palette.primary.main }}
                        />
                      ),
                    },
                    {
                      text: "Relocated ATM",
                      path: "/relocatedterminal",
                      icon: (
                        <Archive sx={{ color: theme.palette.primary.main }} />
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
                    {
                      text: "Branch Code",
                      path: "/viewbranch",
                      icon: (
                        <ListAlt sx={{ color: theme.palette.primary.main }} />
                      ),
                    },
                    {
                      text: "Feedback",
                      path: "/feedback",
                      icon: (
                        <Feedback sx={{ color: theme.palette.primary.main }} />
                      ),
                    },
                    ...(role === "superadmin"
                      ? [
                          {
                            text: "Explore Feedback",
                            path: "/viewfeedback",
                            icon: (
                              <ReportProblem
                                sx={{ color: theme.palette.primary.main }}
                              />
                            ),
                          },
                          {
                            text: "Explore Bug",
                            path: "/viewbug",
                            icon: (
                              <BugReport
                                sx={{ color: theme.palette.primary.main }}
                              />
                            ),
                          },
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
                  ].map((subItem) => (
                    <ListItem key={subItem.text} disablePadding>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => navigate(subItem.path)}
                      >
                        <ListItemIcon>{subItem.icon}</ListItemIcon>
                        {!isCollapsed && (
                          <ListItemText
                            primary={subItem.text}
                            sx={{ color: theme.palette.text.primary }}
                          />
                        )}
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
