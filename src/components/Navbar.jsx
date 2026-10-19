import { useState } from "react";
import { Link } from "react-router-dom";
import { House, Menu, UserCircle2, X } from "lucide-react";
import { translations } from "../i18n";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function Navbar() {
  const { language } = useLanguage();
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loginOptions = [
    ["implementingAgency", translations[language].implementingAgency],
    ["programDivision", translations[language].programDivision],
    ["nationalAuthority", translations[language].nationalAuthority],
    ["hod", translations[language].hod]
  ];

  return (
    <nav className="navbar">
      <div className={`nav-container${mobileMenuOpen ? " nav-container--open" : ""}`}>
        <button
          type="button"
          className="nav-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
        <div className="nav-links" id="primary-navigation">
          <Link to="/login" className="nav-home-link" onClick={() => setMobileMenuOpen(false)}>
            <House size={13} aria-hidden="true" />
            {translations[language].home}
          </Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>{translations[language].aboutUs}</Link>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)}>{translations[language].schemesAndProgrammes}</Link>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>{translations[language].reportsAnalytics}</Link>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>{translations[language].faqs}</Link>
          <Link to="/user-manual" onClick={() => setMobileMenuOpen(false)}>{translations[language].userManual}</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)}>{translations[language].contactUs}</Link>
        </div>

        <div className="nav-utility">
          <div className="login-menu">
            <button
              type="button"
              className="login-button"
              aria-expanded={loginMenuOpen}
              aria-haspopup="menu"
              aria-controls="login-role-menu"
              onClick={() => setLoginMenuOpen((open) => !open)}
            >
              <UserCircle2 size={16} />
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
      </div>
    </nav>
  );
}

export default Navbar;