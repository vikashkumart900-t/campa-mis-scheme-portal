import { ArrowRight, BookOpenText, ExternalLink, FileQuestion, Landmark, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";
import { getHomeCopy } from "../i18n/homeTranslations.js";

function Contact() {
  const { language } = useLanguage();
  const t = translations[language] ?? translations.en;
  const copy = getHomeCopy(language);

  return (
    <div>
      <Header />
      <Navbar />

      <section className="page-banner">
        <span>{t.governmentOfIndia}</span>
        <h1>{t.contactUs}</h1>
        <p>{copy.heroDescription}</p>
      </section>

      <main className="content-page portal-info-page">
        <section>
          <h2>{t.ministry}</h2>
          <p>
            The Scheme MIS Portal supports transparent and accountable management of CAMPA
            funds for forest conservation, biodiversity and climate resilience across India.
          </p>
        </section>

        <div className="portal-contact-grid">
          <article className="portal-contact-card">
            <span className="portal-contact-icon"><Landmark aria-hidden="true" /></span>
            <div>
              <h2>National Authority CAMPA</h2>
              <p><MapPin aria-hidden="true" /> 3rd Floor, Supreme Court Metro Station Building, New Delhi – 110001, India.</p>
              <p><Mail aria-hidden="true" /> <a href="mailto:nationalcampa-moefcc@gov.in">nationalcampa-moefcc@gov.in</a></p>
              <p><Phone aria-hidden="true" /> Helpline: <a href="tel:1800220000">1800 22 0000</a></p>
              <a className="portal-contact-official-link" href="https://nationalcampa.nic.in/contactus.php" target="_blank" rel="noreferrer">
                National CAMPA — Contact Us <ExternalLink aria-hidden="true" />
              </a>
            </div>
          </article>

          <article className="portal-contact-card">
            <span className="portal-contact-icon"><Landmark aria-hidden="true" /></span>
            <div>
              <h2>Ministry of Environment, Forest and Climate Change (MoEFCC)</h2>
              <p><MapPin aria-hidden="true" /> Indira Paryavaran Bhawan, Jor Bagh Road, New Delhi – 110003, India.</p>
              <p><Phone aria-hidden="true" /> <a href="tel:01120819265">011-20819265</a></p>
              <p><Mail aria-hidden="true" /> IT Division: <a href="mailto:itdiv-moefcc@gov.in">itdiv-moefcc@gov.in</a></p>
              <a className="portal-contact-official-link" href="https://www.moef.gov.in/" target="_blank" rel="noreferrer">
                MoEFCC Official Website <ExternalLink aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>

        <section>
          <h2>{copy.transparencyLabel}</h2>
          <p>
            For scheme information, see the public scheme list. For guidance on using the portal,
            consult the user manual or frequently asked questions. Operational scheme matters
            should be raised through the authorised implementing agency or the relevant CAMPA
            authority.
          </p>
          <div className="portal-contact-links">
            <Link to="/schemes"><FileQuestion aria-hidden="true" /> {copy.viewAllSchemes} <ArrowRight aria-hidden="true" /></Link>
            <Link to="/user-manual"><BookOpenText aria-hidden="true" /> {t.userManual} <ArrowRight aria-hidden="true" /></Link>
            <Link to="/faq"><FileQuestion aria-hidden="true" /> {t.faqs} <ArrowRight aria-hidden="true" /></Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
