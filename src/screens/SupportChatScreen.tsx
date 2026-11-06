import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNetworkSimulation } from '../context/NetworkSimulationContext';
import { TelemetryBadge, TelemetryStatus } from '../components/TelemetryBadge';
import { ChatMessage } from '../components/ChatMessage';

const QUICK_PROMPTS = [
  '¿Por qué mi internet está lento?',
  '¿Cuál es mi potencia óptica Rx actual?',
  '¿El nodo de San Isidro tiene fallas?',
  '¿Debo reiniciar mi módem?',
];

export const SupportChatScreen: React.FC = () => {
  const {
    telemetry,
    messages,
    isExecutingAction,
    executingActionText,
    isTyping,
    sendUserMessage,
  } = useNetworkSimulation();

  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
    return () => clearTimeout(timer);
  }, [messages, isTyping, isExecutingAction]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    sendUserMessage(text);
  };

  const rxStatus: TelemetryStatus =
    telemetry.rxPowerDbm === null || telemetry.rxPowerDbm < -28
      ? 'critical'
      : telemetry.rxPowerDbm < -24.5
      ? 'warning'
      : 'optimal';

  const pingStatus: TelemetryStatus =
    telemetry.pingMs > 180
      ? 'critical'
      : telemetry.pingMs > 45
      ? 'warning'
      : 'optimal';

  const wifiStatus: TelemetryStatus =
    telemetry.wifi5SaturationPct > 75
      ? 'warning'
      : telemetry.wifi5SaturationPct > 90
      ? 'critical'
      : 'optimal';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Mini Barra de Telemetría en Tiempo Real (Conectada a ONT) */}
      <View style={styles.liveTelemetryStrip}>
        <View style={styles.stripHeaderRow}>
          <View style={styles.liveIndicatorGroup}>
            <View style={styles.pulsingDot} />
            <Text style={styles.stripHeaderTitle}>
              TELEMETRÍA ONT EN VIVO · {telemetry.nodeName.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.healthPillText}>
            Salud: {telemetry.healthScore}%
          </Text>
        </View>

        <View style={styles.badgesRow}>
          <TelemetryBadge
            compact
            label="Óptica Rx"
            value={
              telemetry.rxPowerDbm !== null
                ? `${telemetry.rxPowerDbm.toFixed(1)} dBm`
                : 'SIN SEÑAL'
            }
            subLabel="Normal: -18 a -24"
            status={rxStatus}
          />
          <TelemetryBadge
            compact
            label="Ping / Pérdida"
            value={
              telemetry.packetLossPct >= 100
                ? 'OFFLINE'
                : `${telemetry.pingMs} ms`
            }
            subLabel={`Pérdida: ${telemetry.packetLossPct}%`}
            status={pingStatus}
          />
          <TelemetryBadge
            compact
            label="Wi-Fi 5 GHz"
            value={`Canal ${telemetry.wifi5Channel}`}
            subLabel={`Sat: ${telemetry.wifi5SaturationPct}% (${telemetry.connectedDevices} eq)`}
            status={wifiStatus}
          />
        </View>
      </View>

      {/* Banner de Ejecución Remota en Tiempo Real (1.5s) */}
      {isExecutingAction && (
        <View style={styles.executingBanner}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.executingBannerText}>{executingActionText}</Text>
        </View>
      )}

      {/* Historial de Conversación con el Copiloto Claro */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <View style={styles.typingIndicatorRow}>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#DA291C" />
              <Text style={styles.typingText}>
                Copiloto Claro está analizando la telemetría de tu router...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sugerencias Rápidas de Consulta */}
      <View style={styles.quickPromptsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {QUICK_PROMPTS.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickPromptChip}
              onPress={() => sendUserMessage(prompt)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Caja de Entrada NLP */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe tu consulta al Copiloto Claro..."
          placeholderTextColor="#9CA3AF"
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.85}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  liveTelemetryStrip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stripHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  liveIndicatorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  stripHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.3,
  },
  healthPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#DA291C',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  executingBanner: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
  },
  executingBannerText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 10,
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 10,
    paddingBottom: 18,
  },
  typingIndicatorRow: {
    paddingHorizontal: 14,
    marginTop: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typingText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 8,
    fontWeight: '600',
  },
  quickPromptsBar: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickPromptChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  quickPromptText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 9,
    fontSize: 13,
    color: '#1F2937',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#DA291C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
