import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import forestImage from "../assets/asthavan.jpg";
import tigerImage from "../assets/tigers.jpg";
import rhinoImage from "../assets/rhino image.jpg";
import wildBuffaloImage from "../assets/wild_bufaalo.jpg";
import indiaMapImage from "../assets/india-states.svg";
import { ArrowRight, BarChart3, Bell, BookOpenText, FileText, Landmark, Leaf, Sprout, Target } from "lucide-react";

const heroSlides = [
  { image: tigerImage, alt: "Tiger in forest" },
  { image: rhinoImage, alt: "One-horned rhinoceros" },
  { image: wildBuffaloImage, alt: "Wild buffalo in its habitat" },
  { image: forestImage, alt: "Aasthavan forest" }
];

function Home() {
  const { language } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedProgramme, setExpandedProgramme] = useState(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  const stats = [
    { value: "36", label: "States & UTs", sublabel: "Across India", icon: <img className="landing-stat-card__map-icon" src={indiaMapImage} alt="" /> },
    { value: "25+", label: "Implementing Agencies", sublabel: "Registered and Active", icon: <Landmark size={28} /> },
    { value: "48+", label: "Active Schemes", sublabel: "Under Implementation", icon: <FileText size={28} /> },
    { value: "100%", label: "Transparency & Monitoring", sublabel: "Data driven insights", icon: <BarChart3 size={28} /> }
  ];

  const programmes = [
    {
      title: "Forest Restoration",
      description: "Rejuvenating degraded forests and improving ecosystem health.",
      details: "Restoration can include planting native species, supporting natural regeneration, and improving soil and water conditions to help forests recover.",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Wildlife Conservation",
      description: "Protecting India's rich biodiversity and wildlife habitats.",
      details: "Wildlife conservation can support habitat protection, restoration of wildlife corridors, and community awareness to help native species thrive.",
      image: tigerImage
    },
    {
      title: "Community Livelihoods",
      description: "Building sustainable livelihoods for forest-dependent communities.",
      details: "Community livelihood initiatives can support local skills, sustainable forest-based activities, and community participation in conservation.",
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
            <span className="landing-hero__eyebrow">CAMPA MIS SCHEME PORTAL</span>
            <h1>
              Healthy Forests.
              <br />
              <span>A Sustainable Tomorrow.</span>
            </h1>
            <p>
              Facilitating transparent, efficient and accountable management of CAMPA funds for forest
              conservation, biodiversity and climate resilience across India.
            </p>
            <div className="landing-hero__actions">
              <Link to="/login" className="landing-hero__primary">
                Explore Schemes <span aria-hidden="true">→</span>
              </Link>
              <Link to="/user-manual" className="landing-hero__secondary">
                <BookOpenText size={18} /> User Manual
              </Link>
            </div>
          </div>

          <div className="landing-hero__visual">
            <img
              key={activeSlide}
              src={heroSlides[activeSlide].image}
              alt={heroSlides[activeSlide].alt}
            />
          </div>

          <div className="landing-hero__pill">
            <Sprout size={22} aria-hidden="true" />
            <div className="landing-hero__pill-text">
              <span>Forests today</span>
              <strong>for a greener tomorrow</strong>
            </div>
          </div>

        </section>

        <section className="landing-stats" aria-label="Portal statistics">
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
                <h2>Schemes &amp; Programmes</h2>
                <p>Supporting forest conservation, biodiversity and sustainable livelihoods across India.</p>
              </div>
              <Link to="/login" className="landing-schemes-view-all">
                View All Schemes <ArrowRight size={12} />
              </Link>
            </div>

            <div className="landing-programmes__grid">
              {programmes.map(({ title, description, details, image }) => (
                <article key={title} className="landing-programme-card">
                  <div className="landing-programme-card__image" style={{ backgroundImage: `url(${image})` }} />
                  <div className="landing-programme-card__content">
                    <h3>{title}</h3>
                    <p>{description}</p>
                    <p
                      className="landing-programme-card__details"
                      id={`programme-details-${title.toLowerCase().replaceAll(" ", "-")}`}
                      hidden={expandedProgramme !== title}
                    >
                      {details}
                    </p>
                    <button
                      type="button"
                      className="landing-programme-card__link"
                      aria-expanded={expandedProgramme === title}
                      aria-controls={`programme-details-${title.toLowerCase().replaceAll(" ", "-")}`}
                      onClick={() => setExpandedProgramme((current) => current === title ? null : title)}
                    >
                      {expandedProgramme === title ? "Show Less" : "Learn More"} <ArrowRight size={16} />
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
                <h2>Latest Updates &amp; Announcements</h2>
              </div>
              <button type="button" className="landing-view-all">View All</button>
            </div>

            <ul className="landing-updates-list">
              {updates.length > 0 ? (
                updates.map(({ date, title, tag }) => (
                  <li key={title}>
                    <div className="landing-updates-list__meta">
                      <span>{date}</span>
                      {tag === "New" && <em>New</em>}
                    </div>
                    <strong>{title}</strong>
                  </li>
                ))
              ) : (
                <li className="landing-updates-empty">No recent announcements.</li>
              )}
            </ul>
          </div>

          <div className="landing-section landing-section--glance">
            <div className="landing-section__header">
              <div className="landing-section__icon"><Target size={18} /></div>
              <div>
                <h2>CAMPA at a Glance</h2>
              </div>
            </div>

            <div className="landing-glance-summary">
              <div className="landing-glance-map">
                <img
                  className="landing-glance-map__map"
                  src={indiaMapImage}
                  alt="Map of India with state and union territory boundaries"
                />
              </div>

              <div className="landing-glance-points">
                <div>
                  <span>Greener</span>
                  <strong>Forests</strong>
                  <small>Stronger India</small>
                </div>
              </div>
            </div>

            <blockquote>
              “Conserving forests is not just an environmental goal, it is a life goal.”
            </blockquote>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;