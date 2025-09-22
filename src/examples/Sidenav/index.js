import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavList from "examples/Sidenav/SidenavList";
import SidenavItem from "examples/Sidenav/SidenavItem";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import { useSoftUIController, setMiniSidenav } from "context";
import { usePermissions } from "../../hooks/usePermission";

function Sidenav({ color = "info", brand = "", brandName, routes, ...rest }) {
  const [openCollapse, setOpenCollapse] = useState(false);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
  const [controller, dispatch] = useSoftUIController() || {};
  const { miniSidenav = false, transparentSidenav = false } = controller || {};
  const { check, loading, roleIds } = usePermissions();
  const { pathname } = useLocation();

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    const handleMiniSidenav = () =>
      setMiniSidenav(dispatch, window.innerWidth < 1200);
    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch]);

  // Check if collapse has visible children
  const hasVisibleChildren = (items) => {
    if (!items) return false;
    return items.some((item) => {
      if (item.visibleInSidebar === false) return false;

      // Example: restrict manage_roles to superadmin
      if (item.subModule === "manage_roles" && !roleIds.includes(1)) {
        return false;
      }

      const action = item.permissionAction || "can_view";

      if (item.subModule && !check(item.module, item.subModule, action))
        return false;
      if (item.module && !item.subModule && !check(item.module, null, action))
        return false;

      if (item.collapse) return hasVisibleChildren(item.collapse);

      return true;
    });
  };

  const renderNestedCollapse = (collapse) =>
    collapse
      .filter((c) => hasVisibleChildren([c]))
      .map(({ name, route, key, href, collapse: nested }) => {
        if (nested && hasVisibleChildren(nested)) {
          return (
            <SidenavItem
              key={key}
              name={name}
              open={openNestedCollapse === name}
              onClick={() =>
                openNestedCollapse === name
                  ? setOpenNestedCollapse(false)
                  : setOpenNestedCollapse(name)
              }
            >
              {renderNestedCollapse(nested)}
            </SidenavItem>
          );
        }

        return href ? (
          <Link
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            sx={{ textDecoration: "none" }}
          >
            <SidenavItem name={name} nested />
          </Link>
        ) : (
          <NavLink to={route} key={key}>
            <SidenavItem name={name} active={route === pathname} nested />
          </NavLink>
        );
      });

  const renderCollapse = (collapses) =>
    collapses
      .filter((c) => hasVisibleChildren([c]))
      .map(({ name, collapse, route, href, key }) => (
        <SidenavList key={key}>
          {collapse ? (
            <SidenavItem
              name={name}
              active={pathname.includes(key)}
              open={openNestedCollapse === name}
              onClick={() =>
                openNestedCollapse === name
                  ? setOpenNestedCollapse(false)
                  : setOpenNestedCollapse(name)
              }
            >
              {renderNestedCollapse(collapse)}
            </SidenavItem>
          ) : href ? (
            <Link href={href} target="_blank" rel="noreferrer">
              <SidenavItem name={name} active={pathname.includes(key)} />
            </Link>
          ) : (
            <NavLink to={route}>
              <SidenavItem name={name} active={pathname.includes(key)} />
            </NavLink>
          )}
        </SidenavList>
      ));

  const renderRoutes = routes.map((item, index) => {
    if (item.type === "collapse") {
      if (!hasVisibleChildren(item.collapse)) return null;
      return (
        <SidenavCollapse
          key={item.key}
          name={item.name}
          icon={item.icon}
          active={pathname.includes(item.key)}
          open={openCollapse === item.key}
          onClick={() =>
            openCollapse === item.key
              ? setOpenCollapse(false)
              : setOpenCollapse(item.key)
          }
        >
          {item.collapse ? renderCollapse(item.collapse) : null}
        </SidenavCollapse>
      );
    }

    if (item.type === "title") {
      const nextItem = routes[index + 1];
      if (
        nextItem &&
        nextItem.type === "collapse" &&
        !hasVisibleChildren(nextItem.collapse)
      )
        return null;

      return (
        <SoftTypography
          key={item.key}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          opacity={0.6}
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {item.title}
        </SoftTypography>
      );
    }

    if (item.type === "divider") {
      return <Divider key={item.key} />;
    }

    return null;
  });

  if (loading)
    return <SidenavRoot {...rest} ownerState={{ miniSidenav, transparentSidenav }} />;
  if (!roleIds.length) return null; // hide if not logged in

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ miniSidenav, transparentSidenav }}
    >
      <SoftBox pt={3} pb={1} px={4} textAlign="center">
        <SoftBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <SoftTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </SoftTypography>
        </SoftBox>

        <SoftBox>
          {brand && (
            <SoftBox
              component="img"
              src={brand}
              alt={brandName}
              sx={{
                width: "12rem",
                height: "2rem",
                objectFit: "contain",
              }}
            />
          )}
        </SoftBox>
      </SoftBox>

      <Divider />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

Sidenav.propTypes = {
  color: PropTypes.string,
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.array.isRequired,
};

export default Sidenav;
