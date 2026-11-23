import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { Info, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { apiUrls } from "../../../api/urls";
import { getFinancialYears } from "../utils/financialYears";

const sectionSx = {
  mb: 1.5,
  p: { xs: 2, md: 2.5 },
  border: "1px solid #e0e4ea",
  borderRadius: 2,
  bgcolor: "#f9fafb"
};
const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 12 },
  "& .MuiInputBase-input": { py: 0.75, px: 1.25, fontSize: 12 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dce2e8" }
};
const fieldLabelSx = {
  display: "block",
  mb: 0.75,
  color: "#344457",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase"
};
const sectionTitleSx = {
  mb: 1.5,
  color: "#132e4c",
  fontSize: 14,
  fontWeight: 700
};
const subSectionTitleSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
  color: "#132e4c",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase"
};
const tableHeaderSx = {
  px: 1,
  py: 1.25,
  bgcolor: "#07351f",
  color: "#fff",
  borderRight: "1px solid #ffffff30",
  fontSize: 9,
  fontWeight: 700,
  lineHeight: 1.25,
  textTransform: "uppercase"
};
const tableCellSx = {
  px: 0.75,
  py: 0.75,
  borderRight: "1px solid #e0e4ea",
  verticalAlign: "middle"
};
const emptyKmlFile = () => ({ description: "", file: null });
const emptyImageGalleryRow = () => ({ description: "", files: null });
const emptyEmploymentRow = (financialYear) => ({
  financialYear,
  laborCost: "",
  mandays: "",
  tribals: "",
  forestDwellers: ""
});
const currentDate = new Date();
const currentFinancialYear = currentDate.getFullYear() - (currentDate.getMonth() < 3 ? 1 : 0);
const fallbackFinancialYears = Array.from({ length: 11 }, (_, index) => {
  const startYear = currentFinancialYear - 1 + index;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
});

function fileListMessage(fileList) {
  return Array.from(fileList || []).map((file) => file.name).join(", ") || "No file chosen";
}

function DocumentFilePicker({ accept, registration, fileName, error }) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          minWidth: 0,
          height: 32,
          overflow: "hidden",
          border: "1px solid",
          borderColor: error ? "error.main" : "#dce2e8",
          borderRadius: 1,
          bgcolor: "#fff"
        }}
      >
        <Button
          component="label"
          sx={{
            flexShrink: 0,
            minWidth: 0,
            px: 1.25,
            borderRight: "1px solid #dce2e8",
            borderRadius: 0,
            bgcolor: "#f5f7fa",
            color: "#344457",
            fontSize: 11,
            textTransform: "none",
            "&:hover": { bgcolor: "#edf0f4" }
          }}
        >
          Choose File
          <input type="file" hidden accept={accept} {...registration} />
        </Button>
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            px: 1,
            color: fileName ? "#132e4c" : "#667085",
            fontSize: 11,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
          title={fileName || "No file chosen"}
        >
          {fileName || "No file chosen"}
        </Typography>
      </Box>
      {error && <Typography role="alert" sx={{ mt: 0.25, color: "error.main", fontSize: 10 }}>{error.message}</Typography>}
    </Box>
  );
}

function DocumentsEmploymentStep() {
  const [searchParams] = useSearchParams();
  const {
    control,
    getValues,
    register,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useFormContext();
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState("");
  const {
    fields: employmentRows,
    append: appendEmployment,
    remove: removeEmployment,
    replace: replaceEmployment
  } = useFieldArray({ control, name: "documentsEmployment.employmentRows" });
  const {
    fields: kmlFields,
    append: appendKml,
    remove: removeKml,
    replace: replaceKml
  } = useFieldArray({ control, name: "documentsEmployment.kmlFiles" });
  const {
    fields: imageGalleryFields,
    append: appendImageGallery,
    remove: removeImageGallery,
    replace: replaceImageGallery
  } = useFieldArray({ control, name: "documentsEmployment.imageGallery" });

  useEffect(() => {
    const controller = new AbortController();
    const schemeId = searchParams.get("schemeId");
    const accessToken = sessionStorage.getItem("campaJwt")?.trim();

    if (!schemeId || schemeId === "authenticated") {
      setDocumentLoading(false);
      return;
    }

    if (!accessToken || accessToken.toLowerCase() === "authenticated") {
      setDocumentLoading(false);
      return;
    }

    const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;

    fetch(apiUrls.documentDetails(schemeId), {
      signal: controller.signal,
      headers: { Authorization: authorization }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await response.text()) || `Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Document Details API Response:", data);

        if (data) {
          // Set capacity building program details
          if (data.capacityBuildingDetails) {
            setValue("documentsEmployment.capacityProgramDetails", data.capacityBuildingDetails, { shouldDirty: false });
          }

          // Set documents (KML and Image files)
          if (data.documents && Array.isArray(data.documents)) {
            const kmlDocs = data.documents.filter((doc) => doc.documentType === "KML");
            const imageDocs = data.documents.filter((doc) => doc.documentType === "IMAGE");

            // Restore saved document metadata; browsers do not allow restoring file inputs.
            if (kmlDocs.length > 0) {
              replaceKml(kmlDocs.map((doc) => ({
                description: doc.description || "",
                file: null,
                uploadedFileName: doc.fileName || ""
              })));
            }

            if (imageDocs.length > 0) {
              replaceImageGallery(imageDocs.map((doc) => ({
                description: doc.description || "",
                files: null,
                uploadedFileName: doc.fileName || ""
              })));
            }
          }

          // Set employment rows data
          if (Array.isArray(data.employmentDetails)) {
            replaceEmployment(data.employmentDetails.map((emp) => ({
              financialYear: emp.financialYear || "",
              laborCost: emp.labourCost != null && emp.labourCost !== "" ? Number(emp.labourCost) : "",
              mandays: emp.mandaysGenerated != null && emp.mandaysGenerated !== "" ? Number(emp.mandaysGenerated) : "",
              tribals: emp.tribals != null && emp.tribals !== "" ? Number(emp.tribals) : "",
              forestDwellers: emp.forestDwellersBenefitted != null && emp.forestDwellersBenefitted !== ""
                ? Number(emp.forestDwellersBenefitted)
                : ""
            })));
          }

          setDocumentError("");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching document details:", error);
          setDocumentError(`Unable to load document details: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDocumentLoading(false);
        }
      });

    return () => controller.abort();
  }, [searchParams, setValue, replaceEmployment, replaceKml, replaceImageGallery]);

  const documentErrors = errors.documentsEmployment || {};
  const kmlFileValues = watch("documentsEmployment.kmlFiles") || [];
  const imageGalleryValues = watch("documentsEmployment.imageGallery") || [];
  const employmentRowValues = watch("documentsEmployment.employmentRows") || [];
  const dateOfProposal = watch("dateOfProposal");
  const expectedCompletionDate = watch("expectedCompletionDate");
  const financialYears = getFinancialYears(dateOfProposal, expectedCompletionDate);
  const selectableFinancialYears = financialYears.length > 0 ? financialYears : fallbackFinancialYears;
  const handleFinancialYearChange = (event, onChange) => {
    const financialYear = event.target.value;
    onChange(event);
    if (!financialYear) return;

    const existingRows = getValues("documentsEmployment.employmentRows") || [];
    if (existingRows.some((row) => row.financialYear === financialYear)) {
      setError("documentsEmployment.selectedFinancialYear", {
        type: "manual",
        message: "Year already exists"
      });
      return;
    }

    clearErrors(["documentsEmployment.selectedFinancialYear", "documentsEmployment.employmentRows"]);
    appendEmployment(emptyEmploymentRow(financialYear));
  };

  return (
    <>
      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h1" sx={sectionTitleSx}>
          9. Capacity Building &amp; Awareness Programmes information collection &amp; Communication
        </Typography>
        <Box sx={{ maxWidth: { xs: "100%", md: "66%" } }}>
          <Typography component="label" htmlFor="capacityProgramDetails" sx={fieldLabelSx}>
            9.1 Associated Capacity Building &amp; Awareness Programmes Information Collection &amp; Communication
          </Typography>
          <TextField
            id="capacityProgramDetails"
            placeholder="Enter capacity building program details"
            fullWidth
            size="small"
            sx={inputSx}
            {...register("documentsEmployment.capacityProgramDetails")}
          />
        </Box>
      </Paper>

      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h2" sx={sectionTitleSx}>
          10. Scheme supporting documents
        </Typography>

        <Paper elevation={0} sx={{ mb: 1.25, p: 1.5, border: "1px solid #e0e4ea", borderRadius: 1.5, bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Typography component="h3" sx={subSectionTitleSx}>
              10.1 Upload KML files for scheme footprints <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
              <Info size={12} color="#0785c2" title="KML or KMZ files, up to 20 MB each" />
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                type="button"
                aria-label="Add KML file"
                onClick={() => appendKml(emptyKmlFile())}
                sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: "#0b6037", color: "#fff", "&:hover": { bgcolor: "#07522f" } }}
              >
                <Plus size={16} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 0.8fr 34px" }, gap: 1.25, px: 0.25, pb: 0.5 }}>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Description <Box component="span" sx={{ color: "#d32f2f" }}>*</Box></Typography>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>KML file (.KML / .KMZ, up to 20 MB) <Box component="span" sx={{ color: "#d32f2f" }}>*</Box></Typography>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Uploaded file</Typography>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Action</Typography>
          </Box>

          {kmlFields.map((field, index) => {
            const baseName = `documentsEmployment.kmlFiles.${index}`;
            const rowError = documentErrors.kmlFiles?.[index];
            const fileRegistration = register(`${baseName}.file`, {
              validate: (files) => {
                if (!files?.length && !getValues(`${baseName}.uploadedFileName`)) return "A KML or KMZ file is required.";
                if (!files?.length) return true;
                const file = files[0];
                if (!/\.(kml|kmz)$/i.test(file.name)) return "Choose a KML or KMZ file.";
                if (file.size > 20 * 1024 * 1024) return "File must be 20 MB or smaller.";
                return true;
              }
            });

            return (
              <Box
                key={field.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 0.8fr 34px" },
                  gap: 1.25,
                  alignItems: "start",
                  pt: 0.75,
                  pb: 0.75,
                  borderTop: "1px solid #eef0f3",
                  "& > *": { minWidth: 0 }
                }}
              >
                <TextField
                  placeholder="Enter description for KML file"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  error={Boolean(rowError?.description)}
                  helperText={rowError?.description?.message}
                  {...register(`${baseName}.description`, { required: "Description is required." })}
                />
                <DocumentFilePicker
                  accept=".kml,.kmz"
                  registration={fileRegistration}
                  fileName={kmlFileValues[index]?.file?.length
                    ? fileListMessage(kmlFileValues[index].file)
                    : kmlFileValues[index]?.uploadedFileName}
                  error={rowError?.file}
                />
                <Typography sx={{ pt: 1, color: "#667085", fontSize: 11, overflowWrap: "anywhere" }}>
                  {kmlFileValues[index]?.file?.length
                    ? fileListMessage(kmlFileValues[index].file)
                    : kmlFileValues[index]?.uploadedFileName || "No file chosen"}
                </Typography>
                <IconButton
                  type="button"
                  aria-label={`Remove KML file ${index + 1}`}
                  disabled={kmlFields.length <= 1}
                  onClick={() => removeKml(index)}
                  sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: "#e52b2e", color: "#fff", "&:hover": { bgcolor: "#c81e24" }, "&.Mui-disabled": { bgcolor: "#f4a1a2", color: "#fff" } }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            );
          })}
        </Paper>

        <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #e0e4ea", borderRadius: 1.5, bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Typography component="h3" sx={subSectionTitleSx}>
              10.2 Image Gallery <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
              <Info size={12} color="#0785c2" title="JPG, JPEG, or PNG images, up to 2 MB each" />
            </Typography>
            <IconButton
              type="button"
              aria-label="Add image gallery item"
              onClick={() => appendImageGallery(emptyImageGalleryRow())}
              sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: "#0b6037", color: "#fff", "&:hover": { bgcolor: "#07522f" } }}
            >
              <Plus size={16} />
            </IconButton>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 0.8fr 34px" }, gap: 1.25, px: 0.25, pb: 0.5 }}>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Description <Box component="span" sx={{ color: "#d32f2f" }}>*</Box></Typography>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Images (JPG / JPEG / PNG, max 2 MB each) <Box component="span" sx={{ color: "#d32f2f" }}>*</Box></Typography>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Uploaded file</Typography>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Action</Typography>
          </Box>
          {imageGalleryFields.map((field, index) => {
            const baseName = `documentsEmployment.imageGallery.${index}`;
            const rowError = documentErrors.imageGallery?.[index];
            const fileRegistration = register(`${baseName}.files`, {
              validate: (files) => {
                if (!files?.length && !getValues(`${baseName}.uploadedFileName`)) return "Select an image for this row.";
                if (!files?.length) return true;
                const selectedFiles = Array.from(files);
                if (!selectedFiles.every((file) => /\.(jpe?g|png)$/i.test(file.name))) {
                  return "Only JPG, JPEG, or PNG images are allowed.";
                }
                return selectedFiles.every((file) => file.size <= 2 * 1024 * 1024)
                  || "Each image must be 2 MB or smaller.";
              }
            });

            return (
              <Box
                key={field.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 0.8fr 34px" },
                  gap: 1.25,
                  alignItems: "start",
                  pt: 0.75,
                  pb: 0.75,
                  borderTop: "1px solid #eef0f3",
                  "& > *": { minWidth: 0 }
                }}
              >
                <TextField
                  placeholder="Enter description for image file"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  error={Boolean(rowError?.description)}
                  helperText={rowError?.description?.message}
                  {...register(`${baseName}.description`, { required: "Description is required." })}
                />
                <DocumentFilePicker
                  accept=".jpg,.jpeg,.png"
                  registration={fileRegistration}
                  fileName={imageGalleryValues[index]?.files?.length
                    ? fileListMessage(imageGalleryValues[index].files)
                    : imageGalleryValues[index]?.uploadedFileName}
                  error={rowError?.files}
                />
                <Typography sx={{ pt: 1, color: "#667085", fontSize: 11, overflowWrap: "anywhere" }}>
                  {imageGalleryValues[index]?.files?.length
                    ? fileListMessage(imageGalleryValues[index].files)
                    : imageGalleryValues[index]?.uploadedFileName || "No file chosen"}
                </Typography>
                <IconButton
                  type="button"
                  aria-label={`Remove image gallery item ${index + 1}`}
                  disabled={imageGalleryFields.length <= 1}
                  onClick={() => removeImageGallery(index)}
                  sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: "#e52b2e", color: "#fff", "&:hover": { bgcolor: "#c81e24" }, "&.Mui-disabled": { bgcolor: "#f4a1a2", color: "#fff" } }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            );
          })}
        </Paper>
      </Paper>

      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h2" sx={sectionTitleSx}>
          11. Projected Green Employment / Employment Generation <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
        </Typography>
        <Box sx={{ maxWidth: { xs: "100%", md: "33%" }, mb: 1 }}>
          <Typography component="label" htmlFor="employmentFinancialYear" sx={fieldLabelSx}>Select financial year</Typography>
          <Controller
            name="documentsEmployment.selectedFinancialYear"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                id="employmentFinancialYear"
                select
                fullWidth
                size="small"
                sx={inputSx}
                error={Boolean(documentErrors.selectedFinancialYear)}
                helperText={documentErrors.selectedFinancialYear?.message}
                onChange={(event) => handleFinancialYearChange(event, field.onChange)}
              >
                <MenuItem value="">--Select Year--</MenuItem>
                {selectableFinancialYears.map((year) => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </TextField>
            )}
          />
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e4ea", borderRadius: 1.5, bgcolor: "#fff", overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderSx}>S.No</TableCell>
                <TableCell sx={tableHeaderSx}>Financial year</TableCell>
                <TableCell sx={tableHeaderSx}>Labour cost (in Rs)</TableCell>
                <TableCell sx={tableHeaderSx}>Mandays generated</TableCell>
                <TableCell sx={tableHeaderSx}>Tribals (in no.)</TableCell>
                <TableCell sx={tableHeaderSx}>Forest dwellers benefitted (in no.)</TableCell>
                <TableCell sx={tableHeaderSx}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employmentRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 1, color: "#667085", textAlign: "center", fontSize: 12 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
                      <Info size={14} />
                      {financialYears.length === 0
                        ? <>No financial years are auto-generated yet. Fill <strong>Date of Proposal</strong> and <strong>Expected Completion Date</strong> in Section 3, or select a year above to add one manually.</>
                        : "Select a financial year above to add a row."}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {employmentRows.map((row, index) => {
                const baseName = `documentsEmployment.employmentRows.${index}`;
                const rowErrors = documentErrors.employmentRows?.[index];
                return (
                  <TableRow key={row.id}>
                    <TableCell sx={{ ...tableCellSx, width: 55, textAlign: "center", fontSize: 11 }}>{index + 1}</TableCell>
                    <TableCell sx={{ ...tableCellSx, minWidth: 105, fontSize: 11, fontWeight: 600 }}>
                      {employmentRowValues[index]?.financialYear}
                    </TableCell>
                    {[
                      ["laborCost", "Enter labour cost"],
                      ["mandays", "Enter mandays"],
                      ["tribals", "Enter number"],
                      ["forestDwellers", "Enter number"]
                    ].map(([fieldName, placeholder]) => (
                      <TableCell key={fieldName} sx={{ ...tableCellSx, minWidth: 150 }}>
                        <TextField
                          type="number"
                          placeholder={placeholder}
                          fullWidth
                          size="small"
                          sx={inputSx}
                          slotProps={{ htmlInput: { min: 0, step: fieldName === "laborCost" ? "any" : 1 } }}
                          error={Boolean(rowErrors?.[fieldName])}
                          helperText={rowErrors?.[fieldName]?.message}
                          {...register(`${baseName}.${fieldName}`, {
                            required: "This field is required.",
                            valueAsNumber: true,
                            min: { value: 0, message: "Value cannot be negative." },
                            ...(fieldName !== "laborCost" ? { validate: (value) => Number.isInteger(value) || "Enter a whole number." } : {})
                          })}
                        />
                      </TableCell>
                    ))}
                    <TableCell sx={{ ...tableCellSx, width: 70, textAlign: "center" }}>
                      <IconButton
                        type="button"
                        aria-label={`Remove employment year ${employmentRowValues[index]?.financialYear}`}
                        onClick={() => removeEmployment(index)}
                        sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: "#e52b2e", color: "#fff", "&:hover": { bgcolor: "#c81e24" }, "&.Mui-disabled": { bgcolor: "#f4a1a2", color: "#fff" } }}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {documentErrors.employmentRows?.message && (
          <Typography role="alert" sx={{ mt: 0.75, color: "error.main", fontSize: 11 }}>
            {documentErrors.employmentRows.message}
          </Typography>
        )}
      </Paper>
    </>
  );
}

export default DocumentsEmploymentStep;
