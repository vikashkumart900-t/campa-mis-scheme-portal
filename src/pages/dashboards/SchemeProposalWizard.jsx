import { useRef, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from "@mui/material";

const steps = [
  "Basic Info",
  "Objectives & Funding",
  "Deliverables",
  "Evaluation & Research",
  "Documents & Employment",
  "Tech, Exit & Declaration",
  "Installment",
  "Review & Final Submission"
];

const schemeCategories = [
  "Forest Conservation",
  "Wildlife Conservation",
  "Eco-restoration",
  "Other"
];

const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 13 },
  "& .MuiInputLabel-root": { fontSize: 13 }
};

function FormField({ label, required = false, children }) {
  return (
    <Box>
      <Typography
        component="label"
        sx={{ display: "block", mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}
      >
        {label} {required && <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>}
      </Typography>
      {children}
    </Box>
  );
}

function SchemeProposalWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [basicInfoSaved, setBasicInfoSaved] = useState(false);
  const formRef = useRef(null);

  const goToNextStep = (event) => {
    event.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    setActiveStep((currentStep) => Math.min(currentStep + 1, steps.length - 1));
  };

  const saveAndGoToNextStep = (event) => {
    event.preventDefault();
    if (!formRef.current?.reportValidity()) return;
    setBasicInfoSaved(true);
    setActiveStep((currentStep) => Math.min(currentStep + 1, steps.length - 1));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7f9", p: { xs: 1, md: 1.5 } }}>
      <Box
        aria-label="Proposal form steps"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(8, minmax(145px, 1fr))", lg: "repeat(8, minmax(0, 1fr))" },
          gap: 0.5,
          mb: 1.5,
          overflowX: "auto",
          p: 0.5,
          border: "1px solid #e0e4ea",
          borderRadius: 2,
          bgcolor: "#fff"
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isReview = index === steps.length - 1;
          return (
            <Box
              key={step}
              aria-current={isActive ? "step" : undefined}
              sx={{
                display: "flex",
                minHeight: 50,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.25,
                border: "1px solid",
                borderColor: isActive ? "#80c6e8" : isReview ? "#b9ebc8" : "#f2df9e",
                borderRadius: 1,
                bgcolor: isActive ? "#e1f3fc" : isReview ? "#e0f9e8" : "#fffbed",
                color: isActive ? "#005e91" : isReview ? "#087638" : "#a95800",
                textAlign: "center"
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  width: 20,
                  height: 20,
                  placeItems: "center",
                  borderRadius: "50%",
                  bgcolor: isActive ? "#0785c2" : isReview ? "#18a64c" : "#f49a00",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                {index + 1}
              </Box>
              <Typography sx={{ fontSize: 9, lineHeight: 1.15, whiteSpace: "nowrap" }}>{step}</Typography>
            </Box>
          );
        })}
      </Box>

      <Box
        ref={formRef}
        component="form"
        onChange={() => setBasicInfoSaved(false)}
        onSubmit={saveAndGoToNextStep}
        sx={{ display: activeStep === 0 ? "block" : "none" }}
      >
          <Paper
            elevation={0}
            sx={{ mb: 1.5, p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
          >
            <Typography component="h1" sx={{ mb: 2, color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
              1. Basic Scheme Information
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
              <FormField label="1.1 Name of the Scheme" required>
                <TextField name="schemeName" placeholder="Name of the Scheme" required fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="1.2 Scheme Category" required>
                <FormControl fullWidth required size="small" sx={inputSx}>
                  <InputLabel id="scheme-category-label">Select Category</InputLabel>
                  <Select labelId="scheme-category-label" name="schemeCategory" label="Select Category" defaultValue="">
                    {schemeCategories.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
                  </Select>
                </FormControl>
              </FormField>
              <FormField label="1.3 Scheme Type" required>
                <FormControl fullWidth required size="small" sx={inputSx}>
                  <Select name="schemeType" defaultValue="New">
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Continuation">Continuation</MenuItem>
                  </Select>
                </FormControl>
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
              <FormField label="2.1 Name of Implementing Agency">
                <TextField name="implementingAgency" fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="2.2 Name of the Nodal Officer of Implementing Agency">
                <TextField name="nodalOfficerName" fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="2.3 Designation">
                <TextField name="designation" fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="2.4 Email ID">
                <TextField name="email" type="email" fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="2.5 Phone No">
                <TextField name="phone" type="tel" fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="2.6 Aadhaar No." required>
                <TextField
                  name="aadhaarNumber"
                  type="password"
                  placeholder="Enter 12-digit Aadhaar number"
                  required
                  inputProps={{ inputMode: "numeric", maxLength: 12, pattern: "[0-9]{12}", autoComplete: "off" }}
                  fullWidth
                  size="small"
                  sx={inputSx}
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
              <FormField label="3.1 Name of the Scheme">
                <TextField name="detailedSchemeName" placeholder="Enter detailed scheme name" fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="3.2 Date of Proposal">
                <TextField name="proposalDate" type="date" fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="3.3 Expected Completion Date" required>
                <TextField name="expectedCompletionDate" type="date" required fullWidth size="small" sx={inputSx} />
              </FormField>
              <FormField label="3.4 Proposed Financial Outlay (Rs. in Lakhs)" required>
                <TextField
                  name="financialOutlay"
                  type="number"
                  required
                  inputProps={{ min: 0, step: "any" }}
                  placeholder="Enter amount in lakhs"
                  fullWidth
                  size="small"
                  sx={inputSx}
                />
              </FormField>
              <FormField label="3.5 Scheme Duration">
                <TextField name="schemeDuration" placeholder="Enter duration (e.g., 5 years)" fullWidth size="small" sx={inputSx} />
              </FormField>
            </Box>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, borderTop: "1px solid #e0e4ea", pt: 1.5 }}>
            <Button type="button" variant="outlined" onClick={goToNextStep} sx={{ textTransform: "none", fontSize: 12 }}>
              Next
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: "#009b43", fontSize: 12, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#087f3d" } }}
            >
              Save &amp; Next
            </Button>
          </Box>
      </Box>
      {activeStep > 0 && (
        <Paper
          elevation={0}
          sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
        >
          <Typography component="h1" sx={{ color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
            {activeStep + 1}. {steps[activeStep]}
          </Typography>
          <Typography sx={{ mt: 1, color: "#65736b", fontSize: 13 }}>
            This step will be added when you provide its form fields.
          </Typography>
          {activeStep === 1 && basicInfoSaved && (
            <Typography role="status" sx={{ mt: 1, color: "#087638", fontSize: 12 }}>
              Basic Info saved for this wizard session.
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button variant="outlined" onClick={() => setActiveStep((currentStep) => currentStep - 1)} sx={{ textTransform: "none" }}>
              Previous
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={() => setActiveStep((currentStep) => currentStep + 1)} sx={{ textTransform: "none" }}>
                Next
              </Button>
            ) : (
              <Button variant="contained" disabled sx={{ textTransform: "none" }}>
                Submit
              </Button>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default SchemeProposalWizard;
