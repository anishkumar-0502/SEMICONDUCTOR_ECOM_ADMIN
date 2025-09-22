import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <SoftBox
     width="100%"
      display="flex"
      flexDirection={{ xs: "column", lg: "row" }}
      justifyContent="center"
      alignItems="center"
      px={1.5}
    >
      <SoftTypography variant="body2" color="text" textAlign="center">
        <strong>&copy; {year} Semiconspace</strong>. All rights reserved.
      </SoftTypography>
    </SoftBox>
  );
}
