import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  ScenarioId,
  useNetworkSimulation,
} from '../context/NetworkSimulationContext';

interface ScenarioOption {
  id: ScenarioId;
  code: string;
  title: string;
  phaseLabel: string;
  description: string;
  metricsPreview: string;
  accentColor: string;
}

const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    id: 'A',
    code: 'ESCENARIO A',
    title: 'Congestión Wi-Fi (Fase 1 y 2)',
    phaseLabel: 'Fases 1 y 2 · ML Predictivo + Consentimiento NLP',
    description:
      'Simula alta latencia (142 ms) y saturación del 92% en el canal 36 de 5 GHz. La IA pide permiso explícito, migra al canal limpio 149 en 1.5s y valida la mejora.',
    metricsPreview: 'Rx: -19.4 dBm (OK) | Ping: 142 ms | Canal 5G: 92% Sat.',
    accentColor: '#F59E0B',
  },
  {
    id: 'B',
    code: 'ESCENARIO B',
    title: 'Cable Patchcord Flojo (Fase 3)',
    phaseLabel: 'Fase 3 · Escenario Físico Asistido en el Hogar',
    description:
      'Simula atenuación óptica anormal (-28.6 dBm) por doblez o conector flojo en el cable amarillo. Muestra guía visual PON; al pulsar "Ajustar cable", vuelve a -19.0 dBm.',
    metricsPreview: 'Rx: -28.6 dBm (Atenuado) | Pérdida: 8.5% | Guía PON',
    accentColor: '#EA580C',
  },
  {
    id: 'C',
    code: 'ESCENARIO C',
    title: 'Corte Externo de Fibra (Fase 4)',
    phaseLabel: 'Fase 4 · Derivación Inteligente & Código OSIPTEL',
    description:
      'Simula pérdida total de señal óptica (-31.5 dBm / LOS) en el nodo distrital. La IA ejecuta descartes automáticos y emite el Ticket Oficial CLARO-AV-2026-9814.',
    metricsPreview: 'Rx: -31.5 dBm (LOS) | Sin Señal | Ticket OSIPTEL',
    accentColor: '#DA291C',
  },
  {
    id: 'D',
    code: 'ESCENARIO D',
    title: 'Estado Óptimo (100% Salud)',
    phaseLabel: 'Monitoreo Continuo · Métricas Perfectas',
    description:
      'Muestra la red FTTH operando con métricas ideales: potencia óptica -18.9 dBm, latencia 7 ms, 0% pérdida de paquetes y 624 Mbps estables.',
    metricsPreview: 'Rx: -18.9 dBm | Ping: 7 ms | Velocidad: 624 Mbps',
    accentColor: '#10B981',
  },
];

export const DemoScenarioDrawer: React.FC = () => {
  const {
    isDemoDrawerOpen,
    setDemoDrawerOpen,
    activeScenario,
    selectScenario,
    geminiConnected,
    customApiKey,
    updateCustomApiKey,
  } = useNetworkSimulation();

  const [apiKeyDraft, setApiKeyDraft] = useState(customApiKey);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveKey = () => {
    updateCustomApiKey(apiKeyDraft);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <Modal
      visible={isDemoDrawerOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setDemoDrawerOpen(false)}
    >
      <View style={styles.backdrop}>
        <View style={styles.drawerContainer}>
          {/* Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.headerTextCol}>
              <View style={styles.utecBadge}>
                <Text style={styles.utecBadgeText}>
                  MODO DEMOSTRACIÓN · EVALUADOR UTEC
                </Text>
              </View>
              <Text style={styles.drawerTitle}>
                Controlador de Escenarios de Telemetría
              </Text>
              <Text style={styles.drawerSubtitle}>
                Selecciona un caso para simular en vivo las 4 fases del Copiloto Claro
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setDemoDrawerOpen(false)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.drawerScroll}
            showsVerticalScrollIndicator={false}
          >
            {SCENARIO_OPTIONS.map((item) => {
              const isSelected = activeScenario === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.scenarioCard,
                    isSelected && {
                      borderColor: item.accentColor,
                      borderWidth: 2,
                      backgroundColor: '#FFFDFB',
                    },
                  ]}
                  onPress={() => selectScenario(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.scenarioTopRow}>
                    <View
                      style={[
                        styles.codeBadge,
                        { backgroundColor: item.accentColor },
                      ]}
                    >
                      <Text style={styles.codeBadgeText}>{item.code}</Text>
                    </View>
                    {isSelected ? (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>● ACTIVO AHORA</Text>
                      </View>
                    ) : (
                      <Text style={styles.tapToActivate}>Tocar para simular →</Text>
                    )}
                  </View>

                  <Text style={styles.scenarioTitle}>{item.title}</Text>
                  <Text style={styles.scenarioPhase}>{item.phaseLabel}</Text>
                  <Text style={styles.scenarioDesc}>{item.description}</Text>

                  <View style={styles.metricsPreviewBox}>
                    <Text style={styles.metricsPreviewText}>
                      📊 {item.metricsPreview}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Configuración opcional de Gemini API Key (.env o en vivo) */}
            <View style={styles.geminiBox}>
              <View style={styles.geminiHeaderRow}>
                <Text style={styles.geminiTitle}>Motor LLM: Google Gemini API</Text>
                <View
                  style={[
                    styles.geminiStatusPill,
                    { backgroundColor: geminiConnected ? '#DCFCE7' : '#FEF3C7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.geminiStatusText,
                      { color: geminiConnected ? '#065F46' : '#92400E' },
                    ]}
                  >
                    {geminiConnected
                      ? '● API Key Configurada'
                      : '● Modo Simulación Local (.env opcional)'}
                  </Text>
                </View>
              </View>
              <Text style={styles.geminiHelp}>
                Lee automáticamente EXPO_PUBLIC_GEMINI_API_KEY desde tu archivo .env o puedes pegar tu API Key aquí para pruebas en vivo:
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.apiKeyInput}
                  value={apiKeyDraft}
                  onChangeText={setApiKeyDraft}
                  placeholder="AIzaSy... (EXPO_PUBLIC_GEMINI_API_KEY)"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.saveKeyBtn}
                  onPress={handleSaveKey}
                >
                  <Text style={styles.saveKeyBtnText}>
                    {savedNotice ? '✓ Listo' : 'Aplicar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  drawerContainer: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  drawerHeader: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextCol: {
    flex: 1,
    marginRight: 10,
  },
  utecBadge: {
    backgroundColor: '#DA291C',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginBottom: 6,
  },
  utecBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  drawerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  drawerSubtitle: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  drawerScroll: {
    padding: 14,
  },
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  scenarioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activePillText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '900',
  },
  tapToActivate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  scenarioTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  scenarioPhase: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DA291C',
    marginTop: 2,
    marginBottom: 5,
  },
  scenarioDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 8,
  },
  metricsPreviewBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metricsPreviewText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  geminiBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  geminiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  geminiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  geminiStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  geminiStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  geminiHelp: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiKeyInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1F2937',
    marginRight: 8,
  },
  saveKeyBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  saveKeyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
