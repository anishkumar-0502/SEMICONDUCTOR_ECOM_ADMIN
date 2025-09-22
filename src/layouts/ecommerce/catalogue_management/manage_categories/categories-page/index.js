import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftBadge from "components/SoftBadge";
import SoftButton from "components/SoftButton";

// Soft UI Dashboard PRO React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Axios instance
import axiosInstance from "utils/axiosInstance";

// ✅ Reusable StatusBadge component
const StatusBadge = ({ value }) => (
  <SoftBadge
    variant="contained"
    color={value ? "success" : "error"}
    size="xs"
    badgeContent={value ? "Active" : "Inactive"}
    container
  />
);

StatusBadge.propTypes = {
  value: PropTypes.bool.isRequired,
};

function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [categoryData, setCategoryData] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subPage, setSubPage] = useState(1);
  const [subLimit, setSubLimit] = useState(10);
  const [subTotalPages, setSubTotalPages] = useState(1);

  // Fetch category and subcategories
  const fetchCategory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/product/categories/${categoryId}`);
      const data = res.data.data;
      setCategoryData(data);

      const subs = data.child_categories || [];
      setSubcategories(subs);
      setSubTotalPages(Math.ceil(subs.length / subLimit));
    } catch (error) {
      console.error("Failed to fetch category:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const handleSubPageChange = (_, value) => setSubPage(value);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3} px={3} position="relative">
        {/* Show loader if loading */}
        {loading || !categoryData ? (
          <SoftTypography>Loading category...</SoftTypography>
        ) : (
          <Card sx={{ overflow: "visible", position: "relative" }}>
            {/* Back Button */}
            <SoftBox position="absolute" top={16} right={16}>
              <SoftButton
                variant="gradient"
                color="info"
                size="small"
                onClick={() => navigate(-1)}
              >
                ← Back
              </SoftButton>
            </SoftBox>

            <SoftBox p={3}>
              <SoftTypography variant="h5" fontWeight="medium" mb={2}>
                Category: {categoryData.digikey_name}
              </SoftTypography>
              <SoftTypography variant="body2" color="text">
                Semicon Category ID: {categoryData.semicon_category_id} | Total Products:{" "}
                {categoryData.product_count}
              </SoftTypography>

              {/* Subcategories Table */}
              {subcategories.length > 0 ? (
                <SoftBox mt={5}>
                  <SoftTypography variant="h6" fontWeight="medium" mb={2}>
                    Subcategories
                  </SoftTypography>

                  <DataTable
                    table={{
                      columns: [
                        { Header: "SI. NO", accessor: "si_no" },
                        { Header: "Subcategory Name", accessor: "digikey_child_name" },
                        { Header: "Semicon Child ID", accessor: "semicon_child_category_id" },
                        { Header: "Product Count", accessor: "product_count" },
                        { Header: "Status", accessor: "status", Cell: StatusBadge },
                        { Header: "Action", accessor: "action" },
                      ],
                      rows: subcategories
                        .slice((subPage - 1) * subLimit, subPage * subLimit)
                        .map((sub, index) => ({
                          si_no: (subPage - 1) * subLimit + index + 1,
                          digikey_child_name: sub.digikey_child_name,
                          semicon_child_category_id: sub.semicon_child_category_id,
                          product_count: sub.product_count,
                          status: sub.status,
                          action: (
                            <IconButton
                              color="info"
                              size="small"
                              onClick={() =>
                                navigate(
                                  `/ecommerce/catalogue_management/manage_categories/${categoryId}/under-subcategory/${sub.semicon_child_category_id}`
                                )
                              }
                            >
                              <VisibilityIcon />
                            </IconButton>
                          ),
                        })),
                    }}
                    canSearch
                  />

                  <SoftBox display="flex" justifyContent="center" py={2}>
                    <Pagination
                      count={subTotalPages}
                      page={subPage}
                      onChange={handleSubPageChange}
                      shape="rounded"
                      color="info"
                    />
                  </SoftBox>
                </SoftBox>
              ) : (
                <SoftTypography mt={3}>No subcategories found.</SoftTypography>
              )}
            </SoftBox>
          </Card>
        )}
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CategoryPage;
