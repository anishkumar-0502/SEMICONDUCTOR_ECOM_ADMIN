import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import TimelineItem from "examples/Timeline/TimelineItem";

function TrackOrder({ order }) {
  return (
    <>
      <SoftTypography variant="h6" fontWeight="medium">
        Track order
      </SoftTypography>
      <SoftBox mt={2}>
        {order.confirmedAt && (
          <TimelineItem
            color="info"
            icon="check_circle"
            title="Order Confirmed"
            dateTime={new Date(order.confirmedAt).toLocaleString("en-IN")}
          />
        )}
        {order.placedAt && (
          <TimelineItem
            color="warning"   // changed color
            icon="shopping_cart"
            title="Order Placed"
            dateTime={new Date(order.placedAt).toLocaleString("en-IN")}
          />
        )}
        {order.shippedAt && (
          <TimelineItem
            color="info"
            icon="local_shipping"
            title="Shipped"
            dateTime={new Date(order.shippedAt).toLocaleString("en-IN")}
          />
        )}
        {order.outForDeliveryAt && (
          <TimelineItem
            color="warning"
            icon="local_mall"
            title="Out for Delivery"
            dateTime={new Date(order.outForDeliveryAt).toLocaleString("en-IN")}
          />
        )}
        {order.deliveredAt && (
          <TimelineItem
            color="success"
            icon="done"
            title="Delivered"
            dateTime={new Date(order.deliveredAt).toLocaleString("en-IN")}
          />
        )}
      </SoftBox>
    </>
  );
}

TrackOrder.propTypes = {
  order: PropTypes.shape({
    placedAt: PropTypes.string,
    confirmedAt: PropTypes.string,
    shippedAt: PropTypes.string,
    outForDeliveryAt: PropTypes.string,
    deliveredAt: PropTypes.string,
  }).isRequired,
};

export default TrackOrder;
