import emblem from "../../assets/emblem.png";
import ministryLogo from "../../assets/ministry-logo.png";
import moefccLogo from "../../assets/moefcc.png";
import indiaFlag from "../../assets/india-flag.png";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { INDIAN_LANGUAGES, translations } from "../../i18n";

function Header() {
  const [fontSize, setFontSize] = useState(100);
  const [theme, setTheme] = useState(() => (
    localStorage.getItem("schemeMisTheme") === "dark" ? "dark" : "light"
  ));
  const { language, setLanguage } = useLanguage();
  const t = translations[language] ?? translations.en;

  const changeFontSize = (type) => {
    if (type === "decrease") setFontSize((prev) => Math.max(prev - 10, 80));
    if (type === "normal") setFontSize(100);
    if (type === "increase") setFontSize((prev) => Math.min(prev + 10, 130));
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("schemeMisTheme", theme);
  }, [theme]);

  return (
    <>
      <div className="top-bar">
        <div className="government">
          <img src={indiaFlag} alt="Indian national flag" className="government__flag" />
          <span>{t.governmentOfIndia}</span>
          <span className="government__separator" aria-hidden="true">|</span>
          <span className="government__ministry">{t.ministry}</span>
        </div>

        <div className="accessibility" aria-label={t.accessibility}>
          <label className="language-switcher" htmlFor="language-selector">
            <span>{t.language}:</span>
            <select id="language-selector" value={language} onChange={(event) => setLanguage(event.target.value)}>
              {INDIAN_LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <button type="button" className="accessibility-button" onClick={() => changeFontSize("decrease")} aria-label="Decrease font size">A-</button>
          <button type="button" className="accessibility-button" onClick={() => changeFontSize("normal")} aria-label="Reset font size">A</button>
          <button type="button" className="accessibility-button" onClick={() => changeFontSize("increase")} aria-label="Increase font size">A+</button>
          <button
            type="button"
            className="accessibility-button accessibility-button--icon"
            aria-label={t.accessibility}
            aria-pressed={theme === "dark"}
            onClick={() => setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <header className="main-header">
        <div className="header-left">
          <Link to="/login" className="emblem-home-link" aria-label="Go to home page">
            <img src={emblem} alt="Government of India" className="emblem-logo" />
          </Link>
          <Link to="/login" className="portal-title portal-title--link">
            <h1>CAMPA MIS Scheme Portal</h1>
            <p>Compensatory Afforestation Fund Management and Planning Authority</p>
          </Link>
        </div>

        <div className="header-brand-right">
          <div className="header-brand-right__life">
            <strong>LiFE</strong>
            <small>Life for Environment</small>
          </div>

          <div className="header-brand-right__logo-wrap">
            <img src={moefccLogo} alt="CAMPA" className="header-brand-right__campa-logo" />
            <div className="header-brand-right__text">
              <strong>CAMPA</strong>
              <small>Greener Tomorrow</small>
            </div>
          </div>

          <img
            src={ministryLogo}
            alt={t.ministry}
            className="header-brand-right__ministry-logo"
          />
        </div>
      </header>
    </>
  );
}

export default Header;