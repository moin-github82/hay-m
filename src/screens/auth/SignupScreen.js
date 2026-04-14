import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSignup = async () => {
    if (!form.fullName || !form.email || !form.phone || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Please accept the Terms & Conditions');
      return;
    }
    setLoading(true);
    try {
      await signup({ fullName: form.fullName, email: form.email.trim(), phone: form.phone, password: form.password });
      // AuthContext sets user → AppNavigator auto-redirects to Main
    } catch (err) {
      Alert.alert('Sign Up Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0A1628', '#1C3D6E']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>∞</Text>
          </View>
          <Text style={styles.appName}>HAY-M</Text>
          <Text style={styles.welcome}>Create your account</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>Start your micro-savings journey today</Text>

          {[
            { key: 'fullName', label: 'Full Name', icon: 'person-outline', placeholder: 'John Doe', keyboard: 'default' },
            { key: 'email', label: 'Email Address', icon: 'mail-outline', placeholder: 'you@example.com', keyboard: 'email-address' },
            { key: 'phone', label: 'Phone Number', icon: 'call-outline', placeholder: '+1 234 567 8900', keyboard: 'phone-pad' },
          ].map(field => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name={field.icon} size={20} color={colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textLight}
                  value={form[field.key]}
                  onChangeText={v => update(field.key, v)}
                  keyboardType={field.keyboard}
                  autoCapitalize={field.key === 'fullName' ? 'words' : 'none'}
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.textLight}
                value={form.password}
                onChangeText={v => update('password', v)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye' : 'eye-off-outline'} size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor={colors.textLight}
                value={form.confirmPassword}
                onChangeText={v => update('confirmPassword', v)}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={14} color={colors.white} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signupBtn, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient colors={['#00D4A1', '#00A87F']} style={styles.signupGradient}>
              <Text style={styles.signupBtnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 36, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backBtn: { position: 'absolute', top: 52, left: 20, width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  logoBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoText: { fontSize: 26, fontWeight: '900', color: colors.white },
  appName: { fontSize: 22, fontWeight: '900', color: colors.white, letterSpacing: 4 },
  welcome: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  card: { backgroundColor: colors.white, marginHorizontal: 20, marginTop: -16, borderRadius: 24, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, marginBottom: 30 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 22 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 7 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: 14, height: 50 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: colors.text },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22, gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  termsLink: { color: colors.primary, fontWeight: '600' },
  signupBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 22 },
  signupGradient: { height: 52, alignItems: 'center', justifyContent: 'center' },
  signupBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: colors.textSecondary },
  loginLink: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
