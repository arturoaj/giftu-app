import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIdioma } from '../../app/IdiomaContext';
import { auth, db } from '../../firebaseConfig';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { t, idioma } = useIdioma();

  const handleRegistro = async () => {
    if (!nombre.trim()) {
      Alert.alert(t.error, t.ingresaNombre);
      return;
    }
    if (!email.trim()) {
      Alert.alert(t.error, t.ingresaCorreo);
      return;
    }
    if (password.length < 6) {
      Alert.alert(t.error, t.contrasenaMinimo);
      return;
    }
    if (password !== confirmar) {
      Alert.alert(t.error, t.contrasenasNoCoinciden);
      return;
    }
    setCargando(true);
    try {
      const resultado = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(resultado.user, { displayName: nombre.trim() });
      await setDoc(doc(db, 'usuarios', resultado.user.uid), {
        nombre: nombre.trim(),
        email: email.trim(),
        creadoEn: new Date(),
      });
      Alert.alert(
        t.listo,
        t.cuentaCreada,
        [{ text: t.ok, onPress: () => router.replace('/(tabs)/dashboard') }]
      );
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert(t.error, t.correoEnUso);
      } else if (error.code === 'auth/weak-password') {
        Alert.alert(t.error, t.contrasenaMinimo);
      } else {
        Alert.alert(t.error, idioma === 'es' ? 'No se pudo crear la cuenta' : 'Could not create account');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={styles.botonRegresar}
          >
            <Text style={styles.botonRegresarTexto}>← {t.regresar}</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🎁</Text>
            <Text style={styles.logoTexto}>Giftu</Text>
          </View>
          <Text style={styles.subtitulo}>{t.crearCuenta}</Text>
          <Text style={styles.tagline}>
            {idioma === 'es' ? '✨ Empieza a regalar sin spoilers' : '✨ Start gifting without spoilers'}
          </Text>
        </View>

        <View style={styles.formulario}>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {idioma === 'es' ? '👤 Tu nombre' : '👤 Your name'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={idioma === 'es' ? 'Arturo Gutiérrez' : 'John Smith'}
              placeholderTextColor="#4B5563"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📧 {t.correo}</Text>
            <TextInput
              style={styles.input}
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#4B5563"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 {t.contrasena}</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.inputHint}>
              {idioma === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 {t.confirmarContrasena}</Text>
            <TextInput
              style={[styles.input, confirmar && password !== confirmar && styles.inputError]}
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              value={confirmar}
              onChangeText={setConfirmar}
              secureTextEntry
            />
            {confirmar && password !== confirmar && (
              <Text style={styles.errorTexto}>
                {t.contrasenasNoCoinciden}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDesactivado]}
            onPress={handleRegistro}
            disabled={cargando}
          >
            <LinearGradient
              colors={cargando ? ['#374151', '#374151'] : ['#8B5CF6', '#A855F7']}
              style={styles.botonGradiente}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.botonTexto}>
                {cargando ? (idioma === 'es' ? 'Creando cuenta...' : 'Creating account...') : `🎁 ${t.crearCuenta}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.separador}>
            <View style={styles.separadorLinea} />
            <Text style={styles.separadorTexto}>
              {idioma === 'es' ? '¿ya tienes cuenta?' : 'already have an account?'}
            </Text>
            <View style={styles.separadorLinea} />
          </View>

          <TouchableOpacity
            style={styles.botonLogin}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.botonLoginTexto}>{t.yaTieneCuenta}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
  botonRegresar: { marginBottom: 24, alignSelf: 'flex-start', backgroundColor: '#161B2E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2D3343' },
  botonRegresarTexto: { fontSize: 14, color: '#8B5CF6', fontWeight: '600' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, gap: 10 },
  logoEmoji: { fontSize: 36 },
  logoTexto: { fontSize: 38, fontWeight: 'bold', color: '#F8FAFC' },
  subtitulo: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 4 },
  tagline: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  formulario: { paddingHorizontal: 24 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  input: { backgroundColor: '#161B2E', borderWidth: 1, borderColor: '#2D3343', borderRadius: 14, padding: 16, fontSize: 16, color: '#F8FAFC' },
  inputError: { borderColor: '#EF4444' },
  inputHint: { fontSize: 11, color: '#6B7280', marginTop: 6 },
  errorTexto: { fontSize: 12, color: '#EF4444', marginTop: 6 },
  boton: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 20 },
  botonDesactivado: { opacity: 0.6 },
  botonGradiente: { padding: 18, alignItems: 'center' },
  botonTexto: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  separador: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  separadorLinea: { flex: 1, height: 1, backgroundColor: '#1E2540' },
  separadorTexto: { fontSize: 12, color: '#6B7280' },
  botonLogin: { backgroundColor: '#161B2E', padding: 18, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2D3343' },
  botonLoginTexto: { color: '#8B5CF6', fontSize: 15, fontWeight: '600' },
});