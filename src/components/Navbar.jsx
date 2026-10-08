import { useState } from "react";
import { Link } from "react-router-dom";
import { translations } from "../i18n";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function Navbar() {
  const { language } = useLanguage();
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const loginOptions = [
    ["implementingAgency", translations[language].implementingAgency],
    ["programDivision", translations[language].programDivision],
    ["nationalAuthority", translations[language].nationalAuthority],
    ["hod", translations[language].hod]
  ];

  return (
    <nav className="navbar">

      <div className="nav-container">

        <div className="nav-links">

          <Link to="/login">
           {translations[language].home}
          </Link>

          <Link to="/about">
            {translations[language].aboutUs}
          </Link>

          <Link to="/faq">
            {translations[language].faqs}
          </Link>

          <Link to="/user-manual">
            {translations[language].userManual}
          </Link>

        </div>


        <div className="login-menu">
          <button
            type="button"
            className="login-button"
            aria-expanded={loginMenuOpen}
            aria-haspopup="menu"
            aria-controls="login-role-menu"
            onClick={() => setLoginMenuOpen((open) => !open)}
          >
            {translations[language].loginRegister}
          </button>

          {loginMenuOpen && (
            <div className="login-role-menu" id="login-role-menu" role="menu">
              {loginOptions.map(([userType, label]) => (
                <Link
                  key={userType}
                  to={`/signin?userType=${userType}`}
                  role="menuitem"
                  onClick={() => setLoginMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

    </nav>
  );
}

export default Navbar;