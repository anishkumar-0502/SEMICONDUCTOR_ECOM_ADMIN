// @mui
import Grid from "@mui/material/Grid";

// Soft UI
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftBadge from "components/SoftBadge";

// React PropTypes
import PropTypes from "prop-types";

function ProductInfo({ product, details }) {
  // Convert UTC date string to IST formatted string
  const formatIST = (utcDate) => {
    if (!utcDate) return "-";
    return new Date(utcDate).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const mainCategory = details?.Category;
  const subCategory = details?.Category?.ChildCategories?.[0];

  return (
    <SoftBox>
      {/* Product Name */}
      <SoftBox mb={1}>
        <SoftTypography variant="h3" fontWeight="bold">
          {details?.Manufacturer?.PartNumber || "-"}
        </SoftTypography>
      </SoftBox>

      {/* Manufacturer Info */}
      <SoftBox mt={1}>
        <SoftTypography variant="h6" fontWeight="medium">
          Manufacturer: {details?.Manufacturer?.Name || "-"}
        </SoftTypography>
        <SoftTypography variant="body2" color="text">
          Product Name: {product.name || "-"}
        </SoftTypography>
        <SoftTypography variant="body2" color="text">
          Semicon Part Number: {product.semicon_part_number || "-"}
        </SoftTypography>
      </SoftBox>

      {/* Quantity */}
      <SoftBox mt={2}>
        <SoftTypography variant="h5" fontWeight="medium">
          Quantity Available: {product.quantity_available || "-"}
        </SoftTypography>
        <SoftBox mt={1}>
          <SoftBadge
            variant="contained"
            color={product.quantity_available > 0 ? "success" : "error"}
            badgeContent={product.quantity_available > 0 ? "in stock" : "out of stock"}
            container
          />
        </SoftBox>
      </SoftBox>

      {/* Category Information */}
      <SoftBox mt={3}  >
        <SoftTypography variant="h6" fontWeight="bold" mb={1}>
          Category Information:
        </SoftTypography>

        <SoftBox display="flex" flexDirection="column" gap={0.8}>
          <SoftBox display="flex" alignItems="center" gap={1}>
            <SoftTypography variant="body2" fontWeight="bold" color="textSecondary">
              Main Category:
            </SoftTypography>
            <SoftTypography variant="body2">
              {mainCategory?.Name || "-"} ({product.semicon_category_id || "-"})
            </SoftTypography>
          </SoftBox>

          <SoftBox display="flex" alignItems="center" gap={1}>
            <SoftTypography variant="body2" fontWeight="bold" color="textSecondary">
              Sub Category:
            </SoftTypography>
            <SoftTypography variant="body2">
              {subCategory?.Name || "-"} ({product.semicon_child_category_id || "-"})
            </SoftTypography>
          </SoftBox>
        </SoftBox>
      </SoftBox>

      {/* Documents & Media */}
      <SoftBox mt={3}>
        <SoftTypography variant="h6" fontWeight="bold" mb={1}>
          Documents & Media
        </SoftTypography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <SoftTypography variant="body2" fontWeight="bold">
              Resource Type
            </SoftTypography>
          </Grid>
          <Grid item xs={6}>
            <SoftTypography variant="body2" fontWeight="bold">
              Link
            </SoftTypography>
          </Grid>
          <Grid item xs={6}>
            <SoftTypography variant="body2">Datasheets</SoftTypography>
          </Grid>
          <Grid item xs={6}>
            {product.datasheet ? (
              <a href={product.datasheet} target="_blank" rel="noreferrer">
                <SoftTypography variant="body2" color="info">
                  View Datasheet
                </SoftTypography>
              </a>
            ) : (
              <SoftTypography variant="body2" color="text">
                Not available
              </SoftTypography>
            )}
          </Grid>
        </Grid>
      </SoftBox>

      {/* Audit Info */}
     
    </SoftBox>
  );
}

ProductInfo.propTypes = {
  product: PropTypes.object.isRequired,
  details: PropTypes.object.isRequired,
};

export default ProductInfo;
