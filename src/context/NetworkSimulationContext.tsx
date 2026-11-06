import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  TelemetrySnapshot,
  ChatHistoryItem,
  generateCopilotResponse,
  isGeminiConfigured,
  getActiveGeminiApiKey,
  setRuntimeGeminiApiKey,
} from '../services/geminiService';

export type ScenarioId = 'A' | 'B' | 'C' | 'D';

export interface TicketAveriaData {
  ticketCode: string;
  osiptelCode: string;
  createdAt: string;
  clientName: string;
  serviceAddress: string;
  planName: string;
  ontModel: string;
  rxPowerRecorded: string;
  nodeAffected: string;
  estimatedVisitWindow: string;
  technicianCrew: string;
  automatedDiscards: string[];
  fieldSummary: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'copilot' | 'user' | 'system';
  timestamp: string;
  text: string;
  phaseBadge?: string;
  usedGemini?: boolean;
  actionButton?: {
    label: string;
    actionType: 'OPTIMIZE_WIFI' | 'OPEN_PATCHCORD_MODAL' | 'VERIFY_PATCHCORD' | 'RUN_DIAGNOSTIC';
    completed?: boolean;
    completedLabel?: string;
  };
  secondaryButton?: {
    label: string;
    actionType: 'OPEN_PATCHCORD_MODAL' | 'VERIFY_PATCHCORD';
  };
  cardType?: 'PATCHCORD_GUIDE' | 'TICKET_AVERIA' | 'METRICS_DIFF';
  metricsDiff?: {
    title: string;
    items: Array<{
      label: string;
      before: string;
      after: string;
    }>;
  };
  ticketData?: TicketAveriaData;
}

export interface DiagnosticLogEntry {
  id: string;
  time: string;
  phase: string;
  detail: string;
  status: 'ok' | 'warning' | 'critical';
}

interface NetworkSimulationContextValue {
  telemetry: TelemetrySnapshot;
  messages: ChatMessageItem[];
  diagnosticLogs: DiagnosticLogEntry[];
  activeScenario: ScenarioId;
  isExecutingAction: boolean;
  executingActionText: string;
  isTyping: boolean;
  isPatchcordModalOpen: boolean;
  isDemoDrawerOpen: boolean;
  geminiConnected: boolean;
  customApiKey: string;
  selectScenario: (scenario: ScenarioId) => void;
  sendUserMessage: (text: string) => Promise<void>;
  triggerOptimizeWifi: (messageId?: string) => void;
  triggerVerifyPatchcord: (messageId?: string) => void;
  setPatchcordModalOpen: (open: boolean) => void;
  setDemoDrawerOpen: (open: boolean) => void;
  updateCustomApiKey: (key: string) => void;
  runQuickTelemetryScan: () => void;
}

const SCENARIO_PRESETS: Record<ScenarioId, TelemetrySnapshot> = {
  A: {
    scenarioId: 'A',
    scenarioName: 'Escenario A: Congestión Wi-Fi (Fase 1 y 2)',
    phase: 2,
    rxPowerDbm: -19.4,
    txPowerDbm: 2.3,
    pingMs: 142,
    jitterMs: 38,
    packetLossPct: 4.8,
    wifi24Channel: 6,
    wifi24SaturationPct: 79,
    wifi5Channel: 36,
    wifi5SaturationPct: 92,
    connectedDevices: 11,
    nodeName: 'Nodo San Isidro - Sector 4',
    nodeStatus: 'NORMAL',
    ontModel: 'Huawei OptiXstar HG8145X6 (Wi-Fi 6)',
    ponStatus: 'ONLINE',
    healthScore: 54,
    downloadMbps: 168,
    uploadMbps: 110,
    contractedMbps: 600,
  },
  B: {
    scenarioId: 'B',
    scenarioName: 'Escenario B: Cable Patchcord Flojo (Fase 3)',
    phase: 3,
    rxPowerDbm: -28.6,
    txPowerDbm: 2.1,
    pingMs: 96,
    jitterMs: 31,
    packetLossPct: 8.5,
    wifi24Channel: 1,
    wifi24SaturationPct: 28,
    wifi5Channel: 149,
    wifi5SaturationPct: 16,
    connectedDevices: 9,
    nodeName: 'Nodo San Isidro - Sector 4',
    nodeStatus: 'NORMAL',
    ontModel: 'Huawei OptiXstar HG8145X6 (Wi-Fi 6)',
    ponStatus: 'ATENUACION_CRITICA',
    healthScore: 38,
    downloadMbps: 64,
    uploadMbps: 35,
    contractedMbps: 600,
  },
  C: {
    scenarioId: 'C',
    scenarioName: 'Escenario C: Corte Externo de Fibra (Fase 4)',
    phase: 4,
    rxPowerDbm: -31.5,
    txPowerDbm: 0.0,
    pingMs: 999,
    jitterMs: 0,
    packetLossPct: 100.0,
    wifi24Channel: 1,
    wifi24SaturationPct: 22,
    wifi5Channel: 149,
    wifi5SaturationPct: 14,
    connectedDevices: 9,
    nodeName: 'Nodo San Isidro - Av. Javier Prado Oeste',
    nodeStatus: 'AVERIA_EXTERNA',
    ontModel: 'Huawei OptiXstar HG8145X6 (Wi-Fi 6)',
    ponStatus: 'LOS_SIN_SENAL',
    healthScore: 12,
    downloadMbps: 0,
    uploadMbps: 0,
    contractedMbps: 600,
  },
  D: {
    scenarioId: 'D',
    scenarioName: 'Escenario D: Estado Óptimo (100% Salud)',
    phase: 1,
    rxPowerDbm: -18.9,
    txPowerDbm: 2.4,
    pingMs: 7,
    jitterMs: 1,
    packetLossPct: 0.0,
    wifi24Channel: 1,
    wifi24SaturationPct: 21,
    wifi5Channel: 149,
    wifi5SaturationPct: 11,
    connectedDevices: 9,
    nodeName: 'Nodo San Isidro - Sector 4',
    nodeStatus: 'NORMAL',
    ontModel: 'Huawei OptiXstar HG8145X6 (Wi-Fi 6)',
    ponStatus: 'ONLINE',
    healthScore: 100,
    downloadMbps: 624,
    uploadMbps: 608,
    contractedMbps: 600,
  },
};

const DEFAULT_TICKET_AVERIA: TicketAveriaData = {
  ticketCode: 'CLARO-AV-2026-9814',
  osiptelCode: 'OSIPTEL-SAR-2026-0049182',
  createdAt: 'Hoy, 19:38 hrs',
  clientName: 'Axel Portal',
  serviceAddress: 'Av. Dos de Mayo 1420, Dpto. 502 - San Isidro, Lima',
  planName: 'Claro Hogar Fibra Óptica FTTH 600 Mbps',
  ontModel: 'Huawei OptiXstar HG8145X6 (SN: HWTC9A8421B)',
  rxPowerRecorded: '-31.5 dBm - Falla de Línea Externa (Alarma LOS)',
  nodeAffected: 'Nodo San Isidro - Caja NAP Poste #402 (Splitter 1:16)',
  estimatedVisitWindow: 'Hoy, 20:30 - 22:00 hrs (Prioridad Alta SLA < 3h)',
  technicianCrew: 'Cuadrilla Planta Externa #14 - Ing. Carlos Mendoza',
  automatedDiscards: [
    'Energía eléctrica de ONT verificada (Fuente 12V OK, Uptime 14 días)',
    'Configuración de canales Wi-Fi 2.4/5 GHz sin conflicto interno',
    'Prueba reflectométrica remota: caída abrupta de luz a 280m del domicilio',
    'Validación cruzada: 6 vecinos del mismo Splitter NAP #402 con caída simultánea',
  ],
  fieldSummary:
    'Descarte automático completado por Copiloto Claro IA vía telemetría OMCI. Falla física externa confirmada fuera del hogar del cliente. NO obligar al cliente a reiniciar el módem ni ingresar al domicilio salvo solicitud del titular.',
};

function getNowTimeStr(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function buildInitialMessagesForScenario(scenario: ScenarioId): ChatMessageItem[] {
  const time = getNowTimeStr();
  if (scenario === 'A') {
    return [
      {
        id: 'sys-a-1',
        sender: 'system',
        timestamp: time,
        text: 'Telemetría ONT sincronizada: Monitoreo Predictivo Fase 1 activo (Módem Huawei HG8145X6).',
      },
      {
        id: 'cop-a-1',
        sender: 'copilot',
        timestamp: time,
        phaseBadge: 'FASE 1 & 2 · DETECCIÓN Y CONSENTIMIENTO NLP',
        text: 'Hola Axel, detecté microcortes en tu red de 5 GHz debido a congestión de canales con redes vecinas (el Canal 36 está al 92% de saturación y tu latencia subió a 142 ms). Tu fibra óptica externa llega perfecta (-19.4 dBm). ¿Me autorizas a optimizar tu canal Wi-Fi ahora mismo sin cortar tu conexión?',
        actionButton: {
          label: '¿Deseas que optimice tu canal Wi-Fi ahora?',
          actionType: 'OPTIMIZE_WIFI',
          completed: false,
        },
      },
    ];
  }

  if (scenario === 'B') {
    return [
      {
        id: 'sys-b-1',
        sender: 'system',
        timestamp: time,
        text: 'Alerta de Telemetría Óptica (OMCI): Atenuación anormal detectada en puerto PON (-28.6 dBm).',
      },
      {
        id: 'cop-b-1',
        sender: 'copilot',
        timestamp: time,
        phaseBadge: 'FASE 3 · ESCENARIO FÍSICO ASISTIDO EN EL HOGAR',
        text: 'Hola Axel, mi diagnóstico en tiempo real muestra que el Nodo San Isidro está normal, pero la luz láser que llega a tu router cayó a -28.6 dBm (pérdida de paquetes del 8.5%). Esto ocurre cuando el cable amarillo de fibra óptica (Patchcord) se dobla o se afloja ligeramente.',
        cardType: 'PATCHCORD_GUIDE',
        actionButton: {
          label: 'Ya lo ajusté, verificar ahora',
          actionType: 'VERIFY_PATCHCORD',
          completed: false,
        },
        secondaryButton: {
          label: 'Ver guía interactiva detallada',
          actionType: 'OPEN_PATCHCORD_MODAL',
        },
      },
    ];
  }

  if (scenario === 'C') {
    return [
      {
        id: 'sys-c-1',
        sender: 'system',
        timestamp: time,
        text: 'Alarma Crítica LOS (Loss of Signal): Potencia óptica -31.5 dBm. Ejecutando descartes automáticos sin intervención humana...',
      },
      {
        id: 'cop-c-1',
        sender: 'copilot',
        timestamp: time,
        phaseBadge: 'FASE 4 · DERIVACIÓN INTELIGENTE & TICKET OSIPTEL',
        text: 'Hola Axel. Detecté una interrupción en tu servicio y ya realicé todos los descartes técnicos automáticamente: tu router funciona bien, pero hay una rotura de fibra externa en la Caja NAP de tu cuadra (-31.5 dBm). No necesitas llamar al 123 ni reiniciar tu módem; ya emití tu Código Oficial de Avería respaldado por OSIPTEL y asigné una cuadrilla técnica.',
        cardType: 'TICKET_AVERIA',
        ticketData: DEFAULT_TICKET_AVERIA,
      },
    ];
  }

  // Escenario D: Estado Óptimo
  return [
    {
      id: 'sys-d-1',
      sender: 'system',
      timestamp: time,
      text: 'Telemetría en tiempo real: Salud de red al 100% · Certificación FTTH Claro Perú.',
    },
    {
      id: 'cop-d-1',
      sender: 'copilot',
      timestamp: time,
      phaseBadge: 'FASE 1 · MONITOREO PREDICTIVO ACTIVO',
      text: '¡Hola Axel! Soy tu Copiloto Claro conectado a la telemetría de tu router Huawei Wi-Fi 6. Tu fibra óptica opera en rango ideal (-18.9 dBm), tu latencia es de apenas 7 ms y estás recibiendo 624 Mbps estables en el canal limpio 149. ¿En qué puedo ayudarte hoy?',
      actionButton: {
        label: 'Ejecutar test preventivo en vivo',
        actionType: 'RUN_DIAGNOSTIC',
        completed: false,
      },
    },
  ];
}

function buildInitialLogsForScenario(scenario: ScenarioId): DiagnosticLogEntry[] {
  const time = getNowTimeStr();
  if (scenario === 'A') {
    return [
      {
        id: 'log-a-1',
        time,
        phase: 'Fase 1 · ML Predictivo',
        detail: 'Potencia óptica Rx validada en -19.4 dBm (Óptimo). Nodo San Isidro sin incidencias.',
        status: 'ok',
      },
      {
        id: 'log-a-2',
        time,
        phase: 'Fase 1 · Espectro RF',
        detail: 'Detectada colisión co-canal en 5 GHz (Canal 36 al 92% de ocupación por 7 BSSIDs vecinos).',
        status: 'warning',
      },
      {
        id: 'log-a-3',
        time,
        phase: 'Fase 2 · Copiloto NLP',
        detail: 'Solicitud de consentimiento enviada al usuario para migración en caliente al Canal 149.',
        status: 'warning',
      },
    ];
  }
  if (scenario === 'B') {
    return [
      {
        id: 'log-b-1',
        time,
        phase: 'Fase 1 · Telemetría PON',
        detail: 'Caída de potencia óptica Rx detectada: de -19.1 dBm a -28.6 dBm (Umbral de falla < -28.0 dBm).',
        status: 'critical',
      },
      {
        id: 'log-b-2',
        time,
        phase: 'Fase 1 · Correlación',
        detail: 'Vecinos en Caja NAP #402 reportan -19.0 dBm normal. Falla aislada dentro del domicilio.',
        status: 'warning',
      },
      {
        id: 'log-b-3',
        time,
        phase: 'Fase 3 · Guía Física',
        detail: 'Tarjeta interactiva de inspección de Patchcord SC/APC desplegada al cliente.',
        status: 'warning',
      },
    ];
  }
  if (scenario === 'C') {
    return [
      {
        id: 'log-c-1',
        time,
        phase: 'Fase 1 · Alarma LOS',
        detail: 'Pérdida de señal óptica Rx: -31.5 dBm en ONT Huawei HG8145X6.',
        status: 'critical',
      },
      {
        id: 'log-c-2',
        time,
        phase: 'Fase 4 · Descarte Automático',
        detail: 'Correlación masiva: 6 hogares en Caja NAP Poste #402 sin señal óptica simultáneamente.',
        status: 'critical',
      },
      {
        id: 'log-c-3',
        time,
        phase: 'Fase 4 · Handoff OSIPTEL',
        detail: 'Emitido Ticket Oficial CLARO-AV-2026-9814 y asignada Cuadrilla Planta Externa #14.',
        status: 'ok',
      },
    ];
  }
  return [
    {
      id: 'log-d-1',
      time,
      phase: 'Fase 1 · Telemetría Continua',
      detail: 'Potencia Rx -18.9 dBm | Ping 7 ms | Pérdida 0.0% | Velocidad 624 Mbps.',
      status: 'ok',
    },
    {
      id: 'log-d-2',
      time,
      phase: 'Fase 1 · Espectro Wi-Fi 6',
      detail: 'Canal 149 (5 GHz) operando al 11% de carga sin interferencias.',
      status: 'ok',
    },
  ];
}

const NetworkSimulationContext = createContext<NetworkSimulationContextValue | undefined>(
  undefined
);

export const NetworkSimulationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('A');
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(SCENARIO_PRESETS.A);
  const [messages, setMessages] = useState<ChatMessageItem[]>(() =>
    buildInitialMessagesForScenario('A')
  );
  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLogEntry[]>(() =>
    buildInitialLogsForScenario('A')
  );
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [executingActionText, setExecutingActionText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPatchcordModalOpen, setPatchcordModalOpen] = useState(false);
  const [isDemoDrawerOpen, setDemoDrawerOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string>(() => getActiveGeminiApiKey());
  const [geminiConnected, setGeminiConnected] = useState<boolean>(() => isGeminiConfigured());

  useEffect(() => {
    setGeminiConnected(isGeminiConfigured());
  }, [customApiKey]);

  const updateCustomApiKey = useCallback((key: string) => {
    setRuntimeGeminiApiKey(key);
    setCustomApiKey(key);
    setGeminiConnected(isGeminiConfigured());
  }, []);

  const selectScenario = useCallback((scenario: ScenarioId) => {
    setIsExecutingAction(false);
    setExecutingActionText('');
    setActiveScenario(scenario);
    setTelemetry({ ...SCENARIO_PRESETS[scenario] });
    setMessages(buildInitialMessagesForScenario(scenario));
    setDiagnosticLogs(buildInitialLogsForScenario(scenario));
    setDemoDrawerOpen(false);
  }, []);

  const triggerOptimizeWifi = useCallback((messageId?: string) => {
    setIsExecutingAction(true);
    setExecutingActionText(
      'Ejecutando comando TR-069 en ONT: Migrando red 5 GHz de Canal 36 (92%) a Canal 149 DFS Libre...'
    );

    setTimeout(() => {
      const time = getNowTimeStr();

      setTelemetry((prev) => ({
        ...prev,
        phase: 2,
        pingMs: 8,
        jitterMs: 1,
        packetLossPct: 0.0,
        wifi24Channel: 1,
        wifi24SaturationPct: 22,
        wifi5Channel: 149,
        wifi5SaturationPct: 12,
        healthScore: 99,
        downloadMbps: 618,
        uploadMbps: 604,
      }));

      setDiagnosticLogs((prev) => [
        {
          id: `log-opt-${Date.now()}`,
          time,
          phase: 'Fase 2 · Optimización Remota',
          detail:
            'Canal 5 GHz migrado a 149 (12% saturación). Latencia reducida de 142 ms a 8 ms sin reinicio.',
          status: 'ok',
        },
        ...prev,
      ]);

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === messageId || m.actionButton?.actionType === 'OPTIMIZE_WIFI'
            ? {
                ...m,
                actionButton: m.actionButton
                  ? {
                      ...m.actionButton,
                      completed: true,
                      completedLabel: 'Canal Wi-Fi optimizado con éxito',
                    }
                  : undefined,
              }
            : m
        );

        return [
          ...updated,
          {
            id: `user-consent-${Date.now()}`,
            sender: 'user',
            timestamp: time,
            text: 'Sí, autorizo optimizar mi canal Wi-Fi ahora.',
          },
          {
            id: `cop-opt-done-${Date.now() + 1}`,
            sender: 'copilot',
            timestamp: time,
            phaseBadge: 'FASE 2 COMPLETADA · VALIDACIÓN EN TIEMPO REAL',
            text: '¡Listo, Axel! En 1.5 segundos migré tu red 5 GHz al Canal 149 libre de interferencias y optimicé la banda de 2.4 GHz al Canal 1, sin desconectar tus 11 dispositivos ni reiniciar el módem. Aquí tienes la validación en vivo:',
            cardType: 'METRICS_DIFF',
            metricsDiff: {
              title: 'Resultado de Optimización Remota (ONT Huawei HG8145X6)',
              items: [
                { label: 'Canal Wi-Fi 5 GHz', before: 'Canal 36 (92% sat.)', after: 'Canal 149 (12% libre)' },
                { label: 'Latencia (Ping)', before: '142 ms (Con lag)', after: '8 ms (Ultra rápido)' },
                { label: 'Pérdida de Paquetes', before: '4.8%', after: '0.0%' },
                { label: 'Velocidad Descarga', before: '168 Mbps', after: '618 Mbps' },
              ],
            },
          },
        ];
      });

      setIsExecutingAction(false);
      setExecutingActionText('');
    }, 1500);
  }, []);

  const triggerVerifyPatchcord = useCallback((messageId?: string) => {
    setPatchcordModalOpen(false);
    setIsExecutingAction(true);
    setExecutingActionText(
      'Re-escaneando potencia óptica láser (1490 nm) en el puerto verde PON de tu router...'
    );

    setTimeout(() => {
      const time = getNowTimeStr();

      setTelemetry((prev) => ({
        ...prev,
        phase: 3,
        rxPowerDbm: -19.0,
        txPowerDbm: 2.4,
        pingMs: 8,
        jitterMs: 1,
        packetLossPct: 0.0,
        ponStatus: 'ONLINE',
        healthScore: 99,
        downloadMbps: 615,
        uploadMbps: 602,
      }));

      setDiagnosticLogs((prev) => [
        {
          id: `log-patch-${Date.now()}`,
          time,
          phase: 'Fase 3 · Re-escaneo PON',
          detail:
            'Conector SC/APC asegurado. Potencia óptica recuperada de -28.6 dBm a -19.0 dBm (Rango óptimo).',
          status: 'ok',
        },
        ...prev,
      ]);

      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === messageId || m.actionButton?.actionType === 'VERIFY_PATCHCORD'
            ? {
                ...m,
                actionButton: m.actionButton
                  ? {
                      ...m.actionButton,
                      completed: true,
                      completedLabel: 'Ajuste físico verificado (-19.0 dBm)',
                    }
                  : undefined,
              }
            : m
        );

        return [
          ...updated,
          {
            id: `user-patch-${Date.now()}`,
            sender: 'user',
            timestamp: time,
            text: 'Ya lo ajusté, verificar ahora.',
          },
          {
            id: `cop-patch-done-${Date.now() + 1}`,
            sender: 'copilot',
            timestamp: time,
            phaseBadge: 'FASE 3 COMPLETADA · SEÑAL ÓPTICA RESTABLECIDA',
            text: '¡Excelente trabajo, Axel! Acabo de medir el láser en el puerto PON y la potencia óptica subió de -28.6 dBm a -19.0 dBm (rango óptimo). La pérdida de paquetes bajó a 0% y te ahorraste esperar una visita técnica por un cable flojo.',
            cardType: 'METRICS_DIFF',
            metricsDiff: {
              title: 'Validación Óptica tras Ajuste de Patchcord',
              items: [
                { label: 'Potencia Óptica Rx', before: '-28.6 dBm (Atenuada)', after: '-19.0 dBm (Óptima)' },
                { label: 'Pérdida de Paquetes', before: '8.5%', after: '0.0%' },
                { label: 'Latencia (Ping)', before: '96 ms', after: '8 ms' },
                { label: 'Velocidad Efectiva', before: '64 Mbps', after: '615 Mbps' },
              ],
            },
          },
        ];
      });

      setIsExecutingAction(false);
      setExecutingActionText('');
    }, 1500);
  }, []);

  const runQuickTelemetryScan = useCallback(() => {
    setIsExecutingAction(true);
    setExecutingActionText('Consultando telemetría en tiempo real de la ONT y Nodo San Isidro...');

    setTimeout(() => {
      const time = getNowTimeStr();
      setDiagnosticLogs((prev) => [
        {
          id: `log-scan-${Date.now()}`,
          time,
          phase: 'Test Preventivo en Vivo',
          detail: `Lectura confirmada: Rx ${
            telemetry.rxPowerDbm !== null ? `${telemetry.rxPowerDbm} dBm` : 'LOS'
          } | Ping ${telemetry.pingMs} ms | Salud ${telemetry.healthScore}%.`,
          status: telemetry.healthScore >= 85 ? 'ok' : telemetry.healthScore >= 50 ? 'warning' : 'critical',
        },
        ...prev,
      ]);

      setMessages((prev) => [
        ...prev,
        {
          id: `cop-scan-${Date.now()}`,
          sender: 'copilot',
          timestamp: time,
          phaseBadge: 'TELEMETRÍA EN TIEMPO REAL VERIFICADA',
          text: `Diagnóstico instantáneo completado: Potencia óptica en ${
            telemetry.rxPowerDbm !== null ? `${telemetry.rxPowerDbm.toFixed(1)} dBm` : 'LOS'
          }, ping de ${telemetry.pingMs} ms, pérdida de ${telemetry.packetLossPct}% y velocidad de ${
            telemetry.downloadMbps
          } Mbps en ${telemetry.nodeName}.`,
        },
      ]);

      setIsExecutingAction(false);
      setExecutingActionText('');
    }, 1200);
  }, [telemetry]);

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const time = getNowTimeStr();
      const userMsg: ChatMessageItem = {
        id: `usr-${Date.now()}`,
        sender: 'user',
        timestamp: time,
        text: trimmed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      const historyForLlm: ChatHistoryItem[] = messages
        .filter((m) => m.sender === 'user' || m.sender === 'copilot')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          text: m.text,
        }));

      const [response] = await Promise.all([
        generateCopilotResponse(trimmed, telemetry, historyForLlm),
        new Promise((resolve) => setTimeout(resolve, 850)),
      ]);

      const replyTime = getNowTimeStr();

      // Si el usuario pide optimizar o hay una acción pendiente del escenario actual, ofrecemos botón contextual
      let contextualAction: ChatMessageItem['actionButton'] | undefined;
      if (telemetry.scenarioId === 'A' && telemetry.wifi5SaturationPct > 50) {
        contextualAction = {
          label: '¿Deseas que optimice tu canal Wi-Fi ahora?',
          actionType: 'OPTIMIZE_WIFI',
          completed: false,
        };
      } else if (
        telemetry.scenarioId === 'B' &&
        telemetry.rxPowerDbm !== null &&
        telemetry.rxPowerDbm < -25
      ) {
        contextualAction = {
          label: 'Ya lo ajusté, verificar ahora',
          actionType: 'VERIFY_PATCHCORD',
          completed: false,
        };
      }

      const copilotMsg: ChatMessageItem = {
        id: `cop-${Date.now()}`,
        sender: 'copilot',
        timestamp: replyTime,
        phaseBadge: response.usedGemini
          ? 'COPILOTO CLARO · GEMINI AI + TELEMETRÍA EN VIVO'
          : 'COPILOTO CLARO · MOTOR NLP + TELEMETRÍA EN VIVO',
        text: response.text,
        usedGemini: response.usedGemini,
        actionButton: contextualAction,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, copilotMsg]);
    },
    [messages, telemetry]
  );

  return (
    <NetworkSimulationContext.Provider
      value={{
        telemetry,
        messages,
        diagnosticLogs,
        activeScenario,
        isExecutingAction,
        executingActionText,
        isTyping,
        isPatchcordModalOpen,
        isDemoDrawerOpen,
        geminiConnected,
        customApiKey,
        selectScenario,
        sendUserMessage,
        triggerOptimizeWifi,
        triggerVerifyPatchcord,
        setPatchcordModalOpen,
        setDemoDrawerOpen,
        updateCustomApiKey,
        runQuickTelemetryScan,
      }}
    >
      {children}
    </NetworkSimulationContext.Provider>
  );
};

export function useNetworkSimulation(): NetworkSimulationContextValue {
  const ctx = useContext(NetworkSimulationContext);
  if (!ctx) {
    throw new Error('useNetworkSimulation debe usarse dentro de un NetworkSimulationProvider');
  }
  return ctx;
}
