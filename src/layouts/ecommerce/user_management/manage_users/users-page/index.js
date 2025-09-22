import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import axiosInstance from "utils/axiosInstance";

function UsersPage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`/user/manage_users/getone`, { userId });
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  if (loading) return <SoftTypography>Loading...</SoftTypography>;
  if (!user) return <SoftTypography>User not found</SoftTypography>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <Card sx={{ p: 3 }}>
          <SoftTypography variant="h5" fontWeight="medium" mb={3}>
            User Details
          </SoftTypography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Name:
                </SoftTypography>{" "}
                {user.first_name || "-"} {user.last_name || "-"}
              </SoftBox>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Email:
                </SoftTypography>{" "}
                {user.email || "-"}
              </SoftBox>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Phone:
                </SoftTypography>{" "}
                {user.phone || "-"}
              </SoftBox>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Role:
                </SoftTypography>{" "}
                {user.role || "-"}
              </SoftBox>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Status:
                </SoftTypography>{" "}
                {user.status ? "Active" : "Inactive"}
              </SoftBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Created By:
                </SoftTypography>{" "}
                {user.created_by || "-"}
              </SoftBox>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Modified By:
                </SoftTypography>{" "}
                {user.modified_by || "-"}
              </SoftBox>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Created At:
                </SoftTypography>{" "}
                {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
              </SoftBox>
              <SoftBox mb={2}>
                <SoftTypography variant="button" fontWeight="bold">
                  Modified Date:
                </SoftTypography>{" "}
                {user.modified_date ? new Date(user.modified_date).toLocaleString() : "-"}
              </SoftBox>
            </Grid>
          </Grid>
        </Card>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UsersPage;
