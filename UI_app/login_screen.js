import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { Button } from '../components/UI';
import { loginUser } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginUser({ email: email.trim(), password });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroEmoji}>🎓</Text>
            </View>
            <Text style={styles.appName}>AI Student Tutor</Text>
            <Text style={styles.heroTitle}>Sign in</Text>
            <Text style={styles.heroSub}>
              Log in to plan your assignments and track your progress.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textTertiary}
              secureTextEntry
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Button
            title={loading ? 'Signing in...' : 'Login'}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={styles.registerLinkBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.paddingLg, paddingTop: 60, paddingBottom: 40, flexGrow: 1 },

  hero: { alignItems: 'center', marginBottom: 32 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    ...SHADOWS.soft,
  },
  heroEmoji: { fontSize: 34 },
  appName: {
    fontSize: SIZES.sm, fontWeight: '700', letterSpacing: 1.2,
    color: COLORS.primary, textTransform: 'uppercase', marginBottom: 12,
  },
  heroTitle: {
    fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text,
    letterSpacing: -0.5, marginBottom: 8,
  },
  heroSub: {
    fontSize: SIZES.base, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },

  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, height: 48,
    fontSize: SIZES.base, color: COLORS.text,
  },
  inputError: { borderColor: COLORS.danger },

  errorBox: {
    backgroundColor: COLORS.dangerLight, borderRadius: SIZES.radiusMd,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F7C1C1',
  },
  errorText: { fontSize: SIZES.sm, color: COLORS.danger, lineHeight: 18 },

  loginBtn: { marginTop: 8 },

  registerLink: { alignItems: 'center', paddingVertical: 16 },
  registerLinkText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  registerLinkBold: { color: COLORS.primary, fontWeight: '700' },
});