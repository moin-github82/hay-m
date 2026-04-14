import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MoreMenuScreen      from '../screens/MoreMenuScreen';
import InsightsScreen      from '../screens/InsightsScreen';
import ISAScreen           from '../screens/ISAScreen';
import FeesScreen          from '../screens/FeesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import UpgradeScreen       from '../screens/UpgradeScreen';

const Stack = createStackNavigator();

export default function MoreStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="MoreMenu"       component={MoreMenuScreen}      />
      <Stack.Screen name="Insights"       component={InsightsScreen}      />
      <Stack.Screen name="ISA"            component={ISAScreen}           />
      <Stack.Screen name="Fees"           component={FeesScreen}          />
      <Stack.Screen name="Notifications"  component={NotificationsScreen} />
      <Stack.Screen name="Upgrade"        component={UpgradeScreen}       />
    </Stack.Navigator>
  );
}
