import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Soft UI Dashboard PRO React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// Axios instance
import axiosInstance from "utils/axiosInstance";

// ✅ Cell renderers
const StatusCellRenderer = ({ value }) => (
  <SoftBadge
    variant="contained"
    color={value ? "success" : "error"}
    size="xs"
    badgeContent={value ? "Active" : "Inactive"}
    container
  />
);
StatusCellRenderer.propTypes = {
  value: PropTypes.bool.isRequired,
};

function CategorysList() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState({
    columns: [
      { Header: "SI. NO", accessor: "si_no", width: "10%" },
      { Header: "Category Name", accessor: "digikey_name", width: "30%" },
      { Header: "Semicon Category ID", accessor: "semicon_category_id" },
      { Header: "Product Count", accessor: "product_count" },
      { Header: "Status", accessor: "status", Cell: StatusCellRenderer },
      { Header: "Action", accessor: "action" },
    ],
    rows: [],
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async (pageNum = page, pageLimit = limit) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/product/categories/all/index?page=${pageNum}&limit=${pageLimit}`
      );

      const { categories, total_pages } = res.data.data;

      const rows = categories.map((cat, index) => ({
        si_no: (pageNum - 1) * pageLimit + index + 1,
        digikey_name: cat.digikey_name,
        semicon_category_id: cat.semicon_category_id,
        product_count: cat.product_count,
        status: cat.status,
        action: (
          <IconButton
            color="info"
            size="small"
            onClick={() =>
              navigate(
                `/ecommerce/catalogue_management/manage_categories/category-page/${cat.semicon_category_id}`
              )
            }
          >
            <VisibilityIcon />
          </IconButton>
        ),
      }));

      
      setTableData((prev) => ({ ...prev, rows }));
      setTotalPages(total_pages);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page, limit);
  }, [page, limit]);

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox my={3}>
        <Card>
          <SoftBox display="flex" justifyContent="space-between" alignItems="flex-start" p={3}>
            <SoftBox lineHeight={1}>
              <SoftTypography variant="h5" fontWeight="medium">
                All Categories
              </SoftTypography>
              <SoftTypography variant="button" fontWeight="regular" color="text">
                Category management dashboard showing all available categories.
              </SoftTypography>
            </SoftBox>
          </SoftBox>

          {loading ? (
            <SoftBox p={3}>
              <SoftTypography>Loading categories...</SoftTypography>
            </SoftBox>
          ) : (
            <DataTable
              table={tableData}
              entriesPerPage={false}   // 🔥 disable internal pagination
              canSearch
            />
          )}

          <SoftBox display="flex" justifyContent="center" py={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              shape="rounded"
              color="info"
            />
          </SoftBox>
        </Card>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CategorysList;
