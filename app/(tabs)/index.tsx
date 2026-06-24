import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIdioma } from '../../app/IdiomaContext';
import { auth } from '../../firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(true);
  const router = useRouter();
  const { t, idioma, cambiarIdioma } = useIdioma();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      if (usuario) {
        router.replace('/(tabs)/dashboard');
      } else {
        setEmail('');
        setPassword('');
        setCargando(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t.error, t.errorCampos);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert(t.error, t.errorCredenciales);
    }
  };

  if (cargando) {
    return (
      <View style={styles.cargando}>
        <Text style={styles.logoTexto}>🎁 Giftu</Text>
        <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      <View style={styles.header}>
        <View style={styles.selectorIdioma}>
          <TouchableOpacity
            style={[styles.btnIdioma, idioma === 'es' && styles.btnIdiomaActivo]}
            onPress={() => cambiarIdioma('es')}
          >
            <Text style={[styles.btnIdiomaTexto, idioma === 'es' && styles.btnIdiomaTextoActivo]}>🇲🇽 ES</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnIdioma, idioma === 'en' && styles.btnIdiomaActivo]}
            onPress={() => cambiarIdioma('en')}
          >
            <Text style={[styles.btnIdiomaTexto, idioma === 'en' && styles.btnIdiomaTextoActivo]}>🇺🇸 EN</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🎁</Text>
          <Text style={styles.logoTexto}>Giftu</Text>
        </View>

        <Text style={styles.tagline}>
          {idioma === 'es' ? '✨ Regala sin spoilers' : '✨ Gift without spoilers'}
        </Text>
      </View>

      <View style={styles.formulario}>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t.correo}</Text>
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
          <Text style={styles.inputLabel}>{t.contrasena}</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#4B5563"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.boton} onPress={handleLogin}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899', '#F59E0B']}
            style={styles.botonGradiente}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.botonTexto}>{t.entrar}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.separador}>
          <View style={styles.separadorLinea} />
          <Text style={styles.separadorTexto}>
            {idioma === 'es' ? '¿nuevo en Giftu?' : 'new to Giftu?'}
          </Text>
          <View style={styles.separadorLinea} />
        </View>

        <TouchableOpacity
          style={styles.botonRegistro}
          onPress={() => router.push('/(tabs)/registro')}
        >
          <Text style={styles.botonRegistroTexto}>{t.noTieneCuenta}</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' },
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { paddingTop: 80, paddingBottom: 24, paddingHorizontal: 24 },
  selectorIdioma: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 28, gap: 8 },
  btnIdioma: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#2D3343' },
  btnIdiomaActivo: { backgroundColor: '#161B2E', borderColor: '#8B5CF6' },
  btnIdiomaTexto: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  btnIdiomaTextoActivo: { color: '#8B5CF6' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, gap: 10 },
  logoEmoji: { fontSize: 38 },
  logoTexto: { fontSize: 42, fontWeight: 'bold', color: '#F8FAFC' },
  tagline: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginTop: 4, marginBottom: 8 },
  formulario: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  input: { backgroundColor: '#161B2E', borderWidth: 1, borderColor: '#2D3343', borderRadius: 14, padding: 16, fontSize: 16, color: '#F8FAFC' },
  boton: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 24 },
  botonGradiente: { padding: 18, alignItems: 'center' },
  botonTexto: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  separador: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  separadorLinea: { flex: 1, height: 1, backgroundColor: '#1E2540' },
  separadorTexto: { fontSize: 12, color: '#6B7280' },
  botonRegistro: { backgroundColor: '#161B2E', padding: 18, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2D3343' },
  botonRegistroTexto: { color: '#8B5CF6', fontSize: 15, fontWeight: '600' },
});