import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";


function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="footer">
      <video
        className="footer-video"
        src="/jungle/jungle.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="footer-overlay" />

      <div className="footer-container">
        <div className="footer-column">
          <h3>{t.aboutPortalTitle}</h3>
          <p>{t.aboutPortalDescription}</p>
        </div>

        <div className="footer-column">
          <h3>{t.quickLinks}</h3>
          <Link to="/login">{t.home}</Link>
          <Link to="/about">{t.aboutUs}</Link>
          <Link to="/faq">{t.faqs}</Link>
          <Link to="/user-manual">{t.userManual}</Link>
        </div>

        <div className="footer-column">
          <h3>{t.contactUs}</h3>
          <p>🏛️ {t.ministry}</p>
          <p>🇮🇳 {t.governmentOfIndia}</p>
          <p>✉️ {t.email}: support@example.gov.in</p>
        </div>
      </div>

      <div className="copyright">{t.copyright}</div>
    </footer>
  );
}

export default Footer;