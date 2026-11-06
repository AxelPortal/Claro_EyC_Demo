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
  const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

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
  const wifiFixed =
    telemetry.scenarioId === 'A' && telemetry.wifi5SaturationPct <= 40;
  const cableFixed =
    telemetry.scenarioId === 'B' &&
    telemetry.rxPowerDbm !== null &&
    telemetry.rxPowerDbm >= -24.5;

  let situacionActual = 'Tu internet funciona excelente y a máxima velocidad (600 Mbps).';
  if (wifiFixed) {
    situacionActual =
      'Hace un momento el Wi-Fi de Axel tenía interferencia con las redes de sus vecinos, pero TÚ (el Asistente Claro) YA LO SOLUCIONASTE automáticamente cambiándolo a una señal libre sin apagar su router. Ahora su internet ya está rápido y excelente (600 Mbps). Si te pregunta cómo lo hiciste, explícale de forma sencilla que buscaste un camino de señal Wi-Fi despejado en su casa donde no estorben los routers de los vecinos.';
  } else if (cableFixed) {
    situacionActual =
      'Hace un momento el cable amarillo detrás del router de Axel estaba un poco doblado o flojo, pero Axel YA LO ACOMODÓ y tú verificaste que la señal quedó excelente y al 100% (600 Mbps).';
  } else if (telemetry.scenarioId === 'A') {
    situacionActual =
      'El internet llega bien desde la calle, pero el Wi-Fi dentro de la casa tiene interferencia porque los routers de los vecinos están saturando el mismo camino de señal. Ofrece cambiarlo automáticamente con el botón en pantalla.';
  } else if (telemetry.scenarioId === 'B') {
    situacionActual =
      'La señal que entra por el cable amarillo detrás del router llega débil porque ese cable parece estar doblado o un poquito flojo en la entrada verde. Guíalo con cariño para que lo estire y lo presione suavemente.';
  } else if (telemetry.scenarioId === 'C') {
    situacionActual =
      'Hay una avería en el cableado exterior de la calle en su cuadra de San Isidro. El router de su casa está bien, así que NO debe reiniciarlo. Ya se emitió su código de atención CLARO-AV-2026-9814 y los técnicos lo repararán hoy entre 4:30 pm y 6:00 pm en el poste de la calle.';
  }

  return `Eres "Asistente Claro", el asistente virtual inteligente de Claro Perú dentro de la app Mi Claro del cliente Axel.

REGLAS ESTRICTAS:
1. Responde SIEMPRE directamente a lo que el usuario te está preguntando (por ejemplo, si saluda con "Hola", salúdalo con calidez; si pregunta "¿Cómo lo hiciste?", explícale en palabras sencillas qué ajuste hiciste; si agradece, responde con amabilidad).
2. Usa un lenguaje cotidiano, claro y empático. NO uses términos técnicos difíciles (prohibido decir dBm, TR-069, OMCI, BSSID, latencia en ms, pérdida de paquetes, splitter u ONT).
3. NO menciones nunca que esto es una demo, prototipo, escenario o fase.
4. Sé conciso: responde en 2 a 3 oraciones naturales.

CONTEXTO EN VIVO DEL HOGAR DE AXEL:
- Estado actual: ${situacionActual}
- Plan: Claro Hogar 600 Mbps en San Isidro (${telemetry.connectedDevices} equipos conectados en casa).`;
}

function buildNormalizedContents(
  history: ChatHistoryItem[],
  userMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const raw = [
    ...history.slice(-6).map((h) => ({
      role: (h.role === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: h.text,
    })),
    { role: 'user' as const, text: userMessage },
  ];

  // Fusionar turnos consecutivos del mismo rol y asegurar que inicie con 'user'
  const merged: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  for (const item of raw) {
    if (!item.text.trim()) continue;
    const prev = merged[merged.length - 1];
    if (prev && prev.role === item.role) {
      prev.parts[0].text += `\n${item.text}`;
    } else {
      merged.push({
        role: item.role,
        parts: [{ text: item.text }],
      });
    }
  }

  // Si el primer mensaje es 'model', anteponer un contexto de usuario implícito para cumplir validación estricta
  if (merged.length > 0 && merged[0].role === 'model') {
    merged.unshift({
      role: 'user',
      parts: [{ text: 'Hola, revisa cómo está mi conexión de internet en casa.' }],
    });
  }

  return merged;
}

export async function generateCopilotResponse(
  userMessage: string,
  telemetry: TelemetrySnapshot,
  history: ChatHistoryItem[]
): Promise<{ text: string; usedGemini: boolean }> {
  const keys = getOrderedApiKeys();
  const systemInstruction = buildSystemInstruction(telemetry);
  const contents = buildNormalizedContents(history, userMessage);

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
                temperature: 0.55,
                maxOutputTokens: 260,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts;
          if (Array.isArray(parts)) {
            const textPart = parts.find(
              (p: { text?: string }) =>
                typeof p?.text === 'string' && p.text.trim().length > 0
            );
            if (textPart?.text) {
              return { text: textPart.text.trim(), usedGemini: true };
            }
          }
        }
      } catch (error) {
        // Fallback al siguiente modelo o motor conversacional local
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
  const q = userMessage
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const wifiFixed =
    telemetry.scenarioId === 'A' && telemetry.wifi5SaturationPct <= 40;
  const cableFixed =
    telemetry.scenarioId === 'B' &&
    telemetry.rxPowerDbm !== null &&
    telemetry.rxPowerDbm >= -24.5;
  const isHealthy = telemetry.healthScore >= 85;

  // 1. Preguntas sobre "¿Cómo lo hiciste?", "¿Qué hiciste?", "¿Qué cambiaste?", "¿Por qué fallaba?"
  if (
    q.includes('como lo hiciste') ||
    q.includes('que hiciste') ||
    q.includes('que cambiaste') ||
    q.includes('como se arreglo') ||
    q.includes('como funciona') ||
    q.includes('explicame') ||
    q.includes('por que pasaba')
  ) {
    if (wifiFixed || telemetry.scenarioId === 'A') {
      return '¡Fue muy sencillo! Detecté que varios routers de tus vecinos estaban usando el mismo camino de señal que el tuyo, como si fuera una avenida con tráfico. Automáticamente pasé tu Wi-Fi a una vía totalmente despejada para que tus equipos naveguen a máxima velocidad sin tener que apagar tu router.';
    }
    if (cableFixed || telemetry.scenarioId === 'B') {
      return 'Por dentro del cable amarillo viaja una señal de luz muy rápida. Cuando el cable estaba un poco doblado o flojo, esa luz no pasaba bien; apenas lo acomodaste en la entrada verde, la señal recuperó toda su fuerza al instante.';
    }
    if (telemetry.scenarioId === 'C') {
      return 'Mi sistema revisó primero tu router desde aquí y confirmó que tu equipo en casa está sano. Al ver que varios hogares de tu misma cuadra perdieron señal al mismo tiempo, identifiqué que el problema está en el poste de la calle y envié a los técnicos automáticamente.';
    }
    return 'Estoy conectado directamente a tu router Claro para vigilar que la señal de la calle y tu Wi-Fi funcionen siempre por el camino más rápido, sin que tengas que reiniciar equipos ni llamar por teléfono.';
  }

  // 2. Saludos ("Hola", "Buenas", "Qué tal", "Buenos días")
  if (
    q === 'hola' ||
    q.startsWith('hola ') ||
    q.includes('buenos dias') ||
    q.includes('buenas tardes') ||
    q.includes('buenas noches') ||
    q === 'que tal'
  ) {
    if (wifiFixed) {
      return '¡Hola de nuevo, Axel! 👋 Después del ajuste que hicimos en tu Wi-Fi, tu conexión sigue funcionando excelente y a máxima velocidad en tus 11 dispositivos. ¿Te puedo ayudar con algo más?';
    }
    if (cableFixed) {
      return '¡Hola Axel! 👋 Desde que acomodaste el cable amarillo, tu internet está súper estable y funcionando al 100%. ¿Cómo sientes la velocidad ahora?';
    }
    if (isHealthy) {
      return `¡Hola Axel! 👋 Qué gusto saludarte. Tu internet en casa está funcionando excelente hoy y tus ${telemetry.connectedDevices} dispositivos navegan a máxima velocidad. ¿En qué te puedo ayudar?`;
    }
    if (telemetry.scenarioId === 'A') {
      return '¡Hola Axel! 👋 Justo estaba revisando tu conexión: el internet llega bien desde la calle, pero hay interferencia en tu Wi-Fi por las redes de tus vecinos. Toca el botón de arriba y lo arreglo en un segundo.';
    }
    if (telemetry.scenarioId === 'B') {
      return '¡Hola Axel! 👋 Noté que la señal que entra por el cable amarillo detrás de tu router está un poquito débil. Revisa que no esté doblado y empújalo suavemente en la entrada verde.';
    }
    return '¡Hola Axel! 👋 Te comento que hay una avería externa en tu cuadra de San Isidro, pero ya registramos tu atención (CLARO-AV-2026-9814) y nuestro equipo técnico lo solucionará hoy entre 4:30 p.m. y 6:00 p.m.';
  }

  // 3. Agradecimientos ("Gracias", "Genial", "Perfecto", "Excelente", "Listo")
  if (
    q.includes('gracias') ||
    q.includes('genial') ||
    q.includes('perfecto') ||
    q.includes('excelente') ||
    q.includes('buenisimo') ||
    q === 'ok' ||
    q === 'vale'
  ) {
    return '¡Con mucho gusto, Axel! 😊 Para eso estoy aquí: para ayudarte al instante sin que tengas que esperar en línea. Si necesitas cualquier otra cosa con tu internet de Claro, solo escríbeme.';
  }

  // 4. Preguntas sobre velocidad, lentitud o videollamadas
  if (
    q.includes('lento') ||
    q.includes('velocidad') ||
    q.includes('videollamada') ||
    q.includes('corta') ||
    q.includes('interferencia') ||
    q.includes('megas')
  ) {
    if (isHealthy) {
      return `Ahora mismo estás recibiendo los ${telemetry.contractedMbps} Mbps completos de tu plan Claro Hogar sin ninguna interrupción. Tus videollamadas, videos y descargas van a fluir sin cortes.`;
    }
    if (telemetry.scenarioId === 'A') {
      return 'Esa lentitud se debe a que el Wi-Fi de tus vecinos está chocando con el tuyo. La señal de la calle llega perfecta, así que solo toca el botón "Sí, mejorar mi Wi-Fi ahora" para pasarte a una señal libre al instante.';
    }
    if (telemetry.scenarioId === 'B') {
      return 'Se está cortando porque el cable amarillo detrás de tu router parece estar un poco flojo o doblado, y eso debilita la señal. Estíralo con cuidado, asegúralo en la entrada verde y presiona el botón para verificarlo.';
    }
    return 'En este momento no tienes servicio porque hay un corte en el cableado exterior de tu cuadra. Nuestro equipo técnico ya fue asignado con el código CLARO-AV-2026-9814 y quedará resuelto hoy entre 4:30 p.m. y 6:00 p.m.';
  }

  // 5. Preguntas sobre reiniciar o apagar el router
  if (
    q.includes('reiniciar') ||
    q.includes('apagar') ||
    q.includes('desenchufar') ||
    q.includes('router') ||
    q.includes('modem')
  ) {
    return 'No necesitas apagar ni desenchufar tu router, Axel. Yo me encargo de revisar y ajustar tu conexión directamente desde aquí para que no pierdas tiempo.';
  }

  // 6. Preguntas sobre averías en la zona o técnicos
  if (
    q.includes('zona') ||
    q.includes('calle') ||
    q.includes('cuadra') ||
    q.includes('san isidro') ||
    q.includes('tecnico') ||
    q.includes('horario') ||
    q.includes('cuando')
  ) {
    if (telemetry.scenarioId === 'C') {
      return 'Sí, detectamos una avería en el poste exterior de tu cuadra en San Isidro. Los técnicos de Claro ya están trabajando en la zona y el servicio volverá hoy entre las 4:30 p.m. y 6:00 p.m. sin que tengas que recibirlos dentro de casa.';
    }
    return 'En tu zona de San Isidro el cableado exterior de Claro funciona con total normalidad hoy; no hay ningún corte ni falla masiva en tu cuadra.';
  }

  // 7. Preguntas sobre equipos conectados o contraseña Wi-Fi
  if (
    q.includes('equipos') ||
    q.includes('dispositivos') ||
    q.includes('conectados') ||
    q.includes('clave') ||
    q.includes('contrasena')
  ) {
    return `En este momento tienes ${telemetry.connectedDevices} dispositivos conectados al Wi-Fi de tu casa (celulares, laptops y televisores). Todos están reconocidos y navegando de forma segura en tu red Claro.`;
  }

  // 8. Preguntas sobre corte de luz / energía eléctrica
  if (q.includes('corte de luz') || q.includes('luz') || q.includes('apagon') || q.includes('energia')) {
    return 'Si hay un corte de luz en casa, tu router se apagará mientras no haya electricidad. Te recomiendo desenchufarlo para protegerlo de subidas de tensión; apenas regrese la luz y lo enchufes, tu internet volverá automáticamente en 2 minutos.';
  }

  // 9. Solicitud de derivación a un asesor humano / persona
  if (
    q.includes('persona') ||
    q.includes('humano') ||
    q.includes('asesor') ||
    q.includes('operador') ||
    q.includes('derives') ||
    q.includes('llamar')
  ) {
    return '¡Claro que sí, Axel! Te estoy transfiriendo con un asesor especializado de Claro y le estoy enviando todo el resumen de tu conexión para que no te haga repetir ninguna prueba ni reiniciar tu router.';
  }

  // 8. Respuesta conversacional inteligente según si ya está todo bien o si hay algo pendiente
  if (isHealthy) {
    return `Todo marcha excelente con tu conexión en casa, Axel: estás recibiendo tus ${telemetry.contractedMbps} Mbps completos y tus ${telemetry.connectedDevices} equipos conectados tienen señal estable. ¿Tienes alguna otra duda sobre tu servicio?`;
  }

  if (telemetry.scenarioId === 'A') {
    return 'Revisé tu conexión y la señal llega muy bien desde la calle, pero las redes Wi-Fi de tus vecinos están generando interferencia. Si tocas el botón rojo del mensaje anterior, cambio tu Wi-Fi a una señal libre en un segundo.';
  }
  if (telemetry.scenarioId === 'B') {
    return 'El único detalle que detecto es que la señal entra débil por el cable amarillo detrás de tu router. Revisa que no esté doblado y que esté bien enchufado en la entrada verde, y luego toca el botón para comprobarlo.';
  }
  return 'Recuerda que la interrupción actual se debe a un arreglo externo en tu cuadra de San Isidro (Código CLARO-AV-2026-9814). Nuestro equipo técnico lo dejará listo hoy entre 4:30 p.m. y 6:00 p.m.';
}
