export const setAuthUser = (user, role = "admin") => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`${role}_user_data`, JSON.stringify(user));
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("role_id", JSON.stringify(user.role_id || [])); // store array
  }
};

export const getAuthUser = (role = "admin") => {
  if (typeof window !== "undefined") {
    const user = sessionStorage.getItem(`${role}_user_data`);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const setAuthToken = (token, role = "admin") => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`${role}_auth_token`, token);
  }
};

export const getAuthToken = (role = "admin") => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(`${role}_auth_token`);
  }
  return null;
};

export const logoutUser = (role = "admin") => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`${role}_auth_token`);
    sessionStorage.removeItem(`${role}_user_data`);
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("role_id");
    window.location.replace("/admin/login");
  }
};

export const getCurrentRole = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("role") || "admin";
  }
  return "admin";
};

export const getCurrentUser = () => {
  const role = getCurrentRole();
  return getAuthUser(role);
};

export const getCurrentToken = () => {
  const role = getCurrentRole();
  return getAuthToken(role);
};
