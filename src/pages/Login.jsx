import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translateText, translations } from "../i18n";
import { apiUrls } from "../api/urls";
import elephantImage from "../assets/elephant.jpg";
import asthavanImage from "../assets/asthavan.jpg";
import tigerImage from "../assets/tigers.jpg";
import wildBuffaloImage from "../assets/wild_bufaalo.jpg";
import rhinoImage from "../assets/rhino image.jpg";

const userTypes = ["implementingAgency", "programDivision", "nationalAuthority", "hod"];
const registerableUserTypes = ["implementingAgency", "programDivision"];
const captchaCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createCaptcha() {
  return Array.from({ length: 6 }, () =>
    captchaCharacters[Math.floor(Math.random() * captchaCharacters.length)]
  ).join("");
}

async function readApiResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response;
}

function getLoginErrorMessage(error) {
  let message = error instanceof Error ? error.message : String(error);

  try {
    const parsedMessage = JSON.parse(message);
    message = parsedMessage?.error || parsedMessage?.message || message;
  } catch {
    // Keep non-JSON API errors as-is.
  }

  if (/user role not authorized|unauthori[sz]ed|invalid credentials|bad credentials|incorrect (username|password)|username or password/i.test(message)) {
    return "Username or password is incorrect.";
  }

  return `Unable to log in: ${message}`;
}

function Login() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryUserType = searchParams.get("userType");
  const [selectedRole, setSelectedRole] = useState(
    () => userTypes.includes(queryUserType) ? queryUserType : "implementingAgency"
  );
  const userType = userTypes.includes(queryUserType) ? queryUserType : selectedRole;
  const roleSelectionRequired = searchParams.get("scope") === "state-central" && !queryUserType;
  const isStateSchemeLogin = ["state", "state-central"].includes(searchParams.get("scope"));
  const [loginError, setLoginError] = useState("");
  const [loginSaving, setLoginSaving] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(createCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(
    () => registerableUserTypes.includes(queryUserType)
  );
  const [registrationSaving, setRegistrationSaving] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registrationMetadata, setRegistrationMetadata] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError, setDistrictError] = useState("");
  const [registrationForm, setRegistrationForm] = useState({
    organizationId: "",
    stateCode: "",
    districtId: "",
    programDivisionId: "",
    officerName: "",
    designation: "",
    email: "",
    mobile: "",
    password: ""
  });
  const t = (key) => translateText(key, language);
  const roleLabels = {
    implementingAgency: translations[language].implementingAgency,
    programDivision: translations[language].programDivision,
    hod: translations[language].hod,
    nationalAuthority: "National CAMPA"
  };

  useEffect(() => {
    if (!registrationOpen || !registerableUserTypes.includes(userType)) {
      return undefined;
    }

    const controller = new AbortController();

    fetch(apiUrls.registrationDropdownMetadata, { signal: controller.signal })
      .then(readApiResponse)
      .then((response) => response.json())
      .then((metadata) => {
        if (
          !Array.isArray(metadata.organizations) ||
          !Array.isArray(metadata.programDivisions) ||
          !Array.isArray(metadata.states)
        ) {
          throw new Error("The registration API returned unexpected dropdown data.");
        }
        setRegistrationMetadata(metadata);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRegistrationError(`Unable to load registration options: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setRegistrationLoading(false);
        }
      });

    return () => controller.abort();
  }, [registrationOpen, userType]);

  useEffect(() => {
    if (
      !registrationOpen ||
      userType !== "implementingAgency" ||
      registrationMetadata?.organizations.find(
        (organization) => organization.organizationId === Number(registrationForm.organizationId)
      )?.iaCategory !== "STATE_IA" ||
      !registrationForm.stateCode
    ) {
      return undefined;
    }

    const controller = new AbortController();
    fetch(apiUrls.registrationDistricts(registrationForm.stateCode), { signal: controller.signal })
      .then(readApiResponse)
      .then((response) => response.json())
      .then((districtOptions) => {
        if (!Array.isArray(districtOptions)) {
          throw new Error("The districts API returned unexpected dropdown data.");
        }
        setDistricts(districtOptions);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setDistrictError(`Unable to load districts: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDistrictLoading(false);
        }
      });

    return () => controller.abort();
  }, [registrationForm.organizationId, registrationForm.stateCode, registrationMetadata, registrationOpen, userType]);

  const closeLogin = () => navigate("/login");

  const handleRegistrationFieldChange = (event) => {
    const { name, value } = event.target;
    setRegistrationForm((previous) => ({ ...previous, [name]: value }));
    setRegistrationError("");
    setRegistrationMessage("");
  };

  const handleRegistrationSubmit = async (event) => {
    event.preventDefault();
    setRegistrationSaving(true);
    setRegistrationError("");
    setRegistrationMessage("");

    const organization = userType === "implementingAgency"
      ? registrationMetadata?.organizations.find((item) =>
        item.organizationType === "IMPLEMENTING_AGENCY" &&
        item.organizationId === Number(registrationForm.organizationId) &&
        item.isActive
      )
      : null;
    const payload = {
      officerName: registrationForm.officerName,
      designation: registrationForm.designation,
      email: registrationForm.email,
      mobile: registrationForm.mobile,
      password: registrationForm.password,
      organizationId: Number(
        userType === "implementingAgency" ? organization?.organizationId : registrationForm.organizationId
      )
    };

    try {
      if (!payload.organizationId) {
        throw new Error("The selected programme division is not linked to an organization.");
      }
      const response = await fetch(apiUrls.nodalOfficerRegistration, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await readApiResponse(response);
      setRegistrationMessage("Nodal officer details saved successfully.");
      setRegistrationForm({
        organizationId: "",
        stateCode: "",
        districtId: "",
        programDivisionId: "",
        officerName: "",
        designation: "",
        email: "",
        mobile: "",
        password: ""
      });
    } catch (error) {
      setRegistrationError(`Unable to save nodal officer details: ${error.message}`);
    } finally {
      setRegistrationSaving(false);
    }
  };

  const selectedImplementingAgency = registrationMetadata?.organizations.find(
    (organization) => organization.organizationId === Number(registrationForm.organizationId)
  );
  const registrationOptions = userType === "programDivision"
    ? registrationMetadata?.programDivisions.flatMap((division) => {
      const organization = registrationMetadata.organizations.find(
        (item) => item.programDivisionId === division.programDivisionId
      );
      return organization
        ? [{ id: organization.organizationId, label: division.divisionName }]
        : [];
    }) || []
    : registrationMetadata?.organizations
      .filter((organization) =>
        organization.organizationType === "IMPLEMENTING_AGENCY" &&
        ["CENTRAL_IA", "STATE_IA"].includes(organization.iaCategory) &&
        organization.isActive
      )
      .map((organization) => ({ id: organization.organizationId, label: organization.organizationName })) || [];
  const implementingAgencyProgramDivisions = selectedImplementingAgency
    ? registrationMetadata?.programDivisions.filter(
      (division) => division.programDivisionId === selectedImplementingAgency.programDivisionId
    ) || []
    : [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isStateSchemeLogin) {
      setLoginError("Login is currently available for State and State-Central schemes only.");
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setLoginError("CAPTCHA does not match. Please try again.");
      setCaptchaInput("");
      setCaptchaCode(createCaptcha());
      return;
    }

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    setLoginError("");
    setLoginSaving(true);

    try {
      const response = await fetch(apiUrls.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      await readApiResponse(response);

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("The login API returned an invalid response.");
      }

      if (result?.error) {
        throw new Error(result.error);
      }
      if (result?.status !== undefined && Number(result.status) !== 200) {
        throw new Error(result.message || "Login failed.");
      }

      const jwt = result?.data?.jwt;
      if (typeof jwt !== "string" || !jwt.trim()) {
        throw new Error("The login API response did not include an access token.");
      }

      sessionStorage.setItem("campaJwt", jwt);
      if (userTypes.includes(userType)) {
        const dashboardParams = new URLSearchParams();
        ["scope", "schemeCode", "schemeName", "organizationId", "organizationName", "programDivisionId", "programDivisionName"].forEach((key) => {
          const value = searchParams.get(key);
          if (value) {
            dashboardParams.set(key, value);
          }
        });
        const query = dashboardParams.toString();
        navigate(`/dashboard/${userType}${query ? `?${query}` : ""}`);
      }
    } catch (error) {
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setLoginSaving(false);
    }
  };

  return (
    <div
      className="login-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeLogin();
      }}
    >
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button
          className="login-modal-close"
          type="button"
          onClick={closeLogin}
          aria-label={t("closeLogin")}
        >
          ×
        </button>

        <div className="login-photo-grid" aria-hidden="true">
          <img className="login-photo-deer" src={wildBuffaloImage} alt="" />
          <img className="login-photo-forest" src={asthavanImage} alt="" />
          <img className="login-photo-tiger" src={tigerImage} alt="" />
          <img className="login-photo-elephants" src={elephantImage} alt="" />
          <img className="login-photo-work" src={rhinoImage} alt="" />
          <img className="login-photo-water" src={asthavanImage} alt="" />
        </div>
        <div className="login-modal-content">
          <h1 id="login-modal-title">
            {registrationOpen ? "Nodal Officer Registration" : translations[language].login}
          </h1>
          <p className="login-modal-subtitle">
            {registrationOpen ? "Enter your organization and nodal officer details." : t("loginToAccount")}
          </p>

          {!registrationOpen && roleSelectionRequired && (
            <fieldset className="login-role-selection">
              <legend>Select your role</legend>
              {userTypes.map((role) => (
                <label
                  className={`login-role-option${userType === role ? " login-role-option--selected" : ""}`}
                  key={role}
                >
                  <input
                    type="radio"
                    name="login-role"
                    value={role}
                    checked={userType === role}
                    onChange={() => {
                      setSelectedRole(role);
                      setLoginError("");
                    }}
                  />
                  <span>{roleLabels[role]}</span>
                </label>
              ))}
            </fieldset>
          )}

            {registrationOpen ? (
              <form onSubmit={handleRegistrationSubmit}>
                {registrationLoading && <p role="status">Loading registration options...</p>}
                {registrationError && <p className="captcha-error" role="alert">{registrationError}</p>}
                {districtError && <p className="captcha-error" role="alert">{districtError}</p>}
                {!registrationLoading && registrationMetadata && (
                  <>
                    {userType === "implementingAgency" && (
                      <>
                        <label className="visually-hidden" htmlFor="registration-organization">
                          Implementing agency
                        </label>
                        <select
                          id="registration-organization"
                          className="login-modal-input"
                          name="organizationId"
                          value={registrationForm.organizationId}
                          onChange={(event) => {
                            const { value } = event.target;
                            setRegistrationForm((previous) => ({
                              ...previous,
                              organizationId: value,
                              stateCode: "",
                              districtId: "",
                              programDivisionId: ""
                            }));
                            setDistricts([]);
                            setDistrictLoading(false);
                            setDistrictError("");
                            setRegistrationError("");
                            setRegistrationMessage("");
                          }}
                          required
                        >
                          <option value="">Select implementing agency</option>
                          {registrationOptions.map((option) => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </select>
                        {selectedImplementingAgency?.iaCategory === "STATE_IA" && (
                          <>
                            <label className="visually-hidden" htmlFor="registration-state">State</label>
                            <select
                              id="registration-state"
                              className="login-modal-input"
                              name="stateCode"
                              value={registrationForm.stateCode}
                              onChange={(event) => {
                                const { value } = event.target;
                                setRegistrationForm((previous) => ({
                                  ...previous,
                                  stateCode: value,
                                  districtId: ""
                                }));
                                setDistricts([]);
                                setDistrictLoading(Boolean(value));
                                setDistrictError("");
                              }}
                              required
                            >
                              <option value="">Select state</option>
                              {registrationMetadata.states.map((state) => (
                                <option key={state.stateCode} value={state.stateCode}>{state.stateName}</option>
                              ))}
                            </select>
                            <label className="visually-hidden" htmlFor="registration-district">District</label>
                            <select
                              id="registration-district"
                              className="login-modal-input"
                              name="districtId"
                              value={registrationForm.districtId}
                              onChange={handleRegistrationFieldChange}
                              disabled={!registrationForm.stateCode || districtLoading}
                              required
                            >
                              <option value="">
                                {districtLoading ? "Loading districts..." : "Select district"}
                              </option>
                              {districts.map((district) => (
                                <option key={district.districtId} value={district.districtId}>
                                  {district.districtName}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                      </>
                    )}
                    <label className="visually-hidden" htmlFor="registration-program-division">
                      Programme division
                    </label>
                    <select
                      id="registration-program-division"
                      className="login-modal-input"
                      name={userType === "programDivision" ? "organizationId" : "programDivisionId"}
                      value={userType === "programDivision"
                        ? registrationForm.organizationId
                        : registrationForm.programDivisionId}
                      onChange={handleRegistrationFieldChange}
                      required
                      disabled={userType === "implementingAgency" && !selectedImplementingAgency}
                    >
                      <option value="">Select programme division</option>
                      {(userType === "implementingAgency"
                        ? implementingAgencyProgramDivisions.map((division) => ({
                          id: division.programDivisionId,
                          label: division.divisionName
                        }))
                        : registrationOptions).map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                    {userType === "programDivision" && registrationOptions.length === 0 && (
                      <p className="captcha-error" role="alert">No organizations are available for this user type.</p>
                    )}
                    <input
                      className="login-modal-input"
                      name="officerName"
                      value={registrationForm.officerName}
                      onChange={handleRegistrationFieldChange}
                      placeholder="Nodal officer name"
                      autoComplete="name"
                      required
                    />
                    <input
                      className="login-modal-input"
                      name="designation"
                      value={registrationForm.designation}
                      onChange={handleRegistrationFieldChange}
                      placeholder="Designation"
                      required
                    />
                    <input
                      className="login-modal-input"
                      name="email"
                      type="email"
                      value={registrationForm.email}
                      onChange={handleRegistrationFieldChange}
                      placeholder="Email"
                      autoComplete="email"
                      required
                    />
                    <input
                      className="login-modal-input"
                      name="mobile"
                      type="tel"
                      value={registrationForm.mobile}
                      onChange={handleRegistrationFieldChange}
                      placeholder="Mobile"
                      autoComplete="tel"
                      required
                    />
                    <input
                      className="login-modal-input"
                      name="password"
                      type="password"
                      value={registrationForm.password}
                      onChange={handleRegistrationFieldChange}
                      placeholder="Password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      className="login-submit"
                      type="submit"
                      disabled={registrationSaving || (userType === "programDivision" && registrationOptions.length === 0)}
                    >
                      {registrationSaving ? "Saving..." : "Save Nodal Officer Details"}
                    </button>
                  </>
                )}
                <p className="login-register-prompt">
                  <button type="button" onClick={() => { setRegistrationOpen(false); setRegistrationError(""); setRegistrationMessage(""); }}>
                    Back to login
                  </button>
                </p>
              </form>
            ) : (
            <form onSubmit={handleSubmit}>
              <label className="visually-hidden" htmlFor="login-username">
                {translations[language].username}
              </label>
              <input
                className="login-modal-input"
                id="login-username"
                type="text"
                name="username"
                placeholder={t("enterLoginId")}
                autoComplete="username"
                required
                onChange={() => setLoginError("")}
              />

              <label className="visually-hidden" htmlFor="login-password">
                {translations[language].password}
              </label>
              <div className="login-password-field">
                <input
                  className="login-modal-input"
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={translations[language].password}
                  autoComplete="current-password"
                  required
                  onChange={() => setLoginError("")}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label className="login-captcha-label" htmlFor="login-captcha">
                Enter CAPTCHA
              </label>
              <div className="login-captcha-row">
                <div className="login-captcha-entry">
                  <input
                    className="login-modal-input"
                    id="login-captcha"
                    name="captcha"
                    type="text"
                    value={captchaInput}
                    placeholder="Enter CAPTCHA"
                    autoComplete="off"
                    maxLength={6}
                    required
                    onChange={(event) => {
                      setCaptchaInput(event.target.value);
                      setLoginError("");
                    }}
                  />
                  <span className="login-captcha-challenge" aria-label={`CAPTCHA code ${captchaCode}`}>
                    {captchaCode}
                  </span>
                </div>
                <button
                  className="login-captcha-refresh"
                  type="button"
                  onClick={() => {
                    setCaptchaCode(createCaptcha());
                    setCaptchaInput("");
                    setLoginError("");
                  }}
                  aria-label="Refresh CAPTCHA"
                  title="Refresh CAPTCHA"
                >
                  ↻
                </button>
              </div>

              {!isStateSchemeLogin && (
                <p className="captcha-error" role="status">
                  Login is currently available for State and State-Central schemes only.
                </p>
              )}
              {loginError && <p className="captcha-error" role="alert">{loginError}</p>}
              <button className="login-submit" type="submit" disabled={loginSaving || !isStateSchemeLogin}>
                {loginSaving ? "Logging in..." : t("loginNow")}
              </button>
              {registerableUserTypes.includes(userType) && (
                <p className="login-register-prompt">
                  {t("noAccount")}{" "}
                  <button type="button" onClick={() => setRegistrationOpen(true)}>{t("registerNow")}</button>
                </p>
              )}
          </form>
          )}
        </div>
        {registrationMessage && (
          <div className="registration-success-backdrop">
            <section
              className="registration-success-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="registration-success-title"
            >
              <div className="registration-success-icon" aria-hidden="true">✓</div>
              <h2 id="registration-success-title">Registered successfully</h2>
              <button
                className="registration-success-button"
                type="button"
                onClick={() => setRegistrationMessage("")}
              >
                OK
              </button>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}

export default Login;
