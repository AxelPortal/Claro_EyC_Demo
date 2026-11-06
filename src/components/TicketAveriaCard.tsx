import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TicketAveriaData } from '../context/NetworkSimulationContext';

interface TicketAveriaCardProps {
  ticket: TicketAveriaData;
}

export const TicketAveriaCard: React.FC<TicketAveriaCardProps> = ({ ticket }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTicket = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <View style={styles.voucherContainer}>
      <View style={styles.headerBanner}>
        <View style={styles.headerTopRow}>
          <View style={styles.claroBadge}>
            <Text style={styles.claroBadgeText}>Claro Perú</Text>
          </View>
          <View style={styles.osiptelBadge}>
            <Text style={styles.osiptelBadgeText}>{ticket.osiptelCode}</Text>
          </View>
        </View>
        <Text style={styles.voucherTitle}>Constancia de Atención Automática</Text>
      </View>

      <View style={styles.codeSection}>
        <Text style={styles.codeLabel}>Código de atención</Text>
        <Text style={styles.codeValue}>{ticket.ticketCode}</Text>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>¿Qué detectamos?</Text>
          <Text style={styles.detailVal}>{ticket.issueSummary}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Solución estimada</Text>
          <Text style={[styles.detailVal, styles.highlightGreen]}>
            {ticket.estimatedResolution}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Servicio</Text>
          <Text style={styles.detailVal}>
            {ticket.planName} · {ticket.serviceAddress}
          </Text>
        </View>
      </View>

      <View style={styles.discardsBox}>
        <Text style={styles.discardsTitle}>Lo que ya revisamos por ti:</Text>
        {ticket.checksPerformed.map((item, idx) => (
          <View key={idx} style={styles.discardItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.discardText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteBody}>{ticket.customerActionNote}</Text>
      </View>

      <TouchableOpacity
        style={[styles.copyButton, copied && styles.copyButtonSuccess]}
        onPress={handleCopyTicket}
        activeOpacity={0.85}
      >
        <Text style={styles.copyButtonText}>
          {copied ? '✓ Código copiado' : 'Copiar código de atención'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  voucherContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    overflow: 'hidden',
    marginTop: 10,
  },
  headerBanner: {
    backgroundColor: '#DA291C',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  claroBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  claroBadgeText: {
    color: '#DA291C',
    fontWeight: '800',
    fontSize: 11,
  },
  osiptelBadge: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  osiptelBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 10,
  },
  voucherTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  codeSection: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991B1B',
  },
  codeValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#DA291C',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  detailsSection: {
    padding: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 1,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  highlightGreen: {
    color: '#047857',
    fontWeight: '800',
  },
  discardsBox: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  discardsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  discardItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  checkIcon: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 12,
    marginRight: 6,
  },
  discardText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    lineHeight: 16,
  },
  noteBox: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
  },
  noteBody: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#1F2937',
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  copyButtonSuccess: {
    backgroundColor: '#10B981',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
