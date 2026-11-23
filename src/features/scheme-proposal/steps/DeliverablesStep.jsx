import { useEffect, useState } from "react";
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
import { FileSpreadsheet, Info, Plus, Trash2, Upload } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { proposalSteps } from "../config/proposalSteps";
import { getFinancialYears } from "../utils/financialYears";
import { apiUrls } from "../../../api/urls";

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
const sectionTitleSx = {
  mb: 2,
  color: "#132e4c",
  fontSize: 14,
  fontWeight: 700
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

function parseDeliverablesWorksheet(rows, dateOfProposal, expectedCompletionDate) {
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
    for (const [columnName, date] of [["initiation date", initiationDate], ["closing date", closingDate]]) {
      if (date && dateOfProposal && date < dateOfProposal) {
        throw new Error(`Excel row ${rowNumber}: ${columnName} must be on or after the date of proposal.`);
      }
      if (date && expectedCompletionDate && date > expectedCompletionDate) {
        throw new Error(`Excel row ${rowNumber}: ${columnName} must be on or before the expected completion date.`);
      }
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

function DeliverableRow({ item, index, register, getValues, dateOfProposal, expectedCompletionDate, errors, onRemove }) {
  const rowErrors = errors?.[index];
  const dateRules = (otherDateName, label) => ({
    required: `${label} is required.`,
    validate: (value) => {
      if (value && dateOfProposal && value < dateOfProposal) {
        return `${label} must be on or after Date of Proposal.`;
      }
      if (value && expectedCompletionDate && value > expectedCompletionDate) {
        return `${label} must be on or before Expected Completion Date.`;
      }
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
      <TableCell sx={{ ...tableCellSx, width: 42, textAlign: "center", fontSize: 11, minWidth: 42 }}>{index + 1}</TableCell>
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
      <TableCell sx={{ ...tableCellSx, minWidth: 80, width: "auto" }}>
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
      <TableCell sx={{ ...tableCellSx, minWidth: 112 }}>
        <TextField
          type="date"
          fullWidth
          size="small"
          sx={inputSx}
          slotProps={{ htmlInput: { min: dateOfProposal || undefined, max: expectedCompletionDate || undefined } }}
          error={Boolean(rowErrors?.initiationDate)}
          helperText={rowErrors?.initiationDate?.message}
          {...register(`${baseName}.initiationDate`, dateRules(`${baseName}.closingDate`, "Initiation date"))}
        />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, minWidth: 112 }}>
        <TextField
          type="date"
          fullWidth
          size="small"
          sx={inputSx}
          slotProps={{ htmlInput: { min: dateOfProposal || undefined, max: expectedCompletionDate || undefined } }}
          error={Boolean(rowErrors?.closingDate)}
          helperText={rowErrors?.closingDate?.message}
          {...register(`${baseName}.closingDate`, dateRules(`${baseName}.initiationDate`, "Closing date"))}
        />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, minWidth: 92 }}>
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
      <TableCell sx={{ ...tableCellSx, minWidth: 120 }}>
        <TextField placeholder="Enter remarks" fullWidth size="small" sx={inputSx} {...register(`${baseName}.remarks`)} />
      </TableCell>
      <TableCell sx={{ ...tableCellSx, minWidth: 128 }}>
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
      <TableCell sx={{ ...tableCellSx, minWidth: 76, borderRight: 0 }}>
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
  const totalOutlay = items.reduce((total, item) => {
    const value = Number(item?.financialOutlay);
    return total + (Number.isFinite(value) && value > 0 ? value : 0);
  }, 0);
  const palette = ["#3182ce", "#1ca379", "#e89b32", "#8755b5", "#d65366", "#4189a8"];
  const now = new Date();
  const monthStart = scheduledItems.length
    ? new Date(Math.min(...scheduledItems.map((item) => Date.parse(`${item.initiationDate}T00:00:00Z`))))
    : null;
  const monthEnd = scheduledItems.length
    ? new Date(Math.max(...scheduledItems.map((item) => Date.parse(`${item.closingDate}T00:00:00Z`))))
    : null;
  const startMonth = monthStart ? new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1)) : null;
  const monthCount = startMonth && monthEnd
    ? (monthEnd.getUTCFullYear() - startMonth.getUTCFullYear()) * 12 + monthEnd.getUTCMonth() - startMonth.getUTCMonth() + 1
    : 0;
  const months = Array.from({ length: monthCount }, (_, index) => new Date(Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + index, 1)));
  const timelineStart = startMonth?.getTime() ?? 0;
  const timelineEnd = monthCount ? Date.UTC(startMonth.getUTCFullYear(), startMonth.getUTCMonth() + monthCount, 1) : 0;
  const timelineDuration = Math.max(timelineEnd - timelineStart, 1);
  const todayOffset = ((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - timelineStart) / timelineDuration) * 100;
  const hasTodayMarker = todayOffset >= 0 && todayOffset <= 100;
  const timelineMonths = scheduledItems.length
    ? Math.max(1, Math.round((Math.max(...scheduledItems.map((item) => Date.parse(`${item.closingDate}T00:00:00Z`))) - Math.min(...scheduledItems.map((item) => Date.parse(`${item.initiationDate}T00:00:00Z`)))) / (365.25 / 12 * 24 * 60 * 60 * 1000)))
    : 0;
  const monthLabel = (date) => date.toLocaleDateString(undefined, { month: "short", year: "2-digit", timeZone: "UTC" });
  const durationLabel = (item) => {
    const days = (Date.parse(`${item.closingDate}T00:00:00Z`) - Date.parse(`${item.initiationDate}T00:00:00Z`)) / (24 * 60 * 60 * 1000);
    return `${Math.max(1, Math.round(days / (365.25 / 12 * 24 * 60 * 60 * 1000)))}mo`;
  };

  return (
    <Box sx={{ mb: 2, border: "1px solid #d9dee4", bgcolor: "#fff" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 1, p: 1.5, bgcolor: "#f8f9fa" }}>
        {[
          ["Deliverables", items.length],
          ["Total outlay (Lakhs)", `₹${totalOutlay.toFixed(2)}`],
          ["Timeline span", `${timelineMonths}mo`]
        ].map(([label, value]) => (
          <Box key={label} sx={{ px: 1, py: 0.5 }}>
            <Typography sx={{ color: "#65758b", fontSize: 10 }}>{label}</Typography>
            <Typography sx={{ mt: 0.25, color: "#132e4c", fontSize: 16, fontWeight: 700 }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      {scheduledItems.length ? (
        <Box sx={{ overflowX: "auto", px: 1, pt: 0.75 }}>
          <Box sx={{ width: `${160 + monthCount * 54}px` }}>
            <Box sx={{ display: "grid", gridTemplateColumns: `160px repeat(${monthCount}, 54px)`, height: 34 }}>
              <Box sx={{ display: "flex", alignItems: "center", px: 1, border: "1px solid #dce2e8", bgcolor: "#f8f9fa", color: "#344457", fontSize: 10, fontWeight: 700 }}>
                Deliverable
              </Box>
              {months.map((month) => (
                <Box key={month.toISOString()} sx={{ display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid #dce2e8", borderRight: "1px solid #dce2e8", borderBottom: "1px solid #dce2e8", bgcolor: month.getUTCFullYear() === now.getFullYear() && month.getUTCMonth() === now.getMonth() ? "#e5f1fb" : "#f8f9fa", color: "#344457", fontSize: 9, whiteSpace: "nowrap" }}>
                  {monthLabel(month)}
                </Box>
              ))}
            </Box>
            <Box sx={{ position: "relative" }}>
              {hasTodayMarker && (
                <Box aria-label="Today" sx={{ position: "absolute", zIndex: 2, top: 0, bottom: 0, left: `${160 + (todayOffset / 100) * monthCount * 54}px`, width: "1px", bgcolor: "#ef4444", pointerEvents: "none" }} />
              )}
              {scheduledItems.map((item, index) => {
                const itemStart = Date.parse(`${item.initiationDate}T00:00:00Z`);
                const itemEnd = Date.parse(`${item.closingDate}T00:00:00Z`);
                const left = ((itemStart - timelineStart) / timelineDuration) * 100;
                const width = Math.max(((itemEnd - itemStart) / timelineDuration) * 100, 0.8);
                const color = palette[index % palette.length];
                return (
                  <Box key={`${item.description}-${index}`} sx={{ display: "grid", gridTemplateColumns: `160px repeat(${monthCount}, 54px)`, minHeight: 48 }}>
                    <Box title={item.description} sx={{ display: "flex", alignItems: "center", px: 1, borderLeft: "1px solid #dce2e8", borderRight: "1px solid #dce2e8", borderBottom: "1px solid #dce2e8", color: "#344457", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.description || `Deliverable ${index + 1}`}
                    </Box>
                    <Box sx={{ gridColumn: `2 / span ${monthCount}`, position: "relative", borderBottom: "1px solid #dce2e8", backgroundImage: "linear-gradient(to right, #e1e6eb 1px, transparent 1px)", backgroundSize: `${100 / monthCount}% 100%` }}>
                      <Box title={`${item.initiationDate} to ${item.closingDate}`} sx={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: "50%", transform: "translateY(-50%)", height: 22, display: "flex", alignItems: "center", overflow: "hidden", px: 0.75, borderRadius: 0.75, bgcolor: color, color: "#fff", fontSize: 9, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {item.description || `Deliverable ${index + 1}`} · {durationLabel(item)}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 1.5 }}>
          <Typography sx={{ color: "#65758b", fontSize: 12 }}>
            No deliverables to display. Add deliverables with initiation and closing dates to see the Gantt chart.
          </Typography>
        </Box>
      )}

      {scheduledItems.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, px: 1.5, py: 1, color: "#52647a" }}>
          {scheduledItems.map((item, index) => (
            <Box key={`${item.description}-legend-${index}`} sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
              <Box sx={{ width: 10, height: 10, flex: "0 0 auto", borderRadius: 0.25, bgcolor: palette[index % palette.length] }} />
              <Typography title={item.description} sx={{ maxWidth: 180, overflow: "hidden", color: "inherit", fontSize: 10, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.description || `Deliverable ${index + 1}`}
              </Typography>
            </Box>
          ))}
          {hasTodayMarker && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ height: 10, borderLeft: "1px solid #ef4444" }} />
              <Typography sx={{ color: "inherit", fontSize: 10 }}>Today</Typography>
            </Box>
          )}
        </Box>
      )}
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
  const [searchParams] = useSearchParams();
  const {
    control,
    register,
    getValues,
    watch,
    setValue,
    formState: { errors }
  } = useFormContext();
  const { fields, append, remove, replace } = useFieldArray({ control, name: "deliverables.items" });
  const { fields: yearWiseFields, replace: replaceYearWiseExpenditures } = useFieldArray({ control, name: "deliverables.yearWiseExpenditures" });
  const { fields: nationalFields, append: appendNational, remove: removeNational, replace: replaceNational } = useFieldArray({ control, name: "deliverables.nationalImportance" });
  const { fields: internationalFields, append: appendInternational, remove: removeInternational, replace: replaceInternational } = useFieldArray({ control, name: "deliverables.internationalFootprints" });
  const items = watch("deliverables.items") || [];
  const nationalImportance = watch("deliverables.nationalImportance") || [];
  const internationalFootprints = watch("deliverables.internationalFootprints") || [];
  const yearlyExpenditures = watch("deliverables.yearWiseExpenditures") || [];
  const expenditureType = watch("deliverables.expenditureType");
  const dateOfProposal = watch("dateOfProposal");
  const expectedCompletionDate = watch("expectedCompletionDate");
  const financialYears = getFinancialYears(dateOfProposal, expectedCompletionDate);
  const [uploadError, setUploadError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [deliverablesLoading, setDeliverablesLoading] = useState(true);
  const [deliverablesError, setDeliverablesError] = useState("");

  useEffect(() => {
    const schemeId = searchParams.get("schemeId");
    // Only auto-generate years if we don't have a schemeId (new entry)
    if (schemeId && schemeId !== "authenticated") return;

    const currentRows = getValues("deliverables.yearWiseExpenditures") || [];
    
    // If we already have rows with expenditure values, don't recalculate
    const hasExpenditureValues = currentRows.some(row => row.expenditure);
    if (hasExpenditureValues && currentRows.length > 0) return;
    
    const nextRows = getFinancialYears(dateOfProposal, expectedCompletionDate).map((financialYear) => {
      const existingRow = currentRows.find((row) => row.financialYear === financialYear);
      return existingRow ? { ...existingRow } : { financialYear, expenditure: "" };
    });
    const yearsMatch = currentRows.length === nextRows.length
      && currentRows.every((row, index) => row.financialYear === nextRows[index].financialYear);
    if (!yearsMatch) replaceYearWiseExpenditures(nextRows);
  }, [dateOfProposal, expectedCompletionDate, getValues, replaceYearWiseExpenditures, searchParams]);

  useEffect(() => {
    const schemeId = searchParams.get("schemeId");
    if (!schemeId || schemeId === "authenticated") {
      setDeliverablesLoading(false);
      setDeliverablesError("");
      return;
    }

    const controller = new AbortController();

    const fetchDeliverablesData = async () => {
      setDeliverablesLoading(true);
      setDeliverablesError("");
      try {
        const url = apiUrls.deliverables(encodeURIComponent(schemeId));
        const token = sessionStorage.getItem("campaJwt") || "";
        const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

        const response = await fetch(url, {
          method: "GET",
          headers: { Authorization: authToken },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Failed to load deliverables: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const deliverable = Array.isArray(data) ? data[0] : data;

        if (deliverable) {
          if (deliverable.id) {
            setValue("deliverables.id", deliverable.id, { shouldDirty: false });
          }
          if (deliverable.expenditureType) {
            const expenditureTypeValue = deliverable.expenditureType === "YEAR_WISE" ? "yearWise" : 
                                        deliverable.expenditureType === "ACTIVITY_WISE" ? "activityWise" : 
                                        deliverable.expenditureType;
            setValue("deliverables.expenditureType", expenditureTypeValue, { shouldDirty: false });
          } else {
            setValue("deliverables.expenditureType", "yearWise", { shouldDirty: false });
          }
          if (deliverable.totalOutlay) {
            setValue("deliverables.totalOutlay", deliverable.totalOutlay, { shouldDirty: false });
          }
          if (deliverable.totalDeliverables) {
            setValue("deliverables.totalDeliverables", deliverable.totalDeliverables, { shouldDirty: false });
          }

          if (deliverable.deliverables && Array.isArray(deliverable.deliverables)) {
            const formattedDeliverables = deliverable.deliverables.map((item) => ({
              id: item.id || undefined,
              description: item.deliverable || "",
              unit: item.unit || "",
              initiationDate: item.initiationDate || "",
              closingDate: item.closingDate || "",
              financialOutlay: item.financialOutlay || "",
              remarks: item.remarks || "",
              attachment: null,
              documentFileName: item.documentFileName || null,
              documentFilePath: item.documentFilePath || null
            }));
            replace(formattedDeliverables);
          }

          if (deliverable.yearlyExpenditures && Array.isArray(deliverable.yearlyExpenditures)) {
            const formattedYearlyExpenditures = deliverable.yearlyExpenditures.map((item) => ({
              financialYear: item.financialYear || "",
              expenditure: item.expenditure !== undefined && item.expenditure !== null ? Number(item.expenditure) : ""
            }));
            replaceYearWiseExpenditures(formattedYearlyExpenditures);
          }

          if (deliverable.nationalImportance && Array.isArray(deliverable.nationalImportance)) {
            const formattedNational = deliverable.nationalImportance.map((item) => ({
              description: item
            }));
            replaceNational(formattedNational);
          }

          if (deliverable.internationalFootprints && Array.isArray(deliverable.internationalFootprints)) {
            const formattedInternational = deliverable.internationalFootprints.map((item) => ({
              description: item
            }));
            replaceInternational(formattedInternational);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setDeliverablesError(`Unable to load deliverables: ${error.message}`);
        }
      } finally {
        setDeliverablesLoading(false);
      }
    };

    fetchDeliverablesData();

    return () => controller.abort();
  }, [searchParams, setValue, replace, replaceYearWiseExpenditures, replaceNational, replaceInternational]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentValue = getValues("deliverables.expenditureType");
      if (!currentValue) {
        setValue("deliverables.expenditureType", "yearWise", { shouldDirty: false });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [getValues, setValue]);

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
      replace(parseDeliverablesWorksheet(worksheetRows, getValues("dateOfProposal"), getValues("expectedCompletionDate")));
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
      <Typography component="h1" sx={sectionTitleSx}>
        6. {step.label}
      </Typography>

      {deliverablesError && (
        <Box sx={{ mb: 1.5, p: 1, bgcolor: "#ffebee", border: "1px solid #ef5350", borderRadius: 1 }}>
          <Typography sx={{ color: "#c62828", fontSize: 12 }}>
            {deliverablesError}
          </Typography>
        </Box>
      )}

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

      <TableContainer sx={{ mb: 2.5, border: "1px solid #e0e4ea", borderRadius: 1, bgcolor: "#fff", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <Table size="small" aria-label="Deliverables" sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              {["S. No.", "Deliverables *", "Unit *", "Initiation Date *", "Closing Date *", "Financial Outlay (Rs) *", "Remarks", "Upload (if any)", "Actions"].map((heading) => (
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
                dateOfProposal={dateOfProposal}
                expectedCompletionDate={expectedCompletionDate}
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
          <Controller
            name="deliverables.expenditureType"
            control={control}
            defaultValue="yearWise"
            rules={{ required: "Select an expenditure option." }}
            render={({ field }) => (
              <RadioGroup 
                {...field}
                row 
                sx={{ columnGap: 1.5, rowGap: 0, flexWrap: "wrap" }}
              >
                <FormControlLabel
                  value="activityWise"
                  control={<Radio size="small" />}
                  label="Activity-wise (from Deliverables)"
                  sx={{ mr: 1, "& .MuiFormControlLabel-label": { color: "#7a8798", fontSize: 11 } }}
                />
                <FormControlLabel
                  value="yearWise"
                  control={<Radio size="small" />}
                  label="Year-wise (Financial Year)"
                  sx={{ mr: 1, "& .MuiFormControlLabel-label": { color: "#344457", fontSize: 11 } }}
                />
              </RadioGroup>
            )}
          />
          {errors?.deliverables?.expenditureType && <FormHelperText>{errors.deliverables.expenditureType.message}</FormHelperText>}
        </FormControl>
      </Box>

      {expenditureType === "activityWise" && (
        <TableContainer sx={{ mt: 1.5, border: "1px solid #e0e4ea", borderRadius: 1, bgcolor: "#fff" }}>
          <Table size="small" aria-label="Activity-wise estimated expenditure">
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...tableHeaderSx, width: "18%" }}>S. No.</TableCell>
                <TableCell sx={{ ...tableHeaderSx, width: "34%" }}>Deliverable</TableCell>
                <TableCell sx={{ ...tableHeaderSx, borderRight: 0 }}>Financial Outlay (Rs. in Lakhs)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${item?.description || "deliverable"}-${index}`}>
                  <TableCell sx={{ ...tableCellSx, width: "18%", fontSize: 11 }}>{index + 1}</TableCell>
                  <TableCell sx={{ ...tableCellSx, width: "34%", fontSize: 11 }}>{item?.description || ""}</TableCell>
                  <TableCell sx={{ ...tableCellSx, borderRight: 0, fontSize: 11 }}>{item?.financialOutlay ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {expenditureType === "yearWise" && (
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.75, p: 1.25, border: "1px solid #b8dfc8", borderRadius: 1, bgcolor: "#eaf5ee", color: "#075b35" }}>
            <Info size={13} />
            <Typography sx={{ fontSize: 10 }}>
              Financial years will be calculated based on Date of Proposal and Expected Date of Completion
            </Typography>
          </Box>
          <TableContainer sx={{ border: "1px solid #e0e4ea", borderRadius: 1, bgcolor: "#fff" }}>
            <Table size="small" aria-label="Year-wise estimated expenditure">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...tableHeaderSx, width: "38%" }}>Financial Year</TableCell>
                  <TableCell sx={{ ...tableHeaderSx, borderRight: 0 }}>Expenditure (Rs)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {yearlyExpenditures.length ? yearlyExpenditures.map((row, index) => (
                  <TableRow key={row.financialYear || index}>
                    <TableCell sx={{ ...tableCellSx, width: "38%", fontSize: 11 }}>{row.financialYear}</TableCell>
                    <TableCell sx={{ ...tableCellSx, borderRight: 0 }}>
                      <input type="hidden" {...register(`deliverables.yearWiseExpenditures.${index}.financialYear`)} value={row.financialYear} />
                      <Controller
                        name={`deliverables.yearWiseExpenditures.${index}.expenditure`}
                        control={control}
                        rules={{
                          required: "Expenditure is required.",
                          min: { value: 0, message: "Expenditure cannot be negative." }
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            type="number"
                            placeholder="Enter amount"
                            fullWidth
                            size="small"
                            sx={inputSx}
                            error={Boolean(error)}
                            helperText={error?.message}
                            slotProps={{ htmlInput: { min: 0, step: "any" } }}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                )) : financialYears.length ? financialYears.map((financialYear, index) => (
                  <TableRow key={financialYear}>
                    <TableCell sx={{ ...tableCellSx, width: "38%", fontSize: 11 }}>{financialYear}</TableCell>
                    <TableCell sx={{ ...tableCellSx, borderRight: 0 }}>
                      <input type="hidden" {...register(`deliverables.yearWiseExpenditures.${index}.financialYear`)} value={financialYear} />
                      <Controller
                        name={`deliverables.yearWiseExpenditures.${index}.expenditure`}
                        control={control}
                        rules={{
                          required: "Expenditure is required.",
                          min: { value: 0, message: "Expenditure cannot be negative." }
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            type="number"
                            placeholder="Enter amount"
                            fullWidth
                            size="small"
                            sx={inputSx}
                            error={Boolean(error)}
                            helperText={error?.message}
                            slotProps={{ htmlInput: { min: 0, step: "any" } }}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ py: 1.25, color: "#65758b", fontSize: 11 }}>
                      Enter the Date of Proposal and Expected Completion Date in Section 3 to generate financial years.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

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
