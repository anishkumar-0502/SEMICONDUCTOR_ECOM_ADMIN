import { useState } from "react";
import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import SoftButton from "components/SoftButton";
import FormField from "./FormField";

export default function BasicInfo({ formData, setFormData, onNext }) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

 const validate = () => {
  const newErrors = {};
  if (!formData.first_name) newErrors.first_name = "First name is required";
  if (!formData.last_name) newErrors.last_name = "Last name is required";

  if (!formData.email) {
    newErrors.email = "Email is required";
  } else {
    // ✅ only allow TLD with 2–4 letters (.com, .net, .org, .in, etc.)
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
  }

  if (!formData.phone) newErrors.phone = "Phone is required";
  else if (!/^\d{10}$/.test(formData.phone))
    newErrors.phone = "Please provide a valid phone number";

  if (!formData.password) newErrors.password = "Password is required";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};



  const handleNextStep = () => {
    if (validate()) onNext();
  };

  return (
    <SoftBox component="form" display="flex" flexDirection="column" gap={2}>
      <SoftBox display="flex" gap={2}>
        <FormField
          label="First Name"
          name="first_name"
          value={formData.first_name || ""}
          onChange={handleChange}
          error={errors.first_name}
        />
        <FormField
          label="Last Name"
          name="last_name"
          value={formData.last_name || ""}
          onChange={handleChange}
          error={errors.last_name}
        />
      </SoftBox>

      <SoftBox display="flex" gap={2}>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          label="Phone"
          name="phone"
          value={formData.phone || ""}
          onChange={handleChange}
          error={errors.phone}
        />
      </SoftBox>

      <FormField
        label="Password"
        name="password"
        type="text"
        value={formData.password || ""}
        onChange={handleChange}
        error={errors.password}
      />

      <SoftButton variant="gradient" color="info" onClick={handleNextStep}>
        Next
      </SoftButton>
    </SoftBox>
  );
}

BasicInfo.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};
