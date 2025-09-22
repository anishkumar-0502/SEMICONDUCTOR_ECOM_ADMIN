// layouts/ecommerce/products/products-list/components/ActionCell.js
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";

function ActionCell({ semiconPartNumber }) {
  const navigate = useNavigate();

 const handleViewClick = () => {
  if (semiconPartNumber) {
    navigate(
      `/ecommerce/catalogue_management/manage_products/${semiconPartNumber}/productdetails`
    );
  }
};


  return (
    <SoftBox display="flex" alignItems="center">
      <SoftTypography
        variant="body1"
        color="secondary"
        sx={{ cursor: "pointer", lineHeight: 0 }}
        onClick={handleViewClick}
      >
        <Tooltip title="Preview product" placement="top">
          <Icon>visibility</Icon>
        </Tooltip>
      </SoftTypography>
    </SoftBox>
  );
}

ActionCell.propTypes = {
  semiconPartNumber: PropTypes.string.isRequired,
};

export default ActionCell;
