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
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; background: #0a0a0f; }
          @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-60px) scale(1.15); } }
          @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,40px) scale(0.9); } }
          @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(50px,30px) scale(1.1); } }
          .input-field { transition: all 0.2s; }
          .input-field:focus { outline: none; border-color: #8B5CF6 !important; box-shadow: 0 0 0 3px rgba(139,92,246,0.25) !important; }
          .btn-entrar { transition: all 0.2s; }
          .btn-entrar:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 12px 35px rgba(139,92,246,0.5) !important; }
          .btn-registro { transition: all 0.2s; }
          .btn-registro:hover { border-color: #8B5CF6 !important; color: #8B5CF6 !important; background: rgba(139,92,246,0.08) !important; }
          .feature-card { transition: all 0.2s; }
          .feature-card:hover { border-color: rgba(139,92,246,0.3) !important; background: rgba(139,92,246,0.06) !important; transform: translateX(4px); }
        `}</style>

        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f', fontFamily: "'Segoe UI', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>

          {/* Orbes animados de fondo */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', top: '-200px', left: '-150px', animation: 'float1 10s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', bottom: '-100px', left: '35%', animation: 'float2 13s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', top: '15%', right: '-80px', animation: 'float3 15s ease-in-out infinite' }} />
          </div>

          {/* Columna izquierda */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 60px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 540 }}>

              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <span style={{ fontSize: 72 }}>🎁</span>
                <h1 style={{ fontSize: 72, fontWeight: 900, color: '#F8FAFC', lineHeight: 1, letterSpacing: '-3px', fontFamily: 'inherit' }}>Giftu</h1>
              </div>

              <p style={{ fontSize: 24, color: '#8B5CF6', marginBottom: 56, fontWeight: 600, letterSpacing: '-0.5px' }}>✨ Regala sin spoilers</p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column' as any, gap: 16 }}>
                {[
                  { icon: '🎉', title: 'Listas de regalos', desc: 'Crea y comparte listas para cualquier ocasión especial' },
                  { icon: '🔒', title: 'Sin spoilers', desc: 'El festejado nunca sabe quién regala qué' },
                  { icon: '👥', title: 'En equipo', desc: 'Coordina fácilmente con familia y amigos' },
                ].map((f, i) => (
                  <div key={i} className="feature-card" style={{
                    display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px',
                    borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)', cursor: 'default',
                  }}>
                    <span style={{ fontSize: 32, minWidth: 40, textAlign: 'center' as any }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha — glassmorphism */}
          <div style={{ width: 560, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '100%', maxWidth: 460, padding: '48px 44px',
              backgroundColor: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 28,
              boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)',
            }}>

              {/* Selector idioma */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 36 }}>
                {[['es', '🇲🇽 ES'], ['en', '🇺🇸 EN']].map(([lang, label]) => (
                  <button key={lang} onClick={() => cambiarIdioma(lang as any)} style={{
                    padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    border: idioma === lang ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: idioma === lang ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: idioma === lang ? '#8B5CF6' : '#6B7280', transition: 'all 0.2s',
                  }}>{label}</button>
                ))}
              </div>

              <h2 style={{ fontSize: 30, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.5px' }}>Bienvenido de nuevo</h2>
              <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 36 }}>Inicia sesión para continuar</p>

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.correo}</label>
                <input className="input-field" type="email" placeholder="ejemplo@correo.com" value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '15px 18px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, fontSize: 15, color: '#F8FAFC' }} />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.contrasena}</label>
                <input className="input-field" type="password" placeholder="••••••••" value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '15px 18px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, fontSize: 15, color: '#F8FAFC' }} />
              </div>

              {/* Botón entrar */}
              <button className="btn-entrar" onClick={handleLogin} style={{
                width: '100%', padding: '17px', background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)',
                border: 'none', borderRadius: 14, color: '#fff', fontSize: 17, fontWeight: 700,
                cursor: 'pointer', marginBottom: 24, boxShadow: '0 6px 20px rgba(139,92,246,0.35)',
              }}>{t.entrar}</button>

              <div style={{ textAlign: 'center' as any, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#4B5563' }}>{idioma === 'es' ? '¿nuevo en Giftu?' : 'new to Giftu?'}</span>
              </div>

              <button className="btn-registro" onClick={() => router.push('/(tabs)/registro')} style={{
                width: '100%', padding: '15px', backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>{t.noTieneCuenta}</button>

            </div>
          </div>
        </div>
      </>
    );
  }

  // Versión móvil (Android/iOS) — sin cambios
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