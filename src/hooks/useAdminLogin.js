import { useState } from "react";
import Swal from "sweetalert2";
import { setAuthUser, setAuthToken } from "../utils/auth";
import axiosInstance from "../utils/axiosInstance";

export const useAdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const showAlert = ({ title, text, icon }) => {
    Swal.fire(title, text, icon);
  };

  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.post("/auth/admin_login", { identifier, password });

      // Handle the success case first
      if (res.data.success === true) {
        const { access_token, userId, role, role_id, email, phone, first_name, last_name, type } = res.data.data;
        const userData = { userId, role, role_id, email, phone, first_name, last_name, type };

        setAuthUser(userData, role);
        setAuthToken(access_token, role);
        localStorage.setItem("role", role);
        localStorage.setItem("role_id", role_id);

        return { userData, role, role_id };
      }

      // Handle the failure case (success: false)
      const errorMessage = res.data.message || "Incorrect credentials";
      showAlert({ title: "Login Failed", text: errorMessage, icon: "error" });
      setError(errorMessage);
      return { error: errorMessage };
    } catch (err) {
      const backendError =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (Array.isArray(err?.response?.data?.non_field_errors) && err?.response?.data?.non_field_errors[0]) ||
        "Login failed";

      showAlert({ title: "Login Error", text: backendError, icon: "error" });
      setError(backendError);
      return { error: backendError };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

