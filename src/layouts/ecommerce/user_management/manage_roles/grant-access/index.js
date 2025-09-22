import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Divider,
  Grid,
  Switch,
  CircularProgress,
} from "@mui/material";
import { Folder as ModuleIcon } from "@mui/icons-material";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import axiosInstance from "utils/axiosInstance";
import Swal from "sweetalert2";

function GrantAccess() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});
  const [saveDisabled, setSaveDisabled] = useState(true);

  // Fetch modules and role permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesRes, permsRes] = await Promise.all([
          axiosInstance.get("/user/permissions/modules"),
          axiosInstance.get(`/user/permissions/roles?ids=${roleId}`),
        ]);

        let modulesData = modulesRes.data.data;
        const permsData = permsRes.data.data;

        // Hide "manage_roles" for all roles except admin (role_id = 1)
        if (String(roleId) !== "1") {
          modulesData = modulesData.map((mod) => {
            if (mod.module === "user_management") {
              return {
                ...mod,
                submodules: mod.submodules?.filter(
                  (sub) => sub.name !== "manage_roles"
                ),
              };
            }
            return mod;
          });
        }

        // Map existing permissions for easy access
        const permsMap = {};
        permsData.forEach((p) => {
          const key = `${p.module}__${p.sub_module || "null"}`;
          permsMap[key] = {
            can_create: p.can_create,
            can_view: p.can_view,
            can_update: p.can_update,
            can_delete: p.can_delete,
            status: p.status,
          };
        });

        setModules(modulesData);
        setPermissions(permsMap);
        setOriginalPermissions(permsMap); // Save original
      } catch (err) {
        console.error("Failed to fetch permissions", err);
        Swal.fire("Error", "Failed to fetch permissions", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  // Check if permissions changed
  useEffect(() => {
    const isEqual = (obj1, obj2) => {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      return keys1.every((key) => {
        const val1 = obj1[key];
        const val2 = obj2[key];
        return (
          val1?.can_create === val2?.can_create &&
          val1?.can_view === val2?.can_view &&
          val1?.can_update === val2?.can_update &&
          val1?.can_delete === val2?.can_delete
        );
      });
    };
    setSaveDisabled(isEqual(permissions, originalPermissions));
  }, [permissions, originalPermissions]);

  // Toggle individual action
  const handleToggle = (module, submodule, action) => {
    const key = `${module}__${submodule || "null"}`;
    setPermissions((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [action]: !prev[key]?.[action],
        status: true,
      },
    }));
  };

  // Select All for a module
  const handleModuleSelectAll = (mod, checked) => {
    const updates = {};
    updates[`${mod.module}__null`] = {
      can_create: checked,
      can_view: checked,
      can_update: checked,
      can_delete: checked,
      status: true,
    };
    mod.submodules?.forEach((sub) => {
      updates[`${mod.module}__${sub.name}`] = sub.actions.reduce(
        (acc, action) => {
          acc[`can_${action}`] = checked;
          acc.status = true;
          return acc;
        },
        {}
      );
    });
    setPermissions((prev) => ({ ...prev, ...updates }));
  };

  // Global Select All
  const handleGlobalSelectAll = (checked) => {
    const updates = {};
    modules.forEach((mod) => {
      updates[`${mod.module}__null`] = {
        can_create: checked,
        can_view: checked,
        can_update: checked,
        can_delete: checked,
        status: true,
      };
      mod.submodules?.forEach((sub) => {
        updates[`${mod.module}__${sub.name}`] = sub.actions.reduce(
          (acc, action) => {
            acc[`can_${action}`] = checked;
            acc.status = true;
            return acc;
          },
          {}
        );
      });
    });
    setPermissions((prev) => ({ ...prev, ...updates }));
  };

  // Save permissions
  const handleSave = async () => {
    try {
      const payload = {
        role_id: Number(roleId),
        permissions: Object.entries(permissions).map(([key, value]) => {
          const [module, sub_module] = key.split("__");
          return {
            module,
            sub_module: sub_module === "null" ? null : sub_module,
            can_create: Boolean(value?.can_create),
            can_view: Boolean(value?.can_view),
            can_update: Boolean(value?.can_update),
            can_delete: Boolean(value?.can_delete),
          };
        }),
      };

      await axiosInstance.post("/user/permissions/bulk", payload);

      Swal.fire("Success", "Permissions updated successfully", "success").then(
        () => navigate("/ecommerce/user_management/manage_roles/roles-list")
      );
    } catch (err) {
      console.error("Failed to save permissions", err);
      const msg = err.response?.data?.message || "Failed to save permissions";
      Swal.fire("Error", msg, "error");
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="70vh"
        >
          <CircularProgress />
        </SoftBox>
        <Footer />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox my={3}>
        {/* Header */}
        <SoftBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <SoftTypography variant="h5" fontWeight="bold">
            Grant Access – Role #{roleId}
          </SoftTypography>
          <SoftButton
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => navigate(-1)}
          >
            Back
          </SoftButton>
        </SoftBox>

        {/* Modules rendering */}
        {modules.map((mod) => (
          <Card key={mod.module} sx={{ p: 3, mb: 3, borderRadius: 1 }}>
            {/* Module Header */}
            <SoftBox
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <SoftBox display="flex" alignItems="center">
                <ModuleIcon color="info" sx={{ mr: 1 }} />
                <SoftTypography variant="h6" fontWeight="bold">
                  {mod.module.toUpperCase()}
                </SoftTypography>
              </SoftBox>
              <SoftBox display="flex" alignItems="center" gap={1}>
                <SoftTypography variant="caption">Select All</SoftTypography>
                <Switch
                  color="default"
                  checked={
                    permissions[`${mod.module}__null`]
                      ? ["can_create", "can_view", "can_update", "can_delete"].every(
                          (a) => permissions[`${mod.module}__null`][a]
                        )
                      : false
                  }
                  onChange={(e) => handleModuleSelectAll(mod, e.target.checked)}
                />
              </SoftBox>
            </SoftBox>
            <Divider sx={{ mb: 2 }} />

            {/* Module Direct Actions */}
            {mod.actions && (
              <Grid container spacing={2} sx={{ pl: 1, mb: 2 }}>
                {["create", "view", "update", "delete"].map((action) => (
                  <Grid item xs={6} sm={3} key={action}>
                    <SoftBox display="flex" flexDirection="column" alignItems="center">
                      <SoftTypography variant="body2" gutterBottom>
                        {action}
                      </SoftTypography>
                      <Switch
                        color="default"
                        checked={
                          permissions[`${mod.module}__null`]?.[`can_${action}`] || false
                        }
                        onChange={() =>
                          handleToggle(mod.module, null, `can_${action}`)
                        }
                      />
                    </SoftBox>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Submodules */}
            {mod.submodules &&
              mod.submodules.map((sub) => (
                <SoftBox key={sub.name} p={2} mb={2}>
                  <SoftTypography variant="subtitle2" mb={1}>
                    {sub.name}
                  </SoftTypography>
                  <Grid container spacing={2}>
                    {sub.actions.map((action) => (
                      <Grid item xs={6} sm={3} key={action}>
                        <SoftBox display="flex" flexDirection="column" alignItems="center">
                          <SoftTypography variant="body2" gutterBottom>
                            {action}
                          </SoftTypography>
                          <Switch
                            color="default"
                            checked={
                              permissions[`${mod.module}__${sub.name}`]?.[`can_${action}`] ||
                              false
                            }
                            onChange={() =>
                              handleToggle(mod.module, sub.name, `can_${action}`)
                            }
                          />
                        </SoftBox>
                      </Grid>
                    ))}
                  </Grid>
                </SoftBox>
              ))}
          </Card>
        ))}

        {/* Global Select All */}
        <SoftBox display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
          <SoftTypography variant="body2" fontWeight="medium">
            Select All Permissions
          </SoftTypography>
          <Switch onChange={(e) => handleGlobalSelectAll(e.target.checked)} />
        </SoftBox>

        {/* Footer Buttons */}
        <SoftBox mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <SoftButton variant="outlined" color="secondary" onClick={() => navigate(-1)}>
            Cancel
          </SoftButton>
          <SoftButton
            variant="gradient"
            color="info"
            onClick={handleSave}
            disabled={saveDisabled} // 🔹 Disable if no changes
          >
            Save Permissions
          </SoftButton>
        </SoftBox>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default GrantAccess;
