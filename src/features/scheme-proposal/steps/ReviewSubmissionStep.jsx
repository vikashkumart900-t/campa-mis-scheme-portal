import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Info } from "lucide-react";

const uploadBoxSx = {
  display: "flex",
  alignItems: "center",
  minHeight: 42,
  overflow: "hidden",
  border: "1px solid #d7dfe6",
  borderRadius: 1,
  background: "#fff",
  width: "100%",
  maxWidth: 780,
  boxSizing: "border-box"
};

const uploadButtonSx = {
  height: 42,
  px: 1.75,
  borderRadius: 0,
  borderRight: "1px solid #d7dfe6",
  background: "#f2f5f8",
  color: "#24374d",
  fontSize: 12,
  fontWeight: 500,
  textTransform: "none",
  minWidth: 104,
  whiteSpace: "nowrap",
  '&:hover': { background: "#eceff3" }
};

function FileUploadRow({ label, optional = false, info = false, onFileChange }) {
  const [fileName, setFileName] = useState("");
  const inputId = `${label.toLowerCase().replace(/\s+/g, "-")}-upload`;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#344457", textTransform: "uppercase", letterSpacing: "0.01em" }}>{label}</Typography>
        {optional ? (
          <Typography component="span" sx={{ fontSize: 12, color: "#4d5764" }}>(optional)</Typography>
        ) : null}
        {info ? (
          <Box
            component="span"
            title={
              label === "Upload Signature"
                ? "Upload your signature in png format"
                : "Upload multiple files (.pdf, .doc, .docx, images)"
            }
            sx={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#1e88e5",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              ml: 0.5,
              cursor: "help"
            }}
          >
            <Info size={11} />
          </Box>
        ) : null}
      </Box>

      <Box sx={uploadBoxSx}>
        <Button component="label" htmlFor={inputId} sx={uploadButtonSx}>
          Choose File
          <input
            id={inputId}
            type="file"
            hidden
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              const nextName = selectedFile ? selectedFile.name : "";
              setFileName(nextName);
              onFileChange?.(selectedFile);
            }}
          />
        </Button>
        <Typography
          sx={{
            px: 1.5,
            color: "#4d5b6b",
            fontSize: 14,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
          aria-live="polite"
        >
          {fileName || "No file chosen"}
        </Typography>
      </Box>
    </Box>
  );
}

function ReviewSubmissionStep() {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5, pb: 1.5, borderBottom: "1px solid #ecdfb8" }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#e7f5ef",
            border: "1.5px solid #1f8d68",
            display: "grid",
            placeItems: "center",
            flexShrink: 0
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", background: "#1f8d68" }} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#132e4c", lineHeight: 1.2 }}>
          Review & Final Submission
        </Typography>
      </Box>

      <Typography sx={{ fontSize: 12, color: "#425162", mb: 2.5, lineHeight: 1.6 }}>
        Please review all the entries above before submitting. Use the "Previous" button to visit previous sections if any corrections are needed.
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        <Box sx={{ width: 18, height: 18, borderRadius: "50%", background: "#d52d2d", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>
          !
        </Box>
        <Typography sx={{ fontSize: 12, color: "#d52d2d", fontWeight: 700 }}>
          Note: Submitting from this section will perform the final submission of your scheme.
        </Typography>
      </Box>

      <FileUploadRow label="Upload Signature" info onFileChange={() => {}} />
      <FileUploadRow label="Upload Supporting Document" optional info onFileChange={() => {}} />
    </Box>
  );
}

export default ReviewSubmissionStep;