import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthUser, getAuthToken, logoutUser } from "../utils/auth";

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const authUser = getAuthUser();
    const token = getAuthToken();

    setUser(authUser);

    // Only redirect if user is not logged in AND trying to access a protected page
    const isAuthPage = location.pathname.startsWith("/admin/login");
    if (!authUser || !token) {
      if (!isAuthPage) {
        navigate("/admin/login", { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  const logout = () => {
    logoutUser();
  };

  return { user, logout };
};
