import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { apiUrls } from "../api/urls";

function getSchemeOptionValue(scheme, index) {
  return String(scheme.schemeCode ?? scheme.schemeId ?? scheme.schemeName ?? index);
}

function normalizeSchemeScope(value) {
  const normalizedValue = String(value || "").trim().toLowerCase().replace(/[_\s]/g, "-");
  return normalizedValue === "central-state" ? "state-central" : normalizedValue;
}

function ActiveSchemes() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selection, setSelection] = useState({
    schemeValue: "",
    details: null,
    detailsLoading: false,
    detailsError: ""
  });
  const schemeScope = searchParams.get("scope");
  const showSchemeDropdown = ["state", "central", "state-central"].includes(schemeScope);
  const filteredSchemes = showSchemeDropdown
    ? schemes.filter((scheme) => normalizeSchemeScope(scheme.schemeType) === schemeScope)
    : schemes;
  const selectedScheme = filteredSchemes.find(
    (scheme, index) => getSchemeOptionValue(scheme, index) === selection.schemeValue
  );
  const schemeId = selectedScheme?.schemeId;
  const schemeDetails = selection.details;
  const hasRequiredSchemeDetails = Boolean(
    schemeId != null &&
    schemeDetails?.organizationName &&
    (schemeScope === "state" || schemeDetails?.divisionName)
  );

  const proceedToLogin = () => {
    if (!selectedScheme || !schemeDetails || !hasRequiredSchemeDetails) return;
    const loginParams = new URLSearchParams({ scope: schemeScope });
    if (schemeScope !== "state-central") {
      loginParams.set("userType", "implementingAgency");
    }
    if (selectedScheme.schemeCode) loginParams.set("schemeCode", selectedScheme.schemeCode);
    if (selectedScheme.schemeId != null) loginParams.set("schemeId", String(selectedScheme.schemeId));
    const selectedSchemeName = schemeDetails.schemeName || selectedScheme.schemeName;
    if (selectedSchemeName) loginParams.set("schemeName", selectedSchemeName);
    if (schemeDetails.organizationId != null) loginParams.set("organizationId", String(schemeDetails.organizationId));
    if (schemeDetails.organizationName) loginParams.set("organizationName", schemeDetails.organizationName);
    if (schemeDetails.divisionId != null) loginParams.set("programDivisionId", String(schemeDetails.divisionId));
    if (schemeDetails.divisionName) loginParams.set("programDivisionName", schemeDetails.divisionName);
    navigate(`/signin?${loginParams.toString()}`);
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrls.activeSchemes, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const activeSchemes = Array.isArray(payload) ? payload : payload?.value;
        if (!Array.isArray(activeSchemes)) {
          throw new Error("The active schemes API returned unexpected data.");
        }

        return activeSchemes;
      })
      .then(setSchemes)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selection.schemeValue || !showSchemeDropdown) return undefined;

    const controller = new AbortController();
    const selectedSchemeId = selectedScheme?.schemeId;
    if (selectedSchemeId == null || selectedSchemeId === "") {
      return undefined;
    }

    fetch(apiUrls.schemeDetails(selectedSchemeId), { signal: controller.signal })
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
      .then((details) => {
        setSelection((current) => ({ ...current, details, detailsError: "" }));
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setSelection((current) => ({ ...current, detailsError: requestError.message }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setSelection((current) => ({ ...current, detailsLoading: false }));
        }
      });

    return () => controller.abort();
  }, [selection.schemeValue, selectedScheme, showSchemeDropdown]);

  return (
    <div className="active-schemes-page">
      <Header />
      <Navbar />

      <main className="active-schemes-content">
        <div className="active-schemes-heading">
          <div>
            <span>CAMPA MIS SCHEME PORTAL</span>
            <h1>Active Schemes</h1>
            <p>Browse all schemes currently active in the portal.</p>
          </div>
          <Link to="/login" className="active-schemes-back">Back to Home</Link>
        </div>

        {showSchemeDropdown && !loading && !error && (
          <div className="active-schemes-form">
            {!selection.schemeValue && (
              <label className="active-schemes-field" htmlFor="active-scheme-select">
                <span>Select scheme</span>
                <select
                  id="active-scheme-select"
                  aria-label={`Select an active ${schemeScope} scheme`}
                  value={selection.schemeValue}
                  onChange={(event) => {
                    const nextSchemeValue = event.target.value;
                    const nextScheme = filteredSchemes.find(
                      (scheme, index) => getSchemeOptionValue(scheme, index) === nextSchemeValue
                    );
                    setSelection({
                      schemeValue: nextSchemeValue,
                      details: null,
                      detailsLoading: Boolean(nextSchemeValue && nextScheme?.schemeId != null),
                      detailsError: nextSchemeValue && nextScheme?.schemeId == null
                        ? "The selected scheme does not include a scheme ID."
                        : ""
                    });
                  }}
                >
                  <option value="">
                    {filteredSchemes.length ? "Choose a scheme" : "No matching active schemes"}
                  </option>
                  {filteredSchemes.map((scheme, index) => (
                    <option key={getSchemeOptionValue(scheme, index)} value={getSchemeOptionValue(scheme, index)}>
                      {scheme.schemeName || "Unnamed scheme"}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selection.detailsLoading && <p className="active-schemes-message" role="status">Loading selected scheme details...</p>}
            {selection.detailsError && <p className="active-schemes-message active-schemes-message--error" role="alert">Unable to load scheme details: {selection.detailsError}</p>}

            {!selection.detailsLoading && !selection.detailsError && selection.schemeValue && schemeDetails && (
              <>
                {selectedScheme && (
                  <div className="active-schemes-selection-summary" aria-live="polite">
                    <p>
                      <strong>Selected scheme name:</strong>
                      <span>{schemeDetails.schemeName || selectedScheme.schemeName}</span>
                    </p>
                    {schemeScope !== "state" && (
                      <p>
                        <strong>Programme division:</strong>
                        <span>{schemeDetails.divisionName || "Not available"}</span>
                      </p>
                    )}
                    <p>
                      <strong>Implementing agency:</strong>
                      <span>{schemeDetails.organizationName || "Not available"}</span>
                    </p>
                  </div>
                )}
                <button
                  className="active-schemes-proceed"
                  type="button"
                  disabled={!hasRequiredSchemeDetails}
                  onClick={proceedToLogin}
                >
                  Proceed to login
                </button>
              </>
            )}
          </div>
        )}

        {loading ? (
          <p className="active-schemes-message" role="status">Loading active schemes…</p>
        ) : error ? (
          <p className="active-schemes-message active-schemes-message--error" role="alert">
            Unable to load active schemes: {error}
          </p>
        ) : filteredSchemes.length === 0 && !showSchemeDropdown ? (
          <p className="active-schemes-message">No active schemes found.</p>
        ) : showSchemeDropdown ? null : (
          <div className="active-schemes-table-wrap">
            <table className="active-schemes-table">
              <thead>
                <tr>
  
                  <th scope="col">Scheme name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Starting year</th>
                  
                </tr>
              </thead>
              <tbody>
                {schemes.map((scheme, index) => (
                  <tr key={scheme.schemeId ?? scheme.schemeCode ?? index}>
                    
                    <td>{scheme.schemeName || "—"}</td>
                    <td><span className="active-schemes-status">{scheme.schemeStatus || "Active"}</span></td>
                    <td>{scheme.startingYear ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ActiveSchemes;
