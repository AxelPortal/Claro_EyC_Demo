import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
      ? 'Todo funciona muy bien'
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
      {/* Resumen Principal Sencillo */}
      <View style={styles.heroCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadgeDot, { backgroundColor: overallColor }]} />
          <Text style={styles.heroOverline}>ESTADO DE TU INTERNET HOGAR</Text>
        </View>

        <Text style={styles.heroMainStatus}>{overallStatusLabel}</Text>
        <Text style={styles.heroPlanText}>
          Plan Claro Hogar {telemetry.contractedMbps} Mbps · {telemetry.connectedDevices} equipos conectados en casa
        </Text>

        {telemetry.wifi5SaturationPct > 70 && (
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => triggerOptimizeWifi()}
            disabled={isExecutingAction}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionBtnText}>
              {isExecutingAction ? 'Mejorando tu Wi-Fi...' : 'Mejorar mi señal Wi-Fi ahora'}
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
              Hablar con el Asistente Claro
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
            ? 'La red exterior de Claro opera con total normalidad en tu distrito.'
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
            ? 'La señal llega con fuerza óptima hasta tu router.'
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
            ? `Tus ${telemetry.connectedDevices} dispositivos conectados navegan sin congestión.`
            : 'Hay varios routers cercanos usando el mismo canal. Podemos pasarte a uno libre automáticamente.'
        }
        status={wifiStatus}
      />

      {/* Actividad reciente */}
      <View style={styles.logsCard}>
        <Text style={styles.logsTitle}>Revisiones recientes</Text>
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
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 14,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#1F2937',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusBadgeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 7,
  },
  heroOverline: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  heroMainStatus: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroPlanText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 14,
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
