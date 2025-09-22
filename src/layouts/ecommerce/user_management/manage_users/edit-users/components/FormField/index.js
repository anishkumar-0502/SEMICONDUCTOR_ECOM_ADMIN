import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftInput from "components/SoftInput";

function FormField({ label, error, helperText, ...rest }) {
  return (
    <>
      <SoftBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
        <SoftTypography
          component="label"
          variant="caption"
          fontWeight="bold"
          textTransform="capitalize"
        >
          {label}
        </SoftTypography>
      </SoftBox>
      <SoftInput
        {...rest}
        error={!!error} // mark input red if error exists
        helperText={helperText} // show helper text below input
        sx={{
          borderColor: error ? "#f44336" : undefined, // red border for error
          "&:hover": {
            borderColor: error ? "#f44336" : undefined,
          },
        }}
      />
      {error && (
        <SoftTypography variant="caption" color="error" ml={0.5} mt={0.5} display="block">
          {helperText}
        </SoftTypography>
      )}
    </>
  );
}

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
  helperText: PropTypes.string,
};

export default FormField;
