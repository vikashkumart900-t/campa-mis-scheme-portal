function Bird({ top, delay, duration }) {
  return (
    <svg
      className="bird"
      viewBox="0 0 30 12"
      style={{ top, animationDelay: `${-delay}s`, animationDuration: `${duration}s` }}
    >
      <path className="wing" d="M0 8 Q7 0 15 8 Q23 0 30 8" stroke="#e3f4e5" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* flip = true agar PNG left ki taraf dekh rahi ho */
function Animal({ name, flip, duration, delay, reverse }) {
  return (
    <div
      className={`animal ${name}${reverse ? " rev" : ""}`}
      style={{ animationDuration: `${duration}s`, animationDelay: `${-delay}s` }}
    >
      <img src={`/jungle/${name}.png`} alt="" className={flip ? "flip" : ""} />
    </div>
  );
}

function JungleScene() {
  return (
    <div className="jungle" aria-hidden="true">
      <div className="jungle-bg" />
      <div className="mist m1" />
      <div className="mist m2" />

      <Bird top="12%" delay={0} duration={26} />
      <Bird top="22%" delay={9} duration={32} />
      <Bird top="8%" delay={17} duration={29} />

      {[8, 22, 37, 52, 66, 80, 92].map((x, i) => (
        <span
          key={i}
          className="firefly"
          style={{ left: `${x}%`, bottom: `${25 + (i % 3) * 14}%`, animationDelay: `${i * 0.7}s` }}
        />
      ))}

      {/* sirf neeche ki patti mein janwar */}
      <Animal name="elephant" duration={80} delay={20} />
      <Animal name="deer" duration={34} delay={6} />
      <Animal name="tiger" duration={40} delay={22} />
      <Animal name="lion" duration={48} delay={12} reverse flip />

      <div className="river" />
    </div>
  );
}

export default JungleScene;