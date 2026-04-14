import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { walletService } from '../services/walletService';

const { width } = Dimensions.get('window');

const TOPUP_QUICK = ['10', '50', '100', '500'];
const CARD_GRADIENTS = [
  ['#0A1628', '#1C3D6E'],
  ['#065F46', '#047857'],
  ['#4C1D95', '#6D28D9'],
  ['#7C2D12', '#B45309'],
  ['#1E3A5F', '#2563EB'],
];

function CreditCard({ card, isActive, onPress }) {
  const gradient = Array.isArray(card.gradient) && card.gradient.length >= 2
    ? card.gradient
    : ['#0A1628', '#1C3D6E'];

  return (
    <TouchableOpacity
      style={[styles.card, { width: width - 60, marginRight: 16 }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient colors={gradient} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.cardBank}>{card.bank}</Text>
            {card.isDefault && (
              <View style={styles.defaultChip}>
                <Text style={styles.defaultChipText}>Default</Text>
              </View>
            )}
            {card.isFrozen && (
              <View style={[styles.defaultChip, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.defaultChipText}>Frozen</Text>
              </View>
            )}
          </View>
          <View style={styles.cardTypeBox}>
            <Text style={styles.cardType}>{card.type}</Text>
          </View>
        </View>
        <View style={styles.chip}>
          <View style={styles.chipLine1} />
          <View style={styles.chipLine2} />
        </View>
        <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardLabel}>Card Holder</Text>
            <Text style={styles.cardHolder}>{card.holder}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Expires</Text>
            <Text style={styles.cardExpiry}>{card.expiry}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Balance</Text>
            <Text style={styles.cardBalance}>
              £{Number(card.balance ?? 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <View style={styles.cardCircle1} />
        <View style={styles.cardCircle2} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function WalletScreen({ hideSafeArea = false } = {}) {
  const insets = useSafeAreaInsets();

  const [cards, setCards]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activeTab, setActiveTab]       = useState('cards');

  // Add Card modal
  const [addCardModal, setAddCardModal] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [newCard, setNewCard]           = useState({
    bank: '', number: '', holder: '', expiry: '', cvv: '', gradientIdx: 0,
  });

  // Link Bank Account modal
  const [addBankModal, setAddBankModal] = useState(false);
  const [savingBank, setSavingBank]     = useState(false);
  const [newBank, setNewBank]           = useState({
    bank: '', accountNumber: '', holder: '', accountType: 'Savings',
  });

  // Top Up modal
  const [topUpModal, setTopUpModal]     = useState(false);
  const [topUpAmount, setTopUpAmount]   = useState('');
  const [toppingUp, setToppingUp]       = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchCards = useCallback(async () => {
    try {
      const res = await walletService.getCards();
      setCards(res.data);
    } catch (err) {
      console.warn('Cards fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const onRefresh = () => { setRefreshing(true); fetchCards(); };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const totalBalance = cards.reduce((sum, c) => sum + (c.balance ?? 0), 0);
  const debitCards   = cards.filter(c => c.accountType !== 'bank');
  const bankAccounts = cards.filter(c => c.accountType === 'bank');
  const activeCard   = debitCards[activeCardIndex];

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAddCard = async () => {
    if (!newCard.bank || !newCard.number || !newCard.holder || !newCard.expiry) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const stripped = newCard.number.replace(/\s/g, '');
      const last4    = stripped.slice(-4);
      const type     = stripped.startsWith('4') ? 'Visa' : 'Mastercard';
      const gradient = CARD_GRADIENTS[newCard.gradientIdx];
      const res = await walletService.addCard({
        type, bank: newCard.bank, last4,
        holder: newCard.holder.toUpperCase(),
        expiry: newCard.expiry, gradient,
        accountType: 'card',
      });
      setCards(prev => [...prev, res.data]);
      setNewCard({ bank: '', number: '', holder: '', expiry: '', cvv: '', gradientIdx: 0 });
      setAddCardModal(false);
      Alert.alert('Card Added', `Your ${type} card ending in ${last4} has been added.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBank = async () => {
    if (!newBank.bank || !newBank.accountNumber || !newBank.holder) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setSavingBank(true);
    try {
      const last4    = newBank.accountNumber.slice(-4);
      const gradient = ['#1C3D6E', '#0A1628'];
      const res = await walletService.addCard({
        type: 'Visa',
        bank: newBank.bank,
        last4,
        holder: newBank.holder.toUpperCase(),
        expiry: '••/••',
        gradient,
        accountType: 'bank',
        accountNumber: newBank.accountNumber,
      });
      setCards(prev => [...prev, res.data]);
      setNewBank({ bank: '', accountNumber: '', holder: '', accountType: 'Savings' });
      setAddBankModal(false);
      Alert.alert('Account Linked', `${newBank.bank} account ending in ${last4} has been linked.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingBank(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await walletService.setDefault(id);
      setCards(prev => prev.map(c => ({ ...c, isDefault: c._id === id })));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleFreeze = async (id) => {
    try {
      const res = await walletService.toggleFreeze(id);
      setCards(prev => prev.map(c => c._id === id ? res.data : c));
      Alert.alert(
        res.data.isFrozen ? 'Card Frozen' : 'Card Unfrozen',
        res.data.isFrozen
          ? 'Your card has been temporarily frozen.'
          : 'Your card is active again.',
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleTopUp = async () => {
    const amt = parseFloat(topUpAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!activeCard) return;
    setToppingUp(true);
    try {
      const res = await walletService.topUp(activeCard._id, amt);
      setCards(prev => prev.map(c => c._id === res.data._id ? res.data : c));
      setTopUpModal(false);
      setTopUpAmount('');
      Alert.alert(
        'Top Up Successful!',
        `£${amt.toFixed(2)} added to card ••••${activeCard.last4}\nNew balance: £${res.data.balance.toFixed(2)}`,
      );
    } catch (err) {
      Alert.alert('Top Up Failed', err.message);
    } finally {
      setToppingUp(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Remove Card', 'This action cannot be undone.', [
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            await walletService.deleteCard(id);
            const newCards = cards.filter(c => c._id !== id);
            setCards(newCards);
            setActiveCardIndex(0);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: hideSafeArea ? 0 : insets.top }]}>
      {/* ── Header ── */}
      <LinearGradient colors={['#0A1628', '#1C3D6E']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <TouchableOpacity onPress={() => setAddCardModal(true)}>
            <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.walletSummary}>
          <Text style={styles.walletLabel}>Total Available Balance</Text>
          <Text style={styles.walletTotal}>
            £{totalBalance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.walletSubtitle}>
            {debitCards.length} card{debitCards.length !== 1 ? 's' : ''}
            {bankAccounts.length > 0 ? ` · ${bankAccounts.length} bank account${bankAccounts.length !== 1 ? 's' : ''}` : ''}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ── Tabs ── */}
        <View style={styles.tabRow}>
          {['cards', 'accounts'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={tab === 'cards' ? 'card-outline' : 'business-outline'}
                size={16}
                color={activeTab === tab ? colors.white : colors.textSecondary}
              />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'cards' ? 'Cards' : 'Bank Accounts'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══════════════════════════════════════════════════════════════════════
            CARDS TAB
           ═══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'cards' ? (
          <>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            ) : (
              <>
                {/* Card Carousel */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.cardsScroll}
                  contentContainerStyle={{ paddingLeft: 20, paddingRight: 4, paddingVertical: 4 }}
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 60 + 16));
                    setActiveCardIndex(Math.max(0, Math.min(idx, debitCards.length - 1)));
                  }}
                  snapToInterval={width - 60 + 16}
                  decelerationRate="fast"
                >
                  {debitCards.map((card, i) => (
                    <CreditCard
                      key={String(card._id)}
                      card={card}
                      isActive={i === activeCardIndex}
                      onPress={() => setActiveCardIndex(i)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addCardSlot}
                    onPress={() => setAddCardModal(true)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.addCardInner}>
                      <Ionicons name="add-circle-outline" size={36} color={colors.primary} />
                      <Text style={styles.addCardText}>Add New Card</Text>
                    </View>
                  </TouchableOpacity>
                </ScrollView>

                {/* Dot indicators */}
                <View style={styles.dotsRow}>
                  {debitCards.map((_, i) => (
                    <View key={i} style={[styles.dot, i === activeCardIndex && styles.dotActive]} />
                  ))}
                </View>

                {/* Card Actions */}
                {activeCard && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Card Actions</Text>
                    <View style={styles.cardActions}>
                      {[
                        {
                          icon: 'add-circle-outline',
                          label: 'Top Up',
                          color: colors.primary,
                          action: () => { setTopUpAmount(''); setTopUpModal(true); },
                        },
                        {
                          icon: 'star-outline',
                          label: 'Set Default',
                          color: '#3B82F6',
                          action: () => handleSetDefault(activeCard._id),
                        },
                        {
                          icon: activeCard.isFrozen ? 'flame-outline' : 'lock-closed-outline',
                          label: activeCard.isFrozen ? 'Unfreeze' : 'Freeze',
                          color: '#F59E0B',
                          action: () => handleFreeze(activeCard._id),
                        },
                        {
                          icon: 'trash-outline',
                          label: 'Remove',
                          color: colors.error,
                          destructive: true,
                          action: () => handleDelete(activeCard._id),
                        },
                      ].map((a, i) => (
                        <TouchableOpacity key={i} style={styles.cardActionBtn} onPress={a.action}>
                          <View style={[styles.cardActionIcon, { backgroundColor: (a.color) + '15' }]}>
                            <Ionicons name={a.icon} size={20} color={a.color} />
                          </View>
                          <Text style={[styles.cardActionLabel, { color: a.color }]}>{a.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Card Details */}
                {activeCard && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Card Details</Text>
                    <View style={styles.detailCard}>
                      {[
                        { label: 'Card Type', value: activeCard.type },
                        { label: 'Bank', value: activeCard.bank },
                        { label: 'Card Number', value: `•••• •••• •••• ${activeCard.last4}` },
                        { label: 'Expires', value: activeCard.expiry },
                        { label: 'Status', value: activeCard.isFrozen ? '🔒 Frozen' : activeCard.isDefault ? '✅ Default' : 'Active' },
                        { label: 'Available Balance', value: `£${Number(activeCard.balance ?? 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
                      ].map((item, i, arr) => (
                        <View key={i} style={[styles.detailRow, i < arr.length - 1 && styles.detailRowBorder]}>
                          <Text style={styles.detailLabel}>{item.label}</Text>
                          <Text style={styles.detailValue}>{item.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {debitCards.length === 0 && (
                  <View style={styles.emptyBox}>
                    <Ionicons name="card-outline" size={48} color={colors.textLight} />
                    <Text style={styles.emptyTitle}>No cards added</Text>
                    <Text style={styles.emptySubtitle}>Tap + to add your first card</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════════
              BANK ACCOUNTS TAB
             ═══════════════════════════════════════════════════════════════════════ */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Linked Bank Accounts</Text>

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : bankAccounts.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="business-outline" size={48} color={colors.textLight} />
                <Text style={styles.emptyTitle}>No bank accounts linked</Text>
                <Text style={styles.emptySubtitle}>Link your bank account to get started</Text>
              </View>
            ) : (
              bankAccounts.map(acc => (
                <View key={String(acc._id)} style={styles.bankCard}>
                  <LinearGradient
                    colors={Array.isArray(acc.gradient) && acc.gradient.length >= 2 ? acc.gradient : ['#1C3D6E', '#0A1628']}
                    style={styles.bankIconGradient}
                  >
                    <Ionicons name="business-outline" size={20} color={colors.white} />
                  </LinearGradient>
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankName}>{acc.bank}</Text>
                    <Text style={styles.bankType}>Bank Account · ••••{acc.last4}</Text>
                    <Text style={styles.bankHolder}>{acc.holder}</Text>
                  </View>
                  <View style={styles.bankRight}>
                    <Text style={styles.bankBalance}>
                      £{Number(acc.balance ?? 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
                  </View>
                </View>
              ))
            )}

            {/* Link Bank Account button */}
            <TouchableOpacity style={styles.addBankBtn} onPress={() => setAddBankModal(true)} activeOpacity={0.8}>
              <View style={styles.addBankIcon}>
                <Ionicons name="add" size={22} color={colors.primary} />
              </View>
              <Text style={styles.addBankText}>Link Bank Account</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ═══════════════════════════════════════════════════════════════════════
          TOP UP MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal visible={topUpModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Top Up Card</Text>
                {activeCard && (
                  <Text style={styles.modalSubtitle}>
                    {activeCard.bank} ••••{activeCard.last4} · Balance: £{(activeCard.balance ?? 0).toFixed(2)}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => { setTopUpModal(false); setTopUpAmount(''); }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Amount to add</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountCurrency}>£</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                keyboardType="numeric"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                autoFocus
              />
            </View>

            {/* Quick chips */}
            <View style={styles.quickRow}>
              {TOPUP_QUICK.map(a => (
                <TouchableOpacity
                  key={a}
                  style={[styles.quickChip, topUpAmount === a && styles.quickChipActive]}
                  onPress={() => setTopUpAmount(a)}
                >
                  <Text style={[styles.quickChipText, topUpAmount === a && styles.quickChipTextActive]}>
                    £{a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, (toppingUp || !topUpAmount || parseFloat(topUpAmount || 0) <= 0) && { opacity: 0.5 }]}
              onPress={handleTopUp}
              disabled={toppingUp || !topUpAmount || parseFloat(topUpAmount || 0) <= 0}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.confirmGradient}>
                {toppingUp ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color={colors.white} />
                    <Text style={styles.confirmBtnText}>
                      Add {topUpAmount ? `£${topUpAmount}` : ''} to Card
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD CARD MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal visible={addCardModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setAddCardModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {[
              { key: 'bank',   label: 'Bank Name',         placeholder: 'e.g. Chase, Barclays',   keyboard: 'default',  icon: 'business-outline' },
              { key: 'number', label: 'Card Number',        placeholder: '1234 5678 9012 3456',    keyboard: 'numeric',  icon: 'card-outline' },
              { key: 'holder', label: 'Cardholder Name',    placeholder: 'JOHN DOE',               keyboard: 'default',  icon: 'person-outline' },
              { key: 'expiry', label: 'Expiry (MM/YY)',     placeholder: 'MM/YY',                  keyboard: 'numeric',  icon: 'calendar-outline' },
              { key: 'cvv',    label: 'CVV',                placeholder: '•••',                    keyboard: 'numeric',  icon: 'lock-closed-outline', secure: true },
            ].map(field => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <View style={styles.inputRow}>
                  <Ionicons name={field.icon} size={18} color={colors.textLight} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textLight}
                    keyboardType={field.keyboard}
                    value={newCard[field.key]}
                    onChangeText={v => setNewCard(p => ({ ...p, [field.key]: v }))}
                    secureTextEntry={field.secure}
                    autoCapitalize={field.key === 'holder' ? 'characters' : 'none'}
                  />
                </View>
              </View>
            ))}

            {/* Card colour picker */}
            <Text style={styles.inputLabel}>Card Colour</Text>
            <View style={styles.gradientRow}>
              {CARD_GRADIENTS.map((g, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setNewCard(p => ({ ...p, gradientIdx: i }))}
                  style={[styles.gradientSwatch, newCard.gradientIdx === i && styles.gradientSwatchActive]}
                >
                  <LinearGradient colors={g} style={styles.gradientSwatchInner} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, saving && { opacity: 0.7 }]}
              onPress={handleAddCard}
              disabled={saving}
            >
              <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.confirmGradient}>
                <Text style={styles.confirmBtnText}>{saving ? 'Adding...' : 'Add Card'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════════
          LINK BANK ACCOUNT MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      <Modal visible={addBankModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Bank Account</Text>
              <TouchableOpacity onPress={() => setAddBankModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {[
              { key: 'bank',          label: 'Bank Name',         placeholder: 'e.g. Barclays, HSBC',   icon: 'business-outline' },
              { key: 'accountNumber', label: 'Account Number',    placeholder: '12345678',               icon: 'keypad-outline', keyboard: 'numeric' },
              { key: 'holder',        label: 'Account Holder',    placeholder: 'JANE DOE',               icon: 'person-outline' },
            ].map(field => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <View style={styles.inputRow}>
                  <Ionicons name={field.icon} size={18} color={colors.textLight} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textLight}
                    keyboardType={field.keyboard ?? 'default'}
                    value={newBank[field.key]}
                    onChangeText={v => setNewBank(p => ({ ...p, [field.key]: v }))}
                    autoCapitalize={field.key === 'holder' ? 'characters' : 'none'}
                  />
                </View>
              </View>
            ))}

            {/* Account type selector */}
            <Text style={styles.inputLabel}>Account Type</Text>
            <View style={styles.accountTypeRow}>
              {['Savings', 'Checking', 'Current'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.accountTypeBtn, newBank.accountType === t && styles.accountTypeBtnActive]}
                  onPress={() => setNewBank(p => ({ ...p, accountType: t }))}
                >
                  <Text style={[styles.accountTypeBtnText, newBank.accountType === t && styles.accountTypeBtnTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.secureNote}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
              <Text style={styles.secureNoteText}>Your account details are encrypted and secure</Text>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, savingBank && { opacity: 0.7 }]}
              onPress={handleAddBank}
              disabled={savingBank}
            >
              <LinearGradient colors={['#1C3D6E', '#0A1628']} style={styles.confirmGradient}>
                <Ionicons name="link-outline" size={20} color={colors.white} />
                <Text style={styles.confirmBtnText}>{savingBank ? 'Linking...' : 'Link Account'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background },
  header:      { paddingBottom: 24 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.white },

  walletSummary: { paddingHorizontal: 20, alignItems: 'center', paddingBottom: 4 },
  walletLabel:   { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  walletTotal:   { fontSize: 34, fontWeight: '900', color: colors.white },
  walletSubtitle:{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 },

  body:   { flex: 1 },
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, marginBottom: 16, backgroundColor: colors.border, borderRadius: 14, padding: 4, gap: 4 },
  tab:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabActive:     { backgroundColor: colors.secondary },
  tabText:       { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  // Card carousel
  cardsScroll: { marginBottom: 12 },
  card:        { borderRadius: 22, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 16 },
  cardGradient:{ padding: 22, height: 200, position: 'relative', overflow: 'hidden' },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardBank:    { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  defaultChip: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  defaultChipText: { fontSize: 10, fontWeight: '700', color: colors.secondary },
  cardTypeBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cardType:    { fontSize: 13, fontWeight: '800', color: colors.white },
  chip:        { width: 40, height: 30, backgroundColor: 'rgba(255,215,0,0.85)', borderRadius: 6, marginBottom: 16, overflow: 'hidden', justifyContent: 'center' },
  chipLine1:   { height: 10, backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 2 },
  chipLine2:   { height: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
  cardNumber:  { fontSize: 18, fontWeight: '700', color: colors.white, letterSpacing: 2, marginBottom: 16 },
  cardBottom:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardLabel:   { fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardHolder:  { fontSize: 12, fontWeight: '700', color: colors.white },
  cardExpiry:  { fontSize: 13, fontWeight: '700', color: colors.white },
  cardBalance: { fontSize: 14, fontWeight: '800', color: colors.white },
  cardCircle1: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.04)', top: -40, right: -40 },
  cardCircle2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -30, left: 100 },
  addCardSlot: { width: width - 60, height: 200, borderRadius: 22, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginRight: 16, backgroundColor: colors.background },
  addCardInner:{ alignItems: 'center', gap: 8 },
  addCardText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  dotsRow:     { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8 },
  dot:         { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.border },
  dotActive:   { backgroundColor: colors.primary, width: 22 },

  // Section
  section:      { marginHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 14 },
  emptyBox:     { alignItems: 'center', paddingVertical: 50, gap: 8 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  emptySubtitle:{ fontSize: 13, color: colors.textLight },

  // Card actions (4 buttons)
  cardActions:     { flexDirection: 'row', justifyContent: 'space-around' },
  cardActionBtn:   { alignItems: 'center', gap: 8 },
  cardActionIcon:  { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
  cardActionLabel: { fontSize: 11, fontWeight: '600' },

  // Card details
  detailCard:      { backgroundColor: colors.white, borderRadius: 18, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8 },
  detailRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel:     { fontSize: 13, color: colors.textSecondary },
  detailValue:     { fontSize: 13, fontWeight: '700', color: colors.text },

  // Bank accounts tab
  bankCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 18, padding: 16, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
  bankIconGradient:{ width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  bankInfo:        { flex: 1 },
  bankName:        { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  bankType:        { fontSize: 12, color: colors.textLight },
  bankHolder:      { fontSize: 11, color: colors.textLight, marginTop: 1 },
  bankRight:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bankBalance:     { fontSize: 14, fontWeight: '800', color: colors.text },
  addBankBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 18, padding: 16, marginTop: 4, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed' },
  addBankIcon:     { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  addBankText:     { flex: 1, fontSize: 14, fontWeight: '600', color: colors.primary },

  // Modals shared
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, maxHeight: '90%' },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: colors.text },
  modalSubtitle:{ fontSize: 12, color: colors.textSecondary, marginTop: 3 },

  inputGroup:  { marginBottom: 14 },
  inputLabel:  { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 7 },
  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, height: 50 },
  input:       { flex: 1, fontSize: 14, color: colors.text },

  // Card colour picker
  gradientRow:         { flexDirection: 'row', gap: 10, marginBottom: 20 },
  gradientSwatch:      { width: 44, height: 44, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  gradientSwatchActive:{ borderColor: colors.primary },
  gradientSwatchInner: { flex: 1 },

  // Top Up modal
  amountRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 14, borderWidth: 2, borderColor: colors.border, paddingHorizontal: 16, height: 64, marginBottom: 16 },
  amountCurrency:{ fontSize: 28, fontWeight: '700', color: colors.textSecondary, marginRight: 4 },
  amountInput:   { flex: 1, fontSize: 34, fontWeight: '900', color: colors.text },
  quickRow:      { flexDirection: 'row', gap: 8, marginBottom: 20 },
  quickChip:     { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  quickChipActive:    { backgroundColor: colors.primary, borderColor: colors.primary },
  quickChipText:      { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  quickChipTextActive:{ color: colors.white },

  // Account type selector
  accountTypeRow:        { flexDirection: 'row', gap: 8, marginBottom: 16 },
  accountTypeBtn:        { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  accountTypeBtnActive:  { backgroundColor: colors.secondary, borderColor: colors.secondary },
  accountTypeBtnText:    { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  accountTypeBtnTextActive: { color: colors.white },

  // Secure note
  secureNote:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.successLight, borderRadius: 10, padding: 10, marginBottom: 18 },
  secureNoteText: { fontSize: 12, color: colors.success, flex: 1 },

  // Confirm button
  confirmBtn:     { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  confirmGradient:{ height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  confirmBtnText: { fontSize: 15, fontWeight: '800', color: colors.white },
});
