import { Dialog, DialogContent, Box, Button, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function SuccessModal({ open, title, message, onClose, buttonText = "OK" }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)"
        }
      }}
    >
      <DialogContent sx={{ textAlign: "center", py: 4, px: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {/* Success Icon */}
          <CheckCircleIcon
            sx={{
              fontSize: "60px",
              color: "#16a34a",
              backgroundColor: "rgba(22, 163, 74, 0.1)",
              borderRadius: "50%",
              padding: "8px",
              width: "76px",
              height: "76px"
            }}
          />

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              color: "#0f766e",
              fontWeight: 700,
              fontSize: "1.25rem",
              margin: 0
            }}
          >
            {title}
          </Typography>

          {/* Optional Message */}
          {message && (
            <Typography
              sx={{
                color: "#5d6b7a",
                fontSize: "0.95rem",
                lineHeight: 1.5
              }}
            >
              {message}
            </Typography>
          )}

          {/* OK Button */}
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              marginTop: 2,
              backgroundColor: "#16a34a",
              color: "#fff",
              fontWeight: 700,
              padding: "10px 32px",
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "1rem",
              minWidth: "120px",
              "&:hover": {
                backgroundColor: "#15803d"
              }
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
