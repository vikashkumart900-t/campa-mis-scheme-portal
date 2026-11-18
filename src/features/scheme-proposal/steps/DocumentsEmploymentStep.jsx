import {
  Box,
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
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
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

function fileNames(fileList) {
  return Array.from(fileList || []).map((file) => file.name).join(", ");
}

function fileListMessage(fileList) {
  return Array.from(fileList || []).map((file) => file.name).join(", ") || "No file chosen";
}

function DocumentsEmploymentStep() {
  const {
    control,
    getValues,
    register,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useFormContext();
  const {
    fields: kmlFields,
    append: appendKml,
    remove: removeKml
  } = useFieldArray({ control, name: "documentsEmployment.kmlFiles" });
  const {
    fields: employmentRows,
    append: appendEmployment,
    remove: removeEmployment
  } = useFieldArray({ control, name: "documentsEmployment.employmentRows" });
  const documentErrors = errors.documentsEmployment || {};
  const kmlFileValues = watch("documentsEmployment.kmlFiles") || [];
  const imageFiles = watch("documentsEmployment.imageFiles");
  const employmentRowValues = watch("documentsEmployment.employmentRows") || [];
  const dateOfProposal = watch("dateOfProposal");
  const expectedCompletionDate = watch("expectedCompletionDate");
  const financialYears = getFinancialYears(dateOfProposal, expectedCompletionDate);
  const selectableFinancialYears = financialYears.length > 0 ? financialYears : fallbackFinancialYears;
  const imageRegistration = register("documentsEmployment.imageFiles", {
    validate: (files) => {
      if (!files?.length) return "Upload at least one image.";
      const selectedFiles = Array.from(files);
      if (!selectedFiles.every((file) => /\.(jpe?g|png)$/i.test(file.name))) {
        return "Only JPG, JPEG, or PNG images are allowed.";
      }
      return selectedFiles.every((file) => file.size <= 2 * 1024 * 1024)
        || "Each image must be 2 MB or smaller.";
    }
  });
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
                if (!files?.length) return "A KML or KMZ file is required.";
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
                <Box>
                  <TextField
                    type="file"
                    fullWidth
                    size="small"
                    sx={inputSx}
                    slotProps={{ htmlInput: { accept: ".kml,.kmz" } }}
                    error={Boolean(rowError?.file)}
                    {...fileRegistration}
                  />
                  {rowError?.file && <Typography role="alert" sx={{ mt: 0.25, color: "error.main", fontSize: 10 }}>{rowError.file.message}</Typography>}
                </Box>
                <Typography sx={{ pt: 1, color: "#667085", fontSize: 11, overflowWrap: "anywhere" }}>
                  {fileNames(kmlFileValues[index]?.file)}
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
          <Typography component="h3" sx={{ ...subSectionTitleSx, mb: 1 }}>
            10.2 Image Gallery <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            <Info size={12} color="#0785c2" title="JPG, JPEG, or PNG images, up to 2 MB each" />
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 0.8fr" }, gap: 1.25, px: 0.25, pb: 0.5 }}>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Description <Box component="span" sx={{ color: "#d32f2f" }}>*</Box></Typography>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Images (JPG / JPEG / PNG, max 2 MB each) <Box component="span" sx={{ color: "#d32f2f" }}>*</Box></Typography>
            <Typography sx={{ ...fieldLabelSx, mb: 0 }}>Uploaded file</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 0.8fr" }, gap: 1.25, alignItems: "start", pt: 0.75, borderTop: "1px solid #eef0f3", "& > *": { minWidth: 0 } }}>
            <TextField
              placeholder="Enter description for image file"
              fullWidth
              size="small"
              sx={inputSx}
              error={Boolean(documentErrors.imageDescription)}
              helperText={documentErrors.imageDescription?.message}
              {...register("documentsEmployment.imageDescription", { required: "Description is required." })}
            />
            <Box>
              <TextField
                type="file"
                fullWidth
                size="small"
                sx={inputSx}
                slotProps={{ htmlInput: { accept: ".jpg,.jpeg,.png", multiple: true } }}
                error={Boolean(documentErrors.imageFiles)}
                {...imageRegistration}
                onChange={(event) => {
                  imageRegistration.onChange(event);
                  const tooLarge = Array.from(event.target.files || []).some((file) => file.size > 2 * 1024 * 1024);
                  if (tooLarge) {
                    setError("documentsEmployment.imageFiles", { type: "validate", message: "Each image must be 2 MB or smaller." });
                  } else {
                    clearErrors("documentsEmployment.imageFiles");
                  }
                }}
              />
              {documentErrors.imageFiles && <Typography role="alert" sx={{ mt: 0.25, color: "error.main", fontSize: 10 }}>{documentErrors.imageFiles.message}</Typography>}
            </Box>
            <Typography sx={{ pt: 1, color: "#667085", fontSize: 11, overflowWrap: "anywhere" }}>
              {fileListMessage(imageFiles)}
            </Typography>
          </Box>
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
