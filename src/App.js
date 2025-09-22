import { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// MUI
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard PRO components
import SoftBox from "components/SoftBox";
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";
import themeDark from "assets/theme/theme-dark";

// RTL
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Routes
import routes from "routes";

// Context
import { useSoftUIController, setMiniSidenav, setOpenConfigurator, setDarkMode, setLayout } from "context";

// Brand
import brandImage from "assets/images/ecommerce/semiconspaceimage.png";

// ProtectedRoute
// import ProtectedRoute from "components/ProtectedRoute";
import ProtectedRoute from "./hooks/ProtectedRoute";

export default function App() {
  const [controller, dispatch] = useSoftUIController();
  const { miniSidenav, direction, layout, openConfigurator, sidenavColor, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  useMemo(() => {
    const cacheRtl = createCache({ key: "rtl", stylisPlugins: [rtlPlugin] });
    setRtlCache(cacheRtl);
  }, []);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  // Hide sidebar on auth routes
  useEffect(() => {
    const isAuthRoute = pathname === "/admin/login" || pathname === "/login";
    setLayout(dispatch, isAuthRoute ? "page" : "dashboard");
  }, [pathname, dispatch]);

 const renderRoutes = (allRoutes) =>
  allRoutes.flatMap((route) => {
    if (route.collapse) return renderRoutes(route.collapse);
    if (route.route) {
      const Element = route.component;
      const element = route.protected
        ? <ProtectedRoute><Element /></ProtectedRoute>
        : <Element />;
      return <Route key={route.key} path={route.route} element={element} />;
    }
    return [];
  });

  const appContent = (
    <>
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={brandImage}
            brandName="Semiconspace"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {/* <SoftBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="3.5rem"
            height="3.5rem"
            bgColor="white"
            shadow="sm"
            borderRadius="50%"
            position="fixed"
            right="2rem"
            bottom="2rem"
            zIndex={99}
            color="dark"
            sx={{ cursor: "pointer" }}
            onClick={handleConfiguratorOpen}
          >
            <Icon fontSize="default" color="inherit">
              settings
            </Icon>
          </SoftBox> */}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {renderRoutes(routes)}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </>
  );

  // Determine which theme to use based on direction and dark mode
  const getTheme = () => {
    if (direction === "rtl") {
      return themeRTL; // RTL theme doesn't have dark mode yet
    }
    return darkMode ? themeDark : theme;
  };

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={getTheme()}>
        <CssBaseline />
        {appContent}
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={getTheme()}>
      <CssBaseline />
      {appContent}
    </ThemeProvider>
  );
}
