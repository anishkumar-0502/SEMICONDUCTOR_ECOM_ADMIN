import { useEffect, useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftBadge from "components/SoftBadge";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Axios instance
import axiosInstance from "utils/axiosInstance";
// import { usePermissions } from "../../hooks/usePermission";
import {usePermissions} from '../../../../../hooks/usePermission'
// ✅ Cell renderer for status
const StatusCellRenderer = ({ value }) =>
  value ? (
    <SoftBadge variant="contained" color="success" size="xs" badgeContent="Active" container />
  ) : (
    <SoftBadge variant="contained" color="error" size="xs" badgeContent="Inactive" container />
  );

StatusCellRenderer.propTypes = {
  value: PropTypes.bool.isRequired,
};

// ✅ Action cell with View/Edit icons
function ActionCell({ user, onView, canUpdate }) {
  return (
    <SoftBox display="flex" alignItems="center">
      <SoftTypography variant="body1" color="secondary" sx={{ cursor: "pointer", lineHeight: 0 }}>
        <Tooltip title="View User" placement="top">
          <Icon onClick={() => onView(user)}>visibility</Icon>
        </Tooltip>
      </SoftTypography>

      <SoftBox mx={2}>
        {canUpdate ? (
          <SoftTypography variant="body1" color="secondary" sx={{ cursor: "pointer", lineHeight: 0 }}>
            <Tooltip title="Edit User" placement="top">
              <Icon onClick={() => window.location.assign(`/ecommerce/user_management/manage_users/edit-users/${user.userId}`)}>
                edit
              </Icon>
            </Tooltip>
          </SoftTypography>
        ) : (
          <SoftTypography variant="body1" color="text" sx={{ lineHeight: 0, opacity: 0.5 }}>
            <Tooltip title="Edit Disabled" placement="top">
              <Icon>edit</Icon>
            </Tooltip>
          </SoftTypography>
        )}
      </SoftBox>
    </SoftBox>
  );
}

ActionCell.propTypes = {
  user: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
  canUpdate: PropTypes.bool.isRequired,
};

function UsersList() {
  const { check, loading } = usePermissions();
  const canCreateUser = check("user_management", "manage_users", "can_create");
  const canUpdateUser = check("user_management", "manage_users", "can_update");

  const [tableData, setTableData] = useState({
    columns: [
      { Header: "SI.NO", accessor: "si_no", width: "10%" },
      { Header: "User", accessor: "user", width: "25%" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "phone" },
      { Header: "Role", accessor: "role" },
      { Header: "Created By", accessor: "created_by" },
      { Header: "Created At", accessor: "created_at" },
      { Header: "Status", accessor: "status", Cell: StatusCellRenderer },
      { Header: "Action", accessor: "action" },
    ],
    rows: [],
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchUsers = async (pageNum = page, pageLimit = limit) => {
    try {
      const response = await axiosInstance.get(
        `/user/manage_users/getall?page=${pageNum}&limit=${pageLimit}`
      );

      const { users, pagination } = response.data.data;

      const rows = users.map((user, index) => ({
        si_no: (pageNum - 1) * pageLimit + index + 1,
        user: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.phone || "-",
        role: user.role,
        created_by: user.created_by,
        created_at: user.created_at
          ? new Date(user.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          : "-",
        status: user.status,
        action: <ActionCell user={user} onView={handleView} canUpdate={canUpdateUser} />,
      }));

      setTableData((prev) => ({ ...prev, rows }));
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    if (!loading) fetchUsers(page, limit);
  }, [page, limit, loading, canUpdateUser]);

  const handlePageChange = (_, value) => setPage(value);

  const handleView = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />
   <SoftBox p={3}>
  {/* Top bar: Title + Create button + Search */}
  <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
    <SoftBox>
      <SoftTypography variant="h5" fontWeight="medium">
        All Users
      </SoftTypography>
      <SoftTypography variant="button" fontWeight="regular" color="text">
        User management dashboard showing all registered users.
      </SoftTypography>
    </SoftBox>

    <SoftBox display="flex" alignItems="center" gap={2}>
      
      {/* Search box */}
      <input
        type="text"
        placeholder="Search..."
        style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #22c55e",
                minWidth: "250px",
                height: "45px",
              }}
      
        onChange={(e) => {
          const search = e.target.value.toLowerCase();
          const filteredRows = tableData.rows.filter(
            (row) =>
              row.user.toLowerCase().includes(search) ||
              row.email.toLowerCase().includes(search) ||
              row.phone.toLowerCase().includes(search) ||
              row.role.toLowerCase().includes(search)
          );
          setTableData((prev) => ({ ...prev, rows: filteredRows }));
        }}
      />

      {canCreateUser && (
        <SoftButton
  variant="gradient"
  color="info"
  size="small"
  style={{ height: "45px" }}
  onClick={() =>
    window.location.assign("/ecommerce/user_management/manage-users/new-user")
  }
>
  + new user
</SoftButton>
      )}

    </SoftBox>
  </SoftBox>

  {/* Scrollable table */}
  <SoftBox sx={{ overflowX: "auto" }}>
    <DataTable
      table={tableData}
      entriesPerPage={{
        defaultValue: limit,
        entries: [5, 10, 15, 20, 25, 50],
      }}
      canSearch={false} // disable default search
      onEntriesChange={(newLimit) => {
        setLimit(newLimit);
        setPage(1);
      }}
    />
  </SoftBox>

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
</SoftBox>


      {/* User Details Modal */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Name:
                  </SoftTypography>{" "}
                  {selectedUser.first_name || "-"} {selectedUser.last_name || "-"}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Email:
                  </SoftTypography>{" "}
                  {selectedUser.email || "-"}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Phone:
                  </SoftTypography>{" "}
                  {selectedUser.phone || "-"}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Role:
                  </SoftTypography>{" "}
                  {selectedUser.role || "-"}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Status:
                  </SoftTypography>{" "}
                  {selectedUser.status ? "Active" : "Inactive"}
                </SoftBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Created By:
                  </SoftTypography>{" "}
                  {selectedUser.created_by || "-"}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Password:
                  </SoftTypography>{" "}
                  {selectedUser.password || "-"}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Modified By:
                  </SoftTypography>{" "}
                  {selectedUser.modified_by || "-"}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Created At:
                  </SoftTypography>{" "}
                  {selectedUser.created_at
                    ? new Date(selectedUser.created_at).toLocaleString()
                    : "-"}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Modified Date:
                  </SoftTypography>{" "}
                  {selectedUser.modified_date
                    ? new Date(selectedUser.modified_date).toLocaleString()
                    : "-"}
                </SoftBox>
              </Grid>
            </Grid>
          ) : (
            <SoftTypography>User not found</SoftTypography>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default UsersList;
