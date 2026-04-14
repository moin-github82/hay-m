import React from 'react';
import { Link } from 'react-router-dom';
import HaymLogo from '../components/HaymLogo';
import PublicNavbar from '../components/PublicNavbar';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using the HAY-M application or website, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use our services.`,
  },
  {
    title: '2. Eligibility',
    body: `You must be at least 18 years old and a UK resident to use HAY-M. By creating an account, you confirm that you meet these requirements and that all information you provide is accurate and up to date.`,
  },
  {
    title: '3. Account Responsibility',
    body: `You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately at support@hay-m.com if you suspect unauthorised access.`,
  },
  {
    title: '4. Services',
    body: `HAY-M provides micro-savings, goal-based savings, round-up automation, and investment portfolio tracking tools. These are financial management tools only. HAY-M is not a regulated financial adviser and nothing on this platform constitutes financial advice.`,
  },
  {
    title: '5. Payments and Fees',
    body: `HAY-M is currently free to use during the beta period. We reserve the right to introduce subscription tiers in the future with at least 30 days' notice. All amounts displayed are in GBP unless otherwise stated.`,
  },
  {
    title: '6. Prohibited Conduct',
    body: `You agree not to misuse the platform, including attempting to access other users' data, performing automated scraping, introducing malware, or using the platform for unlawful purposes. Violation may result in immediate account suspension.`,
  },
  {
    title: '7. Intellectual Property',
    body: `All content, branding, code, and design of HAY-M are owned by HAY-M Ltd. You may not reproduce, distribute, or create derivative works without prior written consent.`,
  },
  {
    title: '8. Disclaimers',
    body: `The service is provided "as is" without warranties of any kind. HAY-M does not guarantee uninterrupted availability. Investment values can go down as well as up. Past performance is not indicative of future results.`,
  },
  {
    title: '9. Limitation of Liability',
    body: `To the fullest extent permitted by law, HAY-M Ltd shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid us in the last 12 months.`,
  },
  {
    title: '10. Termination',
    body: `We may suspend or terminate your account if you breach these terms. You may close your account at any time by contacting support@hay-m.com. Sections 7, 8, and 9 survive termination.`,
  },
  {
    title: '11. Governing Law',
    body: `These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    title: '12. Changes to Terms',
    body: `We may update these Terms at any time. We will notify you of material changes at least 14 days in advance. Continued use of the platform after changes constitutes acceptance of the updated Terms.`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FA' }}>
      <PublicNavbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#0A1628,#1C3D6E)', padding: '72px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(0,212,161,.15)', border: '1.5px solid rgba(0,212,161,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 24px' }}>📄</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 16 }}>Terms of Service</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>Last updated: April 2026. Please read these terms carefully before using the HAY-M platform.</p>
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

        <div style={{ marginTop: 48, padding: 28, background: '#FFF7ED', borderRadius: 20, border: '1.5px solid #FED7AA' }}>
          <p style={{ fontSize: 14, color: '#92400E', fontWeight: 600, marginBottom: 6 }}>Questions about these Terms?</p>
          <p style={{ fontSize: 14, color: '#B45309' }}>Email us at <a href="mailto:legal@hay-m.com" style={{ color: '#92400E', fontWeight: 700 }}>legal@hay-m.com</a> and we'll respond within 5 business days.</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E2E8F0', padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
        <p>© 2026 HAY-M · <Link to="/" style={{ color: '#00D4A1', textDecoration: 'none', fontWeight: 600 }}>Back to Home</Link> · <Link to="/privacy" style={{ color: '#00D4A1', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link></p>
      </div>
    </div>
  );
}
