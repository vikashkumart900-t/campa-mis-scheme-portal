import { Box, Paper, Typography } from "@mui/material";

function ProposalStepSection({ stepNumber, title, children }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
    >
      <Typography component="h1" sx={{ mb: 2, color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
        {stepNumber}. {title}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
        {children}
      </Box>
    </Paper>
  );
}

export default ProposalStepSection;