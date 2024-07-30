import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();
  const hasShownToast = useRef(false); // Use ref to track if the toast has been shown
  const { setRole } = useAuthContext();

  useEffect(() => {
    const handleLogout = async () => {
      // Get the token from local storage (or other storage mechanism)
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found");
        if (!hasShownToast.current) {
          toast.error(
            "Error: User is not authenticated or is already logged out."
          );
          hasShownToast.current = true;
        }
        setRole(null);
        navigate("/login");
        return;
      }

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.post(
          `${apiUrl}/auth/logoutUser`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          // Handle successful logout
          localStorage.removeItem("token"); // Example of clearing user data
          if (!hasShownToast.current) {
            // toast.success("Logout successful!");
            hasShownToast.current = true;
          }
          setRole(null);
          navigate("/login"); // Redirect to login page
        } else {
          // Handle error response
          console.error("Logout failed");
          toast.error("Logout failed");
        }
      } catch (error) {
        console.error("An error occurred during logout", error);
        toast.error("An error occurred during logout");
      }
    };

    handleLogout();
  }, [navigate, setRole]);

  return null; // Return null since this component does not render anything
};

export default Logout;
