import PropTypes from "prop-types";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import { useNavigate } from "react-router-dom";

function ActionCell({ userId }) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/ecommerce/users/users-page/${userId}`); // ✅ updated route
  };

  const handleEdit = () => {
    navigate(`/ecommerce/users/edit-users/${userId}`);
  };

  return (
    <SoftBox display="flex" alignItems="center">
      <SoftTypography
        variant="body1"
        color="secondary"
        sx={{ cursor: "pointer", lineHeight: 0 }}
      >
        <Tooltip title="View User" placement="top">
          <Icon onClick={handleView}>visibility</Icon>
        </Tooltip>
      </SoftTypography>
      <SoftBox mx={2}>
        <SoftTypography
          variant="body1"
          color="secondary"
          sx={{ cursor: "pointer", lineHeight: 0 }}
        >
          <Tooltip title="Edit User" placement="top">
            <Icon onClick={handleEdit}>edit</Icon>
          </Tooltip>
        </SoftTypography>
      </SoftBox>
    </SoftBox>
  );
}

ActionCell.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default ActionCell;
