import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

// @mui material components
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
import { usePermissions } from "../../../../../hooks/usePermission";

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

function EndUsersList() {
  const { check, loading } = usePermissions();
  const canCreateUser = check("user_management", "manage_users", "can_create");
  const canUpdateUser = check("user_management", "manage_users", "can_update");

  const [columns] = useState([
    { Header: "SI.NO", accessor: "si_no", width: "10%" },
    { Header: "User", accessor: "user", width: "25%" },
    { Header: "Email", accessor: "email" },
    { Header: "Phone", accessor: "phone" },
    { Header: "Role", accessor: "role" },
    { Header: "Created By", accessor: "created_by" },
    { Header: "Created At", accessor: "created_at" },
    { Header: "Status", accessor: "status", Cell: StatusCellRenderer },
    { Header: "Action", accessor: "action" },
  ]);

  // Full dataset for this page type (end users only)
  const [fullList, setFullList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [fetching, setFetching] = useState(false);

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "-";

  // Handlers declared BEFORE useMemo to avoid TDZ ReferenceError
  const handleView = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handlePageChange = (_, value) => setPage(value);

  // Fetch all end users across API pages, then paginate locally
  const fetchAllEndUsers = async () => {
    setFetching(true);
    try {
      // First page to learn total pages
      const first = await axiosInstance.get(`/user/manage_users/getall?page=1&limit=${limit}`);
      const firstData = first?.data?.data || {};
      const apiTotalPages = firstData?.pagination?.totalPages || 1;

      let all = [...(firstData.endUsers || [])];

      if (apiTotalPages > 1) {
        const requests = [];
        for (let p = 2; p <= apiTotalPages; p += 1) {
          requests.push(
            axiosInstance.get(`/user/manage_users/getall?page=${p}&limit=${limit}`)
          );
        }
        const results = await Promise.all(requests);
        results.forEach((res) => {
          const chunk = res?.data?.data?.endUsers || [];
          all = all.concat(chunk);
        });
      }

      setFullList(all);
      // Reset to first page if current page exceeds new total
      setPage(1);
    } catch (e) {
      console.error("Failed to fetch end users:", e);
    } finally {
      setFetching(false);
    }
  };

  // Initial and when limit changes (because API total pages depends on limit)
  useEffect(() => {
    if (!loading) fetchAllEndUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, limit]);

  // Compute filtered + paginated rows
  const pagedRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
   const filtered = term
  ? fullList.filter((u) => {
      const name = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      const roleString = Array.isArray(u.role) ? u.role.join(", ") : (u.role || "");
      return (
        name.includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.phone || "").toLowerCase().includes(term) ||
        roleString.toLowerCase().includes(term)
      );
    })
  : fullList;


    const localTotalPages = Math.max(1, Math.ceil(filtered.length / limit));
    if (page > localTotalPages) {
      // If current page is out of range (e.g., after changing search), snap back
      setPage(localTotalPages);
    }
    setTotalPages(localTotalPages);

    const start = (Math.min(page, localTotalPages) - 1) * limit;
    const slice = filtered.slice(start, start + limit);

    return slice.map((user, index) => ({
      si_no: start + index + 1,
      user: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      email: user.email,
      phone: user.phone || "-",
    role: Array.isArray(user.role) ? user.role.join(", ") : user.role || "-",
      created_by: user.created_by,
      created_at: formatDate(user.created_at),
      status: user.status,
      action: <ActionCell user={user} onView={handleView} canUpdate={canUpdateUser} />,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullList, searchTerm, page, limit, canUpdateUser]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox p={3}>
        {/* Top bar */}
        <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <SoftBox>
            <SoftTypography variant="h5" fontWeight="medium">
              End Users
            </SoftTypography>
            <SoftTypography variant="button" fontWeight="regular" color="text">
              List of all end users.
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={fetching}
            />

            {canCreateUser && (
              <SoftButton
                variant="gradient"
                color="info"
                size="small"
                style={{ height: "45px" }}
                onClick={() =>
                  window.location.assign("/ecommerce/user_management/manage_users/new-user")
                }
              >
                + new user
              </SoftButton>
            )}
          </SoftBox>
        </SoftBox>

        {/* Table */}
        <SoftBox sx={{ overflowX: "auto" }}>
          <DataTable
            table={{ columns, rows: pagedRows }}
            entriesPerPage={{
              defaultValue: limit,
              entries: [5, 10, 15, 20, 25, 50],
            }}
            canSearch={false}
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
                {/* Password intentionally omitted for security */}
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
                  {formatDate(selectedUser.created_at)}
                </SoftBox>
                <SoftBox mb={2}>
                  <SoftTypography variant="button" fontWeight="bold">
                    Modified Date:
                  </SoftTypography>{" "}
                  {formatDate(selectedUser.modified_date)}
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

export default EndUsersList;