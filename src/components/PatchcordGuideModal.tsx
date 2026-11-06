import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNetworkSimulation } from '../context/NetworkSimulationContext';

export const PatchcordInlineDiagram: React.FC<{
  rxPowerDbm: number | null;
  onOpenModal?: () => void;
}> = ({ rxPowerDbm, onOpenModal }) => {
  const isOptimal = rxPowerDbm !== null && rxPowerDbm >= -24.5;

  return (
    <View style={styles.inlineCard}>
      <View style={styles.inlineHeader}>
        <Text style={styles.inlineHeaderTitle}>
          DIAGRAMA FÍSICO: PUERTO VERDE PON + CABLE AMARILLO
        </Text>
      </View>

      {/* Ilustración esquemática del Router ONT y el Patchcord Amarillo */}
      <View style={styles.diagramBox}>
        <View style={styles.diagramRow}>
          {/* Roseta Óptica de Pared */}
          <View style={styles.rosetaBox}>
            <Text style={styles.rosetaLabel}>ROSETA</Text>
            <Text style={styles.rosetaSub}>PARED</Text>
          </View>

          {/* Cable Amarillo de Fibra Óptica (Patchcord) */}
          <View style={styles.cableTrack}>
            <View
              style={[
                styles.yellowCableLine,
                !isOptimal && styles.yellowCableBent,
              ]}
            />
            <View
              style={[
                styles.cableAlertTag,
                { backgroundColor: isOptimal ? '#DCFCE7' : '#FEF3C7' },
              ]}
            >
              <Text
                style={[
                  styles.cableAlertText,
                  { color: isOptimal ? '#065F46' : '#92400E' },
                ]}
              >
                {isOptimal
                  ? '✓ Cable amarillo recto (-19.0 dBm)'
                  : '⚠ Cable Amarillo (Patchcord): Evitar dobleces'}
              </Text>
            </View>
          </View>

          {/* Conector SC/APC Verde + Puerto PON del Router */}
          <View style={styles.ontRearBox}>
            <Text style={styles.ontRearTitle}>ROUTER ONT</Text>
            <View style={styles.ponPortSocket}>
              <View style={styles.greenScConnector}>
                <Text style={styles.ponPortText}>PON</Text>
              </View>
            </View>
            <Text style={styles.clickBadge}>
              {isOptimal ? '✓ CONECTADO' : 'Empujar hasta "CLIC"'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.instructionStepBox}>
        <Text style={styles.instructionStepText}>
          <Text style={styles.boldText}>Instrucción paso a paso: </Text>
          "Verifica que el cable amarillo no tenga dobleces pronunciados y que el conector haga clic en el puerto verde PON".
        </Text>
      </View>

      {onOpenModal ? (
        <TouchableOpacity
          style={styles.expandDiagramBtn}
          onPress={onOpenModal}
          activeOpacity={0.8}
        >
          <Text style={styles.expandDiagramBtnText}>
            🔍 Ampliar Guía Visual Paso a Paso
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const PatchcordGuideModal: React.FC = () => {
  const {
    isPatchcordModalOpen,
    setPatchcordModalOpen,
    telemetry,
    triggerVerifyPatchcord,
  } = useNetworkSimulation();

  const rxText =
    telemetry.rxPowerDbm !== null
      ? `${telemetry.rxPowerDbm.toFixed(1)} dBm`
      : 'SIN SEÑAL';
  const isHealthy =
    telemetry.rxPowerDbm !== null && telemetry.rxPowerDbm >= -24.5;

  return (
    <Modal
      visible={isPatchcordModalOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setPatchcordModalOpen(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalPhaseTag}>
                FASE 3 · GUÍA DE HARDWARE ASISTIDA EN EL HOGAR
              </Text>
              <Text style={styles.modalTitle}>
                Inspección del Patchcord de Fibra Óptica
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPatchcordModalOpen(false)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Medidor en vivo de Potencia Óptica */}
            <View
              style={[
                styles.liveMeterCard,
                {
                  backgroundColor: isHealthy ? '#F0FDF4' : '#FEF2F2',
                  borderColor: isHealthy ? '#86EFAC' : '#FCA5A5',
                },
              ]}
            >
              <View style={styles.liveMeterRow}>
                <View>
                  <Text style={styles.liveMeterLabel}>
                    LECTURA LÁSER EN PUERTO PON (EN VIVO)
                  </Text>
                  <Text
                    style={[
                      styles.liveMeterValue,
                      { color: isHealthy ? '#059669' : '#DA291C' },
                    ]}
                  >
                    {rxText}
                  </Text>
                </View>
                <View style={styles.rangeReferenceBox}>
                  <Text style={styles.rangeRefText}>Óptimo: -18 a -24 dBm</Text>
                  <Text style={styles.rangeRefCrit}>Falla: {'<'} -28 dBm</Text>
                </View>
              </View>
            </View>

            {/* Diagrama Ilustrativo */}
            <PatchcordInlineDiagram rxPowerDbm={telemetry.rxPowerDbm} />

            {/* 3 Pasos Guiados */}
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepCircleText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    Ubica el cable amarillo (Patchcord SC/APC)
                  </Text>
                  <Text style={styles.stepDesc}>
                    Es el cable delgado amarillo que sale de la cajita blanca de la pared hacia la parte trasera de tu router Claro.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepCircleText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    Elimina dobleces o aplastamientos
                  </Text>
                  <Text style={styles.stepDesc}>
                    Por dentro viaja un haz de luz láser sobre vidrio. Si el cable amarillo está doblado en ángulo recto o presionado por un mueble, la luz se atenúa a -28.6 dBm.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.stepCircleText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    Asegura el conector en el puerto verde PON
                  </Text>
                  <Text style={styles.stepDesc}>
                    Empuja suavemente la punta verde del cable en la entrada verde marcada como "PON" o "OPTICAL" hasta escuchar un clic firme. No retires el conector para proteger tus ojos del láser.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.verifyPrimaryBtn}
              onPress={() => triggerVerifyPatchcord()}
              activeOpacity={0.85}
            >
              <Text style={styles.verifyPrimaryBtnText}>
                ✓ Ya lo ajusté, verificar ahora en tiempo real
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  inlineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    padding: 12,
    marginTop: 10,
  },
  inlineHeader: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  inlineHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.3,
  },
  diagramBox: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  diagramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rosetaBox: {
    width: 62,
    height: 62,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosetaLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1F2937',
  },
  rosetaSub: {
    fontSize: 8,
    color: '#6B7280',
    fontWeight: '700',
  },
  cableTrack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  yellowCableLine: {
    width: '100%',
    height: 7,
    backgroundColor: '#FACC15',
    borderRadius: 4,
    marginBottom: 8,
  },
  yellowCableBent: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  cableAlertTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cableAlertText: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  ontRearBox: {
    width: 92,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  ontRearTitle: {
    color: '#E5E7EB',
    fontSize: 8,
    fontWeight: '800',
    marginBottom: 4,
  },
  ponPortSocket: {
    backgroundColor: '#064E3B',
    padding: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginBottom: 4,
  },
  greenScConnector: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ponPortText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  clickBadge: {
    color: '#FDE047',
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  instructionStepBox: {
    backgroundColor: '#FFFBEB',
    padding: 9,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  instructionStepText: {
    fontSize: 12,
    color: '#1F2937',
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '800',
    color: '#92400E',
  },
  expandDiagramBtn: {
    marginTop: 8,
    paddingVertical: 7,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  expandDiagramBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalPhaseTag: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalBody: {
    padding: 16,
  },
  liveMeterCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  liveMeterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveMeterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },
  liveMeterValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
  },
  rangeReferenceBox: {
    alignItems: 'flex-end',
  },
  rangeRefText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  rangeRefCrit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 2,
  },
  stepsList: {
    marginTop: 14,
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DA291C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepCircleText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  modalFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  verifyPrimaryBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
