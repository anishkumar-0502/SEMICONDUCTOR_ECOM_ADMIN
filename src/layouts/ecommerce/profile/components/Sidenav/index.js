// @mui material components
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard PRO React icons
import SpaceShip from "examples/Icons/SpaceShip";
import Document from "examples/Icons/Document";
import Cube from "examples/Icons/Cube";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

// Image
// import semiconspaceimage from "assets/images/semiconspaceimage.png";
import semicon from "assets/images/ecommerce/semicon.png";


// Utils
import { getCurrentUser } from "utils/auth";

function Sidenav() {
  const currentUser = getCurrentUser();

  const sidenavItems = [
    { icon: <SpaceShip />, label: "profile", href: "profile" },
    { icon: <Document />, label: "basic info", href: "basic-info" },
    { icon: <Cube />, label: "change password", href: "change-password" },
  ];

  const renderSidenavItems = sidenavItems.map(({ icon, label, href }, key) => {
    const itemKey = `item-${key}`;

    return (
      <SoftBox key={itemKey} component="li" pt={key === 0 ? 0 : 1}>
        <SoftTypography
          component="a"
          href={`#${href}`}
          variant="button"
          fontWeight="regular"
          color={label === "Logout" ? "error" : "text"}
          textTransform="capitalize"
          sx={({
            borders: { borderRadius },
            functions: { pxToRem },
            palette: { light },
            transitions,
          }) => ({
            display: "flex",
            alignItems: "center",
            borderRadius: borderRadius.md,
            minHeight: pxToRem(40),
            padding: `${pxToRem(8)} ${pxToRem(16)}`,
            marginBottom: pxToRem(6),
            transition: transitions.create("background-color", {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.shorter,
            }),
            "&:hover": {
              backgroundColor: light.main,
            },
          })}
        >
          <SoftBox mr={1.5} lineHeight={1}>
            {icon}
          </SoftBox>
          {label}
        </SoftTypography>
      </SoftBox>
    );
  });

  return (
    <Card
      sx={{
        borderRadius: ({ borders: { borderRadius } }) => borderRadius.lg,
        position: "sticky",
        top: "1%",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <SoftBox
        component="ul"
        display="flex"
        flexDirection="column"
        p={2}
        m={0}
        sx={{ listStyle: "none" }}
      >
        {/* ✅ Profile Section */}
        <SoftBox
          display="flex"
          flexDirection="column"
          alignItems="center"
          mb={2}
        >
          <Avatar
            src={semicon} 
            alt="semiconspace-logo"
            sx={{ width: 50, height: 60, borderRadius: "30%" ,mb:1}} // ⬅️ Circle avatar
          />
          
          <SoftTypography variant="h6" fontWeight="medium" fontSize="0.9rem">
            {currentUser?.email}
          </SoftTypography>
          <SoftTypography variant="body2" color="text" fontSize="0.8rem">
            {currentUser?.phone}
          </SoftTypography>
        </SoftBox>

        {/* ✅ Divider line */}
        <Divider sx={{ mb: 2 }} />

        {/* ✅ Sidebar items */}
        {renderSidenavItems}
      </SoftBox>
    </Card>
  );
}

export default Sidenav;
