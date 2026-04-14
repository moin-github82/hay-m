import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { goalService }           from '../services/goalService';
import { walletService }         from '../services/walletService';
import { savingsTrackerService } from '../services/savingsTrackerService';

const GOAL_ICONS   = ['airplane-outline','home-outline','car-outline','school-outline','medkit-outline','gift-outline','laptop-outline','heart-outline','shield-checkmark-outline','flag-outline'];
const GOAL_COLORS  = ['#00D4A1','#3B82F6','#F4A261','#A855F7','#EF4444','#10B981','#F59E0B'];
const QUICK_AMOUNTS = ['50', '100', '200', '500'];

// ─── Small goal card ─────────────────────────────────────────────────────────
function GoalCard({ goal, onAddFunds, onDelete, onEdit }) {
  const pct       = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
  const remaining = goal.target - goal.current;

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalTop}>
        <View style={[styles.goalIcon, { backgroundColor: (goal.color ?? colors.primary) + '18' }]}>
          <Ionicons name={goal.icon ?? 'flag-outline'} size={22} color={goal.color ?? colors.primary} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <View style={styles.goalMeta}>
            {goal.deadline && (
              <>
                <Ionicons name="time-outline" size={12} color={colors.textLight} />
                <Text style={styles.goalMetaText}>
                  {new Date(goal.deadline).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </Text>
              </>
            )}
            {goal.autoSave > 0 && (
              <>
                <View style={styles.metaDot} />
                <Ionicons name="repeat-outline" size={12} color={colors.textLight} />
                <Text style={styles.goalMetaText}>£{goal.autoSave}/{goal.autoSaveFrequency}</Text>
              </>
            )}
          </View>
        </View>
        <View style={{ flexDirection:'row' }}>
          <TouchableOpacity onPress={() => onEdit(goal)} style={[styles.editBtn, { marginRight:6 }]}>
            <Ionicons name="create-outline" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(goal._id)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.goalAmounts}>
        <View>
          <Text style={styles.goalSaved}>£{Number(goal.current).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</Text>
          <Text style={styles.goalTarget}>of £{Number(goal.target).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.pctCircle}>
          <Text style={[styles.pctText, { color: goal.color ?? colors.primary }]}>{pct}%</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: goal.color ?? colors.primary }]} />
      </View>

      <View style={styles.goalFooter}>
        <Text style={styles.remainText}>
          <Text style={{ color: goal.color ?? colors.primary, fontWeight: '700' }}>
            £{Number(remaining).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </Text>{' '}to go
        </Text>
        {goal.isCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.completedText}>Completed!</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addFundsBtn, { backgroundColor: (goal.color ?? colors.primary) + '18' }]}
            onPress={() => onAddFunds(goal)}
          >
            <Ionicons name="add" size={16} color={goal.color ?? colors.primary} />
            <Text style={[styles.addFundsText, { color: goal.color ?? colors.primary }]}>Add Funds</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Edit Goal Modal ──────────────────────────────────────────────────────────
function EditGoalModal({ visible, goal, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', target: '', autoSave: '', autoSaveFrequency: 'monthly',
    selectedIcon: GOAL_ICONS[0], selectedColor: GOAL_COLORS[0],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      setForm({
        name:              goal.name || '',
        target:            String(goal.target || ''),
        autoSave:          goal.autoSave > 0 ? String(goal.autoSave) : '',
        autoSaveFrequency: goal.autoSaveFrequency || 'monthly',
        selectedIcon:      goal.icon || GOAL_ICONS[0],
        selectedColor:     goal.color || GOAL_COLORS[0],
      });
    }
  }, [goal]);

  const handleSave = async () => {
    if (!form.name || !form.target) {
      Alert.alert('Error', 'Please fill in goal name and target amount');
      return;
    }
    setSaving(true);
    try {
      const goalId = String(goal?._id ?? goal?.id ?? '');
      await goalService.updateGoal(goalId, {
        name:              form.name,
        target:            parseFloat(form.target),
        icon:              form.selectedIcon,
        color:             form.selectedColor,
        autoSave:          parseFloat(form.autoSave) || 0,
        autoSaveFrequency: parseFloat(form.autoSave) > 0 ? form.autoSaveFrequency : 'none',
      });
      onSuccess();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={editStyles.overlay}>
        <View style={editStyles.card}>
          {/* Header */}
          <View style={editStyles.header}>
            <Text style={editStyles.title}>Edit Goal</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#0A1628" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Icon selector */}
            <Text style={editStyles.label}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}>
              {GOAL_ICONS.map(ic => (
                <TouchableOpacity key={ic} onPress={() => setForm(p => ({ ...p, selectedIcon: ic }))}
                  style={[editStyles.iconChip, form.selectedIcon === ic && editStyles.iconChipActive]}>
                  <Ionicons name={ic} size={20} color={form.selectedIcon === ic ? '#fff' : '#64748B'} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Color selector */}
            <Text style={editStyles.label}>Colour</Text>
            <View style={{ flexDirection:'row', gap:10, marginBottom:16 }}>
              {GOAL_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setForm(p => ({ ...p, selectedColor: c }))}
                  style={[editStyles.colorDot, { backgroundColor: c },
                    form.selectedColor === c && { borderWidth:3, borderColor:'#0A1628' }]} />
              ))}
            </View>

            {/* Goal Name */}
            <Text style={editStyles.label}>Goal Name</Text>
            <TextInput style={editStyles.input} placeholder="e.g. Holiday Fund"
              value={form.name} onChangeText={t => setForm(p => ({ ...p, name: t }))} />

            {/* Target Amount */}
            <Text style={editStyles.label}>Target Amount (£)</Text>
            <TextInput style={editStyles.input} placeholder="1000.00"
              keyboardType="decimal-pad" value={form.target}
              onChangeText={t => setForm(p => ({ ...p, target: t }))} />

            {/* Auto-save Amount */}
            <Text style={editStyles.label}>Auto-save Amount <Text style={{ color:'#94A3B8', fontWeight:'400' }}>(optional)</Text></Text>
            <TextInput style={editStyles.input} placeholder="0.00 — leave blank to disable"
              keyboardType="decimal-pad" value={form.autoSave}
              onChangeText={t => setForm(p => ({ ...p, autoSave: t }))} />

            {/* Frequency — only if autoSave > 0 */}
            {parseFloat(form.autoSave) > 0 && (
              <>
                <Text style={editStyles.label}>Frequency</Text>
                <View style={{ flexDirection:'row', gap:8, marginBottom:16 }}>
                  {['daily','weekly','monthly','none'].map(f => (
                    <TouchableOpacity key={f} onPress={() => setForm(p => ({ ...p, autoSaveFrequency: f }))}
                      style={[editStyles.freqBtn, form.autoSaveFrequency === f && editStyles.freqBtnActive]}>
                      <Text style={[editStyles.freqText, form.autoSaveFrequency === f && editStyles.freqTextActive]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Save button */}
          <TouchableOpacity onPress={handleSave} disabled={saving}
            style={[editStyles.saveBtn, saving && { opacity:0.6 }]}>
            <Text style={editStyles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const editStyles = StyleSheet.create({
  overlay:       { flex:1, backgroundColor:'rgba(0,0,0,.55)', justifyContent:'flex-end' },
  card:          { backgroundColor:'#fff', borderTopLeftRadius:28, borderTopRightRadius:28, padding:28, maxHeight:'90%' },
  header:        { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  title:         { fontSize:20, fontWeight:'900', color:'#0A1628' },
  label:         { fontSize:13, fontWeight:'700', color:'#0A1628', marginBottom:8 },
  input:         { borderWidth:1.5, borderColor:'#E2E8F0', borderRadius:12, padding:14, fontSize:15, color:'#0A1628', marginBottom:16, backgroundColor:'#F8FAFC' },
  iconChip:      { width:44, height:44, borderRadius:12, backgroundColor:'#F5F7FA', alignItems:'center', justifyContent:'center', marginRight:8 },
  iconChipActive:{ backgroundColor:'#0A1628' },
  colorDot:      { width:30, height:30, borderRadius:15 },
  freqBtn:       { flex:1, padding:10, borderRadius:10, borderWidth:1.5, borderColor:'#E2E8F0', alignItems:'center' },
  freqBtnActive: { backgroundColor:'#0A1628', borderColor:'#0A1628' },
  freqText:      { fontSize:12, fontWeight:'700', color:'#64748B' },
  freqTextActive:{ color:'#fff' },
  saveBtn:       { backgroundColor:'#00D4A1', borderRadius:14, padding:16, alignItems:'center', marginTop:8 },
  saveBtnText:   { color:'#fff', fontSize:16, fontWeight:'800' },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function SavingGoalsScreen({ hideSafeArea = false } = {}) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isFreePlan = user?.plan === 'free';

  // Goals data
  const [goals, setGoals]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Balance data (fetched when Add Funds modal opens)
  const [walletBalance, setWalletBalance]   = useState(null);
  const [microBalance, setMicroBalance]     = useState(null);
  const [balancesLoading, setBalancesLoading] = useState(false);

  // Add Funds modal state
  const [fundsModal, setFundsModal]       = useState(false);
  const [selectedGoal, setSelectedGoal]   = useState(null);
  const [source, setSource]               = useState('balance'); // 'balance' | 'microsavings'
  const [fundAmount, setFundAmount]       = useState('');
  const [submitting, setSubmitting]       = useState(false);

  // Create Goal modal state
  const [createModal, setCreateModal]     = useState(false);
  const [saving, setSaving]               = useState(false);
  const [newGoal, setNewGoal]             = useState({
    name: '', target: '', deadline: '',
    selectedIcon: GOAL_ICONS[0], selectedColor: GOAL_COLORS[0],
    autoSave: '', autoSaveFrequency: 'monthly',
  });

  // Edit Goal modal state
  const [editModal, setEditModal]   = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // ── Fetch goals ─────────────────────────────────────────────────────────────
  const fetchGoals = useCallback(async () => {
    try {
      const res = await goalService.getGoals();
      setGoals(res.data);
    } catch (err) {
      console.warn('Goals fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const onRefresh = () => { setRefreshing(true); fetchGoals(); };

  // ── Fetch balances when Add Funds modal opens ────────────────────────────────
  const openFundsModal = async (goal) => {
    setSelectedGoal(goal);
    setSource('balance');
    setFundAmount('');
    setFundsModal(true);
    setBalancesLoading(true);
    try {
      const [cardsRes, trackerRes] = await Promise.all([
        walletService.getCards(),
        savingsTrackerService.getTracker(),
      ]);
      // Use DEFAULT card balance (backend deducts from default card only)
      const cards       = Array.isArray(cardsRes.data) ? cardsRes.data : [];
      const defaultCard = cards.find(c => c.isDefault) ?? cards[0];
      setWalletBalance(Number(defaultCard?.balance) || 0);
      setMicroBalance(Number(trackerRes.data?.totalSaved) || 0);
    } catch (err) {
      console.warn('Balance fetch error:', err.message);
      setWalletBalance(0);
      setMicroBalance(0);
    } finally {
      setBalancesLoading(false);
    }
  };

  // ── Submit funds ─────────────────────────────────────────────────────────────
  const handleSubmitFunds = async () => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0) { Alert.alert('Error', 'Please enter a valid amount'); return; }

    const available = source === 'balance' ? walletBalance : microBalance;
    const currency  = '£';

    if (available !== null && amt > available) {
      Alert.alert(
        'Insufficient Funds',
        `You only have ${currency}${available.toFixed(2)} available in your ${source === 'balance' ? 'wallet' : 'micro-savings'}.`
      );
      return;
    }

    // Safely resolve the goal ID (_id is a string after JSON parse; fall back to Mongoose's id virtual)
    const goalId = String(selectedGoal?._id ?? selectedGoal?.id ?? '');
    if (!goalId || goalId === 'undefined') {
      Alert.alert('Error', 'Goal not found. Please close and try again.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await goalService.addFunds(goalId, amt, source);
      const { goal, depositedAmount, sourceLabel, updatedCard, updatedTracker } = res.data;

      // Update goals list — compare as strings to avoid ObjectId vs string mismatch
      setGoals(prev => prev.map(g => String(g._id ?? g.id) === String(goal._id ?? goal.id) ? { ...goal } : g));

      // Update local balance values
      if (source === 'balance' && updatedCard) {
        setWalletBalance(Number(updatedCard.balance) || 0);
      }
      if (source === 'microsavings' && updatedTracker) {
        setMicroBalance(Number(updatedTracker.totalSaved) || 0);
      }

      setFundsModal(false);
      setFundAmount('');

      Alert.alert(
        goal.isCompleted ? 'Goal Completed!' : 'Funds Added!',
        `${currency}${Number(depositedAmount).toFixed(2)} added to "${goal.name}"\n${sourceLabel}`
      );
    } catch (err) {
      Alert.alert('Transfer Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete goal ──────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    Alert.alert('Delete Goal', 'Are you sure?', [
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await goalService.deleteGoal(id);
            setGoals(prev => prev.filter(g => g._id !== id));
          } catch (err) { Alert.alert('Error', err.message); }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Open edit modal ──────────────────────────────────────────────────────────
  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setEditModal(true);
  };

  // ── Create goal ──────────────────────────────────────────────────────────────
  const handleCreateGoal = async () => {
    if (!newGoal.name || !newGoal.target) {
      Alert.alert('Error', 'Please fill in goal name and target amount'); return;
    }
    setSaving(true);
    try {
      const res = await goalService.createGoal({
        name:              newGoal.name,
        icon:              newGoal.selectedIcon,
        color:             newGoal.selectedColor,
        target:            parseFloat(newGoal.target),
        deadline:          newGoal.deadline || undefined,
        autoSave:          parseFloat(newGoal.autoSave) || 0,
        autoSaveFrequency: parseFloat(newGoal.autoSave) > 0 ? newGoal.autoSaveFrequency : 'none',
      });
      setGoals(prev => [res.data, ...prev]);
      setNewGoal({ name: '', target: '', deadline: '', selectedIcon: GOAL_ICONS[0], selectedColor: GOAL_COLORS[0], autoSave: '', autoSaveFrequency: 'monthly' });
      setCreateModal(false);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const totalSaved  = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const overallPct  = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const maxDeposit  = selectedGoal
    ? parseFloat((selectedGoal.target - selectedGoal.current).toFixed(2))
    : 0;

  const sourceBalance = source === 'balance' ? walletBalance : microBalance;
  const canAfford     = sourceBalance !== null && parseFloat(fundAmount || 0) <= sourceBalance;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: hideSafeArea ? 0 : insets.top }]}>
      {/* ── Header ── */}
      <LinearGradient colors={['#0A1628', '#1C3D6E']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Saving Goals</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="options-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.overallCard}>
          <View style={styles.overallRow}>
            <View>
              <Text style={styles.overallLabel}>Total Saved</Text>
              <Text style={styles.overallValue}>£{Number(totalSaved).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</Text>
              <Text style={styles.overallTarget}>of £{Number(totalTarget).toLocaleString('en-GB', { minimumFractionDigits: 2 })} total target</Text>
            </View>
            <View style={styles.bigCircle}>
              <Text style={styles.bigCirclePct}>{overallPct}%</Text>
              <Text style={styles.bigCircleLabel}>done</Text>
            </View>
          </View>
          <View style={styles.overallBar}>
            <View style={[styles.overallFill, { width: `${overallPct}%` }]} />
          </View>
          <View style={styles.overallStats}>
            <View style={styles.overallStat}>
              <Ionicons name="flag-outline" size={14} color={colors.primary} />
              <Text style={styles.overallStatText}>{goals.filter(g => !g.isCompleted).length} Active</Text>
            </View>
            <View style={styles.overallStat}>
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
              <Text style={styles.overallStatText}>{goals.filter(g => g.isCompleted).length} Completed</Text>
            </View>
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
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* ── Free plan goal-limit banner ── */}
          {isFreePlan && goals.length >= 1 && (
            <View style={styles.freePlanBanner}>
              <Ionicons name="lock-closed-outline" size={14} color="#92400E" />
              <Text style={styles.freePlanBannerText}>
                1 goal limit on Free plan · <Text style={styles.freePlanBannerLink}>Upgrade to Plus for unlimited goals →</Text>
              </Text>
            </View>
          )}

          <View style={styles.goalsList}>
            {goals.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="flag-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyTitle}>No goals yet</Text>
                <Text style={styles.emptySubtitle}>Tap + to create your first saving goal</Text>
              </View>
            ) : (
              goals.map((goal, idx) => (
                <GoalCard key={String(goal._id ?? goal.id ?? idx)} goal={goal} onAddFunds={openFundsModal} onDelete={handleDelete} onEdit={openEditModal} />
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (isFreePlan && goals.length >= 1) {
            Alert.alert(
              'Upgrade Required',
              'Free plan allows 1 goal. Upgrade to Plus for unlimited goals.',
              [{ text: 'OK' }]
            );
            return;
          }
          setCreateModal(true);
        }}
        activeOpacity={0.85}
      >
        <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD FUNDS MODAL — source selection + amount
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal visible={fundsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Funds</Text>
                {selectedGoal && (
                  <Text style={styles.modalSubtitle}>{selectedGoal.name}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => { setFundsModal(false); setFundAmount(''); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Remaining needed */}
            {selectedGoal && (
              <View style={styles.remainingBanner}>
                <Ionicons name="information-circle-outline" size={16} color={colors.info} />
                <Text style={styles.remainingText}>
                  <Text style={{ fontWeight: '700', color: colors.info }}>
                    £{maxDeposit.toFixed(2)}
                  </Text>{' '}still needed to reach this goal
                </Text>
              </View>
            )}

            {/* ── Source selection ── */}
            <Text style={styles.sectionLabel}>Choose funding source</Text>

            {balancesLoading ? (
              <View style={styles.balancesLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.balancesLoadingText}>Fetching balances...</Text>
              </View>
            ) : (
              <View style={styles.sourceRow}>
                {/* Wallet Balance */}
                <TouchableOpacity
                  style={[styles.sourceCard, source === 'balance' && styles.sourceCardActive]}
                  onPress={() => setSource('balance')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={source === 'balance' ? ['#0A1628', '#1C3D6E'] : [colors.background, colors.background]}
                    style={styles.sourceCardGradient}
                  >
                    <View style={[styles.sourceIconBox, source === 'balance' && styles.sourceIconBoxActive]}>
                      <Ionicons name="wallet-outline" size={22} color={source === 'balance' ? colors.primary : colors.textSecondary} />
                    </View>
                    <Text style={[styles.sourceLabel, source === 'balance' && styles.sourceLabelActive]}>
                      Default Card
                    </Text>
                    <Text style={[styles.sourceBalance, source === 'balance' && styles.sourceBalanceActive]}>
                      £{(walletBalance ?? 0).toFixed(2)}
                    </Text>
                    {source === 'balance' && (
                      <View style={styles.sourceCheckmark}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      </View>
                    )}
                    {(walletBalance ?? 0) === 0 && (
                      <Text style={styles.sourceWarning}>No funds</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Micro Savings */}
                <TouchableOpacity
                  style={[styles.sourceCard, source === 'microsavings' && styles.sourceCardActive]}
                  onPress={() => setSource('microsavings')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={source === 'microsavings' ? ['#064E3B', '#065F46'] : [colors.background, colors.background]}
                    style={styles.sourceCardGradient}
                  >
                    <View style={[styles.sourceIconBox, source === 'microsavings' && styles.sourceIconBoxActive]}>
                      <Ionicons name="cash-outline" size={22} color={source === 'microsavings' ? colors.primary : colors.textSecondary} />
                    </View>
                    <Text style={[styles.sourceLabel, source === 'microsavings' && styles.sourceLabelActive]}>
                      Micro Savings
                    </Text>
                    <Text style={[styles.sourceBalance, source === 'microsavings' && styles.sourceBalanceActive]}>
                      £{(microBalance ?? 0).toFixed(2)}
                    </Text>
                    {source === 'microsavings' && (
                      <View style={styles.sourceCheckmark}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      </View>
                    )}
                    {(microBalance ?? 0) === 0 && (
                      <Text style={styles.sourceWarning}>No funds</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Amount input ── */}
            <Text style={styles.sectionLabel}>Enter amount</Text>

            <View style={[styles.amountInputRow, !canAfford && parseFloat(fundAmount || 0) > 0 && styles.amountInputRowError]}>
              <Text style={styles.amountCurrency}>£</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                value={fundAmount}
                onChangeText={setFundAmount}
              />
              {!canAfford && parseFloat(fundAmount || 0) > 0 && (
                <Ionicons name="warning-outline" size={20} color={colors.error} />
              )}
            </View>

            {!canAfford && parseFloat(fundAmount || 0) > 0 && (
              <Text style={styles.errorHint}>
                Exceeds available {source === 'microsavings' ? 'micro savings' : 'wallet balance'}
              </Text>
            )}

            {/* Quick amounts */}
            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map(a => {
                const disabled = parseFloat(a) > (sourceBalance ?? 0) || parseFloat(a) > maxDeposit;
                return (
                  <TouchableOpacity
                    key={a}
                    style={[styles.quickChip, fundAmount === a && styles.quickChipActive, disabled && styles.quickChipDisabled]}
                    onPress={() => !disabled && setFundAmount(a)}
                    disabled={disabled}
                  >
                    <Text style={[styles.quickChipText, fundAmount === a && styles.quickChipTextActive, disabled && styles.quickChipTextDisabled]}>
                      £{a}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Max button */}
              <TouchableOpacity
                style={[styles.quickChip, styles.quickChipMax]}
                onPress={() => {
                  const max = Math.min(sourceBalance ?? 0, maxDeposit);
                  setFundAmount(max.toFixed(2));
                }}
              >
                <Text style={styles.quickChipMaxText}>Max</Text>
              </TouchableOpacity>
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={[styles.confirmBtn, (submitting || !canAfford || !fundAmount) && { opacity: 0.5 }]}
              onPress={handleSubmitFunds}
              disabled={submitting || !canAfford || !fundAmount}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={source === 'microsavings' ? ['#065F46', '#047857'] : ['#00D4A1', '#00A87F']}
                style={styles.confirmGradient}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name={source === 'microsavings' ? 'cash-outline' : 'wallet-outline'}
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.confirmBtnText}>
                      Add{fundAmount ? ` £${fundAmount}` : ''} from {source === 'microsavings' ? 'Micro Savings' : 'Wallet'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          CREATE GOAL MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal visible={createModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Saving Goal</Text>
              <TouchableOpacity onPress={() => { setCreateModal(false); setNewGoal({ name: '', target: '', deadline: '', selectedIcon: GOAL_ICONS[0], selectedColor: GOAL_COLORS[0], autoSave: '', autoSaveFrequency: 'monthly' }); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Goal Name</Text>
            <TextInput style={styles.textInput} placeholder="e.g. New Car, Vacation" placeholderTextColor={colors.textLight} value={newGoal.name} onChangeText={v => setNewGoal(p => ({ ...p, name: v }))} />

            <Text style={styles.sectionLabel}>Target Amount (£)</Text>
            <TextInput style={styles.textInput} placeholder="e.g. 5000" placeholderTextColor={colors.textLight} keyboardType="numeric" value={newGoal.target} onChangeText={v => setNewGoal(p => ({ ...p, target: v }))} />

            <Text style={styles.sectionLabel}>Target Date (Optional)</Text>
            <TextInput style={styles.textInput} placeholder="e.g. 12/2025" placeholderTextColor={colors.textLight} value={newGoal.deadline} onChangeText={v => setNewGoal(p => ({ ...p, deadline: v }))} />

            <Text style={styles.sectionLabel}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.iconRow}>
                {GOAL_ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconOption, newGoal.selectedIcon === icon && styles.iconOptionActive]}
                    onPress={() => setNewGoal(p => ({ ...p, selectedIcon: icon }))}
                  >
                    <Ionicons name={icon} size={22} color={newGoal.selectedIcon === icon ? colors.white : colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorRow}>
              {GOAL_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { backgroundColor: c }, newGoal.selectedColor === c && styles.colorDotActive]}
                  onPress={() => setNewGoal(p => ({ ...p, selectedColor: c }))}
                />
              ))}
            </View>

            <Text style={styles.fieldLabel}>Auto-save Amount <Text style={{ color: colors.textLight, fontWeight: '400' }}>(optional)</Text></Text>
            <View style={styles.inputWrapper}>
              <Text style={{ color: colors.textLight, paddingHorizontal: 8 }}>£</Text>
              <TextInput
                style={[styles.textInput, { flex:1 }]}
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={newGoal.autoSave}
                onChangeText={t => setNewGoal(p => ({ ...p, autoSave: t }))}
              />
            </View>

            {parseFloat(newGoal.autoSave) > 0 && (
              <>
                <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Frequency</Text>
                <View style={{ flexDirection:'row', gap:8, marginBottom:8 }}>
                  {['daily','weekly','monthly','none'].map(f => (
                    <TouchableOpacity key={f} onPress={() => setNewGoal(p => ({ ...p, autoSaveFrequency: f }))}
                      style={[editStyles.freqBtn, newGoal.autoSaveFrequency === f && editStyles.freqBtnActive]}>
                      <Text style={[editStyles.freqText, newGoal.autoSaveFrequency === f && editStyles.freqTextActive]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity style={[styles.confirmBtn, saving && { opacity: 0.7 }]} onPress={handleCreateGoal} disabled={saving}>
              <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.confirmGradient}>
                <Text style={styles.confirmBtnText}>{saving ? 'Creating...' : 'Create Goal'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <EditGoalModal
        visible={editModal}
        goal={editingGoal}
        onClose={() => { setEditModal(false); setEditingGoal(null); }}
        onSuccess={() => { setEditModal(false); setEditingGoal(null); fetchGoals(); }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  loadingBox:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header:     { paddingBottom: 24 },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle:{ fontSize: 20, fontWeight: '800', color: colors.white },
  iconBtn:    { padding: 8 },

  // Overall progress card
  overallCard:      { backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20, borderRadius: 20, padding: 18 },
  overallRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  overallLabel:     { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  overallValue:     { fontSize: 26, fontWeight: '900', color: colors.white },
  overallTarget:    { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  bigCircle:        { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0,212,161,0.2)', borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  bigCirclePct:     { fontSize: 18, fontWeight: '900', color: colors.primary },
  bigCircleLabel:   { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  overallBar:       { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 },
  overallFill:      { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  overallStats:     { flexDirection: 'row', gap: 20 },
  overallStat:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  overallStatText:  { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  // Free plan banner
  freePlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  freePlanBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  freePlanBannerLink: {
    fontWeight: '700',
    color: '#B45309',
  },

  // Goals list
  body:          { flex: 1 },
  goalsList:     { padding: 20 },
  emptyBox:      { alignItems: 'center', paddingVertical: 50, gap: 8 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  emptySubtitle: { fontSize: 13, color: colors.textLight },

  // Goal card
  goalCard:    { backgroundColor: colors.white, borderRadius: 20, padding: 18, marginBottom: 14, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10 },
  goalTop:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  goalIcon:    { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  goalInfo:    { flex: 1 },
  goalName:    { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 4 },
  goalMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  goalMetaText:{ fontSize: 11, color: colors.textLight },
  metaDot:     { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textLight },
  deleteBtn:   { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  editBtn:     { width: 30, height: 30, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  goalAmounts: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  goalSaved:   { fontSize: 20, fontWeight: '900', color: colors.text },
  goalTarget:  { fontSize: 12, color: colors.textLight, marginTop: 2 },
  pctCircle:   { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  pctText:     { fontSize: 13, fontWeight: '800' },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 14 },
  progressFill:{ height: '100%', borderRadius: 4 },
  goalFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remainText:  { fontSize: 13, color: colors.textSecondary },
  addFundsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  addFundsText:{ fontSize: 13, fontWeight: '700' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  completedText:  { fontSize: 12, fontWeight: '700', color: colors.success },

  // FAB
  fab:         { position: 'absolute', bottom: 80, right: 20, borderRadius: 30, overflow: 'hidden', elevation: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  fabGradient: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },

  // Modals shared
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: colors.text },
  modalSubtitle:{ fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },

  // Remaining banner
  remainingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.infoLight, borderRadius: 12, padding: 10, marginBottom: 18 },
  remainingText:   { fontSize: 13, color: colors.text, flex: 1 },

  // Source selection
  balancesLoading:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, justifyContent: 'center', marginBottom: 16 },
  balancesLoadingText: { fontSize: 13, color: colors.textSecondary },
  sourceRow:           { flexDirection: 'row', gap: 12, marginBottom: 20 },
  sourceCard:          { flex: 1, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  sourceCardActive:    { borderColor: colors.primary },
  sourceCardGradient:  { padding: 16, minHeight: 120, alignItems: 'center', gap: 6 },
  sourceIconBox:       { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  sourceIconBoxActive: { backgroundColor: 'rgba(0,212,161,0.2)' },
  sourceLabel:         { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  sourceLabelActive:   { color: 'rgba(255,255,255,0.8)' },
  sourceBalance:       { fontSize: 18, fontWeight: '900', color: colors.text, textAlign: 'center' },
  sourceBalanceActive: { color: colors.white },
  sourceCheckmark:     { position: 'absolute', top: 8, right: 8 },
  sourceWarning:       { fontSize: 10, color: colors.error, fontWeight: '600' },

  // Amount input
  amountInputRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 14, borderWidth: 2, borderColor: colors.border, paddingHorizontal: 16, height: 60, marginBottom: 6 },
  amountInputRowError: { borderColor: colors.error },
  amountCurrency:      { fontSize: 24, fontWeight: '700', color: colors.textSecondary, marginRight: 4 },
  amountInput:         { flex: 1, fontSize: 30, fontWeight: '900', color: colors.text },
  errorHint:           { fontSize: 12, color: colors.error, marginBottom: 10, marginLeft: 4 },

  // Quick chips
  quickRow:              { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  quickChip:             { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border },
  quickChipActive:       { backgroundColor: colors.secondary, borderColor: colors.secondary },
  quickChipDisabled:     { opacity: 0.35 },
  quickChipText:         { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  quickChipTextActive:   { color: colors.white },
  quickChipTextDisabled: { color: colors.textLight },
  quickChipMax:          { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  quickChipMaxText:      { fontSize: 13, fontWeight: '700', color: colors.primaryDark },

  // Confirm button
  confirmBtn:      { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  confirmGradient: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  confirmBtnText:  { fontSize: 15, fontWeight: '800', color: colors.white },

  // Create goal modal fields
  textInput:    { backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, height: 48, fontSize: 14, color: colors.text, marginBottom: 16 },
  fieldLabel:   { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, marginBottom: 16 },
  iconRow:   { flexDirection: 'row', gap: 10 },
  iconOption:       { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.border },
  iconOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  colorRow:    { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  colorDot:    { width: 30, height: 30, borderRadius: 15 },
  colorDotActive: { borderWidth: 3, borderColor: colors.text },
});
