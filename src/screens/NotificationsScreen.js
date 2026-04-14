import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import api from '../services/api';

// ─── Push token registration (graceful — works without expo-notifications installed) ─
async function registerForPushAsync() {
  try {
    const Notifications = require('expo-notifications');
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null; // expo-notifications not installed or simulator
  }
}

const PREF_DEFS = [
  { id: 'goal_done', label: 'Goal Completed',    desc: 'When a savings goal hits 100%'  },
  { id: 'goal_50',   label: 'Goal at 50%',        desc: 'Halfway milestone reached'       },
  { id: 'invest_10', label: 'Investment +10%',    desc: 'Portfolio grows by 10%'          },
  { id: 'invest_25', label: 'Investment +25%',    desc: 'Portfolio grows by 25%'          },
  { id: 'weekly',    label: 'Weekly Summary',     desc: 'Every Sunday evening'            },
  { id: 'monthly',   label: 'Monthly Report',     desc: 'First of each month'             },
  { id: 'auto_save', label: 'Auto-save Executed', desc: 'When we auto-save for you'       },
  { id: 'large_tx',  label: 'Large Transaction',  desc: 'Transactions over £50'           },
];

const ICON_MAP = {
  goal_milestone: '🎯',
  goal_complete:  '✅',
  transaction:    '💳',
  portfolio:      '📈',
  auto_save:      '💰',
  system:         '🔔',
};

function Toggle({ on, onToggle }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.toggle, { backgroundColor: on ? '#00D4A1' : '#E2E8F0' }]}
      activeOpacity={0.8}>
      <View style={[styles.toggleThumb, { marginLeft: on ? 22 : 3 }]} />
    </TouchableOpacity>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState([]);
  const [unread,        setUnread]        = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [savingPrefs,   setSavingPrefs]   = useState(false);
  const [prefs,         setPrefs]         = useState(
    Object.fromEntries(PREF_DEFS.map(p => [p.id, true]))
  );

  // Register push token once
  useEffect(() => {
    registerForPushAsync().then(token => {
      if (token) api.post('/notifications/push-token', { token }).catch(() => {});
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnread(res.data.unread || 0);
    } catch (err) {
      console.warn('Notifications fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchPrefs = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const p = res.data?.user?.notificationPrefs;
      if (p) setPrefs(prev => ({ ...prev, ...p }));
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchPrefs();
  }, [fetchNotifications, fetchPrefs]);

  const onRefresh = () => { setRefreshing(true); fetchNotifications(); };

  const handleToggle = id => setPrefs(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      await api.patch('/notifications/preferences', { notificationPrefs: prefs });
      Alert.alert('Saved', 'Notification preferences updated.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleMarkRead = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unread}</Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ── Alert Preferences ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Preferences</Text>
          <View style={styles.card}>
            {PREF_DEFS.map((t, i) => (
              <View key={t.id} style={[styles.toggleRow, i < PREF_DEFS.length - 1 && styles.toggleRowBorder]}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.toggleLabel}>{t.label}</Text>
                  <Text style={styles.toggleDesc}>{t.desc}</Text>
                </View>
                <Toggle on={!!prefs[t.id]} onToggle={() => handleToggle(t.id)} />
              </View>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSavePrefs} disabled={savingPrefs}>
              {savingPrefs
                ? <ActivityIndicator size="small" color="#0A1628" />
                : <Text style={styles.saveBtnText}>Save Preferences</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Notifications ── */}
        <View style={styles.section}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            {unread > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Text style={styles.markAllRead}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          ) : notifications.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="notifications-off-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubText}>We'll notify you about goals, transactions, and milestones.</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {notifications.map((n, i) => (
                <TouchableOpacity
                  key={n._id}
                  style={[styles.notifRow, i < notifications.length - 1 && styles.notifRowBorder]}
                  onPress={() => !n.read && handleMarkRead(n._id)}
                  activeOpacity={0.7}
                >
                  {!n.read
                    ? <View style={styles.unreadDot} />
                    : <View style={styles.unreadDotHidden} />
                  }
                  <View style={[styles.notifIconBox, { backgroundColor: n.read ? '#F1F5F9' : colors.primary + '18' }]}>
                    <Text style={styles.notifIcon}>{ICON_MAP[n.type] || '🔔'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifTitle, !n.read && { color: colors.text }]}>{n.title}</Text>
                    <Text style={styles.notifMessage}>{n.message}</Text>
                    <Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: colors.background },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle:     { fontSize: 20, fontWeight: '700', color: colors.text, flex: 1 },
  unreadBadge:     { backgroundColor: colors.error, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  unreadBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  section:         { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle:    { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  recentHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  markAllRead:     { fontSize: 13, color: colors.primary, fontWeight: '600' },
  card:            { backgroundColor: colors.card, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  toggleRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  toggleRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  toggleLabel:     { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  toggleDesc:      { fontSize: 12, color: colors.textSecondary },
  toggle:          { width: 46, height: 26, borderRadius: 13, justifyContent: 'center' },
  toggleThumb:     { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  saveBtn:         { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText:     { fontSize: 14, fontWeight: '700', color: '#0A1628' },
  notifRow:        { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  notifRowBorder:  { borderBottomWidth: 1, borderBottomColor: colors.border },
  unreadDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6, marginRight: 8 },
  unreadDotHidden: { width: 8, height: 8, marginTop: 6, marginRight: 8 },
  notifIconBox:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifIcon:       { fontSize: 20 },
  notifTitle:      { fontSize: 14, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  notifMessage:    { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime:       { fontSize: 11, color: colors.textLight },
  emptyBox:        { alignItems: 'center', paddingVertical: 40 },
  emptyText:       { fontSize: 16, fontWeight: '700', color: colors.textSecondary, marginTop: 12 },
  emptySubText:    { fontSize: 13, color: colors.textLight, textAlign: 'center', marginTop: 6, maxWidth: 260 },
});
