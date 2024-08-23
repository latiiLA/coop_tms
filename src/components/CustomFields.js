import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useField } from "formik";

const CustomSelect = ({ label, options, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <FormControl
      variant="outlined"
      fullWidth
      error={meta.touched && !!meta.error}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        {...field}
        {...props}
        label={label}
        value={field.value || ""} // Ensure value prop is not undefined
        onChange={(e) => {
          field.onChange(e);
          props.onChange && props.onChange(e);
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {meta.touched && meta.error ? (
        <FormHelperText>{meta.error}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

const CustomTextField = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <TextField
      {...field}
      {...props}
      label={label}
      error={meta.touched && !!meta.error}
      helperText={meta.touched && meta.error}
      variant="outlined"
      fullWidth
    />
  );
};

export { CustomSelect, CustomTextField };
