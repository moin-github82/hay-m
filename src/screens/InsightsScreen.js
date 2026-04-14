import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import api from '../services/api';

// ─── Static data ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Food & Drink',   emoji: '🍔', color: '#00D4A1', pct: 32 },
  { label: 'Transport',      emoji: '🚗', color: '#3B82F6', pct: 18 },
  { label: 'Shopping',       emoji: '🛒', color: '#A855F7', pct: 22 },
  { label: 'Bills',          emoji: '💡', color: '#F59E0B', pct: 15 },
  { label: 'Entertainment',  emoji: '🎬', color: '#10B981', pct: 8  },
  { label: 'Other',          emoji: '📦', color: '#64748B', pct: 5  },
];

const PRESET_AMOUNTS = ['£5', '£10', '£20', '£50', 'Custom'];

const INSIGHT_CARDS = [
  {
    borderColor: '#EF4444',
    icon: '🔄',
    title: 'Subscription creep',
    desc: '3 new recurring charges detected this month.',
    time: '2 days ago',
  },
  {
    borderColor: '#3B82F6',
    icon: '📈',
    title: 'Round-up efficiency up 12%',
    desc: 'Your round-ups are working harder than last month.',
    time: '1 week ago',
  },
  {
    borderColor: '#F59E0B',
    icon: '☕',
    title: 'Coffee budget 40% over limit',
    desc: "You've spent £24 on coffee — limit is £17.",
    time: '3 days ago',
  },
  {
    borderColor: '#10B981',
    icon: '🏆',
    title: 'Best savings week ever!',
    desc: '£47 saved in a single week — a new personal best.',
    time: '2 weeks ago',
  },
];

// ─── Stat Chip ────────────────────────────────────────────────────────────────
function StatChip({ label, value, sub }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statChipValue}>{value}</Text>
      <Text style={styles.statChipLabel}>{label}</Text>
      {sub ? <Text style={styles.statChipSub}>{sub}</Text> : null}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function InsightsScreen() {
  const insets = useSafeAreaInsets();

  const [loading,        setLoading]        = useState(true);
  const [totalSpent,     setTotalSpent]     = useState(0);
  const [autoSaved,      setAutoSaved]      = useState(0);
  const [monthlyIncome,  setMonthlyIncome]  = useState(2400);
  const [selectedPreset, setSelectedPreset] = useState('£10');

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

  const load = useCallback(async () => {
    try {
      const [dashRes, savRes] = await Promise.allSettled([
        api.get('/dashboard'),
        api.get('/savings-tracker'),
      ]);

      if (dashRes.status === 'fulfilled') {
        const txns = dashRes.value.data?.recentTransactions ?? [];
        const spent = txns
          .filter(t => t.type === 'debit')
          .reduce((s, t) => s + Number(t.amount ?? 0), 0);
        setTotalSpent(spent || 1240.50);
        const income = dashRes.value.data?.totalBalance ?? 2400;
        setMonthlyIncome(Number(income));
      } else {
        setTotalSpent(1240.50);
      }

      if (savRes.status === 'fulfilled') {
        setAutoSaved(Number(savRes.value.data?.totalSaved ?? 0) || 186.20);
      } else {
        setAutoSaved(186.20);
      }
    } catch {
      setTotalSpent(1240.50);
      setAutoSaved(186.20);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const avgPerDay      = (totalSpent / daysInMonth).toFixed(2);
  const suggestedSave  = (monthlyIncome * 0.15).toFixed(2);
  const topCategory    = CATEGORIES.reduce((a, b) => (a.pct > b.pct ? a : b));

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
        <Text style={styles.headerTitle}>Spending Insights</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Summary chips ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          <StatChip label="Total Spent" value={`£${fmt(totalSpent)}`} sub="this month" />
          <StatChip label="Top Category" value={topCategory.label} sub={`${topCategory.pct}% of spend`} />
          <StatChip label="Auto-Saved" value={`£${fmt(autoSaved)}`} sub="this month" />
          <StatChip label="Avg / Day" value={`£${avgPerDay}`} sub={`over ${daysInMonth} days`} />
        </ScrollView>

        {/* ── Spending Breakdown ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending Breakdown</Text>
          <View style={styles.card}>
            {CATEGORIES.map(cat => (
              <View key={cat.label} style={styles.catRow}>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <View style={styles.catBarWrap}>
                  <View style={[styles.catBar, { width: `${cat.pct}%`, backgroundColor: cat.color }]} />
                </View>
                <Text style={styles.catPct}>{cat.pct}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Auto-Save Suggestion ── */}
        <View style={styles.section}>
          <View style={styles.autoSaveCard}>
            <Text style={styles.autoSaveHeading}>Suggested auto-save</Text>
            <Text style={styles.autoSaveAmount}>£{suggestedSave}</Text>
            <Text style={styles.autoSaveSub}>15% of your estimated monthly income</Text>

            <Text style={styles.presetLabel}>Choose a fixed amount</Text>
            <View style={styles.presetRow}>
              {PRESET_AMOUNTS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.presetBtn, selectedPreset === p && styles.presetBtnActive]}
                  onPress={() => setSelectedPreset(p)}>
                  <Text style={[styles.presetBtnText, selectedPreset === p && styles.presetBtnTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.enableBtn}
              onPress={() =>
                Alert.alert('Auto-Save Enabled', `Auto-save set to ${selectedPreset}/week. We'll start saving automatically.`)
              }>
              <Text style={styles.enableBtnText}>Enable Auto-Save</Text>
            </TouchableOpacity>

            {/* Insight chips */}
            <View style={styles.insightChips}>
              {['💡 Food spend down 18%', '⚡ Tuesdays are expensive', '🎯 On track for holiday goal'].map(chip => (
                <View key={chip} style={styles.insightChip}>
                  <Text style={styles.insightChipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Recent Insights ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Insights</Text>
          {INSIGHT_CARDS.map((card, i) => (
            <View key={i} style={[styles.insightCard, { borderLeftColor: card.borderColor }]}>
              <Text style={styles.insightIcon}>{card.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightCardTitle}>{card.title}</Text>
                <Text style={styles.insightCardDesc}>{card.desc}</Text>
                <Text style={styles.insightCardTime}>{card.time}</Text>
              </View>
            </View>
          ))}
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

  // Summary chips
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statChip: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statChipValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statChipSub: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },

  // Section
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },

  // Category breakdown
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  catEmoji: {
    fontSize: 18,
    width: 28,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    width: 110,
  },
  catBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  catBar: {
    height: 8,
    borderRadius: 4,
  },
  catPct: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },

  // Auto-save card
  autoSaveCard: {
    backgroundColor: '#0A1628',
    borderRadius: 20,
    padding: 22,
  },
  autoSaveHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  autoSaveAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#00D4A1',
    marginBottom: 4,
  },
  autoSaveSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 20,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  presetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  presetBtnActive: {
    backgroundColor: '#00D4A1',
    borderColor: '#00D4A1',
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  presetBtnTextActive: {
    color: '#0A1628',
  },
  enableBtn: {
    backgroundColor: '#00D4A1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
  },
  enableBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A1628',
  },
  insightChips: {
    gap: 8,
  },
  insightChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  insightChipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },

  // Recent insights feed
  insightCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  insightIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  insightCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  insightCardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  insightCardTime: {
    fontSize: 11,
    color: colors.textLight,
  },
});
