import { useEffect, useState } from "react";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { apiUrls } from "../../api/urls";
import { openProposalPdfPreview } from "../../api/proposalPdf";
import { SuccessModal } from "../../components/ui";

const drawerWidth = 256;
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
const dashboardPanelSx = {
  border: "1px solid #e1e9e3",
  borderRadius: 2,
  bgcolor: "#fff",
  boxShadow: "0 2px 8px rgba(31, 56, 44, 0.06)"
};

const formatSubmissionDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const dateValue = String(value).slice(0, 10);
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
};

function HODProposalsTable({ refreshKey }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [proposalsData, setProposalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [selectedStatusProposal, setSelectedStatusProposal] = useState(null);
  const [searchParams] = useSearchParams();
  const schemeId = searchParams.get("schemeId");

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        if (!schemeId) {
          throw new Error("No scheme ID provided");
        }

        setLoading(true);
        const token = sessionStorage.getItem("campaJwt");
        const response = await fetch(apiUrls.getListingProposalById(schemeId), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch proposal: ${response.status}`);
        }

        const data = await response.json();
        setProposalsData([{
          sno: 1,
          schemeId: data.schemeId,
          schemeName: data.schemeName,
          proposalId: data.proposalId,
          schemeDuration: data.schemeDuration,
          proposedFinancialOutlay: data.proposedFinancialOutlay.toFixed(2),
          submissionDate: data.submissionDate,
          campaStatus: data.campaStatus,
          hodStatus: data.hodStatus,
          pdStatus: data.pdStatus
        }]);
        setError("");
      } catch (fetchError) {
        console.error("Error fetching HOD proposals:", fetchError);
        setError(fetchError.message);
        setProposalsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [refreshKey, schemeId]);

  const filteredProposals = proposalsData.filter((proposal) =>
    proposal.schemeName.toLowerCase().includes(searchText.toLowerCase()) ||
    proposal.proposalId.toLowerCase().includes(searchText.toLowerCase())
  );
  const displayedProposals = filteredProposals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleViewProposal = async (proposal) => {
    setPdfError("");
    setPdfLoading(true);
    try {
      await openProposalPdfPreview(proposal.schemeId);
    } catch (previewError) {
      setPdfError(previewError.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const statusFields = selectedStatusProposal
    ? [
        ["CAMPA Status", selectedStatusProposal.campaStatus],
        ["HOD Status", selectedStatusProposal.hodStatus],
        ["PD Status", selectedStatusProposal.pdStatus]
      ]
    : [];

  return (
    <Paper
      elevation={0}
      sx={{ ...dashboardPanelSx, display: "flex", flexDirection: "column", height: { lg: "100%" }, overflow: "hidden" }}
    >
      <Stack sx={{ p: { xs: 2, md: 3 } }} spacing={2}>
        <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700, color: "#23332d" }}>
          Proposals ({proposalsData.length})
        </Typography>
        {pdfError && <Alert severity="error" role="alert">{pdfError}</Alert>}
        <TextField
          placeholder="Search by scheme name or proposal ID..."
          size="small"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setPage(0);
          }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "#999" }} /> }}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#f9faf9", borderRadius: 0.75, fontSize: 13 } }}
        />
      </Stack>

      <TableContainer sx={{ flexGrow: 1 }}>
        <Table sx={{ minWidth: 780 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#174b35", borderBottom: "2px solid #e1e9e3" }}>
              {["S. No.", "Scheme Name", "Proposal ID", "Scheme Duration", "Total Outlay", "Submission Date", "Status", "Actions"].map((heading) => (
                <TableCell
                  key={heading}
                  align={heading === "Actions" ? "center" : "left"}
                  sx={{ py: 2, px: 2.5, fontWeight: 700, color: "#fff", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: "#6a8176" }}>Loading proposals...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: "#c62828" }}>Error loading proposals: {error}</TableCell></TableRow>
            ) : displayedProposals.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3, color: "#6a8176" }}>No proposals found</TableCell></TableRow>
            ) : displayedProposals.map((proposal) => (
              <TableRow key={proposal.schemeId} sx={{ borderBottom: "1px solid #e1e9e3", "&:hover": { bgcolor: "#f9faf9" } }}>
                <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#23332d", fontWeight: 500 }}>{proposal.sno}</TableCell>
                <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#23332d", fontWeight: 500 }}>{proposal.schemeName}</TableCell>
                <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#46564e" }}>{proposal.proposalId}</TableCell>
                <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#46564e" }}>{proposal.schemeDuration}</TableCell>
                <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#46564e" }}>{proposal.proposedFinancialOutlay}</TableCell>
                <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#46564e" }}>{formatSubmissionDate(proposal.submissionDate)}</TableCell>
                <TableCell sx={{ py: 2.5, px: 2.5 }}>
                  <Button
                    size="small"
                    onClick={() => setSelectedStatusProposal(proposal)}
                    startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                    variant="outlined"
                    sx={actionButtonSx}
                  >
                    View
                  </Button>
                </TableCell>
                <TableCell align="center" sx={{ py: 2.5, px: 2.5 }}>
                  <Button
                    aria-label={`Review proposal ${proposal.proposalId}`}
                    size="small"
                    disabled={pdfLoading}
                    onClick={() => handleViewProposal(proposal)}
                    startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                    variant="outlined"
                    sx={actionButtonSx}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredProposals.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        sx={{
          mt: "auto",
          borderTop: "1px solid #edf1ed",
          "& .MuiTablePagination-root": { fontSize: 13 },
          "& .MuiTablePagination-selectLabel": { margin: 0 }
        }}
      />

      <Dialog open={Boolean(selectedStatusProposal)} onClose={() => setSelectedStatusProposal(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: "#174b35", color: "#fff", fontWeight: 700 }}>Status Details</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            {statusFields.map(([label, status]) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, bgcolor: "#f9faf9", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#6a8176" }}>{label}:</Typography>
                <Chip
                  label={status}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: 11,
                    height: 28,
                    bgcolor: status === "PENDING" ? "#fff3e0" : status === "APPROVED" ? "#e8f5e9" : "#ffebee",
                    color: status === "PENDING" ? "#e65100" : status === "APPROVED" ? "#2e7d32" : "#c62828"
                  }}
                />
              </Box>
            ))}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button onClick={() => setSelectedStatusProposal(null)} variant="contained" sx={{ bgcolor: "#174b35", color: "#fff", textTransform: "none", fontWeight: 600 }}>
                Close
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Paper>
  );
}

function HODDashboard() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [decision, setDecision] = useState("forward");
  const [remarks, setRemarks] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [decisionSuccessOpen, setDecisionSuccessOpen] = useState(false);
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [proposalRefreshKey, setProposalRefreshKey] = useState(0);
  const [searchParams] = useSearchParams();
  const schemeIdParam = searchParams.get("schemeId");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const userEmail = sessionStorage.getItem("campaUserEmail");

  const handleSubmitDecision = async (event) => {
    event.preventDefault();
    setDecisionError("");

    const numericSchemeId = Number(schemeIdParam);
    if (!schemeIdParam || !Number.isSafeInteger(numericSchemeId) || numericSchemeId <= 0) {
      setDecisionError("A valid scheme ID is required to submit this decision.");
      return;
    }

    const hodRemarks = remarks.trim();
    if (!hodRemarks) {
      setDecisionError("Enter remarks or recommendations before submitting.");
      return;
    }

    const token = sessionStorage.getItem("campaJwt");
    if (!token) {
      setDecisionError("Your session has expired. Please sign in again.");
      return;
    }

    setDecisionSubmitting(true);
    try {
      const response = await fetch(apiUrls.updateRoleStatus, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          schemeId: numericSchemeId,
          roleCode: "HOD",
          status: decision === "forward" ? "APPROVED" : "REVERTED",
          hodRemarks,
          pdRemarks: "",
          campaRemarks: ""
        })
      });

      if (!response.ok) {
        throw new Error((await response.text()) || `Request failed with status ${response.status}`);
      }

      setDecision("forward");
      setRemarks("");
      setProposalRefreshKey((currentKey) => currentKey + 1);
      setDecisionSuccessOpen(true);
    } catch (submitError) {
      console.error("Error submitting HOD decision:", submitError);
      setDecisionError(submitError.message);
    } finally {
      setDecisionSubmitting(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("campaJwt");
    sessionStorage.removeItem("campaUserEmail");
    navigate("/login");
  };

  const navigation = (
    <Box sx={{ display: "flex", height: "100%", flexDirection: "column", px: 2, py: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1, pb: 4 }}>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>CAMPA</Typography>
          <Typography sx={{ color: "#bfd5c7", fontSize: 10, letterSpacing: 1 }}>SCHEME MIS</Typography>
        </Box>
      </Stack>

      <List disablePadding>
        <ListItemButton
          component={RouterLink}
          to="/dashboard/hod"
          selected
          onClick={() => setMobileNavOpen(false)}
          sx={{ mb: 0.5, borderRadius: 1, color: "#fff", "&.Mui-selected": { bgcolor: "#286347" }, "&.Mui-selected:hover": { bgcolor: "#286347" } }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><DashboardOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Dashboard" slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600 } } }} />
        </ListItemButton>
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ borderColor: "rgba(255,255,255,0.18)", mb: 1 }} />
      <Button
        color="inherit"
        startIcon={<LogoutIcon />}
        onClick={logout}
        sx={{ justifyContent: "flex-start", px: 1.25, color: "#e4efe7", textTransform: "none" }}
      >
        Log out
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "#f3f6f3", color: "#23332d" }}>
      {isMobile ? (
        <Drawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          PaperProps={{ sx: { width: drawerWidth, bgcolor: "#174b35" } }}
        >
          {navigation}
        </Drawer>
      ) : (
        <Box component="aside" sx={{ width: drawerWidth, height: "100vh", flexShrink: 0, bgcolor: "#174b35" }}>
          {navigation}
        </Box>
      )}

      <Box component="main" sx={{ minWidth: 0, height: "100vh", flexGrow: 1, overflowY: "auto" }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#fff", color: "#1d382b", borderBottom: "1px solid #e1e9e3" }}>
          <Toolbar sx={{ minHeight: 76, gap: 1.5 }}>
            {isMobile && (
              <IconButton aria-label="Open navigation" onClick={() => setMobileNavOpen(true)} edge="start">
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ color: "#6a8176", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                HEAD OF DIVISION
              </Typography>
              <Typography component="h1" sx={{ mt: 0.25, fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
                Dashboard
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "#e0eee2", color: "#174b35", fontSize: 12, fontWeight: 700 }}>HOD</Avatar>
              {!isMobile && (
                <Typography noWrap sx={{ maxWidth: 260, color: "#46564e", fontSize: 13 }}>
                  {userEmail || "HOD account"}
                </Typography>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 320px" },
              alignItems: "stretch",
              gap: 2.5
            }}
          >
            <HODProposalsTable refreshKey={proposalRefreshKey} />
            <Paper
              component="form"
              elevation={0}
              onSubmit={handleSubmitDecision}
              sx={{ ...dashboardPanelSx, p: 2.5, height: { lg: "100%" }, display: "flex", flexDirection: "column" }}
            >
              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <FormLabel
                  component="legend"
                  sx={{ mb: 1.5, color: "#1d382b", fontSize: 14, fontWeight: 700, "&.Mui-focused": { color: "#1d382b" } }}
                >
                  Review & Decision by HOD <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
                </FormLabel>
                <RadioGroup
                  value={decision}
                  onChange={(event) => setDecision(event.target.value)}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel
                    value="forward"
                    control={<Radio size="small" sx={{ color: "#c5cbd3", "&.Mui-checked": { color: "#16813b" } }} />}
                    label={<Typography sx={{ fontSize: 12, fontWeight: 600, color: "#23332d" }}>Approve and Forward to PD</Typography>}
                    sx={{ alignItems: "center", ml: 0 }}
                  />
                  <FormControlLabel
                    value="return"
                    control={<Radio size="small" sx={{ color: "#c5cbd3", "&.Mui-checked": { color: "#16813b" } }} />}
                    label={<Typography sx={{ fontSize: 12, fontWeight: 500, color: "#23332d" }}>Return to IA with Recommendation</Typography>}
                    sx={{ alignItems: "center", ml: 0 }}
                  />
                </RadioGroup>
              </FormControl>

              <Typography component="label" htmlFor="hod-decision-remarks" sx={{ display: "block", mb: 0.75, color: "#23332d", fontSize: 12, fontWeight: 700 }}>
                Remarks / Recommendations <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
              </Typography>
              {decisionError && <Alert severity="error" role="alert" sx={{ mb: 1 }}>{decisionError}</Alert>}
              <TextField
                id="hod-decision-remarks"
                data-gramm="false"
                data-gramm_editor="false"
                fullWidth
                multiline
                minRows={3}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value.slice(0, 500))}
                placeholder="Enter remarks / recommendations (max 500 words)"
                slotProps={{
                  htmlInput: {
                    maxLength: 500,
                    "aria-label": "Remarks or recommendations",
                    "data-gramm": "false",
                    "data-gramm_editor": "false"
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 1, fontSize: 12 },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d7dfe7" }
                }}
              />
              <Typography sx={{ mt: 0.5, mb: 2, color: "#687789", fontSize: 11, textAlign: "right" }}>
                {remarks.length} / 500
              </Typography>

              <Box sx={{ mt: "auto" }}>
                <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={decisionSubmitting}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      px: 2.5,
                      bgcolor: "#064b2a",
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "none",
                      "&.Mui-disabled": { bgcolor: "#064b2a", color: "#fff", opacity: 0.55 }
                    }}
                  >
                    {decisionSubmitting ? "Submitting..." : "Submit Decision"}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Container>

        <SuccessModal
          open={decisionSuccessOpen}
          title="Submitted successfully"
          message="HOD decision has been submitted."
          onClose={() => setDecisionSuccessOpen(false)}
          buttonText="OK"
        />
      </Box>
    </Box>
  );
}

export default HODDashboard;
