import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";
import { getHomeCopy } from "../i18n/homeTranslations.js";
import forestImage from "../assets/asthavan.jpg";
import tigerImage from "../assets/tigers.jpg";
import rhinoImage from "../assets/rhino image.jpg";
import wildBuffaloImage from "../assets/wild_bufaalo.jpg";
import indiaMapImage from "../assets/india-states.svg";
import { ArrowRight, BarChart3, Bell, BookOpenText, FileText, Landmark, Leaf, Sprout, Target } from "lucide-react";

const heroSlides = [
  { image: tigerImage, altKey: "tigerAlt" },
  { image: rhinoImage, altKey: "rhinoAlt" },
  { image: wildBuffaloImage, altKey: "buffaloAlt" },
  { image: forestImage, altKey: "forestAlt" }
];

function Home() {
  const { language } = useLanguage();
  const t = translations[language] ?? translations.en;
  const copy = getHomeCopy(language);
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedProgramme, setExpandedProgramme] = useState(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const stats = [
    { value: "36", label: t.states, sublabel: copy.stateSublabel, icon: <img className="landing-stat-card__map-icon" src={indiaMapImage} alt="" /> },
    { value: "25+", label: t.implementingAgencies, sublabel: copy.agenciesSublabel, icon: <Landmark size={28} /> },
    { value: "48+", label: copy.activeSchemesLabel, sublabel: copy.schemesSublabel, icon: <FileText size={28} /> },
    { value: "100%", label: copy.transparencyLabel, sublabel: copy.insightsSublabel, icon: <BarChart3 size={28} /> }
  ];

  const programmes = [
    {
      id: "forest-restoration",
      title: copy.forestRestoration,
      description: copy.forestRestorationDescription,
      details: copy.forestRestorationDetails,
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "wildlife-conservation",
      title: copy.wildlifeConservation,
      description: copy.wildlifeConservationDescription,
      details: copy.wildlifeConservationDetails,
      image: tigerImage
    },
    {
      id: "community-livelihoods",
      title: copy.communityLivelihoods,
      description: copy.communityLivelihoodsDescription,
      details: copy.communityLivelihoodsDetails,
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80"
    }
  ];

  const updates = [];

  return (
    <div className="landing-page-shell">
      <Header />
      <Navbar />

      <main className="landing-page">
        <section
          className="landing-hero"
          style={{ "--hero-forest-image": `url(${forestImage})` }}
        >
          <div className="landing-hero__content">
            <span className="landing-hero__eyebrow">{copy.eyebrow}</span>
            <h1>
              {copy.heroTitle}
              <br />
              <span>{copy.heroSubtitle}</span>
            </h1>
            <p>
              {copy.heroDescription}
            </p>
            <div className="landing-hero__actions">
              <Link to="/schemes" className="landing-hero__primary">
                {copy.exploreSchemes} <span aria-hidden="true">→</span>
              </Link>
              <Link to="/user-manual" className="landing-hero__secondary">
                <BookOpenText size={18} /> {copy.userManual}
              </Link>
            </div>
          </div>

          <div className="landing-hero__visual">
            <img
              key={activeSlide}
              src={heroSlides[activeSlide].image}
              alt={copy[heroSlides[activeSlide].altKey]}
            />
          </div>

          <div className="landing-hero__pill">
            <Sprout size={22} aria-hidden="true" />
            <div className="landing-hero__pill-text">
              <span>{copy.forestsToday}</span>
              <strong>{copy.greenerTomorrow}</strong>
            </div>
          </div>

        </section>

        <section className="landing-stats" aria-label={copy.portalStatistics}>
          {stats.map(({ value, label, sublabel, icon }) => (
            <div key={label} className="landing-stat-card">
              <div className="landing-stat-card__icon">{icon}</div>
              <div className="landing-stat-card__value">{value}</div>
              <div className="landing-stat-card__label">{label}</div>
              <div className="landing-stat-card__sublabel">{sublabel}</div>
            </div>
          ))}
        </section>

        <section className="landing-lower-grid">
          <div className="landing-section landing-section--programmes">
            <div className="landing-section__header">
              <div className="landing-section__icon"><Leaf size={18} /></div>
              <div>
                <h2>{t.schemesAndProgrammes}</h2>
                <p>{copy.schemesDescription}</p>
              </div>
              <Link to="/schemes" className="landing-schemes-view-all">
                {copy.viewAllSchemes} <ArrowRight size={12} />
              </Link>
            </div>

            <div className="landing-programmes__grid">
              {programmes.map(({ id, title, description, details, image }) => (
                <article key={id} className="landing-programme-card">
                  <div className="landing-programme-card__image" style={{ backgroundImage: `url(${image})` }} />
                  <div className="landing-programme-card__content">
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <p
                      className="landing-programme-card__details"
                      id={`programme-details-${id}`}
                      hidden={expandedProgramme !== id}
                    >
                      {details}
                    </p>
                    <button
                      type="button"
                      className="landing-programme-card__link"
                      aria-expanded={expandedProgramme === id}
                      aria-controls={`programme-details-${id}`}
                      onClick={() => setExpandedProgramme((current) => current === id ? null : id)}
                    >
                      {expandedProgramme === id ? copy.showLess : copy.learnMore} <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="landing-section landing-section--updates">
            <div className="landing-section__header">
              <div className="landing-section__icon"><Bell size={18} /></div>
              <div>
                <h2>{copy.latestUpdates}</h2>
              </div>
              <Link to="/reports" className="landing-view-all">{copy.viewAll}</Link>
            </div>

            <ul className="landing-updates-list">
              {updates.length > 0 ? (
                updates.map(({ date, title, tag }) => (
                  <li key={title}>
                    <div className="landing-updates-list__meta">
                      <span>{date}</span>
                      {tag === "New" && <em>{copy.new}</em>}
                    </div>
                    <strong>{title}</strong>
                  </li>
                ))
              ) : (
                <li className="landing-updates-empty">{copy.noAnnouncements}</li>
              )}
            </ul>
          </div>

          <div className="landing-section landing-section--glance">
            <div className="landing-section__header">
              <div className="landing-section__icon"><Target size={18} /></div>
              <div>
                <h2>{copy.campaAtAGlance}</h2>
              </div>
            </div>

            <div className="landing-glance-summary">
              <div className="landing-glance-map">
                <img
                  className="landing-glance-map__map"
                  src={indiaMapImage}
                  alt={copy.mapAlt}
                />
              </div>

              <div className="landing-glance-points">
                <div>
                  <span>{copy.greener}</span>
                  <strong>{copy.forests}</strong>
                  <small>{copy.strongerIndia}</small>
                </div>
              </div>
            </div>

            <blockquote>
              “{copy.quote}”
            </blockquote>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;