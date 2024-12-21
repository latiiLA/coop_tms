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
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
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
const ViewBranch = React.lazy(() => import("./components/ViewBranch"));
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
const RelocatedPOS = React.lazy(() => import("./pages/POS/RelocatedPOS"));
const RelocatedRequest = React.lazy(
  () => import("./pages/POS/requests/RelocateRequest")
);
const ViewPOSRequests = React.lazy(() => import("./pages/POS/ViewPOSRequests"));
const RequestStatus = React.lazy(
  () => import("./pages/POS/requests/RequestStatus")
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
const SideDashboard = React.lazy(() => import("./pages/sidebar/SideDashboard"));
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
      role === "posuser" ||
      role === "user" ||
      role === "admin" ||
      role === "superadmin"
    ) {
      navigate("/home", { replace: true });
    } else if (
      role === "tempo_user" ||
      role === "tempo_posuser" ||
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
    <Suspense fallback={<LoadingSpinner />}>
      <Box>
        {/* <Layout> */}
        <Routes>
          {/* Public Routes */}

          <Route path="/login" element={<ProtectedLogin />} />
          <Route path="/changepassword" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route element={<SideDashboard router={Router} />}>
            <Route
              element={
                <ProtectedRoutes
                  requiredRole={["user", "posuser", "admin", "superadmin"]}
                />
              }
            >
              <Route path="/account" element={<Account />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/home" element={<Home />} />
            </Route>
            <Route
              element={
                <ProtectedRoutes
                  requiredRole={["user", "admin", "superadmin"]}
                />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/view" element={<ViewTerminal />} />
              <Route path="/reports" element={<Report />} />
              <Route path="/terminalreport" element={<TerminalReport />} />
              <Route
                path="/reports/generalreport"
                element={<GeneralTerminalReport />}
              />

              <Route path="/viewdetail" element={<ViewATMDetail />} />

              <Route path="/administration/feedback" element={<Feedback />} />
              <Route path="/links" element={<Links />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/viewtransaction" element={<ViewTransaction />} />

              {/* <Route path="/side" element={<Side />} /> */}
            </Route>

            {/* Admin Routes */}
            <Route
              element={
                <ProtectedRoutes requiredRole={["admin", "superadmin"]} />
              }
            >
              <Route path="/edit" element={<EditTerminal />} />
              <Route path="/atm" element={<ATMAdministration />} />
              <Route path="/atm/add" element={<AddTerminal />} />
              <Route path="/atm/manageterminal" element={<ManageTerminal />} />
              <Route path="/atm/ports" element={<Port />} />
              <Route path="/atm/viewports" element={<ViewPort />} />
              <Route path="/atm/command" element={<CreateCommands />} />
              <Route path="/atm/viewcommands" element={<ViewCommands />} />
              <Route
                path="/atm/relocatedterminal"
                element={<ViewRelocated />}
              />
              <Route path="/atm/viewbranch" element={<ViewBranch />} />
              <Route path="/atm/atmlocation" element={<ATMLocation />} />

              {/* POS ROUTES */}
              <Route path="/pos" element={<POSAdministration />} />
              <Route path="/pos/addpos" element={<AddPOS />} />
              <Route path="/pos/managepos" element={<ManagePOS />} />
              <Route path="/pos/relocatedpos" element={<RelocatedPOS />} />
              <Route path="/pos/requests" element={<ViewPOSRequests />} />
              <Route path="/approverequest" element={<ApprovePOSRequest />} />
              <Route path="/editpos" element={<EditPOS />} />

              <Route
                path="/manual/atmcreationmanual"
                element={<TerminalCreationManual />}
              />
            </Route>

            <Route
              element={
                <ProtectedRoutes
                  requiredRole={["posuser", "admin", "superadmin"]}
                />
              }
            >
              <Route path="/posdashboard" element={<Posdashboard />} />
              <Route path="/posdetail" element={<POSDetails />} />
              <Route
                path="/request/requeststatus"
                element={<RequestStatus />}
              />
              <Route path="/request/viewpos" element={<ManagePOS />} />
            </Route>

            {/* Super Admin Routes */}
            <Route element={<ProtectedRoutes requiredRole={["superadmin"]} />}>
              <Route path="/administration" element={<Administration />} />
              <Route
                path="/administration/manageuser"
                element={<ViewUsers />}
              />
              <Route path="/administration/analytics" element={<Analytics />} />
              <Route
                path="/administration/createuser"
                element={<CreateUser />}
              />
              <Route
                path="/administration/activitylog"
                element={<UserActivityLog />}
              />
              <Route
                path="/administration/viewfeedback"
                element={<ViewFeedback />}
              />
              <Route path="/administration/viewbug" element={<ViewBugs />} />
            </Route>

            {/* POS user Routes */}
            <Route element={<ProtectedRoutes requiredRole={["posuser"]} />}>
              <Route path="/request" element={<POSRequestAdministration />} />
              <Route path="/editrequest" element={<EditRequests />} />
              <Route path="/request/request" element={<RequestPOS />} />
              <Route path="/request/bulkrequest" element={<BulkRequest />} />
              <Route path="/request/relocate" element={<RelocatedRequest />} />
              <Route
                path="/usermanual/merchantguide"
                element={<POSMerchantGuide />}
              />
              <Route
                path="/usermanual/branchguide"
                element={<POSBranchGuide />}
              />
            </Route>

            {/* Catch-All Route */}
            <Route
              path="*"
              element={
                role === "tempo_user" ||
                role === "tempo_user" ||
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
    </Suspense>
  );
}

export default App;
