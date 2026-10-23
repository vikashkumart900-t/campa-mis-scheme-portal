import { BarChart3, Leaf, MapPinned, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";
import { getHomeCopy } from "../i18n/homeTranslations.js";

function ReportsAnalytics() {
  const { language } = useLanguage();
  const t = translations[language] ?? translations.en;
  const copy = getHomeCopy(language);

  const insights = [
    {
      icon: <MapPinned aria-hidden="true" />,
      title: t.states,
      description: copy.stateSublabel
    },
    {
      icon: <ShieldCheck aria-hidden="true" />,
      title: t.implementingAgencies,
      description: copy.agenciesSublabel
    },
    {
      icon: <Leaf aria-hidden="true" />,
      title: copy.activeSchemesLabel,
      description: copy.schemesSublabel
    },
    {
      icon: <BarChart3 aria-hidden="true" />,
      title: copy.transparencyLabel,
      description: copy.insightsSublabel
    }
  ];

  return (
    <div>
      <Header />
      <Navbar />

      <section className="page-banner">
        <span>{t.campaAtAGlance}</span>
        <h1>{t.reportsAnalytics}</h1>
        <p>{copy.heroDescription}</p>
      </section>

      <main className="content-page portal-info-page">
        <section>
          <h2>{copy.campaAtAGlance}</h2>
          <p>
            {copy.schemesDescription} This section explains the portal&apos;s public overview,
            including scheme activity, participating agencies and the focus on transparent,
            data-informed monitoring.
          </p>
          <p>
            Public scheme information is available through the scheme list. Detailed operational
            information and role-specific reports are intended for authorised portal users.
          </p>
        </section>

        <div className="portal-insight-grid">
          {insights.map(({ icon, title, description }) => (
            <article className="portal-insight-card" key={title}>
              <span className="portal-insight-icon">{icon}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>

        <section className="portal-info-callout">
          <h2>{copy.latestUpdates}</h2>
          <p>{copy.noAnnouncements}</p>
          <Link to="/schemes">{copy.viewAllSchemes} →</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default ReportsAnalytics;
