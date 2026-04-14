import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { savingsTrackerService } from '../services/savingsTrackerService';

const { width } = Dimensions.get('window');

const CATEGORY_COLORS = {
  food:       '#F59E0B',
  transport:  '#3B82F6',
  grocery:    '#10B981',
  leisure:    '#A855F7',
  shopping:   '#EC4899',
  health:     '#EF4444',
  subscript:  '#6366F1',
  other:      colors.textSecondary,
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function ProgressBar({ current, limit, color }) {
  const pct = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isNear = pct >= 80;
  const barColor = pct >= 100 ? colors.error : isNear ? colors.warning : color;
  return (
    <View style={pb.wrapper}>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[pb.pct, { color: barColor }]}>{Math.round(pct)}%</Text>
    </View>
  );
}

const pb = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  track:   { flex: 1, height: 7, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
  fill:    { height: '100%', borderRadius: 4 },
  pct:     { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
});

export default function SavingsTrackerScreen({ navigation, hideSafeArea = false }) {
  const insets = useSafeAreaInsets();

  // Data state
  const [tracker, setTracker]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('all'); // all | roundup | surplus

  // Surplus modal
  const [surplusModal, setSurplusModal] = useState(false);
  const [surplusAmount, setSurplusAmount] = useState('');
  const [surplusNote, setSurplusNote]   = useState('');
  const [addingSurplus, setAddingSurplus] = useState(false);

  // Limits modal
  const [limitsModal, setLimitsModal]     = useState(false);
  const [dailyInput, setDailyInput]       = useState('');
  const [monthlyInput, setMonthlyInput]   = useState('');
  const [savingLimits, setSavingLimits]   = useState(false);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchTracker = useCallback(async () => {
    try {
      const res = await savingsTrackerService.getTracker();
      setTracker(res.data);
    } catch (err) {
      console.warn('Tracker fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTracker(); }, [fetchTracker]);

  const onRefresh = () => { setRefreshing(true); fetchTracker(); };

  // ── Derived values ───────────────────────────────────────────
  const totalSaved   = tracker?.totalSaved   ?? 0;
  const todaySaved   = tracker?.todaySaved   ?? 0;
  const monthSaved   = tracker?.monthSaved   ?? 0;
  const dailyLimit   = tracker?.dailyLimit   ?? 5;
  const monthlyLimit = tracker?.monthlyLimit ?? 100;

  // Merge round-ups and surplus into one feed, sorted newest first
  const allItems = tracker
    ? [
        ...(tracker.roundUps ?? []).map(r => ({ ...r, _type: 'roundup' })),
        ...(tracker.surplus  ?? []).map(s => ({ ...s, _type: 'surplus', merchant: 'Manual Deposit', icon: 'add-circle-outline', category: 'other', spentAmount: null, savedAmount: s.amount })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const filteredItems = filter === 'all'     ? allItems
    : filter === 'roundup' ? allItems.filter(i => i._type === 'roundup')
    : allItems.filter(i => i._type === 'surplus');

  // Count per type
  const roundUpCount = (tracker?.roundUps ?? []).length;
  const surplusCount = (tracker?.surplus  ?? []).length;
  const roundUpTotal = (tracker?.roundUps ?? []).reduce((s, r) => s + r.savedAmount, 0);
  const surplusTotal = (tracker?.surplus  ?? []).reduce((s, r) => s + r.amount, 0);

  // ── Handlers ─────────────────────────────────────────────────
  const handleAddSurplus = async () => {
    const amt = parseFloat(surplusAmount);
    if (!amt || amt <= 0) { Alert.alert('Error', 'Enter a valid amount'); return; }
    setAddingSurplus(true);
    try {
      const res = await savingsTrackerService.addSurplus(amt, surplusNote || 'Surplus deposit');
      setTracker(res.data);
      setSurplusModal(false);
      setSurplusAmount('');
      setSurplusNote('');
      Alert.alert('🎉 Added!', `£${amt.toFixed(2)} added to your micro-savings!`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setAddingSurplus(false);
    }
  };

  const handleSaveLimits = async () => {
    const daily   = parseFloat(dailyInput);
    const monthly = parseFloat(monthlyInput);
    if (isNaN(daily) || isNaN(monthly) || daily < 0 || monthly < 0) {
      Alert.alert('Error', 'Please enter valid positive amounts');
      return;
    }
    if (daily > monthly) {
      Alert.alert('Error', 'Daily limit cannot exceed monthly limit');
      return;
    }
    setSavingLimits(true);
    try {
      const res = await savingsTrackerService.updateLimits(daily, monthly);
      setTracker(res.data);
      setLimitsModal(false);
      Alert.alert('Saved', 'Saving limits updated!');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingLimits(false);
    }
  };

  const openLimitsModal = () => {
    setDailyInput(String(dailyLimit));
    setMonthlyInput(String(monthlyLimit));
    setLimitsModal(true);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: hideSafeArea ? 0 : insets.top }]}>
      {/* ── Header ── */}
      <LinearGradient colors={['#0A1628', '#1A3A5C']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Savings Tracker</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={openLimitsModal}>
            <Ionicons name="settings-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Total saved hero */}
        <View style={styles.heroBox}>
          <Text style={styles.heroLabel}>Total Micro-Saved</Text>
          <Text style={styles.heroAmount}>£{totalSaved.toFixed(2)}</Text>
          <Text style={styles.heroSub}>Every penny counts 💰</Text>
        </View>

        {/* Daily & Monthly limit cards */}
        <View style={styles.limitsRow}>
          <View style={styles.limitCard}>
            <View style={styles.limitCardHeader}>
              <View style={styles.limitIconBox}>
                <Ionicons name="sunny-outline" size={16} color={colors.primary} />
              </View>
              <Text style={styles.limitTitle}>Today</Text>
              <TouchableOpacity onPress={openLimitsModal}>
                <Ionicons name="pencil-outline" size={14} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <Text style={styles.limitAmount}>
              <Text style={styles.limitCurrent}>£{todaySaved.toFixed(2)}</Text>
              <Text style={styles.limitMax}> / £{dailyLimit.toFixed(2)}</Text>
            </Text>
            <ProgressBar current={todaySaved} limit={dailyLimit} color={colors.primary} />
            {todaySaved >= dailyLimit && (
              <View style={styles.limitReachedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={styles.limitReachedText}>Daily limit reached!</Text>
              </View>
            )}
          </View>

          <View style={styles.limitCard}>
            <View style={styles.limitCardHeader}>
              <View style={[styles.limitIconBox, { backgroundColor: 'rgba(244,162,97,0.2)' }]}>
                <Ionicons name="calendar-outline" size={16} color={colors.accent} />
              </View>
              <Text style={styles.limitTitle}>This Month</Text>
              <TouchableOpacity onPress={openLimitsModal}>
                <Ionicons name="pencil-outline" size={14} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
            <Text style={styles.limitAmount}>
              <Text style={styles.limitCurrent}>£{monthSaved.toFixed(2)}</Text>
              <Text style={styles.limitMax}> / £{monthlyLimit.toFixed(2)}</Text>
            </Text>
            <ProgressBar current={monthSaved} limit={monthlyLimit} color={colors.accent} />
            {monthSaved >= monthlyLimit && (
              <View style={styles.limitReachedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                <Text style={styles.limitReachedText}>Monthly limit reached!</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* ── Stats row ── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="swap-vertical-outline" size={20} color="#3B82F6" />
              <Text style={styles.statValue}>{roundUpCount}</Text>
              <Text style={styles.statLabel}>Round-ups</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up-outline" size={20} color={colors.primary} />
              <Text style={styles.statValue}>£{roundUpTotal.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Auto-saved</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
              <Text style={styles.statValue}>£{surplusTotal.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Surplus</Text>
            </View>
          </View>

          {/* ── Add surplus button ── */}
          <TouchableOpacity style={styles.addSurplusCard} onPress={() => setSurplusModal(true)} activeOpacity={0.85}>
            <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.addSurplusGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View style={styles.addSurplusLeft}>
                <View style={styles.addSurplusIcon}>
                  <Ionicons name="add-circle" size={26} color={colors.white} />
                </View>
                <View>
                  <Text style={styles.addSurplusTitle}>Add Surplus Money</Text>
                  <Text style={styles.addSurplusSub}>Got leftover cash? Save it now!</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Transaction feed ── */}
          <View style={styles.feedSection}>
            <View style={styles.feedHeader}>
              <Text style={styles.feedTitle}>Savings Activity</Text>
              <Text style={styles.feedCount}>{filteredItems.length} entries</Text>
            </View>

            {/* Filter chips */}
            <View style={styles.filterRow}>
              {[
                { key: 'all',     label: 'All' },
                { key: 'roundup', label: `Round-ups (${roundUpCount})` },
                { key: 'surplus', label: `Surplus (${surplusCount})` },
              ].map(f => (
                <TouchableOpacity key={f.key} style={[styles.filterChip, filter === f.key && styles.filterChipActive]} onPress={() => setFilter(f.key)}>
                  <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="wallet-outline" size={44} color={colors.textLight} />
                <Text style={styles.emptyTitle}>No entries yet</Text>
                <Text style={styles.emptySubtitle}>Your micro-savings will appear here</Text>
              </View>
            ) : (
              filteredItems.map((item, idx) => {
                const catColor  = CATEGORY_COLORS[item.category] ?? colors.textSecondary;
                const isSurplus = item._type === 'surplus';
                return (
                  <View key={item._id ?? idx} style={styles.txCard}>
                    {/* Left icon */}
                    <View style={[styles.txIcon, { backgroundColor: catColor + '18' }]}>
                      <Ionicons name={item.icon ?? 'storefront-outline'} size={22} color={catColor} />
                    </View>

                    {/* Middle info */}
                    <View style={styles.txInfo}>
                      <Text style={styles.txMerchant}>{item.merchant}</Text>
                      {item.spentAmount != null && !isSurplus && (
                        <Text style={styles.txSpent}>
                          Rounded up from{' '}
                          <Text style={styles.txSpentBold}>£{Number(item.spentAmount).toFixed(2)}</Text>
                          {' '}→ £{Math.ceil(item.spentAmount).toFixed(2)}
                        </Text>
                      )}
                      {item.note && isSurplus && (
                        <Text style={styles.txSpent}>{item.note}</Text>
                      )}
                      <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
                    </View>

                    {/* Right amount */}
                    <View style={styles.txRight}>
                      <Text style={styles.txSaved}>+£{Number(item.savedAmount).toFixed(2)}</Text>
                      <View style={[styles.txTypeBadge, { backgroundColor: isSurplus ? colors.accentLight : colors.primaryLight }]}>
                        <Text style={[styles.txTypeText, { color: isSurplus ? colors.accent : colors.primaryDark }]}>
                          {isSurplus ? 'Surplus' : 'Round-up'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* ── Surplus Modal ── */}
      <Modal visible={surplusModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Surplus Money</Text>
              <TouchableOpacity onPress={() => { setSurplusModal(false); setSurplusAmount(''); setSurplusNote(''); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>Got some leftover change or a bonus? Drop it into your micro-savings!</Text>

            {/* Quick amount chips */}
            <View style={styles.quickChipsRow}>
              {['1', '2', '5', '10', '20', '50'].map(a => (
                <TouchableOpacity key={a} style={[styles.quickChip, surplusAmount === a && styles.quickChipActive]} onPress={() => setSurplusAmount(a)}>
                  <Text style={[styles.quickChipText, surplusAmount === a && styles.quickChipTextActive]}>£{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Custom Amount (£)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputCurrency}>£</Text>
              <TextInput
                style={styles.inputAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                value={surplusAmount}
                onChangeText={setSurplusAmount}
              />
            </View>

            <Text style={styles.modalLabel}>Note (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Leftover from lunch budget"
              placeholderTextColor={colors.textLight}
              value={surplusNote}
              onChangeText={setSurplusNote}
            />

            <TouchableOpacity style={[styles.actionBtn, addingSurplus && { opacity: 0.7 }]} onPress={handleAddSurplus} disabled={addingSurplus}>
              <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.actionGradient}>
                <Ionicons name="add-circle-outline" size={20} color={colors.white} />
                <Text style={styles.actionBtnText}>{addingSurplus ? 'Adding...' : 'Add to Savings'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Limits Modal ── */}
      <Modal visible={limitsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saving Limits</Text>
              <TouchableOpacity onPress={() => setLimitsModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHint}>Set daily and monthly caps so your micro-savings stay within budget.</Text>

            <View style={styles.limitInfoRow}>
              <View style={styles.limitInfoCard}>
                <Ionicons name="sunny-outline" size={20} color={colors.primary} />
                <Text style={styles.limitInfoLabel}>Current Daily</Text>
                <Text style={styles.limitInfoValue}>£{dailyLimit.toFixed(2)}</Text>
              </View>
              <View style={styles.limitInfoCard}>
                <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                <Text style={styles.limitInfoLabel}>Current Monthly</Text>
                <Text style={styles.limitInfoValue}>£{monthlyLimit.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={styles.modalLabel}>New Daily Limit (£)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputCurrency}>£</Text>
              <TextInput style={styles.inputAmount} placeholder={String(dailyLimit)} placeholderTextColor={colors.textLight} keyboardType="numeric" value={dailyInput} onChangeText={setDailyInput} />
            </View>

            {/* Quick daily presets */}
            <View style={styles.presetsRow}>
              {['2', '5', '10', '20'].map(v => (
                <TouchableOpacity key={v} style={[styles.presetChip, dailyInput === v && styles.presetChipActive]} onPress={() => setDailyInput(v)}>
                  <Text style={[styles.presetText, dailyInput === v && styles.presetTextActive]}>£{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>New Monthly Limit (£)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputCurrency}>£</Text>
              <TextInput style={styles.inputAmount} placeholder={String(monthlyLimit)} placeholderTextColor={colors.textLight} keyboardType="numeric" value={monthlyInput} onChangeText={setMonthlyInput} />
            </View>

            {/* Quick monthly presets */}
            <View style={styles.presetsRow}>
              {['50', '100', '150', '200'].map(v => (
                <TouchableOpacity key={v} style={[styles.presetChip, monthlyInput === v && styles.presetChipActive]} onPress={() => setMonthlyInput(v)}>
                  <Text style={[styles.presetText, monthlyInput === v && styles.presetTextActive]}>£{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.actionBtn, { marginTop: 8 }, savingLimits && { opacity: 0.7 }]} onPress={handleSaveLimits} disabled={savingLimits}>
              <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.actionGradient}>
                <Ionicons name="save-outline" size={20} color={colors.white} />
                <Text style={styles.actionBtnText}>{savingLimits ? 'Saving...' : 'Save Limits'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },

  // Header
  header:      { paddingBottom: 20 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.white },
  settingsBtn: { padding: 8 },

  // Hero
  heroBox:   { alignItems: 'center', paddingVertical: 10, paddingBottom: 20 },
  heroLabel: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 6 },
  heroAmount:{ fontSize: 42, fontWeight: '900', color: colors.white },
  heroSub:   { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  // Limits
  limitsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 4 },
  limitCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 14 },
  limitCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  limitIconBox:    { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(0,212,161,0.2)', alignItems: 'center', justifyContent: 'center' },
  limitTitle:  { flex: 1, fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  limitAmount: { fontSize: 13, marginBottom: 2 },
  limitCurrent:{ fontWeight: '800', color: colors.white },
  limitMax:    { color: 'rgba(255,255,255,0.45)' },
  limitReachedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  limitReachedText: { fontSize: 10, fontWeight: '600', color: colors.success },

  // Body
  body:        { flex: 1 },
  loadingBox:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Stats
  statsRow:    { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, gap: 10 },
  statCard:    { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
  statValue:   { fontSize: 16, fontWeight: '900', color: colors.text },
  statLabel:   { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },

  // Add Surplus card
  addSurplusCard:     { marginHorizontal: 20, marginTop: 16, borderRadius: 18, overflow: 'hidden' },
  addSurplusGradient: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  addSurplusLeft:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  addSurplusIcon:     { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  addSurplusTitle:    { fontSize: 15, fontWeight: '800', color: colors.white },
  addSurplusSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Feed
  feedSection: { paddingHorizontal: 20, marginTop: 20 },
  feedHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  feedTitle:   { fontSize: 16, fontWeight: '800', color: colors.text },
  feedCount:   { fontSize: 13, color: colors.textLight, fontWeight: '500' },

  // Filter
  filterRow:      { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  filterChip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.border },
  filterChipActive:{ backgroundColor: colors.secondary },
  filterText:     { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTextActive:{ color: colors.white },

  // Empty
  emptyBox:     { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  emptySubtitle:{ fontSize: 13, color: colors.textLight },

  // Transaction card
  txCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  txIcon:     { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo:     { flex: 1 },
  txMerchant: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 3 },
  txSpent:    { fontSize: 12, color: colors.textSecondary, marginBottom: 3 },
  txSpentBold:{ fontWeight: '700', color: colors.text },
  txDate:     { fontSize: 11, color: colors.textLight },
  txRight:    { alignItems: 'flex-end', gap: 5 },
  txSaved:    { fontSize: 15, fontWeight: '900', color: colors.success },
  txTypeBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  txTypeText: { fontSize: 10, fontWeight: '700' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: colors.text },
  modalHint:    { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 20 },
  modalLabel:   { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  modalInput:   { backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, height: 48, fontSize: 14, color: colors.text, marginBottom: 16 },

  // Quick chips (surplus modal)
  quickChipsRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 18 },
  quickChip:           { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border },
  quickChipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  quickChipText:       { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  quickChipTextActive: { color: colors.white },

  // Amount input row
  inputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16, height: 54, marginBottom: 16 },
  inputCurrency:{ fontSize: 22, fontWeight: '700', color: colors.textSecondary, marginRight: 4 },
  inputAmount:  { flex: 1, fontSize: 26, fontWeight: '800', color: colors.text },

  // Presets (limits modal)
  presetsRow:       { flexDirection: 'row', gap: 8, marginBottom: 18 },
  presetChip:       { flex: 1, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  presetChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  presetText:       { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  presetTextActive: { color: colors.white },

  // Limits info (limits modal)
  limitInfoRow:  { flexDirection: 'row', gap: 12, marginBottom: 22 },
  limitInfoCard: { flex: 1, backgroundColor: colors.background, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4 },
  limitInfoLabel:{ fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  limitInfoValue:{ fontSize: 18, fontWeight: '900', color: colors.text },

  // Action button
  actionBtn:      { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  actionGradient: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnText:  { fontSize: 16, fontWeight: '700', color: colors.white },
});
