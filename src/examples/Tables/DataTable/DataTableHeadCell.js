import PropTypes from "prop-types";

// @mui material icons (SVG based, scalable!)
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard PRO React components
import SoftBox from "components/SoftBox";

// Soft UI Dashboard PRO React base styles
import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";

function DataTableHeadCell({
  width = "auto",
  children,
  sorted = "none",
  align = "center", // default center
  sx: customSx,
  ...rest
}) {
  const { light } = colors;
  const { borderWidth } = borders;

  return (
   <SoftBox
  component="th"
  width={width}
  borderBottom={`${borderWidth[1]} solid ${light.main}`}
  py={1.5}
  px={3}
  sx={{ textAlign: align }}
>
  <SoftBox
    {...rest}
    display="flex"               // <-- use flex, not inline-flex
    alignItems="center"
    justifyContent={align === "right" ? "flex-end" : align === "left" ? "flex-start" : "center"}
    color="secondary"
    opacity={0.7}
    sx={{
      fontSize: "0.75rem",
      fontWeight: 600,
      cursor: sorted && "pointer",
      userSelect: sorted && "none",
      gap: "4px",                // <-- add spacing between text and icon
      ...customSx,
    }}
  >
    <SoftBox
      component="span"
      sx={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textTransform: "uppercase",
      }}
    >
      {children}
    </SoftBox>

    {sorted && (
      <SoftBox display="flex" flexDirection="column" lineHeight={1} mt={-0.3}>
        <ArrowDropUpIcon
          fontSize="small"
          color={sorted === "asce" ? "action" : "disabled"}
          style={{ marginBottom: "-6px" }}
        />
        <ArrowDropDownIcon
          fontSize="small"
          color={sorted === "desc" ? "action" : "disabled"}
        />
      </SoftBox>
    )}
  </SoftBox>
</SoftBox>

  );
}

DataTableHeadCell.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node.isRequired,
  sorted: PropTypes.oneOf([false, "none", "asce", "desc"]),
  align: PropTypes.oneOf(["left", "right", "center"]),
  sx: PropTypes.object,
};

export default DataTableHeadCell;
