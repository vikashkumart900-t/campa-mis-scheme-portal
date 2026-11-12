import { Box, TextField, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 13 },
  "& .MuiInputLabel-root": { fontSize: 13 }
};

function ProposalUsernameField({ name, required = true }) {
  const {
    register,
    formState: { errors }
  } = useFormContext();
  const fieldError = name.split(".").reduce((value, key) => value?.[key], errors);
  const fieldId = name.replace(/\./g, "-");
  const validationRules = required ? { required: "Username is required." } : {};

  return (
    <Box>
      <Typography
        component="label"
        htmlFor={fieldId}
        sx={{ display: "block", mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}
      >
        Username {required && <Box component="span" sx={{ color: "#d32f2f" }}></Box>}
      </Typography>
      <TextField
        id={fieldId}
        placeholder="Enter username"
        autoComplete="off"
        fullWidth
        size="small"
        sx={inputSx}
        error={Boolean(fieldError)}
        helperText={fieldError?.message}
        {...register(name, validationRules)}
      />
    </Box>
  );
}

export default ProposalUsernameField;