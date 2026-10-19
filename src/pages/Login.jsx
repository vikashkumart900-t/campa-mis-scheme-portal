import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translateText, translations } from "../i18n";
import elephantImage from "../assets/elephant.jpg";
import asthavanImage from "../assets/asthavan.jpg";
import tigerImage from "../assets/tigers.jpg";
import wildBuffaloImage from "../assets/wild_bufaalo.jpg";
import rhinoImage from "../assets/rhino image.jpg";

const userTypes = ["implementingAgency", "programDivision", "nationalAuthority", "hod"];
const registerableUserTypes = ["implementingAgency", "programDivision"];
const registrationApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");
const registrationApiUrl = `${registrationApiBaseUrl}/registration`;

async function readApiResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response;
}

function createCaptcha() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const characters = letters + numbers;
  const answerCharacters = [
    letters[Math.floor(Math.random() * letters.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    ...Array.from(
      { length: 3 },
      () => characters[Math.floor(Math.random() * characters.length)]
    )
  ];

  for (let index = answerCharacters.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [answerCharacters[index], answerCharacters[swapIndex]] = [
      answerCharacters[swapIndex],
      answerCharacters[index]
    ];
  }

  const answer = answerCharacters.join("");
  return { question: answer, answer };
}

function drawCaptcha(canvas, text) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);

  for (let i = 0; i < 100; i += 1) {
    context.fillStyle = i % 3 === 0 ? "rgba(220, 38, 38, 0.58)" : "rgba(15, 23, 42, 0.35)";
    context.beginPath();
    context.arc(Math.random() * width, Math.random() * height, Math.random() * 1.4 + 0.4, 0, Math.PI * 2);
    context.fill();
  }

  for (let i = 0; i < 5; i += 1) {
    context.strokeStyle = "rgba(220, 38, 38, 0.72)";
    context.lineWidth = 1 + Math.random();
    context.beginPath();
    context.moveTo(Math.random() * width, Math.random() * height);
    context.lineTo(Math.random() * width, Math.random() * height);
    context.stroke();
  }

  context.font = "bold 30px Georgia, serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  [...text].forEach((character, index) => {
    const x = 30 + index * 60;
    const y = height / 2 + (Math.random() - 0.5) * 12;
    context.save();
    context.translate(x, y);
    context.rotate((Math.random() - 0.5) * 0.5);
    context.fillStyle = "#111827";
    context.fillText(character, 0, 0);
    context.restore();
  });
}

function Login() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryUserType = searchParams.get("userType");
  const [userType, setUserType] = useState(
    userTypes.includes(queryUserType) ? queryUserType : ""
  );
  const [captcha, setCaptcha] = useState(createCaptcha);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");
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
    stateId: "",
    districtId: "",
    programDivisionId: "",
    officerName: "",
    designation: "",
    email: "",
    mobile: "",
    password: ""
  });
  const captchaCanvasRef = useRef(null);
  const t = (key) => translateText(key, language);
  const userTypeLabel = userType ? translations[language][userType] : "";

  useEffect(() => {
    if (!registerableUserTypes.includes(userType)) {
      return undefined;
    }

    const controller = new AbortController();

    fetch(`${registrationApiUrl}/dropdown-metadata`, { signal: controller.signal })
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
  }, [userType]);

  useEffect(() => {
    if (
      userType !== "implementingAgency" ||
      registrationMetadata?.organizations.find(
        (organization) => organization.organizationId === Number(registrationForm.organizationId)
      )?.iaCategory !== "STATE_IA" ||
      !registrationForm.stateId
    ) {
      return undefined;
    }

    const controller = new AbortController();
    fetch(`${registrationApiUrl}/districts/${registrationForm.stateId}`, { signal: controller.signal })
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
  }, [registrationForm.organizationId, registrationForm.stateId, registrationMetadata, userType]);

  useEffect(() => {
    if (captchaCanvasRef.current) {
      drawCaptcha(captchaCanvasRef.current, captcha.answer);
    }
  }, [captcha]);

  const closeLogin = () => navigate("/login");

  const refreshCaptcha = () => {
    setCaptchaAnswer("");
    setCaptchaError("");
    setCaptcha(createCaptcha());
  };

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
      const response = await fetch(`${registrationApiUrl}/nodal-officer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await readApiResponse(response);
      setRegistrationMessage("Nodal officer details saved successfully.");
      setRegistrationForm({
        organizationId: "",
        stateId: "",
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!captchaAnswer.trim() || captchaAnswer.trim().toUpperCase() !== captcha.answer) {
      setCaptchaError(t("captchaError"));
      setCaptchaAnswer("");
      setCaptcha(createCaptcha());
      return;
    }

    if (userTypes.includes(userType)) {
      navigate(`/dashboard/${userType}`);
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
              {registrationOpen
                ? "Nodal Officer Registration"
                : userType
                ? `${t("hello")} ${userTypeLabel}`
                : translations[language].login}
            </h1>
            <p className="login-modal-subtitle">
              {registrationOpen ? "Enter your organization and nodal officer details." : t("loginToAccount")}
            </p>

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
                              stateId: "",
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
                              name="stateId"
                              value={registrationForm.stateId}
                              onChange={(event) => {
                                const { value } = event.target;
                                setRegistrationForm((previous) => ({
                                  ...previous,
                                  stateId: value,
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
                                <option key={state.stateId} value={state.stateId}>{state.stateName}</option>
                              ))}
                            </select>
                            <label className="visually-hidden" htmlFor="registration-district">District</label>
                            <select
                              id="registration-district"
                              className="login-modal-input"
                              name="districtId"
                              value={registrationForm.districtId}
                              onChange={handleRegistrationFieldChange}
                              disabled={!registrationForm.stateId || districtLoading}
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
              {!userType && (
                <>
                  <label className="visually-hidden" htmlFor="login-user-type">
                  {translations[language].selectUserType}
                </label>
                <select
                  id="login-user-type"
                  className="login-modal-input"
                  value={userType}
                  onChange={(event) => {
                    const selectedUserType = event.target.value;
                    setUserType(selectedUserType);
                    setRegistrationLoading(registerableUserTypes.includes(selectedUserType));
                    setRegistrationError("");
                    setRegistrationMetadata(null);
                    setDistricts([]);
                    setDistrictLoading(false);
                    setDistrictError("");
                    setRegistrationForm((previous) => ({
                      ...previous,
                      organizationId: "",
                      stateId: "",
                      districtId: "",
                      programDivisionId: ""
                    }));
                    setRegistrationMessage("");
                  }}
                  required
                >
                  <option value="">{translations[language].selectUserType}</option>
                  {userTypes.map((type) => (
                    <option key={type} value={type}>
                      {translations[language][type]}
                    </option>
                  ))}
                </select>
              </>
            )}

            {userType && (
              <>
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

                <div className="login-captcha-row">
                  <label className="visually-hidden" htmlFor="captcha-answer">
                    {t("captchaLabel")}
                  </label>
                  <div className="login-captcha-entry">
                    <input
                      className="login-modal-input"
                      id="captcha-answer"
                      type="text"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck="false"
                      placeholder={t("captchaAnswerPlaceholder")}
                      value={captchaAnswer}
                      onChange={(event) => {
                        setCaptchaAnswer(event.target.value);
                        setCaptchaError("");
                      }}
                      aria-describedby={captchaError ? "captcha-error" : undefined}
                      aria-invalid={Boolean(captchaError)}
                      required
                    />
                    <canvas
                      className="login-captcha-challenge"
                      ref={captchaCanvasRef}
                      width="300"
                      height="92"
                      role="img"
                      aria-label="CAPTCHA challenge"
                      aria-live="polite"
                    />
                  </div>
                  <button
                    className="login-captcha-refresh"
                    type="button"
                    onClick={refreshCaptcha}
                    aria-label={t("refreshCaptcha")}
                  >
                    ↻
                  </button>
                </div>
                {captchaError && (
                  <p className="captcha-error" id="captcha-error" role="alert">
                    {captchaError}
                  </p>
                )}
                <button className="login-submit" type="submit">
                  {t("loginNow")}
                </button>
                {registerableUserTypes.includes(userType) && (
                  <p className="login-register-prompt">
                    {t("noAccount")}{" "}
                    <button type="button" onClick={() => setRegistrationOpen(true)}>{t("registerNow")}</button>
                  </p>
                )}
              </>
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
