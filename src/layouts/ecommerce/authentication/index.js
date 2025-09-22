import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";

// Icons
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import SoftButton from "components/SoftButton";

// Image
import curved9 from "assets/images/curved-images/curved9.jpg";

// SweetAlert
import Swal from "sweetalert2";

import axiosInstance from "utils/axiosInstance";

// Login hook
import { useAdminLogin } from "hooks/useAdminLogin";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loading } = useAdminLogin();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState(1); // Step 1 = email, Step 2 = password

  // Forgot password flow state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [otp, setOtp] = useState("");
  const [otpRef, setOtpRef] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [resendIn, setResendIn] = useState(0);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleEmailNext = (e) => {
    e.preventDefault();
    if (identifier.trim()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(identifier, password);

    if (result?.userData) {
      localStorage.setItem("user", JSON.stringify(result.userData));

      try {
        const { default: axiosInstance } = await import("../../../utils/axiosInstance");
        const response = await axiosInstance.get(`/user/permissions/${result.userData.role_id}`);
        const permissionsData = response.data;
        const { default: routes } = await import("../../../routes");

        let redirectPath = "/dashboards/Overview";

        if (permissionsData?.data && permissionsData.data.length > 0) {
          const permissions = permissionsData.data;

          const hasPermission = (module, subModule = null, action = "can_view") =>
            permissions.some(
              (p) =>
                p.module === module &&
                (subModule === null || p.sub_module === subModule) &&
                p[action] === true
            );

          const modulePriority = [
            "dashboard",
            "catalogue_management",
            "order_management",
            "user_management",
            "profile",
          ];

          const findAccessibleRoute = () => {
            if (hasPermission("dashboard", null, "can_view")) {
              return "/dashboards/Overview";
            }

            for (const module of modulePriority) {
              if (module === "dashboard") continue;

              const modulePermissions = permissions.filter(
                (p) => p.module === module && p.can_view
              );

              if (modulePermissions.length > 0) {
                const flattenRoutes = (routesArray) =>
                  routesArray.reduce((acc, route) => {
                    if (route.collapse) return [...acc, ...flattenRoutes(route.collapse)];
                    if (route.route && route.module) return [...acc, route];
                    return acc;
                  }, []);

                const allRoutes = flattenRoutes(routes);

                for (const perm of modulePermissions) {
                  const matchingRoute = allRoutes.find(
                    (r) => r.module === perm.module && r.subModule === perm.sub_module
                  );
                  if (matchingRoute) return matchingRoute.route;
                }
              }
            }
            return "/login";
          };

          redirectPath = findAccessibleRoute();
        }

        Swal.fire({
          icon: "success",
          title: "Welcome!",
          text: "You have successfully signed in.",
          showConfirmButton: true,
        }).then(() => navigate(redirectPath, { replace: true }));
      } catch (error) {
        Swal.fire({
          icon: "success",
          title: "Welcome!",
          text: "You have successfully signed in.",
          showConfirmButton: true,
        }).then(() => navigate("/dashboards/Overview", { replace: true }));
      }
    } else if (result?.error) {
      Swal.fire({ icon: "error", title: "Login Failed", text: result.error });
    }
  };

  // Forgot password handlers
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      return Swal.fire({ icon: "warning", title: "Email required", text: "Enter your email." });
    }
    try {
      setForgotLoading(true);
      const { data } = await axiosInstance.post("/auth/forgot_password", { email: identifier });
      if (data?.success) {
        setOtpRef(data.data?.otp_ref || "");
        setOtp("");
        setOtpExpiresIn(data.data?.expires_in_sec || 0);
        setResendIn(data.data?.resend_available_in_sec || 0);
        setForgotStep(2);
        Swal.fire({ icon: "success", title: "OTP sent", text: data.message || "Check your email." });
      } else {
        Swal.fire({ icon: "error", title: "Request failed", text: data?.message || "Try again." });
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleValidateOtp = async (e) => {
  e.preventDefault();
  if (!otp.trim() || !otpRef.trim()) {
    return Swal.fire({ icon: "warning", title: "OTP required" });
  }

  try {
    setForgotLoading(true);
    const { data } = await axiosInstance.post("/auth/validate_otp", {
      otp,
      otp_ref: otpRef,
    });

    if (data?.success) {
      setResetToken(data.data?.reset_token || "");
      setForgotStep(3);
      Swal.fire({ icon: "success", title: "OTP validated", text: "Set your new password." });
    } else {
      // server replied with success: false but 2xx status
      Swal.fire({ icon: "error", title: "Invalid OTP", text: data?.message || "Try again." });
    }
  } catch (error) {
    // server returned 400 -> axios throws, read message here
    const msg = error?.response?.data?.message || error?.message || "Invalid OTP";
    Swal.fire({ icon: "error", title: "Invalid OTP", text: msg });
  } finally {
    setForgotLoading(false);
  }
};

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      return Swal.fire({ icon: "warning", title: "Both fields required" });
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire({ icon: "warning", title: "Passwords do not match" });
    }
    try {
      setForgotLoading(true);
      const { data } = await axiosInstance.post(
        "/auth/set_new_password",
        { new_password: newPassword, confirm_password: confirmPassword },
        { headers: { Authorization: `Bearer ${resetToken}` } }
      );
      if (data?.success) {
        Swal.fire({ icon: "success", title: "Password updated", text: "You can log in now." });
        setForgotMode(false);
        setForgotStep(1);
        setOtp(""); setOtpRef(""); setResetToken(""); setNewPassword(""); setConfirmPassword("");
        setStep(2);
      } else {
        Swal.fire({ icon: "error", title: "Update failed", text: data?.message || "Try again." });
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // Countdown timers
  useEffect(() => {
    if (otpExpiresIn <= 0 && resendIn <= 0) return;
    const t = setInterval(() => {
      setOtpExpiresIn((s) => (s > 0 ? s - 1 : 0));
      setResendIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [otpExpiresIn, resendIn]);

  return (
    <SoftBox height="100vh" display="flex" justifyContent="center" alignItems="center" bgcolor="#f5f5f5">
      <Card sx={{ width: "85%", maxWidth: "1100px", borderRadius: "16px", overflow: "hidden", minHeight: "520px" }}>
        <Grid container sx={{ height: "100%" }}>
          {/* Left side */}
          <Grid item xs={12} md={6} sx={{
            backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
              `${linearGradient(rgba(gradients.dark.main, 0.7), rgba(gradients.dark.state, 0.7))}, url(${curved9})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
            color: "white", p: 4, height: "520px"
          }}>
            <SoftTypography variant="h3" fontWeight="bold" gutterBottom color="white">Welcome!</SoftTypography>
            <SoftTypography variant="body2" color="white">
              Please enter your email and password to sign in.
            </SoftTypography>
          </Grid>

          {/* Right side */}
          <Grid item xs={12} md={6} display="flex" alignItems="center" p={4}>
            <SoftBox width="100%" textAlign="center">
              {/* Logo */}
              <SoftBox mb={2} display="flex" justifyContent="center">
                <img src={require("assets/images/semiconspaceimage.png")} alt="Semiconspace"
                  style={{ width: "120px", height: "80px", objectFit: "contain" }} />
              </SoftBox>

              <SoftTypography variant="h5" fontWeight="semi-bold" gutterBottom color="text" mb={3}>
                Authenticate to continue
              </SoftTypography>

              {/* ========== LOGIN MODE ========== */}
              {!forgotMode && step === 1 && (
                <form onSubmit={handleEmailNext}>
                  <SoftBox mb={2}>
                    <SoftInput type="email" placeholder="Email" value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)} required />
                  </SoftBox>
                  <SoftBox mt={4} mb={1}>
                    <SoftButton type="submit" variant="gradient" color="info" fullWidth>Next</SoftButton>
                  </SoftBox>
                  <SoftBox mt={2}>
                    <SoftButton type="button" variant="text" color="info" fullWidth
                      onClick={() => { setForgotMode(true); setForgotStep(1); }}
                      sx={{ display: "none" }}>
                      {/* Forgot password link moved below password form */}
                    </SoftButton>
                  </SoftBox>
                </form>
              )}

              {/* Forgot link under password form */}
              {!forgotMode && step === 2 && (
                <form onSubmit={handleSubmit}>
                  <SoftBox mb={2}>
                    <FormControl fullWidth variant="outlined">
                      <OutlinedInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        endAdornment={
                          <InputAdornment position="end" sx={{ position: "absolute", right: 8 }}>
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        }
                        sx={{ borderRadius: "12px", height: "44px", pr: 4.5 }}
                      />
                    </FormControl>
                  </SoftBox>

                  <SoftBox display="flex" justifyContent="space-between" alignItems="left" mb={2}>
                    <SoftButton type="button" variant="text" color="secondary" size="small"
                      onClick={() => { setStep(1); setPassword(""); }}
                      sx={{ textTransform: "none", padding: 0 }}>
                      ← Back
                    </SoftButton>
                    <SoftButton
                      type="button"
                      variant="text"
                      color="dark"
                      onClick={() => { setForgotMode(true); setForgotStep(1); setStep(1); }}
                      sx={{ textTransform: "none", fontSize: "14px", fontWeight: 500 }}
                    >
                      Forgot password?
                    </SoftButton>
                  </SoftBox>

                  <SoftBox display="flex" alignItems="center" mb={1}>
                    <Switch checked={rememberMe} onChange={handleSetRememberMe} />
                    <SoftTypography variant="button" fontWeight="regular"
                      onClick={handleSetRememberMe} sx={{ cursor: "pointer" }}>
                      &nbsp;&nbsp;Remember me
                    </SoftTypography>
                  </SoftBox>

                  <SoftBox mt={2} mb={0}>
                    <SoftButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </SoftButton>
                  </SoftBox>
                </form>
              )}

              {/* ========== FORGOT PASSWORD MODE ========== */}
              {forgotMode && forgotStep === 1 && (
                <form onSubmit={handleRequestOtp} style={{ marginTop: 8 }}>
                  <SoftBox mb={2}>
                    <SoftInput type="email" placeholder="Enter your email"
                      value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                  </SoftBox>
                  <SoftBox mt={2} mb={1}>
                    <SoftButton type="submit" variant="gradient" color="info" fullWidth disabled={forgotLoading}>
                      {forgotLoading ? "Sending..." : "Send OTP"}
                    </SoftButton>
                  </SoftBox>
                  {resendIn > 0 && (
                    <SoftTypography variant="button" color="text">
                      Resend available in {resendIn}s
                    </SoftTypography>
                  )}
                  <SoftBox mt={2} display="flex" justifyContent="flex-end">
                    <SoftButton
                      type="button"
                      variant="text"
                      color="secondary"
                      onClick={() => setForgotMode(false)}
                      sx={{ textTransform: "none", fontSize: "0.95rem", fontWeight: 600 }}
                    >
                      ← Back to login
                    </SoftButton>
                  </SoftBox>
                </form>
              )}

              {forgotMode && forgotStep === 2 && (
                <form onSubmit={handleValidateOtp}>
                  <SoftBox mb={2}>
                    <SoftInput type="text" placeholder="Enter OTP"
                      value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </SoftBox>
                  <SoftTypography variant="button" color="text" mb={2} display="block">
                    OTP expires in {otpExpiresIn}s
                  </SoftTypography>
                  <SoftBox mt={2} mb={1}>
                    <SoftButton type="submit" variant="gradient" color="info" fullWidth disabled={forgotLoading}>
                      {forgotLoading ? "Verifying..." : "Verify OTP"}
                    </SoftButton>
                  </SoftBox>
                  <SoftBox mt={2} display="flex" justifyContent="flex-end">
                    <SoftButton
                      type="button"
                      variant="text"
                      color="secondary"
                      onClick={() => setForgotStep(1)}
                      sx={{ textTransform: "none", fontSize: "0.95rem", fontWeight: 600 }}
                    >
                      ← Back
                    </SoftButton>
                  </SoftBox>
                </form>
              )}

              {forgotMode && forgotStep === 3 && (
                <form onSubmit={handleSetNewPassword}>
                  <SoftBox mb={2}>
                    <FormControl fullWidth variant="outlined">
                      <OutlinedInput
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        endAdornment={
                          <InputAdornment position="end" sx={{ position: "absolute", right: 8 }}>
                            <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end" size="small">
                              {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        }
                        sx={{ borderRadius: "12px", height: "44px", pr: 4.5 }}
                      />
                    </FormControl>
                  </SoftBox>
                  <SoftBox mb={2}>
                    <FormControl fullWidth variant="outlined">
                      <OutlinedInput
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        endAdornment={
                          <InputAdornment position="end" sx={{ position: "absolute", right: 8 }}>
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                              {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        }
                        sx={{ borderRadius: "12px", height: "44px", pr: 4.5 }}
                      />
                    </FormControl>
                  </SoftBox>
                  <SoftBox mt={2} mb={1}>
                    <SoftButton type="submit" variant="gradient" color="info" fullWidth disabled={forgotLoading}>
                      {forgotLoading ? "Updating..." : "Set new password"}
                    </SoftButton>
                  </SoftBox>
                </form>
              )}
            </SoftBox>
          </Grid>
        </Grid>
      </Card>
    </SoftBox>
  );
}
