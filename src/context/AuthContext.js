import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const apiUrl = process.env.REACT_APP_API_URL;
          const response = await axios.get(`${apiUrl}/auth/getUserRole`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          });
          setCurrentUser(response.data.user);
          setRole(response.data.user.role);
        } catch (error) {
          setRole(null);
          setCurrentUser(null);
          navigate("/login", { replace: true });
        }
      } else {
        setRole(null);
        setCurrentUser(null);
        navigate("/login");
      }
      setLoading(false);
    };

    fetchRole();

    const handleStorageChange = () => {
      fetchRole();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ currentUser, role, setRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
