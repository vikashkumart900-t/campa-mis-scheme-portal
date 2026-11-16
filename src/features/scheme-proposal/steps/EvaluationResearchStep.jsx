import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Paper,
  Radio,
  TextField,
  Typography
} from "@mui/material";
import { Sparkles } from "lucide-react";
import { useFormContext } from "react-hook-form";

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
const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 12 },
  "& .MuiInputBase-input": { py: 1 },
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

function EvaluationQuestion({ name, label, register, error }) {
  return (
    <FormControl error={Boolean(error)} fullWidth>
      <Box
        sx={{
          display: "flex",
          minHeight: 44,
          alignItems: "center",
          px: 1,
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
              {...register(name, { required: "This evaluation commitment is required." })}
            />
          }
          label={label}
        />
      </Box>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
}

function EvaluationResearchStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext();
  const [summaryStatus, setSummaryStatus] = useState("");
  const researchAspects = watch("evaluationResearch.researchAspects") || "";
  const researchError = errors?.evaluationResearch?.researchAspects;

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
        <Typography component="h1" sx={{ mb: 1.5, color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
          7. Envisaged Monitoring and Evaluation Framework
        </Typography>
        <Box sx={{ display: "grid", gap: 1.25 }}>
          <EvaluationQuestion
            name="evaluationResearch.monitoringAnnually"
            label="7.1 Monitoring and Evaluation Annually *"
            register={register}
            error={errors?.evaluationResearch?.monitoringAnnually}
          />
          <EvaluationQuestion
            name="evaluationResearch.midtermEvaluation"
            label="7.2 Midterm Evaluation *"
            register={register}
            error={errors?.evaluationResearch?.midtermEvaluation}
          />
        </Box>
      </Paper>

      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h2" sx={{ mb: 1.5, color: "#132e4c", fontSize: 14, fontWeight: 700 }}>
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
