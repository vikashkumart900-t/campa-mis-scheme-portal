import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { apiUrls } from "../../api/urls";
import { openProposalPdfPreview } from "../../api/proposalPdf";

const columns = [
  { label: "Proposal ID", width: "18%" },
  { label: "Scheme", width: "30%" },
  { label: "GB Meeting Date", width: "15%" },
  { label: "GB Decision", width: "12%" },
  { label: "GB-approved States", width: "16%" },
  { label: "Actions", width: "9%" }
];

const reviewCriteria = [
  "Proposal (technical) reviewed",
  "Financials and outlay verified",
  "EC & GB decisions and meeting minutes reviewed",
  "GB-approved participating States verified"
];

function formatMeetingDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

async function getResponseErrorMessage(response) {
  const responseText = await response.text();
  if (!responseText) return `Request failed with status ${response.status}`;

  try {
    const responseBody = JSON.parse(responseText);
    if (typeof responseBody?.message === "string" && responseBody.message.trim()) {
      return responseBody.message;
    }
    if (typeof responseBody?.error === "string" && responseBody.error.trim()) {
      return responseBody.error;
    }
  } catch {
    return responseText;
  }

  return responseText;
}

function isStateApproved(state) {
  return state?.isSelectedForStateApo === true
    || String(state?.stateGbDecision || "").toUpperCase() === "APPROVED";
}

function FinalReviewApprovalPage({ schemeId }) {
  const [gbDecisionData, setGbDecisionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reviewedItems, setReviewedItems] = useState(reviewCriteria.map(() => true));
  const [remarks, setRemarks] = useState("");
  const [decision, setDecision] = useState("approve");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchGbDecision = async () => {
      if (!schemeId) {
        setLoadError("A scheme ID is required to load GB decision details.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError("");
        const token = sessionStorage.getItem("campaJwt");
        if (!token) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        const response = await fetch(apiUrls.gbDecision(schemeId), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response));
        }

        const data = await response.json();
        if (!data || typeof data !== "object" || Array.isArray(data) || !Array.isArray(data.stateDecisions)) {
          throw new Error("The GB decision API returned unexpected data.");
        }

        setGbDecisionData(data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Error loading final review GB decision:", fetchError);
          setLoadError(fetchError.message);
          setGbDecisionData(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchGbDecision();
    return () => controller.abort();
  }, [schemeId]);

  const handleViewProposal = async () => {
    setPdfError("");
    setPdfLoading(true);
    try {
      await openProposalPdfPreview(gbDecisionData?.schemeId);
    } catch (previewError) {
      setPdfError(previewError.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const numericSchemeId = Number(gbDecisionData?.schemeId || schemeId);
    if (!Number.isSafeInteger(numericSchemeId) || numericSchemeId <= 0) {
      setSubmitError("A valid scheme ID is required to submit this decision.");
      return;
    }

    const campaRemarks = remarks.trim();
    if (!campaRemarks) {
      setSubmitError("Enter review remarks before submitting.");
      return;
    }

    const token = sessionStorage.getItem("campaJwt");
    if (!token) {
      setSubmitError("Your session has expired. Please sign in again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(apiUrls.updateRoleStatus, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          schemeId: numericSchemeId,
          roleCode: "NATIONAL_CAMPA",
          status: decision === "approve" ? "APPROVED" : "REVERTED",
          hodRemarks: null,
          pdRemarks: null,
          campaRemarks
        })
      });

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response));
      }

      setSubmitSuccess("National CAMPA decision submitted successfully.");
    } catch (submitFailure) {
      console.error("Error submitting National CAMPA decision:", submitFailure);
      setSubmitError(submitFailure.message);
    } finally {
      setSubmitting(false);
    }
  };

  const approvedParticipatingStates = (gbDecisionData?.stateDecisions || []).filter(isStateApproved);
  const approvedStatesLabel = approvedParticipatingStates.length
    ? `${approvedParticipatingStates.length} (${approvedParticipatingStates.map((state) => state.stateName || state.stateCode).join(", ")})`
    : "0";
  const gbDecisionStatus = gbDecisionData?.gbDecision || "—";

  return (
    <Stack spacing={2.5}>
      {pdfError && <Alert severity="error" role="alert">{pdfError}</Alert>}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e1e9e3",
          borderRadius: 1.5,
          boxShadow: "0 2px 8px rgba(31, 56, 44, 0.06)",
          overflowX: "hidden"
        }}
      >
        <Table sx={{ width: "100%", tableLayout: "fixed" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#174b35", borderBottom: "2px solid #e1e9e3" }}>
              {columns.map(({ label, width }, index) => (
                <TableCell
                  key={label || `action-${index}`}
                  align={index === columns.length - 1 ? "center" : "left"}
                  sx={{
                    width,
                    py: { xs: 1, sm: 1.5, md: 2 },
                    px: { xs: 0.5, sm: 1, md: 2.5 },
                    color: "#fff",
                    fontSize: { xs: 8, sm: 10, md: 12 },
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: { xs: 0, sm: 0.25, md: 0.5 },
                    overflowWrap: "anywhere"
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ borderBottom: "1px solid #e1e9e3", "&:hover": { bgcolor: "#f9faf9" } }}>
              <TableCell sx={{ py: { xs: 1, sm: 1.5, md: 2.5 }, px: { xs: 0.5, sm: 1, md: 2.5 }, fontSize: { xs: 9, sm: 11, md: 13 }, color: "#23332d", fontWeight: 500, overflowWrap: "anywhere" }}>
                {loading ? "Loading..." : gbDecisionData?.proposalID || gbDecisionData?.proposalId || "—"}
              </TableCell>
              <TableCell sx={{ py: { xs: 1, sm: 1.5, md: 2.5 }, px: { xs: 0.5, sm: 1, md: 2.5 }, fontSize: { xs: 9, sm: 11, md: 13 }, color: "#23332d", fontWeight: 500, overflowWrap: "anywhere" }}>
                {loading ? "Loading..." : gbDecisionData?.schemeName || "—"}
              </TableCell>
              <TableCell sx={{ py: { xs: 1, sm: 1.5, md: 2.5 }, px: { xs: 0.5, sm: 1, md: 2.5 }, fontSize: { xs: 9, sm: 11, md: 13 }, color: "#46564e", overflowWrap: "anywhere" }}>
                {loading ? "Loading..." : formatMeetingDate(gbDecisionData?.meetingDate)}
              </TableCell>
              <TableCell sx={{ py: { xs: 1, sm: 1.5, md: 2.5 }, px: { xs: 0.5, sm: 1, md: 2.5 } }}>
                <Chip
                  label={gbDecisionStatus === "APPROVED"
                    ? "Approved"
                    : gbDecisionStatus === "—"
                      ? gbDecisionStatus
                      : gbDecisionStatus}
                  size="small"
                  sx={{
                    height: "auto",
                    maxWidth: "100%",
                    bgcolor: gbDecisionStatus === "APPROVED" ? "#e4f5e8" : "#f1f3f2",
                    color: gbDecisionStatus === "APPROVED" ? "#17633d" : "#46564e",
                    fontSize: { xs: 8, sm: 9, md: 10 },
                    fontWeight: 700,
                    "& .MuiChip-label": {
                      px: { xs: 0.5, sm: 1 },
                      py: 0.35,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere"
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ py: { xs: 1, sm: 1.5, md: 2.5 }, px: { xs: 0.5, sm: 1, md: 2.5 }, fontSize: { xs: 9, sm: 11, md: 13 }, color: "#46564e", overflowWrap: "anywhere" }}>
                {loading ? "Loading..." : approvedStatesLabel}
              </TableCell>
              <TableCell align="center" sx={{ py: { xs: 1, sm: 1.5, md: 2.5 }, px: { xs: 0.25, sm: 0.5, md: 1 } }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PictureAsPdfOutlinedIcon />}
                  disabled={pdfLoading || loading || !gbDecisionData?.schemeId}
                  onClick={handleViewProposal}
                  sx={{
                    minWidth: 0,
                    maxWidth: "100%",
                    px: { xs: 0.25, sm: 0.5, md: 1 },
                    py: 0.45,
                    borderColor: "#16813b",
                    color: "#08752c",
                    fontSize: { xs: 8, sm: 9, md: 11 },
                    fontWeight: 700,
                    textTransform: "none",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    "& .MuiButton-startIcon": {
                      mr: { xs: 0.25, sm: 0.5 },
                      ml: 0
                    }
                  }}
                >
                  {pdfLoading ? "Opening..." : "View Proposal (PDF)"}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box component="form" onSubmit={handleSubmit}>
        {loadError && <Alert severity="error" role="alert" sx={{ mb: 1.5 }}>{loadError}</Alert>}
        {submitError && <Alert severity="error" role="alert" sx={{ mb: 1.5 }}>{submitError}</Alert>}
        {submitSuccess && <Alert severity="success" role="status" sx={{ mb: 1.5 }}>{submitSuccess}</Alert>}
        <Typography component="h2" sx={{ mb: 1.5, color: "#23332d", fontSize: 18, fontWeight: 700 }}>
          Proposal Summary
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 0.8fr) minmax(0, 1.2fr)" },
            gap: 1.5
          }}
        >
          <Paper elevation={0} sx={{ border: "1px solid #d5e7d8", borderRadius: 1.5, overflow: "hidden" }}>
            <Box sx={{ px: 1.5, py: 1, bgcolor: "#d9f2dc" }}>
              <Typography sx={{ color: "#174b35", fontSize: 14, fontWeight: 700 }}>
                GB-approved Participating States
              </Typography>
            </Box>
            <TableContainer sx={{ px: 1.25, py: 1 }}>
              <Table size="small" sx={{ border: "1px solid #dfe8e1", borderRadius: 1 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#eaf7eb" }}>
                    <TableCell sx={{ width: "22%", py: 0.75, fontSize: 11, fontWeight: 700 }}>S. No.</TableCell>
                    <TableCell sx={{ py: 0.75, fontSize: 11, fontWeight: 700 }}>State / UT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 1 }}>
                        <CircularProgress size={18} aria-label="Loading approved states" />
                      </TableCell>
                    </TableRow>
                  ) : approvedParticipatingStates.length ? (
                    approvedParticipatingStates.map((state, index) => (
                      <TableRow key={state.gbStateDecisionId || state.stateCode}>
                        <TableCell sx={{ py: 0.75, fontSize: 12 }}>{index + 1}</TableCell>
                        <TableCell sx={{ py: 0.75, fontSize: 12 }}>{state.stateName || state.stateCode}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 1, color: "#6a8176", fontSize: 12 }}>
                        No GB-approved states
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper elevation={0} sx={{ border: "1px solid #d5e7d8", borderRadius: 1.5, overflow: "hidden" }}>
            <Box sx={{ px: 1.5, py: 1, bgcolor: "#d9f2dc" }}>
              <Typography sx={{ color: "#174b35", fontSize: 14, fontWeight: 700 }}>
                National CAMPA Review
              </Typography>
            </Box>
            <Stack spacing={0.25} sx={{ px: 1.5, py: 1 }}>
              {reviewCriteria.map((criterion, index) => (
                <FormControlLabel
                  key={criterion}
                  control={
                    <Checkbox
                      size="small"
                      checked={reviewedItems[index]}
                      onChange={(event) => {
                        setReviewedItems((current) =>
                          current.map((checked, itemIndex) =>
                            itemIndex === index ? event.target.checked : checked
                          )
                        );
                      }}
                      sx={{ py: 0.25, color: "#9bb6a0", "&.Mui-checked": { color: "#17763c" } }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 11, color: "#23332d" }}>{criterion}</Typography>}
                  sx={{ m: 0, minHeight: 23 }}
                />
              ))}
              <Typography sx={{ mt: 0.5, mb: 0.25, color: "#23332d", fontSize: 11, fontWeight: 700 }}>
                Review Remarks <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value.slice(0, 500))}
                placeholder="Enter review remarks / observations (max 500 characters)"
                slotProps={{ htmlInput: { maxLength: 500, "aria-label": "Review remarks" } }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: 11 },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#cfdccf" }
                }}
              />
              <Typography sx={{ color: "#46564e", fontSize: 10, textAlign: "right" }}>
                {remarks.length} / 500
              </Typography>
            </Stack>
          </Paper>
        </Box>

        <Paper elevation={0} sx={{ mt: 1.5, border: "1px solid #d5e7d8", borderRadius: 1.5, overflow: "hidden" }}>
          <Box sx={{ px: 1.5, py: 0.75, bgcolor: "#d9f2dc" }}>
            <Typography sx={{ color: "#174b35", fontSize: 14, fontWeight: 700 }}>
              Final Decision – National CAMPA <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </Typography>
          </Box>
          <RadioGroup
            row
            value={decision}
            onChange={(event) => setDecision(event.target.value)}
            sx={{ px: 1.5, py: 0.5, columnGap: { xs: 1, sm: 4 } }}
          >
            <FormControlLabel
              value="approve"
              control={<Radio size="small" sx={{ color: "#9bb6a0", "&.Mui-checked": { color: "#17763c" } }} />}
              label={<Typography sx={{ fontSize: 11, fontWeight: 600, color: "#23332d" }}>Approve Proposal</Typography>}
              sx={{ m: 0 }}
            />
            <FormControlLabel
              value="clarification"
              control={<Radio size="small" sx={{ color: "#9bb6a0", "&.Mui-checked": { color: "#17763c" } }} />}
              label={<Typography sx={{ fontSize: 11, color: "#23332d" }}>Return for Clarification</Typography>}
              sx={{ m: 0 }}
            />
          </RadioGroup>
        </Paper>

        <Stack direction="row" justifyContent="flex-end" spacing={1.25} sx={{ mt: 1.5 }}>
          <Button
            type="submit"
            disabled={submitting || loading || !gbDecisionData}
            variant="contained"
            sx={{ minWidth: 150, bgcolor: "#064b2a", fontSize: 12, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#174b35" }}}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}

export default FinalReviewApprovalPage;
