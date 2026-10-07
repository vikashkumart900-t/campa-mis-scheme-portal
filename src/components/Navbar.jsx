import { Link } from "react-router-dom";
import { translations } from "../i18n";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function Navbar() {
  const { language } = useLanguage();

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


        <Link
          to="/signin"
          className="login-button"
        >
          {translations[language].loginRegister}
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;