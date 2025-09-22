import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// Soft UI components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";
import { logoutUser } from '../../../utils/auth'
// Soft UI example components
import Breadcrumbs from "examples/Breadcrumbs";
import NotificationItem from "examples/Items/NotificationItem";

// Custom styles
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarDesktopMenu,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Context
import { useSoftUIController, setTransparentNavbar, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import team2 from "assets/images/team-2.jpg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";

function DashboardNavbar({ absolute = false, light = false, isMini = false, logout }) {
  const navigate = useNavigate();
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useSoftUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, openConfigurator } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    setNavbarType(fixedNavbar ? "sticky" : "static");
    const handleTransparentNavbar = () => {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    };
    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

const handleLogout = () => {
  logoutUser(); // clears everything and redirects
};


  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem image={<img src={team2} alt="person" />} title={["New message", "from Laur"]} date="13 minutes ago" onClick={handleCloseMenu} />
      <NotificationItem image={<img src={logoSpotify} alt="person" />} title={["New album", "by Travis Scott"]} date="1 day" onClick={handleCloseMenu} />
      <NotificationItem color="secondary" image={<Icon fontSize="small">payment</Icon>} title={["", "Payment successfully completed"]} date="2 days" onClick={handleCloseMenu} />
    </Menu>
  );

  return (
    <AppBar position={absolute ? "absolute" : navbarType} color="inherit" sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}>
      <Toolbar sx={(theme) => navbarContainer(theme)}>
      <SoftBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
  {/* Move the Icon before Breadcrumbs and add a gap */}
  <Icon fontSize="medium" sx={{ ...navbarDesktopMenu, mr: 2 }} onClick={handleMiniSidenav}>
    {miniSidenav ? "menu_open" : "menu"}
  </Icon>

  <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
</SoftBox>



        {!isMini && (
          <SoftBox sx={(theme) => navbarRow(theme, { isMini })} display="flex" alignItems="center" gap={1}>
            {/* Logout Button */}
            <IconButton size="small" color="inherit" sx={navbarIconButton} onClick={handleLogout}>
              <Icon>logout</Icon>
              <SoftTypography variant="button" fontWeight="medium" color={light ? "white" : "dark"} sx={{ ml: 0.5 }}>
                Logout
              </SoftTypography>
            </IconButton>

            {renderMenu()}
          </SoftBox>
        )}
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  logout: PropTypes.func,
};

export default DashboardNavbar;
