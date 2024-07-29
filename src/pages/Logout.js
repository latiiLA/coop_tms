import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const Logout = () => {
  const navigate = useNavigate();
  const hasShownToast = useRef(false); // Use ref to track if the toast has been shown
  const { role, setRole } = useAuthContext();

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
        const response = await fetch("/logoutUser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        if (response.ok) {
          // Handle successful logout (e.g., clear user data, redirect)
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
  }, [navigate, role, setRole]);

  return null; // Return null since this component does not render anything
};

export default Logout;
