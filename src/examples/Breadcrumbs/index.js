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

import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useMemo } from "react";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Import your routes
import routesConfig from "routes";

// Flatten all routes from the routes config
function flattenRoutes(config, acc = []) {
  for (const r of config) {
    if (r.route) acc.push(r.route);
    if (r.collapse) flattenRoutes(r.collapse, acc);
  }
  return acc;
}

function Breadcrumbs({ icon, title, route, light = false }) {
  // Normalize route input to array of path segments
  const segments = Array.isArray(route) ? route : String(route).split("/").filter(Boolean);

  // All except last segment (last is the current page title)
  const parentSegments = segments.slice(0, -1);

  // Precompute only static routes (no dynamic ":param") and known static segments
  const staticRoutes = useMemo(
    () => flattenRoutes(routesConfig).filter((p) => typeof p === "string" && !p.includes(":")),
    []
  );

  const knownStaticSegments = useMemo(() => {
    const set = new Set();
    staticRoutes.forEach((p) => {
      p
        .split("/")
        .filter(Boolean)
        .forEach((s) => {
          if (!s.startsWith(":")) set.add(s);
        });
    });
    return set;
  }, [staticRoutes]);

  // Find the closest static route that starts with the given prefix
  const findBestStaticRoute = (prefix) => {
    const candidates = staticRoutes.filter((r) => r.startsWith(prefix));
    if (candidates.length === 0) return prefix; // fallback to prefix

    const segLen = (p) => p.split("/").filter(Boolean).length;
    const prefixLen = segLen(prefix);

    // Prefer the shallowest candidate that is at least as deep as the prefix
    candidates.sort((a, b) => segLen(a) - segLen(b));
    return candidates.find((r) => segLen(r) >= prefixLen) || candidates[0];
  };

  // Build breadcrumb items, skipping dynamic segments
  const crumbs = [];
  const accumulated = [];

  for (const seg of parentSegments) {
    // Skip dynamic-looking segments not present in known static segments
    if (!knownStaticSegments.has(seg)) continue;

    accumulated.push(seg);
    const prefix = `/${accumulated.join("/")}`;
    const to = findBestStaticRoute(prefix);

    crumbs.push({ label: seg.replace(/-/g, " "), to });
  }

  return (
    <SoftBox mr={{ xs: 0, xl: 8 }}>
      <MuiBreadcrumbs
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }) => (light ? white.main : grey[600]),
          },
        }}
      >
        <Link to="/">
          <SoftTypography
            component="span"
            variant="body2"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            sx={{ lineHeight: 0 }}
          >
            <Icon>{icon}</Icon>
          </SoftTypography>
        </Link>

        {crumbs.map(({ label, to }) => (
          <Link to={to} key={to}>
            <SoftTypography
              component="span"
              variant="button"
              fontWeight="regular"
              textTransform="capitalize"
              color={light ? "white" : "dark"}
              opacity={light ? 0.8 : 0.5}
              sx={{ lineHeight: 0 }}
            >
              {label}
            </SoftTypography>
          </Link>
        ))}

        <SoftTypography
          variant="button"
          fontWeight="regular"
          textTransform="capitalize"
          color={light ? "white" : "dark"}
          sx={{ lineHeight: 0 }}
        >
          {title.replace("-", " ")}
        </SoftTypography>
      </MuiBreadcrumbs>
    </SoftBox>
  );
}

// Typechecking props for the Breadcrumbs
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool,
};

export default Breadcrumbs;
