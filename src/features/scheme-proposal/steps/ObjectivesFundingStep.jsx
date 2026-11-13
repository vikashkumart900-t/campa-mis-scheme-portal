import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { Plus, Trash2, X } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

const sectionSx = {
  mb: 1.5,
  p: { xs: 2, md: 2.5 },
  border: "1px solid #e0e4ea",
  borderRadius: 2,
  bgcolor: "#f9fafb"
};

const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 12 },
  "& .MuiInputBase-input": { py: 1 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dce2e8" }
};

const sectionTitleSx = {
  mb: 2,
  color: "#132e4c",
  fontSize: 14,
  fontWeight: 700
};

function parseObjectivesWorksheet(rows) {
  const headers = rows[0]?.map((value) => String(value ?? "").trim().toLowerCase()) ?? [];
  const majorColumn = headers.indexOf("major objective");
  const minorColumn = headers.indexOf("minor objective");

  if (majorColumn < 0 || minorColumn < 0) {
    throw new Error("Excel must have columns: Major Objective, Minor Objective.");
  }

  const objectives = [];
  const objectivesByName = new Map();
  let currentObjective = null;

  rows.slice(1).forEach((row, index) => {
    const majorObjective = String(row[majorColumn] ?? "").trim();
    const minorObjective = String(row[minorColumn] ?? "").trim();

    if (!majorObjective && !minorObjective) return;

    if (majorObjective) {
      const key = majorObjective.toLowerCase();
      currentObjective = objectivesByName.get(key);
      if (!currentObjective) {
        currentObjective = { majorObjective, minorObjectives: [] };
        objectivesByName.set(key, currentObjective);
        objectives.push(currentObjective);
      }
    } else if (!currentObjective) {
      throw new Error(`Excel row ${index + 2} has a minor objective without a major objective.`);
    }

    if (minorObjective) {
      currentObjective.minorObjectives.push({ minorObjective });
    }
  });

  if (objectives.length === 0) {
    throw new Error("The Excel file does not contain any objectives.");
  }

  return objectives.map((objective) => ({
    ...objective,
    minorObjectives: objective.minorObjectives.length
      ? objective.minorObjectives
      : [{ minorObjective: "" }]
  }));
}

function ObjectiveRow({ index, field, control, register, errors, onRemove }) {
  const minorObjectivesPath = `objectivesFunding.objectives.${index}.minorObjectives`;
  const { fields: minorFields, append, remove } = useFieldArray({
    control,
    name: minorObjectivesPath
  });
  const objectiveErrors = errors?.objectivesFunding?.objectives?.[index];

  return (
    <TableRow sx={{ "&:nth-of-type(even)": { bgcolor: "#f7f8fa" } }}>
      <TableCell sx={{ width: "5%", color: "#344457", fontSize: 11, verticalAlign: "middle" }}>
        {index + 1}
      </TableCell>
      <TableCell sx={{ width: "35%", verticalAlign: "middle" }}>
        <TextField
          id={`major-objective-${field.id}`}
          placeholder="Enter Major Objective"
          fullWidth
          size="small"
          sx={inputSx}
          error={Boolean(objectiveErrors?.majorObjective)}
          helperText={objectiveErrors?.majorObjective?.message}
          {...register(`objectivesFunding.objectives.${index}.majorObjective`)}
        />
      </TableCell>
      <TableCell sx={{ width: "52%", verticalAlign: "top" }}>
        <Box sx={{ display: "grid", gap: 0.75 }}>
          {minorFields.map((minorField, minorIndex) => {
            const minorError = objectiveErrors?.minorObjectives?.[minorIndex]?.minorObjective;
            return (
              <Box key={minorField.id} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                <TextField
                  id={`minor-objective-${field.id}-${minorField.id}`}
                  placeholder="Enter Minor Objective"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  error={Boolean(minorError)}
                  helperText={minorError?.message}
                  {...register(
                    `objectivesFunding.objectives.${index}.minorObjectives.${minorIndex}.minorObjective`
                  )}
                />
                <IconButton
                  aria-label={`Remove minor objective ${minorIndex + 1} from major objective ${index + 1}`}
                  onClick={() => remove(minorIndex)}
                  size="small"
                  sx={{
                    flex: "0 0 auto",
                    mt: 0.5,
                    border: "1px solid #ef5350",
                    borderRadius: 1,
                    color: "#d32f2f",
                    "&:hover": { bgcolor: "#fff0f0" }
                  }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            );
          })}
          <Button
            type="button"
            size="small"
            variant="outlined"
            startIcon={<Plus size={14} />}
            onClick={() => append({ minorObjective: "" })}
            sx={{
              justifySelf: "start",
              borderColor: "#087638",
              color: "#075b2d",
              bgcolor: "#eaf5ee",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": { borderColor: "#075b2d", bgcolor: "#dff0e5" }
            }}
          >
            Add Minor Objective
          </Button>
        </Box>
      </TableCell>
      <TableCell sx={{ width: "8%", textAlign: "center", verticalAlign: "middle" }}>
        <IconButton
          aria-label={`Remove major objective ${index + 1}`}
          onClick={onRemove}
          size="small"
          sx={{
            color: "#fff",
            bgcolor: "#e52323",
            borderRadius: 1.5,
            boxShadow: "0 2px 5px #0002",
            "&:hover": { bgcolor: "#c81919" },
            "&.Mui-disabled": { bgcolor: "#e9a1a1", color: "#fff" }
          }}
        >
          <Trash2 size={15} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function SupportingDocumentUpload({ id, name, register, fileName }) {
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        sx={{ display: "block", mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700 }}
      >
        UPLOAD SUPPORTING DOCUMENT
      </Typography>
      <Box
        sx={{
          display: "flex",
          minHeight: 34,
          alignItems: "center",
          overflow: "hidden",
          border: "1px solid #cfd7e2",
          borderRadius: 1,
          bgcolor: "#fff"
        }}
      >
        <Button
          component="label"
          htmlFor={id}
          sx={{
            height: 34,
            px: 1.5,
            borderRight: "1px solid #cfd7e2",
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
            id={id}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            hidden
            {...register(name)}
          />
        </Button>
        <Typography
          aria-live="polite"
          sx={{ overflow: "hidden", px: 1.25, color: "#344457", fontSize: 11, textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {fileName || "No file chosen"}
        </Typography>
      </Box>
    </Box>
  );
}

function ObjectivesFundingStep() {
  const {
    control,
    register,
    watch,
    formState: { errors }
  } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "objectivesFunding.objectives"
  });
  const [uploadError, setUploadError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);

  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setIsReadingFile(true);
    try {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        throw new Error("Choose an .xlsx Excel file.");
      }

      const { readSheet } = await import("read-excel-file/browser");
      const worksheetRows = await readSheet(file);
      replace(parseObjectivesWorksheet(worksheetRows));
      setUploadedFileName(file.name);
    } catch (error) {
      setUploadedFileName("");
      const message = error instanceof Error ? error.message : "The workbook could not be read.";
      setUploadError(`Unable to upload objectives: ${message}`);
    } finally {
      setIsReadingFile(false);
      event.target.value = "";
    }
  };

  const downloadTemplate = async () => {
    setUploadError("");
    try {
      const { default: writeXlsxFile } = await import("write-excel-file/browser");
      const template = writeXlsxFile(
        [
          ["Major Objective", "Minor Objective"],
          ["Example major objective", "Example minor objective"]
        ],
        { sheet: "Objectives" }
      );
      await template.toFile("objectives-template.xlsx");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The template could not be created.";
      setUploadError(`Unable to download the Excel template: ${message}`);
    }
  };

  const stateComponentsError = errors?.objectivesFunding?.hasStateComponents;
  const stateBoardAgreementError = errors?.objectivesFunding?.stateBoardAgreement;
  const fundingAgencyError = errors?.objectivesFunding?.hasOtherFundingAgency;
  const hasStateComponents = watch("objectivesFunding.hasStateComponents");
  const hasOtherFundingAgency = watch("objectivesFunding.hasOtherFundingAgency");
  const stateAgreementDocument = watch("objectivesFunding.stateAgreementDocument");
  const otherFundingAgencyDocument = watch("objectivesFunding.otherFundingAgencyDocument");
  const validateStateBoardAgreement = (value) =>
    hasStateComponents !== "yes" || Boolean(value) || "Select Yes or No.";

  return (
    <>
      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h1" sx={sectionTitleSx}>
          4. Objectives
        </Typography>

        <Box
          sx={{
            mb: 1.5,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
            alignItems: "end",
            gap: 1.5
          }}
        >
          <Box>
            <Typography
              component="label"
              htmlFor="objectives-excel-upload"
              sx={{ display: "block", mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700 }}
            >
              UPLOAD OBJECTIVES EXCEL
            </Typography>
            <Box
              sx={{
                display: "flex",
                minHeight: 34,
                alignItems: "center",
                overflow: "hidden",
                border: "1px solid #cfd7e2",
                borderRadius: 1,
                bgcolor: "#fff"
              }}
            >
              <Button
                component="label"
                htmlFor="objectives-excel-upload"
                disabled={isReadingFile}
                sx={{
                  height: 34,
                  px: 1.5,
                  borderRight: "1px solid #cfd7e2",
                  borderRadius: 0,
                  color: "#132e4c",
                  bgcolor: "#f1f4f8",
                  fontSize: 11,
                  textTransform: "none",
                  whiteSpace: "nowrap"
                }}
              >
                {isReadingFile ? "Reading..." : "Choose File"}
                <input
                  id="objectives-excel-upload"
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  hidden
                  onChange={handleExcelUpload}
                />
              </Button>
              <Typography
                aria-live="polite"
                sx={{ overflow: "hidden", px: 1.25, color: "#344457", fontSize: 11, textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {uploadedFileName || "No file chosen"}
              </Typography>
            </Box>
            <FormHelperText sx={{ ml: 0, color: "#667085", fontSize: 10 }}>
              Excel must have columns: <strong>Major Objective</strong>, <strong>Minor Objective</strong>
            </FormHelperText>
          </Box>
          <Button
            type="button"
            variant="outlined"
            onClick={downloadTemplate}
            sx={{
              alignSelf: "start",
              mt: { xs: 0, md: "1.3rem" },
              minHeight: 34,
              borderColor: "#cfd7e2",
              color: "#132e4c",
              bgcolor: "#fff",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "none"
            }}
          >
            Download Template
          </Button>
        </Box>

        {uploadError && (
          <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>
            {uploadError}
          </Typography>
        )}

        {fields.length > 0 && (
          <TableContainer
            sx={{
              overflowX: "auto",
              border: "1px solid #e0e4ea",
              borderRadius: 1.5,
              bgcolor: "#fff"
            }}
          >
            <Table size="small" sx={{ minWidth: 760, tableLayout: "fixed" }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#073b27" }}>
                  {[
                    ["S. NO", "5%"],
                    ["MAJOR OBJECTIVE", "35%"],
                    ["MINOR OBJECTIVE", "52%"],
                    ["ACTION", "8%"]
                  ].map(([heading, width]) => (
                    <TableCell
                      key={heading}
                      sx={{
                        width,
                        py: 1.25,
                        borderColor: "#d9e2dd",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0.2
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <ObjectiveRow
                    key={field.id}
                    index={index}
                    field={field}
                    control={control}
                    register={register}
                    errors={errors}
                    onRemove={() => remove(index)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Button
          type="button"
          variant="outlined"
          startIcon={<Plus size={15} />}
          onClick={() => append({ majorObjective: "", minorObjectives: [{ minorObjective: "" }] })}
          sx={{
            mt: 1.75,
            borderColor: "#087638",
            color: "#075b2d",
            bgcolor: "#eaf5ee",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { borderColor: "#075b2d", bgcolor: "#dff0e5" }
          }}
        >
          Add Major Objective
        </Button>
      </Paper>

      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h2" sx={sectionTitleSx}>
          5. State Components and Funding Agency
        </Typography>

        <Box sx={{ display: "grid", gap: 1.5 }}>
          <FormControl component="fieldset" error={Boolean(stateComponentsError)}>
            <FormLabel
              component="legend"
              sx={{ color: "#344457", fontSize: 10, fontWeight: 700, "&.Mui-focused": { color: "#344457" } }}
            >
              5.1 WHETHER THE SCHEME HAS STATE COMPONENTS? <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </FormLabel>
            <RadioGroup row>
              <FormControlLabel
                value="yes"
                control={<Radio size="small" {...register("objectivesFunding.hasStateComponents", { required: "Select Yes or No." })} />}
                label="Yes"
                sx={{ ml: 0, mr: 1, "& .MuiFormControlLabel-label": { fontSize: 11 } }}
              />
              <FormControlLabel
                value="no"
                control={<Radio size="small" {...register("objectivesFunding.hasStateComponents", { required: "Select Yes or No." })} />}
                label="No"
                sx={{ ml: 0, mr: 1, "& .MuiFormControlLabel-label": { fontSize: 11 } }}
              />
            </RadioGroup>
            {stateComponentsError?.message && <FormHelperText>{stateComponentsError.message}</FormHelperText>}
          </FormControl>

          {hasStateComponents === "yes" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.5
              }}
            >
              <FormControl component="fieldset" error={Boolean(stateBoardAgreementError)}>
                <FormLabel
                  component="legend"
                  sx={{ mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700 }}
                >
                  WHETHER THE STATE IS ON BOARD BASED ON ANY SIGNED AGREEMENT
                  <Box component="span" sx={{ color: "#d32f2f" }}> *</Box>
                </FormLabel>
                <RadioGroup row>
                  <FormControlLabel
                    value="yes"
                    control={
                      <Radio
                        size="small"
                        {...register("objectivesFunding.stateBoardAgreement", {
                          validate: validateStateBoardAgreement
                        })}
                      />
                    }
                    label="Yes"
                    sx={{ ml: 0, mr: 1, "& .MuiFormControlLabel-label": { fontSize: 11 } }}
                  />
                  <FormControlLabel
                    value="no"
                    control={
                      <Radio
                        size="small"
                        {...register("objectivesFunding.stateBoardAgreement", {
                          validate: validateStateBoardAgreement
                        })}
                      />
                    }
                    label="No"
                    sx={{ ml: 0, mr: 1, "& .MuiFormControlLabel-label": { fontSize: 11 } }}
                  />
                </RadioGroup>
                {stateBoardAgreementError?.message && (
                  <FormHelperText>{stateBoardAgreementError.message}</FormHelperText>
                )}
              </FormControl>
              <SupportingDocumentUpload
                id="state-agreement-document"
                name="objectivesFunding.stateAgreementDocument"
                register={register}
                fileName={stateAgreementDocument?.[0]?.name}
              />
            </Box>
          )}

          <FormControl component="fieldset" error={Boolean(fundingAgencyError)}>
            <FormLabel
              component="legend"
              sx={{ color: "#344457", fontSize: 10, fontWeight: 700, "&.Mui-focused": { color: "#344457" } }}
            >
              5.2 WHETHER THE SCHEME HAS OTHER FUNDING AGENCY? <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </FormLabel>
            <RadioGroup row>
              <FormControlLabel
                value="yes"
                control={<Radio size="small" {...register("objectivesFunding.hasOtherFundingAgency", { required: "Select Yes or No." })} />}
                label="Yes"
                sx={{ ml: 0, mr: 1, "& .MuiFormControlLabel-label": { fontSize: 11 } }}
              />
              <FormControlLabel
                value="no"
                control={<Radio size="small" {...register("objectivesFunding.hasOtherFundingAgency", { required: "Select Yes or No." })} />}
                label="No"
                sx={{ ml: 0, mr: 1, "& .MuiFormControlLabel-label": { fontSize: 11 } }}
              />
            </RadioGroup>
            {fundingAgencyError?.message && <FormHelperText>{fundingAgencyError.message}</FormHelperText>}
          </FormControl>

          {hasOtherFundingAgency === "yes" && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                alignItems: "end",
                gap: 1.5
              }}
            >
              <Box>
                <FormLabel
                  component="label"
                  htmlFor="other-funding-sources"
                  sx={{ display: "block", mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700 }}
                >
                  OTHER FUNDING SOURCES, PLEASE SPECIFY
                </FormLabel>
                <TextField
                  id="other-funding-sources"
                  placeholder="Specify other funding sources"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  {...register("objectivesFunding.otherFundingSources")}
                />
              </Box>
              <SupportingDocumentUpload
                id="other-funding-agency-document"
                name="objectivesFunding.otherFundingAgencyDocument"
                register={register}
                fileName={otherFundingAgencyDocument?.[0]?.name}
              />
            </Box>
          )}
        </Box>
      </Paper>
    </>
  );
}

export default ObjectivesFundingStep;
