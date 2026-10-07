import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";

function About() {
  const { language } = useLanguage();

  return (
    <div>

      <Header />

      <Navbar />


      <section className="page-banner">

        <span>
          {translations[language].aboutThePortal}
        </span>

        <h1>
          {translations[language].aboutUs}
        </h1>

        <p>
          {translations[language].aboutPortalDescription}
        </p>

      </section>


      <section className="content-page">

        <h2>
          {translations[language].aboutPortalTitle}
        </h2>

        <p>
          {translations[language].aboutPortalIntro}
        </p>

        <p>
          {translations[language].aboutPortalDetails}
        </p>

        <p>
          {translations[language].aboutPortalPurpose}
        </p>

      </section>


      <Footer />

    </div>
  );
}

export default About;