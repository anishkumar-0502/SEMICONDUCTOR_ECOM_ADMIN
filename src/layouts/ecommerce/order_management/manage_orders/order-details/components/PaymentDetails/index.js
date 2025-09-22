import PropTypes from "prop-types";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import borders from "assets/theme/base/borders";

function PaymentDetails({ order }) {
  const { borderWidth, borderColor } = borders;
  return (
    <>
      <SoftTypography variant="h6" fontWeight="medium">
        Payment Details
      </SoftTypography>
      <SoftBox
        border={`${borderWidth[1]} solid ${borderColor}`}
        borderRadius="lg"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={3}
        mt={2}
      >
        <SoftTypography variant="body2" fontWeight="medium">
          Prepaid (Razorpay)
          <br />
          Payment ID: {order.razorpayPaymentId}
        </SoftTypography>
        <SoftBox ml="auto">
          <Tooltip title="Secure Payment via Razorpay" placement="bottom">
            <SoftButton variant="outlined" color="secondary" size="small" iconOnly circular>
              <Icon>verified</Icon>
            </SoftButton>
          </Tooltip>
        </SoftBox>
      </SoftBox>
    </>
  );
}

PaymentDetails.propTypes = {
  order: PropTypes.shape({
    razorpayPaymentId: PropTypes.string.isRequired,
  }).isRequired,
};

export default PaymentDetails;
