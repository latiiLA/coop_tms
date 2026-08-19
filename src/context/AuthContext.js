import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem("token");

      // No token = not authenticated
      if (!token) {
        setCurrentUser(null);
        setRole(null);
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);

        // Validate expiration
        if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
          throw new Error("Token expired");
        }

        // Build user from JWT
        const user = {
          id: decoded.user._id,
          role: decoded.user.role,
          status: decoded.user.status,
          username: decoded.user.username,
          firstName: decoded.user.firstName,
          fatherName: decoded.user.fatherName,
          permissions: decoded.permissions || [],
        };

        setCurrentUser(user);
        setRole(user.role);
        setPermissions(user.permissions);

        console.log("Authenticated user in auth context:", user);
        console.log("Role in auth context:", user.role);
        console.log("Status:", user.status);
        console.log("Permissions in auth context:", user.permissions);
      } catch (error) {
        console.error("Invalid or expired token:", error);

        localStorage.removeItem("token");

        setCurrentUser(null);
        setRole(null);
        setPermissions([]);

        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,

        role,
        setRole,

        permissions,
        setPermissions,

        setCurrentUser,

        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};