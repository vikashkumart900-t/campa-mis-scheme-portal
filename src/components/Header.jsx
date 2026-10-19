import emblem from "../assets/emblem.png";
import ministryLogo from "../assets/ministry-logo.png";
import moefccLogo from "../assets/moefcc.png";
import indiaFlag from "../assets/india-flag.png";
import { useState, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { INDIAN_LANGUAGES, translations } from "../i18n";

function Header() {
  const [fontSize, setFontSize] = useState(100);
  const { language, setLanguage } = useLanguage();

  const changeFontSize = (type) => {
    if (type === "decrease") setFontSize((prev) => Math.max(prev - 10, 80));
    if (type === "normal") setFontSize(100);
    if (type === "increase") setFontSize((prev) => Math.min(prev + 10, 130));
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  return (
    <>
      <div className="top-bar">
        <div className="government">
          <img src={indiaFlag} alt="Indian national flag" className="government__flag" />
          <span>Government of India</span>
          <span className="government__separator" aria-hidden="true">|</span>
          <span className="government__ministry">Ministry of Environment, Forest and Climate Change</span>
        </div>

        <div className="accessibility" aria-label="Accessibility controls">
          <label className="language-switcher" htmlFor="language-selector">
            <span>{translations[language].language}:</span>
            <select id="language-selector" value={language} onChange={(event) => setLanguage(event.target.value)}>
              {INDIAN_LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <button type="button" className="accessibility-button" onClick={() => changeFontSize("decrease")} aria-label="Decrease font size">A-</button>
          <button type="button" className="accessibility-button" onClick={() => changeFontSize("normal")} aria-label="Reset font size">A</button>
          <button type="button" className="accessibility-button" onClick={() => changeFontSize("increase")} aria-label="Increase font size">A+</button>
          <button type="button" className="accessibility-button accessibility-button--icon" aria-label="Accessibility options">◐</button>
        </div>
      </div>

      <header className="main-header">
        <div className="header-left">
          <img src={emblem} alt="Government of India" className="emblem-logo" />
          <div className="portal-title">
            <h1>CAMPA MIS Scheme Portal</h1>
            <p>Compensatory Afforestation Fund Management and Planning Authority</p>
          </div>
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
            alt="Ministry of Environment, Forest and Climate Change"
            className="header-brand-right__ministry-logo"
          />
        </div>
      </header>
    </>
  );
}

export default Header;