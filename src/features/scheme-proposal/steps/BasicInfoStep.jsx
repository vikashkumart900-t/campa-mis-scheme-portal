import { Box, Paper, TextField, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 13 },
  "& .MuiInputLabel-root": { fontSize: 13 }
};

function FormField({ id, label, required = false, children }) {
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        sx={{ display: "block", mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}
      >
        {label} {required && <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>}
      </Typography>
      {children}
    </Box>
  );
}

function BasicInfoStep() {
  const {
    register,
    formState: { errors }
  } = useFormContext();

  const getFieldProps = (name, rules = {}) => {
    const fieldError = errors[name];
    return {
      ...register(name, rules),
      error: Boolean(fieldError),
      helperText: fieldError?.message
    };
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{ mb: 1.5, p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
      >
        <Typography component="h1" sx={{ mb: 2, color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
          1. Basic Scheme Information
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          <FormField id="schemeName" label="1.1 Name of the Scheme" required>
            <TextField
              id="schemeName"
              placeholder="Name of the Scheme"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("schemeName", { required: "Scheme name is required." })}
            />
          </FormField>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{ mb: 1.5, p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
      >
        <Typography component="h2" sx={{ mb: 2, color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
          2. Nodal Officer Details
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          <FormField id="organizationName" label="2.1 Name of Implementing Agency">
            <TextField id="organizationName" fullWidth size="small" sx={inputSx} {...getFieldProps("organizationName")} />
          </FormField>
          <FormField id="officerName" label="2.2 Name of the Nodal Officer of Implementing Agency">
            <TextField id="officerName" fullWidth size="small" sx={inputSx} {...getFieldProps("officerName")} />
          </FormField>
          <FormField id="designation" label="2.3 Designation">
            <TextField id="designation" fullWidth size="small" sx={inputSx} {...getFieldProps("designation")} />
          </FormField>
          <FormField id="email" label="2.4 Email ID">
            <TextField
              id="email"
              type="email"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("email", {
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." }
              })}
            />
          </FormField>
          <FormField id="mobile" label="2.5 Phone No">
            <TextField id="mobile" type="tel" fullWidth size="small" sx={inputSx} {...getFieldProps("mobile")} />
          </FormField>
          <FormField id="aadhaarNumber" label="2.6 Aadhaar No." required>
            <TextField
              id="aadhaarNumber"
              type="password"
              placeholder="Enter 12-digit Aadhaar number"
              inputProps={{ inputMode: "numeric", maxLength: 12, autoComplete: "off" }}
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("aadhaarNumber", {
                required: "Aadhaar number is required.",
                pattern: { value: /^[0-9]{12}$/, message: "Enter a 12-digit Aadhaar number." }
              })}
            />
          </FormField>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{ mb: 1.5, p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
      >
        <Typography component="h2" sx={{ mb: 2, color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
          3. Scheme Details
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          <FormField id="dateOfProposal" label="3.1 Date of Proposal">
            <TextField id="dateOfProposal" type="date" fullWidth size="small" sx={inputSx} {...getFieldProps("dateOfProposal")} />
          </FormField>
          <FormField id="expectedCompletionDate" label="3.2 Expected Completion Date" required>
            <TextField
              id="expectedCompletionDate"
              type="date"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("expectedCompletionDate", { required: "Expected completion date is required." })}
            />
          </FormField>
          <FormField id="proposedFinancialOutlay" label="3.3 Proposed Financial Outlay (Rs. in Lakhs)" required>
            <TextField
              id="proposedFinancialOutlay"
              type="number"
              inputProps={{ min: 0, step: "any" }}
              placeholder="Enter amount in lakhs"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("proposedFinancialOutlay", {
                required: "Financial outlay is required.",
                valueAsNumber: true,
                min: { value: 0, message: "Financial outlay cannot be negative." }
              })}
            />
          </FormField>
          <FormField id="schemeDuration" label="3.4 Scheme Duration">
            <TextField
              id="schemeDuration"
              placeholder="Enter duration (e.g., 5 years)"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("schemeDuration")}
            />
          </FormField>
        </Box>
      </Paper>
    </>
  );
}

export default BasicInfoStep;