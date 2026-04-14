import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  FlatList, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    key: 'welcome',
    icon: 'wallet-outline',
    iconColor: '#00D4A1',
    gradient: ['#0A1628', '#1C3D6E'],
    title: 'Welcome to HAY-M',
    subtitle: 'Your smart savings & investment companion. Built for the UK. Built for you.',
    badge: '🇬🇧 FCA Sandbox',
  },
  {
    key: 'save',
    icon: 'flag-outline',
    iconColor: '#F4A261',
    gradient: ['#0A1628', '#2D1B4E'],
    title: 'Save With Purpose',
    subtitle: 'Set savings goals — holiday, house, car — and watch your money grow with automatic round-ups.',
    badge: '🎯 Goals & Round-ups',
  },
  {
    key: 'invest',
    icon: 'trending-up-outline',
    iconColor: '#A855F7',
    gradient: ['#0A1628', '#1A2E4E'],
    title: 'Invest Confidently',
    subtitle: 'Start investing from £1. Choose beginner-friendly portfolios matched to your risk level.',
    badge: '📈 From £1',
  },
  {
    key: 'ready',
    icon: 'shield-checkmark-outline',
    iconColor: '#10B981',
    gradient: ['#0A1628', '#1C3D6E'],
    title: 'Secure & Transparent',
    subtitle: 'No hidden fees. FCA sandbox environment. Your money and data are always protected.',
    badge: '🔐 Bank-level Security',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => handleFinish();

  const handleFinish = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.replace('Login');
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <LinearGradient colors={item.gradient} style={styles.slideGradient}>
        {/* Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        </View>

        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: item.iconColor + '22', borderColor: item.iconColor + '44' }]}>
          <Ionicons name={item.icon} size={64} color={item.iconColor} />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={e => setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={16}
      />

      {/* Bottom controls */}
      <LinearGradient colors={['#0A1628', '#0D1F3C']} style={styles.controls}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const opacity  = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
            return (
              <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>{isLast ? '' : 'Skip'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.nextGradient}>
              <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
              <Ionicons name={isLast ? 'checkmark-outline' : 'arrow-forward-outline'} size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Already have account */}
        <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '800' }}>Log In</Text></Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#0A1628' },
  slide:          { width, height: height * 0.68 },
  slideGradient:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  badgeRow:       { position: 'absolute', top: 60, alignSelf: 'center' },
  badge:          { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  badgeText:      { color: '#fff', fontSize: 13, fontWeight: '700' },
  iconCircle:     { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 36 },
  textBlock:      { alignItems: 'center' },
  slideTitle:     { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 14 },
  slideSubtitle:  { fontSize: 15, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 24 },
  controls:       { flex: 1, paddingHorizontal: 28, paddingBottom: 20 },
  dots:           { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 20 },
  dot:            { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  btnRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  skipBtn:        { padding: 12, minWidth: 60 },
  skipText:       { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '600' },
  nextBtn:        { borderRadius: 16, overflow: 'hidden' },
  nextGradient:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 14 },
  nextText:       { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink:      { alignItems: 'center', paddingVertical: 8 },
  loginLinkText:  { color: 'rgba(255,255,255,0.55)', fontSize: 13 },
});
