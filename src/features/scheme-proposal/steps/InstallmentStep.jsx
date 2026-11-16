import { Box, Typography } from "@mui/material";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[6];

function InstallmentStep() {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2, pb: 1.5, borderBottom: "1px solid #e8d7a4" }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "1.5px solid #1b8d63",
            background: "#dfeee5",
            display: "grid",
            placeItems: "center",
            flexShrink: 0
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#1b8d63" }} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#132e4c", lineHeight: 1.2 }}>
          {step.label} Report
        </Typography>
      </Box>

      <Typography
        sx={{
          mb: 2.5,
          color: "#425162",
          fontSize: 12,
          fontWeight: 400,
          lineHeight: 1.5
        }}
      >
        Please provide the installments yet to be released (New) and the bank details.
      </Typography>

      <Box
        sx={{
          width: "100%",
          border: "1px solid #e3c98e",
          borderRadius: 2,
          background: "#f6ebd1",
          px: { xs: 2, md: 3 },
          py: 2,
          minHeight: 78,
          display: "flex",
          alignItems: "center"
        }}
      >
        <Typography
          sx={{
            color: "#3a3d42",
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.5
          }}
        >
          Please complete the proposal and click <Typography component="span" sx={{ fontWeight: 700, color: "#1c2430" }}>Proceed to Installment Report</Typography> to save it before adding installments.
        </Typography>
      </Box>
    </Box>
  );
}

export default InstallmentStep;