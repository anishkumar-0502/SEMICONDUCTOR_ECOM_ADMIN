import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import FormField from "../FormField";
import { useState, useEffect } from "react";

function BasicInfo({ user, setUser, initialUser }) {
  const [errors, setErrors] = useState({ phone: "" });

  const handleChange = (field, value) => {
    setUser({ ...user, [field]: value });

    // validation for phone field
    if (field === "phone") {
      const numericOnly = value.replace(/\D/g, ""); // only digits
      if (numericOnly.length > 10) {
        setErrors((prev) => ({
          ...prev,
          phone: "Phone number cannot exceed 10 digits",
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  return (
    <Card id="basic-info" sx={{ overflow: "visible" }}>
      <SoftBox p={3}>
        <SoftTypography variant="h5">Basic Info</SoftTypography>
      </SoftBox>
      <SoftBox component="form" pb={3} px={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormField
              label="First Name"
              placeholder="Alec"
              value={user.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              label="Last Name"
              placeholder="Thompson"
              value={user.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Email"
              placeholder="example@email.com"
              value={user.email}
              inputProps={{ type: "email" }}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              label="Phone Number"
              placeholder="Enter 10 digit number"
              value={user.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              inputProps={{ type: "text", maxLength: 10 }}
            />
            {errors.phone && (
              <SoftTypography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, display: "block" }}
              >
                {errors.phone}
              </SoftTypography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormField
              label="Role"
              placeholder="Semiconadmin"
              value={user.role}
              onChange={(e) => handleChange("role", e.target.value)}
              disabled
            />
          </Grid>
        </Grid>
      </SoftBox>
    </Card>
  );
}

BasicInfo.propTypes = {
  user: PropTypes.object.isRequired,
  setUser: PropTypes.func.isRequired,
  initialUser: PropTypes.object.isRequired,
};

export default BasicInfo;
