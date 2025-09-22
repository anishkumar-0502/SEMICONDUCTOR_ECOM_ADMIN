import { useEffect, useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Pagination from "@mui/material/Pagination";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftBadge from "components/SoftBadge";

// Soft UI Dashboard PRO React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import CreatableSelect from "react-select/creatable"; 

// Custom components
import ActionCell from "./components/ActionCell";

// Axios instance
import axiosInstance from "utils/axiosInstance";

// ✅ Status Cell
const StatusCellRenderer = ({ value }) =>
  value === "in stock" ? (
    <SoftBadge variant="contained" color="success" size="xs" badgeContent="in stock" container />
  ) : (
    <SoftBadge variant="contained" color="error" size="xs" badgeContent="out of stock" container />
  );

StatusCellRenderer.propTypes = {
  value: PropTypes.string.isRequired,
};

// ✅ Image Cell
const ImageCellRenderer = ({ value }) => (
  <img
    src={value}
    alt="product"
    style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
  />
);

ImageCellRenderer.propTypes = {
  value: PropTypes.string.isRequired,
};

function ProductsList() {
  const [tableData, setTableData] = useState({
    columns: [
      { Header: "SI. NO", accessor: "si_no", width: "10%" },
      { Header: "Image", accessor: "image", width: "10%", Cell: ImageCellRenderer },
      { Header: "Product Name", accessor: "name", width: "25%" },
      { Header: "Category", accessor: "category" },
      { Header: "Price (INR)", accessor: "price" },
      { Header: "Manufacturer Part Number", accessor: "manufacturerPartNumber" },
      { Header: "Manufacturer Name", accessor: "manufacturer_name" },
      { Header: "Quantity", accessor: "quantity" },
      { Header: "Status", accessor: "status", Cell: StatusCellRenderer },
      { Header: "Created Date", accessor: "created_date" },
      { Header: "Action", accessor: "action" },
    ],
    rows: [],
  });

  const [allRows, setAllRows] = useState([]); // 🔹 Keep original data for searching
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Fetch products
  const fetchProducts = async (pageNum = page, pageLimit = limit) => {
    try {
      const response = await axiosInstance.get(
        `/product/fetch/all-products?page=${pageNum}&limit=${pageLimit}`
      );

      const { products, total_pages } = response.data.data;

      const rows = products.map((product, index) => ({
        si_no: (pageNum - 1) * pageLimit + index + 1,
        image: product.image_url,
        name: product.name,
        category: product.category_name,
        price: `₹ ${(product.UnitPrice * 83.5).toFixed(3)}`,
        manufacturerPartNumber: product.manufacturerPartNumber,
        manufacturer_name: product.manufacturer_name,
        quantity: product.quantity_available,
        status: product.quantity_available > 0 ? "in stock" : "out of stock",
        created_date: new Date(product.created_date).toLocaleString("en-IN"),
        action: <ActionCell semiconPartNumber={product.semicon_part_number} />,
      }));

      setAllRows(rows); // keep unfiltered rows
      setTableData((prev) => ({ ...prev, rows }));
      setTotalPages(total_pages);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts(page, limit);
  }, [page, limit]);

  // 🔹 Handle pagination
  const handlePageChange = (_, value) => {
    setPage(value);
  };

  // 🔹 Handle search
  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase();
    if (!search) {
      setTableData((prev) => ({ ...prev, rows: allRows }));
      return;
    }

    const filteredRows = allRows.filter(
      (row) =>
        row.name.toLowerCase().includes(search) ||
        row.category.toLowerCase().includes(search) ||
        row.manufacturer_name?.toLowerCase().includes(search) ||
        row.manufacturerPartNumber?.toLowerCase().includes(search)
    );

    setTableData((prev) => ({ ...prev, rows: filteredRows }));
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox my={3}>
        <Card>
          {/* 🔹 Top bar with Title + Search */}
          <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
            <SoftBox lineHeight={1}>
              <SoftTypography variant="h5" fontWeight="medium">
                All Products
              </SoftTypography>
              <SoftTypography variant="button" fontWeight="regular" color="text">
                Product management dashboard showing all available products.
              </SoftTypography>
            </SoftBox>

            {/* Search Box */}
            <input
              type="text"
              placeholder="Search products..."
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #22c55e",
                minWidth: "250px",
                height: "45px",
              }}
              onChange={handleSearch}
            />
          </SoftBox>

          {/* Data Table */}
          <DataTable
            table={tableData}
            entriesPerPage={{
              defaultValue: limit,
              entries: [5, 7, 10, 15, 20, 25, 50, 100],
                isSearchable: false   // or false

            }}
            onEntriesChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />

          {/* Pagination */}
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

export default ProductsList;
