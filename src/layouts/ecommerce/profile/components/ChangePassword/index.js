import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import FormField from "../FormField";

function ChangePassword({ password, setPassword, initialPassword, onUpdate, loading, user, initialUser }) {
  const passwordRequirements = [
    "One special character",
    "Min 8 characters",
    "One number (2 are recommended)",
    "Change it often",
  ];

  const renderPasswordRequirements = passwordRequirements.map((item, key) => (
    <SoftBox key={key} component="li" color="text" fontSize="1.25rem" lineHeight={1}>
      <SoftTypography variant="button" color="text" fontWeight="regular" verticalAlign="middle">
        {item}
      </SoftTypography>
    </SoftBox>
  ));

  // Enable update button only if a field changed OR password changed
// Enable update button if password or any user field changed
const isChanged =
  password !== initialPassword ||
  user.first_name !== initialUser.first_name ||
  user.last_name !== initialUser.last_name ||
  user.phone !== initialUser.phone ||
  user.role !== initialUser.role;


  return (
    <Card id="change-password">
      <SoftBox p={3}>
        <SoftTypography variant="h5">Change Password</SoftTypography>
      </SoftBox>
      <SoftBox component="form" pb={3} px={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormField
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              inputProps={{ type: "text" }}
            />
          </Grid>
        </Grid>

        <SoftBox mt={6} mb={1}>
          <SoftTypography variant="h5">Password requirements</SoftTypography>
        </SoftBox>
        <SoftBox mb={1}>
          <SoftTypography variant="body2" color="text">
            Please follow this guide for a strong password
          </SoftTypography>
        </SoftBox>

        <SoftBox display="flex" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap">
          <SoftBox component="ul" m={0} pl={3.25} mb={{ xs: 8, sm: 0 }}>
            {renderPasswordRequirements}
          </SoftBox>
          <SoftBox ml="auto">
            <SoftButton
              variant="gradient"
              color="info"
              size="small"
              onClick={onUpdate}
              disabled={!isChanged || loading}
            >
              {loading ? "Updating..." : "Update"}
            </SoftButton>
          </SoftBox>
        </SoftBox>
      </SoftBox>
    </Card>
  );
}

ChangePassword.propTypes = {
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  initialPassword: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
  initialUser: PropTypes.object.isRequired,
};

export default ChangePassword;
