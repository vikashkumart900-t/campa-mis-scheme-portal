import { useState } from "react";
import { getProjectStorageKey, readProjects } from "./projectStorage";

function AasthaVanProjectInventory({
  schemeName,
  schemeCode,
  onLogout,
  onCreateInventory,
  onViewProject
}) {
  const [savedProjects] = useState(() => readProjects(getProjectStorageKey(schemeCode)));
  const projects = Object.values(savedProjects.projects)
    .sort((first, second) => String(second.updatedAt ?? "").localeCompare(String(first.updatedAt ?? "")));

  return (
    <main className="aastha-proposal-page">
      <header className="aastha-proposal-topbar">
        <div>
          <span>CAMPA • STATE IMPLEMENTING AGENCY</span>
          <h1>Aastha Van Sanrakshan Yojana</h1>
          <p>Project inventory{schemeName ? ` — ${schemeName}` : ""}</p>
        </div>
        <button type="button" onClick={onLogout}>Log out</button>
      </header>

      <section className="aastha-proposal-content aastha-project-inventory-content" aria-labelledby="project-inventory-title">
        <div className="aastha-proposal-section-heading">
          <div>
            <span>PROJECTS</span>
            <h2 id="project-inventory-title">Project Inventory</h2>
            <p>Choose a Project ID to continue with the next proposal section.</p>
          </div>
          {schemeCode && <small>Selected scheme code: {schemeCode}</small>}
        </div>

        {savedProjects.message && (
          <p className="aastha-proposal-submission-message" role="alert">{savedProjects.message}</p>
        )}

        {projects.length > 0 ? (
          <div className="aastha-proposal-project-list">
            {projects.map((project) => (
              <article className="aastha-proposal-project-card" key={project.projectId}>
                <div>
                  <span>PROJECT ID</span>
                  <strong>{project.projectId}</strong>
                  <p>{project.values.aasthaVanName || project.values.proposalTitle || "Aastha Van project"}</p>
                </div>
                <button
                  type="button"
                  className="aastha-proposal-primary"
                  onClick={() => onViewProject(project.projectId)}
                >
                  View
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="aastha-project-inventory-empty">No inventories have been created for this scheme yet.</p>
        )}

        <div className="aastha-proposal-navigation">
          <button type="button" className="aastha-proposal-primary" onClick={onCreateInventory}>
            Create New Inventory
          </button>
        </div>
      </section>
    </main>
  );
}

export default AasthaVanProjectInventory;
