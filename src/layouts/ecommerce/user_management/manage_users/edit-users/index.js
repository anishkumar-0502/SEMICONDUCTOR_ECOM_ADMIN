import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Swal from "sweetalert2";

// Soft UI components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import FormField from "./components/FormField";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// API
import axiosInstance from "utils/axiosInstance";
import { getCurrentUser } from "utils/auth";
import { usePermissions } from "hooks/usePermission";

function EditUsers() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: [],
    role_id: [],
    status: true,
    password: "",
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const currentUser = getCurrentUser();
  const { check } = usePermissions();
  const canUpdate = check("user_management", "manage_users", "can_update");

  // Fetch roles and user details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolesRes = await axiosInstance.get("/user/roles");
        if (rolesRes.data.success) {
          setRoles(rolesRes.data.data.filter((r) => r.status));
        }

        const userRes = await axiosInstance.post("/user/manage_users/getone", { userId });
        if (userRes.data.success) {
          const user = userRes.data.data;
          const userObj = {
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone: user.phone || "",
            role: user.role || [],
            role_id: user.role_id || [],
            status: user.status,
            password: user.password || "",
          };
          setFormData(userObj);
          setOriginalData(userObj);
        } else {
          Swal.fire("Error", "User not found", "error");
        }
      } catch (err) {
        console.error("Error fetching data", err);
        Swal.fire("Error", "Failed to load user details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // Validate phone number
  useEffect(() => {
    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(formData.phone)) {
      setPhoneError("Phone number must be 10 digits only");
    } else {
      setPhoneError("");
    }
  }, [formData.phone]);

  // Handle text field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setIsChanged(JSON.stringify(updated) !== JSON.stringify(originalData));
  };

  // Handle role checkbox change
  const handleRoleChange = (role) => {
    const isSelected = formData.role_id.includes(role.role_id);

    let updated;
    if (isSelected) {
      updated = {
        ...formData,
        role_id: formData.role_id.filter((id) => id !== role.role_id),
        role: formData.role.filter((name) => name !== role.role_name),
      };
    } else {
      updated = {
        ...formData,
        role_id: [...formData.role_id, role.role_id],
        role: [...formData.role, role.role_name],
      };
    }

    setFormData(updated);
    setIsChanged(JSON.stringify(updated) !== JSON.stringify(originalData));
  };

  const handleSave = async () => {
    if (!canUpdate) {
      Swal.fire("Access Denied", "You do not have permission to update users.", "error");
      return;
    }

    if (!isChanged) return;
    if (phoneError) {
      Swal.fire("Validation Error", phoneError, "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        userId,
        modified_by: currentUser?.email || "system",
      };

      const res = await axiosInstance.post("/user/manage_users/update", payload);

      if (res.data.success) {
        Swal.fire("Success", "User updated successfully!", "success").then(() => {
          navigate("/ecommerce/user_management/manage_users/end-users-list");
        });
      } else {
        Swal.fire("Error", res.data.message || "Failed to update user", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Something went wrong!", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox my={6} display="flex" justifyContent="center">
          <CircularProgress />
        </SoftBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox my={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 3 }}>
              <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <SoftTypography variant="h4" fontWeight="medium">
                  Edit User
                </SoftTypography>
                <SoftButton
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={() =>
                    navigate("/ecommerce/user_management/manage_users/end-users-list")
                  }
                >
                  Back
                </SoftButton>
              </SoftBox>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormField label="Email" name="email" value={formData.email} disabled />
                </Grid>
              <Grid item xs={12} md={6}>
  <FormField
    label="Phone"
    name="phone"
    value={formData.phone}
    onChange={(e) => {
      // allow only digits
      const value = e.target.value.replace(/\D/g, "");
      handleChange({ target: { name: "phone", value } });
    }}
    error={phoneError}
    helperText={phoneError || "Enter 10-digit phone number"}
  />
</Grid>

                <Grid item xs={12} md={6}>
                  <FormField
                    label="Password"
                    name="password"
                    type="text"
                    placeholder="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <SoftBox mb={1} ml={0.5}>
                    <SoftTypography variant="caption" fontWeight="bold">
                      Status
                    </SoftTypography>
                  </SoftBox>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) =>
                      handleChange({
                        target: { name: "status", value: e.target.value === "true" },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </Grid>

                {/* Role Checklist */}
                <Grid item xs={12} md={6}>
                  <SoftBox mb={1} ml={0.5}>
                    <SoftTypography variant="caption" fontWeight="bold">
                      Role(s)
                    </SoftTypography>
                  </SoftBox>
                  <SoftBox
                    display="flex"
                    flexDirection="column"
                    gap={0.5}
                    sx={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "8px",
                      width: "100%",
                      fontSize: "0.85rem",
                    }}
                  >
                    {roles.map((role) => (
                      <label
                        key={role.role_id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          value={role.role_id}
                          checked={formData.role_id?.includes(role.role_id)}
                          onChange={() => handleRoleChange(role)}
                          style={{ transform: "scale(0.9)" }}
                        />
                        {role.role_name}
                      </label>
                    ))}
                  </SoftBox>
                </Grid>
              </Grid>

              <SoftBox display="flex" justifyContent="center" mt={4}>
                <SoftButton
                  variant="gradient"
                  color="info"
                  size="small"
                  onClick={handleSave}
                  disabled={!isChanged || saving || !canUpdate || !!phoneError}
                >
                  {saving ? "Updating..." : "Update"}
                </SoftButton>
              </SoftBox>
            </Card>
          </Grid>
        </Grid>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default EditUsers;
