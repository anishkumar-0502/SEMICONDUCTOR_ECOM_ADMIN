/**
=========================================================
* Soft UI Dashboard PRO React - v4.0.3
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-pro-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import SoftBox from "components/SoftBox";

// Layout wrapper
import BaseLayout from '../profile/components/BaseLayout';
// Settings page components
import Sidenav from 'layouts/ecommerce/profile/components/Sidenav'
import Header from "layouts/ecommerce/profile/components/Header";
import BasicInfo from "layouts/ecommerce/profile/components/BasicInfo";
import ChangePassword from "layouts/ecommerce/profile/components/ChangePassword";
// import LogoutSection from "layouts/ecommerce/profile/components/LogoutSection"; 
import LogoutSection from "./components/logout";
import FormField from "layouts/ecommerce/profile/components/FormField";

// Utils
import { getCurrentUser, setAuthUser } from "utils/auth";
import axiosInstance from "utils/axiosInstance";
import Swal from "sweetalert2";

function Settings() {
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    role_id: "",
  });
  const [initialUser, setInitialUser] = useState(user);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [initialPassword, setInitialPassword] = useState("");

  const currentUser = getCurrentUser();
  const userId = currentUser?.userId;

  // Fetch user data
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.post("/user/manage_users/getone", { userId });

        if (response.data.success) {
          const data = response.data.data;

          const userData = {
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            role: data.role || "",
            role_id: data.role_id || "",
          };

          setUser(userData);
          setInitialUser(userData);

          // Prefill password for change-password section (keeps existing behavior)
          setPassword(data.password || "");
          setInitialPassword(data.password || "");
        } else {
          // show backend message if present
          const msg = response.data.message || "Failed to fetch user";
          Swal.fire("Error", msg, "error");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        const msg = error?.response?.data?.message || "Failed to fetch user data.";
        Swal.fire("Error", msg, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Update user
  const handleUpdate = async () => {
    const hasChanges =
      user.first_name !== initialUser.first_name ||
      user.last_name !== initialUser.last_name ||
      user.phone !== initialUser.phone ||
      user.role !== initialUser.role ||
      password !== initialPassword;

    if (!hasChanges) {
      Swal.fire("Info", "No changes made.", "info");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        userId: currentUser.userId,
        modified_by: currentUser.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
      };
      if (password !== initialPassword) payload.password = password;

      const response = await axiosInstance.post("/user/manage_users/update", payload);

      if (response.data.success) {
        Swal.fire("Updated!", "Profile updated successfully.", "success");
        setAuthUser({ ...currentUser, ...user }, currentUser.role);
        setInitialUser({ ...user });
        setInitialPassword(password);
      } else {
        // Show backend validation message (supports comma-separated messages -> rendered as line breaks)
        const raw = response.data.message || "Something went wrong";
        const html = typeof raw === "string" ? raw.replace(/, /g, "<br/>") : String(raw);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          html,
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      // If server responded with a body (even on 4xx/5xx), show that message
      const serverMsg =
        error?.response?.data?.message ||
        // sometimes validation errors come in other fields; try common shapes
        error?.response?.data?.error ||
        (error?.response?.data && JSON.stringify(error.response.data)) ||
        error?.message ||
        "Update failed";
      const html = typeof serverMsg === "string" ? serverMsg.replace(/, /g, "<br/>") : String(serverMsg);
      Swal.fire({
        icon: "error",
        title: "Update Error",
        html,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <SoftBox mt={4}>
        <Grid container spacing={3}>
          {/* Left sidenav */}
          <Grid item xs={12} lg={3}>
            <Sidenav />
          </Grid>

          {/* Right content */}
          <Grid item xs={12} lg={9}>
            <SoftBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Header />
                </Grid>

                {/* Basic Info Section */}
                <Grid item xs={12}>
                  <BasicInfo
                    user={user}
                    setUser={setUser}
                    password={password}
                    setPassword={setPassword}
                    onUpdate={handleUpdate}
                    loading={loading}
                    initialUser={initialUser}
                    initialPassword={initialPassword}
                  />
                </Grid>

                {/* Change Password Section */}
                <Grid item xs={12}>
                 <ChangePassword
  password={password}
  setPassword={setPassword}
  initialPassword={initialPassword}
  onUpdate={handleUpdate}
  loading={loading}
  user={user}
  initialUser={initialUser}
/>

                  
                </Grid>

                {/* Logout Section */}
                <Grid item xs={12}>
                  <LogoutSection />  {/* ✅ now active */}
                </Grid>
              </Grid>
            </SoftBox>
          </Grid>
        </Grid>
      </SoftBox>
    </BaseLayout>
  );
}

export default Settings;
