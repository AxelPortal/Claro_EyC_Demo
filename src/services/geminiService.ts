export interface TelemetrySnapshot {
  scenarioId: 'A' | 'B' | 'C' | 'D';
  scenarioName: string;
  phase: 1 | 2 | 3 | 4;
  rxPowerDbm: number | null; // null = LOS (Loss of Signal / Sin Señal)
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
  healthScore: number; // 0 - 100
  downloadMbps: number;
  uploadMbps: number;
  contractedMbps: number;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  text: string;
}

const ENV_API_KEY =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) ||
  '';

let runtimeApiKeyOverride: string = '';

export function setRuntimeGeminiApiKey(key: string) {
  runtimeApiKeyOverride = key.trim();
}

export function getActiveGeminiApiKey(): string {
  const key = runtimeApiKeyOverride || ENV_API_KEY;
  if (!key || key === 'TU_API_KEY_DE_GEMINI_AQUI' || key === 'YOUR_GEMINI_API_KEY_HERE') {
    return '';
  }
  return key.trim();
}

export function isGeminiConfigured(): boolean {
  return getActiveGeminiApiKey().length > 10;
}

function buildSystemInstruction(telemetry: TelemetrySnapshot): string {
  const rxStr =
    telemetry.rxPowerDbm === null
      ? 'SIN SEÑAL (LOS / Corte de fibra)'
      : `${telemetry.rxPowerDbm.toFixed(1)} dBm`;

  return `Eres "Copiloto Claro", el asistente de soporte técnico inteligente de Claro Perú (América Móvil Perú S.A.C.) para Internet Fijo Residencial FTTH (Fibra Óptica).
Estás hablando con el cliente titular: Axel Portal (Plan Claro Hogar Fibra 600 Mbps, Distrito: San Isidro, Lima, Router ONT: ${telemetry.ontModel}).

REGLAS ESTRICTAS DE PERSONALIDAD Y NEGOCIO:
1. NUNCA pidas al usuario "reiniciar el módem" de forma genérica ni hagas preguntas repetitivas de call center tradicional. Tú ya lees la telemetría en tiempo real desde la ONT del cliente.
2. Sé empático, claro, conciso (máximo 3-4 oraciones por respuesta) y transparente con los datos técnicos explicados en lenguaje sencillo.
3. Menciona siempre los valores reales actuales de la telemetría para demostrar que estás conectado a su router en vivo.
4. Sigue el modelo de 4 fases de Claro Perú y OSIPTEL:
   - Fase 1 y 2 (Congestión Wi-Fi): Si hay saturación en 5 GHz (${telemetry.wifi5SaturationPct}%) o 2.4 GHz (${telemetry.wifi24SaturationPct}%), explica que hay interferencia de redes vecinas en el canal ${telemetry.wifi5Channel} y ofrece optimizar el canal automáticamente con 1 clic.
   - Fase 3 (Atenuación Física / Patchcord): Si la potencia óptica Rx está entre -25 dBm y -29.9 dBm (actual: ${rxStr}), explica que el cable amarillo de fibra (Patchcord) en el puerto verde PON tiene atenuación por doblez o conector flojo, e invítalo a usar la guía visual para ajustarlo.
   - Fase 4 (Corte Externo / Avería OSIPTEL): Si la potencia óptica es menor a -30 dBm o SIN SEÑAL (${rxStr}), informa con total honestidad que es una avería de planta externa en el ${telemetry.nodeName} y que ya emitiste su Código Oficial de Avería homologado por OSIPTEL sin que tenga que llamar al 123.

TELEMETRÍA EN TIEMPO REAL DEL ROUTER ONT:
- Escenario Activo: ${telemetry.scenarioName} (Fase ${telemetry.phase})
- Salud de Red: ${telemetry.healthScore}/100
- Potencia Óptica Rx: ${rxStr} (Rango normal: -18.0 a -24.0 dBm | Falla crítica: < -28.0 dBm)
- Estado PON: ${telemetry.ponStatus}
- Latencia (Ping): ${telemetry.pingMs} ms | Jitter: ${telemetry.jitterMs} ms | Pérdida de paquetes: ${telemetry.packetLossPct}%
- Velocidad actual: ${telemetry.downloadMbps} Mbps bajada / ${telemetry.uploadMbps} Mbps subida (Contratado: ${telemetry.contractedMbps} Mbps)
- Canal Wi-Fi 5 GHz: Canal ${telemetry.wifi5Channel} (${telemetry.wifi5SaturationPct}% saturación)
- Canal Wi-Fi 2.4 GHz: Canal ${telemetry.wifi24Channel} (${telemetry.wifi24SaturationPct}% saturación)
- Dispositivos conectados: ${telemetry.connectedDevices} equipos
- Nodo Distrital: ${telemetry.nodeName} (${telemetry.nodeStatus})

Responde en español peruano profesional y cercano. No uses bloques largos de markdown complejos, solo texto claro y directo.`;
}

export async function generateCopilotResponse(
  userMessage: string,
  telemetry: TelemetrySnapshot,
  history: ChatHistoryItem[]
): Promise<{ text: string; usedGemini: boolean }> {
  const apiKey = getActiveGeminiApiKey();

  if (apiKey) {
    try {
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
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
              temperature: 0.4,
              maxOutputTokens: 320,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidateText) {
          return { text: candidateText, usedGemini: true };
        }
      }
    } catch (error) {
      // Fallback silencioso al motor determinístico local si falla la red o API Key
      console.warn('Gemini API fallback activado:', error);
    }
  }

  // Motor NLP determinístico contextual (Fallback 100% Client-Side)
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
  const rxStr =
    telemetry.rxPowerDbm === null
      ? 'SIN SEÑAL (-31.5 dBm / LOS)'
      : `${telemetry.rxPowerDbm.toFixed(1)} dBm`;

  if (q.includes('velocidad') || q.includes('lento') || q.includes('lag') || q.includes('ping')) {
    if (telemetry.scenarioId === 'A') {
      return `Hola Axel, estoy leyendo tu ONT ${telemetry.ontModel} en vivo: tu fibra óptica llega perfecta (${rxStr}), pero tu red Wi-Fi 5 GHz en el canal ${telemetry.wifi5Channel} tiene ${telemetry.wifi5SaturationPct}% de saturación por interferencia de routers vecinos, elevando tu ping a ${telemetry.pingMs} ms. Pulsa el botón de abajo para autorizar el cambio automático al canal limpio 149 sin reiniciar tu módem.`;
    }
    if (telemetry.scenarioId === 'B') {
      return `Axel, detecto que tu lentitud (${telemetry.downloadMbps} Mbps de ${telemetry.contractedMbps} Mbps) y pérdida de paquetes (${telemetry.packetLossPct}%) se deben a una atenuación física en tu fibra óptica: la potencia Rx cayó a ${rxStr}. Revisa el cable amarillo (Patchcord) en la entrada verde PON usando la guía interactiva aquí en el chat.`;
    }
    if (telemetry.scenarioId === 'C') {
      return `Axel, no necesitas hacer ninguna prueba ni reiniciar tu router. Mi telemetría confirma pérdida de señal óptica (${rxStr}) por una incidencia externa en el ${telemetry.nodeName}. Ya generé tu Ticket Oficial de Avería homologado por OSIPTEL con visita técnica programada.`;
    }
    return `Tu conexión opera al 100% de salud, Axel. Estás recibiendo ${telemetry.downloadMbps} Mbps con apenas ${telemetry.pingMs} ms de latencia, ${telemetry.packetLossPct}% de pérdida de paquetes y potencia óptica óptima de ${rxStr}.`;
  }

  if (q.includes('reclamo') || q.includes('osiptel') || q.includes('ticket') || q.includes('tecnico') || q.includes('técnico')) {
    if (telemetry.scenarioId === 'C') {
      return `Tu código oficial de avería CLARO-AV-2026-9814 ya está registrado y respaldado por OSIPTEL con la evidencia de telemetría (${rxStr} en ${telemetry.nodeName}). El técnico de planta externa ya tiene el diagnóstico completo y no te pedirá reiniciar el módem.`;
    }
    return `En este momento tu línea tiene potencia óptica de ${rxStr} y el ${telemetry.nodeName} reporta estado ${telemetry.nodeStatus}. No requieres visita técnica externa; podemos resolver cualquier ajuste desde este panel sin esperar en el 123.`;
  }

  if (q.includes('cable') || q.includes('amarillo') || q.includes('patchcord') || q.includes('pon')) {
    return `El cable amarillo (Patchcord óptico SC/APC) conecta la roseta de pared con el puerto verde PON de tu router ${telemetry.ontModel}. Actualmente tu potencia Rx marca ${rxStr} (el rango normal es de -18 a -24 dBm). Si está doblado o flojo, la luz láser se atenúa.`;
  }

  // Respuesta inteligente general según el escenario activo
  switch (telemetry.scenarioId) {
    case 'A':
      return `Analizando tu router en tiempo real: la potencia óptica está saludable (${rxStr}), pero detecto congestión del ${telemetry.wifi5SaturationPct}% en el canal ${telemetry.wifi5Channel} de 5 GHz (${telemetry.pingMs} ms de ping y ${telemetry.packetLossPct}% de pérdida). Autorízame con el botón en pantalla para migrar tu Wi-Fi a un canal libre en 1.5 segundos.`;
    case 'B':
      return `Lectura en vivo de tu ONT: la potencia óptica de recepción cayó a ${rxStr} (umbral crítico < -28 dBm), provocando ${telemetry.packetLossPct}% de pérdida de paquetes. Todo indica que el cable amarillo Patchcord tiene un doblez o está flojo en el puerto verde PON. Abre la guía visual para verificarlo juntos.`;
    case 'C':
      return `Confirmado mediante telemetría directa: tu ONT registra pérdida de señal óptica (${rxStr}) asociada a una falla de línea externa en ${telemetry.nodeName}. Para ahorrarte llamadas al 123 y descartes innecesarios, ya emití tu Ticket Oficial de Avería OSIPTEL (CLARO-AV-2026-9814).`;
    case 'D':
    default:
      return `Todo funciona en óptimas condiciones, Axel. Tu router ${telemetry.ontModel} reporta ${rxStr} de potencia óptica, ${telemetry.pingMs} ms de ping, canal 5 GHz despejado (Canal ${telemetry.wifi5Channel} al ${telemetry.wifi5SaturationPct}%) y ${telemetry.downloadMbps} Mbps estables en ${telemetry.nodeName}.`;
  }
}
