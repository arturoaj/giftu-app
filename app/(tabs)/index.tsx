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
          .input-web { transition: all 0.2s; background: #fff; border: none; border-radius: 10px; padding: 16px 18px; font-size: 15px; color: #111; width: 100%; outline: none; }
          .input-web:focus { box-shadow: 0 0 0 3px rgba(139,92,246,0.3); }
          .input-wrap { background: #1a1a2e; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
          .btn-entrar { width: 100%; padding: 16px; background: linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B); border: none; border-radius: 14px; color: #fff; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-bottom: 20px; }
          .btn-entrar:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(139,92,246,0.4); }
          .btn-google { width: 48px; height: 48px; border-radius: 50%; background: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #4285F4; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.3); margin: 0 auto; }
          .btn-google:hover { transform: scale(1.05); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
          .feature-card { display: flex; align-items: center; gap: 16px; padding: 18px 20px; border-radius: 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 12px; transition: all 0.2s; }
          .feature-card:hover { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.25); }
          .feature-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
          .sep-line { flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
          .link-purple { color: #8B5CF6; cursor: pointer; text-decoration: none; font-weight: 600; }
          .link-purple:hover { text-decoration: underline; }
        `}</style>

        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0f', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

          {/* Columna izquierda */}
          <div style={{ flex: 1, background: 'linear-gradient(160deg, #1a0a2e 0%, #0f0a1e 50%, #0a0a0f 100%)', padding: '60px 56px', display: 'flex', flexDirection: 'column' as any, justifyContent: 'center' }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
              <span style={{ fontSize: 48 }}>🎁</span>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-1px' }}>Giftu</span>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 56, fontWeight: 900, color: '#F8FAFC', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 0 }}>
                Regala sin
              </h1>
              <h1 style={{ fontSize: 56, fontWeight: 900, background: 'linear-gradient(90deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1, letterSpacing: '-2px' }}>
                spoilers
              </h1>
            </div>

            <p style={{ fontSize: 16, color: '#94A3B8', marginBottom: 44, lineHeight: 1.6, maxWidth: 360 }}>
              La forma más fácil de coordinar regalos sin arruinar la sorpresa.
            </p>

            {/* Features */}
            {[
              { icon: '🎉', bg: '#2d1b69', title: 'Listas de regalos', desc: 'Crea y comparte listas para cualquier ocasión.' },
              { icon: '🔒', bg: '#3d1a00', title: 'Sin spoilers', desc: 'El festejado nunca sabe quién regala qué.' },
              { icon: '👥', bg: '#0d2d1a', title: 'En equipo', desc: 'Coordina fácilmente con familia y amigos.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon" style={{ backgroundColor: f.bg }}>
                  <span>{f.icon}</span>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha */}
          <div style={{ width: 560, backgroundColor: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 56px' }}>
            <div style={{ width: '100%', maxWidth: 420 }}>

              {/* Selector idioma */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 40 }}>
                {[['es', '🇲🇽 ES'], ['en', '🇺🇸 EN']].map(([lang, label]) => (
                  <button key={lang} onClick={() => cambiarIdioma(lang as any)} style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    border: idioma === lang ? '1px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: idioma === lang ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: idioma === lang ? '#8B5CF6' : '#6B7280',
                  }}>{label}</button>
                ))}
              </div>

              <h2 style={{ fontSize: 32, fontWeight: 800, color: '#F8FAFC', marginBottom: 8, letterSpacing: '-0.5px' }}>Bienvenido de nuevo</h2>
              <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 36 }}>Inicia sesión para continuar</p>

              {/* Email */}
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 8, letterSpacing: '1px' }}>CORREO ELECTRÓNICO</label>
              <div className="input-wrap" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 16 }}>✉️</span>
                <input className="input-web" type="email" placeholder="ejemplo@correo.com" value={email} onChange={(e: any) => setEmail(e.target.value)} />
              </div>

              {/* Password */}
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 8, letterSpacing: '1px' }}>CONTRASEÑA</label>
              <div className="input-wrap" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>🔑</span>
                <input className="input-web" type="password" placeholder="••••••••" value={password} onChange={(e: any) => setPassword(e.target.value)} />
              </div>

              <div style={{ textAlign: 'right' as any, marginBottom: 28 }}>
                <a className="link-purple" style={{ fontSize: 13 }}>¿Olvidaste tu contraseña?</a>
              </div>

              <button className="btn-entrar" onClick={handleLogin}>{t.entrar}</button>

              {/* Separador */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div className="sep-line" />
                <span style={{ fontSize: 13, color: '#4B5563', whiteSpace: 'nowrap' as any }}>o continúa con</span>
                <div className="sep-line" />
              </div>

              {/* Google */}
              <button className="btn-google">G</button>

              {/* Registro */}
              <p style={{ textAlign: 'center' as any, marginTop: 32, fontSize: 14, color: '#64748B' }}>
                ¿No tienes cuenta?{' '}
                <a className="link-purple" onClick={() => router.push('/(tabs)/registro')} style={{ fontSize: 14 }}>Regístrate</a>
              </p>

            </div>
          </div>
        </div>
      </>
    );
  }

  // Versión móvil
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