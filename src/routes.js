import Dashboard from "layouts/dashboards/Overview";

// Ecommerce - Products
import ProductsList from "layouts/ecommerce/catalogue_management/manage_products/products-list";
import ProductPage from "layouts/ecommerce/catalogue_management/manage_products/product-page";

// Ecommerce - Manufacturers
import ManufacturesList from "layouts/ecommerce/catalogue_management/manage_manufacturers/manufacturers-list";
import ManufacturerPage from "layouts/ecommerce/catalogue_management/manage_manufacturers/manufacturers-page";

// Ecommerce - Categories
import CategorysList from "layouts/ecommerce/catalogue_management/manage_categories/categories-list";
import CategoryPage from "layouts/ecommerce/catalogue_management/manage_categories/categories-page";
import ProductsUnderSubcategory from "layouts/ecommerce/catalogue_management/manage_categories/under-subcategory";

// Orders
import OrderList from "layouts/ecommerce/order_management/manage_orders/order-list";
import OrderDetails from "layouts/ecommerce/order_management/manage_orders/order-details";
import UserPastHistory from "layouts/ecommerce/order_management/manage_orders/user-past-history";
import CreateWarehouse from "layouts/ecommerce/order_management/manage_orders/create-warehouse";
import WarehouseDetails from "layouts/ecommerce/order_management/manage_orders/warehouse-details";

// Users & Roles
import NewUsers from "layouts/ecommerce/user_management/manage_users/new-users";
import EditUsers from "layouts/ecommerce/user_management/manage_users/edit-users";
import EndUsersList from "layouts/ecommerce/user_management/manage_users/end-users-list";
import InternalUsersList from "layouts/ecommerce/user_management/manage_users/internal-users-list";

import RolesList from "layouts/ecommerce/user_management/manage_roles/roles-list";
import NewRoles from "layouts/ecommerce/user_management/manage_roles/new-roles";
import EditRoles from "layouts/ecommerce/user_management/manage_roles/edit-roles";
import GrantAccess from "layouts/ecommerce/user_management/manage_roles/grant-access";
// Profile / Settings
import Settings from "./layouts/ecommerce/profile";

// Authentication
import AdminLogin from "layouts/ecommerce/authentication/index";

// Icons
import Shop from "examples/Icons/Shop";
import Basket from "examples/Icons/Basket";
import CustomerSupport from "examples/Icons/CustomerSupport";
import SettingsIcon from "examples/Icons/Settings";
import Office from "examples/Icons/Office";
import { Troubleshoot } from "@mui/icons-material";

const routes = [
  // Login
  { route: "/admin/login", component: AdminLogin, visibleInSidebar: false },
  { route: "/login", component: AdminLogin, visibleInSidebar: false },

  // Dashboards
  { type: "title", title: "Dashboards", key: "title-dashboard" },
  {
    type: "collapse",
    name: "Dashboards",
    key: "dashboard",
    icon: <Shop size="12px" />,
    route: "/dashboards/Overview",
    collapse: [
      {
        name: "Overview",
        key: "dashboard_default",
        route: "/dashboards/Overview",
        component: Dashboard,
        module: "dashboard",
        subModule: null, // Keep as null to match the permission structure from the API
        permissionAction: "can_view",
        protected: true,
      },
    ],
  },

  // Management Section
  { type: "title", title: "Management", key: "title-management" },

  // Catalogue Management
  {
    type: "collapse",
    name: "Catalogue",
    key: "catalogue_management",
    icon: <Basket size="12px" />,
    route: "/ecommerce/catalogue_management/manage_products/products-list",
    collapse: [
      {
        name: "Products",
        key: "catalogue_management__manage_products",
        route: "/ecommerce/catalogue_management/manage_products/products-list",
        collapse: [
          {
            name: "All Products",
            key: "catalogue_management__products_list",
            route: "/ecommerce/catalogue_management/manage_products/products-list",
            component: ProductsList,
            module: "catalogue_management",
            subModule: "manage_products",
            permissionAction: "can_view",
            protected: true,
          },
          {
            name: "Product Details",
            key: "catalogue_management__product_page",
            route: "/ecommerce/catalogue_management/manage_products/:semicon_part_number/productdetails",
            component: ProductPage,
            visibleInSidebar: false,
            protected: true,
          },
        ],
      },
      {
        name: "Manufacturers",
        key: "catalogue_management__manage_manufacturers",
        route: "/ecommerce/catalogue_management/manage_manufacturers/manufacturers-list",
        collapse: [
          {
            name: "All Manufacturers",
            key: "catalogue_management__manufacturers_list",
            route: "/ecommerce/catalogue_management/manage_manufacturers/manufacturers-list",
            component: ManufacturesList,
            module: "catalogue_management",
            subModule: "manage_manufacturers",
            permissionAction: "can_view",
            protected: true,
          },
          {
            name: "Manufacturer Details",
            key: "catalogue_management__manufacturer_page",
            route: "/ecommerce/catalogue_management/manage_manufacturers/:manufacturerId",
            component: ManufacturerPage,
            visibleInSidebar: false,
            protected: true,
          },
        ],
      },
      {
        name: "Categories",
        key: "catalogue_management__manage_categories",
        route: "/ecommerce/catalogue_management/manage_categories/categories-list",
        collapse: [
          {
            name: "All Categories",
            key: "catalogue_management__categories_list",
            route: "/ecommerce/catalogue_management/manage_categories/categories-list",
            component: CategorysList,
            module: "catalogue_management",
            subModule: "manage_categories",
            permissionAction: "can_view",
            protected: true,
          },
          {
            name: "Category Details",
            key: "catalogue_management__category_page",
            route: "/ecommerce/catalogue_management/manage_categories/category-page/:categoryId",
            component: CategoryPage,
            visibleInSidebar: false,
            protected: true,
          },
          {
            name: "Products Under Subcategory",
            key: "catalogue_management__products_under_subcategory",
            route: "/ecommerce/catalogue_management/manage_categories/:categoryId/under-subcategory/:subcategoryId",
            component: ProductsUnderSubcategory,
            visibleInSidebar: false,
            protected: true,
          },
        ],
      },
    ],
  },

  // Administration Section
  { type: "title", title: "Control Panel", key: "title-admin" },
  {
    type: "collapse",
    name: "Administration",
    key: "user_management",
    icon: <CustomerSupport size="12px" />,
    route: "/ecommerce/user_management/manage_users/users-list",
    collapse: [
      {
        name: "Users",
        key: "user_management__users",
        route: "/ecommerce/user_management/manage_users/users-list",
        collapse: [
          {
            name: "End Users",
            key: "user_management__end_users_list",
            route: "/ecommerce/user_management/manage_users/end-users-list",
            component: EndUsersList,
            module: "user_management",
            subModule: "manage_users",
            permissionAction: "can_view",
            protected: true,
          },
          {
            name: "Internal Users",
            key: "user_management__internal_users_list",
            route: "/ecommerce/user_management/manage_users/internal-users-list",
            component: InternalUsersList,
            module: "user_management",
            subModule: "manage_users",
            permissionAction: "can_view",
            protected: true,
          },
          {
            name: "Create User",
            key: "user_management__new_user",
            route: "/ecommerce/user_management/manage_users/new-user",
            component: NewUsers,
            module: "user_management",
            subModule: "manage_users",
            permissionAction: "can_create",
            protected: true,
          },
          {
            name: "Edit User",
            key: "user_management__edit_user",
            route: "/ecommerce/user_management/manage_users/edit-users/:userId",
            component: EditUsers,
            visibleInSidebar: false,
            module: "user_management",
            subModule: "manage_users",
            permissionAction: "can_update",
            protected: true,
          },
        ],
      },
      {
        name: "Roles",
        key: "user_management__roles",
        route: "/ecommerce/user_management/manage_roles/roles-list",
        collapse: [
          {
            name: "Roles List",
            key: "user_management__roles_list",
            route: "/ecommerce/user_management/manage_roles/roles-list",
            component: RolesList,
            module: "user_management",
            subModule: "manage_roles",
            permissionAction: "can_view",
            protected: true,
          },
          {
            name: "Create Role",
            key: "user_management__new_role",
            route: "/ecommerce/user_management/manage_roles/new-roles",
            component: NewRoles,
            module: "user_management",
            subModule: "manage_roles",
            permissionAction: "can_create",
            protected: true,
          },
          {
            name: "Edit Role",
            key: "user_management__edit_role",
            route: "/ecommerce/user_management/manage_roles/edit-roles/:roleId",
            component: EditRoles,
            visibleInSidebar: false,
            module: "user_management",
            subModule: "manage_roles",
            permissionAction: "can_update",
            protected: true,
          },
          {
            name: "Grant Access",
            key: "user_management__grant_access",
            route: "/ecommerce/user_management/manage_roles/grant-access/:roleId",
            component: GrantAccess,
            visibleInSidebar: false,
            module: "user_management",
            subModule: "manage_roles",
            permissionAction: "can_update",
            protected: true,
          },
        ],
      },
    ],
  },

  // Orders Section
  { type: "title", title: "Orders Management", key: "title-orders" },
  {
    type: "collapse",
    name: "Orders",
    key: "order_management",
    icon: <Office size="12px" />,
    route: "/ecommerce/order_management/manage_orders/order-list",
    collapse: [
      {
        name: "Order List",
        key: "order_management__order_list",
        route: "/ecommerce/order_management/manage_orders/order-list",
        component: OrderList,
        module: "order_management",
        subModule: "manage_orders",
        permissionAction: "can_view",
        protected: true,
      },
      {
        name: "Order Details",
        key: "order_management__order_details",
        route: "/ecommerce/order_management/manage_orders/order-details/:orderId",
        component: OrderDetails,
        visibleInSidebar: false,
        protected: true,
      },
      {
        name: "Create Warehouse",
        key: "order_management__create_warehouse",
        route: "/ecommerce/order_management/manage_orders/create-warehouse",
        component: CreateWarehouse,
        module: "order_management",
        subModule: "manage_orders",
        permissionAction: "can_create",
        visibleInSidebar: false,
        protected: true,
      },
      {
        name: "User Past History",
        key: "order_management__user_past_history",
        route: "/ecommerce/order_management/manage_orders/user-past-history/:userId",
        component: UserPastHistory,
        visibleInSidebar: false,
        protected: true,
      },
      {
        name: "Warehouse Details",
        key: "order_management__warehouse_details",
        route: "/ecommerce/order_management/manage_orders/warehouse-details",
        component: WarehouseDetails,
        module: "order_management",
        subModule: "manage_orders",
        permissionAction: "can_view",
        visibleInSidebar: true,
        protected: true,
      }
    ],
  },

  
  // Profile / Account Settings
  { type: "title", title: "Account Settings", key: "title-account" },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <SettingsIcon size="12px" />,
    route: "/ecommerce/profile",
    collapse: [
      {
        name: "Account Settings",
        key: "profile__account_settings",
        route: "/ecommerce/profile",
        component: Settings,
        module: "profile",
        subModule: "account_settings",
        permissionAction: "can_view",
        protected: true,
      },
    ],
  },
];

export default routes;
