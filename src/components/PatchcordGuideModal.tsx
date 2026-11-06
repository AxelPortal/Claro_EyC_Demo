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
      <Text style={styles.inlineHeaderTitle}>
        Cómo revisar el cable amarillo detrás de tu router
      </Text>

      <View style={styles.diagramBox}>
        <View style={styles.diagramRow}>
          <View style={styles.rosetaBox}>
            <Text style={styles.rosetaLabel}>PARED</Text>
          </View>

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
                  ? '✓ Cable amarillo bien colocado'
                  : 'Cable amarillo: sin dobleces'}
              </Text>
            </View>
          </View>

          <View style={styles.ontRearBox}>
            <Text style={styles.ontRearTitle}>TU ROUTER</Text>
            <View style={styles.ponPortSocket}>
              <View style={styles.greenScConnector}>
                <Text style={styles.ponPortText}>Entrada Verde</Text>
              </View>
            </View>
            <Text style={styles.clickBadge}>
              {isOptimal ? '✓ Bien conectado' : 'Empujar hasta hacer clic'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.instructionStepBox}>
        <Text style={styles.instructionStepText}>
          Fíjate que el <Text style={styles.boldText}>cable amarillo</Text> no esté doblado ni aplastado por algún mueble y que su punta entre firme en la <Text style={styles.boldText}>entrada verde</Text>.
        </Text>
      </View>

      {onOpenModal ? (
        <TouchableOpacity
          style={styles.expandDiagramBtn}
          onPress={onOpenModal}
          activeOpacity={0.8}
        >
          <Text style={styles.expandDiagramBtnText}>
            Ver guía paso a paso
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Revisión rápida del cable amarillo
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPatchcordModalOpen(false)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.liveMeterCard,
                {
                  backgroundColor: isHealthy ? '#F0FDF4' : '#FFFBEB',
                  borderColor: isHealthy ? '#86EFAC' : '#FDE68A',
                },
              ]}
            >
              <Text style={styles.liveMeterLabel}>Estado actual del cable</Text>
              <Text
                style={[
                  styles.liveMeterValue,
                  { color: isHealthy ? '#059669' : '#B45309' },
                ]}
              >
                {isHealthy ? 'Señal excelente y estable' : 'Señal débil (revisar cable)'}
              </Text>
            </View>

            <PatchcordInlineDiagram rxPowerDbm={telemetry.rxPowerDbm} />

            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepCircleText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Ubica el cable amarillo</Text>
                  <Text style={styles.stepDesc}>
                    Es el cable delgado amarillo que va desde la cajita blanca de la pared hacia la parte de atrás de tu router.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepCircleText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Estíralo con cuidado</Text>
                  <Text style={styles.stepDesc}>
                    Asegúrate de que no esté doblado ni apretado detrás de algún mueble para que la señal pase bien.
                  </Text>
                </View>
              </View>

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, { backgroundColor: '#10B981' }]}>
                  <Text style={styles.stepCircleText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Ajusta la punta en la entrada verde</Text>
                  <Text style={styles.stepDesc}>
                    Empuja suavemente el conector en la entrada verde detrás del router hasta escuchar un clic. No lo saques de su sitio.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.verifyPrimaryBtn}
              onPress={() => triggerVerifyPatchcord()}
              activeOpacity={0.85}
            >
              <Text style={styles.verifyPrimaryBtnText}>
                Ya lo acomodé, volver a revisar
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
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginTop: 10,
  },
  inlineHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
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
    width: 56,
    height: 56,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosetaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1F2937',
  },
  cableTrack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  yellowCableLine: {
    width: '100%',
    height: 6,
    backgroundColor: '#FACC15',
    borderRadius: 3,
    marginBottom: 8,
  },
  yellowCableBent: {
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  cableAlertTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cableAlertText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  ontRearBox: {
    width: 96,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  ontRearTitle: {
    color: '#E5E7EB',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4,
  },
  ponPortSocket: {
    backgroundColor: '#064E3B',
    padding: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  greenScConnector: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ponPortText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  clickBadge: {
    color: '#FDE047',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  instructionStepBox: {
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
  },
  instructionStepText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '800',
    color: '#92400E',
  },
  expandDiagramBtn: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  expandDiagramBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#DA291C',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    borderWidth: 1,
    marginBottom: 4,
  },
  liveMeterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  liveMeterValue: {
    fontSize: 16,
    fontWeight: '800',
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DA291C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepCircleText: {
    color: '#FFFFFF',
    fontWeight: '800',
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
