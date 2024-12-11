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
  styled,
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
  PointOfSale,
  AddCircle,
  Explore,
  AtmOutlined,
  QuestionMark,
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material";
import { useAuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { MdMoving, MdSend, MdFiberNew } from "react-icons/md";
import { TbStatusChange } from "react-icons/tb";

const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [openAdmin, setOpenAdmin] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openPOSAdmin, setOpenPOSAdmin] = useState(false);
  const [openATMAdmin, setOpenATMAdmin] = useState(false);
  const [openRequest, setRequest] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // to change the color of the selected button
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

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

  const handlePOSAdminClick = () => {
    setOpenPOSAdmin(!openPOSAdmin);
  };

  const handleATMAdminClick = () => {
    setOpenATMAdmin(!openATMAdmin);
  };
  const handleRequestClick = () => {
    setRequest(!openRequest);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  }));

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
        open={open}
        variant="persistent"
        anchor="left"
        sx={{
          width: open ? "240px" : "0px",
          transition: theme.transitions.create(["width"], {
            duration: theme.transitions.duration.enteringScreen,
          }),
          "& .MuiDrawer-paper": {
            width: open ? "240px" : "0px",
            overflowY: "auto",
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </DrawerHeader>
        <Toolbar>
          {/* <IconButton
            aria-label={open ? "close drawer" : "open drawer"}
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            edge="start"
            sx={{
              color: theme.palette.primary.main,
            }}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </IconButton> */}
          <HomeLink />
          <Typography
            variant="h4"
            sx={{ color: theme.palette.primary.main, ml: 2 }}
          >
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
            {
              text: "POS Dashboard",
              path: "/posdashboard",
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
                        text: "Links",
                        path: "/links",
                        icon: (
                          <Link sx={{ color: theme.palette.primary.main }} />
                        ),
                      },

                      ...(role === "superadmin"
                        ? [
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

          {(role === "user" || role === "superadmin") && (
            <React.Fragment key="request">
              <ListItem disablePadding>
                <ListItemButton onClick={handleRequestClick}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        color: theme.palette.primary.main,
                        fontSize: "20px",
                      }}
                    >
                      <MdSend />
                    </Box>
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary="Requests"
                      sx={{ color: theme.palette.text.primary }}
                    />
                  )}
                  {openRequest ? (
                    <ExpandLess sx={{ color: theme.palette.text.primary }} />
                  ) : (
                    <ExpandMore sx={{ color: theme.palette.text.primary }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={openRequest} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {[
                    {
                      text: "Explore POS",
                      path: "/managepos",
                      icon: (
                        <Explore sx={{ color: theme.palette.primary.main }} />
                      ),
                    },
                    {
                      text: "Request POS",
                      path: "/request",
                      icon: (
                        <Box
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: "20px",
                          }}
                        >
                          <MdFiberNew />
                        </Box>
                      ),
                    },
                    {
                      text: "Relocate POS",
                      path: "/relocate",
                      icon: (
                        <Box
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: "20px",
                          }}
                        >
                          <MdMoving />
                        </Box>
                      ),
                    },
                    {
                      text: "Request Status",
                      path: "/requeststatus",
                      icon: (
                        <Box
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: "20px",
                          }}
                        >
                          <TbStatusChange />
                        </Box>
                      ),
                    },
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

          {(role === "admin" || role === "superadmin") && (
            <React.Fragment key="posadministration">
              <ListItem disablePadding>
                <ListItemButton onClick={handlePOSAdminClick}>
                  <ListItemIcon>
                    <PointOfSale sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary="POS Admin"
                      sx={{ color: theme.palette.text.primary }}
                    />
                  )}
                  {openPOSAdmin ? (
                    <ExpandLess sx={{ color: theme.palette.text.primary }} />
                  ) : (
                    <ExpandMore sx={{ color: theme.palette.text.primary }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={openPOSAdmin} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {[
                    {
                      text: "Create POS",
                      path: "/addpos",
                      icon: (
                        <AddCircle sx={{ color: theme.palette.primary.main }} />
                      ),
                    },
                    {
                      text: "Manage POS",
                      path: "/managepos",
                      icon: (
                        <Explore sx={{ color: theme.palette.primary.main }} />
                      ),
                    },
                    {
                      text: "Relocated POS",
                      path: "/relocatedpos",
                      icon: (
                        <Box
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: "20px",
                          }}
                        >
                          <MdMoving />
                        </Box>
                      ),
                    },
                    {
                      text: "POS Requests",
                      path: "/viewrequests",
                      icon: (
                        <Box
                          sx={{
                            color: theme.palette.primary.main,
                            fontSize: "20px",
                          }}
                        >
                          <TbStatusChange />
                        </Box>
                      ),
                    },
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
          {(role === "admin" || role === "superadmin") && (
            <React.Fragment key="atmadministration">
              <ListItem disablePadding>
                <ListItemButton onClick={handleATMAdminClick}>
                  <ListItemIcon>
                    <AtmOutlined sx={{ color: theme.palette.primary.main }} />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary="ATM Admin"
                      sx={{ color: theme.palette.text.primary }}
                    />
                  )}
                  {openATMAdmin ? (
                    <ExpandLess sx={{ color: theme.palette.text.primary }} />
                  ) : (
                    <ExpandMore sx={{ color: theme.palette.text.primary }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={openATMAdmin} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {[
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
                      text: "Create ATM",
                      path: "/add",
                      icon: <Add sx={{ color: theme.palette.primary.main }} />,
                    },
                    {
                      text: "Create Port",
                      path: "/ports",
                      icon: (
                        <Outlet sx={{ color: theme.palette.primary.main }} />
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
                      text: "Manage User",
                      path: "/viewuser",
                      icon: (
                        <ManageAccounts
                          sx={{ color: theme.palette.primary.main }}
                        />
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
