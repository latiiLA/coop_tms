import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();
  const hasShownToast = useRef(false); // Track if the toast has been shown
  const { setRole, setPermission, setCurrentUser } = useAuthContext();
  const isMounted = useRef(true); // Track if the component is mounted

  // Cleanup function to set isMounted to false when the component is unmounted
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleLogout = async () => {
      const recieved_token = localStorage.getItem("token");
      localStorage.removeItem("token");

      if (!recieved_token) {
        if (!hasShownToast.current && isMounted.current) {
          toast.error(
            "Error: User is not authenticated or is already logged out."
          );
          hasShownToast.current = true;
        }
        setRole(null);
        setPermission(null)
        setCurrentUser(null)
        
        if (isMounted.current) {
          navigate("/login");
        }
        return;
      }

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.post(
          `${apiUrl}/auth/logoutUser`,
          {},
          {
            headers: {
              Authorization: `Bearer ${recieved_token}`,
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          localStorage.removeItem("token"); // Clear token from localStorage
          if (!hasShownToast.current && isMounted.current) {
            hasShownToast.current = true;
          }
          setRole(null);
          if (isMounted.current) {
            navigate("/login"); // Redirect to login page
          }
        } else {
          toast.error("Logout failed");
        }
      } catch (error) {
        toast.error("An error occurred during logout");
      }
    };

    handleLogout();
  }, [navigate, setRole, setPermission, setCurrentUser]);

  return null;
};

export default Logout;
