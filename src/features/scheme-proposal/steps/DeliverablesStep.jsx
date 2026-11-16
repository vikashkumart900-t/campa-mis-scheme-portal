import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
import { FileSpreadsheet, Plus, Trash2, Upload } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[2];
const sectionSx = {
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
const emptyDeliverable = () => ({
  description: "",
  unit: "",
  initiationDate: "",
  closingDate: "",
  financialOutlay: "",
  remarks: "",
  attachment: null
});
const emptyDescription = () => ({ description: "" });

function normalizeDate(value, rowNumber, columnName) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (value === null || value === undefined || value === "") return "";

  const text = String(value).trim();
  const match = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  throw new Error(`Excel row ${rowNumber} has an invalid ${columnName}. Use a date value or DD-MM-YYYY.`);
}

function parseDeliverablesWorksheet(rows) {
  const headers = rows[0]?.map((value) => String(value ?? "").trim().toLowerCase()) ?? [];
  const columns = {
    description: headers.indexOf("deliverable"),
    unit: headers.indexOf("unit"),
    initiationDate: headers.indexOf("initiation date"),
    closingDate: headers.indexOf("closing date"),
    financialOutlay: headers.indexOf("financial outlay (rs. in lakhs)"),
    remarks: headers.indexOf("remarks")
  };
  const requiredHeaders = Object.entries(columns).filter(([key]) => key !== "remarks");
  const missingHeader = requiredHeaders.find(([, index]) => index < 0);
  if (missingHeader) {
    throw new Error("Excel must have columns: Deliverable, Unit, Initiation Date, Closing Date, Financial Outlay (Rs. in Lakhs), Remarks.");
  }

  const deliverables = rows.slice(1).flatMap((row, index) => {
    const rowNumber = index + 2;
    const description = String(row[columns.description] ?? "").trim();
    const unit = String(row[columns.unit] ?? "").trim();
    const initiationDate = normalizeDate(row[columns.initiationDate], rowNumber, "initiation date");
    const closingDate = normalizeDate(row[columns.closingDate], rowNumber, "closing date");
    const financialOutlay = row[columns.financialOutlay] ?? "";
    const remarks = columns.remarks >= 0 ? String(row[columns.remarks] ?? "").trim() : "";

    if (![description, unit, initiationDate, closingDate, String(financialOutlay).trim(), remarks].some(Boolean)) return [];
    if (initiationDate && closingDate && closingDate < initiationDate) {
      throw new Error(`Excel row ${rowNumber} has a closing date before its initiation date.`);
    }
    if (financialOutlay !== "" && (!Number.isFinite(Number(financialOutlay)) || Number(financialOutlay) < 0)) {
      throw new Error(`Excel row ${rowNumber} has an invalid financial outlay.`);
    }

    return [{
      ...emptyDeliverable(),
      description,
      unit,
      initiationDate,
      closingDate,
      financialOutlay: String(financialOutlay),
      remarks
    }];
  });

  if (!deliverables.length) throw new Error("The Excel file does not contain any deliverables.");
  return deliverables;
}

function fileName(value) {
  return value?.[0]?.name || "";
}

function DeliverableRow({ item, index, register, getValues, errors, onRemove }) {
  const rowErrors = errors?.[index];
  const dateRules = (otherDateName, label) => ({
    required: `${label} is required.`,
    validate: (value) => {
      const otherDate = getValues(otherDateName);
      if (value && otherDate && value !== otherDate) {
        const isInitiationDate = label === "Initiation date";
        return isInitiationDate ? value < otherDate || "Initiation date must be on or before closing date." : value > otherDate || "Closing date must be on or after initiation date.";
      }
      return true;
    }
  });
  const baseName = `deliverables.items.${index}`;

  return (
    <TableRow>
      <TableCell sx={{ ...tableCellSx, width: 42, textAlign: "center", fontSize: 11 }}>{index + 1}</TableCell>
      <TableCell sx={{ ...tableCellSx, minWidth: 240 }}>
        <TextField
          placeholder="Enter deliverable"
          fullWidth
          size="small"
          sx={inputSx}
          error={Boolean(rowErrors?.description)}
          helperText={rowErrors?.description?.message}
          {...register(`${baseName}.description`, { required: "Deliverable is required." })}
        />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, width: 80 }}>
        <TextField
          placeholder="Enter unit"
          fullWidth
          size="small"
          sx={inputSx}
          error={Boolean(rowErrors?.unit)}
          helperText={rowErrors?.unit?.message}
          {...register(`${baseName}.unit`, { required: "Unit is required." })}
        />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, width: 112 }}>
        <TextField
          type="date"
          fullWidth
          size="small"
          sx={inputSx}
          error={Boolean(rowErrors?.initiationDate)}
          helperText={rowErrors?.initiationDate?.message}
          {...register(`${baseName}.initiationDate`, dateRules(`${baseName}.closingDate`, "Initiation date"))}
        />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, width: 112 }}>
        <TextField
          type="date"
          fullWidth
          size="small"
          sx={inputSx}
          error={Boolean(rowErrors?.closingDate)}
          helperText={rowErrors?.closingDate?.message}
          {...register(`${baseName}.closingDate`, dateRules(`${baseName}.initiationDate`, "Closing date"))}
        />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, width: 92 }}>
        <TextField
          type="number"
          placeholder="Enter amount"
          fullWidth
          size="small"
          sx={inputSx}
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
          error={Boolean(rowErrors?.financialOutlay)}
          helperText={rowErrors?.financialOutlay?.message}
          {...register(`${baseName}.financialOutlay`, {
            required: "Financial outlay is required.",
            valueAsNumber: true,
            min: { value: 0, message: "Financial outlay cannot be negative." }
          })}
        />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, width: 120 }}>
        <TextField placeholder="Enter remarks" fullWidth size="small" sx={inputSx} {...register(`${baseName}.remarks`)} />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, width: 128 }}>
        <Button
          component="label"
          variant="outlined"
          sx={{
            width: "100%",
            minWidth: 0,
            justifyContent: "flex-start",
            overflow: "hidden",
            borderColor: "#dce2e8",
            bgcolor: "#fff",
            color: "#344457",
            fontSize: 10,
            textTransform: "none",
            whiteSpace: "nowrap"
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{fileName(item?.attachment) || "Choose File"}</span>
          <input type="file" hidden {...register(`${baseName}.attachment`)} />
        </Button>
      </TableCell>
      <TableCell sx={{ ...tableCellSx, width: 76, borderRight: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
          <IconButton
            type="button"
            aria-label={`Add deliverable after row ${index + 1}`}
            onClick={() => onRemove("add")}
            size="small"
            sx={{ border: "1px solid #0b6037", borderRadius: 1, color: "#075b2d", bgcolor: "#eaf5ee" }}
          >
            <Plus size={15} />
          </IconButton>
          <IconButton
            type="button"
            aria-label={`Remove deliverable ${index + 1}`}
            onClick={() => onRemove("remove")}
            size="small"
            sx={{ borderRadius: 1, color: "#fff", bgcolor: "#ed777b", "&:hover": { bgcolor: "#d95357" } }}
          >
            <Trash2 size={15} />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
}

function GanttPreview({ items }) {
  const scheduledItems = items.filter((item) => item?.initiationDate && item?.closingDate && item.closingDate >= item.initiationDate);
  if (!scheduledItems.length) {
    return (
      <Box sx={{ minHeight: 160, p: 1.25, border: "1px solid #ddd", bgcolor: "#fff" }}>
        <Typography sx={{ color: "#65758b", fontSize: 12 }}>
          No deliverables to display. Add deliverables with initiation and closing dates to see the Gantt chart.
        </Typography>
      </Box>
    );
  }

  const timestamps = scheduledItems.flatMap((item) => [Date.parse(`${item.initiationDate}T00:00:00Z`), Date.parse(`${item.closingDate}T00:00:00Z`)]);
  const start = Math.min(...timestamps);
  const end = Math.max(...timestamps);
  const duration = Math.max(end - start, 1);
  const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Box sx={{ minHeight: 160, p: 1.25, border: "1px solid #ddd", bgcolor: "#fff", overflowX: "auto" }}>
      <Box sx={{ minWidth: 560 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(130px, 1.2fr) 3fr", mb: 0.75, color: "#65758b", fontSize: 10 }}>
          <span />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <span>{formatDate(new Date(start).toISOString().slice(0, 10))}</span>
            <span>{formatDate(new Date(end).toISOString().slice(0, 10))}</span>
          </Box>
        </Box>
        {scheduledItems.map((item, index) => {
          const itemStart = Date.parse(`${item.initiationDate}T00:00:00Z`);
          const itemEnd = Date.parse(`${item.closingDate}T00:00:00Z`);
          const left = ((itemStart - start) / duration) * 100;
          const width = Math.max(((itemEnd - itemStart) / duration) * 100, 1.5);
          return (
            <Box key={`${item.description}-${index}`} sx={{ display: "grid", gridTemplateColumns: "minmax(130px, 1.2fr) 3fr", alignItems: "center", minHeight: 28 }}>
              <Typography title={item.description} sx={{ overflow: "hidden", pr: 1, color: "#344457", fontSize: 10, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.description || `Deliverable ${index + 1}`}
              </Typography>
              <Box sx={{ position: "relative", height: 18, borderLeft: "1px solid #dce2e8", borderRight: "1px solid #dce2e8", backgroundImage: "linear-gradient(to right, #eef1f4 1px, transparent 1px)", backgroundSize: "25% 100%" }}>
                <Box title={`${item.initiationDate} to ${item.closingDate}`} sx={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 2, bottom: 2, minWidth: 6, borderRadius: 1, bgcolor: "#0b6037" }} />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function DescriptionList({ label, name, fields, append, remove, register, errors, placeholder }) {
  const listErrors = errors?.deliverables?.[name];
  return (
    <Box>
      <Typography sx={{ mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
        {label} <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
      </Typography>
      <Box sx={{ display: "grid", gap: 0.75 }}>
        {fields.map((field, index) => (
          <Box key={field.id} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
            <TextField
              placeholder={placeholder}
              fullWidth
              size="small"
              sx={inputSx}
              error={Boolean(listErrors?.[index]?.description)}
              helperText={listErrors?.[index]?.description?.message}
              {...register(`deliverables.${name}.${index}.description`, { required: `${label} is required.` })}
            />
            {fields.length > 1 && (
              <IconButton
                type="button"
                aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
                onClick={() => remove(index)}
                size="small"
                sx={{ mt: 0.25, color: "#d32f2f" }}
              >
                <Trash2 size={15} />
              </IconButton>
            )}
          </Box>
        ))}
        <Button
          type="button"
          aria-label={`Add ${label.toLowerCase()}`}
          onClick={() => append(emptyDescription())}
          sx={{ minWidth: 34, width: 34, height: 32, justifySelf: "end", borderRadius: 1.5, bgcolor: "#0b6037", color: "#fff", "&:hover": { bgcolor: "#07522f" } }}
        >
          <Plus size={18} />
        </Button>
      </Box>
    </Box>
  );
}

function DeliverablesStep() {
  const {
    control,
    register,
    getValues,
    watch,
    formState: { errors }
  } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({ control, name: "deliverables.items" });
  const { fields: nationalFields, append: appendNational, remove: removeNational } = useFieldArray({ control, name: "deliverables.nationalImportance" });
  const { fields: internationalFields, append: appendInternational, remove: removeInternational } = useFieldArray({ control, name: "deliverables.internationalFootprints" });
  const items = watch("deliverables.items") || [];
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);

  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadStatus("");
    setIsReadingFile(true);
    try {
      if (!file.name.toLowerCase().endsWith(".xlsx")) throw new Error("Choose an .xlsx Excel file.");
      const { readSheet } = await import("read-excel-file/browser");
      const worksheetRows = await readSheet(file);
      replace(parseDeliverablesWorksheet(worksheetRows));
      setUploadStatus(`Imported deliverables from ${file.name}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The workbook could not be read.";
      setUploadError(`Unable to import deliverables: ${message}`);
    } finally {
      setIsReadingFile(false);
      event.target.value = "";
    }
  };

  const downloadTemplate = async () => {
    setUploadError("");
    setUploadStatus("");
    try {
      const { default: writeXlsxFile } = await import("write-excel-file/browser");
      const workbook = writeXlsxFile(
        [
          ["Deliverable", "Unit", "Initiation Date", "Closing Date", "Financial Outlay (Rs. in Lakhs)", "Remarks"],
          ["Example deliverable", "Number", "01-04-2026", "31-03-2027", 10, "Example remarks"]
        ],
        { sheet: "Deliverables" }
      );
      await workbook.toFile("deliverables-template.xlsx");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The template could not be created.";
      setUploadError(`Unable to download the Excel template: ${message}`);
    }
  };

  return (
    <Paper elevation={0} sx={sectionSx}>
      <Typography component="h1" sx={{ mb: 2, color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
        6. {step.label}
      </Typography>

      <Typography sx={{ mb: 1, color: "#344457", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
        6.1 Add Deliverable
      </Typography>
      <Box sx={{ mb: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Button
            type="button"
            onClick={downloadTemplate}
            startIcon={<FileSpreadsheet size={13} />}
            sx={{ minHeight: 27, px: 1.25, borderRadius: 1, bgcolor: "#075b35", color: "#fff", fontSize: 10, fontWeight: 700, textTransform: "none", boxShadow: "0 2px 5px #0002", "&:hover": { bgcolor: "#064a2b" } }}
          >
            Download Excel Template
          </Button>
          <Typography sx={{ color: "#e12424", fontSize: 10 }}>
            (Importing the Excel file using this template will populate the data in the table)
          </Typography>
        </Box>
        <Button
          component="label"
          variant="outlined"
          disabled={isReadingFile}
          startIcon={<Upload size={13} />}
          sx={{ minHeight: 27, px: 1.25, borderColor: "#f49a00", borderRadius: 1, color: "#a95800", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}
        >
          {isReadingFile ? "Importing..." : "Import from Excel"}
          <input type="file" accept=".xlsx" hidden onChange={handleExcelUpload} />
        </Button>
      </Box>
      {uploadError && <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>{uploadError}</Typography>}
      {uploadStatus && <Typography role="status" sx={{ mb: 1, color: "#087638", fontSize: 12 }}>{uploadStatus}</Typography>}

      <TableContainer sx={{ mb: 2.5, border: "1px solid #e0e4ea", borderRadius: 1, bgcolor: "#fff" }}>
        <Table size="small" aria-label="Deliverables">
          <TableHead>
            <TableRow>
              {["S. No.", "Deliverables *", "Unit *", "Initiation Date *", "Closing Date *", "Financial Outlay (Rs. in Lakhs) *", "Remarks", "Upload (if any)", "Actions"].map((heading) => (
                <TableCell key={heading} sx={tableHeaderSx}>{heading}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field, index) => (
              <DeliverableRow
                key={field.id}
                item={items[index]}
                index={index}
                register={register}
                getValues={getValues}
                errors={errors?.deliverables?.items}
                onRemove={(action) => {
                  if (action === "add") {
                    append(emptyDeliverable());
                  } else if (fields.length === 1) {
                    replace([emptyDeliverable()]);
                  } else {
                    remove(index);
                  }
                }}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <GanttPreview items={items} />

      <Box sx={{ mt: 2.5 }}>
        <Typography sx={{ mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
          6.2 Year-wise Estimated Expenditure (Select Anyone)
        </Typography>
        <FormControl error={Boolean(errors?.deliverables?.expenditureType)}>
          <RadioGroup row name="deliverables.expenditureType" sx={{ columnGap: 1.5, rowGap: 0, flexWrap: "wrap" }}>
            <FormControlLabel
              value="activityWise"
              control={<Radio size="small" {...register("deliverables.expenditureType", { required: "Select an expenditure option." })} />}
              label="Activity-wise (from Deliverables)"
              sx={{ mr: 1, "& .MuiFormControlLabel-label": { color: "#7a8798", fontSize: 11 } }}
            />
            <FormControlLabel
              value="yearWise"
              control={<Radio size="small" {...register("deliverables.expenditureType", { required: "Select an expenditure option." })} />}
              label="Year-wise (Financial Year)"
              sx={{ mr: 1, "& .MuiFormControlLabel-label": { color: "#344457", fontSize: 11 } }}
            />
          </RadioGroup>
          {errors?.deliverables?.expenditureType && <FormHelperText>{errors.deliverables.expenditureType.message}</FormHelperText>}
        </FormControl>
      </Box>

      <Box sx={{ mt: 2.5, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
        <DescriptionList
          label="6.3 National Importance"
          name="nationalImportance"
          fields={nationalFields}
          append={appendNational}
          remove={removeNational}
          register={register}
          errors={errors}
          placeholder="Describe national importance"
        />
        <DescriptionList
          label="6.4 International Footprints"
          name="internationalFootprints"
          fields={internationalFields}
          append={appendInternational}
          remove={removeInternational}
          register={register}
          errors={errors}
          placeholder="Describe international impact"
        />
      </Box>
    </Paper>
  );
}

export default DeliverablesStep;
