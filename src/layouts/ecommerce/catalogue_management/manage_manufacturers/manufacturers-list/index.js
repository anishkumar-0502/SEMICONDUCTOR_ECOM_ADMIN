import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// @mui
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Icon from "@mui/material/Icon";

// Soft UI
import SoftTypography from "components/SoftTypography";
import SoftButton from "components/SoftButton";
import SoftInput from "components/SoftInput";

// Layouts
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import axiosInstance from "utils/axiosInstance";

function ManufacturersList() {
  const [dataByLetter, setDataByLetter] = useState({});
  const [loadingLetters, setLoadingLetters] = useState({});
  const [selectedLetter, setSelectedLetter] = useState("A"); // default A
  const [searchQuery, setSearchQuery] = useState("");

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const fetchManufacturersByLetter = async (letter) => {
    if (dataByLetter[letter]) return; // already fetched
    setLoadingLetters((prev) => ({ ...prev, [letter]: true }));
    try {
      const res = await axiosInstance.get(
        `/product/manufacturer/filter?startsWith=${letter}`
      );
      setDataByLetter((prev) => ({
        ...prev,
        [letter]: res.data?.data || [],
      }));
    } catch {
      setDataByLetter((prev) => ({
        ...prev,
        [letter]: [],
      }));
    } finally {
      setLoadingLetters((prev) => ({ ...prev, [letter]: false }));
    }
  };

  useEffect(() => {
    fetchManufacturersByLetter("A"); // fetch A initially
  }, []);

  const manufacturers = dataByLetter[selectedLetter] || [];
  const isLoading = loadingLetters[selectedLetter];

  // Client-side filter on the loaded list
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredManufacturers = normalizedQuery
    ? manufacturers.filter((m) =>
        String(m.manufacturer_name || "").toLowerCase().includes(normalizedQuery)
      )
    : manufacturers;

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box my={3} px={3}>
        <Card sx={{ p: 3 }}>
          {/* 🔎 Search box aligned right */}
       <Box
  mb={2}
  display="flex"
  justifyContent="flex-end"
  alignItems="center"
>
  <Box sx={{ width: 330 }}>
    <SoftInput
      fullWidth
      placeholder="Search..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </Box>
</Box>
          {/* 🔹 Global A–Z strip */}
          <Box display="flex" justifyContent="center" flexWrap="wrap" mb={3}>
            {letters.map((ltr) => (
              <SoftButton
                key={ltr}
                variant={ltr === selectedLetter ? "gradient" : "outlined"}
                size="small"
                color="info"
                sx={{
                  mx: 0.5,
                  fontSize: "0.75rem",
                  minWidth: "32px",
                  p: "4px",
                }}
                onClick={() => {
                  setSelectedLetter(ltr);
                  setSearchQuery(""); // reset search when switching letter
                  fetchManufacturersByLetter(ltr);
                }}
              >
                {ltr}
              </SoftButton>
            ))}
          </Box>

          {/* Content */}
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : filteredManufacturers.length === 0 ? (
            <SoftTypography variant="button" color="text" fontSize="0.8rem">
              No manufacturers found
            </SoftTypography>
          ) : (
            <Grid container spacing={2}>
              {Array.from(
                { length: Math.ceil(filteredManufacturers.length / 18) },
                (_, colIndex) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={colIndex}>
                    <List disablePadding>
                      {filteredManufacturers
                        .slice(colIndex * 18, colIndex * 18 + 18)
                        .map((mfr) => (
                          <ListItem
                            key={mfr.semicon_manufacturer_id}
                            disablePadding
                            sx={{ mb: 0.5 }}
                          >
                            <Link
                              to={`/ecommerce/catalogue_management/manage_manufacturers/${mfr.semicon_manufacturer_id}`}
                              style={{ textDecoration: "none", width: "100%" }}
                            >
                              <ListItemText
                                primary={mfr.manufacturer_name}
                                primaryTypographyProps={{
                                  fontSize: "0.85rem", // smaller font
                                }}
                                sx={{
                                  padding: "4px 8px",
                                  "&:hover": {
                                    backgroundColor: "#f5f5f5",
                                    borderRadius: "4px",
                                  },
                                }}
                              />
                            </Link>
                          </ListItem>
                        ))}
                    </List>
                  </Grid>
                )
              )}
            </Grid>
          )}
        </Card>
      </Box>

      <Footer />
    </DashboardLayout>
  );
}

export default ManufacturersList;

