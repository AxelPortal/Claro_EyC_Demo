export interface TelemetrySnapshot {
  scenarioId: 'A' | 'B' | 'C' | 'D';
  scenarioName: string;
  phase: 1 | 2 | 3 | 4;
  rxPowerDbm: number | null;
  txPowerDbm: number;
  pingMs: number;
  jitterMs: number;
  packetLossPct: number;
  wifi24Channel: number;
  wifi24SaturationPct: number;
  wifi5Channel: number;
  wifi5SaturationPct: number;
  connectedDevices: number;
  nodeName: string;
  nodeStatus: 'NORMAL' | 'CONGESTION_LEVE' | 'INCIDENCIA_MASIVA' | 'AVERIA_EXTERNA';
  ontModel: string;
  ponStatus: 'ONLINE' | 'ATENUACION_CRITICA' | 'LOS_SIN_SENAL';
  healthScore: number;
  downloadMbps: number;
  uploadMbps: number;
  contractedMbps: number;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
];

function getOrderedApiKeys(): string[] {
  const envKey =
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) ||
    '';

  const keys: string[] = [];
  if (
    envKey &&
    envKey !== 'TU_API_KEY_DE_GEMINI_AQUI' &&
    !keys.includes(envKey.trim())
  ) {
    keys.push(envKey.trim());
  }
  return keys;
}

function buildSystemInstruction(telemetry: TelemetrySnapshot): string {
  let estadoSencillo = 'Tu conexión funciona excelente y a máxima velocidad.';
  if (telemetry.scenarioId === 'A' && telemetry.wifi5SaturationPct > 50) {
    estadoSencillo =
      'El internet llega bien a tu casa desde la calle, pero tu Wi-Fi tiene interferencia porque hay muchas redes de vecinos usando el mismo canal. Eso causa lentitud o pequeños cortes. Puedes cambiarlo a un canal libre automáticamente si el cliente acepta.';
  } else if (
    telemetry.scenarioId === 'B' &&
    telemetry.rxPowerDbm !== null &&
    telemetry.rxPowerDbm < -25
  ) {
    estadoSencillo =
      'La señal que llega por el cable amarillo de fibra óptica (detrás de tu router) está débil porque el cable parece estar un poco doblado o flojo en la entrada verde. Invita al cliente a revisar que el cable amarillo esté recto y bien conectado hasta escuchar un clic.';
  } else if (telemetry.scenarioId === 'C') {
    estadoSencillo =
      'Hay una avería en el cableado de la calle en tu zona (San Isidro). El router de su casa está bien, por lo que NO debe reiniciarlo. Ya se generó automáticamente su ticket oficial de avería con visita técnica programada para hoy sin que tenga que llamar por teléfono.';
  }

  return `Eres "Asistente Claro", el soporte inteligente de Claro Perú integrado en la app Mi Claro del cliente Axel.

REGLAS DE ORO PARA HABLAR CON EL CLIENTE:
1. Habla de forma muy sencilla, cálida, amigable y fácil de entender para cualquier persona en casa.
2. PROHIBIDO usar jerga técnica complicada o llenar el mensaje de números confusos (NO menciones dBm, OMCI, TR-069, latencia en ms, pérdida de paquetes, BSSID, ONT, splitter ni porcentajes complejos a menos que el usuario te pregunte explícitamente por el dato técnico).
3. PROHIBIDO mencionar que esto es una "demo", "prototipo", "escenario" o que existen "fases". Actúa como la aplicación final real de Claro Perú.
4. Nunca le pidas reiniciar el módem sin sentido.
5. Sé breve y directo: responde en máximo 2 o 3 oraciones claras.

ESTADO ACTUAL DE LA CONEXIÓN DE AXEL:
- Situación actual: ${estadoSencillo}
- Plan contratado: Internet Hogar 600 Mbps en San Isidro
- Equipos conectados en casa: ${telemetry.connectedDevices} dispositivos
- Estado general: ${
    telemetry.healthScore >= 85
      ? 'Excelente'
      : telemetry.healthScore >= 50
      ? 'Wi-Fi con interferencia vecina (fácil de mejorar)'
      : telemetry.scenarioId === 'B'
      ? 'Cable amarillo de fibra flojo o doblado en casa'
      : 'Avería externa en la calle (Ticket oficial CLARO-AV-2026-9814 ya generado)'
  }`;
}

export async function generateCopilotResponse(
  userMessage: string,
  telemetry: TelemetrySnapshot,
  history: ChatHistoryItem[]
): Promise<{ text: string; usedGemini: boolean }> {
  const keys = getOrderedApiKeys();
  const systemInstruction = buildSystemInstruction(telemetry);

  const recentHistory = history.slice(-6).map((item) => ({
    role: item.role === 'user' ? 'user' : 'model',
    parts: [{ text: item.text }],
  }));

  const contents = [
    ...recentHistory,
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  for (const apiKey of keys) {
    for (const modelName of GEMINI_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
            apiKey
          )}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
              contents,
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 280,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts;
          if (Array.isArray(parts)) {
            const textPart = parts.find((p: { text?: string }) => typeof p?.text === 'string' && p.text.trim().length > 0);
            if (textPart?.text) {
              return { text: textPart.text.trim(), usedGemini: true };
            }
          }
        }
      } catch (error) {
        // Continúa probando con la siguiente clave/modelo
      }
    }
  }

  return {
    text: getContextualFallbackResponse(userMessage, telemetry),
    usedGemini: false,
  };
}

function getContextualFallbackResponse(
  userMessage: string,
  telemetry: TelemetrySnapshot
): string {
  const q = userMessage.toLowerCase();

  if (q.includes('lento') || q.includes('velocidad') || q.includes('corta') || q.includes('interferencia')) {
    if (telemetry.scenarioId === 'A' && telemetry.wifi5SaturationPct > 50) {
      return 'Hola Axel, revisé tu router y el internet llega muy bien a tu casa, pero el Wi-Fi de tus vecinos está causando interferencia con el tuyo. Si tocas el botón de abajo, cambio tu Wi-Fi a un canal libre en un segundo sin desconectarte.';
    }
    if (telemetry.scenarioId === 'B' && telemetry.rxPowerDbm !== null && telemetry.rxPowerDbm < -25) {
      return 'Axel, noto que la señal llega débil a tu router porque el cable amarillo que va conectado atrás parece estar un poco flojo o doblado. Revisa la guía en pantalla para ajustarlo fácilmente.';
    }
    if (telemetry.scenarioId === 'C') {
      return 'Axel, no necesitas tocar tu router. Detectamos un problema en el cableado de tu calle en San Isidro y ya programamos la visita de un técnico con tu código de atención CLARO-AV-2026-9814.';
    }
    return 'Tu internet está funcionando de maravilla, Axel. Todos tus equipos en casa reciben la máxima velocidad de tu plan sin interrupciones.';
  }

  if (q.includes('reiniciar') || q.includes('apagar') || q.includes('modem') || q.includes('módem')) {
    return 'No hace falta que apagues ni reinicies tu router, Axel. Yo reviso tu conexión directamente desde aquí para solucionarlo sin hacerte perder tiempo.';
  }

  switch (telemetry.scenarioId) {
    case 'A':
      return 'Tu conexión de fibra está bien, pero hay congestión en el Wi-Fi por las redes de tus vecinos. Autorízame con el botón en pantalla para pasarte a una señal libre al instante.';
    case 'B':
      return 'Detecto que el cable amarillo detrás de tu router está un poquito flojo o doblado. Asegúrate de que esté recto y bien enchufado en la entrada verde, y luego avísame con el botón.';
    case 'C':
      return 'Hay una avería externa en tu zona y nuestro equipo técnico ya está en camino para repararla en la calle. Aquí tienes tu constancia oficial CLARO-AV-2026-9814 para que no tengas que llamar.';
    case 'D':
    default:
      return '¡Todo está perfecto con tu internet en casa, Axel! Tu Wi-Fi funciona rápido y estable en todos tus dispositivos.';
  }
}
