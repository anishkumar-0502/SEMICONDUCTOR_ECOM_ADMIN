import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

function OrderInfo({ order }) {
  return (
    <>
      <SoftTypography variant="h6" fontWeight="medium" mb={2}>
        Items
      </SoftTypography>

      {order.items.map((item, i) => (
        <SoftBox
          key={i}
          display="flex"
          alignItems="center"
          p={2}
          mb={2}
          border="1px solid #E0E0E0"
          borderRadius="12px"
          sx={{ backgroundColor: "#FAFAFA" }}
        >
          {/* Product Image */}
          <SoftBox
            component="img"
            src={item.image_url}
            alt={item.name}
            width={70}
            height={70}
            mr={2}
            sx={{
              borderRadius: "8px",
              objectFit: "contain",
              border: "1px solid #ddd",
              backgroundColor: "#fff",
            }}
          />

          {/* Item Details */}
          <SoftBox flex={1}>
            {/* Item name and quantity */}
            <SoftBox display="flex" alignItems="center" mb={1}>
              <ShoppingCartIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <SoftTypography variant="body2" fontWeight="medium">
                {item.qty} × {item.name}
              </SoftTypography>
            </SoftBox>

            {/* Manufacturer + Package details */}
            <SoftBox display="flex" flexDirection="column" gap={0.5}>
              <SoftTypography variant="caption" color="text">
                MPN: {item.manufacturerPartNumber} | {item.manufacturerName}
              </SoftTypography>
              <SoftTypography variant="caption" color="text">
                Package: {item.package_type}
              </SoftTypography>
            </SoftBox>
          </SoftBox>

          {/* Price */}
          <SoftTypography variant="body2" fontWeight="bold" color="text">
            ₹{item.totalPrice.toLocaleString()}
          </SoftTypography>
        </SoftBox>
      ))}
    </>
  );
}

OrderInfo.propTypes = {
  order: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        qty: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        totalPrice: PropTypes.number.isRequired,
        image_url: PropTypes.string, // ✅ added image prop
        manufacturerPartNumber: PropTypes.string,
        manufacturerName: PropTypes.string,
        package_type: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
};

export default OrderInfo;
