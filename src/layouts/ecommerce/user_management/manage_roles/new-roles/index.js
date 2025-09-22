import { useState, useEffect } from "react";
import axiosInstance from "utils/axiosInstance";
import { getCurrentUser } from "utils/auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";   // ✅ Import navigation

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard PRO React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Custom Form Field
import FormField from "./components/FormField";

function CreateRole() {
  const [roleName, setRoleName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();   // ✅ Initialize navigate

  // ✅ Fetch logged-in user email on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser?.email) {
      setCreatedBy(currentUser.email);
    }
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!roleName) {
      newErrors.roleName = "Role name is required";
    } else {
      // ✅ Regex: only letters + underscore, must contain at least one letter, 3–30 chars
      const validRoleRegex = /^(?=.*[A-Za-z])[A-Za-z_]{3,30}$/;

      if (!validRoleRegex.test(roleName)) {
        newErrors.roleName =
          "Role name must contain only letters or underscores";
      }
    }

    if (!createdBy) newErrors.createdBy = "Could not identify current user";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRole = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        role_name: roleName,
        created_by: createdBy,
      };

      const res = await axiosInstance.post("/user/roles/createrole", payload);

      if (res.data.success) {
        Swal.fire({
          title: "Success",
          text: "Role created successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/ecommerce/user_management/manage_roles/roles-list");  // ✅ Redirect after success
        });

        setRoleName(""); // clear input
        setErrors({});
      } else {
        Swal.fire({
          title: "Error",
          text: res.data.message || "Failed to create role",
          icon: "error",
        });
      }
    } catch (err) {
      console.error("❌ Error creating role:", err);
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || "Something went wrong!",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <SoftBox mt={3} mb={15}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={10}>
            <SoftTypography variant="h4" fontWeight="bold" mb={1}>
              Create New Role
            </SoftTypography>
            <SoftTypography variant="body2" color="text" mb={3}>
              Fill in the details below to add a Role Name.
            </SoftTypography>

            {/* Card */}
            <Card sx={{ overflow: "visible", p: 3, mt: 3, minHeight: "300px" }}>
              <SoftBox display="flex" flexDirection="column" gap={3} width="100%">
                {/* Label */}
                <SoftTypography
                  variant="h5"
                  fontWeight="medium"
                  mb={1}
                  sx={{ textAlign: "left" }}
                >
                  Role Name
                </SoftTypography>

                {/* Input Box */}
                <FormField
                  placeholder="Enter role name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  error={Boolean(errors.roleName)}        // ✅ Boolean
                  helperText={errors.roleName || ""}      // ✅ Show error message
                  sx={{
                    width: "40%",
                    minWidth: "200px",
                    height: "55px",
                    fontSize: "1.1rem",
                  }}
                />

                {/* Button */}
                <SoftBox mt={4} display="flex" justifyContent="center">
                  <SoftButton
                    variant="gradient"
                    color="info"
                    size="small"
                    sx={{
                      width: "160px",
                      height: "40px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={handleCreateRole}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Role"}
                  </SoftButton>
                </SoftBox>
              </SoftBox>
            </Card>
          </Grid>
        </Grid>
      </SoftBox>

      <Footer />
    </DashboardLayout>
  );
}

export default CreateRole;
