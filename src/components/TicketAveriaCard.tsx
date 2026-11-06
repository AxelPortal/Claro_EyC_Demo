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
      {/* Cabecera Oficial Claro + OSIPTEL */}
      <View style={styles.headerBanner}>
        <View style={styles.headerTopRow}>
          <View style={styles.claroBadge}>
            <Text style={styles.claroBadgeText}>CLARO PERÚ</Text>
          </View>
          <View style={styles.osiptelBadge}>
            <Text style={styles.osiptelBadgeText}>HOMOLOGADO OSIPTEL</Text>
          </View>
        </View>
        <Text style={styles.voucherTitle}>TICKET OFICIAL DE AVERÍA DE RED</Text>
        <Text style={styles.voucherSubtitle}>
          Emitido automáticamente por Telemetría ONT (Sin llamada al 123)
        </Text>
      </View>

      {/* Código Principal de Reclamo */}
      <View style={styles.codeSection}>
        <Text style={styles.codeLabel}>CÓDIGO OFICIAL DE RECLAMO / AVERÍA</Text>
        <Text style={styles.codeValue}>{ticket.ticketCode}</Text>
        <Text style={styles.osiptelSubCode}>Registro SAR: {ticket.osiptelCode}</Text>
      </View>

      {/* Datos Técnicos de Evidencia */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Potencia Óptica Registrada:</Text>
          <View style={styles.criticalPill}>
            <Text style={styles.criticalPillText}>{ticket.rxPowerRecorded}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Nodo / Planta Externa:</Text>
          <Text style={styles.detailVal}>{ticket.nodeAffected}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Horario Visita Técnica:</Text>
          <Text style={[styles.detailVal, styles.highlightGreen]}>{ticket.estimatedVisitWindow}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Cuadrilla Asignada:</Text>
          <Text style={styles.detailVal}>{ticket.technicianCrew}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Titular y Servicio:</Text>
          <Text style={styles.detailVal}>
            {ticket.clientName} · {ticket.planName}
          </Text>
        </View>
      </View>

      {/* Historial de Descartes Automáticos */}
      <View style={styles.discardsBox}>
        <Text style={styles.discardsTitle}>
          HISTORIAL DE DESCARTES AUTOMÁTICOS (FASE 1 - 4):
        </Text>
        {ticket.automatedDiscards.map((item, idx) => (
          <View key={idx} style={styles.discardItem}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.discardText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Resumen obligatorio para el técnico de campo */}
      <View style={styles.technicianNoteBox}>
        <Text style={styles.technicianNoteHeader}>
          INSTRUCCIÓN VINCULANTE PARA TÉCNICO DE CAMPO:
        </Text>
        <Text style={styles.technicianNoteBody}>{ticket.fieldSummary}</Text>
      </View>

      {/* Acción de Constancia */}
      <TouchableOpacity
        style={[styles.copyButton, copied && styles.copyButtonSuccess]}
        onPress={handleCopyTicket}
        activeOpacity={0.85}
      >
        <Text style={styles.copyButtonText}>
          {copied
            ? '✓ Constancia Oficial Copiada al Portapapeles'
            : 'Guardar Constancia Oficial OSIPTEL'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  voucherContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DA291C',
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  osiptelBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  osiptelBadgeText: {
    color: '#F9FAFB',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.4,
  },
  voucherTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  voucherSubtitle: {
    color: '#FEE2E2',
    fontSize: 11,
    marginTop: 2,
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
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#DA291C',
    marginVertical: 2,
    letterSpacing: 0.8,
  },
  osiptelSubCode: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  detailsSection: {
    padding: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  highlightGreen: {
    color: '#047857',
    fontWeight: '800',
  },
  criticalPill: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  criticalPillText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '800',
  },
  discardsBox: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  discardsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
    letterSpacing: 0.3,
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
    fontSize: 11,
    color: '#4B5563',
    flex: 1,
    lineHeight: 15,
  },
  technicianNoteBox: {
    backgroundColor: '#FFFBEB',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  technicianNoteHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
    marginBottom: 3,
  },
  technicianNoteBody: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 15,
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
    fontSize: 12,
    fontWeight: '800',
  },
});
