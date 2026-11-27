import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { useSearchParams } from "react-router-dom";
import { openProposalPdfPreview } from "../../api/proposalPdf";
import { apiUrls } from "../../api/urls";
import CwlwUserRegistrationDialog from "../../components/user-registration/CwlwUserRegistrationDialog";

const headings = [
  "Proposal ID",
  "Scheme",
  "Campa Approval Date",
  "GB-Approved States",
  "Actions"
];

function formatApprovalDate(value) {
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

function getStateKey(state) {
  return String(state?.stateCode || state?.stateName || "");
}

function isRegistrationSent(status) {
  return status === true || String(status || "").toUpperCase() === "SENT";
}

function ApprovalLetterPage() {
  const [searchParams] = useSearchParams();
  const schemeId = searchParams.get("schemeId");
  const [gbDecisionData, setGbDecisionData] = useState(null);
  const [selectedStateCodes, setSelectedStateCodes] = useState([]);
  const [sendAllEnabled, setSendAllEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [registrationState, setRegistrationState] = useState(null);
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const stateRows = gbDecisionData?.stateDecisions || [];
  const selectableStateRows = stateRows.filter((state) =>
    !isRegistrationSent(registrationStatuses[getStateKey(state)])
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchGbDecision = async () => {
      setLoading(true);
      setLoadError("");
      setGbDecisionData(null);
      setSelectedStateCodes([]);
      setSendAllEnabled(false);
      setRegistrationStatuses({});
      setStatusError("");
      setStatusLoading(true);

      if (!schemeId) {
        setLoadError("A scheme ID is required to load approval letter details.");
        setLoading(false);
        setStatusLoading(false);
        return;
      }

      try {
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
        if (
          !data
          || typeof data !== "object"
          || Array.isArray(data)
          || !Array.isArray(data.stateDecisions)
          || data.stateDecisions.some((state) => !state || typeof state !== "object" || Array.isArray(state))
        ) {
          throw new Error("The GB decision API returned unexpected data.");
        }

        setGbDecisionData(data);
        setSelectedStateCodes([]);
        setSendAllEnabled(false);

        try {
          const statusResponse = await fetch(apiUrls.stateHodStatus(schemeId), {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            signal: controller.signal
          });

          if (!statusResponse.ok) {
            throw new Error(await getResponseErrorMessage(statusResponse));
          }

          const statusData = await statusResponse.json();
          if (!Array.isArray(statusData) || statusData.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
            throw new Error("The state HOD status API returned unexpected data.");
          }

          const statusByStateCode = statusData.reduce((statuses, item) => {
            if (
              item.stateCode
              && String(item.schemeId) === String(data.schemeId || schemeId)
            ) {
              statuses[String(item.stateCode)] = item.status;
            }
            return statuses;
          }, {});
          setRegistrationStatuses(statusByStateCode);
        } catch (statusFailure) {
          if (statusFailure.name !== "AbortError") {
            console.error("Error loading state HOD registration status:", statusFailure);
            setStatusError(statusFailure.message);
            setRegistrationStatuses({});
          }
        } finally {
          if (!controller.signal.aborted) {
            setStatusLoading(false);
          }
        }
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("Error loading approval letter GB decision:", fetchError);
          setLoadError(fetchError.message);
          setGbDecisionData(null);
          setSelectedStateCodes([]);
          setSendAllEnabled(false);
          setStatusLoading(false);
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

  const toggleState = (stateCode) => {
    setSendAllEnabled(false);
    setSelectedStateCodes((currentStateCodes) => (
      currentStateCodes.includes(stateCode) ? [] : [stateCode]
    ));
  };

  const selectAllStates = (shouldSelectAll) => {
    setSelectedStateCodes(
      shouldSelectAll ? selectableStateRows.map(getStateKey).filter(Boolean) : []
    );
    setSendAllEnabled(shouldSelectAll && selectableStateRows.length > 0);
  };

  const handleViewProposal = async () => {
    setPdfError("");
    setPdfLoading(true);
    try {
      await openProposalPdfPreview(gbDecisionData?.schemeId || schemeId);
    } catch (previewError) {
      console.error("Error opening approval letter proposal PDF:", previewError);
      setPdfError(previewError.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleStateRegistration = (registrationResult) => {
    const stateCode = String(registrationResult?.stateCode || registrationState?.stateCode || "");
    if (!stateCode) return;

    setRegistrationStatuses((currentStatuses) => ({
      ...currentStatuses,
      [stateCode]: registrationResult?.status
    }));
    if (isRegistrationSent(registrationResult?.status)) {
      setSelectedStateCodes((currentStateCodes) => currentStateCodes.filter((code) => code !== stateCode));
      setSendAllEnabled(false);
    }
  };

  const approvedStates = stateRows.filter(isStateApproved);
  const approvedStatesLabel = approvedStates.length
    ? `${approvedStates.length} (${approvedStates.map((state) => state.stateName || state.stateCode || "Unknown").join(", ")})`
    : "0";

  return (
    <Stack spacing={2.5}>
      {loadError && <Alert severity="error" role="alert">{loadError}</Alert>}
      {statusError && <Alert severity="error" role="alert">{statusError}</Alert>}
      {pdfError && <Alert severity="error" role="alert">{pdfError}</Alert>}
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          border: "1px solid #e1e9e3",
          borderRadius: 1,
          bgcolor: "#fff",
          boxShadow: "0 2px 8px rgba(31, 56, 44, 0.06)"
        }}
      >
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#174b35" }}>
                {headings.map((heading) => (
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
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "#6a8176" }}>
                    Loading approval letter details...
                  </TableCell>
                </TableRow>
              ) : !gbDecisionData ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "#6a8176" }}>
                    No approval letter details available.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow
                  key={gbDecisionData.gbDecisionId || gbDecisionData.schemeId}
                  sx={{
                    bgcolor: "#f9faf9",
                    "&:last-child td": { borderBottom: 0 }
                  }}
                >
                  <TableCell sx={{ py: 2.5, px: 2.5, color: "#23332d", fontSize: 13, whiteSpace: "nowrap" }}>
                    {gbDecisionData.proposalID || gbDecisionData.proposalId || "—"}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, color: "#23332d", fontSize: 13, minWidth: 320 }}>
                    {gbDecisionData.schemeName || gbDecisionData.agendaSubject || "—"}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, color: "#46564e", fontSize: 13, whiteSpace: "nowrap" }}>
                    {formatApprovalDate(gbDecisionData.campaApprovalDate || gbDecisionData.meetingDate)}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, color: "#46564e", fontSize: 13, whiteSpace: "nowrap" }}>
                    {approvedStatesLabel}
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2, px: 1.5 }}>
                    <Button
                      variant="outlined"
                      disabled={pdfLoading}
                      onClick={handleViewProposal}
                      startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        minWidth: 116,
                        px: 1.25,
                        py: 0.75,
                        borderColor: "#16813b",
                        borderRadius: 1,
                        color: "#08752c",
                        fontSize: 11,
                        fontWeight: 700,
                        lineHeight: 1.5,
                        textTransform: "none",
                        "&:hover": { borderColor: "#0f6b30", bgcolor: "#f3fbf5" }
                      }}
                    >
                      {pdfLoading ? "Opening..." : "View Proposal (PDF)"}
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box>
        <Typography component="h2" sx={{ mb: 1.5, color: "#174b35", fontSize: 20, fontWeight: 700 }}>
          Approval Letters and Login Creation
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 2.1fr) minmax(240px, 1fr)" },
            gap: 2
          }}
        >
          <Paper
            elevation={0}
            sx={{ overflow: "hidden", border: "1px solid #dfe8df", borderRadius: 1, bgcolor: "#fff" }}
          >
            <Box sx={{ px: 1.5, py: 0.8, background: "linear-gradient(90deg, #d7f3dc, #e6f7e9)" }}>
              <Typography sx={{ color: "#123d25", fontSize: 14, fontWeight: 700 }}>
                GB-approved States (for State APO)
              </Typography>
            </Box>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 500 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#eef8ef" }}>
                    <TableCell padding="checkbox" sx={{ px: 0.5 }} />
                    {["S. No.", "State / UT", "Status", "Action"].map((heading) => (
                      <TableCell
                        key={heading}
                        align={heading === "Action" ? "center" : "left"}
                        sx={{ px: 1, py: 1, color: "#23332d", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        {heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stateRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 2, color: "#6a8176", fontSize: 12 }}>
                        {loading ? "Loading states..." : "No state decisions found."}
                      </TableCell>
                    </TableRow>
                  ) : stateRows.map((state, index) => {
                    const stateKey = getStateKey(state);
                    const stateName = state?.stateName || state?.stateCode || "Unknown state";
                    const isSelected = selectedStateCodes.includes(stateKey);
                    const registrationStatus = registrationStatuses[stateKey];
                    const isSent = isRegistrationSent(registrationStatus);

                    return (
                      <TableRow
                        key={stateKey || index}
                        aria-disabled={isSent}
                        sx={{
                          bgcolor: isSent ? "#f5f7f5" : "inherit",
                          opacity: isSent ? 0.65 : 1,
                          "&:last-child td": { borderBottom: 0 }
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ px: 0.5 }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            disabled={isSent || statusLoading}
                            onChange={() => toggleState(stateKey)}
                            inputProps={{ "aria-label": `Select ${stateName}` }}
                            sx={{ color: "#08752c", "&.Mui-checked": { color: "#08752c" } }}
                          />
                        </TableCell>
                        <TableCell sx={{ px: 1, py: 0.8, color: "#23332d", fontSize: 11 }}>{index + 1}</TableCell>
                        <TableCell sx={{ px: 1, py: 0.8, color: "#23332d", fontSize: 12, whiteSpace: "nowrap" }}>
                          {stateName}
                        </TableCell>
                        <TableCell sx={{ px: 1, py: 0.8 }}>
                          <Box
                            component="span"
                            sx={{
                              display: "inline-block",
                              px: 1.1,
                              py: 0.35,
                              borderRadius: 10,
                              bgcolor: statusLoading ? "#edf1ed" : isSent ? "#e5f5ec" : "#fff0c2",
                              color: statusLoading ? "#687789" : isSent ? "#08752c" : "#8a4b08",
                              fontSize: 10,
                              fontWeight: 700
                            }}
                          >
                            {statusLoading ? "Loading..." : isSent ? "Sent" : "Pending"}
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ px: 0.75, py: 0.8 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={isSent || statusLoading || !isSelected || !state?.stateCode}
                            onClick={() => setRegistrationState(state)}
                            sx={{
                              minWidth: 68,
                              px: 1,
                              py: 0.35,
                              borderColor: "#16813b",
                              color: "#08752c",
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "none"
                            }}
                          >
                            Generate Login Credentials
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              spacing={1}
              sx={{ p: 1, borderTop: "1px solid #e4ebe4" }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Checkbox
                    size="small"
                    checked={sendAllEnabled}
                    indeterminate={selectedStateCodes.length > 0 && !sendAllEnabled}
                    disabled={statusLoading || selectableStateRows.length === 0}
                    onChange={(event) => selectAllStates(event.target.checked)}
                    inputProps={{ "aria-label": "Select all states for sending" }}
                    sx={{ color: "#08752c", "&.Mui-checked": { color: "#08752c" } }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={statusLoading || selectableStateRows.length === 0}
                    onClick={() => selectAllStates(true)}
                    sx={{
                      borderColor: "#16813b",
                      color: "#08752c",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": { borderColor: "#0f6b30", bgcolor: "#f3fbf5" }
                    }}
                  >
                    Select All
                  </Button>
                </Stack>
                <Button
                  size="small"
                  variant="contained"
                  disabled={!sendAllEnabled || statusLoading || selectableStateRows.length === 0}
                  sx={{
                    bgcolor: "#064b2a",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0f6b30" }
                  }}
                >
                  Send Approval Letter
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{ alignSelf: "start", overflow: "hidden", border: "1px solid #dfe8df", borderRadius: 1, bgcolor: "#fff" }}
          >
            <Box sx={{ px: 1.5, py: 0.8, background: "linear-gradient(90deg, #e2f5e5, #eef9ef)" }}>
              <Typography sx={{ color: "#123d25", fontSize: 14, fontWeight: 700 }}>
                Approval Letter Template
              </Typography>
            </Box>
            <Stack spacing={1.25} sx={{ p: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  minHeight: 40,
                  alignItems: "center",
                  px: 1.25,
                  border: "1px solid #d5ded8",
                  borderRadius: 1,
                  color: "#23332d",
                  fontSize: 11
                }}
              >
                National CAMPA Approval Letter
              </Box>
              <Button
                size="small"
                startIcon={<DownloadOutlinedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  alignSelf: "flex-start",
                  p: 0,
                  color: "#1763a5",
                  fontSize: 11,
                  textDecoration: "underline",
                  textTransform: "none",
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" }
                }}
              >
                Download Template (PDF)
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
      <CwlwUserRegistrationDialog
        key={registrationState?.stateCode || "closed"}
        open={Boolean(registrationState)}
        onClose={() => setRegistrationState(null)}
        onRegistered={handleStateRegistration}
        schemeId={gbDecisionData?.schemeId || schemeId}
        stateCode={registrationState?.stateCode}
      />
    </Stack>
  );
}

export default ApprovalLetterPage;
