import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import HaymLogo from "../components/HaymLogo";
import PublicNavbar from "../components/PublicNavbar";

/* ─────────────────────────────────────────────────────────────────
   GOOGLE FORMS CONFIGURATION
   ─────────────────────────────────────────────────────────────────
   Steps to connect your Google Form:
   1. Go to https://forms.google.com and create a form with 4 questions:
        Q1: "Full Name"          → Short answer
        Q2: "Email Address"      → Short answer
        Q3: "Phone Number"       → Short answer  (mark optional)
        Q4: "Your Feedback"      → Paragraph
   2. Click the 3-dot menu → "Get pre-filled link"
   3. Fill one answer in each field, click "Get Link"
   4. From the copied URL extract each  entry.XXXXXXXXXX  number
   5. Replace the four ENTRY_* constants below with your real numbers
   6. Replace GOOGLE_FORM_ID with your form's ID (the long string in its URL)
   ───────────────────────────────────────────────────────────────── */
const GOOGLE_FORM_ID =
  "1FAIpQLSfD_s-UdkzHyDNXDjzSHZftPYo1vcGPWhkLvu1TGF9efXEVzQ"; // e.g. 1FAIpQLSe…
const ENTRY_NAME = "entry.477619452"; // replace
const ENTRY_EMAIL = "entry.1946194676"; // replace
const ENTRY_PHONE = "entry.1142470548"; // replace
const ENTRY_FEEDBACK = "entry.2125794671"; // replace

const FORM_ACTION = `https://docs.google.com/forms/d/e/1FAIpQLSfD_s-UdkzHyDNXDjzSHZftPYo1vcGPWhkLvu1TGF9efXEVzQ/formResponse`;

const MAX_WORDS = 500;

function countWords(text) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function SurveyPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    feedback: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const iframeRef = useRef(null);

  const wordCount = countWords(form.feedback);
  const wordPct = Math.min((wordCount / MAX_WORDS) * 100, 100);
  const wordColor =
    wordCount > MAX_WORDS ? "#EF4444" : wordCount > 80 ? "#F59E0B" : "#00D4A1";

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address";
    if (form.phone && !/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone.trim()))
      e.phone = "Enter a valid phone number";
    if (!form.feedback.trim()) e.feedback = "Please share your thoughts";
    else if (wordCount > MAX_WORDS)
      e.feedback = `Please keep it under ${MAX_WORDS} words (${wordCount} used)`;
    return e;
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field])
      setErrors((e) => {
        const n = { ...e };
        delete n[field];
        return n;
      });
  }

  function handleFeedbackChange(val) {
    // Hard-stop at MAX_WORDS: allow editing within words but block new words beyond limit
    const words = val.trim() === "" ? [] : val.trim().split(/\s+/);
    if (words.length <= MAX_WORDS || val.length < form.feedback.length) {
      handleChange("feedback", val);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    // Build hidden form and submit into hidden iframe (avoids CORS)
    const params = new URLSearchParams({
      [ENTRY_NAME]: form.name.trim(),
      [ENTRY_EMAIL]: form.email.trim(),
      [ENTRY_PHONE]: form.phone.trim(),
      [ENTRY_FEEDBACK]: form.feedback.trim(),
    });

    // Create and submit a hidden form targeting the hidden iframe
    const hiddenForm = document.createElement("form");
    hiddenForm.method = "POST";
    hiddenForm.action = FORM_ACTION;
    hiddenForm.target = "hidden-iframe";
    hiddenForm.style.display = "none";

    params.forEach((val, key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = val;
      hiddenForm.appendChild(input);
    });

    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    document.body.removeChild(hiddenForm);

    // Show success after a short delay (Google Forms doesn't send a CORS response)
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        background: "#F5F7FA",
      }}
    >
      {/* Hidden iframe for Google Forms submission */}
      <iframe
        ref={iframeRef}
        name="hidden-iframe"
        title="survey-submit"
        style={{ display: "none" }}
      />

      <PublicNavbar />

      {/* Hero */}
      <div
        style={{
          background:
            "linear-gradient(145deg,#0A1628 0%,#1C3D6E 60%,#064E3B 100%)",
          padding: "72px 5% 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[
          { s: 500, x: "75%", y: "-20%", o: 0.04 },
          { s: 350, x: "-5%", y: "50%", o: 0.03 },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: c.s,
              height: c.s,
              borderRadius: "50%",
              background: "#00D4A1",
              left: c.x,
              top: c.y,
              opacity: c.o,
              pointerEvents: "none",
            }}
          />
        ))}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,212,161,.12)",
              border: "1px solid rgba(0,212,161,.3)",
              borderRadius: 20,
              padding: "6px 16px",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00D4A1",
                display: "block",
              }}
            />
            <span style={{ color: "#00D4A1", fontSize: 13, fontWeight: 600 }}>
              2 minutes · Anonymous option available
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(30px,5vw,52px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -1.5,
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Help us build
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#00D4A1,#3B82F6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              a better HAY-M
            </span>
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,.6)",
              fontSize: 17,
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Your feedback directly shapes our roadmap. Tell us what you love,
            what's missing, and what you'd like to see next.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div
        style={{ maxWidth: 640, margin: "-40px auto 60px", padding: "0 5%" }}
      >
        {submitted ? (
          /* ── Success state ── */
          <div
            style={{
              background: "#fff",
              borderRadius: 28,
              padding: "56px 40px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,.1)",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#00D4A1,#00A87F)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                margin: "0 auto 24px",
                boxShadow: "0 12px 32px rgba(0,212,161,.35)",
              }}
            >
              🎉
            </div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#0A1628",
                marginBottom: 12,
              }}
            >
              Thank you!
            </h2>
            <p
              style={{
                color: "#64748B",
                fontSize: 16,
                lineHeight: 1.7,
                maxWidth: 380,
                margin: "0 auto 32px",
              }}
            >
              Your feedback has been saved. We read every response and use it to
              prioritise what we build next.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/"
                style={{
                  background: "linear-gradient(135deg,#00D4A1,#00A87F)",
                  color: "#fff",
                  padding: "13px 28px",
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(0,212,161,.3)",
                }}
              >
                Back to Home
              </Link>
              <Link
                to="/signup"
                style={{
                  background: "#F5F7FA",
                  color: "#0A1628",
                  padding: "13px 28px",
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                  border: "1.5px solid #E2E8F0",
                }}
              >
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          /* ── Survey form ── */
          <form onSubmit={handleSubmit} noValidate>
            <div
              style={{
                background: "#fff",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,.1)",
              }}
            >
              {/* Progress header */}
              <div
                style={{
                  background: "linear-gradient(135deg,#0A1628,#1C3D6E)",
                  padding: "20px 32px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: "rgba(255,255,255,.5)",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    HAY-M App Survey · 2026
                  </p>
                  <p style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>
                    Share your thoughts with the team
                  </p>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(0,212,161,.15)",
                    border: "2px solid rgba(0,212,161,.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  📋
                </div>
              </div>

              {/* Fields */}
              <div style={{ padding: "32px 32px 28px" }}>
                {/* Name */}
                <Field
                  label="Full Name"
                  required
                  error={errors.name}
                  hint="First and last name"
                >
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    style={inputStyle(!!errors.name)}
                  />
                </Field>

                {/* Email */}
                <Field
                  label="Email Address"
                  required
                  error={errors.email}
                  hint="We'll only use this if we need to follow up"
                >
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    style={inputStyle(!!errors.email)}
                  />
                </Field>

                {/* Phone (optional) */}
                <Field
                  label="Phone Number"
                  badge="Optional"
                  error={errors.phone}
                  hint="Include country code, e.g. +44 7700 900000"
                >
                  <input
                    type="tel"
                    placeholder="+44 7700 900000"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    style={inputStyle(!!errors.phone)}
                  />
                </Field>

                {/* Feedback textarea */}
                <Field
                  label="What would you like to see in HAY-M?"
                  required
                  error={errors.feedback}
                  hint="Feature requests, pain points, improvements — anything goes"
                >
                  <div style={{ position: "relative" }}>
                    <textarea
                      placeholder="e.g. I'd love a bill-splitting feature so I can share expenses with flatmates automatically..."
                      value={form.feedback}
                      onChange={(e) => handleFeedbackChange(e.target.value)}
                      rows={5}
                      style={{
                        ...inputStyle(!!errors.feedback),
                        resize: "vertical",
                        minHeight: 130,
                        paddingBottom: 36,
                        lineHeight: 1.6,
                      }}
                    />
                    {/* Word count bar */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 12,
                        right: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color:
                              wordCount > MAX_WORDS ? "#EF4444" : "#94A3B8",
                          }}
                        >
                          {wordCount} / {MAX_WORDS} words
                        </span>
                        {wordCount > 0 && wordCount <= MAX_WORDS && (
                          <span style={{ fontSize: 11, color: "#94A3B8" }}>
                            {MAX_WORDS - wordCount} remaining
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          height: 3,
                          borderRadius: 4,
                          background: "#F1F5F9",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${wordPct}%`,
                            background: wordColor,
                            borderRadius: 4,
                            transition: "width .2s,background .2s",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Field>

                {/* Privacy note */}
                <p
                  style={{
                    fontSize: 12,
                    color: "#94A3B8",
                    lineHeight: 1.6,
                    marginBottom: 28,
                    padding: "12px 14px",
                    background: "#F8FAFC",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  🔒 Your responses are stored securely in Google Forms and are
                  only seen by the HAY-M team. We never sell or share your data.
                  See our{" "}
                  <Link
                    to="/privacy"
                    style={{
                      color: "#00D4A1",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: 14,
                    background: submitting
                      ? "#94A3B8"
                      : "linear-gradient(135deg,#00D4A1,#00A87F)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 16,
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: submitting
                      ? "none"
                      : "0 8px 24px rgba(0,212,161,.35)",
                    transition: "all .2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting)
                      e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {submitting ? (
                    <>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          border: "2.5px solid rgba(255,255,255,.4)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Submitting…
                    </>
                  ) : (
                    <>📩 Submit Feedback</>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Back link */}
        {!submitted && (
          <p
            style={{
              textAlign: "center",
              marginTop: 20,
              color: "#94A3B8",
              fontSize: 13,
            }}
          >
            <Link
              to="/"
              style={{
                color: "#00D4A1",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ← Back to homepage
            </Link>
          </p>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "#060E1A",
          padding: "32px 5%",
          borderTop: "1px solid rgba(255,255,255,.06)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginBottom: 16,
          }}
        >
          {[
            ["Privacy", "/privacy"],
            ["Terms", "/terms"],
            ["Contact", "/contact"],
          ].map(([l, href]) => (
            <Link
              key={l}
              to={href}
              style={{
                color: "rgba(255,255,255,.35)",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#00D4A1")}
              onMouseLeave={(e) =>
                (e.target.style.color = "rgba(255,255,255,.35)")
              }
            >
              {l}
            </Link>
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,.2)", fontSize: 12 }}>
          © 2026 HAY-M. All rights reserved.
        </p>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ── Reusable field wrapper ── */
function Field({ label, required, badge, error, hint, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 7,
        }}
      >
        <label style={{ fontSize: 14, fontWeight: 700, color: "#0A1628" }}>
          {label}
          {required && (
            <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>
          )}
        </label>
        {badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#64748B",
              background: "#F1F5F9",
              padding: "2px 8px",
              borderRadius: 6,
              border: "1px solid #E2E8F0",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {hint && (
        <p
          style={{
            fontSize: 12,
            color: "#94A3B8",
            marginBottom: 7,
            marginTop: -3,
          }}
        >
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p
          style={{
            fontSize: 12,
            color: "#EF4444",
            marginTop: 5,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function inputStyle(hasError) {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 12,
    border: `1.5px solid ${hasError ? "#FCA5A5" : "#E2E8F0"}`,
    background: hasError ? "#FFF5F5" : "#F8FAFC",
    fontSize: 15,
    color: "#0A1628",
    outline: "none",
    transition: "border .2s, box-shadow .2s",
    fontFamily: "Inter, sans-serif",
  };
}
