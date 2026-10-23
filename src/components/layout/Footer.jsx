import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { translations } from "../../i18n";
import emblem from "../../assets/emblem.png";


function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <img src={emblem} alt="" />
          <div>
            <strong>{t.governmentOfIndia}</strong>
            <span>{t.ministry}</span>
          </div>
        </div>

        <nav className="footer-links" aria-label={t.quickLinks}>
          <Link to="/login">{t.home}</Link>
          <Link to="/about">{t.aboutUs}</Link>
          <Link to="/login">{t.schemes}</Link>
          <Link to="/reports">{t.reports}</Link>
          <Link to="/faq">{t.faqs}</Link>
          <Link to="/user-manual">{t.userManual}</Link>
          <Link to="/contact">{t.contactUs}</Link>
        </nav>

        <div className="footer-social" aria-label="Social media">
          <span aria-hidden="true">f</span>
          <span aria-hidden="true">X</span>
          <span aria-hidden="true">▶</span>
          <span aria-hidden="true">in</span>
        </div>

        <p className="copyright">{t.copyright}</p>
      </div>
    </footer>
  );
}

export default Footer;