import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";

function UserManual() {
  const { language } = useLanguage();

  return (
    <div>

      <Header />

      <Navbar />


      <section className="page-banner">

        <span>
          {translations[language].userSupport}
        </span>

        <h1>
          {translations[language].userManualTitle}
        </h1>

        <p>
          {translations[language].userManualDescription}
        </p>

      </section>


      <section className="content-page">

        <h2>
          {translations[language].userManualPortalTitle}
        </h2>

        <p>
          {translations[language].userManualPortalDescription}
        </p>


        <div className="manual-card">

          <div>
            📘
          </div>

          <div>

            <h3>
              {translations[language].userManualPortalTitle}
            </h3>

            <p>
              {translations[language].completeGuidelines}
            </p>

          </div>

          <button>
            {translations[language].downloadManual}
          </button>

        </div>

      </section>


      <Footer />

    </div>
  );
}

export default UserManual;