import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Soft UI
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Product Page components
import ProductImages from "layouts/ecommerce/catalogue_management/manage_products/product-page/components/ProductImages";
import ProductInfo from "layouts/ecommerce/catalogue_management/manage_products/product-page/components/ProductInfo";

// Utils
import axiosInstance from "utils/axiosInstance";

function ProductPage() {
  const { semicon_part_number } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [usdToInr] = useState(83.5);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(
          `/product/${semicon_part_number}/productdetails`
        );
        setProduct(response.data.data);
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      }
    };
    if (semicon_part_number) fetchProduct();
  }, [semicon_part_number]);

  if (!product) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <SoftBox py={3}>
          <Card sx={{ p: 3 }}>
            <SoftTypography variant="h6">Loading product details...</SoftTypography>
          </Card>
        </SoftBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const details = product?.detailed_info || {};
  const allVariants = details?.ProductVariants || [];
  const classifications = details?.ProductDetails?.Classifications || {};

  // Dynamically group variants by package_type
  const variantsByPackageType = allVariants.reduce((acc, variant) => {
    const type = variant.package_type || "Other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(variant);
    return acc;
  }, {});

  // Convert variants → DataTable format
  const formatVariants = (variants) => ({
    columns: [
      { Header: "Package Type", accessor: "package_type" },
      { Header: "Vendor Part Number", accessor: "vendor_part_number" },
      { Header: "Min Order Qty", accessor: "minimum_order_quantity" },
      { Header: "Break Qty", accessor: "break_qty" },
      { Header: "Unit Price", accessor: "unit_price" },
      { Header: "Total Price", accessor: "total_price" },
      { Header: "Price (INR)", accessor: "price_inr" },
    ],
    rows: variants.flatMap((variant) =>
      variant.pricing_details?.pricing?.map((p) => ({
        package_type: variant.package_type,
        vendor_part_number: variant.vendor_part_number,
        minimum_order_quantity: variant.pricing_details?.minimum_order_quantity,
        break_qty: p.BreakQuantity,
        unit_price: `₹${(p.UnitPrice * usdToInr).toFixed(3)}`,
        total_price: `₹${(p.TotalPrice* usdToInr).toFixed(3)}`,
        price_inr: `₹${(p.TotalPrice * usdToInr).toFixed(3)}`,
      }))
    ),
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <Card sx={{ overflow: "visible", position: "relative" }}>
          <SoftBox p={3}>
            {/* Back Button */}
            <SoftBox sx={{ position: "absolute", top: 16, right: 16 }}>
              <SoftButton
                variant="gradient"
                color="info"
                size="small"
                onClick={() =>
                  navigate("/ecommerce/catalogue_management/manage_products/products-list")
                }
              >
                ← Back
              </SoftButton>
            </SoftBox>

            {/* Product Details Title */}
            <SoftBox mb={3}>
              <SoftTypography variant="h5" fontWeight="medium">
                Product Details
              </SoftTypography>
            </SoftBox>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={6} xl={5}>
                <ProductImages imageUrl={product.imageurl} name={product.name} />
              </Grid>

              <Grid item xs={12} lg={5} sx={{ mx: "auto" }}>
                <ProductInfo product={product} details={details} />
              </Grid>
            </Grid>

            {/* Variant Tables (Dynamic) */}
            {Object.entries(variantsByPackageType).map(([type, variants]) => (
              <SoftBox key={type} mt={8} mb={2}>
                <SoftBox mb={1} ml={2}>
                  <SoftTypography variant="h5" fontWeight="medium">
                    {type} Variants
                  </SoftTypography>
                </SoftBox>
                {variants.length > 0 ? (
                  <DataTable
                    table={formatVariants(variants)}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    isSorted={false}
                  />
                ) : (
                  <SoftTypography ml={2}>No {type} variants available.</SoftTypography>
                )}
              </SoftBox>
            ))}

            {/* Environmental & Export Classifications */}
            <SoftBox mt={8}>
              <SoftTypography variant="h6" fontWeight="bold" mb={1}>
                Environmental & Export Classifications:
              </SoftTypography>

              <Grid container spacing={2}>
                <Grid item xs={4}><SoftTypography variant="body2" fontWeight="bold">ATTRIBUTE</SoftTypography></Grid>
                <Grid item xs={6}><SoftTypography variant="body2" fontWeight="bold">DESCRIPTION</SoftTypography></Grid>

                <Grid item xs={4}><SoftTypography variant="body2">RoHS Status</SoftTypography></Grid>
                <Grid item xs={8}><SoftTypography variant="body2">{classifications.RohsStatus || "-"}</SoftTypography></Grid>

                <Grid item xs={4}><SoftTypography variant="body2">Moisture Sensitivity Level (MSL)</SoftTypography></Grid>
                <Grid item xs={8}><SoftTypography variant="body2">{classifications.MoistureSensitivityLevel || "-"}</SoftTypography></Grid>

                <Grid item xs={4}><SoftTypography variant="body2">REACH Status</SoftTypography></Grid>
                <Grid item xs={8}><SoftTypography variant="body2">{classifications.ReachStatus || "-"}</SoftTypography></Grid>

                <Grid item xs={4}><SoftTypography variant="body2">ECCN</SoftTypography></Grid>
                <Grid item xs={8}><SoftTypography variant="body2">{classifications.ExportControlClassNumber || "-"}</SoftTypography></Grid>

                <Grid item xs={4}><SoftTypography variant="body2">HTSUS</SoftTypography></Grid>
                <Grid item xs={8}><SoftTypography variant="body2">{classifications.HtsusCode || "-"}</SoftTypography></Grid>
              </Grid>
            </SoftBox>

            {/* Audit Info */}
            <SoftBox mt={4}>
              <SoftTypography variant="h6" fontWeight="medium" mb={1}>Audit Information:</SoftTypography>

              <SoftBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={10} mt={1}>
                <SoftBox>
                  <SoftTypography variant="body2" color="textSecondary" fontWeight="bold">Created By</SoftTypography>
                  <SoftTypography variant="body2" color="text">{product.created_by || "-"} on {new Date(product.created_date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</SoftTypography>
                </SoftBox>

                <SoftBox>
                  <SoftTypography variant="body2" color="textSecondary" fontWeight="bold">Modified By</SoftTypography>
                  <SoftTypography variant="body2" color="text">{product.modified_by || "-"} on {new Date(product.modified_date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</SoftTypography>
                </SoftBox>
              </SoftBox>
            </SoftBox>

          </SoftBox>
        </Card>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProductPage;
