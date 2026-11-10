import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiUrls } from "../api/urls";

const passwordRequirementsMessage = "Password must be 8–16 characters and include uppercase, lowercase, number & special character.";

function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const loginPath = `/signin${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(apiUrls.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const responseText = await response.text();
      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { message: responseText };
        }
      }

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
      }

      setStep("otp");
    } catch (requestError) {
      setError(`Unable to request a password reset: ${requestError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(apiUrls.verifyResetOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });
      const responseText = await response.text();
      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { message: responseText };
        }
      }

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
      }

      const verifiedResetToken = result?.resetToken || result?.data?.resetToken;
      if (typeof verifiedResetToken !== "string" || !verifiedResetToken.trim()) {
        throw new Error("The verification response did not include a reset token.");
      }

      setResetToken(verifiedResetToken.trim());
      setStep("password");
    } catch (requestError) {
      setError(`Unable to verify OTP: ${requestError.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(apiUrls.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword, confirmPassword })
      });
      const responseText = await response.text();
      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { message: responseText };
        }
      }

      const passwordValidationMessage = result?.messages?.password
        || result?.data?.messages?.password
        || result?.response?.data?.messages?.password;
      const validationFailed = result?.error === "VALIDATION_FAILED";

      if (!response.ok || result?.success === false || validationFailed) {
        throw new Error(
          passwordValidationMessage || validationFailed
            ? passwordRequirementsMessage
            : result?.message || result?.error || `Request failed with status ${response.status}`
        );
      }

      setStep("complete");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-modal-backdrop">
      <section
        className="login-modal login-modal--role-selection"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        <Link className="login-modal-close" to={loginPath} aria-label="Close password reset">×</Link>
        <div className="login-modal-content">
          <h1 id="forgot-password-title">
            {step === "email"
              ? "Forgot Password?"
              : step === "otp"
                ? "Verify OTP"
                : step === "password"
                  ? "Reset Password"
                  : "Password Reset Successfully"}
          </h1>
          {step !== "complete" && (
            <p className="login-modal-subtitle">
              {step === "email"
                ? "Please enter your registered email address to reset your password."
                : step === "otp"
                  ? `Enter the OTP sent to ${email}.`
                  : "Create a new password for your account."}
            </p>
          )}
          {step === "email" && (
            <form onSubmit={handleSubmit}>
              <label className="visually-hidden" htmlFor="forgot-password-email">Email ID</label>
              <input
                className="login-modal-input"
                id="forgot-password-email"
                type="email"
                name="email"
                placeholder="Enter Email ID"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
              />
              {error && <p className="captcha-error" role="alert">{error}</p>}
              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <label className="visually-hidden" htmlFor="forgot-password-otp">One-time password</label>
              <input
                className="login-modal-input"
                id="forgot-password-otp"
                type="text"
                name="otp"
                placeholder="Enter OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                required
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, ""));
                  setError("");
                }}
              />
              {error && <p className="captcha-error" role="alert">{error}</p>}
              <button className="login-submit" type="submit" disabled={submitting || otp.length !== 6}>
                {submitting ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}
          {step === "password" && (
            <form onSubmit={handleResetPassword}>
              <label className="visually-hidden" htmlFor="forgot-password-new">New password</label>
              <input
                className="login-modal-input"
                id="forgot-password-new"
                type="password"
                name="newPassword"
                placeholder="New password"
                autoComplete="new-password"
                autoFocus
                required
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setError("");
                }}
              />
              <label className="visually-hidden" htmlFor="forgot-password-confirm">Confirm password</label>
              <input
                className="login-modal-input"
                id="forgot-password-confirm"
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
              />
              {error && <p className="captcha-error" role="alert">{error}</p>}
              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Reset Password"}
              </button>
            </form>
          )}
          <p className="login-register-prompt">
            <Link to={loginPath}>
              {step === "complete" ? "Click here to login" : "Back to login"}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;