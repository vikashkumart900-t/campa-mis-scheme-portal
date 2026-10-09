import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Bell, ChevronLeft, CircleUserRound, Download, Eye, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { translations } from "../i18n";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const userTypes = ["implementingAgency", "programDivision", "nationalAuthority", "hod"];
const schemeStatuses = ["New", "Pending with HOD", "Approved", "Deferred", "Reverted", "Rejected", "Completed", "Save As Draft"];

const initialSchemes = [
  {
    id: "FSI/2026/45",
    name: "Vanaspathi Scheme",
    submitted: "-",
    approved: "2026-10-20",
    duration: "-",
    outlay: "1234.66",
    type: "Completed",
    status: "Save As Draft"
  },
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

function ImplementingAgencyDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [schemes, setSchemes] = useState(initialSchemes);
  const [search, setSearch] = useState("");
  const [schemeIdFilter, setSchemeIdFilter] = useState("");
  const [schemeTypeFilter, setSchemeTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [formError, setFormError] = useState("");

  const filteredSchemes = useMemo(() => schemes.filter((scheme) => {
    const searchable = Object.values(scheme).join(" ").toLowerCase();
    return (
      searchable.includes(search.trim().toLowerCase()) &&
      (!schemeIdFilter || scheme.id === schemeIdFilter) &&
      (!schemeTypeFilter || scheme.type === schemeTypeFilter) &&
      (!statusFilter || scheme.status === statusFilter)
    );
  }), [schemes, search, schemeIdFilter, schemeTypeFilter, statusFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredSchemes.length / pageSize));
  const visibleSchemes = filteredSchemes.slice((page - 1) * pageSize, page * pageSize);
  const statusCounts = [
    { label: "Total Schemes", value: schemes.length, featured: true },
    { label: "Approved Schemes", value: schemes.filter((scheme) => scheme.status === "Approved").length },
    { label: "Deferred Schemes", value: schemes.filter((scheme) => scheme.status === "Deferred").length },
    { label: "Reverted Schemes", value: schemes.filter((scheme) => scheme.status === "Reverted").length },
    { label: "Rejected Schemes", value: schemes.filter((scheme) => scheme.status === "Rejected").length },
    { label: "Pending Schemes", value: schemes.filter((scheme) => ["New", "Pending with HOD"].includes(scheme.status)).length }
  ];

  const resetToFirstPage = () => setPage(1);

  const addScheme = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("schemeName") || "").trim();
    const duration = String(form.get("duration") || "").trim();
    const outlay = Number(form.get("outlay"));

    if (!name || !duration || !Number.isFinite(outlay) || outlay <= 0) {
      setFormError("Enter a scheme name, valid duration, and outlay greater than zero.");
      return;
    }

    const nextId = `FSI/2026/${String(46 + schemes.length - initialSchemes.length).padStart(2, "0")}`;
    setSchemes((current) => [{
      id: nextId,
      name,
      submitted: new Date().toISOString().slice(0, 10),
      approved: "-",
      duration: `${duration} months`,
      outlay: outlay.toFixed(2),
      type: "New",
      status: "Pending with HOD"
    }, ...current]);
    setIsFormOpen(false);
    setFormError("");
    event.currentTarget.reset();
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

  const navItems = ["Dashboard", "Installment Report", "Monitoring and Evaluation", "Extension Report", "History Log"];

  return (
    <main className="ia-dashboard">
      <aside className="ia-sidebar">
        <div className="ia-profile">
          <div className="ia-profile-icon"><CircleUserRound aria-hidden="true" /></div>
          <div>
            <strong>Aakanksha Goswami</strong>
            <span>Implementing Agency</span>
          </div>
        </div>
        <p className="ia-session-time">Session Time Out: 59:30</p>
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
          <div className="ia-header-actions">
            <button type="button" className="ia-action-new" onClick={() => { setIsFormOpen(true); setActiveSection("Dashboard"); }}>New Schemes</button>
            <button type="button" className="ia-action-ongoing" onClick={() => { setStatusFilter(""); setSchemeTypeFilter("Ongoing"); setIsFormOpen(false); resetToFirstPage(); }}>Ongoing Schemes</button>
            <button type="button" className="ia-action-completed" onClick={() => { setStatusFilter(""); setSchemeTypeFilter("Completed"); setIsFormOpen(false); resetToFirstPage(); }}>Completed Schemes</button>
            <button type="button" className="ia-notification" aria-label="Notifications"><Bell size={19} /></button>
          </div>
        </header>
        <div className="ia-announcement">
          <strong>FSI</strong>
          <span>Scheme Management Information System — manage and monitor your submitted schemes.</span>
        </div>

        {isFormOpen ? (
          <section className="ia-scheme-form-panel">
            <div className="ia-panel-heading">
              <div><span>SCHEME ENTRY</span><h2>Create New Scheme</h2></div>
              <button type="button" onClick={() => { setIsFormOpen(false); setFormError(""); }}>Back to Dashboard</button>
            </div>
            <form className="ia-scheme-form" onSubmit={addScheme}>
              <label>Scheme Name<input name="schemeName" maxLength="120" placeholder="Enter scheme name" required /></label>
              <label>Scheme Type<select name="schemeType" defaultValue="New"><option>New</option><option>Ongoing</option></select></label>
              <label>Duration (months)<input name="duration" type="number" min="1" max="600" placeholder="e.g. 24" required /></label>
              <label>Total Outlay (Rs. in lakhs)<input name="outlay" type="number" min="0.01" step="0.01" placeholder="Enter total outlay" required /></label>
              {formError && <p className="ia-form-error" role="alert">{formError}</p>}
              <div className="ia-form-actions"><button type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button type="submit"><Plus size={16} /> Save Scheme</button></div>
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
                <label>Scheme Type<select value={schemeTypeFilter} onChange={(event) => { setSchemeTypeFilter(event.target.value); resetToFirstPage(); }}><option value="">All Scheme Type</option>{[...new Set(schemes.map((scheme) => scheme.type))].map((type) => <option key={type}>{type}</option>)}</select></label>
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

  if (!userTypes.includes(userType)) {
    return <Navigate to="/login" replace />;
  }

  if (userType === "implementingAgency") {
    return <ImplementingAgencyDashboard />;
  }

  return <PlaceholderDashboard userType={userType} />;
}

export default UserDashboard;
