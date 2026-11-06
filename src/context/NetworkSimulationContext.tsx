import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  TelemetrySnapshot,
  ChatHistoryItem,
  generateCopilotResponse,
} from '../services/geminiService';

export type ScenarioId = 'A' | 'B' | 'C' | 'D';

export interface UserProfile {
  fullName: string;
  firstName: string;
  emailOrDni: string;
  district: string;
}

export interface TicketAveriaData {
  ticketCode: string;
  osiptelCode: string;
  createdAt: string;
  clientName: string;
  serviceAddress: string;
  planName: string;
  issueSummary: string;
  estimatedResolution: string;
  customerActionNote: string;
  checksPerformed: string[];
}

export interface ChatMessageItem {
  id: string;
  sender: 'copilot' | 'user' | 'system';
  timestamp: string;
  text: string;
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
  title: string;
  detail: string;
  status: 'ok' | 'warning' | 'critical';
}

interface NetworkSimulationContextValue {
  currentUser: UserProfile | null;
  telemetry: TelemetrySnapshot;
  messages: ChatMessageItem[];
  diagnosticLogs: DiagnosticLogEntry[];
  activeScenario: ScenarioId;
  isExecutingAction: boolean;
  executingActionText: string;
  isTyping: boolean;
  isPatchcordModalOpen: boolean;
  isDemoDrawerOpen: boolean;
  loginUser: (params: { emailOrDni: string; password?: string; fallbackName?: string }) => void;
  registerUser: (params: {
    fullName: string;
    emailOrDni: string;
    district: string;
    password?: string;
  }) => void;
  logoutUser: () => void;
  selectScenario: (scenario: ScenarioId) => void;
  sendUserMessage: (text: string) => Promise<void>;
  triggerOptimizeWifi: (messageId?: string) => void;
  triggerVerifyPatchcord: (messageId?: string) => void;
  setPatchcordModalOpen: (open: boolean) => void;
  setDemoDrawerOpen: (open: boolean) => void;
  runQuickTelemetryScan: () => void;
}

function extractFirstName(fullName: string): string {
  const cleaned = fullName.trim();
  if (!cleaned) return 'Cliente';
  const first = cleaned.split(/\s+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function buildScenarioPreset(
  scenario: ScenarioId,
  user: UserProfile
): TelemetrySnapshot {
  const base = {
    clientName: user.fullName,
    clientFirstName: user.firstName,
    nodeName: user.district || 'San Isidro',
    ontModel: 'Router Wi-Fi Claro Hogar',
    contractedMbps: 600,
  };

  if (scenario === 'A') {
    return {
      ...base,
      scenarioId: 'A',
      scenarioName: 'Interferencia en señal Wi-Fi',
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
      nodeStatus: 'NORMAL',
      ponStatus: 'ONLINE',
      healthScore: 60,
      downloadMbps: 170,
      uploadMbps: 110,
    };
  }

  if (scenario === 'B') {
    return {
      ...base,
      scenarioId: 'B',
      scenarioName: 'Cable amarillo flojo o doblado',
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
      nodeStatus: 'NORMAL',
      ponStatus: 'ATENUACION_CRITICA',
      healthScore: 40,
      downloadMbps: 65,
      uploadMbps: 35,
    };
  }

  if (scenario === 'C') {
    return {
      ...base,
      scenarioId: 'C',
      scenarioName: 'Avería externa en tu zona',
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
      nodeStatus: 'AVERIA_EXTERNA',
      ponStatus: 'LOS_SIN_SENAL',
      healthScore: 15,
      downloadMbps: 0,
      uploadMbps: 0,
    };
  }

  return {
    ...base,
    scenarioId: 'D',
    scenarioName: 'Todo funcionando excelente',
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
    nodeStatus: 'NORMAL',
    ponStatus: 'ONLINE',
    healthScore: 100,
    downloadMbps: 600,
    uploadMbps: 600,
  };
}

function buildTicketAveria(user: UserProfile): TicketAveriaData {
  return {
    ticketCode: 'CLARO-AV-2026-9814',
    osiptelCode: 'Constancia Oficial OSIPTEL',
    createdAt: 'Hoy',
    clientName: user.fullName,
    serviceAddress: `${user.district}, Lima`,
    planName: 'Claro Hogar Fibra 600 Mbps',
    issueSummary: 'Corte en el cableado exterior de tu cuadra',
    estimatedResolution: 'Hoy entre 4:30 p.m. y 6:00 p.m.',
    checksPerformed: [
      'Tu router en casa encendió y funciona correctamente',
      `El problema fue ubicado afuera, en el poste de tu cuadra (${user.district})`,
      'Un equipo técnico de Claro ya fue asignado a tu zona',
    ],
    customerActionNote:
      'No necesitas llamar al 123 ni reiniciar tu módem. Te avisaremos por aquí apenas el servicio quede restablecido.',
  };
}

function getNowTimeStr(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function buildInitialMessagesForScenario(
  scenario: ScenarioId,
  user: UserProfile
): ChatMessageItem[] {
  const time = getNowTimeStr();
  const name = user.firstName;
  const district = user.district;

  if (scenario === 'A') {
    return [
      {
        id: 'cop-a-1',
        sender: 'copilot',
        timestamp: time,
        text: `Hola ${name} 👋 Noté que tu internet está un poco lento hoy. Revisé tu conexión y la señal llega muy bien desde la calle, pero el Wi-Fi de las casas vecinas está causando interferencia con el tuyo. ¿Quieres que pase tu Wi-Fi a una señal libre ahora mismo? No se cortará tu internet.`,
        actionButton: {
          label: 'Sí, mejorar mi Wi-Fi ahora',
          actionType: 'OPTIMIZE_WIFI',
          completed: false,
        },
      },
    ];
  }

  if (scenario === 'B') {
    return [
      {
        id: 'cop-b-1',
        sender: 'copilot',
        timestamp: time,
        text: `Hola ${name} 👋 Revisé tu conexión porque noté interrupciones en tu internet. En ${district} todo está bien, pero la señal que entra por el cable amarillo detrás de tu router llega débil. Esto suele pasar cuando ese cable se dobla o se afloja un poquito.`,
        cardType: 'PATCHCORD_GUIDE',
        actionButton: {
          label: 'Ya lo acomodé, volver a revisar',
          actionType: 'VERIFY_PATCHCORD',
          completed: false,
        },
        secondaryButton: {
          label: 'Ver cómo revisarlo paso a paso',
          actionType: 'OPEN_PATCHCORD_MODAL',
        },
      },
    ];
  }

  if (scenario === 'C') {
    return [
      {
        id: 'cop-c-1',
        sender: 'copilot',
        timestamp: time,
        text: `Hola ${name}. Detectamos una avería en el cableado de la calle en tu zona de ${district}. Tu router en casa está bien, así que no necesitas reiniciarlo ni llamar por teléfono. Ya registramos tu ticket oficial de atención y nuestro equipo técnico está en camino para resolverlo.`,
        cardType: 'TICKET_AVERIA',
        ticketData: buildTicketAveria(user),
      },
    ];
  }

  return [
    {
      id: 'cop-d-1',
      sender: 'copilot',
      timestamp: time,
      text: `¡Hola ${name}! 👋 Tu internet en casa está funcionando excelente hoy y todos tus equipos navegan a máxima velocidad. ¿En qué te puedo ayudar?`,
      actionButton: {
        label: 'Revisar mi conexión ahora',
        actionType: 'RUN_DIAGNOSTIC',
        completed: false,
      },
    },
  ];
}

function buildInitialLogsForScenario(
  scenario: ScenarioId,
  user: UserProfile
): DiagnosticLogEntry[] {
  const time = getNowTimeStr();
  if (scenario === 'A') {
    return [
      {
        id: 'log-a-1',
        time,
        title: 'Señal exterior en buen estado',
        detail: `El servicio llega sin problemas desde la calle hasta tu hogar en ${user.district}.`,
        status: 'ok',
      },
      {
        id: 'log-a-2',
        time,
        title: 'Interferencia en el Wi-Fi de casa',
        detail: 'Hay varias redes vecinas saturando la señal de tu router.',
        status: 'warning',
      },
    ];
  }
  if (scenario === 'B') {
    return [
      {
        id: 'log-b-1',
        time,
        title: 'Señal de la calle sin problemas',
        detail: `No hay cortes ni fallas reportadas en ${user.district}.`,
        status: 'ok',
      },
      {
        id: 'log-b-2',
        time,
        title: 'Cable amarillo con señal débil',
        detail: 'Revisa que el cable amarillo detrás del router no esté doblado ni suelto.',
        status: 'warning',
      },
    ];
  }
  if (scenario === 'C') {
    return [
      {
        id: 'log-c-1',
        time,
        title: 'Avería detectada en tu cuadra',
        detail: `Se identificó un corte externo en tu zona de ${user.district}.`,
        status: 'critical',
      },
      {
        id: 'log-c-2',
        time,
        title: 'Atención técnica activada',
        detail: 'Código CLARO-AV-2026-9814 generado automáticamente sin llamada.',
        status: 'ok',
      },
    ];
  }
  return [
    {
      id: 'log-d-1',
      time,
      title: 'Conexión estable y rápida',
      detail: 'Tanto la fibra como tu Wi-Fi funcionan sin inconvenientes.',
      status: 'ok',
    },
  ];
}

const DEFAULT_GUEST: UserProfile = {
  fullName: 'Cliente Claro',
  firstName: 'Cliente',
  emailOrDni: '',
  district: 'San Isidro',
};

const NetworkSimulationContext = createContext<NetworkSimulationContextValue | undefined>(
  undefined
);

export const NetworkSimulationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, UserProfile>>({});
  const [activeScenario, setActiveScenario] = useState<ScenarioId>('A');
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(() =>
    buildScenarioPreset('A', DEFAULT_GUEST)
  );
  const [messages, setMessages] = useState<ChatMessageItem[]>(() =>
    buildInitialMessagesForScenario('A', DEFAULT_GUEST)
  );
  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLogEntry[]>(() =>
    buildInitialLogsForScenario('A', DEFAULT_GUEST)
  );
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [executingActionText, setExecutingActionText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPatchcordModalOpen, setPatchcordModalOpen] = useState(false);
  const [isDemoDrawerOpen, setDemoDrawerOpen] = useState(false);

  const applyUserSession = useCallback(
    (profile: UserProfile, scenario: ScenarioId = 'A') => {
      setCurrentUser(profile);
      setActiveScenario(scenario);
      setTelemetry(buildScenarioPreset(scenario, profile));
      setMessages(buildInitialMessagesForScenario(scenario, profile));
      setDiagnosticLogs(buildInitialLogsForScenario(scenario, profile));
    },
    []
  );

  const registerUser = useCallback(
    ({
      fullName,
      emailOrDni,
      district,
    }: {
      fullName: string;
      emailOrDni: string;
      district: string;
      password?: string;
    }) => {
      const cleanName = fullName.trim() || 'Cliente Claro';
      const cleanDistrict = district.trim() || 'San Isidro';
      const key = emailOrDni.trim().toLowerCase();

      const profile: UserProfile = {
        fullName: cleanName,
        firstName: extractFirstName(cleanName),
        emailOrDni: emailOrDni.trim(),
        district: cleanDistrict,
      };

      if (key) {
        setRegisteredUsers((prev) => ({ ...prev, [key]: profile }));
      }
      applyUserSession(profile, 'A');
    },
    [applyUserSession]
  );

  const loginUser = useCallback(
    ({
      emailOrDni,
      fallbackName,
    }: {
      emailOrDni: string;
      password?: string;
      fallbackName?: string;
    }) => {
      const key = emailOrDni.trim().toLowerCase();
      const existing = registeredUsers[key];

      if (existing) {
        applyUserSession(existing, 'A');
        return;
      }

      // Si inicia sesión directamente con su correo o nombre sin haberse registrado antes
      let derivedName = (fallbackName || '').trim();
      if (!derivedName) {
        if (emailOrDni.includes('@')) {
          const localPart = emailOrDni.split('@')[0].replace(/[._0-9-]+/g, ' ').trim();
          derivedName =
            localPart
              .split(/\s+/)
              .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
              .join(' ')
              .trim() || 'Cliente Claro';
        } else {
          derivedName = 'Cliente Claro';
        }
      }

      const profile: UserProfile = {
        fullName: derivedName,
        firstName: extractFirstName(derivedName),
        emailOrDni: emailOrDni.trim(),
        district: 'San Isidro',
      };

      applyUserSession(profile, 'A');
    },
    [registeredUsers, applyUserSession]
  );

  const logoutUser = useCallback(() => {
    setIsExecutingAction(false);
    setExecutingActionText('');
    setCurrentUser(null);
  }, []);

  const selectScenario = useCallback(
    (scenario: ScenarioId) => {
      const user = currentUser || DEFAULT_GUEST;
      setIsExecutingAction(false);
      setExecutingActionText('');
      setActiveScenario(scenario);
      setTelemetry(buildScenarioPreset(scenario, user));
      setMessages(buildInitialMessagesForScenario(scenario, user));
      setDiagnosticLogs(buildInitialLogsForScenario(scenario, user));
      setDemoDrawerOpen(false);
    },
    [currentUser]
  );

  const triggerOptimizeWifi = useCallback(
    (messageId?: string) => {
      const name = currentUser?.firstName || 'Cliente';
      setIsExecutingAction(true);
      setExecutingActionText('Mejorando la señal de tu Wi-Fi automáticamente...');

      setTimeout(() => {
        const time = getNowTimeStr();

        setTelemetry((prev) => ({
          ...prev,
          pingMs: 8,
          jitterMs: 1,
          packetLossPct: 0.0,
          wifi24Channel: 1,
          wifi24SaturationPct: 20,
          wifi5Channel: 149,
          wifi5SaturationPct: 10,
          healthScore: 100,
          downloadMbps: 600,
          uploadMbps: 600,
        }));

        setDiagnosticLogs((prev) => [
          {
            id: `log-opt-${Date.now()}`,
            time,
            title: 'Wi-Fi optimizado con éxito',
            detail:
              'Se cambió tu red a una señal libre de interferencias sin reiniciar tu router.',
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
                        completedLabel: 'Wi-Fi mejorado con éxito',
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
              text: 'Sí, mejorar mi Wi-Fi ahora.',
            },
            {
              id: `cop-opt-done-${Date.now() + 1}`,
              sender: 'copilot',
              timestamp: time,
              text: `¡Listo, ${name}! Ya pasé tu Wi-Fi a una señal libre de interferencias sin desconectar tus equipos ni apagar tu router. Tu velocidad ya está al máximo:`,
              cardType: 'METRICS_DIFF',
              metricsDiff: {
                title: 'Mejora aplicada en tu conexión',
                items: [
                  {
                    label: 'Señal Wi-Fi en casa',
                    before: 'Con interferencia',
                    after: 'Libre y estable',
                  },
                  {
                    label: 'Videollamadas y juegos',
                    before: 'Con pausas',
                    after: 'Fluido y sin cortes',
                  },
                  {
                    label: 'Velocidad de internet',
                    before: 'Lenta',
                    after: 'Rápida (600 Mbps)',
                  },
                ],
              },
            },
          ];
        });

        setIsExecutingAction(false);
        setExecutingActionText('');
      }, 1500);
    },
    [currentUser]
  );

  const triggerVerifyPatchcord = useCallback(
    (messageId?: string) => {
      const name = currentUser?.firstName || 'Cliente';
      setPatchcordModalOpen(false);
      setIsExecutingAction(true);
      setExecutingActionText('Verificando la señal del cable amarillo en tu router...');

      setTimeout(() => {
        const time = getNowTimeStr();

        setTelemetry((prev) => ({
          ...prev,
          rxPowerDbm: -19.0,
          txPowerDbm: 2.4,
          pingMs: 8,
          jitterMs: 1,
          packetLossPct: 0.0,
          ponStatus: 'ONLINE',
          healthScore: 100,
          downloadMbps: 600,
          uploadMbps: 600,
        }));

        setDiagnosticLogs((prev) => [
          {
            id: `log-patch-${Date.now()}`,
            time,
            title: 'Cable amarillo bien conectado',
            detail:
              'La señal de fibra se recuperó por completo y tu internet ya está estable.',
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
                        completedLabel: 'Conexión verificada y estable',
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
              text: 'Ya lo acomodé, volver a revisar.',
            },
            {
              id: `cop-patch-done-${Date.now() + 1}`,
              sender: 'copilot',
              timestamp: time,
              text: `¡Quedó perfecto, ${name}! Acabo de revisar tu router y la señal ya entra con toda su fuerza. No hace falta esperar a un técnico, tu internet ya funciona al 100%.`,
              cardType: 'METRICS_DIFF',
              metricsDiff: {
                title: 'Revisión del cable completada',
                items: [
                  {
                    label: 'Señal del cable amarillo',
                    before: 'Débil (Cable flojo)',
                    after: 'Excelente',
                  },
                  {
                    label: 'Estabilidad del internet',
                    before: 'Con microcortes',
                    after: 'Sin interrupciones',
                  },
                  {
                    label: 'Velocidad en casa',
                    before: 'Reducida',
                    after: 'Rápida (600 Mbps)',
                  },
                ],
              },
            },
          ];
        });

        setIsExecutingAction(false);
        setExecutingActionText('');
      }, 1500);
    },
    [currentUser]
  );

  const runQuickTelemetryScan = useCallback(() => {
    const name = currentUser?.firstName || 'Cliente';
    setIsExecutingAction(true);
    setExecutingActionText('Revisando el estado de tu conexión...');

    setTimeout(() => {
      const time = getNowTimeStr();
      setMessages((prev) => [
        ...prev,
        {
          id: `cop-scan-${Date.now()}`,
          sender: 'copilot',
          timestamp: time,
          text:
            telemetry.healthScore >= 85
              ? `Acabo de revisar tu router, ${name}, y todo está funcionando muy bien: tanto la señal que viene de la calle como el Wi-Fi dentro de tu casa están al 100%.`
              : `Revisé tu conexión, ${name}, y todavía tenemos un ajuste pendiente. Puedes usar el botón de arriba para solucionarlo en un paso.`,
        },
      ]);

      setIsExecutingAction(false);
      setExecutingActionText('');
    }, 1200);
  }, [telemetry, currentUser]);

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
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);

      const replyTime = getNowTimeStr();

      let contextualAction: ChatMessageItem['actionButton'] | undefined;
      if (telemetry.scenarioId === 'A' && telemetry.wifi5SaturationPct > 50) {
        contextualAction = {
          label: 'Sí, mejorar mi Wi-Fi ahora',
          actionType: 'OPTIMIZE_WIFI',
          completed: false,
        };
      } else if (
        telemetry.scenarioId === 'B' &&
        telemetry.rxPowerDbm !== null &&
        telemetry.rxPowerDbm < -25
      ) {
        contextualAction = {
          label: 'Ya lo acomodé, volver a revisar',
          actionType: 'VERIFY_PATCHCORD',
          completed: false,
        };
      }

      const copilotMsg: ChatMessageItem = {
        id: `cop-${Date.now()}`,
        sender: 'copilot',
        timestamp: replyTime,
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
        currentUser,
        telemetry,
        messages,
        diagnosticLogs,
        activeScenario,
        isExecutingAction,
        executingActionText,
        isTyping,
        isPatchcordModalOpen,
        isDemoDrawerOpen,
        loginUser,
        registerUser,
        logoutUser,
        selectScenario,
        sendUserMessage,
        triggerOptimizeWifi,
        triggerVerifyPatchcord,
        setPatchcordModalOpen,
        setDemoDrawerOpen,
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
