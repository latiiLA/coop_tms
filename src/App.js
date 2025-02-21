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

// Protect routes based on role
const ProtectedRoutes = ({ requiredRole }) => {
  const { role } = useAuthContext();

  if (role === null) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (
    role === "tempo_user" ||
    role === "tempo_posuser" ||
    role === "tempo_posauthorizer" ||
    role === "tempo_admin" ||
    role === "tempo_superadmin"
  ) {
    return <Navigate to="/changepassword" />;
  }

  if (requiredRole && !requiredRole.includes(role)) {
    // User doesn't have the required role
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

// Protected Login Route
const ProtectedLogin = () => {
  const { role } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      role === "user" ||
      role === "posuser" ||
      role === "posauthorizer" ||
      role === "admin" ||
      role === "superadmin"
    ) {
      navigate("/home", { replace: true });
    } else if (
      role === "tempo_user" ||
      role === "tempo_posuser" ||
      role === "tempo_posauthorizer" ||
      role === "tempo_admin" ||
      role === "tempo_superadmin"
    ) {
      navigate("/changepassword");
    }
  }, [role, navigate]);

  return <Login />;
};

function App() {
  const { role, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* <Layout> */}
      <Routes>
        {/* Public Routes */}

        <Route path="/login" element={<ProtectedLogin />} />
        <Route path="/changepassword" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route element={<SideDashboard router={Router} />}>
          <Route element={<ProtectedRoutes requiredRole={[]} />}></Route>
          <Route
            element={
              <ProtectedRoutes
                requiredRole={[
                  "user",
                  "posuser",
                  "posauthorizer",
                  "admin",
                  "superadmin",
                ]}
              />
            }
          >
            <Route
              path="/account"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Account />
                </Suspense>
              }
            />
            <Route
              path="posreports"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <POSReports />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              }
            />
            <Route
              path="settings/profile"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <UserProfile />
                </Suspense>
              }
            />
            <Route
              path="/settings/changepassword"
              element={<ForgotPassword />}
            />
            <Route
              path="/logout"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Logout />
                </Suspense>
              }
            />
            <Route path="/home" element={<Home />} />
            <Route
              path="/posdashboard"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Posdashboard />
                </Suspense>
              }
            />
          </Route>

          <Route
            element={
              <ProtectedRoutes requiredRole={["user", "admin", "superadmin"]} />
            }
          >
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/view"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewTerminal />
                </Suspense>
              }
            />
            <Route
              path="relocatedterminal"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewRelocated />
                </Suspense>
              }
            />
            <Route
              path="/explorepos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManagePOS />
                </Suspense>
              }
            />
            <Route
              path="/reports"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Report />
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

            <Route
              path="/viewdetail"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewATMDetail />
                </Suspense>
              }
            />

            <Route
              path="/administration/feedback"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Feedback />
                </Suspense>
              }
            />
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

            {/* <Route path="/side" element={<Side />} /> */}
          </Route>

          {/* Admin Routes */}
          <Route
            element={<ProtectedRoutes requiredRole={["admin", "superadmin"]} />}
          >
            <Route
              path="/edit"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EditTerminal />
                </Suspense>
              }
            />
            <Route
              path="/atm"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ATMAdministration />
                </Suspense>
              }
            />
            <Route
              path="/atm/add"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AddTerminal />
                </Suspense>
              }
            />
            <Route
              path="/atm/ports"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Port />
                </Suspense>
              }
            />
            <Route
              path="/atm/viewports"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewPort />
                </Suspense>
              }
            />
            <Route
              path="/atm/command"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CreateCommands />
                </Suspense>
              }
            />
            <Route
              path="/atm/viewcommands"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewCommands />
                </Suspense>
              }
            />
            <Route
              path="/atm/manageterminal"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManageTerminal />
                </Suspense>
              }
            />
            <Route
              path="/atm/adddistrict"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CreateDistrict />
                </Suspense>
              }
            />
            <Route
              path="/atm/viewdistrict"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewDistrict />
                </Suspense>
              }
            />

            <Route
              path="/atm/addbranch"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CreateBranch />
                </Suspense>
              }
            />
            <Route
              path="/atm/relocatedterminal"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewRelocated />
                </Suspense>
              }
            />
            <Route
              path="/atm/viewbranch"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewBranch />
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
            {/* POS ROUTES */}
            <Route
              path="/pos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <POSAdministration />
                </Suspense>
              }
            />
            <Route
              path="/pos/addpos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AddPOS />
                </Suspense>
              }
            />
            <Route
              path="/pos/managepos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManagePOS />
                </Suspense>
              }
            />
            <Route
              path="/pos/relocatedpos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RelocatedPOS />
                </Suspense>
              }
            />

            <Route
              path="/pos/requests"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewPOSRequests />
                </Suspense>
              }
            />
            <Route
              path="/approverequest"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ApprovePOSRequest />
                </Suspense>
              }
            />
            <Route
              path="/pos/masconfig"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <MASConfig />
                </Suspense>
              }
            />
            <Route
              path="/pos/devices"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewDevices />
                </Suspense>
              }
            />
            <Route
              path="/editpos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EditPOS />
                </Suspense>
              }
            />
            <Route
              path="/manual/atmcreationmanual"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TerminalCreationManual />
                </Suspense>
              }
            />
          </Route>

          <Route
            element={
              <ProtectedRoutes
                requiredRole={[
                  "posuser",
                  "admin",
                  "superadmin",
                  "posauthorizer",
                ]}
              />
            }
          >
            <Route
              path="/posdetail"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <POSDetails />
                </Suspense>
              }
            />
            <Route
              path="/request/requeststatus"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RequestStatus />
                </Suspense>
              }
            />
            <Route
              path="/pos/authorizedrequests"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AuthorizedRequests />
                </Suspense>
              }
            />
            <Route
              path="/request/relocationrequests"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RelocationRequests />
                </Suspense>
              }
            />
            <Route
              path="/pos/relocationrequests"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RelocationRequests />
                </Suspense>
              }
            />
            <Route
              path="/request/viewpos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ManagePOS />
                </Suspense>
              }
            />
            <Route
              path="/request/relocatedpos"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RelocatedPOS />
                </Suspense>
              }
            />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<ProtectedRoutes requiredRole={["superadmin"]} />}>
            <Route
              path="/administration"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Administration />
                </Suspense>
              }
            />
            <Route
              path="/administration/manageuser"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewUsers />
                </Suspense>
              }
            />
            <Route
              path="/administration/analytics"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Analytics />
                </Suspense>
              }
            />
            <Route
              path="/administration/createuser"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CreateUser />
                </Suspense>
              }
            />
            <Route
              path="/administration/activitylog"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <UserActivityLog />
                </Suspense>
              }
            />
            <Route
              path="/administration/viewfeedback"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewFeedback />
                </Suspense>
              }
            />
            <Route
              path="/administration/viewbug"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ViewBugs />
                </Suspense>
              }
            />
          </Route>

          {/* POS user Routes */}
          <Route
            element={
              <ProtectedRoutes requiredRole={["posuser", "posauthorizer"]} />
            }
          >
            <Route
              path="/request"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <POSRequestAdministration />
                </Suspense>
              }
            />
            <Route
              path="/editrequest"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EditRequests />
                </Suspense>
              }
            />
            <Route
              path="/request/request"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RequestPOS />
                </Suspense>
              }
            />
            <Route
              path="/request/sendrequests"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SendRequests />
                </Suspense>
              }
            />
            <Route
              path="/request/rejectedrequests"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RejectedRequests />
                </Suspense>
              }
            />
            <Route
              path="/request/deletedrequests"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <DeletedRequests />
                </Suspense>
              }
            />

            <Route
              path="/request/bulkrequest"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <BulkRequest />
                </Suspense>
              }
            />
            <Route
              path="/request/relocate"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RelocatedRequest />
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
          </Route>

          {/* Catch-All Route */}
          <Route
            path="*"
            element={
              role === "tempo_user" ||
              role === "tempo_posuser" ||
              role === "tempo_posauthorizer" ||
              role === "tempo_admin" ||
              role === "tempo_superadmin" ? (
                <Navigate to="/changepassword" replace />
              ) : (
                <Navigate to={role ? "/home" : "/login"} replace />
              )
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
