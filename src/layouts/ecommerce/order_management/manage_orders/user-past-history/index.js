import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";

// @mui
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Soft UI
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import DataTable from "examples/Tables/DataTable";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Components
import Header from "../order-details/components/Header";
import OrderInfo from "../order-details/components/OrderInfo";
import TrackOrder from "../order-details/components/TrackOrder";
import PaymentDetails from "../order-details/components/PaymentDetails";
import BillingInformation from "../order-details/components/BillingInformation";
import OrderSummary from "../order-details/components/OrderSummary";


import axiosInstance from "utils/axiosInstance";

// ✅ ActionCell Component
function ActionCell({ order, onView }) {
  return (
    <SoftBox display="flex" alignItems="center" gap={1}>
      <Tooltip title="View Order">
        <Icon
          sx={{ cursor: "pointer" }}
          onClick={() => onView(order)}
        >
          visibility
        </Icon>
      </Tooltip>
    </SoftBox>
  );
}

ActionCell.propTypes = {
  order: PropTypes.object.isRequired,
  onView: PropTypes.func.isRequired,
};

function UserPastHistory() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [tableData, setTableData] = useState({
    columns: [
      { Header: "SI.NO", accessor: "si_no", width: "6%" },
      { Header: "Order ID", accessor: "orderId" },
      { Header: "Status", accessor: "status" },
      { Header: "Total (₹)", accessor: "total" },
      { Header: "Created At", accessor: "createdAt" },
      { Header: "Actions", accessor: "actions", width: "10%" },
    ],
    rows: [],
  });
  const [loading, setLoading] = useState(true);

  // ✅ Popup state
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.post("/order/admin/by-user", { userId });
      const fetchedOrders = res.data.data || [];
      setOrders(fetchedOrders);

      const rows = fetchedOrders.map((order, index) => ({
        si_no: index + 1,
        orderId: order.orderId,
        status: order.status || "-",
        total: order.total || "-",
        createdAt: order.createdAt
          ? new Date(order.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          : "-",
        actions: (
          <ActionCell
            order={order}
            onView={(o) => setSelectedOrder(o)} // Open modal
          />
        ),
      }));

      setTableData((prev) => ({ ...prev, rows }));
    } catch (err) {
      console.error("❌ Failed to fetch order history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const boxStyle = {
    border: "1px solid #E0E0E0",
    borderRadius: "8px",
    padding: "16px",
    height: "100%",
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox my={3}>
        <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <SoftTypography variant="h5" fontWeight="medium">
            User Past Orders
          </SoftTypography>
          <SoftButton
            variant="gradient"
            color="info"
            size="small"
            onClick={() => navigate(-1)}
          >
            Back
          </SoftButton>
        </SoftBox>

        <Card>
          {loading ? (
            <SoftBox p={3} textAlign="center">
              <SoftTypography>Loading history...</SoftTypography>
            </SoftBox>
          ) : orders.length === 0 ? (
            <SoftBox p={3} textAlign="center">
              <SoftTypography>No past orders found.</SoftTypography>
            </SoftBox>
          ) : (
            <DataTable table={tableData} entriesPerPage={false} canSearch />
          )}
        </Card>
      </SoftBox>

      {/* ✅ Popup modal for Order Details */}
     <Dialog
  open={!!selectedOrder}
  onClose={() => setSelectedOrder(null)}
  fullWidth
  maxWidth={false} // disable default maxWidth
  PaperProps={{
    sx: {
      width: "90%",       // make dialog 90% of viewport width
      maxWidth: "1000px", // max width if you want
    },
  }}
>
  <DialogContent dividers>
    {selectedOrder && (
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
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
              <Header order={selectedOrder} />
            </SoftBox>

            {/* Divider */}
            <Divider />

            <SoftBox p={3}>
              {/* Order Info */}
              <SoftBox sx={boxStyle} mb={3}>
                <OrderInfo order={selectedOrder} />
              </SoftBox>

              {/* Main Content Grid */}
              <Grid container spacing={3}>
                {/* Track Order */}
                <Grid item xs={12} md={6} lg={3}>
                  <SoftBox sx={boxStyle}>
                    <TrackOrder order={selectedOrder} />
                  </SoftBox>
                </Grid>

                {/* Payment + Billing */}
                <Grid item xs={12} md={6} lg={6}>
                  <SoftBox display="flex" flexDirection="column" gap={2}>
                    <SoftBox sx={{ border: "1px solid #E0E0E0", borderRadius: "8px", padding: "16px" }}>
                      <PaymentDetails order={selectedOrder} />
                    </SoftBox>
                    <SoftBox sx={{ border: "1px solid #E0E0E0", borderRadius: "8px", padding: "16px", minHeight: "200px" }}>
                      <BillingInformation billing={selectedOrder.billingDetails} />
                    </SoftBox>
                  </SoftBox>
                </Grid>

                {/* Order Summary */}
                <Grid item xs={12} md={12} lg={3}>
                  <SoftBox sx={boxStyle}>
                    <OrderSummary order={selectedOrder} />
                  </SoftBox>
                </Grid>
              </Grid>
            </SoftBox>
          </Card>
        </Grid>
      </Grid>
    )}
  </DialogContent>
  <DialogActions>
    <SoftButton
      variant="outlined"
      color="secondary"
      onClick={() => setSelectedOrder(null)}
      size="small"
    >
      Close
    </SoftButton>
  </DialogActions>
</Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default UserPastHistory;
