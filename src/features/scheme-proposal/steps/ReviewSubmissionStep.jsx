import { useEffect, useState } from "react";
import { Box, Button, Typography, FormHelperText } from "@mui/material";
import { Download, Eye, FileText, Info } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { apiUrls } from "../../../api/urls";
import { fetchProposalPdf, openProposalPdfPreview } from "../../../api/proposalPdf";

function base64ToFile(fileName, fileData) {
  if (!fileData) return null;

  const dataUrlMatch = fileData.match(/^data:([^;,]+)?;base64,([\s\S]*)$/);
  let base64 = (dataUrlMatch ? dataUrlMatch[2] : fileData)
    .replace(/\s/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";

  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeType = dataUrlMatch?.[1] || ({
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg"
  })[extension] || "application/octet-stream";

  return new File([bytes], fileName, { type: mimeType });
}

function FileUploadRow({ label, fieldName, optional = false, info = false, error }) {
  const { register, watch } = useFormContext();
  const inputId = `${fieldName}-upload`;
  const fileList = watch(fieldName);
  const fileName = fileList?.[0]?.name || "";

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
        <Typography component="label" htmlFor={inputId} sx={{ fontSize: 10, fontWeight: 700, color: "#344457", textTransform: "uppercase" }}>
          {label}
          {!optional && <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>}
        </Typography>
        {optional ? (
          <Typography component="span" sx={{ fontSize: 10, color: "#4d5764" }}>(optional)</Typography>
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
              cursor: "help"
            }}
          >
            <Info size={11} />
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "flex",
          minHeight: 34,
          alignItems: "center",
          overflow: "hidden",
          border: `1px solid ${error ? "#d32f2f" : "#cfd7e2"}`,
          borderRadius: 1,
          bgcolor: "#fff"
        }}
      >
        <Button
          component="label"
          htmlFor={inputId}
          sx={{
            height: 34,
            px: 1.5,
            borderRight: `1px solid ${error ? "#d32f2f" : "#cfd7e2"}`,
            borderRadius: 0,
            color: "#132e4c",
            bgcolor: "#f1f4f8",
            fontSize: 11,
            textTransform: "none",
            whiteSpace: "nowrap"
          }}
        >
          Choose File
          <input
            id={inputId}
            type="file"
            hidden
            {...register(fieldName, {
              required: !optional ? `${label} is required.` : false
            })}
          />
        </Button>
        <Typography
          aria-live="polite"
          sx={{
            overflow: "hidden",
            px: 1.25,
            color: "#344457",
            fontSize: 11,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {fileName || "No file chosen"}
        </Typography>
      </Box>
      {error && <FormHelperText error>{error.message}</FormHelperText>}
    </Box>
  );
}

function ReviewSubmissionStep({ schemeId }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [finalDocumentsLoadError, setFinalDocumentsLoadError] = useState("");
  const { getValues, setValue, formState: { errors } } = useFormContext();

  useEffect(() => {
    if (!schemeId || schemeId === "authenticated") return undefined;

    const controller = new AbortController();
    const loadFinalDocuments = async () => {
      try {
        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }

        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const response = await fetch(apiUrls.finalDocuments(schemeId), {
          signal: controller.signal,
          headers: { Authorization: authorization }
        });
        if (!response.ok) {
          throw new Error((await response.text()) || `Request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("The final documents API returned unexpected data.");
        }
        if (controller.signal.aborted) return;

        const signatureFile = base64ToFile(data.signatureFileName || "signature", data.signatureFileData);
        const supportingDocument = base64ToFile(data.supportingDocumentName || "supporting-document", data.supportingDocumentData);
        if (signatureFile && !getValues("signatureFile")?.length) {
          setValue("signatureFile", [signatureFile], { shouldDirty: false });
        }
        if (supportingDocument && !getValues("supportingDocument")?.length) {
          setValue("supportingDocument", [supportingDocument], { shouldDirty: false });
        }
        setFinalDocumentsLoadError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching final documents:", error);
          setFinalDocumentsLoadError(`Unable to load final documents: ${error.message}`);
        }
      }
    };

    loadFinalDocuments();
    return () => controller.abort();
  }, [getValues, schemeId, setValue]);

  const openPdfPreview = async () => {
    setPdfError("");
    setPdfLoading(true);
    try {
      await openProposalPdfPreview(schemeId);
    } catch (error) {
      setPdfError(error.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadPdf = async () => {
    setPdfError("");
    setPdfLoading(true);
    try {
      const blob = await fetchProposalPdf(schemeId);
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
        <FileUploadRow
          label="Upload Signature"
          fieldName="signatureFile"
          info
          error={errors.signatureFile}
        />
        <FileUploadRow
          label="Upload Supporting Document"
          fieldName="supportingDocument"
          optional
          info
          error={errors.supportingDocument}
        />
      </Box>
      {finalDocumentsLoadError && (
        <Typography role="alert" sx={{ mt: 1, fontSize: 11, color: "error.main" }}>
          {finalDocumentsLoadError}
        </Typography>
      )}
    </Box>
  );
}

export default ReviewSubmissionStep;