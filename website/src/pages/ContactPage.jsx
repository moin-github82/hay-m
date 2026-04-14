import React, { useState } from "react";
import { Link } from "react-router-dom";
import HaymLogo from "../components/HaymLogo";
import PublicNavbar from "../components/PublicNavbar";

const CONTACT_OPTIONS = [
  {
    icon: "💬",
    title: "Live Chat",
    desc: "Chat with our support team in real time. Available Mon–Fri, 9am–6pm GMT.",
    action: "Start Chat",
    color: "#00D4A1",
    bg: "#D1FAE5",
    href: null,
  },
  {
    icon: "📧",
    title: "Email Support",
    desc: "Send us a message and we'll get back to you within 24 hours.",
    action: "support@hay-m.com",
    color: "#3B82F6",
    bg: "#DBEAFE",
    href: "mailto:support@hay-m.com",
  },
  {
    icon: "📞",
    title: "Phone",
    desc: "Speak directly with a member of our team. Mon–Fri, 9am–5pm GMT.",
    action: "+44 20 1234 5678",
    color: "#A855F7",
    bg: "#EDE9FE",
    href: "tel:+442012345678",
  },
  {
    icon: "🐦",
    title: "Twitter / X",
    desc: "Reach us on social media for quick queries and updates.",
    action: "@HAYMApp",
    color: "#1DA1F2",
    bg: "#DBEAFE",
    href: "https://twitter.com/",
  },
];

const FAQS = [
  {
    q: "How do round-ups work?",
    a: "Every time you make a purchase, HAY-M rounds up the transaction to the nearest pound and saves the difference automatically into your micro-savings pot.",
  },
  {
    q: "Is my money safe?",
    a: "Yes. We use bank-grade JWT authentication, bcrypt encryption, and secure storage. Your card details are never stored on our servers.",
  },
  {
    q: "Can I withdraw my micro-savings?",
    a: "Absolutely. You can transfer your micro-savings to a linked card at any time from the Savings page.",
  },
  {
    q: "How do I add a new card?",
    a: 'Go to the Wallet page, click "Add Card", and enter your card details. We support both debit and credit cards.',
  },
  {
    q: "What currencies are supported?",
    a: "HAY-M currently supports GBP (£) across all features including micro-savings, portfolio, and wallet balances. Multi-currency support is coming soon.",
  },
  {
    q: "How do I delete my account?",
    a: "Please contact our support team via email or live chat and we'll process your request within 2 business days.",
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #F1F5F9" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          textAlign: "left",
          padding: "18px 0",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0A1628" }}>
          {faq.q}
        </span>
        <span
          style={{
            fontSize: 20,
            color: "#00D4A1",
            flexShrink: 0,
            transition: "transform .2s",
            transform: open ? "rotate(45deg)" : "rotate(0)",
          }}
        >
          ＋
        </span>
      </button>
      {open && (
        <p
          style={{
            fontSize: 14,
            color: "#64748B",
            lineHeight: 1.7,
            paddingBottom: 18,
            marginTop: -4,
          }}
        >
          {faq.a}
        </p>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending (replace with real API call if backend supports it)
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA" }}>
      <PublicNavbar />

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(135deg,#0A1628,#1C3D6E)",
          padding: "72px 24px 60px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "rgba(0,212,161,.15)",
              border: "1.5px solid rgba(0,212,161,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              margin: "0 auto 24px",
            }}
          >
            📬
          </div>
          <h1
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: -1,
              marginBottom: 16,
            }}
          >
            We're here to help
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,.6)",
              lineHeight: 1.6,
            }}
          >
            Got a question? Our friendly team is always happy to chat. Choose
            the method that works best for you.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        {/* Contact options grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 20,
            marginBottom: 64,
          }}
        >
          {CONTACT_OPTIONS.map((opt) => (
            <div
              key={opt.title}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 28,
                boxShadow: "0 2px 12px rgba(0,0,0,.06)",
                border: "1.5px solid #F1F5F9",
                transition: "transform .2s, box-shadow .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)";
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: opt.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                {opt.icon}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0A1628",
                  marginBottom: 8,
                }}
              >
                {opt.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                {opt.desc}
              </p>
              {opt.href ? (
                <a
                  href={opt.href}
                  target={opt.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: opt.color,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  {opt.action} →
                </a>
              ) : (
                <button
                  style={{
                    background: opt.color,
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {opt.action}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="contact-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}
        >
          {/* Contact form */}
          <div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#0A1628",
                marginBottom: 6,
              }}
            >
              Send us a message
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28 }}>
              Fill in the form and we'll get back to you within 24 hours.
            </p>

            {sent ? (
              <div
                style={{
                  background: "#D1FAE5",
                  border: "1.5px solid #6EE7B7",
                  borderRadius: 20,
                  padding: 32,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#065F46",
                    marginBottom: 8,
                  }}
                >
                  Message sent!
                </h3>
                <p style={{ color: "#047857", fontSize: 14 }}>
                  Thanks for reaching out. We'll reply to{" "}
                  <strong>{form.email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  style={{
                    marginTop: 20,
                    background: "#065F46",
                    color: "#fff",
                    border: "none",
                    padding: "10px 24px",
                    borderRadius: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 28,
                  boxShadow: "0 2px 12px rgba(0,0,0,.06)",
                  border: "1.5px solid #F1F5F9",
                }}
              >
                <div
                  className="contact-name-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-input"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, subject: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select a topic…</option>
                    <option value="account">Account & Login</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="cards">Cards & Wallet</option>
                    <option value="savings">Savings & Goals</option>
                    <option value="portfolio">Portfolio & Investments</option>
                    <option value="bug">Report a Bug</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, message: e.target.value }))
                    }
                    required
                    style={{ resize: "vertical", minHeight: 120 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                  style={{
                    height: 52,
                    fontWeight: 700,
                    borderRadius: 14,
                    fontSize: 15,
                  }}
                >
                  {loading ? "Sending…" : "Send Message →"}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: "#0A1628",
                marginBottom: 6,
              }}
            >
              Frequently asked
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28 }}>
              Quick answers to common questions.
            </p>
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "8px 24px",
                boxShadow: "0 2px 12px rgba(0,0,0,.06)",
                border: "1.5px solid #F1F5F9",
              }}
            >
              {FAQS.map((faq, i) => (
                <FAQItem key={i} faq={faq} />
              ))}
            </div>
          </div>
        </div>

        {/* Office / Hours info */}
        <div
          style={{
            marginTop: 64,
            background: "linear-gradient(135deg,#0A1628,#1C3D6E)",
            borderRadius: 24,
            padding: 40,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 32,
          }}
        >
          {[
            { icon: "📍", label: "Office", val: "63 \nLondon, EC11 1AA" },
            {
              icon: "🕐",
              label: "Support Hours",
              val: "Mon–Fri: 9am–6pm GMT\nSat: 10am–2pm GMT",
            },
            {
              icon: "⚡",
              label: "Response Time",
              val: "Live chat: < 2 min\nEmail: < 24 hours",
            },
            {
              icon: "🌍",
              label: "Availability",
              val: "App: 24/7\nSupport: See hours",
            },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
              <p
                style={{
                  color: "rgba(255,255,255,.45)",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                }}
              >
                {item.val}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #E2E8F0",
          padding: "24px",
          textAlign: "center",
          color: "#94A3B8",
          fontSize: 13,
        }}
      >
        <p>
          © 2026 HAY-M ·{" "}
          <Link
            to="/"
            style={{
              color: "#00D4A1",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
