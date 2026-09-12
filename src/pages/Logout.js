import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import { isDemoMode } from "../demo/demoApi";

const Logout = () => {
  const navigate = useNavigate();
  const hasShownToast = useRef(false);
  const { setRole, setPermissions, setCurrentUser } = useAuthContext();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const clearSession = () => {
      localStorage.removeItem("token");
      setRole(null);
      setPermissions([]);
      setCurrentUser(null);
    };

    const handleLogout = async () => {
      const receivedToken = localStorage.getItem("token");

      if (!receivedToken) {
        if (!hasShownToast.current && isMounted.current) {
          toast.error(
            "Error: User is not authenticated or is already logged out."
          );
          hasShownToast.current = true;
        }
        clearSession();
        if (isMounted.current) navigate("/login");
        return;
      }

      // Portfolio demo: no API — just clear local session
      if (isDemoMode()) {
        clearSession();
        if (!hasShownToast.current && isMounted.current) {
          toast.success("Logged out");
          hasShownToast.current = true;
        }
        if (isMounted.current) navigate("/login");
        return;
      }

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.post(
          `${apiUrl}/auth/logoutUser`,
          {},
          {
            headers: {
              Authorization: `Bearer ${receivedToken}`,
            },
            withCredentials: true,
          }
        );

        clearSession();

        if (response.status === 200) {
          if (isMounted.current) navigate("/login");
        } else {
          toast.error("Logout failed");
          if (isMounted.current) navigate("/login");
        }
      } catch (error) {
        // Still clear local session if API fails
        clearSession();
        toast.error("An error occurred during logout");
        if (isMounted.current) navigate("/login");
      }
    };

    handleLogout();
  }, [navigate, setRole, setPermissions, setCurrentUser]);

  return null;
};

export default Logout;
