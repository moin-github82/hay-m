import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { transactionService } from '../services/transactionService';

const CONTACTS = [
  { id: '1', name: 'Sarah K.', initials: 'SK', color: '#A855F7', email: 'sarah@example.com' },
  { id: '2', name: 'Mike T.',  initials: 'MT', color: '#3B82F6', email: 'mike@example.com' },
  { id: '3', name: 'Emma R.',  initials: 'ER', color: colors.accent, email: 'emma@example.com' },
  { id: '4', name: 'James L.', initials: 'JL', color: colors.primary, email: 'james@example.com' },
];

const CATEGORIES = ['all', 'transfer', 'payment', 'topup', 'roundup', 'investment'];

function formatAmount(amount, type) {
  const sign = type === 'credit' ? '+' : '-';
  return `${sign}£${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function PaymentsScreen({ hideSafeArea = false } = {}) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('send');
  const [sendModal, setSendModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [filterTab,      setFilterTab]      = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchText,     setSearchText]     = useState('');
  const [showFilters,    setShowFilters]    = useState(false);
  const [transactions,   setTransactions]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [sending,        setSending]        = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const params = {};
      if (filterTab !== 'all')      params.type     = filterTab === 'sent' ? 'debit' : 'credit';
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (searchText.trim())        params.search   = searchText.trim();
      const res = await transactionService.getTransactions(params);
      setTransactions(res.data);
    } catch (err) {
      console.warn('Transactions fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterTab]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions, filterTab, categoryFilter, searchText]);

  const onRefresh = () => { setRefreshing(true); fetchTransactions(); };

  const handleSend = async () => {
    const email = selectedContact?.email || recipientEmail.trim();
    if (!email || !amount) {
      Alert.alert('Error', 'Please enter recipient and amount');
      return;
    }
    setSending(true);
    try {
      await transactionService.sendMoney({ recipientEmail: email, amount: parseFloat(amount), note });
      Alert.alert('Success', `£${amount} sent successfully!`);
      setSendModal(false);
      setAmount('');
      setNote('');
      setSelectedContact(null);
      setRecipientEmail('');
      fetchTransactions();
    } catch (err) {
      Alert.alert('Transfer Failed', err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: hideSafeArea ? 0 : insets.top }]}>
      <LinearGradient colors={['#0A1628', '#1C3D6E']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Payments</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="scan-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {['send', 'request', 'schedule'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Ionicons name={tab === 'send' ? 'send-outline' : tab === 'request' ? 'arrow-down-outline' : 'calendar-outline'} size={16} color={activeTab === tab ? colors.secondary : 'rgba(255,255,255,0.7)'} />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickSendCard}>
          <Text style={styles.quickSendLabel}>Quick {activeTab === 'request' ? 'Request' : 'Send'}</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput style={styles.amountInput} placeholder="0.00" placeholderTextColor="rgba(255,255,255,0.4)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
          </View>
          <View style={styles.quickAmounts}>
            {['10', '25', '50', '100', '200'].map(a => (
              <TouchableOpacity key={a} style={styles.quickChip} onPress={() => setAmount(a)}>
                <Text style={styles.quickChipText}>£{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Contacts</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.addContactBtn} onPress={() => setSendModal(true)}>
              <View style={styles.addContactIcon}>
                <Ionicons name="add" size={24} color={colors.primary} />
              </View>
              <Text style={styles.contactName}>New</Text>
            </TouchableOpacity>
            {CONTACTS.map(c => (
              <TouchableOpacity key={c.id} style={styles.contactItem} onPress={() => { setSelectedContact(c); setSendModal(true); }}>
                <View style={[styles.contactAvatar, { backgroundColor: c.color }]}>
                  <Text style={styles.contactInitials}>{c.initials}</Text>
                </View>
                <Text style={styles.contactName}>{c.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {/* Search bar */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color={colors.textLight} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor={colors.textLight}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={16} color={colors.textLight} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowFilters(v => !v)} style={{ marginLeft: 8 }}>
              <Ionicons name="options-outline" size={20} color={showFilters ? colors.primary : colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Type filter */}
          <View style={styles.filterRow}>
            {['all', 'sent', 'received'].map(f => (
              <TouchableOpacity key={f} style={[styles.filterChip, filterTab === f && styles.filterChipActive]} onPress={() => setFilterTab(f)}>
                <Text style={[styles.filterText, filterTab === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category filter (expandable) */}
          {showFilters && (
            <View style={styles.filterRow}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[styles.filterChip, categoryFilter === c && styles.filterChipActive]} onPress={() => setCategoryFilter(c)}>
                  <Text style={[styles.filterText, categoryFilter === c && styles.filterTextActive, { textTransform: 'capitalize' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
          ) : transactions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={40} color={colors.textLight} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map(tx => (
              <View key={tx._id} style={styles.txCard}>
                <View style={[styles.txAvatar, { backgroundColor: tx.type === 'credit' ? colors.successLight : '#EDE9FE' }]}>
                  <Ionicons name={tx.icon ?? 'cash-outline'} size={20} color={tx.type === 'credit' ? colors.success : '#7C3AED'} />
                </View>
                <View style={styles.txInfo}>
                  <View style={styles.txInfoRow}>
                    <Text style={styles.txName}>{tx.title}</Text>
                    <Text style={[styles.txAmount, { color: tx.type === 'credit' ? colors.success : colors.text }]}>
                      {formatAmount(tx.amount, tx.type)}
                    </Text>
                  </View>
                  <View style={styles.txMetaRow}>
                    <Text style={styles.txNote}>{tx.subtitle}</Text>
                    <View style={[styles.statusChip, { backgroundColor: tx.status === 'completed' ? colors.successLight : colors.warningLight }]}>
                      <Text style={[styles.statusText, { color: tx.status === 'completed' ? colors.success : colors.warning }]}>{tx.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Send Modal */}
      <Modal visible={sendModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Money</Text>
              <TouchableOpacity onPress={() => { setSendModal(false); setSelectedContact(null); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Select or type recipient</Text>
            <View style={styles.contactSelectRow}>
              {CONTACTS.map(c => (
                <TouchableOpacity key={c.id} style={[styles.contactSelectItem, selectedContact?.id === c.id && styles.contactSelectActive]} onPress={() => { setSelectedContact(c); setRecipientEmail(''); }}>
                  <View style={[styles.contactAvatar, { backgroundColor: c.color, width: 44, height: 44, borderRadius: 22 }]}>
                    <Text style={styles.contactInitials}>{c.initials}</Text>
                  </View>
                  <Text style={styles.contactName}>{c.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {!selectedContact && (
              <>
                <Text style={styles.modalLabel}>Recipient Email</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.textLight} style={{ marginRight: 10 }} />
                  <TextInput style={styles.input} placeholder="recipient@email.com" placeholderTextColor={colors.textLight} keyboardType="email-address" autoCapitalize="none" value={recipientEmail} onChangeText={setRecipientEmail} />
                </View>
              </>
            )}

            <Text style={styles.modalLabel}>Amount</Text>
            <View style={styles.modalAmountRow}>
              <Text style={styles.modalCurrency}>£</Text>
              <TextInput style={styles.modalAmountInput} placeholder="0.00" placeholderTextColor={colors.textLight} keyboardType="numeric" value={amount} onChangeText={setAmount} />
            </View>

            <Text style={styles.modalLabel}>Note (Optional)</Text>
            <TextInput style={styles.modalInput} placeholder="What's this for?" placeholderTextColor={colors.textLight} value={note} onChangeText={setNote} />

            <TouchableOpacity style={[styles.sendBtn, sending && { opacity: 0.7 }]} onPress={handleSend} disabled={sending}>
              <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.sendGradient}>
                <Ionicons name="send" size={18} color={colors.white} />
                <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send Money'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.white },
  iconBtn: { padding: 8 },
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 4, gap: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10 },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  tabTextActive: { color: colors.secondary },
  quickSendCard: { marginHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 18 },
  quickSendLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  currencySymbol: { fontSize: 28, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginRight: 4 },
  amountInput: { fontSize: 40, fontWeight: '900', color: colors.white, flex: 1 },
  quickAmounts: { flexDirection: 'row', gap: 8 },
  quickChip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  quickChipText: { fontSize: 13, fontWeight: '600', color: colors.white },
  body: { flex: 1 },
  section: { marginTop: 24, marginHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 14 },
  addContactBtn: { alignItems: 'center', marginRight: 16 },
  addContactIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed' },
  contactItem: { alignItems: 'center', marginRight: 16 },
  contactAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  contactInitials: { fontSize: 16, fontWeight: '800', color: colors.white },
  contactName: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  searchRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 12, height: 44, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.border },
  filterChipActive: { backgroundColor: colors.secondary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  emptyBox: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 14, color: colors.textLight },
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  txAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  txName: { fontSize: 14, fontWeight: '700', color: colors.text },
  txAmount: { fontSize: 14, fontWeight: '800' },
  txMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  txNote: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  txDate: { fontSize: 11, color: colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  modalLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 10 },
  contactSelectRow: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  contactSelectItem: { alignItems: 'center', gap: 4, padding: 6, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  contactSelectActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, height: 48, marginBottom: 16 },
  input: { flex: 1, fontSize: 14, color: colors.text },
  modalAmountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 16, height: 56, marginBottom: 16 },
  modalCurrency: { fontSize: 22, fontWeight: '700', color: colors.textSecondary, marginRight: 4 },
  modalAmountInput: { flex: 1, fontSize: 28, fontWeight: '800', color: colors.text },
  modalInput: { backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, height: 48, fontSize: 14, color: colors.text, marginBottom: 22 },
  sendBtn: { borderRadius: 14, overflow: 'hidden' },
  sendGradient: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  sendBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
