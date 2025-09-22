import { useEffect, useMemo, useState } from "react";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import axiosInstance from "utils/axiosInstance";
import { useNavigate } from "react-router-dom";

function WarehouseDetails() {
  const [loading, setLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const navigate = useNavigate();

 const fetchWarehouses = async () => {
  setLoading(true);
  try {
    const res = await axiosInstance.get("/shipway/getwarehouses");

    // ✅ Correct path
    const mapObj = res?.data?.data?.message || {};  
    const list = Object.values(mapObj);

    setWarehouses(Array.isArray(list) ? list : []);
  } catch (err) {
    console.error("Failed to load warehouses", err);
    setWarehouses([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const sortedWarehouses = useMemo(() => {
    // Default first, then by title
    return [...warehouses].sort((a, b) => {
      if (a.default !== b.default) return b.default - a.default; // '1' first
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [warehouses]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox p={3}>
        <SoftBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <SoftTypography variant="h5" fontWeight="medium">
            Warehouse Details
          </SoftTypography>
          <SoftBox display="flex" gap={1}>
            <SoftButton variant="outlined" color="secondary" onClick={() => navigate(-1)}>
              Back
            </SoftButton>
            <SoftButton
              variant="gradient"
              color="info"
              onClick={() => navigate("/ecommerce/order_management/manage_orders/create-warehouse")}
            >
              + Create Warehouse
            </SoftButton>
          </SoftBox>
        </SoftBox>

        <Grid container spacing={2}>
          {loading ? (
            <Grid item xs={12}>
              <Card>
                <SoftBox p={3}>Loading warehouses...</SoftBox>
              </Card>
            </Grid>
          ) : sortedWarehouses.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <SoftBox p={3}>No warehouses found.</SoftBox>
              </Card>
            </Grid>
          ) : (
            sortedWarehouses.map((w) => (
              <Grid key={w.warehouse_id} item xs={12} md={6} lg={4}>
                <Card>
                  <SoftBox p={3}>
                    <SoftBox display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <SoftTypography variant="h6" fontWeight="bold">
                        {w.title || "Unnamed"}
                      </SoftTypography>
                      {String(w.default) === "1" && (
                        <SoftBox display="flex" alignItems="center" color="success.main">
                          {/* <Icon fontSize="small">star</Icon>
                          <SoftTypography variant="caption" ml={0.5} color="success">
                            Default
                          </SoftTypography> */}
                        </SoftBox>
                      )}
                    </SoftBox>

                    <SoftTypography variant="button" color="text" fontWeight="regular">
                      ID: {w.warehouse_id}
                    </SoftTypography>

                    <Divider sx={{ my: 1.5 }} />

                    <SoftBox mb={1}>
                      <SoftTypography variant="caption" color="text" fontWeight="bold">
                        Company
                      </SoftTypography>
                      <SoftTypography variant="body2">
                        {w.company}
                      </SoftTypography>
                    </SoftBox>

                    <SoftBox mb={1}>
                      <SoftTypography variant="caption" color="text" fontWeight="bold">
                        Contact
                      </SoftTypography>
                      <SoftTypography variant="body2">
                        {w.contact_person_name || "-"} {w.email ? `| ${w.email}` : ""} {w.phone ? `| ${w.phone}` : ""}
                      </SoftTypography>
                    </SoftBox>

                    <SoftBox mb={1}>
                      <SoftTypography variant="caption" color="text" fontWeight="bold">
                        Address
                      </SoftTypography>
                      <SoftTypography variant="body2" component="div">
                        <div>{w.address_1}</div>
                        {w.address_2 ? <div>{w.address_2}</div> : null}
                        <div>
                          {[w.city, w.state, w.pincode].filter(Boolean).join(", ")}
                        </div>
                        <div>{w.country}</div>
                      </SoftTypography>
                    </SoftBox>

                    <Grid container spacing={1}>
                      {[{label: "Latitude", value: w.latitude}, {label: "Longitude", value: w.longitude}].map((i) => (
                        <Grid key={i.label} item xs={6}>
                          <SoftTypography variant="caption" color="text" fontWeight="bold">
                            {i.label}
                          </SoftTypography>
                          <SoftTypography variant="body2">{i.value || "-"}</SoftTypography>
                        </Grid>
                      ))}
                    </Grid>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={1}>
                      {[{label: "GST No", value: w.gst_no}, {label: "FSSAI Code", value: w.fssai_code}].map((i) => (
                        <Grid key={i.label} item xs={6}>
                          <SoftTypography variant="caption" color="text" fontWeight="bold">
                            {i.label}
                          </SoftTypography>
                          <SoftTypography variant="body2">{i.value || "-"}</SoftTypography>
                        </Grid>
                      ))}
                    </Grid>

                    {w.phone_print && (
                      <SoftBox mt={1}>
                        <SoftTypography variant="caption" color="text" fontWeight="bold">
                          Phone Print
                        </SoftTypography>
                        <SoftTypography variant="body2">{w.phone_print}</SoftTypography>
                      </SoftBox>
                    )}

                    {Number(w.assigned_users) > 0 && (
                      <SoftBox mt={1}>
                        <SoftTypography variant="caption" color="text" fontWeight="bold">
                          Assigned Users
                        </SoftTypography>
                        <SoftTypography variant="body2">{w.assigned_users}</SoftTypography>
                      </SoftBox>
                    )}
                  </SoftBox>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default WarehouseDetails;