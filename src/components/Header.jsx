import emblem from "../assets/emblem.png";
import moefccLogo from "../assets/moefcc.png";
import ministryLogo from "../assets/ministry-logo.png";
import indiaFlag from "../assets/india-flag.png";
import { useState, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { INDIAN_LANGUAGES, translateText, translations } from "../i18n";

function Header() {
  const [fontSize, setFontSize] = useState(100);
  const { language, setLanguage } = useLanguage();

  const changeFontSize = (type) => {
    if (type === "decrease") {
      setFontSize((prev) => Math.max(prev - 10, 80));
    }

    if (type === "normal") {
      setFontSize(100);
    }

    if (type === "increase") {
      setFontSize((prev) => Math.min(prev + 10, 130));
    }
  };

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  return (
    <>
      <div className="top-bar">

        <div className="government">
          <span>🇮🇳</span>
          <span>Government of India</span>
        </div>

        <div className="accessibility" aria-label="Accessibility controls">
          <label className="language-switcher" htmlFor="language-selector">
            <span>{translations[language].language}:</span>
            <select
              id="language-selector"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {INDIAN_LANGUAGES.map((languageOption) => (
                <option key={languageOption.value} value={languageOption.value}>
                  {languageOption.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="accessibility-button"
            onClick={() => changeFontSize("decrease")}
            aria-label="Decrease font size"
          >
            A-
          </button>

          <button
            type="button"
            className="accessibility-button"
            onClick={() => changeFontSize("normal")}
            aria-label="Reset font size"
          >
            A
          </button>

          <button
            type="button"
            className="accessibility-button"
            onClick={() => changeFontSize("increase")}
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>

      </div>


      <header className="main-header">

        <div className="header-left">

          <img
            src={emblem}
            alt="Government of India"
            className="emblem-logo"
          />

          <div className="ministry-text">

            <h2>
              {translations[language].authorityTitle1}

              <br />
              {translations[language].authorityTitle2}

              <br />
              {translations[language].authorityTitle3}

            </h2>

            <p>
            {translations[language].ministryLine1}
 
            </p>

            <p>
            {translations[language].ministryLine2}

            </p>

          </div>

          <img
            src={moefccLogo}
            alt="MoEFCC"
            className="header-logo"
          />

          <img
            src={ministryLogo}
            alt="Ministry"
            className="header-logo"
          />

        </div>


        <div className="portal-title">

          <h1>
            {translations[language].campaMonitoringSystem}
    


          </h1>


        </div>


        <div className="india-section">

          <img
            src={indiaFlag}
            alt="India"
            className="india-flag"
          />

          <div>
            <strong>
              डिजिटल इंडिया
            </strong>

            <small>
              DIGITAL INDIA
            </small>
          </div>

        </div>

      </header>

    </>
  );
}

export default Header;