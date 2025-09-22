import { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/auth";
import axiosInstance from "../utils/axiosInstance";

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [roleIds, setRoleIds] = useState([]);

  // Get user roles once on mount (or when the component mounts after login)
  useEffect(() => {
    const user = getCurrentUser();

    if (!user?.role_id) {
      setRoleIds([]);
      setLoading(false);
      return;
    }

    // Convert to array (support multiple roles, e.g. "3,6")
    const ids = Array.isArray(user.role_id)
      ? user.role_id
      : String(user.role_id).split(",").map((id) => Number(id.trim()));

    setRoleIds(ids.filter((id) => !isNaN(id)));
  }, []);

  // Fetch permissions when roleIds are known
  useEffect(() => {
    if (roleIds.length === 0) return;

    const fetchPermissions = async () => {
      setLoading(true);
      try {
        // Call API with comma separated ids
        const res = await axiosInstance.get(
          `/user/permissions/roles?ids=${roleIds.join(",")}`
        );

        const perms = {};
        res.data.data.forEach((p) => {
          const subModuleKey = p.sub_module
            ? p.sub_module.trim().toLowerCase()
            : "default";
          const key = `${p.module.trim().toLowerCase()}__${subModuleKey}`;

          perms[key] = {
            can_create: !!p.can_create,
            can_view: !!p.can_view,
            can_update: !!p.can_update,
            can_delete: !!p.can_delete,
          };
        });

        setPermissions(perms);
      } catch (err) {
        console.error("Failed to fetch permissions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [roleIds]);

  // Check permission helper
  const check = (module, sub = null, action = "can_view") => {
    if (!module) return false;
    const key = sub
      ? `${module.toLowerCase()}__${sub.toLowerCase()}`
      : `${module.toLowerCase()}__default`;
    return permissions[key]?.[action] ?? false;
  };

  return { permissions, check, loading, roleIds };
};