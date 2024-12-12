import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  Router,
} from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import Layout from "./Layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ViewTerminal from "./pages/administration/ViewTerminal";
import Report from "./pages/Reports/GeneralTerminalReport";
import TerminalReport from "./pages/Reports/TerminalReport";
import GeneralTerminalReport from "./pages/Reports/GeneralTerminalReport";
import Account from "./pages/account/Account";
import UserProfile from "./pages/account/UserProfile";
import ViewATMDetail from "./components/ViewATMDetail";
import AddTerminal from "./pages/administration/AddTerminal";
import EditTerminal from "./pages/administration/EditTerminal";
import CreateUser from "./pages/administration/CreateUser";
import Administration from "./pages/administration/Administration";
import ViewUsers from "./pages/administration/ViewUsers";
import ManageTerminal from "./pages/administration/ManageTerminal";
import CreateCommands from "./pages/administration/CreateCommands";
import ViewCommands from "./pages/administration/ViewCommands";
import ForgotPassword from "./components/ForgotPassword";
import Port from "./pages/administration/Port";
import ViewPort from "./pages/administration/ViewPort";
import Logout from "./pages/Logout";
import { Box } from "@mui/material";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/LoadingSpinner";
import UserActivityLog from "../src/pages/administration/UserActivityLog";
import ViewRelocated from "./pages/administration/ViewRelocated";
import ViewBranch from "./components/ViewBranch";
import Analytics from "./pages/dashboard/Analytics";
import Feedback from "./components/Feedback";
import ViewFeedback from "./components/ViewFeedback";
import ViewBugs from "./components/ViewBugs";
import Transaction from "./pages/Reports/Transaction";
import ViewTransaction from "./pages/Reports/ViewTransaction";
import Links from "./pages/Reports/Links";
import AddPOS from "./pages/POS/AddPOS";
import ManagePOS from "./pages/POS/ManagePOS";
import "./App.css";
import POSDetails from "./pages/POS/POSDetails";
import EditPOS from "./pages/POS/EditPOS";
import RequestPOS from "./pages/POS/requests/RequestPOS";
import RelocatedPOS from "./pages/POS/RelocatedPOS";
import RelocatedRequest from "./pages/POS/requests/RelocateRequest";
import ViewPOSRequests from "./pages/POS/ViewPOSRequests";
import RequestStatus from "./pages/POS/requests/RequestStatus";
import RequestDetails from "./pages/POS/requests/RequestDetails";
import ApprovePOSRequest from "./pages/POS/ApprovePOSRequest";
import EditRequests from "./pages/POS/requests/EditRequests";
import Posdashboard from "./pages/dashboard/posdashboard/Posdashboard.js";
import Side from "./pages/sidebar/Side.js";
import SideDashboard from "./pages/sidebar/SideDashboard.js";
import TerminalCreationManual from "./pages/Manual/TerminalCreationManual.js";
import POSMerchantGuide from "./pages/Manual/POSMerchantGuide.js";
import POSBranchGuide from "./pages/Manual/POSBranchGuide.js";
import ATMLocation from "./pages/administration/ATMLocation.js";
import ATMAdminitration from "./pages/administration/ATMAdministration.js";
import POSAdministration from "./pages/administration/POSAdministration.js";
import POSRequestAdministration from "./pages/POS/requests/POSRequestAdministration.js";
import BulkRequest from "./pages/POS/requests/BulkRequest.js";

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
              <ProtectedRoutes requiredRole={["user", "admin", "superadmin"]} />
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
            element={<ProtectedRoutes requiredRole={["admin", "superadmin"]} />}
          >
            <Route path="/edit" element={<EditTerminal />} />
            <Route path="/atm" element={<ATMAdminitration />} />
            <Route path="/atm/add" element={<AddTerminal />} />
            <Route path="/atm/manageterminal" element={<ManageTerminal />} />
            <Route path="/atm/ports" element={<Port />} />
            <Route path="/atm/viewports" element={<ViewPort />} />
            <Route path="/atm/command" element={<CreateCommands />} />
            <Route path="/atm/viewcommands" element={<ViewCommands />} />
            <Route path="/atm/relocatedterminal" element={<ViewRelocated />} />
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
            <Route path="/request/requeststatus" element={<RequestStatus />} />
            <Route path="/request/viewpos" element={<ManagePOS />} />
          </Route>

          {/* Super Admin Routes */}
          <Route element={<ProtectedRoutes requiredRole={["superadmin"]} />}>
            <Route path="/administration" element={<Administration />} />
            <Route path="/administration/manageuser" element={<ViewUsers />} />
            <Route path="/administration/analytics" element={<Analytics />} />
            <Route path="/administration/createuser" element={<CreateUser />} />
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
  );
}

export default App;
