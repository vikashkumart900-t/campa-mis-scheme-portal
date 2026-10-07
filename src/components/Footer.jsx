import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";

function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="footer">

      <div className="footer-container">


        {/* About */}

        <div className="footer-column">

          <h3>
            {translations[language].aboutPortalTitle}
          </h3>

          <p>
            {translations[language].aboutPortalDescription}
          </p>

        </div>


        {/* Quick Links */}

        <div className="footer-column">

          <h3>
            {translations[language].quickLinks}
          </h3>

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


        {/* Contact */}

        <div className="footer-column">

          <h3>
            {translations[language].contactUs}
          </h3>

          <p>
            {translations[language].ministry}
          </p>

          <p>
            {translations[language].governmentOfIndia}
          </p>

          <p>
            {translations[language].email}: support@example.gov.in
          </p>

        </div>

      </div>


      <div className="copyright">

        {translations[language].copyright}

      </div>

    </footer>
  );
}

export default Footer;