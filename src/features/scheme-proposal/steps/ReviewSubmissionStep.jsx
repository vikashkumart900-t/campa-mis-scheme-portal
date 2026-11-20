import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Download, Eye, FileText, Info } from "lucide-react";
import { apiUrls } from "../../../api/urls";

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

function ReviewSubmissionStep({ schemeId }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const fetchPdf = async () => {
    const selectedSchemeId = Number(schemeId);
    if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
      throw new Error("The selected scheme is missing a valid scheme ID.");
    }

    const accessToken = sessionStorage.getItem("campaJwt")?.trim();
    if (!accessToken || accessToken.toLowerCase() === "authenticated") {
      throw new Error("Your session is missing an access token. Please sign in again.");
    }

    const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
    const response = await fetch(apiUrls.misGeneratePdf(selectedSchemeId), {
      headers: { Authorization: authorization }
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(responseText || `Unable to generate PDF (status ${response.status}).`);
    }

    const blob = await response.blob();
    if (!blob.size) {
      throw new Error("The PDF service returned an empty file.");
    }
    return blob;
  };

  const openPdfPreview = async () => {
    setPdfError("");
    setPdfLoading(true);
    let previewWindow = null;
    try {
      previewWindow = window.open("", "_blank");
      if (!previewWindow) {
        throw new Error("Your browser blocked the PDF preview window. Please allow pop-ups and try again.");
      }
      const blob = await fetchPdf();
      const objectUrl = URL.createObjectURL(blob);
      previewWindow.location.href = objectUrl;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      setPdfError(error.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadPdf = async () => {
    setPdfError("");
    setPdfLoading(true);
    try {
      const blob = await fetchPdf();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "Proposal_DPR_Preview.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      setPdfError(error.message);
    } finally {
      setPdfLoading(false);
    }
  };

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

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          mb: 2,
          flexWrap: "wrap"
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: 330 },
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 46,
                borderRadius: 0.75,
                background: "#fff",
                display: "grid",
                placeItems: "center",
                flexShrink: 0
              }}
            >
              <FileText size={38} color="#d32f2f" strokeWidth={1.8} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#26384a", lineHeight: 1.2 }}>
                Proposal_DPR_Preview.pdf
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 10, color: "#6b7785", lineHeight: 1.2 }}>
                Size: 11.2 MB &nbsp;|&nbsp; Last updated: Nov 19, 2026 11:42 AM
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
            <Button
              type="button"
              onClick={openPdfPreview}
              disabled={pdfLoading}
              startIcon={<Eye size={14} />}
              sx={{
                flex: 1,
                minHeight: 31,
                px: 1,
                border: "1.5px solid #1f7b67",
                borderRadius: 1,
                color: "#1f7b67",
                background: "#fff",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": { border: "1.5px solid #195d51", background: "#f4faf8" }
              }}
            >
              {pdfLoading ? "Loading PDF..." : "Open PDF Preview"}
            </Button>
            <Button
              type="button"
              onClick={downloadPdf}
              disabled={pdfLoading}
              startIcon={<Download size={14} />}
              sx={{
                flex: 1,
                minHeight: 31,
                px: 1,
                borderRadius: 1,
                background: "#075c3a",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": { background: "#064a30" }
              }}
            >
              Download PDF
            </Button>
          </Box>
          {pdfError ? (
            <Typography role="alert" sx={{ mt: 1, fontSize: 11, color: "error.main" }}>
              {pdfError}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2
        }}
      >
        <FileUploadRow label="Upload Signature" info onFileChange={() => {}} />
        <FileUploadRow label="Upload Supporting Document" optional info onFileChange={() => {}} />
      </Box>
    </Box>
  );
}

export default ReviewSubmissionStep;