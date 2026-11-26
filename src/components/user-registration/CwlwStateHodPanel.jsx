import { useState } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import CwlwUserRegistrationDialog from "./CwlwUserRegistrationDialog";

export default function CwlwStateHodPanel() {
  const [registrationOpen, setRegistrationOpen] = useState(false);

  return (
    <Box>
      <Paper
        component="section"
        elevation={0}
        sx={{
          maxWidth: 480,
          p: 2.5,
          border: "1px solid #e1e9e3",
          borderRadius: 2,
          bgcolor: "#fff",
          boxShadow: "0 2px 8px rgba(31, 56, 44, 0.06)"
        }}
      >
        <Typography sx={{ mb: 2, color: "#174b35", fontSize: 15, fontWeight: 700 }}>
          CWLW/STATE HOD PANEL
        </Typography>
        <Button
          type="button"
          variant="contained"
          onClick={() => setRegistrationOpen(true)}
          sx={{ bgcolor: "#174b35", textTransform: "none", "&:hover": { bgcolor: "#286347" } }}
        >
          Register User
        </Button>
      </Paper>
      <CwlwUserRegistrationDialog
        open={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
      />
    </Box>
  );
}
