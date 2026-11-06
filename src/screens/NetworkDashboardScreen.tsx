import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNetworkSimulation } from '../context/NetworkSimulationContext';
import { TelemetryBadge, TelemetryStatus } from '../components/TelemetryBadge';

export const NetworkDashboardScreen: React.FC<{
  onNavigateToChat?: () => void;
}> = ({ onNavigateToChat }) => {
  const {
    telemetry,
    diagnosticLogs,
    isExecutingAction,
    triggerOptimizeWifi,
    setPatchcordModalOpen,
  } = useNetworkSimulation();

  const fiberStatus: TelemetryStatus =
    telemetry.rxPowerDbm === null || telemetry.rxPowerDbm < -30
      ? 'critical'
      : telemetry.rxPowerDbm < -24.5
      ? 'warning'
      : 'optimal';

  const wifiStatus: TelemetryStatus =
    telemetry.wifi5SaturationPct > 70 ? 'warning' : 'optimal';

  const zoneStatus: TelemetryStatus =
    telemetry.nodeStatus === 'NORMAL' ? 'optimal' : 'critical';

  const overallStatusLabel =
    telemetry.healthScore >= 85
      ? 'Tu internet está al 100%'
      : telemetry.scenarioId === 'C'
      ? 'Avería externa en tu cuadra'
      : 'Tu conexión puede mejorar';

  const overallColor =
    telemetry.healthScore >= 85
      ? '#10B981'
      : telemetry.scenarioId === 'C'
      ? '#DA291C'
      : '#F59E0B';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Tarjeta Principal con Branding Oficial Claro */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeaderRow}>
          <View style={styles.claroWhiteBadge}>
            <Image
              source={require('../../assets/claro-logo.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>
          <View style={[styles.statusPill, { backgroundColor: overallColor }]}>
            <Text style={styles.statusPillText}>
              {telemetry.healthScore >= 85
                ? '✓ Óptimo'
                : telemetry.scenarioId === 'C'
                ? 'En atención'
                : 'Por mejorar'}
            </Text>
          </View>
        </View>

        <Text style={styles.heroMainStatus}>{overallStatusLabel}</Text>
        <Text style={styles.heroPlanText}>
          Plan Claro Hogar Fibra {telemetry.contractedMbps} Mbps · San Isidro
        </Text>

        {/* Esquema Visual Sencillo de la Red del Hogar */}
        <View style={styles.visualMapCard}>
          <View style={styles.mapNode}>
            <View
              style={[
                styles.mapIconCircle,
                {
                  borderColor:
                    zoneStatus === 'optimal' ? '#10B981' : '#EF4444',
                },
              ]}
            >
              <Text style={styles.mapEmoji}>🌐</Text>
            </View>
            <Text style={styles.mapNodeLabel}>Red Claro</Text>
            <Text
              style={[
                styles.mapNodeState,
                { color: zoneStatus === 'optimal' ? '#10B981' : '#FCA5A5' },
              ]}
            >
              {zoneStatus === 'optimal' ? 'Estable' : 'Con avería'}
            </Text>
          </View>

          <View
            style={[
              styles.mapLine,
              {
                backgroundColor:
                  fiberStatus === 'optimal'
                    ? '#10B981'
                    : fiberStatus === 'warning'
                    ? '#F59E0B'
                    : '#EF4444',
              },
            ]}
          />

          <View style={styles.mapNode}>
            <View
              style={[
                styles.mapIconCircle,
                {
                  borderColor:
                    fiberStatus === 'optimal'
                      ? '#10B981'
                      : fiberStatus === 'warning'
                      ? '#F59E0B'
                      : '#EF4444',
                },
              ]}
            >
              <Image
                source={require('../../assets/claro-circle-logo.png')}
                style={styles.routerMiniLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.mapNodeLabel}>Tu Router</Text>
            <Text
              style={[
                styles.mapNodeState,
                {
                  color:
                    fiberStatus === 'optimal'
                      ? '#10B981'
                      : fiberStatus === 'warning'
                      ? '#FCD34D'
                      : '#FCA5A5',
                },
              ]}
            >
              {fiberStatus === 'optimal'
                ? 'Conectado'
                : fiberStatus === 'warning'
                ? 'Cable flojo'
                : 'Sin señal'}
            </Text>
          </View>

          <View
            style={[
              styles.mapLine,
              {
                backgroundColor:
                  wifiStatus === 'optimal' ? '#10B981' : '#F59E0B',
              },
            ]}
          />

          <View style={styles.mapNode}>
            <View
              style={[
                styles.mapIconCircle,
                {
                  borderColor:
                    wifiStatus === 'optimal' ? '#10B981' : '#F59E0B',
                },
              ]}
            >
              <Text style={styles.mapEmoji}>📱</Text>
            </View>
            <Text style={styles.mapNodeLabel}>Tus Equipos</Text>
            <Text style={styles.mapNodeState}>
              {telemetry.connectedDevices} conectados
            </Text>
          </View>
        </View>

        {telemetry.wifi5SaturationPct > 70 && (
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => triggerOptimizeWifi()}
            disabled={isExecutingAction}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionBtnText}>
              {isExecutingAction
                ? 'Mejorando tu Wi-Fi...'
                : '✨ Mejorar mi señal Wi-Fi ahora'}
            </Text>
          </TouchableOpacity>
        )}

        {fiberStatus === 'warning' && (
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => setPatchcordModalOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionBtnText}>
              Ver cómo ajustar el cable amarillo
            </Text>
          </TouchableOpacity>
        )}

        {onNavigateToChat && (
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={onNavigateToChat}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryActionBtnText}>
              💬 Consultar al Asistente Claro
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 1. Estado de la zona */}
      <TelemetryBadge
        label="Servicio en tu cuadra (San Isidro)"
        value={
          zoneStatus === 'optimal'
            ? 'Sin inconvenientes en la calle'
            : 'Avería detectada en el poste de tu zona'
        }
        subLabel={
          zoneStatus === 'optimal'
            ? 'La señal exterior de Claro llega con normalidad a tu edificio.'
            : 'Nuestro equipo técnico ya tiene asignada la reparación afuera de tu hogar. No necesitas llamar.'
        }
        status={zoneStatus}
      />

      {/* 2. Estado del cable en el router */}
      <TelemetryBadge
        label="Llegada de señal a tu router"
        value={
          fiberStatus === 'optimal'
            ? 'Cable bien conectado'
            : fiberStatus === 'warning'
            ? 'El cable amarillo parece estar flojo o doblado'
            : 'Sin señal por avería en la calle'
        }
        subLabel={
          fiberStatus === 'optimal'
            ? 'El cable detrás de tu router recibe la señal con fuerza óptima.'
            : fiberStatus === 'warning'
            ? 'Revisa que el cable amarillo detrás del router esté estirado y bien enchufado en la entrada verde.'
            : 'Tu router está en buen estado; la interrupción viene desde el cableado exterior.'
        }
        status={fiberStatus}
      />

      {/* 3. Estado del Wi-Fi dentro de casa */}
      <TelemetryBadge
        label="Señal Wi-Fi dentro de tu casa"
        value={
          wifiStatus === 'optimal'
            ? 'Señal libre y rápida'
            : 'Con interferencia de redes vecinas'
        }
        subLabel={
          wifiStatus === 'optimal'
            ? `Tus ${telemetry.connectedDevices} dispositivos conectados navegan a máxima velocidad.`
            : 'Hay varios routers cercanos saturando tu señal. Podemos pasarte a un canal libre automáticamente.'
        }
        status={wifiStatus}
      />

      {/* Actividad reciente */}
      <View style={styles.logsCard}>
        <Text style={styles.logsTitle}>Revisiones automáticas recientes</Text>
        {diagnosticLogs.map((log) => (
          <View key={log.id} style={styles.logItem}>
            <View
              style={[
                styles.logDot,
                {
                  backgroundColor:
                    log.status === 'ok'
                      ? '#10B981'
                      : log.status === 'warning'
                      ? '#F59E0B'
                      : '#DA291C',
                },
              ]}
            />
            <View style={styles.logTextCol}>
              <View style={styles.logHeaderRow}>
                <Text style={styles.logPhase}>{log.title}</Text>
                <Text style={styles.logTime}>{log.time}</Text>
              </View>
              <Text style={styles.logDetail}>{log.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  content: {
    padding: 14,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  claroWhiteBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroLogo: {
    width: 64,
    height: 22,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroMainStatus: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 3,
  },
  heroPlanText: {
    color: '#D1D5DB',
    fontSize: 13,
    marginBottom: 14,
  },
  visualMapCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  mapNode: {
    alignItems: 'center',
    width: 82,
  },
  mapIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  mapEmoji: {
    fontSize: 18,
  },
  routerMiniLogo: {
    width: 28,
    height: 28,
  },
  mapNodeLabel: {
    color: '#F9FAFB',
    fontSize: 11,
    fontWeight: '700',
  },
  mapNodeState: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  mapLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginBottom: 22,
  },
  primaryActionBtn: {
    backgroundColor: '#DA291C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    backgroundColor: '#374151',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 10,
  },
  logTextCol: {
    flex: 1,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  logPhase: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  logTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  logDetail: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
  },
});
