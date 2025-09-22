// src/hooks/ProtectedRoute.js
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentToken, getCurrentUser } from "../utils/auth";
import { usePermissions } from "./usePermission";

const ProtectedRoute = ({ children }) => {
  const token = getCurrentToken();
  const location = useLocation();
  const { check, loading } = usePermissions();
  const [hasAccess, setHasAccess] = useState(null);
  const [redirectPath, setRedirectPath] = useState(null);
  
  useEffect(() => {
    if (!token) return;
    
    const checkAccess = async () => {
      // Wait for permissions to load
      if (loading) return;
      
      try {
        // Import routes dynamically to avoid circular dependency
        const { default: routes } = await import("../routes");
        
        // Find the current route in the routes configuration
        const findRouteConfig = (routesArray, path) => {
          for (const route of routesArray) {
            if (route.collapse) {
              const found = findRouteConfig(route.collapse, path);
              if (found) return found;
            }
            
            // Check if this is the current route
            // Handle both exact matches and routes with parameters
            if (route.route && (
              route.route === path || 
              (route.route.includes(':') && 
               path.match(new RegExp(route.route.replace(/:[^/]+/g, '[^/]+')+'$')))
            )) {
              return route;
            }
          }
          return null;
        };
        
        const routeConfig = findRouteConfig(routes, location.pathname);
        
        if (routeConfig) {
          const { module, subModule, permissionAction = "can_view" } = routeConfig;
          
          // Check if user has permission for this route
          const hasPermission = module ? check(module, subModule, permissionAction) : true;
          setHasAccess(hasPermission);
          
          if (!hasPermission) {
            // Find first accessible route
            const user = getCurrentUser();
            if (!user?.role_id) {
              setRedirectPath("/admin/login");
              return;
            }
            
            // Flatten all routes with module/subModule info
            const flattenRoutes = (routesArray) => {
              return routesArray.reduce((acc, route) => {
                if (route.collapse) {
                  return [...acc, ...flattenRoutes(route.collapse)];
                }
                if (route.route && route.module) {
                  return [...acc, route];
                }
                return acc;
              }, []);
            };
            
            const allRoutes = flattenRoutes(routes);
            
            // Find first route user has access to
            for (const route of allRoutes) {
              if (route.module && check(route.module, route.subModule, "can_view")) {
                setRedirectPath(route.route);
                return;
              }
            }
            
            // If no accessible routes found, redirect to login
            setRedirectPath("/admin/login");
          }
        } else {
          // Route not found in configuration, default to no access
          setHasAccess(false);
          setRedirectPath("/admin/login");
        }
      } catch (error) {
        console.error("Error in ProtectedRoute:", error);
        setHasAccess(false);
        setRedirectPath("/admin/login");
      }
    };
    
    checkAccess();
  }, [location.pathname, loading, check, token]);
  
  // First check if user is logged in
  if (!token) return <Navigate to="/admin/login" replace />;
  
  // Show loading or nothing while checking permissions
  if (loading || hasAccess === null) return null;
  
  // If user doesn't have permission for this route
  if (!hasAccess && redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // User has access to this route
  return children;
};

// Add prop type validation
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
