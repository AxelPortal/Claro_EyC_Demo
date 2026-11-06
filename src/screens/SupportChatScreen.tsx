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
  Image,
} from 'react-native';
import { useNetworkSimulation } from '../context/NetworkSimulationContext';
import { TelemetryBadge, TelemetryStatus } from '../components/TelemetryBadge';
import { ChatMessage } from '../components/ChatMessage';

const QUICK_PROMPTS = [
  '¿Cómo lo hiciste?',
  'Mi internet está un poco lento',
  'Se corta mi videollamada',
  '¿Hay algún problema en mi zona?',
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

  const fiberStatus: TelemetryStatus =
    telemetry.rxPowerDbm === null || telemetry.rxPowerDbm < -30
      ? 'critical'
      : telemetry.rxPowerDbm < -24.5
      ? 'warning'
      : 'optimal';

  const fiberText =
    fiberStatus === 'critical'
      ? 'Avería en calle'
      : fiberStatus === 'warning'
      ? 'Cable flojo'
      : 'Estable';

  const wifiStatus: TelemetryStatus =
    telemetry.wifi5SaturationPct > 70 ? 'warning' : 'optimal';

  const wifiText =
    telemetry.wifi5SaturationPct > 70 ? 'Con interferencia' : 'Excelente';

  const speedStatus: TelemetryStatus =
    telemetry.downloadMbps === 0
      ? 'critical'
      : telemetry.downloadMbps < 250
      ? 'warning'
      : 'optimal';

  const speedText =
    telemetry.downloadMbps === 0
      ? 'Sin conexión'
      : telemetry.downloadMbps < 250
      ? 'Reducida'
      : 'Rápida';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Resumen sencillo del estado de la conexión */}
      <View style={styles.liveTelemetryStrip}>
        <View style={styles.badgesRow}>
          <TelemetryBadge
            compact
            label="Señal de calle"
            value={fiberText}
            status={fiberStatus}
          />
          <TelemetryBadge
            compact
            label="Wi-Fi en casa"
            value={wifiText}
            status={wifiStatus}
          />
          <TelemetryBadge
            compact
            label="Velocidad"
            value={speedText}
            status={speedStatus}
          />
        </View>
      </View>

      {/* Banner de acción en curso */}
      {isExecutingAction && (
        <View style={styles.executingBanner}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.executingBannerText}>{executingActionText}</Text>
        </View>
      )}

      {/* Conversación */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de Bienvenida con Diseño e Identidad Claro */}
        <View style={styles.claroWelcomeBanner}>
          <View style={styles.welcomeTopRow}>
            <Image
              source={require('../../assets/claro-logo.png')}
              style={styles.welcomeLogo}
              resizeMode="contain"
            />
            <View style={styles.planPill}>
              <Text style={styles.planPillText}>Fibra 600 Mbps</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>
            Centro de Ayuda Inteligente Mi Claro
          </Text>
          <Text style={styles.welcomeSub}>
            Conectado automáticamente a tu router para resolver inconvenientes sin llamadas ni esperas.
          </Text>
        </View>

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <View style={styles.typingIndicatorRow}>
            <Image
              source={require('../../assets/claro-circle-logo.png')}
              style={styles.typingAvatar}
              resizeMode="contain"
            />
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#DA291C" />
              <Text style={styles.typingText}>
                Asistente Claro está escribiendo...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Preguntas rápidas sugeridas */}
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

      {/* Caja de texto */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe tu pregunta aquí..."
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
    backgroundColor: '#F4F5F7',
  },
  liveTelemetryStrip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  },
  executingBannerText: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 12,
    paddingBottom: 18,
  },
  claroWelcomeBanner: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderTopWidth: 4,
    borderTopColor: '#DA291C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  welcomeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  welcomeLogo: {
    width: 74,
    height: 26,
  },
  planPill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  planPillText: {
    color: '#DA291C',
    fontSize: 11,
    fontWeight: '800',
  },
  welcomeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  welcomeSub: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginTop: 6,
  },
  typingAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typingText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 8,
  },
  quickPromptsBar: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickPromptChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginRight: 8,
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DA291C',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#DA291C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
