import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// @mui material
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";

// Soft UI
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";   // ✅ import DataTable

// Axios
import axiosInstance from "utils/axiosInstance";

export default function ProductsUnderSubcategory() {
  const { categoryId, subcategoryId } = useParams();
  const navigate = useNavigate();
  const [subcategoryName, setSubcategoryName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // For dialog
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/product/categories/${categoryId}/subcategories/${subcategoryId}/getproducts?page=${page}&limit=${limit}`
      );

      setProducts(res.data.data);
      setSubcategoryName(res.data.data[0]?.subcategory_name || "Subcategory Products");
      setCategoryName(res.data.data[0]?.category_name || "Category");
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryId, subcategoryId, page]);

  // Fetch product details on click
  const handleOpenDialog = async (semiconPartNumber) => {
    setLoadingDetails(true);
    try {
      const res = await axiosInstance.get(`/product/${semiconPartNumber}/productdetails`);
      setSelectedProduct(res.data.data);
      setOpen(true);
    } catch (err) {
      console.error("Failed to fetch product details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3} px={3} position="relative">
        {/* Back Button Top-Right */}
        <SoftBox position="absolute" top={16} right={16}>
          <SoftButton variant="gradient" color="info" size="small" onClick={() => navigate(-1)}>
            ← Back
          </SoftButton>
        </SoftBox>

        {/* Page Title */}
        <SoftTypography variant="h6" fontWeight="medium" gutterBottom mb={3}>
          Category: {categoryName} | Subcategory: {subcategoryName}
        </SoftTypography>

        {loading ? (
          <SoftTypography variant="body2">Loading products...</SoftTypography>
        ) : products.length === 0 ? (
          <SoftTypography variant="body2">No products found.</SoftTypography>
        ) : (
          <>
            <Grid container spacing={2}>
              {products.map((product) => {
                const isActive = product.status;
                return (
                  <Grid item xs={12} sm={6} md={3} lg={2.4} key={product.id}>
                    <Card
                      onClick={() => handleOpenDialog(product.semicon_part_number)}
                      sx={{
                        p: 1.5,
                        borderRadius: "12px",
                        border: `1.5px solid ${isActive ? "#22c55e" : "#E53935"}`,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        transition: "all 0.25s ease",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          background: "#fafafa",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        },
                        height: "240px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          width: "130px",
                          height: "120px",
                          objectFit: "contain",
                          mx: "auto",
                          mt: 1,
                          mb: 0.5,
                        }}
                        image={product.image_url}
                        alt={product.name}
                      />

                      <Divider sx={{ my: 0.5 }} />

                      <CardContent sx={{ p: 0.5, textAlign: "center" }}>
                        <SoftTypography
                          variant="body2"
                          color="text"
                          sx={{ fontSize: "0.75rem" }}
                        >
                          <b>MPN:</b> {product.manufacturerPartNumber}
                        </SoftTypography>
                      </CardContent>

                      <SoftBox mt={0.5} mb={3} display="flex" justifyContent="center">
                        <SoftButton
                          variant="gradient"
                          size="small"
                          color="info"
                          sx={{ width: "140px", height: "20px", fontSize: "0.7rem" }}
                        >
                          View
                        </SoftButton>
                      </SoftBox>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Pagination */}
            <SoftBox display="flex" justifyContent="center" py={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="info"
                shape="rounded"
                size="small"
              />
            </SoftBox>
          </>
        )}

        {/* Product Details Dialog */}
   <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
  <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
    Product Details
  </DialogTitle>

  <DialogContent dividers sx={{ p: 2 }}>
  {loadingDetails ? (
    <SoftTypography variant="body2">Loading details...</SoftTypography>
  ) : selectedProduct ? (
    <SoftBox>
      {/* Top Section: Info + Image */}
      <Grid container spacing={2}>
        {/* Left Side Info */}
        <Grid item xs={12} md={7}>
          <SoftBox>
            <SoftTypography variant="subtitle1" gutterBottom fontWeight="medium">
              Basic Information
            </SoftTypography>
            <Divider sx={{ mb: 1 }} />
            <SoftTypography variant="body2"><b>Name:</b> {selectedProduct.name}</SoftTypography>
            <SoftTypography variant="body2"><b>Semicon Part Number:</b> {selectedProduct.semicon_part_number}</SoftTypography>
            <SoftTypography variant="body2"><b>Status:</b> {selectedProduct.status ? "Active" : "Inactive"}</SoftTypography>
            <SoftTypography variant="body2"><b>Quantity Available:</b> {selectedProduct.quantity_available}</SoftTypography>

            <SoftBox mt={2}>
              <SoftTypography variant="subtitle1" gutterBottom fontWeight="medium">
                Manufacturer Info
              </SoftTypography>
              <Divider sx={{ mb: 1 }} />
              <SoftTypography variant="body2"><b>Name:</b> {selectedProduct.detailed_info?.Manufacturer?.Name}</SoftTypography>
              <SoftTypography variant="body2"><b>Part Number:</b> {selectedProduct.detailed_info?.Manufacturer?.PartNumber}</SoftTypography>
            </SoftBox>

            <SoftBox mt={2}>
              <SoftTypography variant="subtitle1" gutterBottom fontWeight="medium">
                Category
              </SoftTypography>
              <Divider sx={{ mb: 1 }} />
              <SoftTypography variant="body2"><b>Main Category:</b> {selectedProduct.detailed_info?.Category?.Name}</SoftTypography>
              {selectedProduct.detailed_info?.Category?.ChildCategories?.map((c) => (
                <SoftTypography variant="body2" key={c.CategoryId}><b>Child:</b> {c.Name}</SoftTypography>
              ))}
            </SoftBox>
          </SoftBox>
        </Grid>

        {/* Right Side: Image + Datasheet */}
        <Grid item xs={12} md={5}>
          <SoftBox
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={2}
            sx={{ border: "1px solid #eee", borderRadius: "8px", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}
          >
            <img
              src={selectedProduct.imageurl}
              alt={selectedProduct.name}
              style={{ maxWidth: "200px", borderRadius: "6px", marginBottom: "8px" }}
            />
            <SoftTypography
              component="a"
              href={selectedProduct.datasheet}
              target="_blank"
              rel="noopener"
              variant="body2"
              sx={{
                color: "green",
                fontWeight: 500,
                textDecoration: "underline",
              }}
            >
              View Datasheet
            </SoftTypography>
          </SoftBox>
        </Grid>
      </Grid>

      {/* Description */}
      <SoftBox mt={3}>
        <SoftTypography variant="subtitle1" gutterBottom fontWeight="medium">
          Description
        </SoftTypography>
        <Divider sx={{ mb: 1 }} />
        <SoftTypography variant="body2">
          {selectedProduct.detailed_info?.Description?.ProductDescription}
        </SoftTypography>
      </SoftBox>

      {/* Classifications */}
      <SoftBox mt={3}>
        <SoftTypography variant="subtitle1" gutterBottom fontWeight="medium">
          Classifications
        </SoftTypography>
        <Divider sx={{ mb: 1 }} />
        <Grid container spacing={1}>
          {Object.entries(selectedProduct.detailed_info?.ProductDetails?.Classifications || {}).map(([k, v]) => (
            <Grid item xs={12} sm={6} key={k}>
              <SoftTypography variant="body2"><b>{k}:</b> {v}</SoftTypography>
            </Grid>
          ))}
        </Grid>
      </SoftBox>

      {/* Product Variants */}
      <SoftBox mt={3}>
        <SoftTypography variant="subtitle1" gutterBottom fontWeight="medium">
          Product Variants
        </SoftTypography>
        <Divider sx={{ mb: 1 }} />

        {selectedProduct.detailed_info?.ProductVariants?.length > 0 ? (
          selectedProduct.detailed_info.ProductVariants.map((variant, i) => {
            const variantTable = {
              columns: [
                { Header: "Break Quantity", accessor: "break_quantity" },
                { Header: "Unit Price", accessor: "unit_price" },
                { Header: "Total Price", accessor: "total_price" },
              ],
              rows: (variant.pricing_details?.pricing || []).map((p) => ({
                break_quantity: p.BreakQuantity,
                unit_price: (p.UnitPrice*83.5).toFixed(3),
                total_price: (p.TotalPrice*83.5).toFixed(3),
              })),
            };

            return (
              <SoftBox key={i} mb={3}>
                <SoftTypography variant="subtitle2" color="info" mb={1}>
                  <b>Package Type:</b> {variant.package_type}
                </SoftTypography>
                <DataTable
                  table={variantTable}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  isSorted={false}
                  noEndBorder
                />
              </SoftBox>
            );
          })
        ) : (
          <SoftTypography variant="body2">No variants available.</SoftTypography>
        )}
      </SoftBox>
    </SoftBox>
  ) : (
    <SoftTypography variant="body2">No details found.</SoftTypography>
  )}
</DialogContent>


  <DialogActions>
    <SoftButton onClick={handleClose} color="info" size="small">
      Close
    </SoftButton>
  </DialogActions>
</Dialog>


      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}
