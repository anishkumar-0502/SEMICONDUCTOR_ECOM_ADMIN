import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";

function FormField({ label, select, children, error, ...rest }) {
  return (
    <SoftBox display="flex" flexDirection="column" flex={1} mb={1}>
      <SoftTypography
        component="label"
        variant="caption"
        fontWeight="bold"
        textTransform="capitalize"
        mb={1}
      >
        {label}
      </SoftTypography>

      {select ? (
        <select
          {...rest}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: error ? "1px solid red" : "1px solid #22c55e",
            outline: "none",
            width: "100%",
          }}
          onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #bbf7d0")}
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        >
          {children}
        </select>
      ) : (
        <input
          {...rest}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: error ? "1px solid red" : "1px solid #22c55e",
            outline: "none",
            width: "100%",
          }}
          onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #bbf7d0")}
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />
      )}

      {error && (
        <SoftTypography variant="caption" color="error" mt={0.5}>
          {error}
        </SoftTypography>
      )}
    </SoftBox>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  select: PropTypes.bool,
  children: PropTypes.node,
  error: PropTypes.string,
};

export default FormField;
