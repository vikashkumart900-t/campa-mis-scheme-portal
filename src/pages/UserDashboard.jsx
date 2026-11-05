import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { translations } from "../i18n";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { apiUrls } from "../api/urls";
import AasthaVanProposalForm from "../features/aastha-van/AasthaVanProposalForm";
import AasthaVanProjectInventory from "../features/aastha-van/AasthaVanProjectInventory";
import IADashboard from "./dashboards/IADashboard";
import SchemeProposalWizard from "./dashboards/SchemeProposalWizard";

const userTypes = ["implementingAgency", "hod", "state_hod", "districtForestOfficer", "programDivision", "nationalCampa"];
const sessionTimeoutSeconds = 60 * 60;
const additionalRoleLabels = {
  hod: "Head of Division (HOD)",
  state_hod: "Chief Wildlife Warden (CWLW)",
  districtForestOfficer: "District Forest Officer (DFO)",
  nationalCampa: "NATIONAL_CAMPA"
};

function PlaceholderDashboard({ userType }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const logout = () => {
    sessionStorage.removeItem("campaJwt");
    sessionStorage.removeItem("campaUserEmail");
    navigate("/login");
  };

  return (
    <main className="user-dashboard-page">
      <section className="user-dashboard-card">
        <h1>{translations[language][userType] || additionalRoleLabels[userType]}</h1>
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
  const selectedSchemeScope = searchParams.get("scope") || "";
  const isStateSchemeFormRole = ["implementingAgency", "districtForestOfficer"].includes(userType);
  const schemeId = searchParams.get("schemeId") || "";
  const [schemeDetails, setSchemeDetails] = useState(null);
  const [schemeDetailsError, setSchemeDetailsError] = useState("");
  const selectedSchemeCode = searchParams.get("schemeCode") || schemeDetails?.schemeCode || "";
  const selectedSchemeName = searchParams.get("schemeName") || schemeDetails?.schemeName || "";
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
    if (
      !isStateSchemeFormRole ||
      selectedSchemeScope !== "state" ||
      !sessionStorage.getItem("campaJwt") ||
      !schemeId ||
      (searchParams.get("schemeCode") && searchParams.get("schemeName"))
    ) {
      return undefined;
    }

    const controller = new AbortController();
    fetch(apiUrls.schemeDetails(schemeId), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await response.text()) || `Request failed with status ${response.status}`);
        }
        const details = await response.json();
        if (!details || typeof details !== "object" || Array.isArray(details)) {
          throw new Error("The scheme details API returned unexpected data.");
        }
        return details;
      })
      .then(setSchemeDetails)
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSchemeDetailsError(error.message);
        }
      });

    return () => controller.abort();
  }, [isStateSchemeFormRole, schemeId, searchParams, selectedSchemeScope, userType]);

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

  if (
    isStateSchemeFormRole &&
    selectedSchemeScope === "state" &&
    !sessionStorage.getItem("campaJwt")
  ) {
    const loginParams = new URLSearchParams(searchParams);
    loginParams.set("userType", userType);
    loginParams.set("scope", selectedSchemeScope || "state");
    return <Navigate to={`/signin?${loginParams.toString()}`} replace />;
  }

  if (userType === "implementingAgency" && location.pathname.endsWith("/new-proposal")) {
    return (
      <IADashboard pageTitle="Create New Proposal">
        <SchemeProposalWizard />
      </IADashboard>
    );
  }

  if (isStateSchemeFormRole && selectedSchemeScope === "state") {
    const showProjectInventory = location.pathname.endsWith("/inventory") || (
      userType === "implementingAgency" &&
      location.pathname === `/dashboard/${userType}`
    );

    if (showProjectInventory) {
      return (
        <>
          {schemeDetailsError && <p role="alert">Unable to load scheme details: {schemeDetailsError}</p>}
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
        </>
      );
    }

    return (
      <>
        {schemeDetailsError && <p role="alert">Unable to load scheme details: {schemeDetailsError}</p>}
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
      </>
    );
  }

  if (userType === "implementingAgency") {
    return <IADashboard />;
  }

  return <PlaceholderDashboard userType={userType} />;
}

export default UserDashboard;
