import { useEffect, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { translations } from "../i18n";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import AasthaVanProposalForm from "../features/aastha-van/AasthaVanProposalForm";
import AasthaVanProjectInventory from "../features/aastha-van/AasthaVanProjectInventory";

const userTypes = ["implementingAgency", "programDivision", "nationalAuthority", "hod"];
const sessionTimeoutSeconds = 60 * 60;

function PlaceholderDashboard({ userType }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const logout = () => {
    sessionStorage.removeItem("campaJwt");
    navigate("/login");
  };

  return (
    <main className="user-dashboard-page">
      <section className="user-dashboard-card">
        <h1>{translations[language][userType]}</h1>
        <p>Your workspace is ready. Forms and dashboard features will be added here.</p>
        <div className="user-dashboard-actions">
          <Link className="user-dashboard-back" to="/login">Back to home</Link>
          <button className="user-dashboard-logout" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

function UserDashboard() {
  const { userType, projectId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const expiresAt = useRef(null);
  const selectedSchemeCode = searchParams.get("schemeCode") || "";
  const selectedSchemeName = searchParams.get("schemeName") || "";
  const dashboardQuery = searchParams.toString();
  const dashboardQuerySuffix = dashboardQuery ? `?${dashboardQuery}` : "";
  const showInventory = () => navigate(`/dashboard/${userType}/inventory${dashboardQuerySuffix}`);
  const createInventory = () => navigate(`/dashboard/${userType}/create${dashboardQuerySuffix}`);
  const viewProject = (selectedProjectId) => navigate(
    `/dashboard/${userType}/project/${encodeURIComponent(selectedProjectId)}/details${dashboardQuerySuffix}`
  );
  const continueProject = (selectedProjectId) => navigate(
    `/dashboard/${userType}/proposal/${encodeURIComponent(selectedProjectId)}${dashboardQuerySuffix}`
  );

  useEffect(() => {
    expiresAt.current = Date.now() + sessionTimeoutSeconds * 1000;

    const updateCountdown = () => {
      const secondsLeft = Math.ceil((expiresAt.current - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        sessionStorage.removeItem("campaJwt");
        navigate("/login", { replace: true });
      }
    };

    const timer = window.setInterval(updateCountdown, 1000);
    document.addEventListener("visibilitychange", updateCountdown);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateCountdown);
    };
  }, [navigate]);

  if (!userTypes.includes(userType)) {
    return <Navigate to="/login" replace />;
  }

  if (userType === "implementingAgency" && !sessionStorage.getItem("campaJwt")) {
    const loginParams = new URLSearchParams(searchParams);
    loginParams.set("userType", "implementingAgency");
    loginParams.set("scope", "state");
    return <Navigate to={`/signin?${loginParams.toString()}`} replace />;
  }

  if (userType === "implementingAgency") {
    if (
      location.pathname.endsWith("/inventory") ||
      location.pathname === `/dashboard/${userType}`
    ) {
      return (
        <AasthaVanProjectInventory
          schemeName={selectedSchemeName}
          schemeCode={selectedSchemeCode}
          onLogout={() => {
            sessionStorage.removeItem("campaJwt");
            navigate("/login");
          }}
          onCreateInventory={createInventory}
          onViewProject={viewProject}
        />
      );
    }

    return (
      <AasthaVanProposalForm
        key={projectId || "new"}
        schemeName={selectedSchemeName}
        schemeCode={selectedSchemeCode}
        initialProjectId={projectId}
        startFresh={location.pathname.endsWith("/create")}
        initialShowProjectDetails={location.pathname.endsWith("/details")}
        onShowInventory={showInventory}
        onOpenProjectDetails={() => viewProject(projectId)}
        onContinueProject={() => continueProject(projectId)}
        onLogout={() => {
          sessionStorage.removeItem("campaJwt");
          navigate("/login");
        }}
      />
    );
  }

  return <PlaceholderDashboard userType={userType} />;
}

export default UserDashboard;
