import { useEffect, useState } from "react";

export default function Carousel({
  slides = [],
  language,
  translations
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const goPrev = () => {
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length
    );
  };

  return (
    <div className="hero-carousel">
      <div className="hero-slides">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`hero-slide ${
              index === activeIndex ? "active" : ""
            }`}
            style={{
              backgroundImage: `url(${slide.image})`
            }}
          />
        ))}
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">

        <span className="hero-kicker">
          {translations?.[language]?.nationalSchemeMis ||
            "NATIONAL SCHEME MIS"}
        </span>

        <h1>
          {translations?.[language]?.schemeManagement ||
            "Scheme Management"}
          <br />
          {translations?.[language]?.informationSystem ||
            "Information System"}
        </h1>

        <p>
  {activeSlide.description}
</p>
        <button className="hero-button">
          {translations?.[language]?.exploreSchemes ||
            "Explore Schemes"}

          <span className="hero-button-arrow">
            →
          </span>
        </button>

      </div>

      {/* Wildlife caption */}
      <div className="wildlife-caption">

        <span className="wildlife-line" />

        <div>
          <small>FEATURED</small>

          <strong>{activeSlide.title}</strong>
        </div>

      </div>

      {/* Slide counter */}
      <div className="hero-counter">
        <span>
          {String(activeIndex + 1).padStart(2, "0")}
        </span>

        <i />

        <span className="counter-total">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* Navigation */}
      <div className="hero-navigation">

        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous slide"
        >
          ←
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next slide"
        >
          →
        </button>

      </div>

      {/* Progress dots */}
      <div className="hero-dots">

        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            className={index === activeIndex ? "active" : ""}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${slide.title}`}
          >
            <span />
          </button>
        ))}

      </div>

    </div>
  );
}