import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import InvestmentScreen  from '../screens/InvestmentScreen';
import PortfolioScreen   from '../screens/PortfolioScreen';
import SavingGoalsScreen from '../screens/SavingGoalsScreen';

const Stack = createStackNavigator();

export default function InvestStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="InvestmentHub"  component={InvestmentScreen}  />
      <Stack.Screen name="Portfolio"      component={PortfolioScreen}   />
      <Stack.Screen name="GoalsFromInvest" component={SavingGoalsScreen} />
    </Stack.Navigator>
  );
}
