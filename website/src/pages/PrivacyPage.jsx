import React from 'react';
import { Link } from 'react-router-dom';
import HaymLogo from '../components/HaymLogo';
import PublicNavbar from '../components/PublicNavbar';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly, such as your name, email address, and financial data you enter into the app. We also collect usage data automatically, including device type, IP address, and interaction logs to improve our service.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use your data to provide and personalise the HAY-M service, process transactions, send account-related communications, and improve our platform. We do not sell your personal data to third parties.`,
  },
  {
    title: '3. Data Security',
    body: `We use industry-standard security measures including AES-256 encryption at rest, TLS in transit, and bcrypt password hashing. Your card details are never stored on our servers. We use tokenisation via our payment partners.`,
  },
  {
    title: '4. Cookies',
    body: `We use essential cookies required for authentication and session management. We do not use third-party advertising cookies. You can manage cookie preferences in your browser settings.`,
  },
  {
    title: '5. Data Sharing',
    body: `We share data only with trusted service providers necessary to deliver our service (e.g. payment processors, cloud infrastructure). All third parties are contractually bound to protect your data under GDPR-compliant terms.`,
  },
  {
    title: '6. Your Rights',
    body: `Under GDPR, you have the right to access, correct, or delete your personal data. You may also request data portability or object to processing. Contact us at privacy@hay-m.com to exercise any of these rights.`,
  },
  {
    title: '7. Data Retention',
    body: `We retain your data for as long as your account is active, or as required by law. Upon account deletion, personal data is removed within 30 days except where legal obligations require longer retention.`,
  },
  {
    title: '8. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice at least 14 days before they take effect.`,
  },
  {
    title: '9. Contact',
    body: `For any privacy-related questions or requests, contact our Data Protection Officer at privacy@hay-m.com or write to: HAY-M Ltd, 63 Finsbury Square, London EC11 1AA.`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FA' }}>
      <PublicNavbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0A1628,#1C3D6E)', padding: '72px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,212,161,.15)', border: '1.5px solid rgba(0,212,161,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 24px' }}>🔒</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 16 }}>Privacy Policy</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>Last updated: April 2026. We take your privacy seriously and are committed to protecting your personal data in accordance with UK GDPR.</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 80px' }}>
        {SECTIONS.map((s) => (
          <div key={s.title} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A1628', marginBottom: 12 }}>{s.title}</h2>
            <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8 }}>{s.body}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: 28, background: '#EFF6FF', borderRadius: 20, border: '1.5px solid #BFDBFE' }}>
          <p style={{ fontSize: 14, color: '#1E40AF', fontWeight: 600, marginBottom: 6 }}>Questions about your privacy?</p>
          <p style={{ fontSize: 14, color: '#3B82F6' }}>Email us at <a href="mailto:privacy@hay-m.com" style={{ color: '#1D4ED8', fontWeight: 700 }}>privacy@hay-m.com</a> and we'll respond within 5 business days.</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E2E8F0', padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
        <p>© 2026 HAY-M · <Link to="/" style={{ color: '#00D4A1', textDecoration: 'none', fontWeight: 600 }}>Back to Home</Link> · <Link to="/terms" style={{ color: '#00D4A1', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</Link></p>
      </div>
    </div>
  );
}
