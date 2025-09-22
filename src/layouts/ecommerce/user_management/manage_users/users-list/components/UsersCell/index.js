import PropTypes from "prop-types";
import Checkbox from "@mui/material/Checkbox";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

function UserCell({ name, checked = false }) {
  return (
    <SoftBox display="flex" alignItems="center">
      <Checkbox defaultChecked={checked} />
      <SoftBox mx={2}>
        <SoftTypography variant="button" fontWeight="medium">
          {name}
        </SoftTypography>
      </SoftBox>
    </SoftBox>
  );
}

UserCell.propTypes = {
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool,
};

export default UserCell;
