import { useEffect, useRef } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import { isDemoMode } from "../demo/demoApi";

/** Don't hang the UI if Mongo/network stalls during logout. */
const LOGOUT_API_TIMEOUT_MS = 3000;

const Logout = () => {
  const navigate = useNavigate();
  const ran = useRef(false);
  const { setRole, setPermissions, setCurrentUser } = useAuthContext();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const clearLocalSession = () => {
      localStorage.removeItem("token");
      setRole(null);
      setPermissions([]);
      setCurrentUser(null);
    };

    const notifyServer = async (token) => {
      if (!token || isDemoMode()) return;
      const apiUrl = process.env.REACT_APP_API_URL;
      try {
        await axios.post(
          `${apiUrl}/auth/logoutUser`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            timeout: LOGOUT_API_TIMEOUT_MS,
          }
        );
      } catch {
        // Local session is already cleared; ignore network / timeout errors.
      }
    };

    const handleLogout = async () => {
      const token = localStorage.getItem("token");

      // Clear locally first so the UI never waits on a stalled backend.
      clearLocalSession();
      navigate("/login", { replace: true });

      // Best-effort cookie clear + audit log (bounded by timeout).
      void notifyServer(token);
    };

    handleLogout();
  }, [navigate, setRole, setPermissions, setCurrentUser]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        gap: 1.5,
        color: "text.secondary",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress size={28} />
      <Typography variant="body2">Signing out…</Typography>
    </Box>
  );
};

export default Logout;
