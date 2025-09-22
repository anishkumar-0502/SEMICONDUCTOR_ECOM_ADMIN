// @mui material components
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Card from "@mui/material/Card";

// React
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

// Soft UI Dashboard PRO React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MiniStatisticsCard from "examples/Cards/StatisticsCards/MiniStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import SalesTable from "examples/Tables/SalesTable";
import Globe from "examples/Globe";

// Soft UI Dashboard PRO React base styles
import typography from "assets/theme/base/typography";
import breakpoints from "assets/theme/base/breakpoints";

// Axios instance
// import axiosInstance from "../../../utils/axiosInstance";
import axiosInstance from "utils/axiosInstance"

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

function Dashboard() {
  const { values } = breakpoints;

  const [userStats, setUserStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chartFilter, setChartFilter] = useState("weekly");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          axiosInstance.get("/user/manage_users/stats"),
          axiosInstance.get("/order/admin/analytics"),
          axiosInstance.get("/product/analytics/count/all"),
        ]);

        if (usersRes.data.success) setUserStats(usersRes.data.data);
        if (ordersRes.data.success) setOrderStats(ordersRes.data.data);
        if (productsRes.data.success) setProductStats(productsRes.data.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3}>
          <SoftTypography variant="h5">Loading dashboard statistics...</SoftTypography>
        </SoftBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!userStats || !orderStats || !productStats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3}>
          <SoftTypography variant="h5" color="error">
            Failed to load statistics.
          </SoftTypography>
        </SoftBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Orders Overview Bar Chart Data (aligned with API fields)
  let chartLabels = [];
  let chartOrders = [];

  if (orderStats) {
    if (chartFilter === "daily") {
      const daily = orderStats.dailyOrders || [];
      chartLabels = daily.map((d) =>
        new Date(d.date).toLocaleDateString("default", { day: "numeric", month: "short" })
      );
      chartOrders = daily.map((d) => Number(d.count) || 0);
    } else if (chartFilter === "weekly") {
      const weekly = orderStats.weeklyOrders || [];
      chartLabels = weekly.map((w) =>
        new Date(w.week).toLocaleDateString("default", { month: "short", day: "numeric" })
      );
      chartOrders = weekly.map((w) => Number(w.count) || 0);
    } else if (chartFilter === "monthly") {
      const monthly = orderStats.monthlyOrders || [];
      chartLabels = monthly.map((m) =>
        new Date(m.month).toLocaleString("default", { month: "short", year: "numeric" })
      );
      chartOrders = monthly.map((m) => Number(m.count) || 0);
    } else if (chartFilter === "yearly") {
      // Aggregate monthlyOrders into yearly totals if yearly data is not provided
      const monthly = orderStats.monthlyOrders || [];
      const yearlyMap = monthly.reduce((acc, m) => {
        const y = new Date(m.month).getFullYear();
        acc[y] = (acc[y] || 0) + (Number(m.count) || 0);
        return acc;
      }, {});
      chartLabels = Object.keys(yearlyMap);
      chartOrders = Object.values(yearlyMap);
    }
  }

  const barData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Orders",
        data: chartOrders,
        backgroundColor: "#22c55e",
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.formattedValue} orders`,
        },
      },
    },
    scales: {
      x: { grid: { color: "rgba(0,0,0,0.05)" } },
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } },
    },
  };

  // Multicolor mapping for stats
  const userStatsColors = {
    total: "primary",
    active: "success",
    inactive: "error",
  };

  const orderStatsColors = {
    totalOrders: "warning",
  };

  const productStatsColors = {
    manufacturers: "info",
    categories: "secondary",
    subCategories: "error",
    totalProducts: "success",
  };

  // Orders by Status Colors Array
  const statusColors = ["success", "warning", "error", "info", "primary", "secondary"];

  // Orders by Status Chart Data
  // Apply status filter to ordersByStatus
  const filteredByStatus = (orderStats.ordersByStatus || []).filter((s) =>
    orderStatusFilter === "all" ? true : String(s.status).toLowerCase() === String(orderStatusFilter).toLowerCase()
  );

  const ordersBarChartData = {
    chart: {
      labels: filteredByStatus.map((s) => s.status),
      datasets: {
        label: "Orders",
        data: filteredByStatus.map((s) => Number(s.count)),
      },
    },
    items: filteredByStatus.map((s, idx) => {
      const count = Number(s.count) || 0;
      const percentage = Math.round((count / (orderStats.totalOrders || 1)) * 100);
      return {
        icon: {
          color: statusColors[idx % statusColors.length],
          component: "shopping_cart",
          size: "md", // keep size consistent
        },
        label: s.status,
        progress: {
          content: String(count),
          percentage,
        },
      };
    }),
  };

  // Products Overview Pie Chart
  const productPieData = {
    labels: ["Products", "Categories", "Sub Categories", "Manufacturers"],
    datasets: [
      {
        label: "Count",
        data: [
          productStats.total_products,
          productStats.total_active_categories,
          productStats.total_active_child_categories,
          productStats.total_active_manufacturers,
        ],
        backgroundColor: ["#3BB77E", "#FF6384", "#36A2EB", "#FFCE56"],
        borderWidth: 1,
      },
    ],
  };

  const productPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.formattedValue}`,
        },
      },
    },
  };

  // Top Products Table rows (aligned with API fields)
  const topProductsRows = (orderStats.topProducts || []).map((p) => ({
    Name: (
      <SoftBox display="flex" alignItems="center" gap={1}>
        {/* No image in API; keep placeholder */}
        <SoftBox sx={{ width: 32, height: 32, borderRadius: 6, bgcolor: "grey.200" }} />
        <SoftTypography variant="caption" fontWeight="medium">
          {p.name}
        </SoftTypography>
      </SoftBox>
    ),
    TotalSold: Number(p.totalSold) || 0,
    ProductId: p.productId,
  }));

   return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <Grid container>
          {/* General Statistics */}
          <Grid item xs={12} lg={7}>
            <SoftBox mb={3} p={1}>
              <SoftTypography
                variant={window.innerWidth < values.sm ? "h3" : "h2"}
                textTransform="capitalize"
                fontWeight="bold"
              >
                general statistics
              </SoftTypography>
            </SoftBox>

           <Grid container>
  <Grid item xs={12}>
    <Globe
      display={{ xs: "none", md: "block" }}
      position="absolute"
      top="6%"
      right="1%"   //  closer to right edge
      mt={{ xs: -12, lg: 1 }}
      mr={0}       //  remove big padding on right
      canvasStyle={{ marginTop: "2rem" }} // optional tighter spacing
    />
  </Grid>
</Grid>


            {/* User & Order Stats */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={5}>
                <SoftBox
                  mb={3}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/ecommerce/user_management/manage_users/end-users-list")
                  }
                >
                  <MiniStatisticsCard
                    title={{ text: "total users", fontWeight: "bold" }}
                    count={userStats.total}
                    icon={{ color: userStatsColors.total, component: "groups" }}
                  />
                </SoftBox>

                <SoftBox
                  mb={3}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/ecommerce/user_management/manage_users/end-users-list")
                  }
                >
                  <MiniStatisticsCard
                    title={{ text: "active users", fontWeight: "bold" }}
                    count={userStats.active}
                    icon={{ color: userStatsColors.active, component: "check_circle" }}
                  />
                </SoftBox>
              </Grid>

              <Grid item xs={12} sm={5}>
                <SoftBox
                  mb={3}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/ecommerce/user_management/manage_users/end-users-list")
                  }
                >
                  <MiniStatisticsCard
                    title={{ text: "inactive users", fontWeight: "bold" }}
                    count={userStats.inactive}
                    icon={{ color: userStatsColors.inactive, component: "cancel" }}
                  />
                </SoftBox>

                <SoftBox
                  mb={3}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/ecommerce/order_management/manage_orders/order-list")
                  }
                >
                  <MiniStatisticsCard
                    title={{ text: "total orders", fontWeight: "bold" }}
                    count={orderStats.totalOrders}
                    icon={{
                      color: orderStatsColors.totalOrders,
                      component: "shopping_cart",
                    }}
                  />
                </SoftBox>
              </Grid>
            </Grid>

            {/* Product Analytics Stats */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={5}>
                <SoftBox
                  mb={3}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      "/ecommerce/catalogue_management/manage_manufacturers/manufacturers-list"
                    )
                  }
                >
                  <MiniStatisticsCard
                    title={{ text: "manufacturers", fontWeight: "bold" }}
                    count={productStats.total_active_manufacturers}
                    icon={{ color: productStatsColors.manufacturers, component: "factory" }}
                  />
                </SoftBox>

                <SoftBox
                  mb={3}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      "/ecommerce/catalogue_management/manage_categories/categories-list"
                    )
                  }
                >
                  <MiniStatisticsCard
                    title={{ text: "categories", fontWeight: "bold" }}
                    count={productStats.total_active_categories}
                    icon={{ color: productStatsColors.categories, component: "category" }}
                  />
                </SoftBox>
              </Grid>

              <Grid item xs={12} sm={5}>
                <SoftBox
                  mb={3}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(
                      "/ecommerce/catalogue_management/manage_categories/categories-list"
                    )
                  }
                >
                  <MiniStatisticsCard
                    title={{ text: "Sub categories", fontWeight: "bold" }}
                    count={productStats.total_active_child_categories}
                    icon={{ color: productStatsColors.subCategories, component: "layers" }}
                  />
                </SoftBox>

                <SoftBox
                  mb={3}
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate("/ecommerce/catalogue_management/manage_products/products-list")
                  }
                >
                  <MiniStatisticsCard
                    title={{ text: "total products", fontWeight: "bold" }}
                    count={productStats.total_products}
                    icon={{ color: productStatsColors.totalProducts, component: "inventory_2" }}
                  />
                </SoftBox>
              </Grid>
            </Grid>
          </Grid>

          {/* ========= Top Products Table (AFTER ALL STATS BOXES) ========= */}
          <Grid item xs={12} md={10} lg={7}>
            <Grid item xs={12} lg={10}>
              <SoftBox
                mb={3}
                position="relative"
                sx={{
                  maxHeight: 350,         // ~4 rows visible
                  overflowY: "auto",      // scroll below 4
                }}
              >
                <SalesTable title="Top Products" rows={topProductsRows} />
              </SoftBox>
            </Grid>
          </Grid>

          {/* ========= Orders by Status + Orders Overview (same row) ========= */}
        <Grid container spacing={3}>
  {/* Left: Orders by Status */}
  <Grid item xs={12} lg={5}>
    <Card
      sx={{
        borderRadius: "16px",
        height: "450px", // reduced height
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <SoftTypography variant="h6" fontWeight="bold">
          Orders by Status
        </SoftTypography>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={orderStatusFilter}
            label="Status"
            onChange={(e) => setOrderStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            {(orderStats.ordersByStatus || []).map((s) => (
              <MenuItem key={s.status} value={s.status}>
                {s.status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </SoftBox>
      <SoftBox flex={1} px={2} pb={2}>
        <ReportsBarChart
          title=""
          description={
            orderStatusFilter === "all"
              ? <>{"("}<strong>{orderStats.totalOrders}</strong>{") total orders"}</>
              : <>{"Status: "}{orderStatusFilter}</>
          }
          chart={ordersBarChartData.chart}
          items={ordersBarChartData.items}
        />
      </SoftBox>
    </Card>
  </Grid>

  {/* Right: Orders Overview */}
  <Grid item xs={12} lg={7}>
    <Card
      sx={{
        borderRadius: "16px",
        height: "450px", // match reduced height
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={2}>
        <SoftTypography variant="h6" fontWeight="bold">
          Orders Overview
        </SoftTypography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="filter-label">Filter</InputLabel>
          <Select
            labelId="filter-label"
            value={chartFilter}
            label="Filter"
            onChange={(e) => setChartFilter(e.target.value)}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
      </SoftBox>
      <SoftBox flex={1} px={2} pb={2}>
        <Bar data={barData} options={barOptions} />
      </SoftBox>
    </Card>
  </Grid>

  {/* Products Overview (Donut) BELOW */}
  <Grid item xs={12} lg={5}>
    <Card
      sx={{
        borderRadius: "16px",
        height: "350px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SoftTypography variant="h6" fontWeight="bold" mb={2}>
        Products Overview
      </SoftTypography>
      <SoftBox sx={{ width: "100%", maxWidth: 320, height: "250px" }}>
        <Pie data={productPieData} options={productPieOptions} />
      </SoftBox>
    </Card>
  </Grid>
</Grid>


        </Grid>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;



