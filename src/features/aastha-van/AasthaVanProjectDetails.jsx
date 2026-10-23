const projectDetailFields = [
  ["proposalTitle", "Title of proposal"],
  ["aasthaVanName", "Aastha Van name"],
  ["stateOrUnionTerritory", "State / Union Territory"],
  ["implementingAgency", "Implementing Agency"],
  ["projectPeriodFrom", "Project period — from FY"],
  ["projectPeriodTo", "Project period — to FY"],
  ["aasthaVanStatus", "Site status"],
  ["interventionArea", "Proposed intervention area (ha)"],
  ["totalProjectCost", "Total project cost (₹ lakh)"],
  ["campaAssistance", "CAMPA assistance sought (₹ lakh)"],
  ["village", "Village"],
  ["gramPanchayat", "Gram Panchayat"],
  ["blockTehsil", "Block / Tehsil"],
  ["district", "District"],
  ["division", "Forest division"],
  ["coordinates", "Geo-spatial coordinates"]
];

function AasthaVanProjectDetails({ project, schemeCode, onContinue }) {
  const details = project
    ? projectDetailFields
      .map(([key, label]) => ({ label, value: project.values[key] }))
      .filter(({ value }) => value !== undefined && value !== null && String(value).trim() !== "")
    : [];

  return (
    <>
      <div className="aastha-proposal-section-heading">
        <div>
          <span>PROJECT DETAILS</span>
          <h2 id="aastha-proposal-section-title">Project Details</h2>
          <p>Review the inventory details before continuing to Section 2.</p>
        </div>
        {schemeCode && <small>Selected scheme code: {schemeCode}</small>}
      </div>

      {project ? (
        <>
          <div className="aastha-project-details-id">
            <span>PROJECT ID</span>
            <strong>{project.projectId}</strong>
          </div>
          {details.length > 0 ? (
            <dl className="aastha-project-details-list">
              {details.map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="aastha-project-inventory-empty">No project details have been added yet.</p>
          )}
        </>
      ) : (
        <p className="aastha-proposal-submission-message" role="alert">
          Create an inventory first to view its project details.
        </p>
      )}

      <div className="aastha-proposal-navigation">
        <button
          type="button"
          className="aastha-proposal-primary"
          disabled={!project}
          onClick={onContinue}
        >
          Continue to Section 2
        </button>
      </div>
    </>
  );
}

export default AasthaVanProjectDetails;
