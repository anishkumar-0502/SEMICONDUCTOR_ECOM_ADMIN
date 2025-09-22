import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import Swal from "sweetalert2";
import { logoutUser } from "utils/auth"; 
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

function LogoutSection() {
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        logoutUser(); 
        Swal.fire("Logged out!", "You have been logged out successfully.", "success");
      }
    });
  };

  return (
    <Card id="logout-section">
      <SoftBox p={3}>
        {/* <SoftTypography variant="h5">Logout</SoftTypography> */}
      </SoftBox>
      <SoftBox pb={3} px={3}>
        <Grid container alignItems="center" justifyContent="center">
          <Grid 
            item 
            xs={12} 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            sx={{ cursor: "pointer" }} 
            onClick={handleLogout}
          >
            <ExitToAppIcon sx={{ color: "red", mr: 1 }} />
            <SoftTypography variant="h6" color="error">
              Logout
            </SoftTypography>
          </Grid>
        </Grid>
      </SoftBox>
    </Card>
  );
}

export default LogoutSection;
