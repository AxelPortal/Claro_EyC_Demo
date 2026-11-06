import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  NetworkSimulationProvider,
  useNetworkSimulation,
} from './context/NetworkSimulationContext';
import { SupportChatScreen } from './screens/SupportChatScreen';
import { NetworkDashboardScreen } from './screens/NetworkDashboardScreen';
import { AuthScreen } from './screens/AuthScreen';
import { PatchcordGuideModal } from './components/PatchcordGuideModal';
import { DemoScenarioDrawer } from './components/DemoScenarioDrawer';

type TabKey = 'chat' | 'dashboard';

const MainShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const {
    currentUser,
    logoutUser,
    setDemoDrawerOpen,
    telemetry,
  } = useNetworkSimulation();

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.outerBackground}>
        <StatusBar style="light" />
        <View style={styles.appWrapper}>
          <AuthScreen />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.outerBackground}>
      <StatusBar style="light" />
      <View style={styles.appWrapper}>
        {/* Cabecera Oficial con el Logo Claro y Nombre del Usuario */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoCard}>
              <Image
                source={require('../assets/claro-logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerTitleCol}>
              <Text style={styles.headerTitle}>Soporte Mi Claro</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                Hola, {currentUser.firstName} · {currentUser.district}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
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
              <Text style={styles.statusMenuBtnText}>Red ▾</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={logoutUser}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>Salir</Text>
            </TouchableOpacity>
          </View>
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
            <View style={styles.tabTitleRow}>
              <Image
                source={require('../assets/claro-circle-logo.png')}
                style={styles.tabMiniLogo}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'chat' && styles.tabTextActive,
                ]}
              >
                Asistente
              </Text>
            </View>
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
  logoCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLogo: {
    width: 58,
    height: 20,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  headerSub: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 1,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusMenuBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusMenuBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
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
  tabMiniLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
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
