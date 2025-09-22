/**
=========================================================
* Soft UI Dashboard PRO React - v4.0.3
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-pro-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { palette, boxShadows, transitions, breakpoints, functions } = theme;
  const { transparentSidenav, miniSidenav } = ownerState;

  const sidebarWidth = 250;
  const { white, transparent } = palette;
  const { xxl } = boxShadows;
  const { pxToRem } = functions;

  // styles when miniSidenav={false}
  const drawerOpenStyles = {
    width: sidebarWidth,
    overflowX: "hidden",
    overflowY: "auto",
    transition: transitions.create(["width", "background-color"], {
      easing: transitions.easing.sharp,
      duration: transitions.duration.enteringScreen,
    }),
    [breakpoints.up("xl")]: {
      backgroundColor: transparentSidenav ? transparent.main : white.main,
      boxShadow: transparentSidenav ? "none" : xxl,
    },
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#ccc",
      borderRadius: "3px",
    },
  };

  // styles when miniSidenav={true}
  const drawerCloseStyles = {
    width: pxToRem(96),
    overflowX: "hidden",
    overflowY: "hidden",
    transition: transitions.create(["width", "background-color"], {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),
    [breakpoints.up("xl")]: {
      backgroundColor: transparentSidenav ? transparent.main : white.main,
      boxShadow: transparentSidenav ? "none" : xxl,
    },
  };

  return {
    "& .MuiDrawer-paper": {
      boxShadow: xxl,
      border: "none",
      display: "flex",
      flexDirection: "column",
      ...(miniSidenav ? drawerCloseStyles : drawerOpenStyles),
    },
  };
});
