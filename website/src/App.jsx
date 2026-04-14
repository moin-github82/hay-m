import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import UpgradePage from './pages/UpgradePage';
import LandingPage         from './pages/LandingPage';
import LoginPage           from './pages/LoginPage';
import SignupPage          from './pages/SignupPage';
import Layout              from './components/Layout';
import DashboardPage       from './pages/DashboardPage';
import WalletPage          from './pages/WalletPage';
import GoalsPage           from './pages/GoalsPage';
import SavingsTrackerPage  from './pages/SavingsTrackerPage';
import PortfolioPage       from './pages/PortfolioPage';
import TransactionsPage    from './pages/TransactionsPage';
import ContactPage         from './pages/ContactPage';
import PrivacyPage         from './pages/PrivacyPage';
import TermsPage           from './pages/TermsPage';
import InvestmentPage      from './pages/InvestmentPage';
import SurveyPage          from './pages/SurveyPage';
import InsightsPage        from './pages/InsightsPage';
import ISAPage             from './pages/ISAPage';
import FeesPage            from './pages/FeesPage';
import NotificationsPage   from './pages/NotificationsPage';
import SettingsPage        from './pages/SettingsPage';
import OnboardingPage       from './pages/OnboardingPage';
import ForgotPasswordPage  from './pages/ForgotPasswordPage';
import ResetPasswordPage   from './pages/ResetPasswordPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PlanRoute({ minPlan, children }) {
  const { user } = useAuth();
  const PLAN_RANK = { free: 0, plus: 1, pro: 2 };
  const hasAccess = (PLAN_RANK[user?.plan] ?? 0) >= (PLAN_RANK[minPlan] ?? 0);
  if (!hasAccess) return <Navigate to={`/upgrade?required=${minPlan}`} replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<LandingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms"   element={<TermsPage />} />
      <Route path="/survey"  element={<SurveyPage />} />
      <Route path="/fees"    element={<FeesPage />} />
      <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup"          element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/upgrade"    element={<PrivateRoute><UpgradePage /></PrivateRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

      {/* Protected — wrapped in sidebar Layout */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard"      element={<DashboardPage />} />
        <Route path="wallet"         element={<WalletPage />} />
        <Route path="investment"     element={<PlanRoute minPlan="plus"><InvestmentPage /></PlanRoute>} />
        <Route path="goals"          element={<GoalsPage />} />
        <Route path="savings"        element={<SavingsTrackerPage />} />
        <Route path="portfolio"      element={<PlanRoute minPlan="plus"><PortfolioPage /></PlanRoute>} />
        <Route path="transactions"   element={<TransactionsPage />} />
        <Route path="insights"       element={<PlanRoute minPlan="plus"><InsightsPage /></PlanRoute>} />
        <Route path="isa"            element={<PlanRoute minPlan="plus"><ISAPage /></PlanRoute>} />
        <Route path="notifications"  element={<PlanRoute minPlan="plus"><NotificationsPage /></PlanRoute>} />
        <Route path="settings"       element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
