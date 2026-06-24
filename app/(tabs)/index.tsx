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
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPass, setFocusPass] = useState(false);
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
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0a0a0f; }
          @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.1); } }
          @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,30px) scale(0.95); } }
          @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,20px) scale(1.05); } }
          .input-field:focus { outline: none; border-color: #8B5CF6 !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.2) !important; }
          .btn-entrar:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 30px rgba(139,92,246,0.4) !important; }
          .btn-registro:hover { border-color: #8B5CF6 !important; color: #8B5CF6 !important; }
          .btn-idioma:hover { border-color: #8B5CF6 !important; }
        `}</style>
        <div style={{
          display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f',
          fontFamily: "'Segoe UI', system-ui, sans-serif", position: 'relative', overflow: 'hidden'
        }}>
          {/* Fondo animado */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', top: '-100px', left: '-100px', animation: 'float1 8s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', bottom: '-50px', left: '30%', animation: 'float2 10s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', top: '20%', right: '-50px', animation: 'float3 12s ease-in-out infinite' }} />
          </div>

          {/* Columna izquierda */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 480 }}>
              <div style={{ fontSize: 80, marginBottom: 24 }}>🎁</div>
              <h1 style={{ fontSize: 64, fontWeight: 900, color: '#F8FAFC', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-2px' }}>Giftu</h1>
              <p style={{ fontSize: 22, color: '#8B5CF6', marginBottom: 48, fontWeight: 600 }}>✨ Regala sin spoilers</p>
              <div style={{ display: 'flex', flexDirection: 'column' as any, gap: 24 }}>
                {[
                  { icon: '🎉', text: 'Crea listas de regalos para cualquier ocasión' },
                  { icon: '🔒', text: 'El festejado nunca sabe quién regala qué' },
                  { icon: '👥', text: 'Coordina con toda la familia y amigos' },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 28 }}>{f.icon}</span>
                    <span style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.4 }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha — card glassmorphism */}
          <div style={{ width: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '100%', maxWidth: 440, padding: '40px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}>
              {/* Selector idioma */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 32 }}>
                {[['es', '🇲🇽 ES'], ['en', '🇺🇸 EN']].map(([lang, label]) => (
                  <button key={lang} className="btn-idioma" onClick={() => cambiarIdioma(lang as any)} style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                    border: idioma === lang ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: idioma === lang ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: idioma === lang ? '#8B5CF6' : '#6B7280',
                  }}>{label}</button>
                ))}
              </div>

              <h2 style={{ fontSize: 28, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>Bienvenido de nuevo</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Inicia sesión para continuar</p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.correo}</label>
                <input className="input-field" type="email" placeholder="ejemplo@correo.com" value={email} onChange={(e: any) => setEmail(e.target.value)} style={{
                  width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, fontSize: 15, color: '#F8FAFC', transition: 'all 0.2s',
                }} />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.contrasena}</label>
                <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={(e: any) => setPassword(e.target.value)} style={{
                  width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, fontSize: 15, color: '#F8FAFC', transition: 'all 0.2s',
                }} />
              </div>

              <button className="btn-entrar" onClick={handleLogin} style={{
                width: '100%', padding: '16px', background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)',
                border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                marginBottom: 20, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
              }}>{t.entrar}</button>

              <div style={{ textAlign: 'center' as any, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#4B5563' }}>{idioma === 'es' ? '¿nuevo en Giftu?' : 'new to Giftu?'}</span>
              </div>

              <button className="btn-registro" onClick={() => router.push('/(tabs)/registro')} style={{
                width: '100%', padding: '14px', backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#94A3B8',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}>{t.noTieneCuenta}</button>
            </div>
          </div>
        </div>
      </>
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
        <Text style={styles.tagline}>{idioma === 'es' ? '✨ Regala sin spoilers' : '✨ Gift without spoilers'}</Text>
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