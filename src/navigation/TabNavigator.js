import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import DashboardScreen      from '../screens/DashboardScreen';
import SavingsScreen        from '../screens/SavingsScreen';
import InvestStackNavigator from './InvestStackNavigator';
import PaymentsWalletScreen from '../screens/PaymentsWalletScreen';
import ProfileScreen        from '../screens/ProfileScreen';
import MoreStackNavigator   from './MoreStackNavigator';

const Tab = createBottomTabNavigator();

// ── Inline upgrade wall shown when a Free user taps the Invest tab ────────────
function LockedInvestScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center', padding: 32, paddingTop: insets.top + 20 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🔒</Text>
      <Text style={{ fontSize: 22, fontWeight: '900', color: '#0A1628', marginBottom: 8, textAlign: 'center' }}>
        Invest is a Plus Feature
      </Text>
      <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
        Upgrade to Plus or Pro to access investment tools, portfolio tracking, and AI-powered investing.
      </Text>
      <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '100%', marginBottom: 20, borderWidth: 1.5, borderColor: '#00D4A1' }}>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#0A1628', marginBottom: 4 }}>Plus Plan</Text>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#00D4A1', marginBottom: 12 }}>
          £3{' '}
          <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '400' }}>/month</Text>
        </Text>
        {['Unlimited savings goals', 'Investment starter', 'ISA access', 'Spending insights', 'Notifications'].map((f) => (
          <Text key={f} style={{ color: '#0A1628', fontSize: 13, marginBottom: 4 }}>✓ {f}</Text>
        ))}
        <TouchableOpacity
          onPress={() => Alert.alert('Coming Soon', 'Upgrade flow launching soon!')}
          style={{ marginTop: 16, backgroundColor: '#00D4A1', borderRadius: 12, padding: 14, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Upgrade to Plus →</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>
        Already upgraded? Log out and back in to refresh.
      </Text>
    </View>
  );
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  // bottomPad: at least 8px, or the system gesture bar height — whichever is bigger
  const bottomPad = Math.max(insets.bottom, 8);

  const userPlan  = user?.plan || 'free';
  const canInvest = userPlan === 'plus' || userPlan === 'pro';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.tabBar, { paddingBottom: bottomPad, height: 52 + bottomPad }],
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'home'          : 'home-outline',
            Savings:   focused ? 'leaf'           : 'leaf-outline',
            Invest:    focused ? 'bar-chart'      : 'bar-chart-outline',
            Payments:  focused ? 'card'            : 'card-outline',
            Profile:   focused ? 'person'          : 'person-outline',
            More:      focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline',
          };
          if (route.name === 'Invest') {
            return (
              <View style={focused ? styles.investIconActive : styles.investIcon}>
                <Ionicons name={icons[route.name]} size={20} color={focused ? colors.secondary : color} />
              </View>
            );
          }
          if (route.name === 'More') {
            return (
              <View style={focused ? styles.moreIconActive : styles.moreIcon}>
                <Ionicons name={icons[route.name]} size={20} color={focused ? colors.secondary : color} />
              </View>
            );
          }
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Savings"   component={SavingsScreen} />
      <Tab.Screen name="Invest"    component={canInvest ? InvestStackNavigator : LockedInvestScreen} />
      <Tab.Screen name="Payments"  component={PaymentsWalletScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
      <Tab.Screen name="More"      component={MoreStackNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  investIcon: {
    width: 40,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  investIconActive: {
    width: 44,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  moreIcon: {
    width: 40,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  moreIconActive: {
    width: 44,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
