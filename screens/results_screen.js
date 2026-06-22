import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme';
import { Button, Card, Badge, Divider } from '../components/UI';

const TABS = [
  { key: 'plan',      label: '📋 Plan' },
  { key: 'outline',   label: '📄 Outline' },
  { key: 'guidance',  label: '💬 Guidance' },
  { key: 'checklist', label: '✅ Checklist' },
];

// ── Project Plan ────────────────────────────────────────────────────────────
function PlanTab({ milestones = [] }) {
  return (
    <View>
      {milestones.map((m, i) => (
        <Card key={i} style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <View style={styles.milestoneBadgeRow}>
              <View style={styles.milestoneIndex}>
                <Text style={styles.milestoneIndexText}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <Text style={styles.milestoneName}>{m.milestone}</Text>
            </View>
            <Badge label={`${m.estimated_time_days}d`} color="teal" />
          </View>
          <Divider style={{ marginVertical: 10 }} />
          {m.tasks.map((task, j) => (
            <View key={j} style={styles.taskRow}>
              <View style={styles.taskDot} />
              <Text style={styles.taskText}>{task}</Text>
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

// ── Report Outline ───────────────────────────────────────────────────────────
function OutlineTab({ sections = [] }) {
  return (
    <Card>
      {sections.map((s, i) => (
        <View key={i} style={[styles.outlineSection, i < sections.length - 1 && styles.outlineSectionBorder]}>
          <Text style={styles.outlineSectionTitle}>{s.section}</Text>
          {s.subsections.map((sub, j) => (
            <View key={j} style={styles.subsectionRow}>
              <View style={styles.subsectionLine} />
              <Text style={styles.subsectionText}>{sub}</Text>
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
}

// ── Tutor Guidance ───────────────────────────────────────────────────────────
function GuidanceTab({ guidance = {} }) {
  const groups = [
    { title: 'Clarifying questions', emoji: '❓', items: guidance.clarifying_questions || [] },
    { title: 'What to do next',      emoji: '👉', items: guidance.what_to_do_next || [] },
    { title: 'Improvement tips',     emoji: '💡', items: guidance.improvement_tips || [] },
  ];
  return (
    <View>
      {groups.map((g, i) => (
        <Card key={i} style={styles.guidanceCard}>
          <Text style={styles.guidanceGroupTitle}>{g.title}</Text>
          <Divider style={{ marginBottom: 10 }} />
          {g.items.map((item, j) => (
            <View key={j} style={styles.guidanceItem}>
              <Text style={styles.guidanceEmoji}>{g.emoji}</Text>
              <Text style={styles.guidanceText}>{item}</Text>
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

// ── Quality Checklist ────────────────────────────────────────────────────────
function ChecklistTab({ items = [] }) {
  const statusConfig = {
    yes:     { bg: COLORS.successLight, icon: '✓', iconColor: COLORS.success },
    no:      { bg: COLORS.dangerLight,  icon: '✗', iconColor: COLORS.danger },
    unknown: { bg: COLORS.primaryLight, icon: '?', iconColor: COLORS.primaryMid },
  };

  return (
    <Card>
      {items.map((item, i) => {
        const cfg = statusConfig[item.meets_requirement] || statusConfig.unknown;
        return (
          <View key={i} style={[styles.checklistItem, i < items.length - 1 && styles.checklistBorder]}>
            <View style={[styles.checkIcon, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.checkIconText, { color: cfg.iconColor }]}>{cfg.icon}</Text>
            </View>
            <Text style={styles.checklistText}>{item.item}</Text>
          </View>
        );
      })}
    </Card>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ResultsScreen({ route, navigation }) {
  const { data } = route.params || {};
  const [activeTab, setActiveTab] = useState('plan');

  if (!data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤔</Text>
          <Text style={styles.emptyTitle}>No results yet</Text>
          <Text style={styles.emptyText}>Submit an assignment to get your personalised plan.</Text>
          <Button
            title="Go back"
            onPress={() => navigation.navigate('Home')}
            style={{ marginTop: 24 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'plan':      return <PlanTab milestones={data.project_plan} />;
      case 'outline':   return <OutlineTab sections={data.report_outline} />;
      case 'guidance':  return <GuidanceTab guidance={data.tutor_guidance} />;
      case 'checklist': return <ChecklistTab items={data.quality_checklist} />;
      default:          return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Home</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Your tutor guidance</Text>
          <Text style={styles.subtitle}>
            {data.project_plan?.length} milestones · {data.report_outline?.length} sections
          </Text>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}

        <Button
          title="New assignment"
          variant="outline"
          onPress={() => navigation.navigate('Form')}
          style={{ marginTop: 12 }}
        />
        <Button
          title="Back to home"
          variant="ghost"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
          style={{ marginTop: 10, marginBottom: 32 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: SIZES.paddingLg,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { marginBottom: 6 },
  backBtnText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  headerTitle: {},
  title: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },

  tabBar: { flexGrow: 0 },
  tabBarContent: {
    paddingHorizontal: SIZES.paddingLg,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  tabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabBtnText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabBtnTextActive: { color: COLORS.white },

  scroll: { flex: 1 },
  content: { paddingHorizontal: SIZES.paddingLg, paddingTop: 4 },

  // Milestone / Plan
  milestoneCard: { marginBottom: 12 },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  milestoneIndex: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  milestoneIndexText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  milestoneName: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, flex: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  taskDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: COLORS.primaryMid, marginTop: 6, flexShrink: 0,
  },
  taskText: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18, flex: 1 },

  // Outline
  outlineSection: { paddingVertical: 12 },
  outlineSectionBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  outlineSectionTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  subsectionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 5 },
  subsectionLine: { width: 2, height: '100%', minHeight: 16, backgroundColor: COLORS.primaryLight, borderRadius: 2, marginTop: 2 },
  subsectionText: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18, flex: 1 },

  // Guidance
  guidanceCard: { marginBottom: 12 },
  guidanceGroupTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  guidanceItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  guidanceEmoji: { fontSize: 14, marginTop: 1 },
  guidanceText: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18, flex: 1 },

  // Checklist
  checklistItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
  checklistBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  checkIcon: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkIconText: { fontSize: 12, fontWeight: '800' },
  checklistText: { fontSize: SIZES.sm, color: COLORS.text, lineHeight: 18, flex: 1 },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.paddingXl },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: SIZES.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
});