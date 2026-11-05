import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ForestOutlinedIcon from "@mui/icons-material/ForestOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";

const drawerWidth = 256;

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
        <Avatar variant="rounded" sx={{ bgcolor: "#dcebdd", color: "#174b35", width: 42, height: 42 }}>
          <ForestOutlinedIcon />
        </Avatar>
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
        {/* <Typography sx={{ px: 1, pt: 2, pb: 1, color: "#bfd5c7", fontSize: 13, fontWeight: 700 }}>
          Scheme Management
        </Typography> */}
        <ListItemButton
          component="div"
          disableRipple
          sx={{ mb: 0.5, borderRadius: 1, color: "#e4efe7" }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><AssignmentOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="My Proposals (DPR)" slotProps={{ primary: { sx: { fontSize: 11, fontWeight: 600 } } }} />
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
          {children || (
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 1, bgcolor: "#fff" }}>
              My Proposals
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default IADashboard;
