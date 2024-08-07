import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import Layout from "./Layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ViewATM from "./pages/administration/ViewATM";
import Report from "./pages/Reports/GeneralTerminalReport";
import TerminalReport from "./pages/Reports/TerminalReport";
import GeneralTerminalReport from "./pages/Reports/GeneralTerminalReport";
import Account from "./pages/account/Account";
import UserProfile from "./pages/account/UserProfile";
import ViewATMDetail from "./components/ViewATMDetail";
import AddATM from "./pages/administration/AddATM";
import EditATM from "./pages/administration/EditATM";
import CreateUser from "./pages/administration/CreateUser";
import Administration from "./pages/administration/Administration";
import ViewUsers from "./pages/administration/ViewUsers";
import ManageAtm from "./pages/administration/ManageAtm";
import CreateCommands from "./pages/administration/CreateCommands";
import ViewCommands from "./pages/administration/ViewCommands";
import ForgotPassword from "./components/ForgotPassword";
import Port from "./pages/administration/Port";
import ViewPort from "./pages/administration/ViewPort";
import Logout from "./pages/Logout";
import { Box } from "@mui/material";
import { Toaster } from "react-hot-toast";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const { role, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <Box>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          {/* Routes for All Users */}
          {role === "user" ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/view" element={<ViewATM />} />
              <Route path="/report" element={<Report />} />
              <Route path="/terminalreport" element={<TerminalReport />} />
              <Route
                path="/generalreport"
                element={<GeneralTerminalReport />}
              />
              <Route path="/account" element={<Account />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/viewdetail" element={<ViewATMDetail />} />

              <Route path="/logout" element={<Logout />} />
            </>
          ) : (
            <Route path="/" element={<Navigate to="/home" />} />
          )}
          {/* Admin Routes */}
          {role === "admin" && (
            <>
              <Route path="/add" element={<AddATM />} />
              <Route path="/edit" element={<EditATM />} />
              <Route path="/createuser" element={<CreateUser />} />
              <Route path="/administration" element={<Administration />} />
              <Route path="/viewuser" element={<ViewUsers />} />
              <Route path="/manage_atm" element={<ManageAtm />} />
              <Route path="/ports" element={<Port />} />
              <Route path="/viewports" element={<ViewPort />} />
              <Route path="/new_command" element={<CreateCommands />} />
              <Route path="/commands" element={<ViewCommands />} />
            </>
          )}
          {/* Catch-All Route */}
          {/* <Route
            path="*"
            element={<Navigate to={role ? "/home" : "/login"} />}
          /> */}
        </Routes>
        <Toaster />
      </Box>
    </Layout>
  );
}

export default App;
