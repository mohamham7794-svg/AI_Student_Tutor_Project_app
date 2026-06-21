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
import { registerUser } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerUser({ name: name.trim(), email: email.trim(), password });
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
            <Text style={styles.heroTitle}>Create your account</Text>
            <Text style={styles.heroSub}>
              Sign up to start planning your assignments.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jane Doe"
              placeholderTextColor={COLORS.textTertiary}
              value={name}
              onChangeText={(v) => { setName(v); setError(''); }}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
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
              style={styles.input}
              placeholder="At least 8 characters"
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
            title={loading ? 'Creating account...' : 'Sign up'}
            onPress={handleRegister}
            loading={loading}
            style={styles.registerBtn}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign in</Text>
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
    letterSpacing: -0.5, marginBottom: 8, textAlign: 'center',
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

  errorBox: {
    backgroundColor: COLORS.dangerLight, borderRadius: SIZES.radiusMd,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F7C1C1',
  },
  errorText: { fontSize: SIZES.sm, color: COLORS.danger, lineHeight: 18 },

  registerBtn: { marginTop: 8 },

  loginLink: { alignItems: 'center', paddingVertical: 16 },
  loginLinkText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  loginLinkBold: { color: COLORS.primary, fontWeight: '700' },
});