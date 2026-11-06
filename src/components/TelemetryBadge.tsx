import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type TelemetryStatus = 'optimal' | 'warning' | 'critical';

interface TelemetryBadgeProps {
  label: string;
  value: string;
  subLabel?: string;
  status: TelemetryStatus;
  compact?: boolean;
  iconText?: string;
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
    tagText: 'ÓPTIMO',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#FDE68A',
    badgeBg: '#FEF3C7',
    text: '#92400E',
    dot: '#F59E0B',
    tagText: 'CONGESTIÓN',
  },
  critical: {
    bg: '#FEF2F2',
    border: '#FECACA',
    badgeBg: '#FEE2E2',
    text: '#991B1B',
    dot: '#DA291C',
    tagText: 'FALLA CRÍTICA',
  },
};

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({
  label,
  value,
  subLabel,
  status,
  compact = false,
  iconText,
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
        {subLabel ? (
          <Text style={styles.compactSubLabel} numberOfLines={1}>
            {subLabel}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: palette.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.labelGroup}>
          {iconText ? (
            <View style={[styles.iconPill, { backgroundColor: palette.bg }]}>
              <Text style={[styles.iconText, { color: palette.text }]}>{iconText}</Text>
            </View>
          ) : null}
          <Text style={styles.cardLabel}>{label}</Text>
        </View>
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
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  iconPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 7,
  },
  iconText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  mainValue: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 2,
  },
  subLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  compactContainer: {
    flex: 1,
    minWidth: 105,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginHorizontal: 3,
  },
  compactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  compactLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  compactSubLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
  },
});
