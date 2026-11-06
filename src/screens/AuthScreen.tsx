import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNetworkSimulation } from '../context/NetworkSimulationContext';

const POPULAR_DISTRICTS = [
  'San Isidro',
  'Miraflores',
  'Surco',
  'San Borja',
  'La Molina',
  'Jesús María',
];

export const AuthScreen: React.FC = () => {
  const { loginUser, registerUser } = useNetworkSimulation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [emailOrDni, setEmailOrDni] = useState('');
  const [district, setDistrict] = useState('San Isidro');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = () => {
    setErrorMsg('');

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Por favor ingresa tu nombre para personalizar tu atención.');
        return;
      }
      if (!emailOrDni.trim()) {
        setErrorMsg('Ingresa tu DNI o correo electrónico.');
        return;
      }
      registerUser({
        fullName: fullName.trim(),
        emailOrDni: emailOrDni.trim(),
        district: district.trim() || 'San Isidro',
        password,
      });
      return;
    }

    // Modo Iniciar Sesión
    if (!emailOrDni.trim() && !fullName.trim()) {
      setErrorMsg('Ingresa tu nombre o correo electrónico para continuar.');
      return;
    }

    loginUser({
      emailOrDni: emailOrDni.trim() || fullName.trim(),
      password,
      fallbackName: fullName.trim(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera Roja Corporativa Mi Claro */}
        <View style={styles.heroHeader}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/claro-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>Mi Claro Hogar</Text>
          <Text style={styles.heroSubtitle}>
            Soporte inteligente conectado a tu internet en casa
          </Text>
        </View>

        {/* Tarjeta Principal de Autenticación */}
        <View style={styles.authCard}>
          {/* Selector de Pestaña: Iniciar sesión / Crear cuenta */}
          <View style={styles.tabSwitchRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                mode === 'login' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setMode('login');
                setErrorMsg('');
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  mode === 'login' && styles.tabButtonTextActive,
                ]}
              >
                Iniciar sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                mode === 'register' && styles.tabButtonActive,
              ]}
              onPress={() => {
                setMode('register');
                setErrorMsg('');
              }}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  mode === 'register' && styles.tabButtonTextActive,
                ]}
              >
                Crear cuenta
              </Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Campo de Nombre (Visible en ambos modos para personalizar el saludo) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>
              {mode === 'register' ? 'Nombre y apellido' : 'Tu nombre'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder={
                mode === 'register' ? 'Ej. María Gómez' : 'Ej. María'
              }
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Campo DNI o Correo */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>DNI o correo electrónico</Text>
            <TextInput
              style={styles.textInput}
              value={emailOrDni}
              onChangeText={setEmailOrDni}
              placeholder="Ej. 74829103 o correo@ejemplo.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Selector de Distrito (en Crear cuenta) */}
          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Distrito de tu hogar</Text>
              <View style={styles.districtsWrap}>
                {POPULAR_DISTRICTS.map((d) => {
                  const selected = district === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.districtChip,
                        selected && styles.districtChipSelected,
                      ]}
                      onPress={() => setDistrict(d)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.districtChipText,
                          selected && styles.districtChipTextSelected,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Campo Contraseña */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Contraseña</Text>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              onSubmitEditing={handleSubmit}
            />
          </View>

          {/* Botón Principal */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>
              {mode === 'login' ? 'Ingresar a Mi Claro' : 'Crear mi cuenta'}
            </Text>
          </TouchableOpacity>

          {/* Enlace para alternar entre login y registro */}
          <TouchableOpacity
            style={styles.switchLinkBtn}
            onPress={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMsg('');
            }}
          >
            <Text style={styles.switchLinkText}>
              {mode === 'login'
                ? '¿Aún no tienes cuenta? Regístrate aquí'
                : '¿Ya tienes una cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pie informativo */}
        <View style={styles.footerInfo}>
          <Image
            source={require('../../assets/claro-circle-logo.png')}
            style={styles.footerMiniLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerText}>
            América Móvil Perú S.A.C. · Todos los derechos reservados
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  heroHeader: {
    backgroundColor: '#DA291C',
    paddingTop: Platform.OS === 'android' ? 48 : 36,
    paddingBottom: 42,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: 105,
    height: 36,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#FEE2E2',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: -24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabSwitchRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#DA291C',
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1F2937',
  },
  districtsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  districtChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  districtChipSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DA291C',
  },
  districtChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  districtChipTextSelected: {
    color: '#DA291C',
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: '#DA291C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#DA291C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  switchLinkBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLinkText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    paddingHorizontal: 16,
  },
  footerMiniLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
