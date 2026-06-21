import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { Button, Card } from '../components/UI';

const FEATURES = [
  { icon: '📋', title: 'Project plan', desc: 'Milestones & timeline', color: COLORS.primaryLight, textColor: COLORS.primaryDark },
  { icon: '📄', title: 'Report outline', desc: 'Structure & sections', color: COLORS.tealLight, textColor: COLORS.teal },
  { icon: '💬', title: 'Tutor guidance', desc: 'Questions & next steps', color: COLORS.amberLight, textColor: COLORS.amber },
  { icon: '✅', title: 'Checklist', desc: 'Rubric-aligned review', color: COLORS.coralLight, textColor: COLORS.coral },
];

const TIPS = [
  { num: '01', text: 'Paste your full assignment prompt for best results' },
  { num: '02', text: 'Add your rubric to get a personalised checklist' },
  { num: '03', text: 'Set a deadline and we\'ll pace your milestones' },
];

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>🎓</Text>
          </View>
          <Text style={styles.heroEyebrow}>AI-powered academic tutor</Text>
          <Text style={styles.heroTitle}>Turn any assignment into a clear action plan</Text>
          <Text style={styles.heroSub}>
            Paste your prompt, get a personalised project plan, structured outline, and tutor guidance — in seconds.
          </Text>
        </View>

        <View style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <View key={f.title} style={[styles.featureCard, { backgroundColor: f.color }, SHADOWS.soft]}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureTitle, { color: f.textColor }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: f.textColor, opacity: 0.75 }]}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <Button
          title="Start my assignment"
          onPress={() => navigation.navigate('Form')}
          style={styles.cta}
        />

        <Card style={styles.tipsCard}>
          <Text style={styles.tipsLabel}>Tips for best results</Text>
          {TIPS.map((t) => (
            <View key={t.num} style={styles.tipRow}>
              <View style={styles.tipNum}>
                <Text style={styles.tipNumText}>{t.num}</Text>
              </View>
              <Text style={styles.tipText}>{t.text}</Text>
            </View>
          ))}
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🔒 Your assignment prompt is never stored</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SIZES.paddingLg, paddingBottom: 40 },

  hero: { alignItems: 'center', marginBottom: 28, paddingTop: 12 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    ...SHADOWS.soft,
  },
  heroEmoji: { fontSize: 34 },
  heroEyebrow: {
    fontSize: SIZES.xs, fontWeight: '700', letterSpacing: 1.2,
    color: COLORS.primary, textTransform: 'uppercase', marginBottom: 8,
  },
  heroTitle: {
    fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text,
    textAlign: 'center', lineHeight: 34, letterSpacing: -0.5, marginBottom: 10,
  },
  heroSub: {
    fontSize: SIZES.base, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },

  featureGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  featureCard: {
    width: '47.5%', borderRadius: SIZES.radiusLg,
    padding: 14, minHeight: 90,
  },
  featureIcon: { fontSize: 22, marginBottom: 6 },
  featureTitle: { fontSize: SIZES.base, fontWeight: '700', marginBottom: 2 },
  featureDesc: { fontSize: SIZES.xs, fontWeight: '500' },

  cta: { marginBottom: 20 },

  tipsCard: { marginBottom: 16 },
  tipsLabel: {
    fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  tipNumText: { fontSize: 10, fontWeight: '800', color: COLORS.primary },
  tipText: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18 },

  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { fontSize: SIZES.xs, color: COLORS.textTertiary },
});