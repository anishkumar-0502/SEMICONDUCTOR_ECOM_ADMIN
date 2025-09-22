import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import axiosInstance from "utils/axiosInstance";
import FormField from "layouts/ecommerce/user_management/manage_users/new-users/components/FormField";
import Swal from "sweetalert2";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function CreateWarehouse() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company: "",
    contact_person_name: "",
    email: "",
    phone: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    longitude: "",
    latitude: "",
    gst_no: "",
    fssai_code: "",
  });

  const [errors, setErrors] = useState({});

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onPhoneChange = (value, country) => {
    if (!value) {
      setForm((f) => ({ ...f, phone: "" }));
      return;
    }
    const countryCode = `+${country.dialCode}`;
    const nationalNumber = value.slice(country.dialCode.length);
    const formatted = `${countryCode}-${nationalNumber}`;
    setForm((f) => ({ ...f, phone: formatted }));
  };

  // 🔹 Validation function
  const validate = () => {
    let newErrors = {};

    // Basic required checks
    if (!form.title) newErrors.title = "Title is required";
    if (!form.company) newErrors.company = "Company is required";
    if (!form.contact_person_name) newErrors.contact_person_name = "Contact person name is required";

    // Email
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    // Phone
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+\d{1,4}-\d{6,15}$/.test(form.phone)) {
      newErrors.phone = "Invalid phone number format (+91-XXXXXXXXXX)";
    }

    // Address
    if (!form.address_1) newErrors.address_1 = "Address 1 is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.country) newErrors.country = "Country is required";

    // Pincode
    if (!form.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Invalid pincode (must be 6 digits)";
    }

    // Longitude
    if (form.longitude && !/^-?\d+(\.\d+)?$/.test(form.longitude)) {
      newErrors.longitude = "Longitude must be a valid number";
    }

    // Latitude
    if (form.latitude && !/^-?\d+(\.\d+)?$/.test(form.latitude)) {
      newErrors.latitude = "Latitude must be a valid number";
    }

    // GST No
    if (form.gst_no && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst_no)) {
      newErrors.gst_no = "Invalid GST number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return; // ❌ Stop if validation fails

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/shipway/warehouse", form);
      const inner = res?.data?.data;
      const wid = inner?.warehouse_response?.warehouse_id;
      const ok = inner?.success === true;
      const text =
        inner?.message ||
        (ok ? "Warehouse created successfully!" : "Request processed");

      await Swal.fire({
        title: ok ? "Success" : "Info",
        text: wid ? `${text} (ID: ${wid})` : text,
        icon: ok ? "success" : "info",
      });

      if (ok) {
        navigate("/ecommerce/order_management/manage_orders/warehouse-details");
      }
    } catch (err) {
      console.error("Failed to create warehouse", err);
      await Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || "Something went wrong!",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox p={3}>
        <SoftTypography variant="h5" fontWeight="medium" mb={2}>
          Create Warehouse
        </SoftTypography>
        <Card>
          <SoftBox p={3} component="form" onSubmit={onSubmit}>
            <Grid container spacing={2}>
              {/* First set of fields */}
              {[
                { name: "title", label: "Title" },
                { name: "company", label: "Company" },
                { name: "contact_person_name", label: "Contact Person Name" },
                { name: "email", label: "Email" },
              ].map((f) => (
                <Grid key={f.name} item xs={12} md={6}>
                  <FormField
                    label={f.label}
                    name={f.name}
                    value={form[f.name]}
                    onChange={onChange}
                    placeholder={f.label}
                    fullWidth
                  />
                  {errors[f.name] && (
                    <SoftTypography variant="caption" color="error">
                      {errors[f.name]}
                    </SoftTypography>
                  )}
                </Grid>
              ))}

              {/* Phone field */}
              <Grid item xs={12} md={6}>
                <SoftBox display="flex" flexDirection="column" flex={1} mb={1}>
                  <SoftTypography
                    component="label"
                    variant="caption"
                    fontWeight="bold"
                    textTransform="capitalize"
                    mb={1}
                  >
                    Phone
                  </SoftTypography>
                  <PhoneInput
                    country={"in"}
                    value={form.phone.replace("+", "").replace("-", "")}
                    onChange={onPhoneChange}
                    containerStyle={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: errors.phone ? "1px solid red" : "1px solid #22c55e",
                      outline: "none",
                      paddingLeft: "48px",
                    }}
                    buttonStyle={{
                      border: "1px solid #22c55e",
                      borderRadius: "8px 0 0 8px",
                    }}
                    enableSearch
                  />
                  {errors.phone && (
                    <SoftTypography variant="caption" color="error">
                      {errors.phone}
                    </SoftTypography>
                  )}
                </SoftBox>
              </Grid>

              {/* Remaining fields */}
              {[
                { name: "address_1", label: "Address 1" },
                { name: "address_2", label: "Address 2" },
                { name: "city", label: "City" },
                { name: "state", label: "State" },
                { name: "country", label: "Country" },
                { name: "pincode", label: "Pincode" },
                { name: "longitude", label: "Longitude" },
                { name: "latitude", label: "Latitude" },
                { name: "gst_no", label: "GST No" },
                { name: "fssai_code", label: "FSSAI Code" },
              ].map((f) => (
                <Grid key={f.name} item xs={12} md={6}>
                  <FormField
                    label={f.label}
                    name={f.name}
                    value={form[f.name]}
                    onChange={onChange}
                    placeholder={f.label}
                    fullWidth
                  />
                  {errors[f.name] && (
                    <SoftTypography variant="caption" color="error">
                      {errors[f.name]}
                    </SoftTypography>
                  )}
                </Grid>
              ))}
            </Grid>

            {/* Submit & Cancel */}
            <SoftBox mt={3} display="flex" gap={2}>
              <SoftButton
                type="submit"
                variant="gradient"
                color="info"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Create Warehouse"}
              </SoftButton>
              <SoftButton
                variant="outlined"
                color="secondary"
                onClick={() =>
                  navigate("/ecommerce/order_management/manage_orders/order-list")
                }
              >
                Cancel
              </SoftButton>
            </SoftBox>
          </SoftBox>
        </Card>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CreateWarehouse;
