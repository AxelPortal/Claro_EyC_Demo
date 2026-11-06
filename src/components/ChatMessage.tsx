import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  ChatMessageItem,
  useNetworkSimulation,
} from '../context/NetworkSimulationContext';
import { TicketAveriaCard } from './TicketAveriaCard';
import { PatchcordInlineDiagram } from './PatchcordGuideModal';

interface ChatMessageProps {
  message: ChatMessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const {
    telemetry,
    isExecutingAction,
    triggerOptimizeWifi,
    triggerVerifyPatchcord,
    setPatchcordModalOpen,
    runQuickTelemetryScan,
  } = useNetworkSimulation();

  if (message.sender === 'system') {
    return (
      <View style={styles.systemBubbleWrapper}>
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>📡 {message.text}</Text>
        </View>
      </View>
    );
  }

  const isUser = message.sender === 'user';

  const handleActionPress = () => {
    if (!message.actionButton || message.actionButton.completed || isExecutingAction) {
      return;
    }
    const { actionType } = message.actionButton;
    if (actionType === 'OPTIMIZE_WIFI') {
      triggerOptimizeWifi(message.id);
    } else if (actionType === 'VERIFY_PATCHCORD') {
      triggerVerifyPatchcord(message.id);
    } else if (actionType === 'OPEN_PATCHCORD_MODAL') {
      setPatchcordModalOpen(true);
    } else if (actionType === 'RUN_DIAGNOSTIC') {
      runQuickTelemetryScan();
    }
  };

  const handleSecondaryPress = () => {
    if (!message.secondaryButton) return;
    if (message.secondaryButton.actionType === 'OPEN_PATCHCORD_MODAL') {
      setPatchcordModalOpen(true);
    } else if (message.secondaryButton.actionType === 'VERIFY_PATCHCORD') {
      triggerVerifyPatchcord(message.id);
    }
  };

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.userRow : styles.copilotRow,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>IA</Text>
          <View style={styles.verifiedCheck}>
            <Text style={styles.verifiedCheckText}>✓</Text>
          </View>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.copilotBubble,
        ]}
      >
        {!isUser && (
          <View style={styles.copilotHeader}>
            <Text style={styles.copilotName}>Copiloto Claro Perú</Text>
            {message.phaseBadge ? (
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>{message.phaseBadge}</Text>
              </View>
            ) : null}
          </View>
        )}

        <Text style={[styles.messageText, isUser ? styles.userText : styles.copilotText]}>
          {message.text}
        </Text>

        {/* Tarjeta Interactiva Fase 3: Patchcord Guide */}
        {message.cardType === 'PATCHCORD_GUIDE' && (
          <PatchcordInlineDiagram
            rxPowerDbm={telemetry.rxPowerDbm}
            onOpenModal={() => setPatchcordModalOpen(true)}
          />
        )}

        {/* Tarjeta de Comparación de Métricas Antes vs Después */}
        {message.cardType === 'METRICS_DIFF' && message.metricsDiff && (
          <View style={styles.metricsDiffCard}>
            <View style={styles.metricsDiffHeader}>
              <Text style={styles.metricsDiffTitle}>
                ✓ {message.metricsDiff.title}
              </Text>
            </View>
            {message.metricsDiff.items.map((item, idx) => (
              <View key={idx} style={styles.metricDiffRow}>
                <Text style={styles.metricDiffLabel}>{item.label}</Text>
                <View style={styles.metricDiffValues}>
                  <Text style={styles.metricBefore}>{item.before}</Text>
                  <Text style={styles.metricArrow}> → </Text>
                  <Text style={styles.metricAfter}>{item.after}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tarjeta Fase 4: Ticket Oficial de Avería OSIPTEL */}
        {message.cardType === 'TICKET_AVERIA' && message.ticketData && (
          <TicketAveriaCard ticket={message.ticketData} />
        )}

        {/* Botón Primario de Acción / Consentimiento Explícito */}
        {message.actionButton && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              message.actionButton.completed && styles.actionButtonCompleted,
              isExecutingAction && !message.actionButton.completed && styles.actionButtonDisabled,
            ]}
            onPress={handleActionPress}
            disabled={Boolean(message.actionButton.completed || isExecutingAction)}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>
              {message.actionButton.completed
                ? `✓ ${message.actionButton.completedLabel || 'Acción ejecutada'}`
                : `⚡ ${message.actionButton.label}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Botón Secundario (ej. Abrir modal de guía) */}
        {message.secondaryButton && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSecondaryPress}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              📋 {message.secondaryButton.label}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.timestampRow}>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.copilotTimestamp]}>
            {message.timestamp}
            {isUser ? '  ✓✓' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  systemBubbleWrapper: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  systemBubble: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    maxWidth: '94%',
  },
  systemText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  copilotRow: {
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DA291C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  verifiedCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  verifiedCheckText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  copilotBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userBubble: {
    backgroundColor: '#DA291C',
    borderBottomRightRadius: 4,
  },
  copilotHeader: {
    marginBottom: 6,
  },
  copilotName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#DA291C',
    marginBottom: 3,
  },
  phaseBadge: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderLeftWidth: 2.5,
    borderLeftColor: '#DA291C',
  },
  phaseBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  copilotText: {
    color: '#1F2937',
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  metricsDiffCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    padding: 11,
    marginTop: 10,
  },
  metricsDiffHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
    paddingBottom: 6,
    marginBottom: 8,
  },
  metricsDiffTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#065F46',
  },
  metricDiffRow: {
    marginBottom: 6,
  },
  metricDiffLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 1,
  },
  metricDiffValues: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metricBefore: {
    fontSize: 11,
    color: '#DC2626',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  metricArrow: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '900',
  },
  metricAfter: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '900',
  },
  actionButton: {
    backgroundColor: '#DA291C',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#DA291C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonCompleted: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 7,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '700',
  },
  timestampRow: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 10,
  },
  copilotTimestamp: {
    color: '#9CA3AF',
  },
  userTimestamp: {
    color: '#FECACA',
  },
});
