import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  ScenarioId,
  useNetworkSimulation,
} from '../context/NetworkSimulationContext';

interface ScenarioOption {
  id: ScenarioId;
  title: string;
  subtitle: string;
  accentColor: string;
}

const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    id: 'A',
    title: 'Wi-Fi con interferencia vecina',
    subtitle: 'Tu internet llega bien, pero otras redes cercanas vuelven lenta tu señal en casa.',
    accentColor: '#F59E0B',
  },
  {
    id: 'B',
    title: 'Cable amarillo flojo o doblado',
    subtitle: 'La señal entra débil porque el cable detrás del router necesita ajustarse.',
    accentColor: '#EA580C',
  },
  {
    id: 'C',
    title: 'Avería externa en tu cuadra',
    subtitle: 'Problema en el cableado de la calle con constancia de atención automática.',
    accentColor: '#DA291C',
  },
  {
    id: 'D',
    title: 'Todo funcionando excelente',
    subtitle: 'Conexión estable y rápida en todos los equipos de tu hogar.',
    accentColor: '#10B981',
  },
];

export const DemoScenarioDrawer: React.FC = () => {
  const {
    isDemoDrawerOpen,
    setDemoDrawerOpen,
    activeScenario,
    selectScenario,
  } = useNetworkSimulation();

  return (
    <Modal
      visible={isDemoDrawerOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setDemoDrawerOpen(false)}
    >
      <View style={styles.backdrop}>
        <View style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <View style={styles.headerTextCol}>
              <Text style={styles.drawerTitle}>Diagnóstico de mi hogar</Text>
              <Text style={styles.drawerSubtitle}>
                Selecciona una situación para revisar cómo te ayuda el asistente
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setDemoDrawerOpen(false)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.drawerScroll}
            showsVerticalScrollIndicator={false}
          >
            {SCENARIO_OPTIONS.map((item) => {
              const isSelected = activeScenario === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.scenarioCard,
                    isSelected && {
                      borderColor: item.accentColor,
                      borderWidth: 2,
                      backgroundColor: '#FFFDFB',
                    },
                  ]}
                  onPress={() => selectScenario(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.scenarioTopRow}>
                    <View style={styles.titleRow}>
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: item.accentColor },
                        ]}
                      />
                      <Text style={styles.scenarioTitle}>{item.title}</Text>
                    </View>
                    {isSelected ? (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Seleccionado</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.scenarioDesc}>{item.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  drawerContainer: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  drawerHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTextCol: {
    flex: 1,
    marginRight: 10,
  },
  drawerTitle: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '800',
  },
  drawerSubtitle: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerScroll: {
    padding: 16,
  },
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scenarioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  scenarioTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  activePill: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activePillText: {
    color: '#DA291C',
    fontSize: 10,
    fontWeight: '800',
  },
  scenarioDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginLeft: 18,
  },
});
