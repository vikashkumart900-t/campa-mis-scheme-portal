import { Fragment, useEffect, useState } from "react";
import { getProjectStorageKey, readProjects } from "./projectStorage";
import AasthaVanProjectDetails from "./AasthaVanProjectDetails";

const proposalSections = [
  {
    title: "Inventory Details",
    description: "Start with the State/UT, implementing agency and site information.",
    groups: [
      {
        title: "Project details",
        fields: [
          { name: "stateOrUnionTerritory", label: "State / Union Territory", required: true },
          { name: "implementingAgency", label: "Implementing Agency", required: true },
          { name: "proposalTitle", label: "Title of proposal", required: true, wide: true },
          { name: "projectPeriodFrom", label: "Project period — from FY", placeholder: "2026-27" },
          { name: "projectPeriodTo", label: "Project period — to FY", placeholder: "2030-31" },
          { name: "aasthaVanName", label: "Name and status of the Aastha Van", placeholder: "Enter the site name" },
          { name: "aasthaVanStatus", label: "Site status", type: "select", options: ["Existing", "Proposed"] },
          { name: "interventionArea", label: "Proposed intervention area (ha)", type: "number", min: "0", step: "0.01" },
          { name: "totalProjectCost", label: "Total project cost (₹ lakh)", type: "number", min: "0", step: "0.01" },
          { name: "campaAssistance", label: "National CAMPA assistance sought (₹ lakh)", type: "number", min: "0", step: "0.01" },
          { name: "submissionDate", label: "Date of submission", type: "date" },
          { name: "uniqueId", label: "Unique ID of the Aastha Van" },
          { name: "projectId", label: "Project ID (generated on submit)", readOnly: true }
        ]
      },
      {
        title: "Location and land records",
        fields: [
          { name: "village", label: "Village" },
          { name: "gramPanchayat", label: "Gram Panchayat" },
          { name: "blockTehsil", label: "Block / Tehsil" },
          { name: "district", label: "District" },
          { name: "compartment", label: "Forest compartment" },
          { name: "beat", label: "Beat" },
          { name: "range", label: "Range" },
          { name: "division", label: "Forest division" },
          { name: "coordinates", label: "Geo-spatial coordinates", placeholder: "Latitude, longitude" },
          { name: "kmlFiles", label: "KML / shape files", type: "file", accept: ".kml,.kmz,.shp,.zip", wide: true },
          { name: "khasraNumber", label: "Khasra number" },
          { name: "surveyNumber", label: "Survey number" },
          { name: "compartmentNumber", label: "Compartment number" },
          { name: "religiousPlace", label: "Religious place nearby / within site", placeholder: "Enter religious place details" },
          { name: "pastDispute", label: "Any past dispute?", type: "select", options: ["No", "Yes"] },
          {
            name: "pastDisputeDetails",
            label: "Dispute details",
            type: "textarea",
            wide: true,
            dependsOn: "pastDispute",
            dependsOnValue: "Yes"
          }
        ]
      },
      {
        title: "Land ownership",
        fields: [
          { name: "communityLand", label: "Community land", type: "checkbox" },
          { name: "revenueLand", label: "Revenue land", type: "checkbox" },
          { name: "forestLand", label: "Forest land", type: "checkbox" }
        ]
      },
      {
        title: "Nodal officer",
        fields: [
          { name: "nodalOfficerName", label: "Name", required: true },
          { name: "nodalOfficerDesignation", label: "Designation" },
          { name: "nodalOfficerMobile", label: "Mobile", type: "tel" },
          { name: "nodalOfficerEmail", label: "Official email", type: "email" }
        ]
      }
    ]
  },
  {
    title: "Summary and site eligibility",
    description: "Explain the need for the proposal and why this site qualifies.",
    groups: [
      {
        title: "Executive summary",
        description: "Cover the need, proposed site, ownership, cultural significance, activities, costs, and expected ecological, cultural and community outcomes (up to 300 words).",
        fields: [{ name: "executiveSummary", label: "Executive summary", type: "textarea", required: true, wide: true }]
      },
      {
        title: "Proposal background and justification",
        fields: [
          { name: "contextSignificance", label: "Context and significance — current conservation status, ecological condition, connected communities and reasons intervention is needed (up to 300 words)", type: "textarea", wide: true },
          { name: "objectives", label: "Objectives", type: "textarea", wide: true }
        ]
      },
      {
        title: "Site eligibility",
        fields: [
          { name: "traditionalRecognition", label: "Traditional recognition — how the grove is recognised locally; supporting resolution / record", type: "textarea", wide: true },
          { name: "landStatus", label: "Land status — encumbrances, disputes, claims and verification", type: "textarea", wide: true },
          { name: "degradation", label: "Degradation observed", type: "textarea", placeholder: "Forest fire, grazing, felling, encroachment, waste disposal, invasive species, canopy decline, regeneration, soil/moisture loss or degraded water bodies", wide: true },
          { name: "priorityBasis", label: "Priority basis — ecological sensitivity, community association, degradation, restoration potential and local support", type: "textarea", wide: true },
          { name: "communityWillingness", label: "Community willingness — consultation date and resolution / consent reference", type: "textarea", wide: true },
          { name: "schemeEligibility", label: "Scheme eligibility — details demonstrating compliance with scheme guidelines", type: "textarea", wide: true }
        ]
      }
    ]
  },
  {
    title: "Site details and baseline",
    description: "Record site boundaries, legal status and the evidence used for baseline conditions.",
    groups: [
      {
        title: "Land, boundary and mapping",
        description: "Include block / compartment / khasra details, land records, disputes or claims, boundary demarcation, survey method and date, and attached KML/KMZ or geo-referenced maps.",
        fields: [{ name: "boundaryMappingDetails", label: "Land, boundary and mapping details", type: "textarea", wide: true }]
      }
    ],
    tables: [
      {
        title: "Site summary",
        firstColumn: "Site",
        columns: [
          { key: "location", label: "Name and location (district, forest division, Gram Panchayat / village)" },
          { key: "recordedArea", label: "Recorded area (ha)", type: "number" },
          { key: "proposedArea", label: "Proposed area (ha)", type: "number" },
          { key: "landOwner", label: "Land owned by" },
          { key: "mapReference", label: "Map / KML reference" }
        ],
        rows: ["Site 1", "Site 2", "Site 3"]
      },
      {
        title: "Baseline condition",
        firstColumn: "Baseline indicator",
        columns: [
          { key: "details", label: "Details and evidence (attach photos where required)" },
          { key: "target", label: "Targets to achieve" }
        ],
        rows: [
          "Native flora and culturally important species",
          "Native fauna",
          "Invasive alien species",
          "Soil parameters",
          "Disturbances",
          "Cultural significance and customary protection",
          "Community and livelihood context"
        ]
      }
    ]
  },
  {
    title: "Interventions and work plan",
    description: "Set out year-wise restoration activities, targets, milestones and planting material.",
    groups: [
      {
        title: "Technical restoration and management plan",
        description: "Describe the technical basis and how the work will be carried out on site (up to 1,000 words).",
        fields: [
          { name: "technicalPlan", label: "Technical aspects and implementation method", type: "textarea", wide: true },
          { name: "speciesAndPlantingMaterial", label: "Native and culturally important species; source and quality assurance of planting material", type: "textarea", wide: true }
        ]
      }
    ],
    tables: [
      {
        title: "Year-wise activity plan",
        firstColumn: "Component / year",
        columns: [
          { key: "activity", label: "Proposed activity and technical basis" },
          { key: "location", label: "Location / area within site" },
          { key: "target", label: "Physical target" }
        ],
        rows: [
          "Survey, mapping and demarcation",
          "Ecological restoration: ANR / AR",
          "Soil, moisture, catchment or water-body treatment",
          "Invasive species and fire management",
          "Protection, signage and essential amenities",
          "Livelihood and community enterprise",
          "Training and awareness",
          "Monitoring and documentation"
        ].flatMap((component) => ["Y1", "Y2", "Y3", "Y4", "Y5"].map((year) => `${component} — ${year}`))
      },
      {
        title: "Year-wise milestones",
        firstColumn: "Year",
        columns: [
          { key: "activities", label: "Main activities" },
          { key: "milestone", label: "Physical milestone" },
          { key: "result", label: "Expected result" }
        ],
        rows: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]
      }
    ]
  },
  {
    title: "Community and institutional arrangements",
    description: "Describe participation, local institutions, responsibilities and livelihood benefits.",
    groups: [
      {
        title: "Community participation",
        description: "Include traditional custodians, Gram Panchayats, women, youth and local communities, and explain their role in decisions, implementation and maintenance (up to 200 words).",
        fields: [{ name: "communityParticipation", label: "Community participation plan", type: "textarea", wide: true }]
      },
      {
        title: "Livelihood and benefit-sharing",
        description: "Describe proposed enterprises, target groups, market basis, training support, benefit-sharing and safeguards against over-extraction (up to 300 words).",
        fields: [{ name: "livelihoodBenefitSharing", label: "Livelihood and benefit-sharing plan", type: "textarea", wide: true }]
      }
    ],
    tables: [
      {
        title: "Aastha Van Sanrakshan Committees (AVSC)",
        firstColumn: "Particular",
        columns: [{ key: "details", label: "Details" }],
        rows: ["District-level AVSC — constitution order, date, endorsement and Member Secretary", "Panchayat Samiti-level AVSC — constitution order, endorsement and Member Secretary", "Meeting and review arrangement"]
      },
      {
        title: "Roles and responsibilities",
        firstColumn: "Institution / group",
        columns: [{ key: "responsibility", label: "Principal responsibility in the proposal" }],
        rows: [
          "State / UT Forest Department / Implementing Agency",
          "District-level AVSC",
          "Panchayat Samiti-level AVSC",
          "DFO / DCF, Range Officer and field staff",
          "Project Associate (if engaged)",
          "Gram Panchayat, custodians, women and youth groups",
          "Any other partner"
        ]
      }
    ]
  },
  {
    title: "Monitoring, safeguards and sustainability",
    description: "Define measurable indicators, safeguards, risks and post-project arrangements.",
    groups: [
      {
        title: "Legal, social and environmental safeguards",
        description: "Record compliance with applicable laws, land and community rights, non-commercial conservation use, consent for cultural knowledge, permissions / NOCs, and a time-bound grievance process.",
        fields: [
          { name: "wildlifeForestRightsCompliance", label: "Applicable wildlife, forest conservation, forest rights and other laws examined", type: "checkbox" },
          { name: "landRightsVerified", label: "Land ownership, community rights, customary access and disputes recorded", type: "checkbox" },
          { name: "conservationOnly", label: "No commercial exploitation, unauthorised felling or non-conservation use proposed", type: "checkbox" },
          { name: "communityConsent", label: "Community knowledge or culturally sensitive information recorded / disclosed only with consent", type: "checkbox" },
          { name: "permissionsAttached", label: "Required permissions / NOCs attached or scheduled", type: "checkbox" },
          { name: "grievanceProcess", label: "Grievance contact point and resolution timeline", type: "text", wide: true }
        ]
      },
      {
        title: "Sustainability after five years",
        description: "Explain future planning (up to 200 words).",
        fields: [{ name: "sustainability", label: "Sustainability plan", type: "textarea", wide: true }]
      }
    ],
    tables: [
      {
        title: "Monitoring framework",
        firstColumn: "Indicator",
        columns: [
          { key: "baseline", label: "Baseline" },
          { key: "target", label: "Annual / Year 5 target" },
          { key: "evidence", label: "Method / evidence" },
          { key: "responsibility", label: "Designated responsibility" }
        ],
        rows: [
          "Boundary and area verified",
          "Native vegetation",
          "Natural regeneration or survival",
          "Fauna",
          "Invasive species",
          "Soil, moisture or water condition",
          "Community participation and training",
          "Livelihood / community outcome",
          "Physical and financial progress"
        ]
      },
      {
        title: "Key risks and mitigation",
        firstColumn: "Key risk",
        columns: [
          { key: "mitigation", label: "Mitigation / contingency" },
          { key: "authority", label: "Responsible authority" }
        ],
        rows: [
          "Land / boundary or rights dispute",
          "Fire, grazing, encroachment or illegal activity",
          "Low regeneration / survival or invasive recurrence",
          "Community participation",
          "Delay in funds, procurement or implementation",
          "Other site-specific risk"
        ]
      }
    ]
  },
  {
    title: "Financial proposal",
    description: "Provide the cost summary, annual component-wise budget and estimate basis.",
    groups: [
      {
        title: "Cost summary",
        fields: [
          { name: "financialTotalCost", label: "Total project cost (₹ lakh)", type: "number", min: "0", step: "0.01" },
          { name: "financialCampaAssistance", label: "National CAMPA assistance sought (₹ lakh)", type: "number", min: "0", step: "0.01" },
          { name: "otherFinancialAssistance", label: "Other financial assistance (₹ lakh)", type: "number", min: "0", step: "0.01" },
          { name: "costPerHectare", label: "Cost per hectare (₹ lakh / ha)", type: "number", min: "0", step: "0.01" }
        ]
      },
      {
        title: "Basis of cost",
        description: "Include schedule of rates / estimate references, maintenance and monitoring, convergence / partner contribution, and balance cost commitments.",
        fields: [{ name: "basisOfCost", label: "Basis of cost and commitments", type: "textarea", wide: true }]
      }
    ],
    tables: [
      {
        title: "Year-wise and component-wise budget (₹ lakh)",
        firstColumn: "Component",
        columns: [
          { key: "y1", label: "Y1", type: "number" },
          { key: "y2", label: "Y2", type: "number" },
          { key: "y3", label: "Y3", type: "number" },
          { key: "y4", label: "Y4", type: "number" },
          { key: "y5", label: "Y5", type: "number" },
          { key: "total", label: "Total", type: "number" }
        ],
        rows: [
          "Survey, mapping, demarcation and documentation",
          "AVSC, mobilisation, awareness and administration",
          "Essential public utilities and signage",
          "Ecological restoration, SMC and fire prevention",
          "Livelihood and community enterprise",
          "Capacity building and training",
          "Monitoring, evaluation and documentation",
          "Total"
        ]
      }
    ]
  },
  {
    title: "Expected outcomes and approvals",
    description: "Record expected results, committee decisions, recommendations and authorised signatories.",
    groups: [
      {
        title: "Expected outcomes",
        description: "Describe expected outcomes (up to 200 words).",
        fields: [{ name: "expectedOutcomes", label: "Expected outcomes", type: "textarea", wide: true }]
      },
      {
        title: "State-level scrutiny and recommendation",
        fields: [
          { name: "stateCommitteeReference", label: "Committee / body and meeting reference" },
          { name: "stateDecision", label: "Decision", type: "select", options: ["", "Recommended", "Recommended with conditions", "Returned for revision"] },
          { name: "recommendedCost", label: "Recommended cost (₹ lakh)", type: "number", min: "0", step: "0.01" },
          { name: "stateConditions", label: "Conditions / compliances", type: "textarea", wide: true },
          { name: "stateSignatory", label: "Authorised signatory — name, designation and date", wide: true }
        ]
      }
    ],
    tables: [
      {
        title: "District-level AVSC endorsement",
        firstColumn: "Particular",
        columns: [{ key: "details", label: "Details" }],
        rows: ["Meeting date and agenda item", "Name of the site endorsed", "Conditions, if any", "Chairperson — name, signature and date", "Member Secretary — name, signature and date"]
      }
    ]
  },
  {
    title: "Declaration and annexures",
    description: "Confirm the implementing agency declaration and attach the supporting annexures.",
    groups: [
      {
        title: "Implementing Agency declaration",
        description: "I certify that the proposal and annexures are true and complete; the encumbrance-free site has been verified; proposed activities are for conservation, restoration and community stewardship; no expenditure is duplicated; and records, progress, utilisation, monitoring, audit, scheme guidelines and applicable laws will be complied with.",
        fields: [
          { name: "declarationAccepted", label: "I agree to the Implementing Agency declaration above", type: "checkbox", required: true },
          { name: "authorisedSignatory", label: "Name of authorised signatory", required: true },
          { name: "signatoryDesignation", label: "Designation and Implementing Agency" },
          { name: "placeAndDate", label: "Place and date" },
          { name: "signatureFile", label: "Signature and official seal", type: "file", accept: ".pdf,.jpg,.jpeg,.png" }
        ]
      },
      {
        title: "Required annexures",
        description: "Select the files available for this proposal. Selected file names are saved with the draft; reselect files after reopening the form.",
        fields: [
          { name: "annexureForwarding", label: "A-1. Forwarding letter and State-level recommendation / minutes", type: "file", accept: ".pdf,.jpg,.jpeg,.png" },
          { name: "annexureAvsc", label: "A-2. District and Panchayat Samiti AVSC constitution orders and endorsement records", type: "file", accept: ".pdf,.jpg,.jpeg,.png" },
          { name: "annexureCommunity", label: "A-3. Community resolution / consent and consultation record", type: "file", accept: ".pdf,.jpg,.jpeg,.png" },
          { name: "annexureLandRecords", label: "A-4. Certified land / forest / revenue records and dispute-status certificate", type: "file", accept: ".pdf,.jpg,.jpeg,.png" },
          { name: "annexureMaps", label: "A-5. Site map, coordinates, KML / KMZ / shapefile and area", type: "file", accept: ".pdf,.kml,.kmz,.zip,.jpg,.jpeg,.png" },
          { name: "annexureBaseline", label: "A-6. Geo-tagged baseline photos and ecological / degradation assessment", type: "file", accept: ".pdf,.jpg,.jpeg,.png,.zip" },
          { name: "annexureRestoration", label: "A-7. Restoration plan, species list, technical estimates and rate basis", type: "file", accept: ".pdf,.xlsx,.xls,.doc,.docx" },
          { name: "annexureBudget", label: "A-8. Year-wise physical targets and detailed budget", type: "file", accept: ".pdf,.xlsx,.xls,.doc,.docx" },
          { name: "annexureSafeguards", label: "A-9. Livelihood, training, monitoring, safeguards and sustainability details", type: "file", accept: ".pdf,.xlsx,.xls,.doc,.docx" }
        ]
      }
    ]
  }
];

function readDraft(storageKey) {
  try {
    const savedDraft = localStorage.getItem(storageKey);
    if (!savedDraft) {
      return { values: {}, message: "" };
    }

    const parsedDraft = JSON.parse(savedDraft);
    if (!parsedDraft || typeof parsedDraft !== "object" || Array.isArray(parsedDraft)) {
      throw new Error("Saved proposal draft has an invalid format.");
    }
    return { values: parsedDraft, message: "A saved draft was restored from this device." };
  } catch (error) {
    return {
      values: {},
      message: `Unable to read the saved draft: ${error.message}`
    };
  }
}

function ProposalField({ field, value, onChange }) {
  const inputId = `proposal-${field.name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const commonProps = {
    id: inputId,
    name: field.name,
    required: Boolean(field.required),
    onChange: (event) => onChange(field, event)
  };

  if (field.type === "checkbox") {
    return (
      <label className="aastha-proposal-checkbox" htmlFor={inputId}>
        <input {...commonProps} type="checkbox" checked={Boolean(value)} />
        <span>{field.label}{field.required && " *"}</span>
      </label>
    );
  }

  let control;
  if (field.type === "textarea") {
    control = <textarea {...commonProps} rows={5} value={value ?? ""} placeholder={field.placeholder || ""} />;
  } else if (field.type === "select") {
    control = (
      <select {...commonProps} value={value ?? ""}>
        <option value="">Select an option</option>
        {field.options.filter(Boolean).map((option) => <option key={option}>{option}</option>)}
      </select>
    );
  } else if (field.type === "file") {
    const selectedFiles = Array.isArray(value) ? value : [];
    control = (
      <>
        <input {...commonProps} type="file" accept={field.accept} />
        {selectedFiles.length > 0 && <small>Selected: {selectedFiles.join(", ")}</small>}
      </>
    );
  } else {
    control = (
      <input
        {...commonProps}
        type={field.type || "text"}
        value={value ?? ""}
        placeholder={field.placeholder || ""}
        min={field.min}
        step={field.step}
        readOnly={field.readOnly}
      />
    );
  }

  return (
    <label className={`aastha-proposal-field${field.wide ? " aastha-proposal-field--wide" : ""}`} htmlFor={inputId}>
      <span>{field.label}{field.required && <b> *</b>}</span>
      {control}
    </label>
  );
}

function ProposalTable({ table, values, onChange, sectionIndex }) {
  const isYearWiseBudget = table.title === "Year-wise and component-wise budget (₹ lakh)";
  const totalRowIndex = table.rows.length - 1;
  const yearColumns = table.columns.filter((column) => /^y[1-5]$/.test(column.key));

  const getBudgetCellValue = (rowIndex, columnKey) => {
    const sumColumn = (index, key) => {
      const value = Number(values[`section-${sectionIndex}.${table.title}.${index}.${key}`]);
      return Number.isFinite(value) ? value : 0;
    };

    if (rowIndex === totalRowIndex && /^y[1-5]$/.test(columnKey)) {
      return table.rows.slice(0, totalRowIndex)
        .reduce((sum, _, index) => sum + sumColumn(index, columnKey), 0);
    }

    if (columnKey === "total") {
      if (rowIndex === totalRowIndex) {
        return yearColumns.reduce(
          (yearSum, column) => yearSum + table.rows
            .slice(0, totalRowIndex)
            .reduce((rowSum, _, index) => rowSum + sumColumn(index, column.key), 0),
          0
        );
      }
      return yearColumns.reduce((sum, column) => sum + sumColumn(rowIndex, column.key), 0);
    }

    return undefined;
  };

  return (
    <section className="aastha-proposal-table-section">
      <h3>{table.title}</h3>
      <div className="aastha-proposal-table-scroll">
        <table className="aastha-proposal-table">
          <thead>
            <tr>
              <th scope="col">{table.firstColumn}</th>
              {table.columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={row}>
                <th scope="row">{row}</th>
                {table.columns.map((column) => {
                  const name = `section-${sectionIndex}.${table.title}.${rowIndex}.${column.key}`;
                  const calculatedValue = isYearWiseBudget ? getBudgetCellValue(rowIndex, column.key) : undefined;
                  const isCalculated = calculatedValue !== undefined;
                  const cellValue = isCalculated ? calculatedValue : (values[name] ?? "");
                  const ariaLabel = `${row}: ${column.label}`;
                  return (
                    <td key={column.key}>
                      {column.type === "textarea" ? (
                        <textarea
                          aria-label={ariaLabel}
                          rows={2}
                          value={cellValue}
                          onChange={(event) => onChange(name, event.target.value)}
                        />
                      ) : (
                        <input
                          aria-label={ariaLabel}
                          type={column.type || "text"}
                          min={column.type === "number" ? "0" : undefined}
                          step={column.type === "number" ? "0.01" : undefined}
                          value={cellValue}
                          readOnly={isCalculated}
                          className={isCalculated ? "aastha-proposal-calculated" : undefined}
                          onChange={(event) => onChange(name, event.target.value)}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AasthaVanProposalForm({
  schemeName,
  schemeCode,
  initialProjectId = "",
  startFresh = false,
  initialShowProjectDetails = false,
  onLogout,
  onShowInventory,
  onOpenProjectDetails,
  onContinueProject
}) {
  const storageKey = `aasthaVanProposalDraft:${schemeCode || "state-proposal"}`;
  const projectStorageKey = getProjectStorageKey(schemeCode);
  const [initialDraft] = useState(() => readDraft(storageKey));
  const [initialProjects] = useState(() => readProjects(projectStorageKey));
  const initialProject = initialProjects.projects[initialProjectId];
  const [values, setValues] = useState(() => {
    if (startFresh && !initialProject) return {};

    return {
      ...(initialProject?.values || initialDraft.values),
      proposalTitle: initialProject?.values.proposalTitle || initialDraft.values.proposalTitle || schemeName || "Aastha Van Sanrakshan Yojana",
      aasthaVanName: initialProject?.values.aasthaVanName || initialDraft.values.aasthaVanName || schemeName || ""
    };
  });
  const [projects, setProjects] = useState(initialProjects.projects);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProject ? initialProjectId : "");
  const [activeSection, setActiveSection] = useState(initialProject ? 1 : 0);
  const [showProjectDetails, setShowProjectDetails] = useState(
    Boolean(initialShowProjectDetails && initialProject)
  );
  const [sectionOneSubmitted, setSectionOneSubmitted] = useState(Boolean(initialProject));
  const [, setDraftMessage] = useState(initialDraft.message);
  const [submissionMessage, setSubmissionMessage] = useState(initialProjects.message);
  const section = proposalSections[activeSection];

  useEffect(() => {
    if (initialProjectId && !initialProject) {
      onShowInventory();
    }
  }, [initialProject, initialProjectId, onShowInventory]);

  const persistProject = (projectId, projectValues) => {
    const nextProjects = {
      ...projects,
      [projectId]: {
        projectId,
        values: projectValues,
        updatedAt: new Date().toISOString()
      }
    };

    try {
      localStorage.setItem(projectStorageKey, JSON.stringify(nextProjects));
      setProjects(nextProjects);
      return true;
    } catch (error) {
      setSubmissionMessage(`Unable to save project ${projectId} on this device: ${error.message}`);
      return false;
    }
  };

  const persistDraft = (nextValues) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextValues));
      setDraftMessage("Draft autosaved on this device.");
    } catch (error) {
      setDraftMessage(`Unable to save the draft on this device: ${error.message}`);
    }
  };

  const updateField = (field, event) => {
    const nextValue = field.type === "checkbox"
      ? event.target.checked
      : field.type === "file"
        ? Array.from(event.target.files || []).map((file) => file.name)
        : event.target.value;
    const nextValues = { ...values, [field.name]: nextValue };
    setValues(nextValues);
    setSubmissionMessage("");
    if (selectedProjectId && !persistProject(selectedProjectId, nextValues)) {
      return;
    }
    if (activeSection === 0) setSectionOneSubmitted(false);
    persistDraft(nextValues);
  };

  const updateTableCell = (name, value) => {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    setSubmissionMessage("");
    if (selectedProjectId && !persistProject(selectedProjectId, nextValues)) {
      return;
    }
    persistDraft(nextValues);
  };

  const handleSubmitSectionOne = () => {
    const missingField = proposalSections[0].groups
      .flatMap((group) => group.fields)
      .find((field) => field.required && (
        field.type === "checkbox"
          ? !values[field.name]
          : !String(values[field.name] ?? "").trim()
      ));

    if (missingField) {
      setSubmissionMessage(`Please complete the required field: ${missingField.label}.`);
      return;
    }

    let projectId = selectedProjectId;
    if (!projectId) {
      do {
        projectId = `AV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      } while (projects[projectId]);
    }
    const nextValues = { ...values, projectId };
    if (!persistProject(projectId, nextValues)) return;

    setSelectedProjectId(projectId);
    setValues(nextValues);
    persistDraft(nextValues);
    setSectionOneSubmitted(true);
    setSubmissionMessage("");
    onShowInventory();
  };

  const handleSubmitProposal = () => {
    const missingSectionIndex = proposalSections.findIndex((proposalSection) =>
      proposalSection.groups.some((group) =>
        group.fields.some((field) => {
          if (!field.required) return false;
          const value = values[field.name];
          return field.type === "checkbox" ? !value : !String(value ?? "").trim();
        })
      )
    );

    if (missingSectionIndex !== -1) {
      const missingSection = proposalSections[missingSectionIndex];
      const missingField = missingSection.groups
        .flatMap((group) => group.fields)
        .find((field) => field.required && (
          field.type === "checkbox"
            ? !values[field.name]
            : !String(values[field.name] ?? "").trim()
        ));
      setActiveSection(missingSectionIndex);
      setSubmissionMessage(`Please complete the required field: ${missingField.label}.`);
      return;
    }

    setSubmissionMessage("Online proposal submission is not connected yet. Your proposal has not been submitted.");
  };

  return (
    <main className="aastha-proposal-page">
      <header className="aastha-proposal-topbar">
        <div>
          <span>CAMPA • STATE IMPLEMENTING AGENCY</span>
          <h1>Aastha Van Sanrakshan Yojana</h1>
          <p>Proposal submission form{schemeName ? ` — ${schemeName}` : ""}</p>
        </div>
        <div className="aastha-proposal-topbar-actions">
          {selectedProjectId && (
            <button type="button" onClick={onShowInventory}>Project Inventory</button>
          )}
          <button type="button" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className="aastha-proposal-layout">
        <aside className="aastha-proposal-sidebar" aria-label="Proposal sections">
          <div className="aastha-proposal-progress">
            <div className="aastha-proposal-progress-heading">
              <div>
                <span>PROPOSAL FORM</span>
                <strong>
                  {showProjectDetails ? "Project Details" : `Section ${String(activeSection + 1).padStart(2, "0")}`}
                </strong>
              </div>
              <strong className="aastha-proposal-progress-count">
                {activeSection + 1}<span> / {proposalSections.length}</span>
              </strong>
            </div>
            <progress
              value={activeSection + 1}
              max={proposalSections.length}
              aria-label={showProjectDetails
                ? `Project details before section ${activeSection + 1}`
                : `Section ${activeSection + 1} of ${proposalSections.length}`}
            />
            <p>{showProjectDetails ? "Reviewing saved inventory details." : `Currently editing: ${section.title}`}</p>
          </div>
          <nav aria-label="Form sections">
            {proposalSections.map((item, index) => (
              <Fragment key={item.title}>
                <button
                  type="button"
                  className={`aastha-proposal-step${!showProjectDetails && index === activeSection ? " active" : ""}`}
                  aria-current={!showProjectDetails && index === activeSection ? "step" : undefined}
                  disabled={(index === 0 && Boolean(selectedProjectId)) || (index > 0 && !sectionOneSubmitted)}
                  onClick={() => {
                    if ((index === 0 && !selectedProjectId) || (index > 0 && sectionOneSubmitted)) {
                      setShowProjectDetails(false);
                      setActiveSection(index);
                      setSubmissionMessage("");
                      if (index > 0) onContinueProject();
                    }
                  }}
                >
                  <span className="aastha-proposal-step-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="aastha-proposal-step-title">{item.title}</span>
                </button>
                {index === 0 && sectionOneSubmitted && (showProjectDetails || activeSection === 0) && (
                  <button
                    type="button"
                    className={`aastha-proposal-step${showProjectDetails ? " active" : ""}`}
                    aria-current={showProjectDetails ? "step" : undefined}
                    disabled={!sectionOneSubmitted}
                    onClick={() => {
                      setShowProjectDetails(true);
                      setSubmissionMessage("");
                      onOpenProjectDetails();
                    }}
                  >
                    <span className="aastha-proposal-step-number">ID</span>
                    <span className="aastha-proposal-step-title">Project Details</span>
                  </button>
                )}
              </Fragment>
            ))}
          </nav>
        </aside>

        <section className="aastha-proposal-content" aria-labelledby="aastha-proposal-section-title">
          {showProjectDetails ? (
            <AasthaVanProjectDetails
              project={projects[selectedProjectId]}
              schemeCode={schemeCode}
              onContinue={() => {
                setShowProjectDetails(false);
                setActiveSection(1);
                setSubmissionMessage("");
                onContinueProject();
              }}
            />
          ) : (
            <>
              <div className="aastha-proposal-section-heading">
                <div>
                  <span>SECTION {String(activeSection + 1).padStart(2, "0")}</span>
                  <h2 id="aastha-proposal-section-title">{section.title}</h2>
                  <p>{section.description}</p>
                </div>
                {schemeCode && <small>Selected scheme code: {schemeCode}</small>}
              </div>

              {section.groups.map((group) => (
                <section className="aastha-proposal-group" key={group.title}>
                  <h3>{group.title}</h3>
                  {group.description && <p className="aastha-proposal-guidance">{group.description}</p>}
                  <div className="aastha-proposal-fields">
                    {group.fields
                      .filter((field) => !field.dependsOn || values[field.dependsOn] === field.dependsOnValue)
                      .map((field) => (
                      <ProposalField
                        key={field.name}
                        field={field}
                        value={values[field.name]}
                        onChange={updateField}
                      />
                      ))}
                  </div>
                </section>
              ))}

              {(section.tables || []).map((table) => (
                <ProposalTable
                  key={table.title}
                  table={table}
                  values={values}
                  onChange={updateTableCell}
                  sectionIndex={activeSection}
                />
              ))}

              <div className="aastha-proposal-navigation">
                <button
                  type="button"
                  className="aastha-proposal-secondary"
                  disabled={activeSection === 0}
                  onClick={() => setActiveSection((current) => Math.max(0, current - 1))}
                >
                  Previous section
                </button>
                {activeSection === 0 && (
                  <button
                    type="button"
                    className="aastha-proposal-primary"
                    onClick={handleSubmitSectionOne}
                  >
                    Create Inventory
                  </button>
                )}
                {activeSection > 0 && activeSection < proposalSections.length - 1 && (
                  <button
                    type="button"
                    className="aastha-proposal-primary"
                    onClick={() => {
                      if (!sectionOneSubmitted) return;
                      setSubmissionMessage("");
                      setActiveSection((current) => Math.min(proposalSections.length - 1, current + 1));
                    }}
                  >
                    Next section
                  </button>
                )}
                {activeSection === proposalSections.length - 1 && (
                  <button
                    type="button"
                    className="aastha-proposal-primary"
                    onClick={handleSubmitProposal}
                  >
                    Submit Proposal
                  </button>
                )}
              </div>
              {submissionMessage && <p className="aastha-proposal-submission-message" role="alert">{submissionMessage}</p>}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default AasthaVanProposalForm;
