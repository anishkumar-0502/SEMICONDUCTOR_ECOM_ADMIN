import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import Divider from "@mui/material/Divider";

function OrderSummary({ order }) {
  if (!order) return null;

  return (
    <SoftBox>
      <SoftTypography variant="h6" fontWeight="medium" mb={2}>
        Order Summary
      </SoftTypography>

      <SoftBox display="flex" justifyContent="space-between" mb={1.5}>
        <SoftTypography variant="body2" color="text" fontWeight="medium">
          Subtotal:
        </SoftTypography>
        <SoftTypography variant="body2" fontWeight="bold">
          ₹{order.subtotal ?? 0}
        </SoftTypography>
      </SoftBox>

      <SoftBox display="flex" justifyContent="space-between" mb={1.5}>
        <SoftTypography variant="body2" color="text" fontWeight="medium">
          GST:
        </SoftTypography>
       <SoftTypography variant="body2" fontWeight="bold">
  ₹{(order.gstAmount ?? 0).toFixed(2)}
</SoftTypography>

      </SoftBox>

      <SoftBox display="flex" justifyContent="space-between" mb={1.5}>
        <SoftTypography variant="body2" color="text" fontWeight="medium">
          Shipping:
        </SoftTypography>
        <SoftTypography variant="body2" fontWeight="bold">
          ₹{order.shippingCharge ?? 0}
        </SoftTypography>
      </SoftBox>

      {/* Divider before Total */}
<SoftBox width="100%" my={2}>
  <Divider />
</SoftBox>

      <SoftBox display="flex" justifyContent="space-between">
        <SoftTypography variant="body1" fontWeight="medium" color="text">
          Total:
        </SoftTypography>
       <SoftTypography variant="body1" fontWeight="bold">
  ₹{(order.total ?? 0).toFixed(2)}
</SoftTypography>

      </SoftBox>
    </SoftBox>
  );
}

OrderSummary.propTypes = {
  order: PropTypes.shape({
    subtotal: PropTypes.number,
    gstAmount: PropTypes.number,
    shippingCharge: PropTypes.number,
    total: PropTypes.number,
  }),
};

export default OrderSummary;
