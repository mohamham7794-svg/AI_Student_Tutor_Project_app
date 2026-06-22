import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../theme';
import { Button, Card, Divider } from '../components/UI';

// NOTE: This is a placeholder. form_screen.js navigates here with
// navigation.navigate('Results', { data: result, form }) after a
// successful /tutor/generate call. `data` matches the TutorResponse
// schema from main.py: project_plan, report_outline, tutor_guidance,
// quality_checklist. Build out the real layout for these fields here.
export default function ResultsScreen({ route, navigation }) {
  const { data } = route.params || {};

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your tutor guidance</Text>
        <Card style={styles.card}>
          <Text style={styles.label}>Raw response (placeholder view)</Text>
          <Divider />
          <Text style={styles.json}>{JSON.stringify(data, null, 2)}</Text>
        </Card>
        <Button
          title="Back to Home"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.paddingLg },
  title: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  card: { padding: SIZES.paddingMd },
  label: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
  json: { fontSize: 11, color: COLORS.text, fontFamily: 'monospace' },
});