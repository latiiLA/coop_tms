import React, { Suspense, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  Router,
} from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import { Box } from "@mui/material";
import { Toaster } from "react-hot-toast";
import SideDashboard from "./pages/sidebar/SideDashboard";
import Login from "./pages/Login";
import Home from "./pages/Home";

const ViewDeactivatedCybersourceTerminal = React.lazy(() => import("./pages/cybersource/ViewDeactivatedCybersourceTerminal"));
const EditCybersourceTerminal = React.lazy(() => import("./pages/cybersource/EditCybersourceTerminal"));
const CybersourceTerminalDetail = React.lazy(() => import("./pages/cybersource/CybersourceTerminalDetail"));
const ViewCybersourceTerminal = React.lazy(() => import("./pages/cybersource/ViewCybersourceTerminal"));
const CreateCybersourceTerminal = React.lazy(() => import("./pages/cybersource/CreateCybersourceTerminal"));

const CreatePasswordEntry = React.lazy(() => import("./pages/administration/CreatePasswordEntry"))
const EditPasswordEntry =  React.lazy(() => import("./pages/administration/EditPasswordEntry"))
const PasswordVault = React.lazy(() => import("./pages/administration/PasswordVault"));
const PasswordEntryDetails = React.lazy(() => import("./pages/administration/PasswordEntryDetails"))
const POSReports = React.lazy(
  () => import("./pages/POS/POSReports/POSReports")
);
const SendRequests = React.lazy(
  () => import("./pages/POS/requests/SendRequests")
);
const Settings = React.lazy(() => import("./pages/account/Settings"));
const AllPOSUserManual = React.lazy(
  () => import("./pages/Manual/AllPOSUserManual")
);
// const SideDashboard = React.lazy(() => import("./pages/sidebar/SideDashboard"));
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));
const ViewTerminal = React.lazy(
  () => import("./pages/administration/ViewTerminal")
);
const Report = React.lazy(
  () => import("./pages/Reports/GeneralTerminalReport")
);
const TerminalReport = React.lazy(
  () => import("./pages/Reports/TerminalReport")
);
const GeneralTerminalReport = React.lazy(
  () => import("./pages/Reports/GeneralTerminalReport")
);
const Account = React.lazy(() => import("./pages/account/Account"));
const UserProfile = React.lazy(() => import("./pages/account/UserProfile"));
const ViewATMDetail = React.lazy(() => import("./components/ViewATMDetail"));
const AddTerminal = React.lazy(
  () => import("./pages/administration/AddTerminal")
);
const EditTerminal = React.lazy(
  () => import("./pages/administration/EditTerminal")
);
const CreateUser = React.lazy(
  () => import("./pages/administration/CreateUser")
);
const Administration = React.lazy(
  () => import("./pages/administration/Administration")
);
const ViewUsers = React.lazy(() => import("./pages/administration/ViewUsers"));
const ManageTerminal = React.lazy(
  () => import("./pages/administration/ManageTerminal")
);
const CreateCommands = React.lazy(
  () => import("./pages/administration/CreateCommands")
);
const ViewCommands = React.lazy(
  () => import("./pages/administration/ViewCommands")
);
const ForgotPassword = React.lazy(() => import("./components/ForgotPassword"));
const Port = React.lazy(() => import("./pages/administration/Port"));
const ViewPort = React.lazy(() => import("./pages/administration/ViewPort"));
const Logout = React.lazy(() => import("./pages/Logout"));
const UserActivityLog = React.lazy(
  () => import("./pages/administration/UserActivityLog")
);
const ViewRelocated = React.lazy(
  () => import("./pages/administration/ViewRelocated")
);
const CreateDistrict = React.lazy(() => import("./components/CreateDistrict"));
const CreateBranch = React.lazy(() => import("./components/CreateBranch"));
const ViewBranch = React.lazy(() => import("./components/ViewBranch"));
const ViewDistrict = React.lazy(() => import("./components/ViewDistrict"));
const Analytics = React.lazy(() => import("./pages/dashboard/Analytics"));
const Feedback = React.lazy(() => import("./components/Feedback"));
const ViewFeedback = React.lazy(() => import("./components/ViewFeedback"));
const ViewBugs = React.lazy(() => import("./components/ViewBugs"));
const Transaction = React.lazy(() => import("./pages/Reports/Transaction"));
const ViewTransaction = React.lazy(
  () => import("./pages/Reports/ViewTransaction")
);
const Links = React.lazy(() => import("./pages/Reports/Links"));
const AddPOS = React.lazy(() => import("./pages/POS/AddPOS"));
const ManagePOS = React.lazy(() => import("./pages/POS/ManagePOS"));
const POSDetails = React.lazy(() => import("./pages/POS/POSDetails"));
const EditPOS = React.lazy(() => import("./pages/POS/EditPOS"));
const RequestPOS = React.lazy(() => import("./pages/POS/requests/RequestPOS"));
const RelocationRequests = React.lazy(
  () => import("./pages/POS/RelocationRequests")
);
const RelocatedPOS = React.lazy(() => import("./pages/POS/RelocatedPOS"));
const ViewDevices = React.lazy(() => import("./pages/POS/ViewDevices"));
const RelocatedRequest = React.lazy(
  () => import("./pages/POS/requests/RelocationRequest")
);
const ViewPOSRequests = React.lazy(() => import("./pages/POS/ViewPOSRequests"));
const RequestStatus = React.lazy(
  () => import("./pages/POS/requests/RequestStatus")
);
const RejectedRequests = React.lazy(
  () => import("./pages/POS/requests/RejectedRequests")
);
const DeletedRequests = React.lazy(
  () => import("./pages/POS/requests/DeletedRequests")
);
const AuthorizedRequests = React.lazy(
  () => import("./pages/POS/requests/AuthorizedRequests")
);
const ApprovePOSRequest = React.lazy(
  () => import("./pages/POS/ApprovePOSRequest")
);
const EditRequests = React.lazy(
  () => import("./pages/POS/requests/EditRequests")
);
const Posdashboard = React.lazy(
  () => import("./pages/dashboard/posdashboard/Posdashboard")
);

const TerminalCreationManual = React.lazy(
  () => import("./pages/Manual/TerminalCreationManual")
);
const POSMerchantGuide = React.lazy(
  () => import("./pages/Manual/POSMerchantGuide")
);
const POSBranchGuide = React.lazy(
  () => import("./pages/Manual/POSBranchGuide")
);
const AccountLinkManual = React.lazy(
  () => import("./pages/Manual/AccountLinkManual")
);
const ATMLocation = React.lazy(
  () => import("./pages/administration/ATMLocation")
);
const ATMAdministration = React.lazy(
  () => import("./pages/administration/ATMAdministration")
);
const POSAdministration = React.lazy(
  () => import("./pages/administration/POSAdministration")
);
const POSRequestAdministration = React.lazy(
  () => import("./pages/POS/requests/POSRequestAdministration")
);
const BulkRequest = React.lazy(
  () => import("./pages/POS/requests/BulkRequest")
);

const MASConfig = React.lazy(() => import("./pages/POS/MASConfig/MASConfig"));

const hasPermission = (permissions, permission) => {
  return permissions?.includes(permission);
};

// Protect routes based on role
const ProtectedRoute = ({ permission, children }) => {
  const { permissions, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!permissions) {
    console.log("❌ No permission:", permission);
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permissions, permission)) {
    console.log("❌ Permission denied:", permission);
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Protected Login Route
const ProtectedLogin = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!user) return;

    // New user must change password
    if (user.status === "New") {
      navigate("/changepassword", { replace: true });
      return;
    }

    // Existing user
    navigate("/home", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // If already logged in, don't render Login while redirecting
  if (user) {
    return <LoadingSpinner />;
  }

  return <Login />;
};

const AuthenticatedRoute = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.status === "New") {
    return <Navigate to="/changepassword" replace />;
  }

  return <Outlet />;
};

const PasswordChangeRoute = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <ForgotPassword/>;
};

function App() {
  const { role, permissions, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* <Layout> */}
      <Routes>
        {/* Public Routes */}

        <Route path="/login" element={<ProtectedLogin />} />
        <Route path="/changepassword" element={<PasswordChangeRoute />} />

        {/* Protected Routes */}
        <Route element={<AuthenticatedRoute />}>
          <Route element={<SideDashboard />}>
            <Route
              path="/home"
              element={<Home />}
            />

            {/* Terminal related */}
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />        
            <Route
              path="/atm"
              element={
                <ProtectedRoute permission="atm">  
                  <Suspense fallback={<LoadingSpinner />}>
                    <ATMAdministration />
                  </Suspense>
                </ProtectedRoute>  
              }
            />
            <Route
              path="/atm/manageterminal"
              element={
                <ProtectedRoute permission="view_terminal">  
                  <Suspense fallback={<LoadingSpinner />}>
                    <ManageTerminal />
                  </Suspense>
              </ProtectedRoute>
              }
            />
            <Route
              path="/atm/add"
              element={
                <ProtectedRoute permission="create_terminal">
                  <Suspense fallback={<LoadingSpinner />}>
                    <AddTerminal />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/atm/relocatedterminal"
              element={
                <ProtectedRoute permission="view_relocated_terminal">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewRelocated />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit"
              element={
                <ProtectedRoute permission="edit_terminal">
                  <Suspense fallback={<LoadingSpinner />}>
                    <EditTerminal />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewdetail"
              element={
                <ProtectedRoute permission="view_terminal_detail">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewATMDetail />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Port relocated */}
            <Route
              path="/atm/ports"
              element={
                <ProtectedRoute permission="create_port">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Port />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/atm/viewports"
              element={
                <ProtectedRoute permission="view_port">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewPort />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Branch related */}
            <Route
              path="/atm/addbranch"
              element={
                <ProtectedRoute permission="create_branch">
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateBranch />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/atm/viewbranch"
              element={
                <ProtectedRoute permission="view_branch">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewBranch />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* District related */}
            <Route
              path="/atm/adddistrict"
              element={
                <ProtectedRoute permission="create_district">
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateDistrict />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/atm/viewdistrict"
              element={
                <ProtectedRoute permission="view_district">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewDistrict />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Command related */}
            <Route
              path="/atm/command"
              element={
                <ProtectedRoute permission="create_command">
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateCommands />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/atm/viewcommands"
              element={
                <ProtectedRoute permission="view_command">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewCommands />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* User related */}
             <Route
              path="/administration"
              element={
                <ProtectedRoute permission="administration">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Administration />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/administration/createuser"
              element={
                <ProtectedRoute permission="create_user">
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateUser />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/administration/manageuser"
              element={
                <ProtectedRoute permission="manage_user">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewUsers />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/administration/analytics"
              element={
                <ProtectedRoute permission="analytics">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Analytics />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/administration/activitylog"
              element={
                <ProtectedRoute permission="activity_log">
                  <Suspense fallback={<LoadingSpinner />}>
                    <UserActivityLog />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/administration/viewfeedback"
              element={
                <ProtectedRoute permission="view_feedback">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewFeedback />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/administration/viewbug"
              element={
                <ProtectedRoute permission="view_bug">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewBugs />
                  </Suspense>
                </ProtectedRoute>
              }
            />





            {/* Setting*/}
            {/* account -- depriciated feature  */}
            <Route
              path="/account"
              element={
                <ProtectedRoute permission="account">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Account />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
                path="settings"
                element={
                  <ProtectedRoute permission="settings">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Settings />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings/profile"
                element={
                  <ProtectedRoute permission="user_profile">
                    <Suspense fallback={<LoadingSpinner />}>
                      <UserProfile />
                    </Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/changepassword"
                element={
                  <ProtectedRoute permission="forgot_password">
                    <ForgotPassword />
                  </ProtectedRoute>
              }
              />
              <Route
                path="/logout"
                element={
                  <ProtectedRoute permission="logout">
                    <Suspense fallback={<LoadingSpinner />}>
                      <Logout />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

            {/* Report related */}
            <Route
              path="/reports"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Report />
                </Suspense>
              }
            />
            <Route
              path="/reports/posreports"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <POSReports />
                </Suspense>
              }
            />
            <Route
              path="/terminalreport"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TerminalReport />
                </Suspense>
              }
            />
            <Route
              path="/reports/generalreport"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <GeneralTerminalReport />
                </Suspense>
              }
            />

            {/* POS related */}
            <Route
              path="/posdashboard"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Posdashboard />
                </Suspense>
              }
            />
            <Route
            path="/pos/managepos"
            element={
              <ProtectedRoute permission="view_pos">
                <Suspense fallback={<LoadingSpinner />}>
                  <ManagePOS />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute permission="pos">
                <Suspense fallback={<LoadingSpinner />}>
                  <POSAdministration />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos/addpos"
            element={
              <ProtectedRoute permission="create_pos">
                <Suspense fallback={<LoadingSpinner />}>
                  <AddPOS />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos/relocatedpos"
            element={
              <ProtectedRoute permission="view_relocated_pos">
                <Suspense fallback={<LoadingSpinner />}>
                  <RelocatedPOS />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos/masconfig"
            element={
              <ProtectedRoute permission="mas_config">
                <Suspense fallback={<LoadingSpinner />}>
                  <MASConfig />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos/devices"
            element={
              <ProtectedRoute permission="view_device">
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewDevices />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editpos"
            element={
              <ProtectedRoute permission="edit_pos">
                <Suspense fallback={<LoadingSpinner />}>
                  <EditPOS />
                </Suspense>
              </ProtectedRoute>
            }
          />
           <Route
              path="/posdetail"
              element={
                <ProtectedRoute permission="view_pos_detail">
                  <Suspense fallback={<LoadingSpinner />}>
                    <POSDetails />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos/relocationrequests"
              element={
                <ProtectedRoute permission="view_relocation_request">
                  <Suspense fallback={<LoadingSpinner />}>
                    <RelocationRequests />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* POS request related */}
            <Route
            path="/approverequest"
            element={
              <ProtectedRoute permission="approve_pos">
                <Suspense fallback={<LoadingSpinner />}>
                  <ApprovePOSRequest />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/requests"
            element={
              <ProtectedRoute permission="view_new_pos_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewPOSRequests />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/authorizedrequests"
            element={
              <ProtectedRoute permission="view_authorized_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <AuthorizedRequests />
                </Suspense>
              </ProtectedRoute>
            }
          /> 
          <Route
            path="/request/requeststatus"
            element={
              <ProtectedRoute permission="view_request_status">
                <Suspense fallback={<LoadingSpinner />}>
                  <RequestStatus />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/relocationrequests"
            element={
              <ProtectedRoute permission="view_relocation_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <RelocationRequests />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/request"
            element={
              <ProtectedRoute permission="request">
                <Suspense fallback={<LoadingSpinner />}>
                  <POSRequestAdministration />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editrequest"
            element={
              <ProtectedRoute permission="edit_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <EditRequests />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/request"
            element={
              <ProtectedRoute permission="request_pos">
                <Suspense fallback={<LoadingSpinner />}>
                  <RequestPOS />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/sendrequests"
            element={
              <ProtectedRoute permission="send_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <SendRequests />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/rejectedrequests"
            element={
              <ProtectedRoute permission="view_rejected_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <RejectedRequests />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/deletedrequests"
            element={
              <ProtectedRoute permission="view_deleted_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <DeletedRequests />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/request/bulkrequest"
            element={
              <ProtectedRoute permission="bulk_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <BulkRequest />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/relocate"
            element={
              <ProtectedRoute permission="view_relocation_request">
                <Suspense fallback={<LoadingSpinner />}>
                  <RelocatedRequest />
                </Suspense>
              </ProtectedRoute>
            }
          />
            
          {/* No permission needed */}
          <Route
              path="/links"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Links />
                </Suspense>
              }
            />
            <Route
              path="/transaction"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Transaction />
                </Suspense>
              }
            />
            <Route
              path="/viewtransaction"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewTransaction />
                </Suspense>
              }
            />
            <Route
              path="/atm/atmlocation"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ATMLocation />
                </Suspense>
              }
            />


            {/* Cybersource related */}
            <Route
              path="/cybersource/create"
              element={
                <ProtectedRoute permission="create_cybersource_terminal">
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreateCybersourceTerminal />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cybersource/view"
              element={
                <ProtectedRoute permission="view_cybersource_terminal">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewCybersourceTerminal />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cybersource/detail"
              element={
                <ProtectedRoute permission="view_cybersource_terminal">
                  <Suspense fallback={<LoadingSpinner />}>
                    <CybersourceTerminalDetail />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cybersource/edit"
              element={
                <ProtectedRoute permission="edit_cybersource_terminal">
                  <Suspense fallback={<LoadingSpinner />}>
                    <EditCybersourceTerminal />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/cybersource/deactivated"
              element={
                <ProtectedRoute permission="view_deactivated_cybersource_terminal">
                  <Suspense fallback={<LoadingSpinner />}>
                    <ViewDeactivatedCybersourceTerminal />
                  </Suspense>
                </ProtectedRoute>
              }
            />


            {/* Manual related */}
            <Route
              path="/manual/atmcreationmanual"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TerminalCreationManual />
                </Suspense>
              }
            />
            <Route
              path="/manual/cbslinkmanual"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AccountLinkManual />
                </Suspense>
              }
            />
            <Route
              path="/usermanual"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AllPOSUserManual />
                </Suspense>
              }
            />
            <Route
              path="/usermanual/merchantguide"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <POSMerchantGuide />
                </Suspense>
              }
            />
            <Route
              path="/usermanual/branchguide"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <POSBranchGuide />
                </Suspense>
              }
            />


            {/* Password vault */}
            <Route
              path="/password/entry"
              element={
                <ProtectedRoute permission="create_password_entry">
                  <Suspense fallback={<LoadingSpinner />}>
                    <CreatePasswordEntry />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/password/edit"
              element={
                <ProtectedRoute permission="edit_password_entry">
                  <Suspense fallback={<LoadingSpinner />}>
                    <EditPasswordEntry />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/password/details"
              element={
                <ProtectedRoute permission="view_password_entry_detail">
                  <Suspense fallback={<LoadingSpinner />}>
                    <PasswordEntryDetails />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/password/vault"
              element={
                <ProtectedRoute permission="view_password_entry">
                  <Suspense fallback={<LoadingSpinner />}>
                    <PasswordVault />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Route>            

          {/* Catch-All Route */}
          <Route
            path="*"
            element={
                <Navigate to={role ? "/home" : "/login"} replace />
            }
          />
        </Route>
      </Routes>

      <Toaster />
      {/* </Layout> */}
      
    </Box>
    // </Suspense>
  );
}

export default App;
