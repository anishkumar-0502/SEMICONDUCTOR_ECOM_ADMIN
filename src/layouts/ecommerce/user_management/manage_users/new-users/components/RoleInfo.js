import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import axiosInstance from "utils/axiosInstance";
import { getCurrentUser } from "utils/auth";
import Swal from "sweetalert2";

export default function RoleInfo({ formData, setFormData, onBack }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axiosInstance.get("/user/roles");
        if (res.data.success) {
          setRoles(res.data.data.filter((role) => role.status));
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        Swal.fire({ title: "Error", text: "Failed to fetch roles", icon: "error" });
      }
    };
    fetchRoles();

    const currentUser = getCurrentUser();
    if (currentUser?.email) {
      setFormData((prev) => ({ ...prev, created_by: currentUser.email }));
    }
  }, [setFormData]);

  const handleRoleChange = (role) => {
    const isSelected = formData.role_id?.includes(role.role_id);

    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        role_id: prev.role_id.filter((id) => id !== role.role_id),
        role: prev.role.filter((name) => name !== role.role_name),
        role_name: prev.role_name.filter((name) => name !== role.role_name),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        role_id: [...(prev.role_id || []), role.role_id],
        role: [...(prev.role || []), role.role_name],
        role_name: [...(prev.role_name || []), role.role_name],
      }));
    }

    setErrors({ ...errors, role: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.role_id || formData.role_id.length === 0) {
      newErrors.role = "At least one role is required";
    }
    if (!formData.created_by) newErrors.created_by = "Created by is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      role_id: formData.role_id,
      created_by: formData.created_by,
    };

    try {
      const res = await axiosInstance.post("/user/manage_users/create", payload);

      if (!res.data.success) {
        const newErrors = {};
        if (res.data.message.toLowerCase().includes("email")) newErrors.email = res.data.message;
        if (res.data.message.toLowerCase().includes("phone")) newErrors.phone = res.data.message;
        setErrors((prev) => ({ ...prev, ...newErrors }));
        Swal.fire({ title: "Error", text: res.data.message, icon: "error" });
        return;
      }

      Swal.fire({ title: "Success", text: "User created successfully!", icon: "success" }).then(() => {
        const roleNames = Array.isArray(formData.role_name) ? formData.role_name.map((r) => String(r).toLowerCase()) : [];
        const isEndUser = roleNames.some((r) => r.includes("end user") || r.includes("end-user") || r.includes("customer"));
        const target = isEndUser
          ? "/ecommerce/user_management/manage_users/end-users-list"
          : "/ecommerce/user_management/manage_users/internal-users-list";
        navigate(target);
      });
    } catch (err) {
      console.error(err);
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
    <SoftBox display="flex" flexDirection="column" gap={2}>
      <label style={{ fontWeight: "bold", marginBottom: "5px" }}>Select Role(s)</label>

      <SoftBox
        display="flex"
        flexDirection="column"
        gap={0.5}
        sx={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "8px",
          maxWidth: "400px",   // 👈 compact width
          fontSize: "0.85rem", // 👈 smaller text
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
              checked={formData.role_id?.includes(role.role_id) || false}
              onChange={() => handleRoleChange(role)}
              style={{ transform: "scale(0.9)" }} // 👈 smaller checkbox
            />
            {role.role_name}
          </label>
        ))}
      </SoftBox>

      {errors.role && <span style={{ color: "red", fontSize: "0.8rem" }}>{errors.role}</span>}

      <SoftBox display="flex" justifyContent="space-between" mt={2}>
        <SoftButton variant="gradient" color="info" onClick={onBack}>
          Back
        </SoftButton>
        <SoftButton variant="gradient" color="info" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Finish"}
        </SoftButton>
      </SoftBox>
    </SoftBox>
  );
}

RoleInfo.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
