import { useState } from "react";
import { apiUrls } from "../../api/urls";
import buffaloImage from "../../assets/wild_bufaalo.jpg";

const initialForm = {
  name: "",
  designation: "",
  email: "",
  mobile: "",
  password: ""
};

export default function CwlwUserRegistrationDialog({ open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(apiUrls.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleCode: "STATE_HOD",
          fullName: form.name.trim(),
          designation: form.designation.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          password: form.password
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      setForm(initialForm);
      setSuccess("CWLW user registered successfully.");
    } catch (submitError) {
      setError(`Unable to register CWLW user: ${submitError.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <div
      className="login-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        className="login-modal login-modal--role-login"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cwlw-registration-title"
      >
        <button
          className="login-modal-close"
          type="button"
          onClick={handleClose}
          aria-label="Close registration"
          disabled={saving}
        >
          ×
        </button>
        <aside className="login-selected-role" aria-label="CWLW user role">
          <img className="login-selected-role-background" src={buffaloImage} alt="" aria-hidden="true" />
          <strong>Chief Wildlife Warden (CWLW)</strong>
          <span>State Level</span>
        </aside>
        <div className="login-modal-content">
          <h1 id="cwlw-registration-title">CWLW User Registration</h1>
          <form onSubmit={handleSubmit}>
            {error && <p className="captcha-error" role="alert">{error}</p>}
            {success && <p className="registration-success" role="status">{success}</p>}
            <label className="visually-hidden" htmlFor="cwlw-registration-name">Name</label>
            <input
              id="cwlw-registration-name"
              className="login-modal-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              autoComplete="name"
              required
            />
            <label className="visually-hidden" htmlFor="cwlw-registration-designation">Designation</label>
            <input
              id="cwlw-registration-designation"
              className="login-modal-input"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Designation"
              required
            />
            <label className="visually-hidden" htmlFor="cwlw-registration-email">Email</label>
            <input
              id="cwlw-registration-email"
              className="login-modal-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="email"
              required
            />
            <label className="visually-hidden" htmlFor="cwlw-registration-mobile">Mobile</label>
            <input
              id="cwlw-registration-mobile"
              className="login-modal-input"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Mobile"
              autoComplete="tel"
              required
            />
            <label className="visually-hidden" htmlFor="cwlw-registration-password">Password</label>
            <input
              id="cwlw-registration-password"
              className="login-modal-input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              autoComplete="new-password"
              required
            />
            <button className="login-submit" type="submit" disabled={saving}>
              {saving ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="login-register-prompt">
            <button type="button" onClick={handleClose} disabled={saving}>
              Back to User Management
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
