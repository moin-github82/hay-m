import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import OnboardingScreen from '../screens/OnboardingScreen';
import SplashScreen     from '../screens/auth/SplashScreen';
import LoginScreen      from '../screens/auth/LoginScreen';
import SignupScreen     from '../screens/auth/SignupScreen';
import TabNavigator     from './TabNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [checkingOnboard, setCheckingOnboard] = useState(true);
  const [hasOnboarded,    setHasOnboarded]    = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('hasOnboarded').then(val => {
      setHasOnboarded(val === 'true');
      setCheckingOnboard(false);
    });
  }, []);

  if (loading || checkingOnboard) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : hasOnboarded ? (
          <>
            <Stack.Screen name="Splash"  component={SplashScreen} />
            <Stack.Screen name="Login"   component={LoginScreen} />
            <Stack.Screen name="Signup"  component={SignupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Splash"     component={SplashScreen} />
            <Stack.Screen name="Login"      component={LoginScreen} />
            <Stack.Screen name="Signup"     component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
