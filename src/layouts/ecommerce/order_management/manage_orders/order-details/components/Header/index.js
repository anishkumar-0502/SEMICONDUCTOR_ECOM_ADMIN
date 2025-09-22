import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Function to get status color
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "success";
    case "pending":
      return "warning";
    case "shipped":
      return "info";
    case "cancelled":
      return "error";
    default:
      return "secondary";
  }
};

function Header({ order }) {
  const statusColor = getStatusColor(order.status);

  return (
    <SoftBox
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
    >
      <SoftBox mb={{ xs: 2, sm: 0 }}>
        {/* Title - slightly smaller */}
        <SoftTypography variant="h6" fontWeight="medium" mb={1}>
          Order Details
        </SoftTypography>

        {/* Order no */}
        <SoftTypography
          component="p"
          variant="body2"
          color="text"
          mb={0.25}
          sx={{ fontSize: "1rem" }}
        >
          Order no. <b>{order.orderId}</b> from{" "}
          <b>{new Date(order.createdAt).toLocaleString("en-IN")}</b>
        </SoftTypography>

        {/* Razorpay ID */}
        <SoftTypography
          component="p"
          variant="body2"
          color="text"
          mb={0.25}
          sx={{ fontSize: "1rem" }}
        >
          Razorpay Order ID: <b>{order.razorpayOrderId}</b>
        </SoftTypography>

        {/* Status */}
        <SoftTypography
          component="p"
          variant="body2"
          fontWeight="bold"
          color={statusColor}
          sx={{ fontSize: "1rem" }}
        >
          Status: {order.status}
        </SoftTypography>
      </SoftBox>

     
    </SoftBox>
  );
}

Header.propTypes = {
  order: PropTypes.shape({
    orderId: PropTypes.string.isRequired,
    razorpayOrderId: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default Header;
