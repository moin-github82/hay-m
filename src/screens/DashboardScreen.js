import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { savingsTrackerService } from '../services/savingsTrackerService';

// Quick actions now use new tab names; objects with params use a navigate fn instead of a plain tab name
const QUICK_ACTIONS = [
  { icon: 'add-circle-outline', label: 'Add Money',  color: colors.primary, tab: 'Payments', params: { tab: 'wallet' } },
  { icon: 'send-outline',       label: 'Send',        color: '#3B82F6',      tab: 'Payments', params: {} },
  { icon: 'cash-outline',       label: 'Micro Save',  color: '#10B981',      tab: 'Savings',  params: {} },
  { icon: 'flag-outline',       label: 'Goals',       color: '#A855F7',      tab: 'Savings',  params: { tab: 'goals' } },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

function formatAmount(amount, type) {
  const sign = type === 'credit' ? '+' : '-';
  return `${sign}£${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

export default function DashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [data, setData] = useState(null);
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, trackerRes] = await Promise.all([
        dashboardService.getDashboard(),
        savingsTrackerService.getTracker(),
      ]);
      setData(dashRes.data);
      setTracker(trackerRes.data);
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const onRefresh = () => { setRefreshing(true); fetchDashboard(); };

  const totalBalance = data?.totalBalance ?? 0;
  const totalSaved   = data?.totalSaved ?? 0;
  const portfolioValue = data?.portfolioValue ?? 0;
  const transactions = data?.recentTransactions ?? [];
  const goals        = data?.savingsGoals ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0A1628', '#1C3D6E']} style={styles.topHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingSmall}>{getGreeting()}</Text>
            <Text style={styles.greetingName}>{user?.fullName ?? 'Welcome'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient colors={['#00D4A1', '#0096C7']} style={styles.balanceGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.balanceTop}>
              <View>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceAmount}>
                    {balanceVisible ? `£${Number(totalBalance).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '••••••••'}
                  </Text>
                  <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)} style={styles.eyeBtn}>
                    <Ionicons name={balanceVisible ? 'eye-outline' : 'eye-off-outline'} size={18} color="rgba(255,255,255,0.8)" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.balanceStats}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Ionicons name="arrow-down-outline" size={14} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Total Saved</Text>
                  <Text style={styles.statValue}>£{Number(totalSaved).toLocaleString('en-GB', { minimumFractionDigits: 0 })}</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(244,162,97,0.2)' }]}>
                  <Ionicons name="trending-up-outline" size={14} color={colors.accent} />
                </View>
                <View>
                  <Text style={styles.statLabel}>Portfolio</Text>
                  <Text style={styles.statValue}>£{Number(portfolioValue).toLocaleString('en-GB', { minimumFractionDigits: 0 })}</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(168,85,247,0.2)' }]}>
                  <Ionicons name="flag-outline" size={14} color="#A855F7" />
                </View>
                <View>
                  <Text style={styles.statLabel}>Goals</Text>
                  <Text style={styles.statValue}>{goals.length} Active</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              {QUICK_ACTIONS.map((action, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.actionItem}
                  activeOpacity={0.7}
                  onPress={() => action.tab && navigation.navigate(action.tab, action.params)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Micro-Savings Tracker Summary */}
          {tracker && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Micro-Savings</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Savings')}>
                  <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Savings')} activeOpacity={0.88}>
                <LinearGradient colors={['#064E3B', '#065F46']} style={styles.trackerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.trackerTop}>
                    <View style={styles.trackerIconBox}>
                      <Ionicons name="cash-outline" size={22} color={colors.primary} />
                    </View>
                    <View style={styles.trackerMeta}>
                      <Text style={styles.trackerLabel}>Total Micro-Saved</Text>
                      <Text style={styles.trackerTotal}>£{(tracker.totalSaved ?? 0).toFixed(2)}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                  </View>

                  <View style={styles.trackerStats}>
                    <View style={styles.trackerStat}>
                      <Ionicons name="sunny-outline" size={14} color={colors.primary} />
                      <Text style={styles.trackerStatLabel}>Today</Text>
                      <Text style={styles.trackerStatValue}>£{(tracker.todaySaved ?? 0).toFixed(2)}</Text>
                      <Text style={styles.trackerStatMax}>/ £{(tracker.dailyLimit ?? 5).toFixed(2)}</Text>
                    </View>
                    <View style={styles.trackerDivider} />
                    <View style={styles.trackerStat}>
                      <Ionicons name="calendar-outline" size={14} color={colors.accent} />
                      <Text style={styles.trackerStatLabel}>This Month</Text>
                      <Text style={styles.trackerStatValue}>£{(tracker.monthSaved ?? 0).toFixed(2)}</Text>
                      <Text style={styles.trackerStatMax}>/ £{(tracker.monthlyLimit ?? 100).toFixed(2)}</Text>
                    </View>
                    <View style={styles.trackerDivider} />
                    <View style={styles.trackerStat}>
                      <Ionicons name="swap-vertical-outline" size={14} color="#60A5FA" />
                      <Text style={styles.trackerStatLabel}>Round-ups</Text>
                      <Text style={styles.trackerStatValue}>{(tracker.roundUps ?? []).length}</Text>
                      <Text style={styles.trackerStatMax}>entries</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Savings Goals Overview */}
          {goals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Savings Goals</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Savings', { tab: 'goals' })}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.overviewScroll}>
                {goals.map((g, i) => {
                  const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
                  return (
                    <View key={g._id ?? i} style={styles.overviewCard}>
                      <Text style={styles.overviewLabel}>{g.name}</Text>
                      <Text style={styles.overviewAmount}>£{Number(g.current).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</Text>
                      <Text style={styles.overviewTarget}>of £{Number(g.target).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</Text>
                      <View style={styles.overviewBar}>
                        <View style={[styles.overviewFill, { width: `${pct}%`, backgroundColor: g.color ?? colors.primary }]} />
                      </View>
                      <Text style={[styles.overviewPct, { color: g.color ?? colors.primary }]}>{pct}%</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Payments')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="receipt-outline" size={36} color={colors.textLight} />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            ) : (
              <View style={styles.transactionList}>
                {transactions.map(tx => (
                  <View key={tx._id} style={styles.txRow}>
                    <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? colors.successLight : colors.errorLight }]}>
                      <Ionicons
                        name={tx.icon ?? (tx.type === 'credit' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline')}
                        size={20}
                        color={tx.type === 'credit' ? colors.success : colors.error}
                      />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txTitle}>{tx.title}</Text>
                      <Text style={styles.txSubtitle}>{tx.subtitle} · {formatDate(tx.createdAt)}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: tx.type === 'credit' ? colors.success : colors.text }]}>
                      {formatAmount(tx.amount, tx.type)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topHeader: { paddingBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  greetingSmall: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  greetingName: { fontSize: 18, fontWeight: '800', color: colors.white },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '800', color: colors.secondary },
  balanceCard: { marginHorizontal: 20, marginTop: 4, borderRadius: 20, overflow: 'hidden' },
  balanceGradient: { padding: 20, borderRadius: 20 },
  balanceTop: { marginBottom: 20 },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceAmount: { fontSize: 30, fontWeight: '900', color: colors.white },
  eyeBtn: { padding: 4 },
  balanceStats: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  statIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(0,212,161,0.2)', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  statValue: { fontSize: 13, fontWeight: '700', color: colors.white },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollArea: { flex: 1, marginTop: -20, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  scrollContent: { paddingBottom: 100 },
  section: { marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginHorizontal: 20, marginTop: 24, marginBottom: 14 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  actionItem: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  overviewScroll: { paddingLeft: 20 },
  overviewCard: { backgroundColor: colors.white, borderRadius: 18, padding: 16, marginRight: 12, width: 150, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  overviewLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: '500', marginBottom: 6 },
  overviewAmount: { fontSize: 18, fontWeight: '800', color: colors.text },
  overviewTarget: { fontSize: 11, color: colors.textLight, marginBottom: 10 },
  overviewBar: { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  overviewFill: { height: '100%', borderRadius: 3 },
  overviewPct: { fontSize: 12, fontWeight: '700' },
  transactionList: { paddingHorizontal: 20 },
  emptyBox: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 14, color: colors.textLight },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  txIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  txSubtitle: { fontSize: 12, color: colors.textLight },
  txAmount: { fontSize: 14, fontWeight: '800' },

  // Tracker summary card
  trackerCard:      { borderRadius: 20, padding: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 10 },
  trackerTop:       { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  trackerIconBox:   { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(0,212,161,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  trackerMeta:      { flex: 1 },
  trackerLabel:     { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  trackerTotal:     { fontSize: 22, fontWeight: '900', color: colors.white },
  trackerStats:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14, padding: 12 },
  trackerStat:      { flex: 1, alignItems: 'center', gap: 3 },
  trackerStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  trackerStatValue: { fontSize: 14, fontWeight: '800', color: colors.white },
  trackerStatMax:   { fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  trackerDivider:   { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 4 },
});
