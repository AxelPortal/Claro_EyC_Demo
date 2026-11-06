import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
          <Text style={styles.systemText}>{message.text}</Text>
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
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../assets/claro-circle-logo.png')}
            style={styles.avatarImage}
            resizeMode="contain"
          />
          <View style={styles.onlineDot} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.copilotBubble,
        ]}
      >
        {!isUser && (
          <View style={styles.copilotHeaderRow}>
            <Text style={styles.copilotName}>Asistente Claro</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedPillText}>✓ Oficial</Text>
            </View>
          </View>
        )}

        <Text style={[styles.messageText, isUser ? styles.userText : styles.copilotText]}>
          {message.text}
        </Text>

        {message.cardType === 'PATCHCORD_GUIDE' && (
          <PatchcordInlineDiagram
            rxPowerDbm={telemetry.rxPowerDbm}
            onOpenModal={() => setPatchcordModalOpen(true)}
          />
        )}

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

        {message.cardType === 'TICKET_AVERIA' && message.ticketData && (
          <TicketAveriaCard ticket={message.ticketData} />
        )}

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
                ? `✓ ${message.actionButton.completedLabel || 'Listo'}`
                : `✨ ${message.actionButton.label}`}
            </Text>
          </TouchableOpacity>
        )}

        {message.secondaryButton && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSecondaryPress}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              {message.secondaryButton.label}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.timestampRow}>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.copilotTimestamp]}>
            {message.timestamp}
            {isUser ? ' ✓✓' : ''}
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
    maxWidth: '90%',
  },
  systemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 7,
    paddingHorizontal: 14,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  copilotRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    marginRight: 9,
    position: 'relative',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  bubble: {
    maxWidth: '83%',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  copilotBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userBubble: {
    backgroundColor: '#DA291C',
    borderBottomRightRadius: 4,
  },
  copilotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  copilotName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DA291C',
    marginRight: 6,
  },
  verifiedPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  verifiedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DA291C',
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
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    marginTop: 10,
  },
  metricsDiffHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#DCFCE7',
    paddingBottom: 6,
    marginBottom: 8,
  },
  metricsDiffTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  metricDiffRow: {
    marginBottom: 6,
  },
  metricDiffLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  metricDiffValues: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metricBefore: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  metricArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricAfter: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '800',
  },
  actionButton: {
    backgroundColor: '#DA291C',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 11,
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
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 7,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },
  timestampRow: {
    alignItems: 'flex-end',
    marginTop: 4,
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
