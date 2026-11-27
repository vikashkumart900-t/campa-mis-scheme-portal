import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
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
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { apiUrls } from "../../api/urls";
import { openProposalPdfPreview } from "../../api/proposalPdf";

const formatOutlay = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
};

const initialMeetingForm = {
  meetingDate: "",
  agendaItem: "",
  agendaSubject: "",
  decision: "",
  remarks: "",
  minutes: null
};

const normalizeStateName = (name) => name.trim().toLowerCase();

const getParticipatingStates = (stateNames) => {
  if (Array.isArray(stateNames)) {
    return stateNames.flatMap((state) => {
      const name = typeof state === "string" ? state : state?.stateName || state?.name;
      return typeof name === "string"
        ? name.split(",").map((stateName) => ({
          name: stateName.trim(),
          stateCode: typeof state === "string" ? null : state?.stateCode ?? null
        })).filter((item) => item.name)
        : [];
    });
  }

  if (typeof stateNames === "string") {
    return stateNames.split(",").map((name) => name.trim()).filter(Boolean)
      .map((name) => ({ name, stateCode: null }));
  }

  return [];
};

function EcGbDecisionPage({ schemeId }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [ecForm, setEcForm] = useState(initialMeetingForm);
  const [gbForm, setGbForm] = useState(initialMeetingForm);
  const [stateDecisions, setStateDecisions] = useState([]);
  const [formError, setFormError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!schemeId) {
        setError("No scheme ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem("campaJwt");
        const response = await fetch(apiUrls.getListingProposalById(schemeId), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch proposal: ${response.status}`);
        }

        const data = await response.json();
        const participatingStates = getParticipatingStates(data.stateNames);
        if (participatingStates.some((state) => state.stateCode == null)) {
          const statesResponse = await fetch(apiUrls.states);
          if (!statesResponse.ok) {
            throw new Error(`Failed to fetch state codes: ${statesResponse.status}`);
          }
          const stateOptions = await statesResponse.json();
          if (!Array.isArray(stateOptions)) {
            throw new Error("The state API returned unexpected data.");
          }

          participatingStates.forEach((state) => {
            if (state.stateCode != null) return;
            const match = stateOptions.find((option) =>
              typeof option?.stateName === "string"
              && normalizeStateName(option.stateName) === normalizeStateName(state.name)
            );
            if (match) state.stateCode = match.stateCode;
          });
        }
        if (participatingStates.some((state) =>
          state.stateCode == null
          || state.stateCode === ""
          || !Number.isInteger(Number(state.stateCode))
        )) {
          throw new Error("Unable to determine a valid state code for one or more participating states.");
        }
        setProposal({
          schemeId: data.schemeId,
          schemeName: data.schemeName,
          proposalId: data.proposalId,
          schemeDuration: data.schemeDuration,
          stateNames: participatingStates.map((state) => state.name).join(", ") || "N/A",
          participatingStates,
          proposedFinancialOutlay: data.proposedFinancialOutlay
        });
        setStateDecisions(participatingStates.map(({ name, stateCode }) => ({
          name,
          stateCode: Number(stateCode),
          selected: false
        })));
      } catch (fetchError) {
        setProposal(null);
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [schemeId]);

  const handleReview = async () => {
    setPdfLoading(true);
    setError("");
    try {
      await openProposalPdfPreview(proposal.schemeId);
    } catch (previewError) {
      setError(previewError.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const updateMeetingField = (setForm, field) => (event) => {
    setForm((currentForm) => ({ ...currentForm, [field]: event.target.value }));
    setFormError("");
    setSubmitSuccess(false);
  };

  const handleMinutesChange = (setForm) => (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setFormError("Meeting minutes must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (file && file.type !== "application/pdf") {
      setFormError("Meeting minutes must be a PDF file.");
      event.target.value = "";
      return;
    }

    setForm((currentForm) => ({ ...currentForm, minutes: file }));
    setFormError("");
    setSubmitSuccess(false);
  };

  const handleSubmitDecisions = async (event) => {
    event.preventDefault();
    setFormError("");
    setSubmitSuccess(false);

    const requiredMeetingFields = (form) =>
      form.meetingDate
      && form.agendaItem.trim()
      && form.agendaSubject.trim()
      && form.decision
      && form.remarks.trim()
      && form.minutes;

    const gbDecisionRequired = ecForm.decision === "approved";
    if (!requiredMeetingFields(ecForm) || (gbDecisionRequired && !requiredMeetingFields(gbForm))) {
      setFormError(gbDecisionRequired
        ? "Complete all required EC and GB fields and attach both meeting-minutes PDFs."
        : "Complete all required EC fields and attach the EC meeting-minutes PDF.");
      return;
    }

    const request = {
      ecDecision: {
        meetingDate: ecForm.meetingDate,
        agendaItemNo: ecForm.agendaItem.trim(),
        agendaSubject: ecForm.agendaSubject.trim(),
        ecDecision: ecForm.decision.toUpperCase(),
        ecRemarks: ecForm.remarks.trim()
      }
    };
    if (gbDecisionRequired) {
      request.gbDecision = {
        meetingDate: gbForm.meetingDate,
        agendaItemNo: gbForm.agendaItem.trim(),
        agendaSubject: gbForm.agendaSubject.trim(),
        gbDecision: gbForm.decision.toUpperCase(),
        gbRemarks: gbForm.remarks.trim(),
        stateDecisions: stateDecisions.map((state) => ({
          stateCode: String(state.stateCode).padStart(2, "0"),
          isSelectedForStateApo: state.selected,
          stateGbDecision: state.selected ? "APPROVED" : "PENDING"
        }))
      };
    }

    try {
      const token = sessionStorage.getItem("campaJwt")?.trim();
      if (!token || token.toLowerCase() === "authenticated") {
        throw new Error("Your session is missing an access token. Please sign in again.");
      }
      const authorization = /^Bearer\s/i.test(token) ? token : `Bearer ${token}`;
      const formData = new FormData();
      formData.append("request", JSON.stringify(request));
      formData.append("ecMinutesFile", ecForm.minutes);
      if (gbDecisionRequired) formData.append("gbMinutesFile", gbForm.minutes);

      setSubmitting(true);
      const response = await fetch(apiUrls.misEcGbDecision(proposal.schemeId), {
        method: "POST",
        headers: { Authorization: authorization },
        body: formData
      });
      const responseText = await response.text();
      let result;
      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { message: responseText };
        }
      }
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
      }
      setSubmitSuccess(true);
    } catch (submitError) {
      setFormError(`Unable to submit EC/GB decisions: ${submitError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetDecisionForms = () => {
    setEcForm(initialMeetingForm);
    setGbForm(initialMeetingForm);
    setStateDecisions((currentStates) =>
      currentStates.map((state) => ({ ...state, selected: false }))
    );
    setFormError("");
    setSubmitSuccess(false);
  };

  const meetingSectionSx = {
    overflow: "hidden",
    border: "1px solid #d5e0d7",
    borderRadius: 2,
    bgcolor: "#fff"
  };

  const sectionHeadingSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    px: 2,
    py: 1.25,
    bgcolor: "#e8f7e9",
    color: "#173d29"
  };

  const fieldSx = {
    "& .MuiInputLabel-root": { fontSize: 12, fontWeight: 600 },
    "& .MuiInputBase-input": { fontSize: 12 },
    "& .MuiOutlinedInput-root": { borderRadius: 1 }
  };

  const actionButtonSx = {
    minWidth: 0,
    px: 1,
    py: 0.35,
    borderRadius: 1,
    borderColor: "#16813b",
    color: "#08752c",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "none",
    "&:hover": { borderColor: "#0f6b30", bgcolor: "#f3fbf5" }
  };

  return (
    <>
      {error && <Alert severity="error" role="alert" sx={{ mb: 1 }}>{error}</Alert>}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e1e9e3",
          borderRadius: 2,
          bgcolor: "#fff",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(31, 56, 44, 0.06)"
        }}
      >
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#174b35" }}>
                {[
                  "S. No.",
                  "Scheme Name",
                  "Proposal ID",
                  "Scheme Duration",
                  "Participating States",
                  "Total Outlay",
                  "Actions"
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    align={heading === "Actions" ? "center" : "left"}
                    sx={{
                      py: 2,
                      px: 2.5,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: "#6a8176" }}>
                    Loading proposal...
                  </TableCell>
                </TableRow>
              ) : !proposal ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: "#6a8176" }}>
                    No proposal found
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow sx={{ "&:hover": { bgcolor: "#f9faf9" } }}>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, fontWeight: 500 }}>1</TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, minWidth: 220 }}>{proposal.schemeName}</TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13 }}>{proposal.proposalId}</TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13 }}>{proposal.schemeDuration}</TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, minWidth: 160 }}>{proposal.stateNames}</TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13 }}>{formatOutlay(proposal.proposedFinancialOutlay)}</TableCell>
                  <TableCell align="center" sx={{ py: 2.5, px: 2.5 }}>
                    <Button
                      size="small"
                      disabled={pdfLoading}
                      onClick={handleReview}
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                      variant="outlined"
                      sx={actionButtonSx}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {proposal && (
        <Box component="form" onSubmit={handleSubmitDecisions} sx={{ mt: 3 }}>
          <Typography component="h2" sx={{ mb: 2, color: "#23332d", fontSize: 18, fontWeight: 700, color: "#174b35", ml: 1 }}>
            Proposal Summary
          </Typography>

          {formError && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{formError}</Alert>}
          {submitSuccess && (
            <Alert severity="success" role="status" sx={{ mb: 2 }}>
              EC/GB decision submitted successfully.
            </Alert>
          )}

          <Stack spacing={2}>
            <Paper elevation={0} sx={meetingSectionSx}>
              <Box sx={sectionHeadingSx}>
                <Box sx={{ width: 25, height: 25, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: "#17633d", color: "#fff", fontSize: 13, fontWeight: 700 }}>1</Box>
                <Typography component="h3" sx={{ flexGrow: 1, fontSize: 16, fontWeight: 700 }}>
                  Executive Committee (EC) Decision
                </Typography>
                <Typography sx={{
                  px: 1.5,
                  py: 0.4,
                  borderRadius: 5,
                  bgcolor: ecForm.decision === "returned" ? "#ffe1e1" : ecForm.decision === "approved" ? "#d8f3dc" : "#fff1c2",
                  color: ecForm.decision === "returned" ? "#9b3232" : ecForm.decision === "approved" ? "#17633d" : "#8a5b00",
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {ecForm.decision === "approved" ? "Approved" : ecForm.decision === "returned" ? "Returned" : "Pending"}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, p: 2 }}>
                <TextField
                  required
                  type="date"
                  label="EC Meeting Date"
                  value={ecForm.meetingDate}
                  onChange={updateMeetingField(setEcForm, "meetingDate")}
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={fieldSx}
                />
                <TextField
                  required
                  label="Agenda Item No."
                  placeholder="e.g., Item 4.1"
                  value={ecForm.agendaItem}
                  onChange={updateMeetingField(setEcForm, "agendaItem")}
                  size="small"
                  sx={fieldSx}
                />
                <TextField
                  required
                  label="Agenda / Subject"
                  value={ecForm.agendaSubject}
                  onChange={updateMeetingField(setEcForm, "agendaSubject")}
                  size="small"
                  sx={fieldSx}
                />

                <Box sx={{ gridColumn: { md: "1 / 2" } }}>
                  <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 700, color: "#26352d" }}>
                    EC Decision <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
                  </Typography>
                  <RadioGroup
                    row
                    value={ecForm.decision}
                    onChange={updateMeetingField(setEcForm, "decision")}
                  >
                    <FormControlLabel value="approved" control={<Radio size="small" />} label="Approved by EC" sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }} />
                    <FormControlLabel value="returned" control={<Radio size="small" />} label="Returned by EC" sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }} />
                  </RadioGroup>
                </Box>
                <TextField
                  required
                  label="EC Remarks / Recommendation"
                  value={ecForm.remarks}
                  onChange={updateMeetingField(setEcForm, "remarks")}
                  size="small"
                  sx={{ ...fieldSx, gridColumn: { xs: "1", md: "2 / 4" } }}
                />
                <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                  <Typography sx={{ mb: 0.75, fontSize: 12, fontWeight: 700, color: "#26352d" }}>
                    Upload EC Meeting Minutes (PDF, max 10 MB) <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
                  </Typography>
                  <Button component="label" variant="outlined" sx={{ textTransform: "none", borderStyle: "dashed", color: "#174b35", borderColor: "#9bac9f" }}>
                    {ecForm.minutes?.name || "Choose EC meeting minutes"}
                    <input hidden type="file" accept="application/pdf,.pdf" onChange={handleMinutesChange(setEcForm)} />
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Governing Body (GB) Decision Section will be enabled only if the EC decision is "approved" */}
            {ecForm.decision === "approved" && (
              <Paper elevation={0} sx={meetingSectionSx}>
                <Box sx={{ ...sectionHeadingSx, bgcolor: "#edf0f4", color: "#263238" }}>
                  <Box sx={{ width: 25, height: 25, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: "#4b5158", color: "#fff", fontSize: 13, fontWeight: 700 }}>2</Box>
                  <Typography component="h3" sx={{ flexGrow: 1, fontSize: 16, fontWeight: 700 }}>
                    Governing Body (GB) Decision
                  </Typography>
                  <Typography sx={{
                    px: 1.5,
                    py: 0.4,
                    borderRadius: 5,
                    bgcolor: gbForm.decision === "returned" ? "#ffe1e1" : gbForm.decision === "approved" ? "#d8f3dc" : "#fff1c2",
                    color: gbForm.decision === "returned" ? "#9b3232" : gbForm.decision === "approved" ? "#17633d" : "#8a5b00",
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    {gbForm.decision === "approved" ? "Approved" : gbForm.decision === "returned" ? "Returned" : "Pending"}
                  </Typography>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1.15fr" }, gap: 2, p: 2 }}>
                  <Stack spacing={1.75}>
                    <TextField
                      required
                      type="date"
                      label="GB Meeting Date"
                      value={gbForm.meetingDate}
                      onChange={updateMeetingField(setGbForm, "meetingDate")}
                      size="small"
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={fieldSx}
                    />
                    <TextField
                      required
                      label="Agenda Item No."
                      placeholder="e.g., Item 5.2"
                      value={gbForm.agendaItem}
                      onChange={updateMeetingField(setGbForm, "agendaItem")}
                      size="small"
                      sx={fieldSx}
                    />
                    <TextField
                      required
                      label="Agenda / Subject"
                      value={gbForm.agendaSubject}
                      onChange={updateMeetingField(setGbForm, "agendaSubject")}
                      size="small"
                      sx={fieldSx}
                    />
                    <Box>
                      <Typography sx={{ mb: 0.5, fontSize: 12, fontWeight: 700, color: "#26352d" }}>
                        GB Decision <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
                      </Typography>
                      <RadioGroup
                        row
                        value={gbForm.decision}
                        onChange={updateMeetingField(setGbForm, "decision")}
                      >
                        <FormControlLabel value="approved" control={<Radio size="small" />} label="Approved by GB" sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }} />
                        <FormControlLabel value="returned" control={<Radio size="small" />} label="Returned by GB" sx={{ "& .MuiFormControlLabel-label": { fontSize: 12 } }} />
                      </RadioGroup>
                    </Box>
                    <TextField
                      required
                      label="GB Remarks / Decision Note"
                      value={gbForm.remarks}
                      onChange={updateMeetingField(setGbForm, "remarks")}
                      multiline
                      minRows={2}
                      inputProps={{ maxLength: 500 }}
                      helperText={`${gbForm.remarks.length} / 500`}
                      sx={fieldSx}
                    />
                    <Box>
                      <Typography sx={{ mb: 0.75, fontSize: 12, fontWeight: 700, color: "#26352d" }}>
                        Upload GB Meeting Minutes (PDF, max 10 MB) <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
                      </Typography>
                      <Button component="label" variant="outlined" sx={{ textTransform: "none", borderStyle: "dashed", color: "#174b35", borderColor: "#9bac9f" }}>
                        {gbForm.minutes?.name || "Choose GB meeting minutes"}
                        <input hidden type="file" accept="application/pdf,.pdf" onChange={handleMinutesChange(setGbForm)} />
                      </Button>
                    </Box>
                  </Stack>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography component="h4" sx={{ mb: 1, fontSize: 13, fontWeight: 700, color: "#26352d" }}>
                      Participating States – GB Decision
                    </Typography>
                    {stateDecisions.length ? (
                      <>
                        <TableContainer sx={{ border: "1px solid #dfe7e1", borderRadius: 1 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#e5f3e8" }}>
                                <TableCell align="left" sx={{ py: 0.5 }}>
                                  <Checkbox
                                    size="small"
                                    aria-label="Approve all participating states"
                                    checked={stateDecisions.length > 0 && stateDecisions.every((state) => state.selected)}
                                    indeterminate={stateDecisions.some((state) => state.selected) && !stateDecisions.every((state) => state.selected)}
                                    onChange={(event) => {
                                      setStateDecisions((currentStates) =>
                                        currentStates.map((state) => ({ ...state, selected: event.target.checked }))
                                      );
                                      setSubmitSuccess(false);
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ py: 1, fontSize: 11, fontWeight: 700 }}>S. No.</TableCell>
                                <TableCell sx={{ py: 1, fontSize: 11, fontWeight: 700 }}>State / UT</TableCell>
                                <TableCell sx={{ py: 1, fontSize: 11, fontWeight: 700 }}>GB Decision</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {stateDecisions.map((state, index) => (
                                <TableRow key={`${state.name}-${index}`}>
                                  <TableCell sx={{ py: 0.25 }}>
                                    <Checkbox
                                      size="small"
                                      aria-label={`Approve ${state.name} by GB`}
                                      checked={state.selected}
                                      onChange={(event) => {
                                        setStateDecisions((currentStates) =>
                                          currentStates.map((item, itemIndex) =>
                                            itemIndex === index
                                              ? { ...item, selected: event.target.checked }
                                              : item
                                          )
                                        );
                                        setSubmitSuccess(false);
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ py: 0.5, fontSize: 12 }}>{index + 1}</TableCell>
                                  <TableCell sx={{ py: 0.5, fontSize: 12 }}>{state.name}</TableCell>
                                  <TableCell sx={{ py: 0.5 }}>
                                    <Chip
                                      size="small"
                                      label={state.selected ? "Approved" : "Not Approved"}
                                      sx={{
                                        minWidth: 90,
                                        height: 24,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        bgcolor: state.selected ? "#d4f8d8" : "#ffe1e1",
                                        color: state.selected ? "#17633d" : "#9b3232"
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        <Typography sx={{ mt: 1, px: 1.5, py: 0.75, borderRadius: 1, bgcolor: "#fff1c2", textAlign: "center", fontSize: 12, fontWeight: 700, color: "#5b4610" }}>
                          GB-approved States: {stateDecisions.filter((state) => state.selected).length} of {stateDecisions.length}
                        </Typography>
                      </>
                    ) : (
                      <Alert severity="info">
                        No participating states were returned for this proposal.
                      </Alert>
                    )}
                  </Box>
                </Box>
              </Paper>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ minWidth: 160, textTransform: "none", bgcolor: "#064b2a", fontWeight: 700, "&:hover": { bgcolor: "#174b35" } }}
              >
                {submitting ? "Submitting..." : "Save & Continue"}
              </Button>
            </Box>
          </Stack>
        </Box>
      )}

    </>
  );
}

export default EcGbDecisionPage;
