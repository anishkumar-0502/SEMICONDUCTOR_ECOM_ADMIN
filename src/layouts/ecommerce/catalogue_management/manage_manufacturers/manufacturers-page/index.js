import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui
import Card from "@mui/material/Card";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Soft UI
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftBadge from "components/SoftBadge";

// Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Axios
import axiosInstance from "utils/axiosInstance";

// ✅ Cell renderers
const StatusCellRenderer = ({ value }) =>
  value === "Active" ? (
    <SoftBadge variant="contained" color="success" size="xs" badgeContent="Active" container />
  ) : (
    <SoftBadge variant="contained" color="error" size="xs" badgeContent="Inactive" container />
  );
StatusCellRenderer.propTypes = { value: PropTypes.string.isRequired };

const ImageCellRenderer = ({ value }) => (
  <img
    src={value}
    alt="product"
    style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
  />
);
ImageCellRenderer.propTypes = { value: PropTypes.string.isRequired };

const DatasheetCellRenderer = ({ value }) => (
  <a href={value} target="_blank" rel="noopener noreferrer">
    Datasheet
  </a>
);
DatasheetCellRenderer.propTypes = { value: PropTypes.string.isRequired };

function ManufacturerPage() {
  const { manufacturerId } = useParams();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState({ columns: [], rows: [] });
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch product list
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/product/manufacturer/${manufacturerId}/products`);
      const products = res.data?.data?.products || [];

      const rows = products.map((prod, index) => ({
        si_no: index + 1,
        image: prod.PhotoUrl,
        name: prod.name,
        semicon_part_number: prod.semicon_part_number,
        category: prod.categoryHierarchy.join(" > "),
        price: `₹ ${(prod.UnitPrice * 86).toFixed(2)}`,
        manufacturerPartNumber: prod.manufacturerPartNumber,
        manufacturer_name: prod.Manufacturer?.Name,
        quantity: prod.ManufacturerPublicQuantity,
        datasheet: prod.DatasheetUrl,
        status: prod.ProductStatus?.Status,
        actions: (
          <IconButton
            color="info"
            size="small"
            onClick={() => handleOpenDialog(prod.semicon_part_number)}
          >
            <VisibilityIcon />
          </IconButton>
        ),
      }));

      setTableData({
        columns: [
          { Header: "SI. NO", accessor: "si_no", width: "5%" },
          { Header: "Image", accessor: "image", width: "10%", Cell: ImageCellRenderer },
          { Header: "Product Name", accessor: "name", width: "20%" },
          { Header: "Semicon Part Number", accessor: "semicon_part_number", width: "15%" },
          { Header: "Category", accessor: "category" },
          { Header: "Price (INR)", accessor: "price" },
          { Header: "Manufacturer Part Number", accessor: "manufacturerPartNumber" },
          { Header: "Manufacturer Name", accessor: "manufacturer_name" },
          { Header: "Quantity", accessor: "quantity" },
          { Header: "Datasheet", accessor: "datasheet", Cell: DatasheetCellRenderer },
          { Header: "Status", accessor: "status", Cell: StatusCellRenderer },
          { Header: "Actions", accessor: "actions", width: "10%" },
        ],
        rows,
      });

      setTotalPages(1);
    } catch (error) {
      console.error("Failed to fetch products:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch details for dialog
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

  useEffect(() => {
    fetchProducts();
  }, [manufacturerId]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox my={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftTypography variant="h5" fontWeight="medium">
              Products by Manufacturer
            </SoftTypography>

            <SoftButton variant="gradient" color="info" onClick={() => navigate(-1)}>
              Back
            </SoftButton>
          </SoftBox>

          {loading ? (
            <SoftBox p={3}>
              <SoftTypography>Loading products...</SoftTypography>
            </SoftBox>
          ) : tableData.rows.length === 0 ? (
            <SoftBox p={3}>
              <SoftTypography>No products found</SoftTypography>
            </SoftBox>
          ) : (
            <DataTable table={tableData} entriesPerPage={false} canSearch isSorted={false} />
          )}

          <SoftBox display="flex" justifyContent="center" py={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              shape="rounded"
              color="info"
            />
          </SoftBox>
        </Card>
      </SoftBox>
      <Footer />

      {/* Dialog for product details */}
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
    </DashboardLayout>
  );
}

export default ManufacturerPage;
