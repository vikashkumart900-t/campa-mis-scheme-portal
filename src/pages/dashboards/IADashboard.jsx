import { useState, useEffect } from "react";
import {
  AppBar,
  Alert,
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
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
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
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { apiUrls } from "../../api/urls";
import { openProposalPdfPreview } from "../../api/proposalPdf";

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

const getStatusDisplay = (campaStatus) => {
  const statusMap = {
    PENDING: { label: "View", color: "warning" },
    APPROVED: { label: "Approved", color: "success" },
    REJECTED: { label: "Returned", color: "error" },
    RETURNED: { label: "Returned", color: "error" }
  };
  return statusMap[campaStatus] || { label: campaStatus, color: "default" };
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

function MyProposalsTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [proposalsData, setProposalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedStatusProposal, setSelectedStatusProposal] = useState(null);
  const navigate = useNavigate();
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
        const requestOptions = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        };
        const [response, roleStatusResponse] = await Promise.all([
          fetch(apiUrls.getListingProposalById(schemeId), requestOptions),
          fetch(apiUrls.schemeRoleStatusById(schemeId), requestOptions)
        ]);

        if (!response.ok) {
          throw new Error(`Failed to fetch proposal: ${response.status}`);
        }
        if (!roleStatusResponse.ok) {
          throw new Error(`Failed to fetch proposal role status: ${roleStatusResponse.status}`);
        }

        const [data, roleStatusData] = await Promise.all([response.json(), roleStatusResponse.json()]);
        console.log("Proposal Data:", data);
        const statusData = { ...data, ...roleStatusData };

        const statusDisplay = getStatusDisplay(statusData.campaStatus);
        const mappedProposal = {
          sno: 1,
          schemeId: data.schemeId,
          schemeName: data.schemeName,
          proposalId: data.proposalId,
          schemeDuration: data.schemeDuration,
          proposedFinancialOutlay: data.proposedFinancialOutlay.toFixed(2),
          campaStatus: statusData.campaStatus,
          campaUpdatedAt: statusData.campaUpdatedAt,
          hodStatus: statusData.hodStatus,
          hodUpdatedAt: statusData.hodUpdatedAt,
          pdStatus: statusData.pdStatus,
          pdUpdatedAt: statusData.pdUpdatedAt,
          status: statusDisplay.label,
          statusColor: statusDisplay.color
        };

        setProposalsData([mappedProposal]);
        setError(null);
      } catch (err) {
        console.error("Error fetching proposal:", err);
        setError(err.message);
        setProposalsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [schemeId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, proposal) => {
    setAnchorEl(event.currentTarget);
    setSelectedProposal(proposal);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProposal(null);
  };

  const handleEditProposal = () => {
    const proposalParams = new URLSearchParams(searchParams);
    proposalParams.set("schemeId", String(selectedProposal.schemeId));
    navigate(`/dashboard/implementingAgency/new-proposal?${proposalParams.toString()}`);
    handleMenuClose();
  };

  const handleViewProposal = async () => {
    const selectedSchemeId = selectedProposal.schemeId;
    handleMenuClose();
    setPdfError("");
    setPdfLoading(true);
    try {
      await openProposalPdfPreview(selectedSchemeId);
    } catch (err) {
      setPdfError(err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleViewStatus = (proposal) => {
    setSelectedStatusProposal(proposal);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedStatusProposal(null);
  };

  const filteredProposals = proposalsData.filter((proposal) =>
    proposal.schemeName.toLowerCase().includes(searchText.toLowerCase()) ||
    proposal.proposalId.toLowerCase().includes(searchText.toLowerCase())
  );

  const displayedProposals = filteredProposals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper elevation={0} sx={{ borderRadius: 1, bgcolor: "#fff", overflow: "hidden" }}>
      <Stack sx={{ p: { xs: 2, md: 3 } }} spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700, color: "#23332d" }}>
            My Proposals ({proposalsData.length})
          </Typography>
        </Stack>

        {pdfError && <Alert severity="error" role="alert">{pdfError}</Alert>}

        <TextField
          placeholder="Search by scheme name or proposal ID..."
          size="small"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "#999" }} />
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#f9faf9",
              borderRadius: 0.75,
              fontSize: 13
            }
          }}
        />
      </Stack>

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#174b35", borderBottom: "2px solid #e1e9e3" }}>
              <TableCell sx={{ py: 2, px: 2.5, fontWeight: 700, color: "#fff", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                S. No.
              </TableCell>
              <TableCell sx={{ py: 2, px: 2.5, fontWeight: 700, color: "#fff", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Scheme Name
              </TableCell>
              <TableCell sx={{ py: 2, px: 2.5, fontWeight: 700, color: "#fff", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Proposal ID
              </TableCell>
              <TableCell sx={{ py: 2, px: 2.5, fontWeight: 700, color: "#fff", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Scheme Duration
              </TableCell>
              <TableCell sx={{ py: 2, px: 2.5, fontWeight: 700, color: "#fff", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Total Outlay
              </TableCell>
              <TableCell sx={{ py: 2, px: 2.5, fontWeight: 700, color: "#fff", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ py: 2, px: 2.5, fontWeight: 700, color: "#fff", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: "#6a8176" }}>
                  Loading proposals...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: "#c62828" }}>
                  Error loading proposals: {error}
                </TableCell>
              </TableRow>
            ) : displayedProposals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: "#6a8176" }}>
                  No proposals found
                </TableCell>
              </TableRow>
            ) : (
              displayedProposals.map((proposal) => (
                <TableRow key={proposal.schemeId} sx={{ borderBottom: "1px solid #e1e9e3", "&:hover": { bgcolor: "#f9faf9" } }}>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#23332d", fontWeight: 500 }}>
                    {proposal.sno}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#23332d", fontWeight: 500 }}>
                    {proposal.schemeName}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#46564e" }}>
                    {proposal.proposalId}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#46564e" }}>
                    {proposal.schemeDuration}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5, fontSize: 13, color: "#46564e" }}>
                    {proposal.proposedFinancialOutlay}
                  </TableCell>
                  <TableCell sx={{ py: 2.5, px: 2.5 }}>
                    <Button
                      size="small"
                      onClick={() => handleViewStatus(proposal)}
                      startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                      variant="outlined"
                      sx={actionButtonSx}
                    >
                      View
                    </Button>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2.5, px: 2.5 }}>
                    <IconButton
                      size="small"
                      disabled={pdfLoading}
                      onClick={(e) => handleMenuOpen(e, proposal)}
                      sx={{ color: "#46564e" }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredProposals.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          "& .MuiTablePagination-root": {
            fontSize: 13
          },
          "& .MuiTablePagination-selectLabel": {
            margin: 0
          }
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={handleViewProposal}
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: "#23332d"
          }}
        >
          View Details
        </MenuItem>
        <MenuItem
          onClick={handleEditProposal}
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: "#23332d"
          }}
        >
          Edit
        </MenuItem>
      </Menu>

      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: "#174b35", color: "#fff", fontWeight: 700 }}>
          Status Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedStatusProposal && (
            <Stack spacing={2}>
              <Box sx={{ display: "grid", gridTemplateColumns: "minmax(90px, 1fr) auto minmax(90px, 1fr)", gap: 1, px: 1.5, pt: 2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6a8176" }}>Review Stage</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6a8176" }}>Status</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6a8176", textAlign: "right" }}>Last Action Date</Typography>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "minmax(90px, 1fr) auto minmax(90px, 1fr)", gap: 1, alignItems: "center", p: 1.5, bgcolor: "#f9faf9", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#6a8176" }}>
                  CAMPA Status:
                </Typography>
                <Chip
                  label={selectedStatusProposal.campaStatus}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: 11,
                    height: 28,
                    bgcolor:
                      selectedStatusProposal.campaStatus === "PENDING"
                        ? "#fff3e0"
                        : selectedStatusProposal.campaStatus === "APPROVED"
                          ? "#e8f5e9"
                          : "#ffebee",
                    color:
                      selectedStatusProposal.campaStatus === "PENDING"
                        ? "#e65100"
                        : selectedStatusProposal.campaStatus === "APPROVED"
                          ? "#2e7d32"
                          : "#c62828"
                  }}
                />
                <Typography sx={{ fontSize: 12, color: "#23332d", textAlign: "right" }}>
                  {formatSubmissionDate(selectedStatusProposal.campaUpdatedAt)}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "minmax(90px, 1fr) auto minmax(90px, 1fr)", gap: 1, alignItems: "center", p: 1.5, bgcolor: "#f9faf9", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#6a8176" }}>
                  HOD Status:
                </Typography>
                <Chip
                  label={selectedStatusProposal.hodStatus}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: 11,
                    height: 28,
                    bgcolor:
                      selectedStatusProposal.hodStatus === "PENDING"
                        ? "#fff3e0"
                        : selectedStatusProposal.hodStatus === "APPROVED"
                          ? "#e8f5e9"
                          : "#ffebee",
                    color:
                      selectedStatusProposal.hodStatus === "PENDING"
                        ? "#e65100"
                        : selectedStatusProposal.hodStatus === "APPROVED"
                          ? "#2e7d32"
                          : "#c62828"
                  }}
                />
                <Typography sx={{ fontSize: 12, color: "#23332d", textAlign: "right" }}>
                  {formatSubmissionDate(selectedStatusProposal.hodUpdatedAt)}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "minmax(90px, 1fr) auto minmax(90px, 1fr)", gap: 1, alignItems: "center", p: 1.5, bgcolor: "#f9faf9", borderRadius: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#6a8176" }}>
                  PD Status:
                </Typography>
                <Chip
                  label={selectedStatusProposal.pdStatus}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: 11,
                    height: 28,
                    bgcolor:
                      selectedStatusProposal.pdStatus === "PENDING"
                        ? "#fff3e0"
                        : selectedStatusProposal.pdStatus === "APPROVED"
                          ? "#e8f5e9"
                          : "#ffebee",
                    color:
                      selectedStatusProposal.pdStatus === "PENDING"
                        ? "#e65100"
                        : selectedStatusProposal.pdStatus === "APPROVED"
                          ? "#2e7d32"
                          : "#c62828"
                  }}
                />
                <Typography sx={{ fontSize: 12, color: "#23332d", textAlign: "right" }}>
                  {formatSubmissionDate(selectedStatusProposal.pdUpdatedAt)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 2 }}>
                <Button
                  onClick={handleCloseStatusDialog}
                  variant="contained"
                  sx={{ bgcolor: "#174b35", color: "#fff", textTransform: "none", fontWeight: 600 }}
                >
                  Close
                </Button>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
}

function IADashboard({ children, pageTitle = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const userEmail = sessionStorage.getItem("campaUserEmail");
  const dashboardQuery = searchParams.toString();
  const dashboardQuerySuffix = dashboardQuery ? `?${dashboardQuery}` : "";
  const isNewProposalPage = location.pathname.endsWith("/new-proposal");

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
          to={`/dashboard/implementingAgency${dashboardQuerySuffix}`}
          selected={!isNewProposalPage}
          onClick={() => setMobileNavOpen(false)}
          sx={{ mb: 0.5, borderRadius: 1, color: "#fff", "&.Mui-selected": { bgcolor: "#286347" }, "&.Mui-selected:hover": { bgcolor: "#286347" } }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><DashboardOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Dashboard" slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600 } } }} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to={`/dashboard/implementingAgency${dashboardQuerySuffix}`}
          selected={!isNewProposalPage}
          onClick={() => setMobileNavOpen(false)}
          sx={{ mb: 0.5, borderRadius: 1, color: "#e4efe7", "&.Mui-selected": { bgcolor: "#286347", color: "#fff" }, "&.Mui-selected:hover": { bgcolor: "#286347" } }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><AssignmentOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="My Proposals" slotProps={{ primary: { sx: { fontSize: 11, fontWeight: 600 } } }} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to={`/dashboard/implementingAgency/new-proposal${dashboardQuerySuffix}`}
          selected={isNewProposalPage}
          onClick={() => setMobileNavOpen(false)}
          sx={{
            mb: 0.5,
            borderRadius: 1,
            color: "#e4efe7",
            "&.Mui-selected": { bgcolor: "#286347", color: "#fff" },
            "&.Mui-selected:hover": { bgcolor: "#286347" }
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><AddCircleOutlineOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Create New Proposal" slotProps={{ primary: { sx: { fontSize: 11, fontWeight: 600 } } }} />
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
                IMPLEMENTING AGENCY
              </Typography>
              <Typography component="h1" sx={{ mt: 0.25, fontSize: 22, fontWeight: 700, lineHeight: 1.3 }}>
                {pageTitle}
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "#e0eee2", color: "#174b35", fontSize: 12, fontWeight: 700 }}>IA</Avatar>
              {!isMobile && (
                <Typography noWrap sx={{ maxWidth: 260, color: "#46564e", fontSize: 13 }}>
                  {userEmail || "Agency account"}
                </Typography>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 }, px: { xs: 2, md: 4 } }}>
          {children || <MyProposalsTable />}
        </Container>
      </Box>
    </Box>
  );
}

export default IADashboard;
