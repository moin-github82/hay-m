import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import api from '../services/api';

const ISA_ALLOWANCE = 20000;

const CASH_ISA_BULLETS = [
  { text: 'FSCS protected up to £85k', tick: true  },
  { text: 'Instant access',             tick: true  },
  { text: 'No investment risk',         tick: true  },
  { text: 'Tax-free interest',          tick: true  },
];

const SS_ISA_BULLETS = [
  { text: 'Tax-free growth',                  tick: true  },
  { text: 'Invest in ETFs & funds',           tick: true  },
  { text: 'Long-term wealth building',        tick: true  },
  { text: 'Market risk applies',              tick: false },
];

const ISA_RULES = [
  { icon: '📅', text: 'Annual limit resets every April 6th' },
  { icon: '🚫', text: 'Can\'t exceed £20,000 across all ISAs' },
  { icon: '💡', text: 'Withdrawals don\'t restore allowance (unless it\'s a flexible ISA)' },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
function ISAProductCard({ accentColor, icon, name, rate, bullets, btnLabel, onPress }) {
  return (
    <View style={[styles.productCard, { borderLeftColor: accentColor }]}>
      <View style={styles.productCardHeader}>
        <Text style={styles.productIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.productName}>{name}</Text>
          <Text style={[styles.productRate, { color: accentColor }]}>{rate}</Text>
        </View>
      </View>
      {bullets.map((b, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.bulletMark, { color: b.tick ? '#10B981' : '#F59E0B' }]}>
            {b.tick ? '✓' : '⚠'}
          </Text>
          <Text style={styles.bulletText}>{b.text}</Text>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.productBtn, { backgroundColor: accentColor }]}
        onPress={onPress}>
        <Text style={styles.productBtnText}>{btnLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ISAScreen() {
  const insets = useSafeAreaInsets();

  const [loading,       setLoading]       = useState(true);
  const [totalSaved,    setTotalSaved]    = useState(0);
  const [investInput,   setInvestInput]   = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get('/savings-tracker');
      setTotalSaved(Number(res.data?.totalSaved ?? 0));
    } catch {
      setTotalSaved(3840);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const usedAmount  = Math.min(totalSaved, ISA_ALLOWANCE);
  const remaining   = ISA_ALLOWANCE - usedAmount;
  const usedPct     = (usedAmount / ISA_ALLOWANCE) * 100;

  const parsedInput = parseFloat(investInput) || 0;
  const taxSaved    = parsedInput * 0.20;
  const fiveYear    = parsedInput * Math.pow(1.07, 5);

  const fmt = n =>
    Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ISA Accounts</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🏦</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Allowance Hero ── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Annual ISA Allowance</Text>
          <Text style={styles.heroAmount}>£20,000</Text>

          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroStatLabel}>Used</Text>
              <Text style={styles.heroStatValue}>£{fmt(usedAmount)}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={styles.heroStatLabel}>Remaining</Text>
              <Text style={[styles.heroStatValue, { color: '#00D4A1' }]}>£{fmt(remaining)}</Text>
            </View>
          </View>

          <View style={styles.progressBarWrap}>
            <View style={[styles.progressBarFill, { width: `${Math.min(usedPct, 100)}%` }]} />
          </View>

          <Text style={styles.heroReset}>Allowance resets 6 April 2027</Text>
        </View>

        {/* ── Product Cards ── */}
        <View style={styles.section}>
          <ISAProductCard
            accentColor="#10B981"
            icon="🏦"
            name="Cash ISA"
            rate="4.5% AER"
            bullets={CASH_ISA_BULLETS}
            btnLabel="Open Cash ISA"
            onPress={() => Alert.alert('Coming Soon', 'Coming Soon — join our waitlist!')}
          />

          <ISAProductCard
            accentColor="#3B82F6"
            icon="📈"
            name="Stocks & Shares ISA"
            rate="7–12% potential return"
            bullets={SS_ISA_BULLETS}
            btnLabel="Open S&S ISA"
            onPress={() => Alert.alert('Coming Soon', 'Coming Soon — join our waitlist!')}
          />
        </View>

        {/* ── Tax Calculator ── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tax Savings Calculator</Text>
            <Text style={styles.cardSub}>See how much tax you save by investing in an ISA</Text>

            <View style={styles.inputRow}>
              <Text style={styles.inputPrefix}>£</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter investment amount"
                placeholderTextColor={colors.textLight}
                value={investInput}
                onChangeText={setInvestInput}
              />
            </View>

            {parsedInput > 0 && (
              <View style={styles.calcResults}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Tax saved (20% relief)</Text>
                  <Text style={styles.calcValue}>£{fmt(taxSaved)}</Text>
                </View>
                <View style={[styles.calcRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.calcLabel}>Projected 5-yr value (7%)</Text>
                  <Text style={[styles.calcValue, { color: '#10B981' }]}>£{fmt(fiveYear)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── ISA Rules ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ISA Rules</Text>
          <View style={styles.card}>
            {ISA_RULES.map((rule, i) => (
              <View key={i} style={[styles.ruleRow, i < ISA_RULES.length - 1 && styles.ruleRowBorder]}>
                <Text style={styles.ruleIcon}>{rule.icon}</Text>
                <Text style={styles.ruleText}>{rule.text}</Text>
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

  // Hero card
  heroCard: {
    backgroundColor: '#0A1628',
    margin: 16,
    borderRadius: 20,
    padding: 22,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarWrap: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#00D4A1',
    borderRadius: 4,
  },
  heroReset: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },

  // Section
  section: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },

  // Product card
  productCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  productCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  productIcon: {
    fontSize: 28,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  productRate: {
    fontSize: 14,
    fontWeight: '600',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  bulletMark: {
    fontSize: 14,
    fontWeight: '700',
    width: 18,
  },
  bulletText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  productBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  productBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Card (generic)
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },

  // Tax calculator
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  calcResults: {
    backgroundColor: colors.background,
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  calcLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

  // ISA rules
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  ruleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ruleIcon: {
    fontSize: 18,
    width: 24,
  },
  ruleText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
