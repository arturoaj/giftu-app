import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.page as any}>
        <div style={webStyles.left as any}>
          <div style={webStyles.leftContent as any}>
            <div style={webStyles.logo as any}>🎁</div>
            <h1 style={webStyles.brand as any}>Giftu</h1>
            <p style={webStyles.tagline as any}>Regala sin spoilers</p>
            <div style={webStyles.features as any}>
              <div style={webStyles.feature as any}>
                <span style={webStyles.featureIcon as any}>🎉</span>
                <span style={webStyles.featureText as any}>Crea listas de regalos</span>
              </div>
              <div style={webStyles.feature as any}>
                <span style={webStyles.featureIcon as any}>🔒</span>
                <span style={webStyles.featureText as any}>Sin spoilers para el festejado</span>
              </div>
              <div style={webStyles.feature as any}>
                <span style={webStyles.featureIcon as any}>👥</span>
                <span style={webStyles.featureText as any}>Coordina con familia y amigos</span>
              </div>
            </div>
          </div>
        </div>

        <div style={webStyles.right as any}>
          <div style={webStyles.card as any}>
            <div style={webStyles.selectorIdioma as any}>
              <button
                style={idioma === 'es' ? webStyles.btnIdiomaActivo as any : webStyles.btnIdioma as any}
                onClick={() => cambiarIdioma('es')}
              >🇲🇽 ES</button>
              <button
                style={idioma === 'en' ? webStyles.btnIdiomaActivo as any : webStyles.btnIdioma as any}
                onClick={() => cambiarIdioma('en')}
              >🇺🇸 EN</button>
            </div>

            <h2 style={webStyles.cardTitle as any}>Bienvenido de nuevo</h2>
            <p style={webStyles.cardSub as any}>Inicia sesión para continuar</p>

            <div style={webStyles.inputGroup as any}>
              <label style={webStyles.label as any}>{t.correo}</label>
              <input
                style={webStyles.input as any}
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
              />
            </div>

            <div style={webStyles.inputGroup as any}>
              <label style={webStyles.label as any}>{t.contrasena}</label>
              <input
                style={webStyles.input as any}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
              />
            </div>

            <button style={webStyles.btnEntrar as any} onClick={handleLogin}>
              {t.entrar}
            </button>

            <div style={webStyles.separador as any}>
              <span style={webStyles.separadorTexto as any}>
                {idioma === 'es' ? '¿nuevo en Giftu?' : 'new to Giftu?'}
              </span>
            </div>

            <button
              style={webStyles.btnRegistro as any}
              onClick={() => router.push('/(tabs)/registro')}
            >
              {t.noTieneCuenta}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <View style={styles.header}>
        <View style={styles.selectorIdioma}>
          <TouchableOpacity style={[styles.btnIdioma, idioma === 'es' && styles.btnIdiomaActivo]} onPress={() => cambiarIdioma('es')}>
            <Text style={[styles.btnIdiomaTexto, idioma === 'es' && styles.btnIdiomaTextoActivo]}>🇲🇽 ES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnIdioma, idioma === 'en' && styles.btnIdiomaActivo]} onPress={() => cambiarIdioma('en')}>
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
          <TextInput style={styles.input} placeholder="ejemplo@correo.com" placeholderTextColor="#4B5563" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t.contrasena}</Text>
          <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#4B5563" value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        <TouchableOpacity style={styles.boton} onPress={handleLogin}>
          <LinearGradient colors={['#8B5CF6', '#EC4899', '#F59E0B']} style={styles.botonGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.botonTexto}>{t.entrar}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.separador}>
          <View style={styles.separadorLinea} />
          <Text style={styles.separadorTexto}>{idioma === 'es' ? '¿nuevo en Giftu?' : 'new to Giftu?'}</Text>
          <View style={styles.separadorLinea} />
        </View>
        <TouchableOpacity style={styles.botonRegistro} onPress={() => router.push('/(tabs)/registro')}>
          <Text style={styles.botonRegistroTexto}>{t.noTieneCuenta}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const webStyles = {
  page: { display: 'flex', flexDirection: 'row', minHeight: '100vh', backgroundColor: '#0D0D0D' },
  left: { flex: 1, background: 'linear-gradient(135deg, #1a0533 0%, #0D0D0D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
  leftContent: { maxWidth: '400px' },
  logo: { fontSize: '72px', marginBottom: '16px' },
  brand: { fontSize: '56px', fontWeight: '800', color: '#F8FAFC', margin: '0 0 12px 0', fontFamily: 'system-ui' },
  tagline: { fontSize: '20px', color: '#8B5CF6', marginBottom: '48px', fontFamily: 'system-ui' },
  features: { display: 'flex', flexDirection: 'column', gap: '20px' },
  feature: { display: 'flex', alignItems: 'center', gap: '16px' },
  featureIcon: { fontSize: '28px' },
  featureText: { fontSize: '16px', color: '#94A3B8', fontFamily: 'system-ui' },
  right: { width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backgroundColor: '#0D0D0D' },
  card: { width: '100%', maxWidth: '400px' },
  selectorIdioma: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '32px' },
  btnIdioma: { padding: '6px 14px', borderRadius: '20px', border: '1px solid #2D3343', backgroundColor: 'transparent', color: '#6B7280', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  btnIdiomaActivo: { padding: '6px 14px', borderRadius: '20px', border: '1px solid #8B5CF6', backgroundColor: '#161B2E', color: '#8B5CF6', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  cardTitle: { fontSize: '28px', fontWeight: '700', color: '#F8FAFC', margin: '0 0 8px 0', fontFamily: 'system-ui' },
  cardSub: { fontSize: '15px', color: '#6B7280', margin: '0 0 32px 0', fontFamily: 'system-ui' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#94A3B8', marginBottom: '8px', fontFamily: 'system-ui' },
  input: { width: '100%', padding: '14px 16px', backgroundColor: '#161B2E', border: '1px solid #2D3343', borderRadius: '12px', fontSize: '16px', color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' },
  btnEntrar: { width: '100%', padding: '16px', background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '17px', fontWeight: '700', cursor: 'pointer', marginBottom: '24px', fontFamily: 'system-ui' },
  separador: { textAlign: 'center', marginBottom: '16px' },
  separadorTexto: { fontSize: '12px', color: '#6B7280', fontFamily: 'system-ui' },
  btnRegistro: { width: '100%', padding: '16px', backgroundColor: '#161B2E', border: '1px solid #2D3343', borderRadius: '12px', color: '#8B5CF6', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'system-ui' },
};

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