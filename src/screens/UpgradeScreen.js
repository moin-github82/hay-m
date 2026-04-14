import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLUS_BULLETS = [
  'Unlimited savings goals',
  'Investment starter',
  'ISA access',
  'Spending Insights',
];

const PRO_BULLETS = [
  'Everything in Plus',
  'AI Auto-save',
  'Priority support',
  'Advanced analytics',
];

export default function UpgradeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { requiredPlan = 'plus', featureName = 'this feature' } = route.params || {};

  const planLabel = requiredPlan === 'pro' ? 'Pro' : 'Plus';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade Plan</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Lock icon ── */}
        <View style={styles.lockCircle}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        {/* ── Headline ── */}
        <Text style={styles.headline}>Unlock {featureName}</Text>
        <Text style={styles.subtext}>
          This feature is available on the {planLabel} plan and above.
        </Text>

        {/* ── Plan cards ── */}
        {requiredPlan === 'plus' && (
          <PlanCard
            name="Plus"
            price="£3"
            bullets={PLUS_BULLETS}
            buttonColor="#00D4A1"
            borderColor="#00D4A1"
          />
        )}

        <PlanCard
          name="Pro"
          price="£7"
          bullets={PRO_BULLETS}
          buttonColor="#A855F7"
          borderColor="#A855F7"
        />

        <Text style={styles.footerNote}>
          Cancel anytime · No hidden fees · UK regulated
        </Text>
      </ScrollView>
    </View>
  );
}

function PlanCard({ name, price, bullets, buttonColor, borderColor }) {
  return (
    <View style={[styles.planCard, { borderColor }]}>
      <Text style={styles.planName}>{name} Plan</Text>
      <Text style={styles.planPrice}>
        {price}{' '}
        <Text style={styles.planPriceSub}>/month</Text>
      </Text>

      <View style={styles.bulletList}>
        {bullets.map((b) => (
          <Text key={b} style={styles.bulletItem}>
            ✓  {b}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.upgradeBtn, { backgroundColor: buttonColor }]}
        activeOpacity={0.85}
        onPress={() => Alert.alert('Coming Soon', 'Upgrade flow launching soon!')}
      >
        <Text style={styles.upgradeBtnText}>Upgrade to {name} →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#0A1628',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#0A1628',
  },
  headerSpacer: {
    width: 36,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00D4A1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#00D4A1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lockIcon: {
    fontSize: 36,
  },
  headline: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A1628',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  planCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0A1628',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A1628',
    marginBottom: 16,
  },
  planPriceSub: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  bulletList: {
    marginBottom: 20,
    gap: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#0A1628',
    lineHeight: 20,
  },
  upgradeBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  footerNote: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
});
