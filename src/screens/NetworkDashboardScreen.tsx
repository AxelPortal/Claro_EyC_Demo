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
    runQuickTelemetryScan,
  } = useNetworkSimulation();

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

  const wifi5Status: TelemetryStatus =
    telemetry.wifi5SaturationPct > 75
      ? 'warning'
      : telemetry.wifi5SaturationPct > 90
      ? 'critical'
      : 'optimal';

  const nodeBadgeStatus: TelemetryStatus =
    telemetry.nodeStatus === 'NORMAL'
      ? 'optimal'
      : telemetry.nodeStatus === 'CONGESTION_LEVE'
      ? 'warning'
      : 'critical';

  const healthColor =
    telemetry.healthScore >= 85
      ? '#10B981'
      : telemetry.healthScore >= 50
      ? '#F59E0B'
      : '#DA291C';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Tarjeta Principal de Salud de Red y Estado de la ONT */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroOverline}>
              FASE 1 · TELEMETRÍA ONT & ML PREDICTIVO
            </Text>
            <Text style={styles.heroModelName}>{telemetry.ontModel}</Text>
            <Text style={styles.heroScenarioText}>{telemetry.scenarioName}</Text>
          </View>

          <View style={[styles.scoreCircle, { borderColor: healthColor }]}>
            <Text style={[styles.scoreValue, { color: healthColor }]}>
              {telemetry.healthScore}%
            </Text>
            <Text style={styles.scoreLabel}>SALUD</Text>
          </View>
        </View>

        {/* Velocidades Efectivas */}
        <View style={styles.speedRow}>
          <View style={styles.speedBox}>
            <Text style={styles.speedLabel}>DESCARGA ACTUAL</Text>
            <Text style={styles.speedValue}>{telemetry.downloadMbps} Mbps</Text>
            <Text style={styles.speedSub}>
              Plan: {telemetry.contractedMbps} Mbps FTTH
            </Text>
          </View>
          <View style={styles.speedDivider} />
          <View style={styles.speedBox}>
            <Text style={styles.speedLabel}>SUBIDA ACTUAL</Text>
            <Text style={styles.speedValue}>{telemetry.uploadMbps} Mbps</Text>
            <Text style={styles.speedSub}>Simétrico Fibra Claro</Text>
          </View>
        </View>

        {/* Acciones Rápidas de Diagnóstico */}
        <View style={styles.heroActionsRow}>
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={runQuickTelemetryScan}
            disabled={isExecutingAction}
            activeOpacity={0.85}
          >
            <Text style={styles.scanBtnText}>
              {isExecutingAction ? 'Escaneando ONT...' : '🔄 Re-escanear Telemetría'}
            </Text>
          </TouchableOpacity>

          {onNavigateToChat && (
            <TouchableOpacity
              style={styles.chatGoBtn}
              onPress={onNavigateToChat}
              activeOpacity={0.85}
            >
              <Text style={styles.chatGoBtnText}>💬 Ir al Copiloto IA</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Estado del Nodo Distrital */}
      <TelemetryBadge
        iconText="NODO"
        label="Estado del Nodo Distrital (Planta Externa)"
        value={telemetry.nodeName}
        subLabel={
          telemetry.nodeStatus === 'NORMAL'
            ? 'Operación Normal · Splitter Óptico 1:16 sin caídas masivas reportadas'
            : 'Incidencia Externa Detectada · Corte de fibra en Caja NAP Poste #402 (Ticket OSIPTEL Activo)'
        }
        status={nodeBadgeStatus}
      />

      {/* Potencia Óptica Rx (dBm) */}
      <TelemetryBadge
        iconText="PON"
        label="Potencia Óptica Rx / Tx (Láser FTTH)"
        value={
          telemetry.rxPowerDbm !== null
            ? `Rx: ${telemetry.rxPowerDbm.toFixed(1)} dBm  |  Tx: +${telemetry.txPowerDbm.toFixed(1)} dBm`
            : 'SIN SEÑAL (-31.5 dBm / Alarma LOS)'
        }
        subLabel="Rango Normal: -18.0 dBm a -24.0 dBm  |  Falla Crítica: < -28.0 dBm o Sin Señal"
        status={rxStatus}
      />

      {/* Botón Contextual si hay Atenuación en Fase 3 */}
      {telemetry.rxPowerDbm !== null &&
        telemetry.rxPowerDbm < -25 &&
        telemetry.rxPowerDbm > -30 && (
          <TouchableOpacity
            style={styles.contextualAlertBtn}
            onPress={() => setPatchcordModalOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.contextualAlertBtnText}>
              ⚠️ Atenuación Física Detectada: Abrir Guía del Cable Amarillo (Patchcord)
            </Text>
          </TouchableOpacity>
        )}

      {/* Latencia / Ping y Pérdida de Paquetes */}
      <TelemetryBadge
        iconText="PING"
        label="Latencia (Ping), Jitter y Pérdida de Paquetes"
        value={
          telemetry.packetLossPct >= 100
            ? 'Sin Conectividad IP (100% Pérdida)'
            : `${telemetry.pingMs} ms Ping  ·  ${telemetry.packetLossPct}% Pérdida`
        }
        subLabel={`Jitter: ${telemetry.jitterMs} ms · Hacia Servidor Claro Lima (8.8.8.8 / IXP PIT Perú)`}
        status={pingStatus}
      />

      {/* Saturación de Canales Wi-Fi (2.4 GHz y 5 GHz) */}
      <View style={styles.wifiPanel}>
        <View style={styles.wifiPanelHeader}>
          <Text style={styles.wifiPanelTitle}>
            ESPECTRO WI-FI & DISPOSITIVOS CONECTADOS
          </Text>
          <View style={styles.devicesCountPill}>
            <Text style={styles.devicesCountText}>
              📱 {telemetry.connectedDevices} Equipos Activos
            </Text>
          </View>
        </View>

        {/* Banda 5 GHz */}
        <View style={styles.bandRow}>
          <View style={styles.bandTitleRow}>
            <Text style={styles.bandName}>
              Banda 5 GHz (Canal {telemetry.wifi5Channel})
            </Text>
            <Text
              style={[
                styles.bandPct,
                {
                  color:
                    telemetry.wifi5SaturationPct > 70 ? '#D97706' : '#059669',
                },
              ]}
            >
              {telemetry.wifi5SaturationPct}% Saturación
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, telemetry.wifi5SaturationPct)}%`,
                  backgroundColor:
                    telemetry.wifi5SaturationPct > 70 ? '#F59E0B' : '#10B981',
                },
              ]}
            />
          </View>
          <Text style={styles.bandHint}>
            {telemetry.wifi5SaturationPct > 70
              ? 'Alta interferencia con redes vecinas en Canal 36. Se recomienda migrar a Canal 149.'
              : 'Canal despejado de alta velocidad (80 MHz Wi-Fi 6).'}
          </Text>
        </View>

        {/* Banda 2.4 GHz */}
        <View style={[styles.bandRow, { marginTop: 12 }]}>
          <View style={styles.bandTitleRow}>
            <Text style={styles.bandName}>
              Banda 2.4 GHz (Canal {telemetry.wifi24Channel})
            </Text>
            <Text
              style={[
                styles.bandPct,
                {
                  color:
                    telemetry.wifi24SaturationPct > 70 ? '#D97706' : '#059669',
                },
              ]}
            >
              {telemetry.wifi24SaturationPct}% Saturación
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, telemetry.wifi24SaturationPct)}%`,
                  backgroundColor:
                    telemetry.wifi24SaturationPct > 70 ? '#F59E0B' : '#10B981',
                },
              ]}
            />
          </View>
          <Text style={styles.bandHint}>
            Banda de largo alcance para dispositivos IoT y habitaciones lejanas.
          </Text>
        </View>

        {telemetry.wifi5SaturationPct > 70 && (
          <TouchableOpacity
            style={styles.optimizeFromDashBtn}
            onPress={() => triggerOptimizeWifi()}
            disabled={isExecutingAction}
            activeOpacity={0.85}
          >
            <Text style={styles.optimizeFromDashBtnText}>
              ⚡ Optimizar Canales Wi-Fi Ahora (1.5s)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bitácora de Eventos del Motor Predictivo */}
      <View style={styles.logsCard}>
        <Text style={styles.logsTitle}>
          HISTORIAL DE DESCARTES Y EVENTOS DE TELEMETRÍA
        </Text>
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
                <Text style={styles.logPhase}>{log.phase}</Text>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroLeft: {
    flex: 1,
    marginRight: 12,
  },
  heroOverline: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  heroModelName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  heroScenarioText: {
    color: '#D1D5DB',
    fontSize: 12,
    marginTop: 2,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  scoreLabel: {
    color: '#9CA3AF',
    fontSize: 8,
    fontWeight: '800',
  },
  speedRow: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  speedBox: {
    flex: 1,
    alignItems: 'center',
  },
  speedDivider: {
    width: 1,
    backgroundColor: '#4B5563',
    marginHorizontal: 8,
  },
  speedLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800',
  },
  speedValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 2,
  },
  speedSub: {
    color: '#D1D5DB',
    fontSize: 10,
  },
  heroActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scanBtn: {
    flex: 1,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#6B7280',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  chatGoBtn: {
    flex: 1,
    backgroundColor: '#DA291C',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  chatGoBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  contextualAlertBtn: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  contextualAlertBtnText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  wifiPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  wifiPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  wifiPanelTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
  },
  devicesCountPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  devicesCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },
  bandRow: {
    marginBottom: 4,
  },
  bandTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  bandName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  bandPct: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressBarTrack: {
    width: '100%',
    height: 9,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  bandHint: {
    fontSize: 11,
    color: '#6B7280',
  },
  optimizeFromDashBtn: {
    backgroundColor: '#DA291C',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  optimizeFromDashBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  logsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 10,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 4,
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
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },
  logTime: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  logDetail: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
});
