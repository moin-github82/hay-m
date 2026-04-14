import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import api from '../services/api';

const MENU_ITEMS = [
  { icon: 'notifications-outline',    label: 'Notifications',       color: '#3B82F6', action: 'notifications' },
  { icon: 'lock-closed-outline',      label: 'Change Password',     color: colors.primary, action: 'changePassword' },
  { icon: 'card-outline',             label: 'Payment Methods',     color: '#A855F7', action: null },
  { icon: 'help-circle-outline',      label: 'Help & Support',      color: colors.accent, action: null },
  { icon: 'document-text-outline',    label: 'Terms & Privacy',     color: colors.textSecondary, action: null },
];

const PLAN_CONFIG = {
  free:  { label: 'Free',  bg: '#F1F5F9', color: '#64748B' },
  plus:  { label: 'Plus',  bg: '#DBEAFE', color: '#2563EB' },
  pro:   { label: 'Pro',   bg: '#EDE9FE', color: '#7C3AED' },
};

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();

  const [editModal,   setEditModal]   = useState(false);
  const [pwModal,     setPwModal]     = useState(false);
  const [form,        setForm]        = useState({ fullName: user?.fullName ?? '', phone: user?.phone ?? '' });
  const [pwForm,      setPwForm]      = useState({ current: '', newPw: '', confirm: '' });
  const [saving,      setSaving]      = useState(false);
  const [savingPw,    setSavingPw]    = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);
  const [stats,       setStats]       = useState({ goals: 0, transactions: 0, cards: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const planConf = PLAN_CONFIG[user?.plan] || PLAN_CONFIG.free;

  // Fetch real stats
  useEffect(() => {
    Promise.allSettled([
      api.get('/goals'),
      api.get('/transactions'),
      api.get('/cards'),
    ]).then(([goals, txs, cards]) => {
      setStats({
        goals:        goals.status === 'fulfilled' ? (goals.value.data?.length ?? 0) : 0,
        transactions: txs.status === 'fulfilled'   ? (txs.value.data?.pagination?.total ?? txs.value.data?.data?.length ?? 0) : 0,
        cards:        cards.status === 'fulfilled' ? (cards.value.data?.length ?? 0) : 0,
      });
    }).finally(() => setLoadingStats(false));
  }, []);

  const handleSaveProfile = async () => {
    if (!form.fullName.trim()) {
      Alert.alert('Error', 'Full name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const res = await authService.updateProfile({ fullName: form.fullName.trim(), phone: form.phone.trim() });
      updateUser(res.user);
      setEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (pwForm.newPw.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    setSavingPw(true);
    try {
      await api.patch('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwModal(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
      Alert.alert('Success', 'Password changed successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setSavingPw(false);
    }
  };

  const handleMenuPress = (action) => {
    if (action === 'changePassword') setPwModal(true);
    // other actions can be wired up later
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of HAY-M?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#0A1628', '#1C3D6E']} style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.fullName ?? 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>

          {/* Plan badge */}
          <View style={[styles.planBadge, { backgroundColor: planConf.bg }]}>
            <Text style={[styles.planBadgeText, { color: planConf.color }]}>
              {planConf.label} Plan
            </Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => { setForm({ fullName: user?.fullName ?? '', phone: user?.phone ?? '' }); setEditModal(true); }}>
            <Ionicons name="pencil-outline" size={16} color={colors.secondary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          {[
            { label: 'Full Name',    value: user?.fullName,  icon: 'person-outline' },
            { label: 'Email',        value: user?.email,     icon: 'mail-outline' },
            { label: 'Phone',        value: user?.phone || '—', icon: 'call-outline' },
            { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—', icon: 'calendar-outline' },
          ].map((item, i) => (
            <View key={i} style={[styles.infoRow, i < 3 && styles.infoRowBorder]}>
              <View style={styles.infoLeft}>
                <View style={styles.infoIconBox}>
                  <Ionicons name={item.icon} size={16} color={colors.primary} />
                </View>
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Account Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Goals',        value: stats.goals,        icon: 'flag-outline',    color: '#A855F7' },
            { label: 'Transactions', value: stats.transactions, icon: 'receipt-outline', color: '#3B82F6' },
            { label: 'Cards',        value: stats.cards,        icon: 'card-outline',    color: colors.primary },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon} size={20} color={s.color} />
              </View>
              {loadingStats
                ? <ActivityIndicator size="small" color={s.color} />
                : <Text style={styles.statValue}>{s.value}</Text>
              }
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.action)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} disabled={loggingOut} activeOpacity={0.85}>
          {loggingOut ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <View style={styles.logoutIcon}>
                <Ionicons name="log-out-outline" size={22} color={colors.error} />
              </View>
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>HAY-M v1.0.0</Text>
      </ScrollView>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalAvatarRow}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>{initials}</Text>
              </View>
            </View>

            <Text style={styles.modalLabel}>Full Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color={colors.textLight} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={colors.textLight}
                value={form.fullName}
                onChangeText={v => setForm(p => ({ ...p, fullName: v }))}
                autoCapitalize="words"
              />
            </View>

            <Text style={styles.modalLabel}>Phone Number</Text>
            <View style={styles.inputRow}>
              <Ionicons name="call-outline" size={18} color={colors.textLight} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="+44 7700 900000"
                placeholderTextColor={colors.textLight}
                value={form.phone}
                onChangeText={v => setForm(p => ({ ...p, phone: v }))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalNote}>
              <Ionicons name="information-circle-outline" size={16} color={colors.textLight} />
              <Text style={styles.modalNoteText}>Email cannot be changed. Contact support if needed.</Text>
            </View>

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSaveProfile} disabled={saving}>
              <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.saveGradient}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Change Password Modal ── */}
      <Modal visible={pwModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => { setPwModal(false); setPwForm({ current: '', newPw: '', confirm: '' }); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Current Password', key: 'current',  icon: 'lock-closed-outline' },
              { label: 'New Password',     key: 'newPw',    icon: 'lock-open-outline' },
              { label: 'Confirm Password', key: 'confirm',  icon: 'checkmark-circle-outline' },
            ].map(f => (
              <View key={f.key}>
                <Text style={styles.modalLabel}>{f.label}</Text>
                <View style={styles.inputRow}>
                  <Ionicons name={f.icon} size={18} color={colors.textLight} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textLight}
                    value={pwForm[f.key]}
                    onChangeText={v => setPwForm(p => ({ ...p, [f.key]: v }))}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity style={[styles.saveBtn, { marginTop: 8 }, savingPw && { opacity: 0.7 }]} onPress={handleChangePassword} disabled={savingPw}>
              <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.saveGradient}>
                <Text style={styles.saveBtnText}>{savingPw ? 'Updating...' : 'Change Password'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background },
  header:          { paddingBottom: 30 },
  headerTitle:     { fontSize: 20, fontWeight: '800', color: colors.white, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  avatarSection:   { alignItems: 'center', paddingBottom: 4 },
  avatarCircle:    { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText:      { fontSize: 30, fontWeight: '900', color: colors.secondary },
  userName:        { fontSize: 20, fontWeight: '800', color: colors.white, marginBottom: 4 },
  userEmail:       { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10 },
  planBadge:       { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 14 },
  planBadgeText:   { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  editBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  editBtnText:     { fontSize: 13, fontWeight: '700', color: colors.secondary },
  body:            { flex: 1 },
  infoCard:        { backgroundColor: colors.white, marginHorizontal: 20, marginTop: 20, borderRadius: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10 },
  infoRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 },
  infoRowBorder:   { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLeft:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIconBox:     { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  infoLabel:       { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  infoValue:       { fontSize: 13, fontWeight: '700', color: colors.text, maxWidth: 180, textAlign: 'right' },
  statsRow:        { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 16 },
  statCard:        { flex: 1, backgroundColor: colors.white, borderRadius: 18, padding: 14, alignItems: 'center', gap: 6, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  statIcon:        { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statValue:       { fontSize: 18, fontWeight: '900', color: colors.text },
  statLabel:       { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  menuCard:        { backgroundColor: colors.white, marginHorizontal: 20, marginTop: 16, borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8 },
  menuRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 },
  menuRowBorder:   { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon:        { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel:       { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, marginTop: 20, backgroundColor: colors.errorLight, borderRadius: 18, paddingVertical: 16, elevation: 1 },
  logoutIcon:      { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center' },
  logoutText:      { fontSize: 16, fontWeight: '800', color: colors.error },
  version:         { textAlign: 'center', color: colors.textLight, fontSize: 12, marginTop: 20 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:       { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:      { fontSize: 18, fontWeight: '800', color: colors.text },
  modalAvatarRow:  { alignItems: 'center', marginBottom: 24 },
  modalAvatar:     { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalAvatarText: { fontSize: 26, fontWeight: '900', color: colors.secondary },
  modalLabel:      { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  inputRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, height: 50, marginBottom: 16 },
  input:           { flex: 1, fontSize: 14, color: colors.text },
  modalNote:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.background, borderRadius: 12, padding: 12, marginBottom: 22 },
  modalNoteText:   { fontSize: 12, color: colors.textLight, flex: 1 },
  saveBtn:         { borderRadius: 14, overflow: 'hidden' },
  saveGradient:    { height: 52, alignItems: 'center', justifyContent: 'center' },
  saveBtnText:     { fontSize: 16, fontWeight: '700', color: colors.white },
});
