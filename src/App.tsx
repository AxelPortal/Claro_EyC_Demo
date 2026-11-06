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
  useNetworkSimulation,
} from './context/NetworkSimulationContext';
import { SupportChatScreen } from './screens/SupportChatScreen';
import { NetworkDashboardScreen } from './screens/NetworkDashboardScreen';
import { PatchcordGuideModal } from './components/PatchcordGuideModal';
import { DemoScenarioDrawer } from './components/DemoScenarioDrawer';

type TabKey = 'chat' | 'dashboard';

const MainShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const { setDemoDrawerOpen, telemetry } = useNetworkSimulation();

  return (
    <SafeAreaView style={styles.outerBackground}>
      <StatusBar style="light" />
      <View style={styles.appWrapper}>
        {/* Cabecera limpia estilo App Mi Claro */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.claroCircle}>
              <Text style={styles.claroCircleText}>Claro</Text>
            </View>
            <View style={styles.headerTitleCol}>
              <Text style={styles.headerTitle}>Soporte Mi Claro</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                Hogar · San Isidro
              </Text>
            </View>
          </View>

          {/* Acceso discreto para cambiar el estado de la red */}
          <TouchableOpacity
            style={styles.statusMenuBtn}
            onPress={() => setDemoDrawerOpen(true)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    telemetry.healthScore >= 85
                      ? '#10B981'
                      : telemetry.scenarioId === 'C'
                      ? '#FCA5A5'
                      : '#FBBF24',
                },
              ]}
            />
            <Text style={styles.statusMenuBtnText}>Estado de red ▾</Text>
          </TouchableOpacity>
        </View>

        {/* Pantalla activa */}
        <View style={styles.screenContainer}>
          {activeTab === 'chat' ? (
            <SupportChatScreen />
          ) : (
            <NetworkDashboardScreen onNavigateToChat={() => setActiveTab('chat')} />
          )}
        </View>

        {/* Barra de navegación inferior */}
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
                styles.tabLabel,
                activeTab === 'chat' && styles.tabTextActive,
              ]}
            >
              💬 Asistente
            </Text>
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
                  styles.tabLabel,
                  activeTab === 'dashboard' && styles.tabTextActive,
                ]}
              >
                📶 Mi Conexión
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
          </TouchableOpacity>
        </View>

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
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
    paddingBottom: 14,
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
    width: 38,
    height: 38,
    borderRadius: 19,
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 1,
  },
  statusMenuBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusMenuBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  tabItemActive: {
    backgroundColor: '#FEF2F2',
  },
  tabTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#DA291C',
    fontWeight: '800',
  },
  healthMiniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
});
