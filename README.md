# Prototipo Interactivo de Soporte Inteligente Claro Perú (IA + Telemetría)

**Institución:** UTEC (Universidad de Ingeniería y Tecnología)  
**Curso:** Empresa y Consumidor (2026-2)  
**Empresa Objetivo:** Claro Perú (América Móvil Perú S.A.C.) — Internet Fijo Residencial FTTH / HFC  

---

## Propuesta de Valor: "Copiloto Claro"
Sistema de IA Conversacional conectado directamente a la telemetría en tiempo real del router/ONT del cliente (`Huawei OptiXstar HG8145X6`). Transforma el soporte técnico tradicional reactivo (Call Center 123 con esperas y reinicios innecesarios de módem) en una experiencia **proactiva y guiada en 4 fases**, emitiendo un **Código Oficial de Avería homologado por OSIPTEL** sin intervención humana cuando existe una falla externa.

---

## Las 4 Fases Funcionales y Controlador de Escenarios
Desde la esquina superior derecha (**`⚙️ Modo Demo`**) o la barra rápida superior, los evaluadores pueden activar los 4 escenarios determinísticos:

1. **Escenario A — Congestión Wi-Fi (Fases 1 y 2):**
   - Simula alta latencia (`142 ms`) y saturación del `92%` en el Canal 36 (5 GHz) con potencia óptica normal (`-19.4 dBm`).
   - El Copiloto solicita consentimiento explícito (`"¿Deseas que optimice tu canal Wi-Fi ahora?"`), ejecuta el cambio remoto al Canal 149 en `1.5s` y valida la mejora inmediata (`8 ms`, `618 Mbps`).
2. **Escenario B — Cable Patchcord Flojo (Fase 3):**
   - Simula atenuación óptica anormal (`-28.6 dBm`) en el puerto verde PON.
   - Despliega la guía visual interactiva del **Patchcord amarillo de fibra óptica** y al pulsar `"Ya lo ajusté, verificar ahora"` re-escanea el láser mostrando la recuperación a `-19.0 dBm`.
3. **Escenario C — Corte Externo de Fibra (Fase 4):**
   - Simula pérdida total de señal óptica (`-31.5 dBm / Alarma LOS`).
   - Ejecuta descartes automáticos y emite en pantalla el **Ticket Oficial de Avería (`CLARO-AV-2026-9814`)** homologado por OSIPTEL con ventana de visita técnica y resumen vinculante para el técnico de campo.
4. **Escenario D — Estado Óptimo (100% Salud):**
   - Muestra la red FTTH operando con métricas ideales (`-18.9 dBm`, `7 ms`, `0%` pérdida, `624 Mbps`).

---

## Configuración de API Key de Google Gemini (`.env`)
1. Edita el archivo `.env` en la raíz del proyecto y coloca tu API Key de Gemini:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=TU_API_KEY_DE_GEMINI_AQUI
   ```
2. También puedes ingresar o actualizar tu API Key en vivo desde el panel **`⚙️ Modo Demo`** dentro de la aplicación. Si no se ingresa una API Key, el prototipo cuenta con un motor NLP determinístico de respaldo 100% funcional.

---

## Ejecución y Despliegue

### 1. Ejecutar en desarrollo (Web y Expo Go en Móvil)
```bash
npm install
npx expo start
```

### 2. Exportar para producción Web / Vercel
```bash
npx expo export -p web
```
El proyecto incluye `vercel.json` preconfigurado para despliegue directo en Vercel.
