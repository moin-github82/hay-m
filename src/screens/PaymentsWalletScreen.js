import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import PaymentsScreen from './PaymentsScreen';
import WalletScreen from './WalletScreen';

export default function PaymentsWalletScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('payments');

  // Allow deep-linking: navigation.navigate('Payments', { tab: 'wallet' })
  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  return (
    <View style={styles.root}>
      {/* ── Sub-tab switcher ── */}
      <View style={[styles.tabBar, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.tabActive]}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'payments' ? 'send' : 'send-outline'}
            size={16}
            color={activeTab === 'payments' ? colors.primary : 'rgba(255,255,255,0.45)'}
          />
          <Text style={[styles.tabText, activeTab === 'payments' && styles.tabTextActive]}>
            Payments
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.tab, activeTab === 'wallet' && styles.tabActive]}
          onPress={() => setActiveTab('wallet')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'wallet' ? 'wallet' : 'wallet-outline'}
            size={16}
            color={activeTab === 'wallet' ? colors.primary : 'rgba(255,255,255,0.45)'}
          />
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.tabTextActive]}>
            Wallet
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {activeTab === 'payments'
          ? <PaymentsScreen hideSafeArea navigation={navigation} />
          : <WalletScreen   hideSafeArea navigation={navigation} />
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#0A1628' },
  content: { flex: 1 },

  tabBar: {
    backgroundColor: '#0A1628',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(0,212,161,0.12)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  tabTextActive: {
    color: colors.primary,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
  },
});
