import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  NetworkSimulationProvider,
  ScenarioId,
  useNetworkSimulation,
} from './context/NetworkSimulationContext';
import { SupportChatScreen } from './screens/SupportChatScreen';
import { NetworkDashboardScreen } from './screens/NetworkDashboardScreen';
import { PatchcordGuideModal } from './components/PatchcordGuideModal';
import { DemoScenarioDrawer } from './components/DemoScenarioDrawer';

type TabKey = 'chat' | 'dashboard';

const MainShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const {
    activeScenario,
    selectScenario,
    setDemoDrawerOpen,
    telemetry,
  } = useNetworkSimulation();

  const scenarios: Array<{ id: ScenarioId; shortLabel: string }> = [
    { id: 'A', shortLabel: 'A: Wi-Fi (F1/2)' },
    { id: 'B', shortLabel: 'B: Cable (F3)' },
    { id: 'C', shortLabel: 'C: Corte (F4)' },
    { id: 'D', shortLabel: 'D: Óptimo' },
  ];

  return (
    <SafeAreaView style={styles.outerBackground}>
      <StatusBar style="light" />
      <View style={styles.appWrapper}>
        {/* Top Corporate Header Claro Perú + Botón de Modo Demostración */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.claroCircle}>
              <Text style={styles.claroCircleText}>Claro</Text>
            </View>
            <View style={styles.headerTitleCol}>
              <View style={styles.titleWithVerified}>
                <Text style={styles.headerTitle}>Copiloto Claro IA</Text>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>✓ ONT Live</Text>
                </View>
              </View>
              <Text style={styles.headerSub} numberOfLines={1}>
                Titular: Axel Portal · FTTH 600 Mbps
              </Text>
            </View>
          </View>

          {/* Botón Esquina Superior para Evaluador ("Modo Demostración") */}
          <TouchableOpacity
            style={styles.demoModeBtn}
            onPress={() => setDemoDrawerOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.demoModeBtnLabel}>⚙️ Modo Demo</Text>
            <Text style={styles.demoModeBtnSub}>Escenario {activeScenario}</Text>
          </TouchableOpacity>
        </View>

        {/* Barra Rápida de Escenarios para Evaluación Ágil */}
        <View style={styles.quickScenarioBar}>
          <Text style={styles.quickScenarioTitle}>Simular:</Text>
          <View style={styles.quickScenarioButtons}>
            {scenarios.map((sc) => {
              const selected = activeScenario === sc.id;
              return (
                <TouchableOpacity
                  key={sc.id}
                  style={[
                    styles.scenarioChip,
                    selected && styles.scenarioChipActive,
                  ]}
                  onPress={() => selectScenario(sc.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.scenarioChipText,
                      selected && styles.scenarioChipTextActive,
                    ]}
                  >
                    {sc.shortLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Contenido Principal (Pantalla Activa) */}
        <View style={styles.screenContainer}>
          {activeTab === 'chat' ? (
            <SupportChatScreen />
          ) : (
            <NetworkDashboardScreen onNavigateToChat={() => setActiveTab('chat')} />
          )}
        </View>

        {/* Navegación por Tabs Inferior */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'chat' && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab('chat')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabIcon,
                activeTab === 'chat' && styles.tabTextActive,
              ]}
            >
              💬 Copiloto IA (Soporte)
            </Text>
            <Text style={styles.tabSub}>Fases 2, 3 y 4 · NLP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'dashboard' && styles.tabItemActive,
            ]}
            onPress={() => setActiveTab('dashboard')}
            activeOpacity={0.85}
          >
            <View style={styles.tabTitleRow}>
              <Text
                style={[
                  styles.tabIcon,
                  activeTab === 'dashboard' && styles.tabTextActive,
                ]}
              >
                📊 Telemetría ONT
              </Text>
              <View
                style={[
                  styles.healthMiniDot,
                  {
                    backgroundColor:
                      telemetry.healthScore >= 85
                        ? '#10B981'
                        : telemetry.healthScore >= 50
                        ? '#F59E0B'
                        : '#DA291C',
                  },
                ]}
              />
            </View>
            <Text style={styles.tabSub}>
              Fase 1 · Salud {telemetry.healthScore}%
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modales Globales */}
        <PatchcordGuideModal />
        <DemoScenarioDrawer />
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <NetworkSimulationProvider>
      <MainShell />
    </NetworkSimulationProvider>
  );
}

const styles = StyleSheet.create({
  outerBackground: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 520 : '100%',
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#374151',
        }
      : {}),
  },
  header: {
    backgroundColor: '#DA291C',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  claroCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  claroCircleText: {
    color: '#DA291C',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: -0.3,
  },
  headerTitleCol: {
    flex: 1,
  },
  titleWithVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginRight: 6,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  headerSub: {
    color: '#FEE2E2',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  demoModeBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  demoModeBtnLabel: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '900',
  },
  demoModeBtnSub: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  quickScenarioBar: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickScenarioTitle: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 6,
    textTransform: 'uppercase',
  },
  quickScenarioButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scenarioChip: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  scenarioChipActive: {
    backgroundColor: '#DA291C',
  },
  scenarioChipText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '800',
  },
  scenarioChipTextActive: {
    color: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  tabItemActive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  tabTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#DA291C',
  },
  tabSub: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 1,
    fontWeight: '600',
  },
  healthMiniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
});
