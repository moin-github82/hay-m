import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// ─── Static data ──────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Free',
    price: '£0/mo',
    highlight: false,
    badge: null,
    features: [
      { label: 'Basic savings account',     included: true  },
      { label: '1 savings goal',            included: true  },
      { label: 'Investment access',         included: false },
      { label: 'ISA wrapper',               included: false },
      { label: 'Spending insights',         included: false },
    ],
  },
  {
    name: 'Plus',
    price: '£3/mo',
    highlight: true,
    badge: 'Most Popular',
    features: [
      { label: 'Unlimited savings goals',   included: true },
      { label: 'Investment access',         included: true },
      { label: 'ISA wrapper',               included: true },
      { label: 'Spending insights',         included: true },
      { label: 'AI auto-save',              included: false },
    ],
  },
  {
    name: 'Pro',
    price: '£7/mo',
    highlight: false,
    badge: null,
    features: [
      { label: 'Everything in Plus',        included: true },
      { label: 'AI auto-save',              included: true },
      { label: 'Priority support',          included: true },
      { label: 'Early access features',     included: true },
      { label: 'Advanced analytics',        included: true },
    ],
  },
];

const FEE_ROWS = [
  { service: 'Account opening',           fee: 'Free',        paid: false },
  { service: 'Monthly — Free plan',       fee: '£0',          paid: false },
  { service: 'Monthly — Plus',            fee: '£3',          paid: true  },
  { service: 'Monthly — Pro',             fee: '£7',          paid: true  },
  { service: 'Investment management',     fee: '0.25%/yr',    paid: true  },
  { service: 'Fund fees',                 fee: '0.10–0.22%/yr', paid: true },
  { service: 'ISA wrapper',               fee: 'Free on Plus+', paid: false },
  { service: 'Withdrawals',               fee: 'Free',        paid: false },
  { service: 'Card top-ups',              fee: 'Free',        paid: false },
  { service: 'Foreign transactions',      fee: '0% — we absorb it', paid: false },
];

const FAQS = [
  {
    q: 'Are there hidden fees?',
    a: 'No. Every cost is listed on this page. We don\'t charge for withdrawals, transfers in, or account maintenance beyond the monthly plan fee.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'You can cancel anytime with no penalty. Your savings remain accessible and your account drops to the Free tier automatically at the next billing cycle.',
  },
  {
    q: 'Is my money FSCS protected?',
    a: 'Cash held in your savings account is FSCS protected up to £85,000 per person. Investments in stocks and shares are not covered by FSCS but are held in a ring-fenced account separate from HAY-M\'s own assets.',
  },
  {
    q: 'How does the 0.25% investment fee work?',
    a: 'The 0.25% annual management fee is charged monthly (0.0208%/month) on your average invested balance. For example, £1,000 invested costs roughly £2.08 per month.',
  },
];

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan }) {
  return (
    <View style={[styles.planCard, plan.highlight && styles.planCardHighlight]}>
      {plan.badge && (
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>{plan.badge}</Text>
        </View>
      )}
      <Text style={[styles.planName, plan.highlight && { color: colors.primary }]}>{plan.name}</Text>
      <Text style={styles.planPrice}>{plan.price}</Text>
      {plan.features.map((f, i) => (
        <View key={i} style={styles.featureRow}>
          <Text style={[styles.featureMark, { color: f.included ? '#10B981' : '#CBD5E1' }]}>
            {f.included ? '✓' : '✗'}
          </Text>
          <Text style={[styles.featureText, !f.included && { color: colors.textLight }]}>
            {f.label}
          </Text>
        </View>
      ))}
      <TouchableOpacity style={[styles.planBtn, plan.highlight && styles.planBtnHighlight]}>
        <Text style={[styles.planBtnText, plan.highlight && { color: '#0A1628' }]}>
          Choose Plan
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── FAQ Row ──────────────────────────────────────────────────────────────────
function FAQRow({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqHeader} onPress={() => setOpen(v => !v)}>
        <Text style={styles.faqQuestion}>{q}</Text>
        <Text style={styles.faqChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.faqBody}>
          <Text style={styles.faqAnswer}>{a}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function FeesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fees & Pricing</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerIconText}>💷</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Pricing Tiers ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your plan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 12, paddingBottom: 4 }}>
            {PLANS.map(plan => <PlanCard key={plan.name} plan={plan} />)}
          </ScrollView>
        </View>

        {/* ── Fee Breakdown ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What you'll pay — in plain English</Text>
          <View style={styles.card}>
            {FEE_ROWS.map((row, i) => (
              <View key={i} style={[styles.feeRow, { backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }]}>
                <Text style={styles.feeService}>{row.service}</Text>
                <Text style={[styles.feeFee, { color: row.paid ? '#0A1628' : '#00D4A1' }]}>
                  {row.fee}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── FAQ ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.card}>
            {FAQS.map((faq, i) => (
              <View key={i}>
                <FAQRow q={faq.q} a={faq.a} />
                {i < FAQS.length - 1 && <View style={styles.faqDivider} />}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 18,
  },

  // Section
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },

  // Plan card
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  planCardHighlight: {
    borderWidth: 2,
    borderColor: '#00D4A1',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#00D4A1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A1628',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
    gap: 8,
  },
  featureMark: {
    fontSize: 13,
    fontWeight: '700',
    width: 16,
  },
  featureText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  planBtn: {
    marginTop: 14,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  planBtnHighlight: {
    backgroundColor: '#00D4A1',
    borderColor: '#00D4A1',
  },
  planBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },

  // Card (generic)
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Fee breakdown rows
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  feeService: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  feeFee: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  // FAQ
  faqItem: {
    paddingVertical: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    paddingRight: 12,
  },
  faqChevron: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  faqDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
});
