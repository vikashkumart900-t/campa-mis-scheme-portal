import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { House, Menu, X } from "lucide-react";
import { translations } from "../../i18n";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

function Navbar() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const schemeScope = searchParams.get("scope") || "";

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
          <Link to="/schemes" onClick={() => setMobileMenuOpen(false)}>{translations[language].schemesAndProgrammes}</Link>
          <Link to="/reports" onClick={() => setMobileMenuOpen(false)}>{translations[language].reportsAnalytics}</Link>
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>{translations[language].faqs}</Link>
          <Link to="/user-manual" onClick={() => setMobileMenuOpen(false)}>{translations[language].userManual}</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>{translations[language].contactUs}</Link>
        </div>

        <div className="nav-utility">
          <label className="nav-scheme-label" htmlFor="nav-scheme-scope">
            Scheme type
            <select
              id="nav-scheme-scope"
              className="nav-scheme-select"
              value={schemeScope}
              onChange={(event) => {
                const nextScope = event.target.value;
                setMobileMenuOpen(false);
                navigate(
                  nextScope
                    ? `/schemes?scope=${encodeURIComponent(nextScope)}`
                    : "/schemes"
                );
              }}
            >
              <option value="">Select scheme</option>
              <option value="state">State</option>
              <option value="central">Central</option>
              <option value="state-central">State-Central</option>
            </select>
          </label>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;