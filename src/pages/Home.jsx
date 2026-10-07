import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { translations } from "../i18n";
import Carousel from "../common/components/Carousel";

import tigersImage from "../assets/tigers.jpg";
import asthavanImage from "../assets/asthavan.jpg";
import rhinoImage from "../assets/rhino image.jpg";
import wildBufaaloImage from "../assets/wild_bufaalo.jpg";
import elephantImage from "../assets/elephant.jpg";

import { 
  FolderKanban, 
  Activity, 
  IndianRupee, 
  TrendingUp, 
  FileSpreadsheet, 
  LayoutDashboard,
  ArrowRight 
} from "lucide-react";

function Home() {
  const { language } = useLanguage();

  const notices = [
    "Welcome to Scheme Management Information System",
    "New schemes are now available",
    "Application submission is now open",
    "Please check the latest scheme guidelines"
  ];

  const t = (key, fallback) => translations[language]?.[key] || fallback;

  const schemes = [
    {
      title: t("schemeManagement", "Scheme Management"),
      description: t("schemeManagementDesc", "Management and monitoring of Government schemes."),
      icon: <FolderKanban size={26} />
    },
    {
      title: t("projectMonitoring", "Project Monitoring"),
      description: t("projectMonitoringDesc", "Monitor projects and activities under various schemes."),
      icon: <Activity size={26} />
    },
    {
      title: t("fundManagement", "Fund Management"),
      description: t("fundManagementDesc", "Track allocation, release and utilization of funds."),
      icon: <IndianRupee size={26} />
    },
    {
      title: t("progressMonitoring", "Progress Monitoring"),
      description: t("progressMonitoringDesc", "Monitor implementation and progress of schemes."),
      icon: <TrendingUp size={26} />
    },
    {
      title: t("reportsAnalytics", "Reports & Analytics"),
      description: t("reportsAnalyticsDesc", "Generate reports and analyse scheme performance."),
      icon: <FileSpreadsheet size={26} />
    },
    {
      title: t("dashboard", "Dashboard"),
      description: t("dashboardDesc", "View consolidated scheme information through dashboards."),
      icon: <LayoutDashboard size={26} />
    }
  ];

  return (
    <div>
      <Header />
      <Navbar />

      {/* Announcement */}
      <div className="announcement">
        <strong>{translations[language]?.notice || "Notice"}</strong>
        <div className="announcement-track">
          <div className="announcement-content">
            {[...notices, ...notices].map((notice, index) => (
              <div key={index}>
                <span>{notice} <i>•</i></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <Carousel
          slides={[
            {
              title: "Tiger Conservation",
              description: "Protecting India's rich wildlife and preserving natural habitats for future generations.",
              image: tigersImage
            },
            {
              title: "Aastha Van",
              description: "Promoting biodiversity conservation and creating a sustainable environment for wildlife.",
              image: asthavanImage
            },
            {
              title: "Rhino Conservation",
              description: "Strengthening wildlife protection and preserving endangered species for future generations.",
              image: rhinoImage
            },
            {
              title: "Wild Buffalo",
              description: "Protecting native wildlife and maintaining the ecological balance of natural habitats.",
              image: wildBufaaloImage
            },
            {
              title: "Elephant Conservation",
              description: "Supporting elephant conservation and protecting their natural habitats and ecosystems.",
              image: elephantImage
            }
          ]}
          language={language}
          translations={translations}
        />
      </section>

      {/* Schemes Section */}
      <section className="schemes-section">
        <div className="section-heading">
          <span>{t("ourProgrammes", "OUR PROGRAMMES")}</span>
          <h2>{t("schemesAndProgrammes", "Schemes & Programmes")}</h2>
          <p>
            {t(
              "schemesDescription",
              "Explore various schemes and programmes managed through the Scheme MIS Portal."
            )}
          </p>
        </div>

        <div className="scheme-grid">
          {schemes.map((scheme, index) => (
            <div className="scheme-card" key={index}>
              <div className="scheme-icon-wrapper">
                {scheme.icon}
              </div>

              <div className="scheme-content">
                <h3>{scheme.title}</h3>
                <p>{scheme.description}</p>
              </div>

              <button className="scheme-btn" type="button">
                <span>{t("viewDetails", "View Details")}</span>
                <ArrowRight className="btn-icon" size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About Summary */}
      <section className="about-summary">
        <div>
          <span>{translations[language]?.aboutThePortal}</span>
          <h2>{translations[language]?.onePlatform}</h2>
          <p>{translations[language]?.aboutPortalDescription}</p>
          <a href="/about">{translations[language]?.readMore} →</a>
        </div>
      </section>

      {/* Statistics */}
      <section className="statistics">
        <div>
          <strong>28+</strong>
          <span>{translations[language]?.states}</span>
        </div>
        <div>
          <strong>100+</strong>
          <span>{translations[language]?.projects}</span>
        </div>
        <div>
          <strong>50+</strong>
          <span>{translations[language]?.implementingAgencies}</span>
        </div>
        <div>
          <strong>10+</strong>
          <span>{translations[language]?.schemes}</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;