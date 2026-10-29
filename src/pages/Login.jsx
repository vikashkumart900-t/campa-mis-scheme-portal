import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Landmark, Leaf, UsersRound, UserRoundCog } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translateText, translations } from "../i18n";
import { apiUrls } from "../api/urls";
import elephantImage from "../assets/elephant.jpg";
import asthavanImage from "../assets/asthavan.jpg";
import tigerImage from "../assets/tigers.jpg";
import wildBuffaloImage from "../assets/wild_bufaalo.jpg";
import rhinoImage from "../assets/rhino image.jpg";

const userTypes = ["implementingAgency", "hod", "state_hod", "districtForestOfficer", "programDivision", "nationalCampa"];
const roleCodes = {
  implementingAgency: "IA",
  hod: "HOD",
  state_hod: "STATE_HOD",
  districtForestOfficer: "FC_DFO",
  programDivision: "PD",
  nationalCampa: "NATIONAL_CAMPA"
};
const roleTileOrder = [
  "implementingAgency",
  "hod",
  "state_hod",
  "districtForestOfficer",
  "programDivision",
  "nationalCampa"
];
const registerableUserTypes = ["implementingAgency", "programDivision"];
const misLoginUserTypes = ["implementingAgency", "programDivision", "hod"];
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

  if (/user role not authorized/i.test(message)) {
    return "This account is not authorized for the selected role. Confirm that it is assigned to NATIONAL_CAMPA.";
  }

  if (/unauthori[sz]ed|invalid credentials|bad credentials|incorrect (username|password)|username or password/i.test(message)) {
    return "Username or password is incorrect.";
  }

  return `Unable to log in: ${message}`;
}

function getRoleOptions(response) {
  const roles = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.roles)
        ? response.data.roles
        : Array.isArray(response?.roles)
          ? response.roles
          : null;

  if (!roles) {
    throw new Error("The roles API returned unexpected data.");
  }

  const rolesByKey = new Map(userTypes.map((role) => [role.toLowerCase().replace(/[_\s-]/g, ""), role]));
  const rolesByCode = {
    IA: "implementingAgency",
    HOD: "hod",
    STATE_HOD: "state_hod",
    DFO: "districtForestOfficer",
    FC_DFO: "districtForestOfficer",
    PD: "programDivision",
    NATIONAL_CAMPA: "nationalCampa"
  };
  return roles.filter((role) => typeof role === "string" || role?.isActive !== false).map((role) => {
    const roleName = typeof role === "string"
      ? role
      : rolesByCode[role?.roleCode] || role?.roleName || role?.role || role?.name;
    const normalizedRole = typeof roleName === "string"
      ? rolesByKey.get(roleName.toLowerCase().replace(/[_\s-]/g, ""))
      : null;

    if (!normalizedRole) {
      throw new Error("The roles API returned an unsupported role.");
    }
    return normalizedRole;
  });
}

function Login() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryUserType = searchParams.get("userType");
  const roleSelectionRequired = searchParams.get("scope") === "state-central" && !queryUserType;
  const isStateSchemeLogin = ["state", "state-central"].includes(searchParams.get("scope"));
  const [selectedRole, setSelectedRole] = useState(
    () => userTypes.includes(queryUserType) ? queryUserType : roleSelectionRequired ? "" : "implementingAgency"
  );
  const [availableRoles, setAvailableRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(roleSelectionRequired);
  const [rolesError, setRolesError] = useState("");
  const [roleSelectionComplete, setRoleSelectionComplete] = useState(false);
  const [divisionOrganizations, setDivisionOrganizations] = useState([]);
  const [registrationMappingsLoading, setRegistrationMappingsLoading] = useState(false);
  const [registrationMappingsError, setRegistrationMappingsError] = useState("");
  const userType = userTypes.includes(queryUserType) ? queryUserType : selectedRole;
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
    implementingAgency: "Implementing Agency (IA)",
    hod: "Head of Division (HOD)",
    state_hod: "Chief Wildlife Warden (CWLW)",
    districtForestOfficer: "District Forest Officer (DFO)",
    programDivision: "Programme Division (PD)",
    nationalCampa: "NATIONAL_CAMPA"
  };
  const roleDescriptions = {
    implementingAgency: "For Implementing Agency users at central level.",
    hod: "For HOD users at central level.",
    state_hod: "For State HOD (CWLW) users at state level.",
    districtForestOfficer: "For DFO users at state level.",
    programDivision: "For Programme Division users.",
    nationalCampa: "For National CAMPA users (Authority)."
  };
  const roleIcons = {
    implementingAgency: Landmark,
    hod: Landmark,
    state_hod: UsersRound,
    districtForestOfficer: UserRoundCog,
    programDivision: FileText,
    nationalCampa: Leaf
  };
  const roleTileOptions = roleTileOrder
    .filter((role) => availableRoles.includes(role))
    .map((role) => ({ role, label: roleLabels[role], description: roleDescriptions[role] }));
  const SelectedRoleIcon = roleIcons[selectedRole];
  const registrationOrganizationOptions = Array.from(
    new Map(
      divisionOrganizations.map((item) => [
        String(item.organizationId),
        { id: String(item.organizationId), name: item.organizationName }
      ])
    ).values()
  ).sort((first, second) => first.name.localeCompare(second.name));
  const registrationProgramDivisionOptions = divisionOrganizations
    .filter((item) => String(item.organizationId) === registrationForm.organizationId)
    .filter((item, index, matches) =>
      matches.findIndex((match) => String(match.programDivisionId) === String(item.programDivisionId)) === index
    )
    .sort((first, second) => first.divisionName.localeCompare(second.divisionName));
  const allProgramDivisionOptions = divisionOrganizations
    .filter((item, index, matches) =>
      matches.findIndex((match) => String(match.programDivisionId) === String(item.programDivisionId)) === index
    )
    .sort((first, second) => first.divisionName.localeCompare(second.divisionName));

  useEffect(() => {
    if (!roleSelectionRequired) {
      return undefined;
    }

    const controller = new AbortController();

    fetch(apiUrls.roles, { signal: controller.signal })
      .then(readApiResponse)
      .then((response) => response.json())
      .then((response) => {
        const roles = getRoleOptions(response);
        if (roles.length === 0) {
          throw new Error("The roles API returned no roles.");
        }
        setAvailableRoles(roles);
        setRolesError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRolesError(`Unable to load roles: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setRolesLoading(false);
        }
      });

    return () => controller.abort();
  }, [roleSelectionRequired]);

  useEffect(() => {
    if (!registrationOpen || !registerableUserTypes.includes(userType)) {
      return undefined;
    }

    const controller = new AbortController();
    fetch(apiUrls.programDivisionOrganizations, { signal: controller.signal })
      .then(readApiResponse)
      .then((response) => response.json())
      .then((mappings) => {
        if (!Array.isArray(mappings) || mappings.some((item) =>
          !item ||
          item.organizationId == null ||
          typeof item.organizationName !== "string" ||
          item.programDivisionId == null ||
          typeof item.divisionName !== "string"
        )) {
          throw new Error("The programme division and organization API returned unexpected data.");
        }
        setDivisionOrganizations(mappings);
        setRegistrationMappingsError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRegistrationMappingsError(`Unable to load organizations and programme divisions: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setRegistrationMappingsLoading(false);
        }
      });

    return () => controller.abort();
  }, [registrationOpen, userType]);

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

    try {
      if (!["implementingAgency", "programDivision"].includes(userType)) {
        throw new Error("Registration is not available for the selected role.");
      }
      const isImplementingAgency = userType === "implementingAgency";
      const organizationId = Number(registrationForm.organizationId);
      const programDivisionId = Number(registrationForm.programDivisionId);

      if (isImplementingAgency) {
        if (!Number.isSafeInteger(organizationId) || organizationId <= 0) {
          throw new Error("Select a valid implementing agency.");
        }
        if (!registrationOrganizationOptions.some(
          (organization) => Number(organization.id) === organizationId
        )) {
          throw new Error("The selected implementing agency is not available.");
        }
      }
      const availableDivisions = isImplementingAgency
        ? registrationProgramDivisionOptions
        : allProgramDivisionOptions;
      if (!availableDivisions.some((division) => division.programDivisionId === programDivisionId)) {
        throw new Error("Select a programme division.");
      }
      const payload = {
        roleCode: roleCodes[userType],
        programDivisionId,
        fullName: registrationForm.officerName,
        designation: registrationForm.designation,
        email: registrationForm.email,
        mobile: registrationForm.mobile,
        password: registrationForm.password
      };
      if (isImplementingAgency) {
        payload.organizationId = organizationId;
      }
      const response = await fetch(apiUrls.register, {
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
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isStateSchemeLogin) {
      setLoginError("Login is currently available for State and State-Central schemes only.");
      return;
    }

    if (!(roleSelectionRequired && roleSelectionComplete) && captchaInput.trim().toUpperCase() !== captchaCode) {
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
      const usesPariveshLogin = searchParams.get("scope") === "state" || !misLoginUserTypes.includes(userType);
      const loginUrl = usesPariveshLogin
        ? apiUrls.pariveshLogin
        : apiUrls.misLogin;
      const response = await fetch(loginUrl, {
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

      if (usesPariveshLogin) {
        const roleAbbreviations = [
          result?.data?.roleAbbreviation,
          result?.roleAbbreviation,
          ...(Array.isArray(result?.data?.roleNameAbbreviationDtos)
            ? result.data.roleNameAbbreviationDtos.map((role) => role?.roleAbbreviation)
            : [])
        ]
          .filter((roleAbbreviation) => typeof roleAbbreviation === "string")
          .map((roleAbbreviation) => roleAbbreviation.trim().toUpperCase())
          .filter(Boolean);
        const expectedRoleCode = roleCodes[userType];
        if (!expectedRoleCode || !roleAbbreviations.includes(expectedRoleCode)) {
          sessionStorage.removeItem("campaJwt");
          sessionStorage.removeItem("campaUserEmail");
          throw new Error(
            roleAbbreviations.length > 0
              ? `Selected role does not match the Parivesh role(s) (${roleAbbreviations.join(", ")}).`
              : "The Parivesh login response did not include a roleAbbreviation, so the selected role could not be verified."
          );
        }
      }

      const jwt = result?.data?.jwt
        || result?.data?.token
        || result?.jwt
        || result?.token;
      const loginSucceeded = result?.message === "Login successful" || result?.success === true;

      if (!loginSucceeded && (typeof jwt !== "string" || !jwt.trim())) {
        throw new Error("The login API response did not include an access token.");
      }

      sessionStorage.setItem("campaJwt", typeof jwt === "string" && jwt.trim() ? jwt : "authenticated");
      if (typeof result?.email === "string" && result.email.trim()) {
        sessionStorage.setItem("campaUserEmail", result.email.trim());
      }
      if (userTypes.includes(userType)) {
        const dashboardParams = new URLSearchParams();
        ["scope", "schemeId", "schemeCode", "schemeName", "organizationId", "organizationName", "programDivisionId", "programDivisionName"].forEach((key) => {
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
        className={`login-modal${roleSelectionRequired && !roleSelectionComplete ? " login-modal--role-selection" : ""}${roleSelectionRequired && roleSelectionComplete ? " login-modal--role-login" : ""}`}
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

        {roleSelectionRequired && roleSelectionComplete ? (
          <aside className="login-selected-role" aria-label="Selected role">
            {SelectedRoleIcon && (
              <span className="login-selected-role-icon" aria-hidden="true">
                <SelectedRoleIcon />
              </span>
            )}
            <strong>{roleLabels[selectedRole]}</strong>
            <span>{roleDescriptions[selectedRole]}</span>
            <div className="login-selected-role-applicable">
              <strong>Applicable for:</strong>
              <span>{roleLabels[selectedRole]}</span>
            </div>
          </aside>
        ) : (
          <div className="login-photo-grid" aria-hidden="true">
            <img className="login-photo-deer" src={wildBuffaloImage} alt="" />
            <img className="login-photo-forest" src={asthavanImage} alt="" />
            <img className="login-photo-tiger" src={tigerImage} alt="" />
            <img className="login-photo-elephants" src={elephantImage} alt="" />
            <img className="login-photo-work" src={rhinoImage} alt="" />
            <img className="login-photo-water" src={asthavanImage} alt="" />
          </div>
        )}
        <div className="login-modal-content">
          {!(roleSelectionRequired && roleSelectionComplete) && (
            <>
              <h1 id="login-modal-title">
                {registrationOpen
                  ? "Nodal Officer Registration"
                  : roleSelectionRequired
                    ? "Login to MIS Portal"
                    : translations[language].login}
              </h1>
              <p className="login-modal-subtitle">
                {registrationOpen
                  ? "Enter your organization and nodal officer details."
                  : roleSelectionRequired
                    ? "Select your role to continue."
                    : t("loginToAccount")}
              </p>
            </>
          )}

          {roleSelectionRequired && !roleSelectionComplete ? (
            <div className="login-role-selection">
              {rolesLoading && <p className="login-role-status" role="status">Loading roles...</p>}
              {rolesError && <p className="captcha-error login-role-status" role="alert">{rolesError}</p>}
              {!rolesLoading && !rolesError && roleTileOptions.map(({ role, label, description }) => {
                const RoleIcon = roleIcons[role];
                const isSelected = selectedRole === role;
                return (
                  <label
                    key={role}
                    className={`login-role-card${isSelected ? " login-role-card--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="selectedRole"
                      value={role}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedRole(role);
                        setLoginError("");
                      }}
                    />
                    <span className="login-role-card-icon" aria-hidden="true"><RoleIcon /></span>
                    <span className="login-role-card-copy">
                      <strong>{label}</strong>
                      <span>{description}</span>
                    </span>
                  </label>
                );
              })}
              <button
                className="login-role-continue"
                type="button"
                disabled={!selectedRole || rolesLoading || Boolean(rolesError)}
                onClick={() => setRoleSelectionComplete(true)}
              >
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : registrationOpen ? (
                  <form onSubmit={handleRegistrationSubmit}>
                    {registrationLoading && <p role="status">Loading registration options...</p>}
                    {registrationError && <p className="captcha-error" role="alert">{registrationError}</p>}
                    {districtError && <p className="captcha-error" role="alert">{districtError}</p>}
                    {registrationMappingsLoading && <p role="status">Loading organizations...</p>}
                    {registrationMappingsError && <p className="captcha-error" role="alert">{registrationMappingsError}</p>}
                    {!registrationLoading && registrationMetadata && (
                      <>
                        {!registrationMappingsLoading && !registrationMappingsError && (
                          <>
                        {userType === "programDivision" ? (
                          <>
                            <label className="visually-hidden" htmlFor="registration-program-division">
                              Programme division
                            </label>
                            <select
                              id="registration-program-division"
                              className="login-modal-input"
                              name="programDivisionId"
                              value={registrationForm.programDivisionId}
                              onChange={handleRegistrationFieldChange}
                              required
                            >
                              <option value="">Select programme division</option>
                              {allProgramDivisionOptions.map((division) => (
                                <option key={division.programDivisionId} value={division.programDivisionId}>
                                  {division.divisionName}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <>
                            <label className="visually-hidden" htmlFor="registration-organization">
                              Organization
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
                              <option value="">Select organization</option>
                              {registrationOrganizationOptions.map((organizationOption) => (
                                <option key={organizationOption.id} value={organizationOption.id}>
                                  {organizationOption.name}
                                </option>
                              ))}
                            </select>
                            {userType === "implementingAgency" && selectedImplementingAgency?.iaCategory === "STATE_IA" && (
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
                            <label className="visually-hidden" htmlFor="registration-program-division">
                              Programme division
                            </label>
                            <select
                              id="registration-program-division"
                              className="login-modal-input"
                              name="programDivisionId"
                              value={registrationForm.programDivisionId}
                              onChange={handleRegistrationFieldChange}
                              required
                              disabled={!registrationForm.organizationId}
                            >
                              <option value="">Select programme division</option>
                              {registrationProgramDivisionOptions.map((division) => (
                                <option key={division.programDivisionId} value={division.programDivisionId}>
                                  {division.divisionName}
                                </option>
                              ))}
                            </select>
                          </>
                        )}
                      </>
                    )}
                    {userType === "implementingAgency" && registrationOrganizationOptions.length === 0 && !registrationMappingsLoading && !registrationMappingsError && (
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
                      disabled={
                        registrationSaving ||
                        registrationLoading ||
                        registrationMappingsLoading ||
                        Boolean(registrationMappingsError) ||
                        (userType === "programDivision"
                          ? allProgramDivisionOptions.length === 0
                          : registrationOrganizationOptions.length === 0 || !registrationForm.organizationId) ||
                        !registrationForm.programDivisionId
                      }
                    >
                      {registrationSaving ? "Saving..." : "Register"}
                    </button>
                  </>
                )}
                <p className="login-register-prompt">
                  <button type="button" onClick={() => { setRegistrationOpen(false); setRegistrationError(""); setRegistrationMappingsError(""); setRegistrationMessage(""); }}>
                    Back to login
                  </button>
                </p>
              </form>
            ) : (
              <>
              <form onSubmit={handleSubmit}>
              {roleSelectionRequired && roleSelectionComplete && (
                <button
                  className="login-back-to-roles"
                  type="button"
                  onClick={() => setRoleSelectionComplete(false)}
                >
                  <span aria-hidden="true">←</span> Back to Role Selection
                </button>
              )}
              <label className="visually-hidden" htmlFor="login-username">
                {translations[language].username}
              </label>
              <input
                className="login-modal-input"
                id="login-username"
                type="text"
                name="username"
                placeholder={translations[language].username}
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

              {!(roleSelectionRequired && roleSelectionComplete) && (
                <>
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
                </>
              )}

              {!isStateSchemeLogin && (
                <p className="captcha-error" role="status">
                  Login is currently available for State and State-Central schemes only.
                </p>
              )}
              {loginError && <p className="captcha-error" role="alert">{loginError}</p>}
              <button
                className="login-submit"
                type="submit"
                disabled={loginSaving || !isStateSchemeLogin || (roleSelectionRequired && (
                  !selectedRole ||
                  rolesLoading ||
                  Boolean(rolesError)
                ))}
              >
                {loginSaving ? "Logging in..." : t("loginNow")}
              </button>
              {registerableUserTypes.includes(userType) && (
                <p className="login-register-prompt">
                  {t("noAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationLoading(true);
                      setRegistrationMappingsLoading(true);
                      setRegistrationError("");
                      setRegistrationMappingsError("");
                      setRegistrationOpen(true);
                    }}
                  >
                    {t("registerNow")}
                  </button>
                </p>
              )}
          </form>
          </>
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
