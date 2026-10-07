import { useState } from "react";

const ministers = [
  {
    name: "Shri. Bhupender Yadav",
    photo: "/leaders/Bhupender.png",
    roles: [
      "Hon'ble Minister of Environment, Forest and Climate Change",
      "Chairperson, Governing Body of National Authority, CAMPA",
    ],
  },
  {
    name: "Shri Kirtivardhan Singh",
    photo: "/leaders/kirtivardhan.png",
    roles: [
      "Hon'ble Minister of State, Ministry of Environment, Forest and Climate Change",
    ],
  },
];

const officials = [
  {
    name: "Shri Tanmay Kumar",
    photo: "/leaders/tanmay_kumar.jpg",
    roles: ["Secretary, Ministry of Environment, Forest and Climate Change"],
  },
  {
    name: "Shri Sushil Kumar Awasthi",
    photo: "/leaders/sushilMoefCC.jpg",
    roles: [
      "Director General of Forest and Special Secretary, Ministry of Environment, Forest and Climate Change",
      "Chairperson, Executive Committee of National Authority, CAMPA",
    ],
  },
  {
    name: "Shri Anand Mohan",
    photo: "/leaders/anand-Mohan.jpeg",
    roles: [
      "Chief Executive Officer, National Authority CAMPA",
      "Member Secretary, Governing Body and Executive Committee of National Authority, CAMPA",
    ],
  },
];

function Silhouette() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
    </svg>
  );
}

function Photo({ person }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="leader-photo">
      {failed ? (
        <Silhouette />
      ) : (
        <img
          src={person.photo}
          alt={person.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function LeaderInfo({ person }) {
  return (
    <div className="leader-info">
      <h4>{person.name}</h4>
      {person.roles.map((r, i) => (
        <p key={i}>{r}</p>
      ))}
    </div>
  );
}

function Leadership() {
  return (
    <section className="leadership">
      <div className="leadership-head">
        <h2>Our Leadership</h2>
      </div>

      {/* Ministers */}
      <h3 className="leader-group-title">Hon'ble Ministers (MoEF&amp;CC)</h3>
      <div className="minister-grid">
        {ministers.map((p) => (
          <article key={p.name} className="minister-card">
            <Photo person={p} />
            <LeaderInfo person={p} />
          </article>
        ))}
      </div>

      {/* Officials */}
      <h3 className="leader-group-title">Senior Officials</h3>
      <div className="official-list">
        {officials.map((p) => (
          <article key={p.name} className="official-row">
            <Photo person={p} />
            <LeaderInfo person={p} />
          </article>
        ))}
      </div>
    </section>
  );
}

export default Leadership;