import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const PLAN_RANK = { free: 0, plus: 1, pro: 2 };

const MENU_ITEMS = [
  { name: 'Insights',      icon: '🔍', screen: 'Insights',      minPlan: 'plus', desc: 'Spending analysis & auto-save',     accent: '#00D4A1', bg: '#E0FFF8' },
  { name: 'ISA Accounts',  icon: '🏦', screen: 'ISA',           minPlan: 'plus', desc: 'Tax-efficient savings accounts',    accent: '#3B82F6', bg: '#DBEAFE' },
  { name: 'Fees',          icon: '💷', screen: 'Fees',          minPlan: 'free', desc: 'Transparent pricing & plans',       accent: '#10B981', bg: '#D1FAE5' },
  { name: 'Notifications', icon: '🔔', screen: 'Notifications', minPlan: 'plus', desc: 'Alerts & milestone settings',       accent: '#A855F7', bg: '#F3E8FF' },
];

export default function MoreMenuScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const hasAccess = (min) =>
    (PLAN_RANK[user?.plan] ?? 0) >= (PLAN_RANK[min] ?? 0);

  const plan = user?.plan || 'free';

  const planBadgeBg =
    plan === 'pro' ? '#A855F7' : plan === 'plus' ? '#00D4A1' : '#64748B';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Plan badge card ── */}
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Your Plan</Text>
          <View style={[styles.planBadge, { backgroundColor: planBadgeBg }]}>
            <Text style={styles.planBadgeText}>{plan.toUpperCase()}</Text>
          </View>
          {plan === 'free' && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Upgrade', { requiredPlan: 'plus', featureName: 'Plus Features' })
              }
            >
              <Text style={styles.upgradeLink}>Upgrade to unlock more →</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Features</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, i) => {
              const accessible = hasAccess(item.minPlan);
              return (
                <TouchableOpacity
                  key={item.screen}
                  style={[
                    styles.menuRow,
                    i < MENU_ITEMS.length - 1 && styles.menuRowBorder,
                    !accessible && styles.menuRowLocked,
                  ]}
                  onPress={() => {
                    if (accessible) {
                      navigation.navigate(item.screen);
                    } else {
                      navigation.navigate('Upgrade', {
                        requiredPlan: item.minPlan,
                        featureName: item.name,
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.menuLabel, !accessible && styles.lockedText]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.menuDesc, !accessible && styles.lockedText]}>
                      {item.desc}
                    </Text>
                  </View>

                  {accessible ? (
                    <Text style={[styles.menuChevron, { color: item.accent }]}>›</Text>
                  ) : (
                    <View style={styles.lockedRight}>
                      <View style={[
                        styles.planPill,
                        { backgroundColor: item.minPlan === 'pro' ? '#A855F7' : '#00D4A1' },
                      ]}>
                        <Text style={styles.planPillText}>
                          {item.minPlan.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.lockEmoji}>🔒</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* App info footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>HAY-M v1.0.0 · UK regulated · FSCS protected</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  /* ── Plan badge card ── */
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  planLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  planBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  upgradeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00D4A1',
  },
  /* ── Menu section ── */
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowLocked: {
    opacity: 0.45,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  lockedText: {
    color: colors.textSecondary,
  },
  menuChevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  lockedRight: {
    alignItems: 'center',
    gap: 4,
  },
  planPill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  planPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  lockEmoji: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
});
