import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import {
  Carousel,
  ChartPanel,
  DocumentUpload,
  ImageUpload,
  MultiSelect,
  PwaPrompt,
  RadioGroup,
  Select,
  TextArea,
  TextInput
} from "./common/components";
import { getLocaleContent } from "./common/i18n";

import Home from "./pages/Home";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import UserManual from "./pages/UserManual";
import Login from "./pages/Login";

const categoryOptions = [
  { value: "hospitality", label: "Hospitality" },
  { value: "tourism", label: "Tourism" },
  { value: "logistics", label: "Logistics" },
  { value: "support", label: "Support" }
];

const interestOptions = [
  { value: "reports", label: "Reports" },
  { value: "analytics", label: "Analytics" },
  { value: "inventory", label: "Inventory" },
  { value: "alerts", label: "Alerts" }
];

const slides = [
  {
    title: "Sustainable travel",
    description: "Smart operations for a greener and cleaner van experience.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Real-time support",
    description: "Staff can access service updates and issue tracking quickly.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Integrated dashboard",
    description: "Monitor trips, visitors, and tasks through a unified dashboard.",
    image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1200&q=80"
  }
];

function CommonDemo() {
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    gender: "female",
    interests: ["reports"],
    notes: ""
  });

  const strings = getLocaleContent(language);

  const chartData = useMemo(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Applications",
          data: [120, 150, 180, 170, 220, 260],
          backgroundColor: ["#0f766e", "#14b8a6", "#34d399", "#5eead4", "#7dd3fc", "#2dd4bf"],
          borderRadius: 10
        }
      ]
    }),
    []
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">AV</div>
          <h1>{strings.appTitle}</h1>
        </div>

        <label className="language-picker">
          <span>{strings.languageLabel}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </label>
      </header>

      <PwaPrompt />

      <form className="section-card" onSubmit={handleSubmit}>
        <h2 className="section-heading">{strings.dashboardTitle}</h2>

        <div className="component-grid">
          <TextInput
            label={strings.nameLabel}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Priya Sharma"
          />

          <TextInput
            label={strings.phoneLabel}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+91 98765 43210"
          />

          <TextInput
            label={strings.emailLabel}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="name@example.com"
          />

          <Select
            label={strings.selectLabel}
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            options={categoryOptions}
            placeholder={strings.choosePlaceholder}
          />

          <MultiSelect
            label={strings.interestsLabel}
            name="interests"
            value={formData.interests}
            onChange={handleInputChange}
            options={interestOptions}
          />

          <RadioGroup
            label={strings.genderLabel}
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
              { value: "other", label: "Other" }
            ]}
          />

          <TextArea
            label={strings.notesLabel}
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Write additional details..."
          />

          <ImageUpload
            label={strings.imageUploadLabel}
            name="profile-image"
            onChange={handleInputChange}
            helperText={strings.imagePlaceholder}
          />

          <DocumentUpload
            label={strings.documentUploadLabel}
            name="document-upload"
            onChange={handleInputChange}
            helperText={strings.documentPlaceholder}
          />
        </div>

        <div style={{ marginTop: "22px" }}>
          <button type="submit" className="primary-button">
            {strings.submitButton}
          </button>
          {saved && <div className="toast">✓ {strings.toastMessage}</div>}
        </div>
      </form>

      <div className="dashboard-grid">
        <ChartPanel title={strings.chartTitle} type="bar" data={chartData} />
        <Carousel slides={slides} />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/components" element={<CommonDemo />} />
      <Route path="/login" element={<Home />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/user-manual" element={<UserManual />} />
      <Route path="/signin" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;