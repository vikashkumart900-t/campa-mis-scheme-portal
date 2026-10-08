import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translateText, translations } from "../i18n";
import elephantImage from "../assets/elephant.jpg";
import asthavanImage from "../assets/asthavan.jpg";
import tigerImage from "../assets/tigers.jpg";
import wildBuffaloImage from "../assets/wild_bufaalo.jpg";
import rhinoImage from "../assets/rhino image.jpg";

const userTypes = ["implementingAgency", "programDivision", "nationalAuthority", "hod"];

function createCaptcha() {
  const firstNumber = Math.floor(Math.random() * 9) + 1;
  const secondNumber = Math.floor(Math.random() * 9) + 1;
  const addition = Math.random() >= 0.5;
  const [left, right] = addition || firstNumber >= secondNumber
    ? [firstNumber, secondNumber]
    : [secondNumber, firstNumber];
  const operator = addition ? "+" : "-";

  return {
    question: `${left} ${operator} ${right}`,
    answer: addition ? left + right : left - right
  };
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
  const t = (key) => translateText(key, language);
  const userTypeLabel = userType ? translations[language][userType] : "";

  const closeLogin = () => navigate("/login");

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaAnswer("");
    setCaptchaError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!captchaAnswer.trim() || Number(captchaAnswer) !== captcha.answer) {
      setCaptchaError(t("captchaError"));
      setCaptcha(createCaptcha());
      setCaptchaAnswer("");
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
            {userType
              ? `${t("hello")} ${userTypeLabel}`
              : translations[language].login}
          </h1>
          <p className="login-modal-subtitle">{t("loginToAccount")}</p>

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
                  onChange={(event) => setUserType(event.target.value)}
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
                  placeholder={t("enterLoginId")}
                  autoComplete="username"
                  required
                />

                <label className="visually-hidden" htmlFor="login-password">
                  {translations[language].password}
                </label>
                <div className="login-password-field">
                  <input
                    className="login-modal-input"
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={translations[language].password}
                    autoComplete="current-password"
                    required
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
                  <input
                    className="login-modal-input"
                    id="captcha-answer"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
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
                  <div className="login-captcha-challenge" aria-live="polite">
                    {captcha.question} = ?
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
                <p className="login-register-prompt">
                  {t("noAccount")} <a href="#register">{t("registerNow")}</a>
                </p>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;
