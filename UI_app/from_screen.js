import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { Button, Chip, Card, Divider } from '../components/UI';
import { generateTutorGuidance } from '../services/api';

const REPORT_TYPES = ['Research report', 'Lab report', 'Essay', 'Case study', 'Literature review', 'Reflective journal'];
const GRADE_LEVELS = ['Primary school', 'Grade 7–9', 'Grade 10–12', 'University Year 1–2', 'University Year 3–4', 'Postgraduate'];
const DEADLINES = ['24 hours', '3 days', '1 week', '2 weeks', '1 month', 'Custom'];

const STEPS = ['Assignment', 'Details', 'Review'];

const ProgressBar = ({ step }) => (
  <View style={styles.progress}>
    {STEPS.map((s, i) => {
      const done = i < step;
      const active = i === step;
      return (
        <React.Fragment key={s}>
          <View style={styles.stepItem}>
            <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}>
              {done ? (
                <Text style={styles.stepCheck}>✓</Text>
              ) : (
                <Text style={[styles.stepNum, active && styles.stepNumActive]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, active && styles.stepLabelActive, done && styles.stepLabelDone]}>
              {s}
            </Text>
          </View>
          {i < STEPS.length - 1 && (
            <View style={[styles.stepLine, (done || active) && styles.stepLineActive]} />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

export default function FormScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    prompt: '',
    reportType: '',
    gradeLevel: '',
    deadline: '',
    customDeadline: '',
    rubric: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const goNext = () => {
    if (step === 0 && !form.prompt.trim()) {
      setError('Please enter your assignment prompt to continue.');
      return;
    }
    setError('');
    setStep(s => s + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goBack = () => {
    setError('');
    if (step === 0) navigation.goBack();
    else setStep(s => s - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateTutorGuidance({
        assignmentPrompt: form.prompt,
        rubricText: form.rubric || undefined,
        gradeLevel: form.gradeLevel || undefined,
        deadline: form.deadline === 'Custom' ? form.customDeadline : form.deadline || undefined,
        reportType: form.reportType || undefined,
      });
      navigation.navigate('Results', { data: result, form });
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const effectiveDeadline = form.deadline === 'Custom' ? form.customDeadline : form.deadline;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New assignment</Text>
          <View style={{ width: 40 }} />
        </View>

        <ProgressBar step={step} />

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 && (
            <View>
              <Text style={styles.stepHeading}>What's your assignment? ✏️</Text>
              <Text style={styles.stepSub}>Paste the full question exactly as your teacher gave it to you.</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Assignment prompt <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.textArea, error && styles.inputError]}
                  multiline
                  numberOfLines={6}
                  placeholder="e.g. Write a report explaining the causes and impacts of climate change on local ecosystems. Include an introduction, background, 3 causes, 3 impacts, and mitigation strategies..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={form.prompt}
                  onChangeText={v => { update('prompt', v); setError(''); }}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{form.prompt.length} characters</Text>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Report type</Text>
                <View style={styles.chipWrap}>
                  {REPORT_TYPES.map(t => (
                    <Chip
                      key={t}
                      label={t}
                      selected={form.reportType === t}
                      onPress={() => update('reportType', form.reportType === t ? '' : t)}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={styles.stepHeading}>A bit more context 🎯</Text>
              <Text style={styles.stepSub}>This helps us tailor the timeline and advice to your situation.</Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Grade level</Text>
                <View style={styles.chipWrap}>
                  {GRADE_LEVELS.map(g => (
                    <Chip
                      key={g}
                      label={g}
                      selected={form.gradeLevel === g}
                      onPress={() => update('gradeLevel', form.gradeLevel === g ? '' : g)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Deadline</Text>
                <View style={styles.chipWrap}>
                  {DEADLINES.map(d => (
                    <Chip
                      key={d}
                      label={d}
                      selected={form.deadline === d}
                      onPress={() => update('deadline', form.deadline === d ? '' : d)}
                    />
                  ))}
                </View>
                {form.deadline === 'Custom' && (
                  <TextInput
                    style={[styles.textInput, { marginTop: 10 }]}
                    placeholder="e.g. March 15, or 10 days"
                    placeholderTextColor={COLORS.textTertiary}
                    value={form.customDeadline}
                    onChangeText={v => update('customDeadline', v)}
                  />
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Rubric <Text style={styles.optional}>(optional)</Text></Text>
                <Text style={styles.fieldHint}>Paste your rubric to get a personalised quality checklist</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={5}
                  placeholder="e.g. The report should (1) include all required sections, (2) clearly explain causes and impacts, (3) provide mitigation strategies..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={form.rubric}
                  onChangeText={v => update('rubric', v)}
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.stepHeading}>Ready to generate 🚀</Text>
              <Text style={styles.stepSub}>Review your details below, then tap generate.</Text>

              <Card style={styles.reviewCard} variant="elevated">
                <ReviewRow label="Assignment" value={form.prompt} multiline />
                <Divider />
                <ReviewRow label="Report type" value={form.reportType || 'Not specified'} />
                <Divider />
                <ReviewRow label="Grade level" value={form.gradeLevel || 'Not specified'} />
                <Divider />
                <ReviewRow label="Deadline" value={effectiveDeadline || 'Not specified'} />
                <Divider />
                <ReviewRow label="Rubric" value={form.rubric ? `${form.rubric.length} characters provided` : 'None — generic checklist will be used'} />
              </Card>

              <View style={styles.generateBox}>
                <Text style={styles.generateTitle}>What you'll get</Text>
                {[
                  ['📋', 'A step-by-step project plan with timelines'],
                  ['📄', 'A structured report outline mapped to your prompt'],
                  ['💬', 'Tutor questions and next steps — not a written report'],
                  ['✅', form.rubric ? 'A checklist based on your rubric' : 'A generic academic quality checklist'],
                ].map(([icon, text]) => (
                  <View key={text} style={styles.generateItem}>
                    <Text style={styles.generateItemIcon}>{icon}</Text>
                    <Text style={styles.generateItemText}>{text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {step < 2 ? (
              <Button title="Continue →" onPress={goNext} />
            ) : (
              <Button
                title={loading ? 'Generating...' : 'Generate my guidance ✨'}
                onPress={handleGenerate}
                loading={loading}
              />
            )}
            {step > 0 && !loading && (
              <TouchableOpacity onPress={goBack} style={styles.backLink}>
                <Text style={styles.backLinkText}>← Back</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ReviewRow = ({ label, value, multiline }) => (
  <View style={[styles.reviewRow, multiline && styles.reviewRowMulti]}>
    <Text style={styles.reviewLabel}>{label}</Text>
    <Text style={[styles.reviewValue, multiline && styles.reviewValueMulti]} numberOfLines={multiline ? 4 : 1}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: SIZES.paddingLg, paddingBottom: 50 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingLg, paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text },

  progress: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.paddingXl, paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  stepDotDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepCheck: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  stepNum: { fontSize: 11, fontWeight: '700', color: COLORS.textTertiary },
  stepNumActive: { color: COLORS.primary },
  stepLabel: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  stepLabelActive: { color: COLORS.primary },
  stepLabelDone: { color: COLORS.teal },
  stepLine: { flex: 1, height: 1.5, backgroundColor: COLORS.border, marginBottom: 16 },
  stepLineActive: { backgroundColor: COLORS.primary },

  stepHeading: {
    fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text,
    letterSpacing: -0.4, marginBottom: 6,
  },
  stepSub: { fontSize: SIZES.base, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 24 },

  fieldGroup: { marginBottom: 22 },
  fieldLabel: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 8, letterSpacing: 0.2 },
  fieldHint: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 8, lineHeight: 16 },
  required: { color: COLORS.danger },
  optional: { color: COLORS.textTertiary, fontWeight: '400' },

  textArea: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 14, fontSize: SIZES.base, color: COLORS.text,
    minHeight: 120, lineHeight: 22,
  },
  textInput: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, height: 44,
    fontSize: SIZES.base, color: COLORS.text,
  },
  inputError: { borderColor: COLORS.danger },
  charCount: { fontSize: SIZES.xs, color: COLORS.textTertiary, textAlign: 'right', marginTop: 4 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  reviewCard: { marginBottom: 16, padding: SIZES.paddingMd },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  reviewRowMulti: { flexDirection: 'column', alignItems: 'flex-start', gap: 4 },
  reviewLabel: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, flex: 0 },
  reviewValue: { fontSize: SIZES.base, color: COLORS.text, flex: 1, textAlign: 'right' },
  reviewValueMulti: { textAlign: 'left', lineHeight: 20, color: COLORS.textSecondary },

  generateBox: {
    backgroundColor: COLORS.primaryLight, borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.primaryMid,
  },
  generateTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  generateItem: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  generateItemIcon: { fontSize: 14 },
  generateItemText: { fontSize: SIZES.sm, color: COLORS.primaryDark, flex: 1, lineHeight: 18 },

  errorBox: {
    backgroundColor: COLORS.dangerLight, borderRadius: SIZES.radiusMd,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F7C1C1',
  },
  errorText: { fontSize: SIZES.sm, color: COLORS.danger, lineHeight: 18 },

  actions: { gap: 8 },
  backLink: { alignItems: 'center', paddingVertical: 10 },
  backLinkText: { fontSize: SIZES.base, color: COLORS.textSecondary, fontWeight: '600' },
});