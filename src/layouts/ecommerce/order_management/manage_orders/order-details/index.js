import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// @mui
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// Soft UI
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton"; // ✅ Import SoftButton

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Components
import Header from "./components/Header";
import OrderInfo from "./components/OrderInfo";
import TrackOrder from "./components/TrackOrder";
import PaymentDetails from "./components/PaymentDetails";
import BillingInformation from "./components/BillingInformation";
import OrderSummary from "./components/OrderSummary";

import axiosInstance from "utils/axiosInstance";
import axios from "axios";
function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.post("/order/admin/view", { orderId });
        setOrder(res.data.data);
      } catch (err) {
        console.error("❌ Failed to fetch order:", err);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox my={6} textAlign="center" fontSize="lg">
          Loading order...
        </SoftBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const boxStyle = {
    border: "1px solid #E0E0E0",
    borderRadius: "8px",
    padding: "16px",
    height: "100%",
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <SoftBox my={5} px={2}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={14}>
            <Card>
              {/* Header with border */}
              <SoftBox
                p={3}
                mb={2}
                sx={{
                  borderBottom: "1px solid #E0E0E0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Header order={order} />

                {/* Buttons */}
                <SoftBox display="flex" gap={1} flexWrap="wrap">
                  <SoftButton
                    variant="gradient"
                    color="info"
                    size="small"
                    onClick={() => navigate("/ecommerce/order_management/manage_orders/order-list")}
                  >
                    Back
                  </SoftButton>
                  <SoftButton
                    variant="gradient"
                    color="info"
                    size="small"
                    onClick={() =>
                      navigate(`/ecommerce/order_management/manage_orders/user-past-history/${order.userId}`)
                    }
                  >
                    View History
                  </SoftButton>
                </SoftBox>
              </SoftBox>

              {/* Divider */}
              <Divider />

              <SoftBox p={3}>
                {/* Order Info */}
                <SoftBox sx={boxStyle} mb={3}>
                  <OrderInfo order={order} />
                </SoftBox>

                {/* Main Content Grid */}
                <Grid container spacing={3}>
                  {/* Track Order */}
                  <Grid item xs={12} md={6} lg={3}>
                    <SoftBox sx={boxStyle}>
                      <TrackOrder order={order} />
                    </SoftBox>
                  </Grid>

                  {/* Payment + Billing */}
                  <Grid item xs={12} md={6} lg={6}>
                    <SoftBox display="flex" flexDirection="column" gap={2}>
                      {/* Payment Box */}
                      <SoftBox sx={{ border: "1px solid #E0E0E0", borderRadius: "8px", padding: "16px" }}>
                        <PaymentDetails order={order} />
                      </SoftBox>

                      {/* Billing Box */}
                      <SoftBox sx={{ border: "1px solid #E0E0E0", borderRadius: "8px", padding: "16px", minHeight: "200px" }}>
                        <BillingInformation billing={order.billingDetails} />
                      </SoftBox>
                    </SoftBox>
                  </Grid>

                  {/* Order Summary */}
                  <Grid item xs={12} md={12} lg={3}>
                    <SoftBox sx={boxStyle}>
                      <OrderSummary order={order} />
                    </SoftBox>
                  </Grid>
                </Grid>
              </SoftBox>
            </Card>
          </Grid>
        </Grid>
      </SoftBox>

      <Footer />
    </DashboardLayout>
  );
}

export default OrderDetails;
