import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type TelemetryStatus = 'optimal' | 'warning' | 'critical';

interface TelemetryBadgeProps {
  label: string;
  value: string;
  subLabel?: string;
  status: TelemetryStatus;
  compact?: boolean;
}

const STATUS_COLORS: Record<
  TelemetryStatus,
  { bg: string; border: string; badgeBg: string; text: string; dot: string; tagText: string }
> = {
  optimal: {
    bg: '#F0FDF4',
    border: '#BBF7D0',
    badgeBg: '#DCFCE7',
    text: '#065F46',
    dot: '#10B981',
    tagText: 'Bien',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    badgeBg: '#FEF3C7',
    text: '#92400E',
    dot: '#F59E0B',
    tagText: 'Por mejorar',
  },
  critical: {
    bg: '#FEF2F2',
    border: '#FECACA',
    badgeBg: '#FEE2E2',
    text: '#991B1B',
    dot: '#DA291C',
    tagText: 'Con avería',
  },
};

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({
  label,
  value,
  subLabel,
  status,
  compact = false,
}) => {
  const palette = STATUS_COLORS[status];

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: palette.bg, borderColor: palette.border }]}>
        <View style={styles.compactTopRow}>
          <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
          <Text style={styles.compactLabel} numberOfLines={1}>
            {label}
          </Text>
        </View>
        <Text style={[styles.compactValue, { color: palette.text }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: palette.border }]}>
      <View style={styles.headerRow}>
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={[styles.statusTag, { backgroundColor: palette.badgeBg }]}>
          <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
          <Text style={[styles.statusTagText, { color: palette.text }]}>{palette.tagText}</Text>
        </View>
      </View>

      <Text style={[styles.mainValue, { color: status === 'critical' ? '#DA291C' : '#1F2937' }]}>
        {value}
      </Text>

      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mainValue: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 2,
  },
  subLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  compactContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 3,
  },
  compactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  compactValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});
