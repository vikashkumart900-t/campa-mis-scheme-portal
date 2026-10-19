import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Bell, ChevronLeft, CircleUserRound, Download, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { translations } from "../i18n";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import campaMinistryLogo from "../assets/campa-ministry-logo.png";

const userTypes = ["implementingAgency", "programDivision", "nationalAuthority", "hod"];
const schemeStatuses = ["New", "Pending with HOD", "Approved", "Deferred", "Reverted", "Rejected", "Save As Draft"];
const sessionTimeoutSeconds = 60 * 60;

const initialSchemes = [
  {
    id: "FSI/2026/44",
    name: "Forest Protection and Conservation",
    submitted: "-",
    approved: "-",
    duration: "1 month",
    outlay: "12.22",
    type: "New",
    status: "Pending with HOD"
  },
  {
    id: "FSI/2026/43",
    name: "Community Afforestation",
    submitted: "2026-04-09",
    approved: "-",
    duration: "4 years 9 months",
    outlay: "100.00",
    type: "Ongoing",
    status: "Save As Draft"
  },
  {
    id: "FSI/2026/42",
    name: "Wildlife Habitat Restoration",
    submitted: "2026-03-18",
    approved: "2026-04-02",
    duration: "2 years",
    outlay: "85.50",
    type: "Ongoing",
    status: "Approved"
  }
];

const installmentReports = [
  { id: "FSI/2026/06", name: "Ongoing scheme testing", proposalDate: "2026-06-01", completionDate: "2030-01-01", duration: "3 year 7 month", approvalLetters: 1, sanctionLetters: 0 },
  { id: "FSI/2026/14", name: "Aakanksha testing", proposalDate: "2026-07-22", completionDate: "2029-01-01", duration: "2 year 5 month", approvalLetters: 1, sanctionLetters: 2 },
  { id: "FSI/2026/26", name: "Testing for deliverables", proposalDate: "2024-01-01", completionDate: "2027-01-01", duration: "3 year", approvalLetters: 1, sanctionLetters: 2 },
  { id: "FSI/2026/31", name: "capsule", proposalDate: "2026-06-01", completionDate: "2030-01-01", duration: "3 year 7 month", approvalLetters: 1, sanctionLetters: 1 },
  { id: "FSI/2026/37", name: "test-18", proposalDate: "2026-02-02", completionDate: "2029-08-14", duration: "3 year 6 month", approvalLetters: 1, sanctionLetters: 1 },
  { id: "FSI/2026/38", name: "test-cap", proposalDate: "2026-02-16", completionDate: "2028-10-01", duration: "2 year 7 month", approvalLetters: 1, sanctionLetters: 0 },
  { id: "FSI/2026/43", name: "test-22", proposalDate: "2026-02-03", completionDate: "2030-11-02", duration: "4 year 9 month", approvalLetters: 1, sanctionLetters: 2 }
];

const monitoringSections = [
  {
    title: "Submission/ Receipt of UCs at the end of each Financial year",
    fields: [
      { name: "ucNumber", label: "UC No." },
      { name: "ucDate", label: "UC Date", type: "date" },
      { name: "ucFinancialYear", label: "Financial Year", type: "select", options: ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29"] },
      { name: "amountReleased", label: "Amount Released", type: "number" },
      { name: "amountUtilised", label: "Amount Utilised", type: "number" },
      { name: "balanceAmount", label: "Balance Amount", type: "number" },
      { name: "ucCertificate", label: "UC Certificate Upload", type: "file" }
    ]
  },
  {
    title: "Details of Interest Receipt",
    fields: [
      { name: "interestDate", label: "Date", type: "date" },
      { name: "interestAmount", label: "Amount", type: "number" },
      { name: "paODate", label: "Date of deposition to PAO", type: "date" },
      { name: "interestDocument", label: "Upload Document", type: "file" }
    ]
  },
  {
    title: "Progress Report",
    fields: [
      { name: "progressYear", label: "Year", type: "select", options: ["2024-25", "2025-26", "2026-27", "2027-28", "2028-29"] },
      { name: "progressQuarter", label: "Quarter", type: "select", options: ["Q1", "Q2", "Q3", "Q4"] },
      { name: "progressReceivedDate", label: "Date of receiving", type: "date" },
      { name: "physicalAchievement", label: "Physical Achievement" },
      { name: "financialAchievement", label: "Financial Achievement" },
      { name: "progressReport", label: "Progress Report", type: "file" }
    ]
  },
  {
    title: "Monitoring and Evaluation",
    fields: [
      { name: "teamVisitDate", label: "Date of Visit of Team", type: "date" },
      { name: "committeeMeetingDate", label: "Date of M&E Committee Meeting", type: "date" },
      { name: "decision", label: "Decision", type: "textarea" },
      { name: "monitoringKml", label: "Upload KML", type: "file" },
      { name: "monitoringImages", label: "Upload Images", type: "file" }
    ]
  }
];

const schemeFormSteps = [
  {
    title: "Basic Info",
    sections: [
      {
        title: "1. Basic Scheme Information",
        fields: [
          { name: "schemeTitle", label: "1.1 Name of the Scheme", required: true },
          { name: "schemeCategory", label: "1.2 Scheme Category", type: "select", required: true, options: ["Afforestation", "Forest Protection", "Wildlife Conservation", "Other"] },
          { name: "schemeType", label: "1.3 Scheme Type", type: "select", required: true, options: ["New", "Ongoing"] }
        ]
      },
      {
        title: "2. Nodal Officer Details",
        fields: [
          { name: "agencyName", label: "2.1 Name of Implementing Agency", defaultValue: "Forest Survey of India" },
          { name: "officerName", label: "2.2 Name of the Nodal Officer of Implementing Agency", defaultValue: "Aakanksha Goswami" },
          { name: "designation", label: "2.3 Designation", defaultValue: "Nodal Officer" },
          { name: "email", label: "2.4 Email ID", type: "email", defaultValue: "agency@example.gov.in" },
          { name: "phone", label: "2.5 Phone No.", type: "tel", defaultValue: "0000000000" },
          { name: "aadhaar", label: "2.6 Aadhaar No.", type: "text", required: true, placeholder: "Enter 12-digit Aadhaar number" }
        ]
      }
    ]
  },
  {
    title: "Scheme Details",
    sections: [
      {
        title: "3. Scheme Details",
        fields: [
          { name: "detailedSchemeName", label: "3.1 Name of the Scheme", required: true },
          { name: "proposalDate", label: "3.2 Date of Proposal", type: "date", required: true },
          { name: "completionDate", label: "3.3 Expected Completion Date", type: "date", required: true },
          { name: "outlay", label: "3.4 Proposed Financial Outlay (Rs. in Lakhs)", type: "number", required: true, min: "0", step: "0.01" },
          { name: "duration", label: "3.5 Scheme Duration", placeholder: "e.g. 5 years", required: true }
        ]
      },
      {
        title: "4. Objectives",
        fields: [
          { name: "objectivesFile", label: "Upload Objectives Excel", type: "file" },
          { name: "majorObjectives", label: "Major Objectives", type: "textarea", placeholder: "Describe the major objectives of the scheme", wide: true },
          { name: "minorObjectives", label: "Minor Objectives", type: "textarea", placeholder: "Describe the minor objectives of the scheme", wide: true }
        ]
      }
    ]
  },
  {
    title: "Funding & Deliverables",
    sections: [
      {
        title: "5. State Components and Funding Agency",
        fields: [
          { name: "stateComponents", label: "5.1 Whether the scheme has State components?", type: "radio", options: ["Yes", "No"], required: true },
          { name: "otherFunding", label: "5.2 Whether the scheme has other funding agency?", type: "radio", options: ["Yes", "No"], required: true },
          { name: "fundingAgencyDetails", label: "Other funding agency details", placeholder: "Enter agency and contribution details", wide: true }
        ]
      },
      {
        title: "6. Deliverables",
        fields: [
          { name: "deliverableName", label: "6.1 Deliverable" },
          { name: "deliverableUnit", label: "Unit" },
          { name: "deliverableInitiation", label: "Initiation Date", type: "date" },
          { name: "deliverableClosing", label: "Closing Date", type: "date" },
          { name: "deliverableOutlay", label: "Financial Outlay (Rs. in Lakhs)", type: "number", min: "0", step: "0.01" },
          { name: "deliverableRemarks", label: "Remarks" },
          { name: "deliverableFile", label: "Upload deliverable document (optional)", type: "file" },
          { name: "estimatedExpenditure", label: "6.2 Year-wise Estimated Expenditure", type: "textarea", placeholder: "Enter financial year and estimated expenditure", wide: true },
          { name: "nationalImportance", label: "6.3 National Importance", type: "textarea", required: true },
          { name: "internationalFootprints", label: "6.4 International Footprints", type: "textarea", required: true }
        ]
      }
    ]
  },
  {
    title: "Evaluation & Research",
    sections: [
      {
        title: "7. Envisaged Monitoring and Evaluation Framework",
        fields: [
          { name: "monitoring", label: "7.1 Monitoring and Evaluation Annually", type: "radio", options: ["Yes", "No"], required: true },
          { name: "midtermEvaluation", label: "7.2 Midterm Evaluation", type: "radio", options: ["Yes", "No"], required: true }
        ]
      },
      {
        title: "8. Research Aspects",
        fields: [
          { name: "researchAspects", label: "8.1 Research Aspects", type: "textarea", required: true, wide: true },
          { name: "researchHighlights", label: "8.2 Unique highlights including research aspects", type: "textarea", wide: true }
        ]
      }
    ]
  },
  {
    title: "Documents & Employment",
    sections: [
      {
        title: "9. Capacity Building & Awareness Programmes",
        fields: [
          { name: "capacityBuilding", label: "9.1 Associated capacity building, awareness, information collection and communication", type: "textarea", wide: true }
        ]
      },
      {
        title: "10. Benefitted / Implementing States and UTs",
        fields: [
          { name: "benefittedStates", label: "Select states / union territories", placeholder: "Enter the states and UTs covered by this scheme", wide: true },
          { name: "panIndia", label: "Scheme covers PAN India", type: "checkbox" }
        ]
      },
      {
        title: "11. Scheme Supporting Documents",
        fields: [
          { name: "kmlDescription", label: "11.1 KML file description" },
          { name: "kmlFiles", label: "Upload supporting KML files", type: "file", multiple: true },
          { name: "imageDescription", label: "11.2 Image gallery description" },
          { name: "supportingDocuments", label: "Upload supporting documents", type: "file", multiple: true }
        ]
      },
      {
        title: "12. Projected Green Employment / Employment Generation",
        fields: [
          { name: "financialYear", label: "Financial Year", type: "select", options: ["2026-27", "2027-28", "2028-29", "2029-30"] },
          { name: "labourCost", label: "Labour Cost (in Rs.)", type: "number" },
          { name: "mandays", label: "Mandays Generated", type: "number" },
          { name: "tribals", label: "Tribals Benefitted", type: "number" },
          { name: "forestDwellers", label: "Forest Dwellers Benefitted", type: "number" }
        ]
      }
    ]
  },
  {
    title: "Tech, Exit & Declaration",
    sections: [
      {
        title: "13. Technological Intervention in Implementing the Scheme",
        fields: [
          { name: "technology", label: "13.1 Description of technological intervention", type: "textarea", required: true, wide: true },
          { name: "technologyDocument", label: "Upload supporting document", type: "file" }
        ]
      },
      {
        title: "14. Exit Protocol of the Scheme",
        fields: [
          { name: "exitProtocol", label: "14.1 Description of Exit Protocol (minimum 250 words)", type: "textarea", required: true, wide: true }
        ]
      },
      {
        title: "15. Declaration",
        fields: [
          { name: "gfrDeclaration", label: "15.1 The Programme Division (PD) will ensure that the Implementing Agency (IA) shall adhere to GFR 2017 and Government Accounting Rules 1990.", type: "checkbox", required: true, wide: true },
          { name: "complianceDeclaration", label: "15.2 The Implementing Agency (IA) is required to comply with the provisions issued by the National Authority.", type: "checkbox", required: true, wide: true }
        ]
      }
    ]
  },
  {
    title: "Review & Final Submission",
    sections: [
      {
        title: "Review & Final Submission",
        fields: [
          { name: "signature", label: "Upload Signature", type: "file" },
          { name: "finalDocuments", label: "Upload Supporting Documents (optional)", type: "file", multiple: true }
        ]
      }
    ]
  }
];

function SchemeFormField({ field, value, onChange }) {
  const fieldValue = value ?? field.defaultValue ?? "";
  const commonProps = {
    id: `scheme-${field.name}`,
    name: field.name,
    onChange,
    required: Boolean(field.required)
  };

  if (field.type === "radio") {
    return (
      <fieldset className="ia-form-radio-field">
        <legend>{field.label}{field.required && <span> *</span>}</legend>
        {field.options.map((option) => (
          <label key={option}>
              <input {...commonProps} type="radio" value={option} checked={fieldValue === option} />
            {option}
          </label>
        ))}
      </fieldset>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className={`ia-form-checkbox${field.wide ? " wide" : ""}`}>
        <input {...commonProps} type="checkbox" checked={Boolean(fieldValue)} />
        {field.label}{field.required && <span> *</span>}
      </label>
    );
  }

  const label = <span>{field.label}{field.required && <b> *</b>}</span>;
  let control;

  if (field.type === "select") {
    control = (
      <select {...commonProps} value={fieldValue}>
        <option value="">--Select--</option>
        {field.options.map((option) => <option key={option}>{option}</option>)}
      </select>
    );
  } else if (field.type === "textarea") {
    control = <textarea {...commonProps} value={fieldValue} placeholder={field.placeholder || ""} rows="3" />;
  } else if (field.type === "file") {
    control = <input {...commonProps} type="file" multiple={Boolean(field.multiple)} onChange={(event) => onChange(event, field)} />;
  } else {
    control = (
      <input
        {...commonProps}
        type={field.type || "text"}
        value={fieldValue}
        placeholder={field.placeholder || ""}
        min={field.min}
        step={field.step}
        onChange={(event) => onChange(event, field)}
      />
    );
  }

  return <label className={field.wide ? "ia-form-field wide" : "ia-form-field"}>{label}{control}</label>;
}

function PlaceholderDashboard({ userType }) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <main className="user-dashboard-page">
      <section className="user-dashboard-card">
        <h1>{translations[language][userType]}</h1>
        <p>Your workspace is ready. Forms and dashboard features will be added here.</p>
        <div className="user-dashboard-actions">
          <Link className="user-dashboard-back" to="/login">Back to home</Link>
          <button className="user-dashboard-logout" type="button" onClick={() => navigate("/login")}>
            Log out
          </button>
        </div>
      </section>
    </main>
  );
}

function ImplementingAgencyDashboard({ remainingSeconds }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [schemes, setSchemes] = useState(initialSchemes);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [schemeIdFilter, setSchemeIdFilter] = useState("");
  const [schemeTypeFilter, setSchemeTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formStep, setFormStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [formError, setFormError] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [reportPageSize, setReportPageSize] = useState(10);
  const [reportPage, setReportPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [historySchemeId, setHistorySchemeId] = useState("");
  const [historySchemeType, setHistorySchemeType] = useState("New");
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyPage, setHistoryPage] = useState(1);
  const [monitoringSchemeId, setMonitoringSchemeId] = useState("");
  const [monitoringDataAdded, setMonitoringDataAdded] = useState(false);
  const [monitoringOpenSections, setMonitoringOpenSections] = useState(
    () => monitoringSections.map(() => true)
  );
  const [monitoringValues, setMonitoringValues] = useState({});
  const [monitoringSaved, setMonitoringSaved] = useState(false);

  const filteredSchemes = useMemo(() => schemes.filter((scheme) => {
    const searchable = Object.values(scheme).join(" ").toLowerCase();
    const isCompletedScheme = scheme.type === "Completed" || scheme.status === "Completed";
    return (
      !isCompletedScheme &&
      searchable.includes(search.trim().toLowerCase()) &&
      (!schemeIdFilter || scheme.id === schemeIdFilter) &&
      (!schemeTypeFilter || scheme.type === schemeTypeFilter) &&
      (!statusFilter || scheme.status === statusFilter)
    );
  }), [schemes, search, schemeIdFilter, schemeTypeFilter, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredSchemes.length / pageSize));
  const visibleSchemes = filteredSchemes.slice((page - 1) * pageSize, page * pageSize);
  const filteredInstallmentReports = installmentReports.filter((report) =>
    Object.values(report).join(" ").toLowerCase().includes(reportSearch.trim().toLowerCase())
  );
  const reportPageCount = Math.max(1, Math.ceil(filteredInstallmentReports.length / reportPageSize));
  const visibleInstallmentReports = filteredInstallmentReports.slice(
    (reportPage - 1) * reportPageSize,
    reportPage * reportPageSize
  );
  const filteredHistorySchemes = historyEntries.filter((scheme) => {
    const searchable = [
      scheme.name, scheme.id, scheme.type, scheme.agencyName, scheme.officerName,
      scheme.submitted, scheme.approved, scheme.status
    ].join(" ").toLowerCase();
    return (
      searchable.includes(historySearch.trim().toLowerCase()) &&
      (!historySchemeId || scheme.id === historySchemeId) &&
      (!historySchemeType || scheme.type === historySchemeType)
    );
  });
  const historyPageCount = Math.max(1, Math.ceil(filteredHistorySchemes.length / historyPageSize));
  const visibleHistorySchemes = filteredHistorySchemes.slice(
    (historyPage - 1) * historyPageSize,
    historyPage * historyPageSize
  );
  const selectedMonitoringScheme = schemes.find((scheme) => scheme.id === monitoringSchemeId);
  const statusCounts = [
    { label: "Total Schemes", value: schemes.length, featured: true },
    { label: "Approved Schemes", value: schemes.filter((scheme) => scheme.status === "Approved").length },
    { label: "Reverted Schemes", value: schemes.filter((scheme) => scheme.status === "Reverted").length },
    { label: "Rejected Schemes", value: schemes.filter((scheme) => scheme.status === "Rejected").length },
    { label: "Pending Schemes", value: schemes.filter((scheme) => ["New", "Pending with HOD"].includes(scheme.status)).length }
  ];

  const resetToFirstPage = () => setPage(1);

  const openSchemeForm = () => {
    const defaultValues = Object.fromEntries(
      schemeFormSteps.flatMap((step) => step.sections)
        .flatMap((section) => section.fields)
        .filter((field) => field.defaultValue)
        .map((field) => [field.name, field.defaultValue])
    );
    setFormValues(defaultValues);
    setFormStep(0);
    setFormError("");
    setIsFormOpen(true);
    setActiveSection("Dashboard");
  };

  const updateFormField = (event, field) => {
    const { checked, files, name, type, value } = event.target;
    const nextValue = type === "checkbox"
      ? checked
      : type === "file"
        ? [...files].map((file) => file.name)
        : value;
    setFormValues((current) => ({ ...current, [field?.name || name]: nextValue }));
    setFormError("");
  };

  const validateStep = (stepIndex) => {
    const missingField = schemeFormSteps[stepIndex].sections
      .flatMap((section) => section.fields)
      .find((field) => field.required && !formValues[field.name]);

    if (missingField) {
      setFormError(`Please complete "${missingField.label}" before continuing.`);
      return false;
    }
    return true;
  };

  const addScheme = (status = "Pending with HOD") => {
    const invalidStep = schemeFormSteps.findIndex((step) =>
      step.sections.flatMap((section) => section.fields)
        .some((field) => field.required && !formValues[field.name])
    );
    if (status !== "Save As Draft" && invalidStep !== -1) {
      setFormStep(invalidStep);
      setFormError("Complete the required fields before submitting the scheme.");
      return;
    }

    const name = formValues.detailedSchemeName || formValues.schemeTitle || "Untitled Scheme";
    const duration = formValues.duration ? `${formValues.duration} months` : "-";
    const outlay = Number(formValues.outlay);
    const nextId = `FSI/2026/${String(46 + schemes.length - initialSchemes.length).padStart(2, "0")}`;
    const newScheme = {
      id: nextId,
      name,
      submitted: new Date().toISOString().slice(0, 10),
      approved: "-",
      duration,
      outlay: Number.isFinite(outlay) ? outlay.toFixed(2) : "-",
      type: formValues.schemeType || "New",
      status
    };
    setSchemes((current) => [newScheme, ...current]);
    setHistoryEntries((current) => [{
      ...newScheme,
      agencyName: formValues.agencyName || "Forest Survey of India",
      officerName: formValues.officerName || "Vikash",
      proposalDate: formValues.proposalDate || newScheme.submitted,
      completionDate: formValues.completionDate || "-"
    }, ...current]);
    setIsFormOpen(false);
    setFormError("");
    setSchemeTypeFilter("");
    setStatusFilter("");
    setSearch("");
    setPage(1);
  };

  const exportSchemes = () => {
    const rows = [
      ["Scheme ID", "Scheme Name", "Submission Date", "Approval Date", "Duration", "Outlay (Rs. Lakhs)", "Scheme Type", "Status"],
      ...filteredSchemes.map((scheme) => [
        scheme.id, scheme.name, scheme.submitted, scheme.approved,
        scheme.duration, scheme.outlay, scheme.type, scheme.status
      ])
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ia-schemes.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportHistory = () => {
    const rows = [
      ["Sr. No.", "Scheme Name", "Scheme ID", "Scheme Type", "Implementing Agency", "Nodal Officer Name", "Proposal Date", "Completion Date", "Status"],
      ...filteredHistorySchemes.map((scheme, index) => [
        index + 1, scheme.name, scheme.id, scheme.type, scheme.agencyName,
        scheme.officerName, scheme.proposalDate, scheme.completionDate, scheme.status
      ])
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ia-scheme-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const navItems = ["Dashboard", "Installment Report", "Monitoring and Evaluation", "History Log"];

  return (
    <main className={`ia-dashboard${activeSection === "Installment Report" ? " installment-report-active" : ""}${activeSection === "History Log" ? " history-log-active" : ""}${activeSection === "Monitoring and Evaluation" ? " monitoring-evaluation-active" : ""}`}>
      <aside className="ia-sidebar">
        <img className="ia-ministry-logo" src={campaMinistryLogo} alt="National Compensatory Afforestation Fund Management and Planning Authority" />
        <div className="ia-profile">
          <div className="ia-profile-icon"><CircleUserRound aria-hidden="true" /></div>
          <div>
            <strong>Vikash</strong>
            <span>Implementing Agency</span>
          </div>
        </div>
        <p className="ia-session-time" aria-live="polite">
          Session Time Out: {`${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`}
        </p>
        <nav className="ia-side-nav" aria-label="IA dashboard navigation">
          {navItems.map((item) => (
            <button
              className={activeSection === item ? "active" : ""}
              key={item}
              onClick={() => {
                setActiveSection(item);
                setIsFormOpen(false);
              }}
              type="button"
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setActiveSection("Dashboard");
              setIsFormOpen(false);
              setSelectedScheme(null);
            }}
          >
            <ChevronLeft size={17} /> Back
          </button>
        </nav>
        <button className="ia-logout" type="button" onClick={() => navigate("/login")}>↪ Logout</button>
      </aside>

      <section className="ia-main">
        <header className="ia-header">
          <h1>{activeSection === "Dashboard" ? "National Authority, CAMPA Funded Pilot Schemes Monitoring and Evaluation System" : activeSection}</h1>
          {activeSection === "Dashboard" && (
            <div className="ia-header-actions">
              <button type="button" className="ia-action-new" onClick={openSchemeForm}>New Schemes</button>
              <button type="button" className="ia-action-ongoing" onClick={() => { setStatusFilter(""); setSchemeTypeFilter("Ongoing"); setIsFormOpen(false); resetToFirstPage(); }}>Ongoing Schemes</button>
              <button type="button" className="ia-notification" aria-label="Notifications"><Bell size={19} /></button>
            </div>
          )}
        </header>
        {activeSection !== "Installment Report" && activeSection !== "History Log" && activeSection !== "Monitoring and Evaluation" && (
          <div className="ia-announcement">
            <strong>FSI</strong>
            <span>Scheme Management Information System — manage and monitor your submitted schemes.</span>
          </div>
        )}

        {activeSection === "Monitoring and Evaluation" ? (
          <section className="ia-monitoring-page" aria-labelledby="ia-monitoring-title">
            <h2 id="ia-monitoring-title">Monitoring And Evaluation</h2>
            <div className="ia-monitoring-scheme-picker">
              <label htmlFor="monitoring-scheme">Select Scheme:</label>
              <div>
                <select id="monitoring-scheme" value={monitoringSchemeId} onChange={(event) => {
                  setMonitoringSchemeId(event.target.value);
                  setMonitoringDataAdded(false);
                  setMonitoringSaved(false);
                  setMonitoringValues({});
                }}>
                  <option value="">Select Scheme</option>
                  {schemes.map((scheme) => <option key={scheme.id} value={scheme.id}>{scheme.id} - {scheme.name}</option>)}
                </select>
                <button type="button" onClick={() => {
                  if (!selectedMonitoringScheme) {
                    window.alert("Please select a scheme");
                    return;
                  }
                  setMonitoringDataAdded(true);
                  setMonitoringSaved(false);
                }}>Add Data</button>
              </div>
            </div>
            {monitoringDataAdded && selectedMonitoringScheme && (
              <form className="ia-monitoring-form" onSubmit={(event) => { event.preventDefault(); setMonitoringSaved(true); }}>
                <h3>Scheme Details</h3>
                <div className="ia-monitoring-scheme-details">
                  <span>Scheme Id : <strong>{selectedMonitoringScheme.id}</strong></span>
                  <span>Scheme Name : <strong>{selectedMonitoringScheme.name}</strong></span>
                </div>
                {monitoringSections.map((section, sectionIndex) => (
                  <section className="ia-monitoring-accordion" key={section.title}>
                    <button
                      aria-expanded={monitoringOpenSections[sectionIndex]}
                      className="ia-monitoring-accordion-title"
                      onClick={() => setMonitoringOpenSections((current) =>
                        current.map((isOpen, index) => index === sectionIndex ? !isOpen : isOpen)
                      )}
                      type="button"
                    >
                      {section.title}<span aria-hidden="true">{monitoringOpenSections[sectionIndex] ? "⌃" : "⌄"}</span>
                    </button>
                    {monitoringOpenSections[sectionIndex] && (
                      <div className="ia-monitoring-table-scroll">
                        <table className="ia-monitoring-table">
                          <thead><tr><th>Sr No</th>{section.fields.map((field) => <th key={field.name}>{field.label}</th>)}</tr></thead>
                          <tbody><tr>
                            <td>1</td>
                            {section.fields.map((field) => (
                              <td key={field.name}>
                                {field.type === "select" ? (
                                  <select
                                    aria-label={field.label}
                                    value={monitoringValues[field.name] || ""}
                                    onChange={(event) => {
                                      setMonitoringValues((current) => ({ ...current, [field.name]: event.target.value }));
                                      setMonitoringSaved(false);
                                    }}
                                  >
                                    <option value="">{field.name === "progressQuarter" ? "Select Quarter" : "Select Year"}</option>
                                    {field.options.map((option) => <option key={option}>{option}</option>)}
                                  </select>
                                ) : field.type === "textarea" ? (
                                  <textarea
                                    aria-label={field.label}
                                    value={monitoringValues[field.name] || ""}
                                    onChange={(event) => {
                                      setMonitoringValues((current) => ({ ...current, [field.name]: event.target.value }));
                                      setMonitoringSaved(false);
                                    }}
                                  />
                                ) : (
                                  <input
                                    aria-label={field.label}
                                    type={field.type || "text"}
                                    value={field.type === "file" ? undefined : monitoringValues[field.name] || ""}
                                    onChange={(event) => {
                                      const value = field.type === "file" ? event.target.files?.[0]?.name || "" : event.target.value;
                                      setMonitoringValues((current) => ({ ...current, [field.name]: value }));
                                      setMonitoringSaved(false);
                                    }}
                                  />
                                )}
                              </td>
                            ))}
                          </tr></tbody>
                        </table>
                      </div>
                    )}
                  </section>
                ))}
                <div className="ia-monitoring-submit-row">
                  {monitoringSaved && <span role="status">Monitoring and evaluation data saved locally.</span>}
                  <button type="submit">Submit</button>
                </div>
              </form>
            )}
          </section>
        ) : activeSection === "History Log" ? (
          <section className="ia-history-report" aria-labelledby="ia-history-title">
            <div className="ia-history-filters">
              <label>
                <span>Scheme ID</span>
                <select value={historySchemeId} onChange={(event) => { setHistorySchemeId(event.target.value); setHistoryPage(1); }}>
                  <option value="">All Scheme ID</option>
                  {historyEntries.map((scheme) => <option key={scheme.id} value={scheme.id}>{scheme.id}</option>)}
                </select>
              </label>
              <label>
                <span>Scheme Type</span>
                <select value={historySchemeType} onChange={(event) => { setHistorySchemeType(event.target.value); setHistoryPage(1); }}>
                  <option value="">All</option>
                  {[...new Set(["New", "Ongoing", ...historyEntries.map((scheme) => scheme.type)])].map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
            </div>
            <h2 id="ia-history-title" className="ia-history-title">Scheme History Report</h2>
            <div className="ia-installment-toolbar ia-history-toolbar">
              <label>
                <select aria-label="Entries per page" value={historyPageSize} onChange={(event) => { setHistoryPageSize(Number(event.target.value)); setHistoryPage(1); }}>
                  <option value="10">10</option><option value="25">25</option><option value="50">50</option>
                </select>
                <span>entries per page</span>
              </label>
              <label className="ia-installment-search">Search:
                <input value={historySearch} onChange={(event) => { setHistorySearch(event.target.value); setHistoryPage(1); }} />
              </label>
            </div>
            <button className="ia-history-csv" onClick={exportHistory} type="button">CSV</button>
            <div className="ia-table-scroll" key="history-table">
              <table className="ia-installment-table ia-history-table">
                <thead><tr>
                  <th>Sr. No.</th><th>Scheme Name</th><th>Scheme ID</th><th>Scheme Type</th>
                  <th>Implementing Agency</th><th>Nodal Officer Name</th><th>Proposal Date</th>
                  <th>Completion Date</th><th>Status</th><th>More Details</th><th>Action History</th>
                </tr></thead>
                <tbody>
                  {visibleHistorySchemes.map((scheme, index) => {
                    const details = {
                      ...scheme,
                      submitted: scheme.submitted,
                      approved: scheme.approved,
                      outlay: scheme.outlay,
                      type: scheme.type,
                      status: scheme.status
                    };
                    return (
                      <tr key={scheme.id}>
                        <td>{(historyPage - 1) * historyPageSize + index + 1}</td>
                        <td>{scheme.name}</td><td>{scheme.id}</td><td>{scheme.type}</td>
                        <td>{scheme.agencyName}</td><td>{scheme.officerName}</td>
                        <td>{scheme.proposalDate}</td><td>{scheme.completionDate}</td><td>{scheme.status}</td>
                        <td><button className="ia-history-detail" onClick={() => setSelectedScheme(details)} type="button">View</button></td>
                        <td><button className="ia-report-action" aria-label={`View action history for ${scheme.id}`} onClick={() => setSelectedScheme(details)} type="button"><span>☷</span></button></td>
                      </tr>
                    );
                  })}
                  {!visibleHistorySchemes.length && <tr><td className="ia-installment-empty" colSpan="11">No data available in table</td></tr>}
                </tbody>
              </table>
            </div>
            <footer className="ia-installment-footer">
              <span>Showing {filteredHistorySchemes.length ? (historyPage - 1) * historyPageSize + 1 : 0} to {Math.min(historyPage * historyPageSize, filteredHistorySchemes.length)} of {filteredHistorySchemes.length} entries</span>
              <div>
                <button aria-label="First page" disabled={historyPage <= 1} onClick={() => setHistoryPage(1)} type="button">«</button>
                <button aria-label="Previous page" disabled={historyPage <= 1} onClick={() => setHistoryPage((current) => current - 1)} type="button">‹</button>
                <span>{historyPage}</span>
                <button aria-label="Next page" disabled={historyPage >= historyPageCount} onClick={() => setHistoryPage((current) => current + 1)} type="button">›</button>
                <button aria-label="Last page" disabled={historyPage >= historyPageCount} onClick={() => setHistoryPage(historyPageCount)} type="button">»</button>
              </div>
            </footer>
          </section>
        ) : activeSection === "Installment Report" ? (
          <section className="ia-installment-report" aria-labelledby="ia-installment-title">
            <div className="ia-installment-toolbar">
              <label>
                <select
                  aria-label="Entries per page"
                  value={reportPageSize}
                  onChange={(event) => { setReportPageSize(Number(event.target.value)); setReportPage(1); }}
                >
                  <option value="10">10</option><option value="25">25</option><option value="50">50</option>
                </select>
                <span>entries per page</span>
              </label>
              <label className="ia-installment-search">Search:
                <input value={reportSearch} onChange={(event) => { setReportSearch(event.target.value); setReportPage(1); }} />
              </label>
            </div>
            <div className="ia-table-scroll" key="installment-table">
              <table className="ia-installment-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th><th>Name of Scheme</th><th>SchemeID</th><th>Date of Proposal</th>
                    <th>Date of Completion</th><th>Scheme Duration</th><th>Approval Letter</th>
                    <th>Sanction Letter</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInstallmentReports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{(reportPage - 1) * reportPageSize + index + 1}</td>
                      <td>{report.name}</td><td>{report.id}</td><td>{report.proposalDate}</td>
                      <td>{report.completionDate}</td><td>{report.duration}</td>
                      <td><button type="button" className="ia-report-document" aria-label={`View approval letter for ${report.id}`} onClick={() => setSelectedScheme({ ...report, submitted: report.proposalDate, approved: report.completionDate, outlay: "-", type: "Installment Report", status: "Available" })}><FileText size={14} /></button></td>
                      <td><div className="ia-report-documents">{Array.from({ length: report.sanctionLetters }, (_, letterIndex) => (
                        <button type="button" key={letterIndex} aria-label={`View sanction letter ${letterIndex + 1} for ${report.id}`} onClick={() => setSelectedScheme({ ...report, submitted: report.proposalDate, approved: report.completionDate, outlay: "-", type: "Installment Report", status: "Available" })}><FileText size={13} />{letterIndex + 1}</button>
                      ))}</div></td>
                      <td><button type="button" className="ia-report-action" aria-label={`View actions for ${report.id}`} onClick={() => setSelectedScheme({ ...report, submitted: report.proposalDate, approved: report.completionDate, outlay: "-", type: "Installment Report", status: "Available" })}><span>☷</span></button></td>
                    </tr>
                  ))}
                  {!visibleInstallmentReports.length && <tr><td className="ia-installment-empty" colSpan="9">No matching installment reports.</td></tr>}
                </tbody>
              </table>
            </div>
            <footer className="ia-installment-footer">
              <span>Showing {filteredInstallmentReports.length ? (reportPage - 1) * reportPageSize + 1 : 0} to {Math.min(reportPage * reportPageSize, filteredInstallmentReports.length)} of {filteredInstallmentReports.length} entries</span>
              <div>
                <button aria-label="First page" disabled={reportPage <= 1} onClick={() => setReportPage(1)} type="button">«</button>
                <button aria-label="Previous page" disabled={reportPage <= 1} onClick={() => setReportPage((current) => current - 1)} type="button">‹</button>
                <span>{reportPage}</span>
                <button aria-label="Next page" disabled={reportPage >= reportPageCount} onClick={() => setReportPage((current) => current + 1)} type="button">›</button>
                <button aria-label="Last page" disabled={reportPage >= reportPageCount} onClick={() => setReportPage(reportPageCount)} type="button">»</button>
              </div>
            </footer>
          </section>
        ) : isFormOpen ? (
          <section className="ia-scheme-form-panel">
            <div className="ia-panel-heading">
              <div><span>SCHEME ENTRY</span><h2>Create New Scheme</h2></div>
              <button type="button" onClick={() => { setIsFormOpen(false); setFormError(""); }}>Back to Dashboard</button>
            </div>
            <div className="ia-wizard-steps" aria-label="New scheme form steps">
              {schemeFormSteps.map((step, index) => (
                <button
                  aria-current={formStep === index ? "step" : undefined}
                  className={`${formStep === index ? "active" : ""}${index < formStep ? " complete" : ""}`}
                  key={step.title}
                  onClick={() => {
                    if (index <= formStep || validateStep(formStep)) {
                      setFormStep(index);
                      setFormError("");
                    }
                  }}
                  type="button"
                >
                  <span>{index + 1}</span>{step.title}
                </button>
              ))}
            </div>
            <form className="ia-scheme-wizard" onSubmit={(event) => event.preventDefault()}>
              {formStep === schemeFormSteps.length - 1 ? (
                <section className="ia-review-panel">
                  <h3>Review &amp; Final Submission</h3>
                  <p>Review the information entered in the previous sections before submitting your scheme.</p>
                  <div className="ia-review-grid">
                    {schemeFormSteps.slice(0, -1).flatMap((step) => step.sections)
                      .flatMap((section) => section.fields)
                      .filter((field) => {
                        const value = formValues[field.name];
                        return Array.isArray(value) ? value.length > 0 : Boolean(value);
                      })
                      .map((field) => (
                        <div key={field.name}>
                          <span>{field.label}</span>
                          <strong>{Array.isArray(formValues[field.name]) ? formValues[field.name].join(", ") : String(formValues[field.name])}</strong>
                        </div>
                      ))}
                  </div>
                  {schemeFormSteps[formStep].sections.map((section) => (
                    <div className="ia-form-section" key={section.title}>
                      <h3>{section.title}</h3>
                      <div className="ia-form-fields">
                        {section.fields.map((field) => (
                          <SchemeFormField key={field.name} field={field} value={formValues[field.name]} onChange={updateFormField} />
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ) : (
                schemeFormSteps[formStep].sections.map((section) => (
                  <section className="ia-form-section" key={section.title}>
                    <h3>{section.title}</h3>
                    <div className="ia-form-fields">
                      {section.fields.map((field) => (
                        <SchemeFormField key={field.name} field={field} value={formValues[field.name]} onChange={updateFormField} />
                      ))}
                    </div>
                  </section>
                ))
              )}
              {formError && <p className="ia-form-error" role="alert">{formError}</p>}
              <div className="ia-wizard-actions">
                <button
                  className="secondary"
                  disabled={formStep === 0}
                  onClick={() => { setFormStep((step) => Math.max(0, step - 1)); setFormError(""); }}
                  type="button"
                >
                  Previous
                </button>
                <div>
                  {formStep === schemeFormSteps.length - 1 ? (
                    <>
                      <button className="secondary" onClick={() => addScheme("Save As Draft")} type="button">Save as Draft</button>
                      <button className="primary" onClick={() => addScheme()} type="button">Submit Scheme</button>
                    </>
                  ) : (
                    <>
                      <button className="secondary" onClick={() => addScheme("Save As Draft")} type="button">Save as Draft</button>
                      <button
                        className="primary"
                        onClick={() => {
                          if (validateStep(formStep)) {
                            setFormStep((step) => Math.min(schemeFormSteps.length - 1, step + 1));
                          }
                        }}
                        type="button"
                      >
                        {formStep === 0 ? "Next" : "Save & Next"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </section>
        ) : (
          <>
            <section className="ia-summary-cards" aria-label="Scheme summary">
              {statusCounts.map((card) => (
                <article className={card.featured ? "featured" : ""} key={card.label}>
                  <strong>{card.value}</strong><span>{card.label}</span>
                </article>
              ))}
            </section>

            <section className="ia-scheme-list">
              <div className="ia-filter-row">
                <label>Scheme ID<select value={schemeIdFilter} onChange={(event) => { setSchemeIdFilter(event.target.value); resetToFirstPage(); }}><option value="">All Scheme ID</option>{schemes.map((scheme) => <option key={scheme.id} value={scheme.id}>{scheme.id}</option>)}</select></label>
                <label>Scheme Type<select value={schemeTypeFilter} onChange={(event) => { setSchemeTypeFilter(event.target.value); resetToFirstPage(); }}><option value="">All Scheme Type</option>{[...new Set(schemes.filter((scheme) => scheme.type !== "Completed").map((scheme) => scheme.type))].map((type) => <option key={type}>{type}</option>)}</select></label>
                <label>Scheme Status<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); resetToFirstPage(); }}><option value="">Select Scheme Status</option>{schemeStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              </div>

              <div className="ia-table-toolbar">
                <label className="ia-page-size">Show <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); resetToFirstPage(); }}><option value="5">5</option><option value="10">10</option><option value="25">25</option></select> entries</label>
                <label className="ia-search">Search:<input value={search} onChange={(event) => { setSearch(event.target.value); resetToFirstPage(); }} /></label>
              </div>
              <button type="button" className="ia-export-button" onClick={exportSchemes}><Download size={14} /> Excel</button>

              <div className="ia-table-scroll">
                <table className="ia-scheme-table">
                  <thead><tr><th>Sr. No.</th><th>Date of Submission of Proposal</th><th>Date of Approval by Governing Body, National Authority</th><th>Scheme ID</th><th>Scheme Name</th><th>Duration</th><th>Total Outlay (Rs. in lakhs)</th><th>Scheme Type</th><th>Status</th><th>Tracking Proposal</th><th>Letters</th><th>Action</th></tr></thead>
                  <tbody>
                    {visibleSchemes.map((scheme, index) => (
                      <tr key={scheme.id}>
                        <td>{(page - 1) * pageSize + index + 1}</td><td>{scheme.submitted}</td><td>{scheme.approved}</td><td>{scheme.id}</td><td>{scheme.name}</td><td>{scheme.duration}</td><td>{scheme.outlay}</td><td>{scheme.type}</td><td><strong className="ia-status">{scheme.status}</strong></td>
                        <td><button className="ia-table-button" type="button" onClick={() => setSelectedScheme(scheme)}>Track</button></td>
                        <td><button className="ia-table-button ia-approval-button" type="button" onClick={() => setSelectedScheme(scheme)}><FileText size={14} /> Approval</button></td>
                        <td className="ia-row-actions"><button aria-label={`View ${scheme.id}`} type="button" onClick={() => setSelectedScheme(scheme)}><Eye size={15} /></button><button aria-label={`Edit ${scheme.id}`} type="button" onClick={() => setSelectedScheme(scheme)}><Pencil size={15} /></button><button aria-label={`Download ${scheme.id}`} type="button" onClick={exportSchemes}><Download size={15} /></button><button aria-label={`Delete ${scheme.id}`} type="button" onClick={() => setSchemes((current) => current.filter((item) => item.id !== scheme.id))}><Trash2 size={15} /></button></td>
                      </tr>
                    ))}
                    {!visibleSchemes.length && <tr><td className="ia-empty-state" colSpan="12">No schemes match your filters.</td></tr>}
                  </tbody>
                </table>
              </div>
              <footer className="ia-table-footer"><span>Showing {filteredSchemes.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredSchemes.length)} of {filteredSchemes.length} entries</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>{page} / {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></footer>
            </section>
          </>
        )}
      </section>

      {selectedScheme && (
        <div className="ia-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedScheme(null); }}>
          <section className="ia-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="ia-detail-title">
            <button type="button" className="ia-detail-close" onClick={() => setSelectedScheme(null)} aria-label="Close">×</button>
            <span>SCHEME DETAILS</span><h2 id="ia-detail-title">{selectedScheme.name}</h2>
            <dl>{Object.entries({ "Scheme ID": selectedScheme.id, "Submission Date": selectedScheme.submitted, "Approval Date": selectedScheme.approved, Duration: selectedScheme.duration, "Total Outlay (Rs. in lakhs)": selectedScheme.outlay, "Scheme Type": selectedScheme.type, Status: selectedScheme.status }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          </section>
        </div>
      )}
    </main>
  );
}

function UserDashboard() {
  const { userType } = useParams();
  const navigate = useNavigate();
  const [remainingSeconds, setRemainingSeconds] = useState(sessionTimeoutSeconds);
  const expiresAt = useRef(null);

  useEffect(() => {
    expiresAt.current = Date.now() + sessionTimeoutSeconds * 1000;

    const updateCountdown = () => {
      const secondsLeft = Math.ceil((expiresAt.current - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        navigate("/login", { replace: true });
        return;
      }
      setRemainingSeconds(secondsLeft);
    };

    const timer = window.setInterval(updateCountdown, 1000);
    document.addEventListener("visibilitychange", updateCountdown);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateCountdown);
    };
  }, [navigate]);

  if (!userTypes.includes(userType)) {
    return <Navigate to="/login" replace />;
  }

  if (userType === "implementingAgency") {
    return <ImplementingAgencyDashboard remainingSeconds={remainingSeconds} />;
  }

  return <PlaceholderDashboard userType={userType} />;
}

export default UserDashboard;
