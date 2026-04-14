import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import SavingsTrackerScreen from './SavingsTrackerScreen';
import SavingGoalsScreen from './SavingGoalsScreen';

export default function SavingsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('tracker');

  // Allow other screens to deep-link to a specific sub-tab
  // e.g. navigation.navigate('Savings', { tab: 'goals' })
  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(route.params.tab);
    }
  }, [route?.params?.tab]);

  return (
    <View style={styles.root}>
      {/* ── Sub-tab switcher (handles safe area top) ── */}
      <View style={[styles.tabBar, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracker' && styles.tabActive]}
          onPress={() => setActiveTab('tracker')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'tracker' ? 'cash' : 'cash-outline'}
            size={16}
            color={activeTab === 'tracker' ? colors.primary : 'rgba(255,255,255,0.45)'}
          />
          <Text style={[styles.tabText, activeTab === 'tracker' && styles.tabTextActive]}>
            Tracker
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.tabActive]}
          onPress={() => setActiveTab('goals')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={activeTab === 'goals' ? 'flag' : 'flag-outline'}
            size={16}
            color={activeTab === 'goals' ? colors.primary : 'rgba(255,255,255,0.45)'}
          />
          <Text style={[styles.tabText, activeTab === 'goals' && styles.tabTextActive]}>
            Goals
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Content — sub-screens skip their own safe area ── */}
      <View style={styles.content}>
        {activeTab === 'tracker'
          ? <SavingsTrackerScreen hideSafeArea navigation={navigation} />
          : <SavingGoalsScreen    hideSafeArea navigation={navigation} />
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
