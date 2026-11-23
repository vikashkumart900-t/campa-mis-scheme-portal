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
  TextField,
  Typography
} from "@mui/material";
import { Info, Plus, Sparkles, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useFieldArray, useFormContext } from "react-hook-form";
import { apiUrls } from "../../../api/urls";

const sectionSx = {
  mb: 1.5,
  p: { xs: 2, md: 2.5 },
  border: "1px solid #e0e4ea",
  borderRadius: 2,
  bgcolor: "#f9fafb"
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
const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 12 },
  "& .MuiInputBase-input": { py: 0.125, px: 1.25, fontSize: 12 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dce2e8" }
};

function extractiveSummary(text) {
  const sentences = (text.match(/[^.!?]+[.!?]*/g) || [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (sentences.length <= 3) return sentences.join(" ");

  const stopWords = new Set([
    "about", "after", "also", "and", "are", "because", "been", "being", "but",
    "can", "could", "for", "from", "have", "into", "its", "more", "our",
    "should", "that", "the", "their", "there", "these", "this", "through",
    "was", "were", "which", "will", "with"
  ]);
  const frequencies = new Map();
  text.toLowerCase().match(/[a-z0-9]{3,}/g)?.forEach((word) => {
    if (!stopWords.has(word)) frequencies.set(word, (frequencies.get(word) || 0) + 1);
  });
  const ranked = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/[a-z0-9]{3,}/g) || [];
    const score = words.reduce((total, word) => total + (stopWords.has(word) ? 0 : frequencies.get(word) || 0), 0);
    return { sentence, index, score: score / Math.max(words.length, 1) };
  });

  return ranked
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 3)
    .sort((left, right) => left.index - right.index)
    .map(({ sentence }) => sentence)
    .join(" ");
}

function EvaluationQuestion({ name, label, register, validate, checked, onSelect, error, children }) {
  const radioRegistration = register(name, { validate });

  return (
    <FormControl error={Boolean(error)} fullWidth>
      <Box
        sx={{
          display: "flex",
          minHeight: 44,
          flexDirection: "column",
          justifyContent: "center",
          px: 1,
          py: 0.5,
          border: "1px solid #dfe4ea",
          borderRadius: 1.5,
          bgcolor: "#fff"
        }}
      >
        <FormControlLabel
          sx={{ m: 0, width: "100%", "& .MuiFormControlLabel-label": { color: "#132e4c", fontSize: 11, fontWeight: 700 } }}
          control={
            <Radio
              size="small"
              value="yes"
              checked={checked}
              {...radioRegistration}
              onChange={(event) => {
                radioRegistration.onChange(event);
                onSelect();
              }}
            />
          }
          label={label}
        />
        {children}
      </Box>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
}

function EvaluationDetailFields({ name, label }) {
  const {
    control,
    register,
    watch,
    formState: { errors }
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const values = watch(name) || [];
  const fieldName = name.split(".").pop();
  const rowErrors = errors?.evaluationResearch?.[fieldName];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr) 34px", md: "minmax(0, 1fr) 34px minmax(0, 0.85fr)" },
        alignItems: "start",
        columnGap: 1.5,
        rowGap: 1,
        ml: 3.5,
        mt: 1
      }}
    >
      <Typography sx={{ ...fieldLabelSx, gridColumn: { xs: "1 / -1", md: "1" } }}>
        Details (max 500 words) <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
      </Typography>
      <Box sx={{ display: { xs: "none", md: "block" } }} />
      <Typography sx={{ ...fieldLabelSx, gridColumn: { xs: "1 / -1", md: "3" }, display: "flex", alignItems: "center", gap: 0.5 }}>
        Upload Supporting Document <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
        <Info size={12} color="#1976d2" title="Select a supporting document" />
      </Typography>
      {fields.map((row, index) => {
        const rowError = rowErrors?.[index];
        const attachment = values[index]?.attachment;
        const attachmentName = attachment?.[0]?.name || "";
        const isFirstRow = index === 0;
        const detailsPath = `${name}.${index}.details`;
        const attachmentPath = `${name}.${index}.attachment`;

        return (
          <Box
            key={row.id}
            sx={{
              display: "grid",
              gridColumn: "1 / -1",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr) 34px",
                md: "minmax(0, 1fr) 34px minmax(0, 0.85fr)"
              },
              alignItems: "start",
              columnGap: 1.5,
              rowGap: 1,
              "& > *": { minWidth: 0 }
            }}
          >
            <TextField
              placeholder={`Enter ${label.toLowerCase()} details (max 500 words)`}
              fullWidth
              multiline
              minRows={1}
              size="small"
              sx={inputSx}
              error={Boolean(rowError?.details)}
              helperText={rowError?.details?.message}
              {...register(detailsPath, {
                required: `${label} details are required.`,
                validate: (value) => (
                  value.trim().split(/\s+/).filter(Boolean).length <= 500
                    || "Details must be 500 words or fewer."
                )
              })}
            />
            {isFirstRow ? (
              <IconButton
                type="button"
                aria-label={`Add ${label.toLowerCase()} details`}
                onClick={() => append({ details: "", attachment: null })}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  bgcolor: "#0b6037",
                  color: "#fff",
                  "&:hover": { bgcolor: "#07522f" }
                }}
              >
                <Plus size={16} />
              </IconButton>
            ) : (
              <IconButton
                type="button"
                aria-label={`Remove ${label.toLowerCase()} detail ${index + 1}`}
                onClick={() => remove(index)}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  bgcolor: "#e52b2e",
                  color: "#fff",
                  "&:hover": { bgcolor: "#c81e24" }
                }}
              >
                <Trash2 size={16} />
              </IconButton>
            )}
            {isFirstRow && (
              <Box sx={{ gridColumn: { xs: "1 / -1", md: "3" }, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    minHeight: 34,
                    alignItems: "center",
                    overflow: "hidden",
                    border: "1px solid #dce2e8",
                    borderRadius: 1,
                    bgcolor: "#fff"
                  }}
                >
                  <Button
                    component="label"
                    sx={{
                      height: 32,
                      px: 1.5,
                      borderRight: "1px solid #dce2e8",
                      borderRadius: 0,
                      color: "#132e4c",
                      bgcolor: "#f1f4f8",
                      fontSize: 10,
                      textTransform: "none",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      {...register(attachmentPath, { required: "A supporting document is required." })}
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
                    {attachmentName || "No file chosen"}
                  </Typography>
                </Box>
                {rowError?.attachment && (
                  <FormHelperText error sx={{ m: 0 }}>
                    {rowError.attachment.message}
                  </FormHelperText>
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function EvaluationResearchStep() {
  const [searchParams] = useSearchParams();
  const {
    register,
    getValues,
    setValue,
    clearErrors,
    watch,
    formState: { errors }
  } = useFormContext();
  const [summaryStatus, setSummaryStatus] = useState("");
  const [evaluationLoading, setEvaluationLoading] = useState(true);
  const [evaluationError, setEvaluationError] = useState("");
  const researchAspects = watch("evaluationResearch.researchAspects") || "";
  const monitoringAnnually = watch("evaluationResearch.monitoringAnnually");
  const midtermEvaluation = watch("evaluationResearch.midtermEvaluation");
  const researchError = errors?.evaluationResearch?.researchAspects;

  useEffect(() => {
    const controller = new AbortController();
    const schemeId = searchParams.get("schemeId");
    const accessToken = sessionStorage.getItem("campaJwt")?.trim();

    if (!schemeId || schemeId === "authenticated") {
      setEvaluationLoading(false);
      return;
    }

    if (!accessToken || accessToken.toLowerCase() === "authenticated") {
      setEvaluationLoading(false);
      return;
    }

    const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;

    fetch(apiUrls.evaluationResearch(schemeId), {
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
        console.log("Evaluation Research API Response:", data);

        if (data) {
          // Set evaluation type (ANNUAL or MIDTERM)
          if (data.evaluationType) {
            if (data.evaluationType === "ANNUAL") {
              setValue("evaluationResearch.monitoringAnnually", "yes", { shouldDirty: false });
              setValue("evaluationResearch.midtermEvaluation", "", { shouldDirty: false });
            } else if (data.evaluationType === "MIDTERM") {
              setValue("evaluationResearch.midtermEvaluation", "yes", { shouldDirty: false });
              setValue("evaluationResearch.monitoringAnnually", "", { shouldDirty: false });
            }
          }

          // Set evaluation details
          if (data.evaluationDetails && Array.isArray(data.evaluationDetails)) {
            const detailsFieldName = data.evaluationType === "ANNUAL" 
              ? "evaluationResearch.monitoringAnnuallyItems"
              : "evaluationResearch.midtermEvaluationItems";
            
            const formattedDetails = data.evaluationDetails.map((detail) => ({
              details: detail || "",
              attachment: data.documentFileName ? [{ name: data.documentFileName, path: data.documentFileName }] : []
            }));

            // We need to use the fieldArray replace function, but we don't have access to it here
            // So we'll set them individually
            formattedDetails.forEach((detail, index) => {
              setValue(`${detailsFieldName}.${index}.details`, detail.details, { shouldDirty: false });
              if (detail.attachment.length > 0) {
                setValue(`${detailsFieldName}.${index}.attachment`, detail.attachment, { shouldDirty: false });
              }
            });
          }

          // Set research aspects
          if (data.researchAspects) {
            setValue("evaluationResearch.researchAspects", data.researchAspects, { shouldDirty: false });
          }

          // Set research highlights/unique highlights
          if (data.uniqueHighlights) {
            setValue("evaluationResearch.researchHighlights", data.uniqueHighlights, { shouldDirty: false });
          }

          setEvaluationError("");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching evaluation research:", error);
          setEvaluationError(`Unable to load evaluation research: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setEvaluationLoading(false);
        }
      });

    return () => controller.abort();
  }, [searchParams, setValue]);

  const validateEvaluationSelection = () => (
    getValues("evaluationResearch.monitoringAnnually") === "yes"
      || getValues("evaluationResearch.midtermEvaluation") === "yes"
      || "Select an evaluation commitment."
  );
  const clearEvaluationSelectionErrors = () => clearErrors([
    "evaluationResearch.monitoringAnnually",
    "evaluationResearch.midtermEvaluation"
  ]);

  const summarizeResearch = () => {
    const summary = extractiveSummary(researchAspects.trim());
    if (!summary) {
      setSummaryStatus("Enter research aspects before generating a summary.");
      return;
    }

    setValue("evaluationResearch.researchHighlights", summary, {
      shouldDirty: true,
      shouldValidate: true
    });
    setSummaryStatus("Summary generated locally. Review and edit it before continuing.");
  };

  return (
    <>
      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h1" sx={sectionTitleSx}>
          7. Envisaged Monitoring and Evaluation Framework
        </Typography>
        <Box sx={{ display: "grid", gap: 1.25 }}>
          <EvaluationQuestion
            name="evaluationResearch.monitoringAnnually"
            label="7.1 Monitoring and Evaluation Annually *"
            register={register}
            validate={validateEvaluationSelection}
            checked={monitoringAnnually === "yes"}
            onSelect={() => {
              setValue("evaluationResearch.monitoringAnnually", "yes", { shouldDirty: true });
              setValue("evaluationResearch.midtermEvaluation", "", { shouldDirty: true });
              clearEvaluationSelectionErrors();
            }}
            error={errors?.evaluationResearch?.monitoringAnnually}
          >
            {monitoringAnnually === "yes" && (
              <EvaluationDetailFields
                name="evaluationResearch.monitoringAnnuallyItems"
                label="Monitoring and evaluation"
              />
            )}
          </EvaluationQuestion>
          <EvaluationQuestion
            name="evaluationResearch.midtermEvaluation"
            label="7.2 Midterm Evaluation *"
            register={register}
            validate={validateEvaluationSelection}
            checked={midtermEvaluation === "yes"}
            onSelect={() => {
              setValue("evaluationResearch.midtermEvaluation", "yes", { shouldDirty: true });
              setValue("evaluationResearch.monitoringAnnually", "", { shouldDirty: true });
              clearEvaluationSelectionErrors();
            }}
            error={errors?.evaluationResearch?.midtermEvaluation}
          >
            {midtermEvaluation === "yes" && (
              <EvaluationDetailFields
                name="evaluationResearch.midtermEvaluationItems"
                label="Midterm evaluation"
              />
            )}
          </EvaluationQuestion>
        </Box>
      </Paper>

      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h2" sx={sectionTitleSx}>
          8. Research Aspects
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" }, alignItems: "start", columnGap: 2, rowGap: 1.5 }}>
          <Box>
            <Typography component="label" htmlFor="research-aspects" sx={fieldLabelSx}>
              8.1 Research Aspects <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </Typography>
            <TextField
              id="research-aspects"
              placeholder="Enter Research Aspects"
              fullWidth
              multiline
              minRows={1}
              size="small"
              sx={inputSx}
              error={Boolean(researchError)}
              helperText={researchError?.message}
              {...register("evaluationResearch.researchAspects", {
                required: "Research aspects are required."
              })}
            />
          </Box>
          <Button
            type="button"
            onClick={summarizeResearch}
            startIcon={<Sparkles size={14} />}
            sx={{
              mt: { xs: 0, md: 2.5 },
              minHeight: 32,
              px: 2,
              borderRadius: 1.5,
              bgcolor: "#0086c7",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px #0002",
              "&:hover": { bgcolor: "#006fa8" }
            }}
          >
            Summarize for research aspects
          </Button>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography component="label" htmlFor="research-highlights" sx={fieldLabelSx}>
              8.2 Unique Highlight Including Research Aspects
            </Typography>
            <TextField
              id="research-highlights"
              placeholder="Enter unique highlights and research aspects"
              fullWidth
              multiline
              minRows={1}
              size="small"
              sx={inputSx}
              {...register("evaluationResearch.researchHighlights")}
            />
            {summaryStatus && (
              <Typography role={researchAspects.trim() ? "status" : "alert"} sx={{ mt: 0.5, color: researchAspects.trim() ? "#087638" : "error.main", fontSize: 11 }}>
                {summaryStatus}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </>
  );
}

export default EvaluationResearchStep;
