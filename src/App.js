import { Route, Routes } from "react-router-dom";
import AddATM from "./pages/administration/AddATM";
import Home from "./pages/Home";
// import Sidebar from "./pages/sidebar/Sidebar";
import Dashboard from "./pages/dashboard/Dashboard";
import View from "./components/View";
import Layout from "./Layout/Layout";
import { ThemeProvider, useTheme } from "./context/ThemeProvider";
import DarkMode from "./DarkMode/DarkMode";
import { darkTheme, lightTheme } from "./context/Themes";
import Administration from "./pages/administration/Administraction";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Sidebar from "./pages/sidebar/Sidebar";
import Edit from "./components/Edit";
import CreateUser from "./pages/administration/CreateUser";
import ViewUsers from "./pages/administration/ViewUsers";
import ManageAtm from "./pages/administration/ManageAtm";
import CreateCommands from "./pages/administration/CreateCommands";
import ViewCommands from "./pages/administration/ViewCommands";
import ForgotPassword from "./components/ForgotPassword";
import Report from "./pages/Reports/GeneralTerminalReport";
import Port from "./pages/administration/Port";
import ViewPort from "./pages/administration/ViewPort";
import { Toaster } from "react-hot-toast";
import { Box } from "@mui/material";
import TerminalReport from "./pages/Reports/TerminalReport";
import GeneralTerminalReport from "./pages/Reports/GeneralTerminalReport";
import Account from "./pages/account/Account";
import UserProfile from "./pages/account/UserProfile";
import ViewATM from "./pages/administration/ViewATM";

function App() {
  return (
    <Box>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route exact path="/login" element={<Login />} />
          <Route path="/add" element={<AddATM />} />
          <Route path="/side" element={<Sidebar />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/view" element={<ViewATM />} />
          <Route path="/edit" element={<Edit />} />
          <Route path="/administration" element={<Administration />} />
          <Route path="/createuser" element={<CreateUser />} />
          <Route path="/viewuser" element={<ViewUsers />} />
          <Route path="/manage_atm" element={<ManageAtm />} />
          <Route path="/new_command" element={<CreateCommands />} />
          <Route path="/commands" element={<ViewCommands />} />
          <Route path="/setpassword" element={<ForgotPassword />} />
          <Route path="/report" element={<Report />} />
          <Route path="/ports" element={<Port />} />
          <Route path="/viewports" element={<ViewPort />} />
          <Route path="/terminalreport" element={<TerminalReport />} />
          <Route path="/generalreport" element={<GeneralTerminalReport />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </Layout>
      <Toaster />
    </Box>
  );
}

export default App;
