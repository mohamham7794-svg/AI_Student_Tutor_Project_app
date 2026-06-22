import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        isPrimary && styles.btnPrimary,
        isOutline && styles.btnOutline,
        isGhost && styles.btnGhost,
        (disabled || loading) && styles.btnDisabled,
        isPrimary && SHADOWS.soft,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.primary} size="small" />
      ) : (
        <View style={styles.btnInner}>
          {icon && <View style={styles.btnIcon}>{icon}</View>}
          <Text
            style={[
              styles.btnText,
              isPrimary && styles.btnTextPrimary,
              isOutline && styles.btnTextOutline,
              isGhost && styles.btnTextGhost,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const Card = ({ children, style, variant = 'default' }) => (
  <View
    style={[
      styles.card,
      variant === 'elevated' && SHADOWS.soft,
      variant === 'tinted' && styles.cardTinted,
      style,
    ]}
  >
    {children}
  </View>
);

export const Badge = ({ label, color = 'purple' }) => {
  const colorMap = {
    purple: { bg: COLORS.primaryLight, text: COLORS.primaryDark },
    teal: { bg: COLORS.tealLight, text: COLORS.teal },
    amber: { bg: COLORS.amberLight, text: COLORS.amber },
    coral: { bg: COLORS.coralLight, text: COLORS.coral },
    gray: { bg: '#F1EFE8', text: '#5F5E5A' },
  };
  const c = colorMap[color] || colorMap.gray;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
};

export const SectionHeader = ({ title, subtitle, style }) => (
  <View style={[styles.sectionHeader, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </View>
);

export const Chip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.chip, selected && styles.chipSelected]}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

export const Divider = ({ style }) => <View style={[styles.divider, style]} />;

export const StatCard = ({ icon, value, label, color = 'purple' }) => {
  const colorMap = {
    purple: { bg: COLORS.primaryLight, icon: COLORS.primary },
    teal: { bg: COLORS.tealLight, icon: COLORS.teal },
    amber: { bg: COLORS.amberLight, icon: COLORS.amber },
    coral: { bg: COLORS.coralLight, icon: COLORS.coral },
  };
  const c = colorMap[color];
  return (
    <View style={[styles.statCard, SHADOWS.soft]}>
      <View style={[styles.statIcon, { backgroundColor: c.bg }]}>
        <Text style={{ fontSize: 18, color: c.icon }}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: SIZES.radiusMd,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  btnGhost: {
    backgroundColor: COLORS.primaryLight,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnIcon: {
    marginRight: 4,
  },
  btnText: {
    fontSize: SIZES.base,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  btnTextPrimary: {
    color: COLORS.white,
  },
  btnTextOutline: {
    color: COLORS.primary,
  },
  btnTextGhost: {
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.paddingMd,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTinted: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryMid,
  },
  badge: {
    borderRadius: SIZES.radiusFull,
    paddingVertical: 3,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});