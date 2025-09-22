import PropTypes from "prop-types";
import SoftTypography from "components/SoftTypography";
import SoftBox from "components/SoftBox";
import Grid from "@mui/material/Grid";

// MUI Icons
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";

function BillingInformation({ billing }) {
  const items = [
    { label: "Name", value: `${billing.first_name} ${billing.last_name}`, icon: <PersonIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> },
    { label: "Email", value: billing.email, icon: <EmailIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> },
    { label: "Phone", value: billing.phone, icon: <PhoneIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> },
    { label: "Address", value: `${billing.address}, ${billing.city}, ${billing.state}, ${billing.country} - ${billing.pin}`, icon: <HomeIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> },
  ];

  return (
    <SoftBox>
      <SoftTypography variant="h6" fontWeight="medium" mb={3}>
        Billing Information
      </SoftTypography>

      <Grid container spacing={2} direction="column">
        {items.map((item, index) => (
          <Grid item xs={12} key={index}>
            <SoftBox display="flex" alignItems="center">
              {item.icon}
              <SoftTypography variant="body2" color="text" fontWeight="medium" mr={1}>
                {item.label}:
              </SoftTypography>
              <SoftTypography variant="body2">{item.value}</SoftTypography>
            </SoftBox>
          </Grid>
        ))}
      </Grid>
    </SoftBox>
  );
}

BillingInformation.propTypes = {
  billing: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    country: PropTypes.string,
    pin: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }).isRequired,
};

export default BillingInformation;
