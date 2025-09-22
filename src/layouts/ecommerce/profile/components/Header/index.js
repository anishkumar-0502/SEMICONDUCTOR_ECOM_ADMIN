import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// MUI Icons
import PersonIcon from "@mui/icons-material/Person";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftAvatar from "components/SoftAvatar";

// ✅ Use your own image here
// import semiconspaceImage from "assets/images/semiconspaceimage.jpg";  
import semiconspaceimage from "assets/images/semiconspaceimage.png"
function Header() {
  const [visible, setVisible] = useState(true);

  const handleSetVisible = () => setVisible(!visible);

  return (
    <Card id="profile">
      <SoftBox p={2}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            
          </Grid>
          <Grid item>
            <SoftBox height="100%">
              <SoftTypography variant="h5" fontWeight="medium">
             Account Settings
              </SoftTypography>
            </SoftBox>
          </Grid>
        </Grid>
      </SoftBox>
    </Card>
  );
}

export default Header;
