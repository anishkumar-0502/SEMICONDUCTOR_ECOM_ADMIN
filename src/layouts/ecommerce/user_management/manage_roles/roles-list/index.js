import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftBadge from "components/SoftBadge";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import axiosInstance from "utils/axiosInstance";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "utils/auth";
// import { usePermissions } from "hooks/usePermissions";
// import {usePermissions} from '../../../../hooks/usePermission'
import {usePermissions} from '../../../../../hooks/usePermission'

// ✅ Status Cell Renderer
const StatusCellRenderer = ({ value }) =>
  value ? (
    <SoftBadge variant="contained" color="success" size="xs" badgeContent="Active" container />
  ) : (
    <SoftBadge variant="contained" color="error" size="xs" badgeContent="Inactive" container />
  );

StatusCellRenderer.propTypes = {
  value: PropTypes.bool.isRequired,
};

// ✅ ActionCell component
function ActionCell({ role, onView, onToggleStatus, onGrantAccess, canEdit }) {
  return (
    <SoftBox display="flex" alignItems="center">
      {/* View */}
      <SoftTypography
        variant="body1"
        color="secondary"
        sx={{ cursor: "pointer", lineHeight: 0 }}
      >
        <Tooltip title="View Role" placement="top">
          <Icon onClick={() => onView(role)}>visibility</Icon>
        </Tooltip>
      </SoftTypography>

      {/* Toggle Status (Edit Permission Needed) */}
      <SoftBox mx={2}>
        <SoftTypography
          variant="body1"
          color={role.status ? "success" : "error"}
          sx={{ cursor: canEdit ? "pointer" : "not-allowed", lineHeight: 0, opacity: canEdit ? 1 : 0.5 }}
        >
          <Tooltip
            title={canEdit ? (role.status ? "Deactivate Role" : "Activate Role") : "No Permission"}
            placement="top"
          >
            <Icon
              onClick={() => canEdit && onToggleStatus(role)}
              sx={{ fontSize: "2rem" }}
              color={role.status ? "success" : "error"}
            >
              {role.status ? "toggle_on" : "toggle_off"}
            </Icon>
          </Tooltip>
        </SoftTypography>
      </SoftBox>

      {/* Grant Access → Disabled for Enduser (role_id = 2) */}
      <SoftButton
        variant="gradient"
        color="info"
        size="small"
        onClick={() => onGrantAccess(role)}
        disabled={role.role_id === 2}
        sx={{
          fontSize: "0.65rem",
          padding: "2px 8px",
          minWidth: "unset",
          opacity: role.role_id === 2 ? 0.6 : 1,
          cursor: role.role_id === 2 ? "not-allowed" : "pointer",
        }}
      >
        Grant Access
      </SoftButton>
    </SoftBox>
  );
}

ActionCell.propTypes = {
  role: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onGrantAccess: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

// ✅ RolesList Component
function RolesList() {
  const [tableData, setTableData] = useState({
    columns: [
      { Header: "SI.NO", accessor: "si_no", width: "10%" },
      { Header: "Role ID", accessor: "role_id" },
      { Header: "Role Name", accessor: "role_name" },
      { Header: "Created At", accessor: "created_at" },
      { Header: "Status", accessor: "status", Cell: StatusCellRenderer },
      { Header: "Action", accessor: "action" },
    ],
    rows: [],
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { check } = usePermissions();

  const canCreate = check("user_management", "manage_roles", "can_create");
  const canEdit = check("user_management", "manage_roles", "can_update");

  // ✅ Fetch roles from backend
  const fetchRoles = async (pageNum = page, pageLimit = limit) => {
    try {
      const response = await axiosInstance.get(`/user/roles`);
      const roles = response.data.data;

      const startIndex = (pageNum - 1) * pageLimit;
      const paginatedRoles = roles.slice(startIndex, startIndex + pageLimit);

      const rows = paginatedRoles.map((role, index) => ({
        si_no: startIndex + index + 1,
        role_id: role.role_id,
        role_name: role.role_name,
        created_at: role.created_date
          ? new Date(role.created_date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          : "-",
        status: role.status,
        action: (
          <ActionCell
            role={role}
            onView={handleView}
            onToggleStatus={handleToggleStatus}
            onGrantAccess={handleGrantAccess}
            canEdit={canEdit}
          />
        ),
      }));

      setTableData((prev) => ({ ...prev, rows }));
      setTotalPages(Math.ceil(roles.length / pageLimit));
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles(page, limit);
  }, [page, limit, canEdit]);

  const handlePageChange = (_, value) => setPage(value);

  const handleView = (role) => {
    setSelectedRole(role);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
  };

  // ✅ Toggle Active/Inactive (only if allowed)
  const handleToggleStatus = async (role) => {
    if (!canEdit) {
      Swal.fire({ icon: "error", title: "Access Denied", text: "You cannot update roles." });
      return;
    }

    try {
      const payload = {
        role_name: role.role_name,
        status: !role.status,
        modified_by: currentUser?.email || "system",
      };

      const res = await axiosInstance.put(`/user/roles/${role.role_id}`, payload);

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: res.data.message,
        });
        fetchRoles(page, limit);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res.data.message });
      }
    } catch (err) {
      console.error("❌ Error updating role status:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Something went wrong!",
      });
    }
  };

  // ✅ Grant Access only if super-admin
  const handleGrantAccess = (role) => {
    if (!currentUser) {
      Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "You must be logged in to perform this action.",
      });
      return;
    }

    // if (currentUser.role_id !== 1) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Access Denied",
    //     text: `Only super-admin can grant permissions. Your role_id: ${currentUser.role_id}`,
    //   });
    //   return;
    // }

    navigate(`/ecommerce/user_management/manage_roles/grant-access/${role.role_id}`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox my={3}>
        <Card>
          {/* Header */}
          <SoftBox display="flex" justifyContent="space-between" alignItems="flex-start" p={3}>
            <SoftBox lineHeight={1}>
              <SoftTypography variant="h5" fontWeight="medium">
                All Roles
              </SoftTypography>
              <SoftTypography variant="button" fontWeight="regular" color="text">
                Manage user roles and permissions.
              </SoftTypography>
            </SoftBox>
            <Stack spacing={1} direction="row">
              <SoftButton
                variant="gradient"
                color="info"
                size="small"
                  style={{ height: "35px" }}

                onClick={() => window.location.assign("/ecommerce/user_management/manage_roles/new-roles")}
                disabled={!canCreate}
                sx={{
                  opacity: canCreate ? 1 : 0.5,
                  cursor: canCreate ? "pointer" : "not-allowed",
                }}
              >
                + new role
              </SoftButton>
            </Stack>
          </SoftBox>

          {/* Data Table */}
          <DataTable
            table={tableData}
            entriesPerPage={{
              defaultValue: limit,
              entries: [5, 10, 15, 20, 25, 50],
            }}
            canSearch
            onEntriesChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />

          {/* Pagination */}
          <SoftBox display="flex" justifyContent="center" py={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              shape="rounded"
              color="info"
            />
          </SoftBox>
        </Card>
      </SoftBox>

      {/* Role Details Dialog */}
   <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
  <DialogTitle>Role Details</DialogTitle>
  <DialogContent>
    {selectedRole ? (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SoftTypography fontWeight="bold" variant="body2">Role ID:</SoftTypography>
          <SoftTypography variant="body2">{selectedRole.role_id}</SoftTypography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SoftTypography fontWeight="bold" variant="body2">Role Name:</SoftTypography>
          <SoftTypography variant="body2">{selectedRole.role_name}</SoftTypography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SoftTypography fontWeight="bold" variant="body2">Created By:</SoftTypography>
          <SoftTypography variant="body2">{selectedRole.created_by || "-"}</SoftTypography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SoftTypography fontWeight="bold" variant="body2">Created Date:</SoftTypography>
          <SoftTypography variant="body2">
            {selectedRole.created_date
              ? new Date(selectedRole.created_date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
              : "-"}
          </SoftTypography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SoftTypography fontWeight="bold" variant="body2">Modified By:</SoftTypography>
          <SoftTypography variant="body2">{selectedRole.modified_by || "-"}</SoftTypography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SoftTypography fontWeight="bold" variant="body2">Modified Date:</SoftTypography>
          <SoftTypography variant="body2">
            {selectedRole.modified_date
              ? new Date(selectedRole.modified_date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
              : "-"}
          </SoftTypography>
        </Grid>
        <Grid item xs={12} md={6}>
          <SoftTypography fontWeight="bold" variant="body2">Status:</SoftTypography>
          <SoftTypography variant="body2">{selectedRole.status ? "Active" : "Inactive"}</SoftTypography>
        </Grid>
        <Grid item xs={12}>
          <SoftTypography fontWeight="bold" variant="body2">Internal ID:</SoftTypography>
          <SoftTypography variant="body2">{selectedRole._id}</SoftTypography>
        </Grid>
      </Grid>
    ) : (
      <SoftTypography variant="body2">Role not found</SoftTypography>
    )}
  </DialogContent>
</Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default RolesList;
