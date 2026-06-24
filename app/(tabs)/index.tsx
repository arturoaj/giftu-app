import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIdioma } from '../../app/IdiomaContext';
import { auth } from '../../firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleOlvideContrasena = async () => {
    if (!email) {
      Alert.alert(
        t.error,
        idioma === 'es' ? 'Ingresa tu correo primero' : 'Enter your email first'
      );
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        '✅',
        idioma === 'es'
          ? `Enviamos un link a ${email} para restablecer tu contraseña`
          : `We sent a reset link to ${email}`
      );
    } catch (error) {
      Alert.alert(t.error, idioma === 'es' ? 'No se pudo enviar el correo' : 'Could not send email');
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
          html, body { height: 100%; background: #0a0818; }

          .input-outer {
            background: rgba(22,27,46,0.95);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 4px 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
            transition: border-color 0.2s;
          }
          .input-outer:focus-within {
            border-color: rgba(139,92,246,0.6);
            box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
          }
          .input-inner {
            flex: 1;
            background: transparent;
            border: none;
            padding: 14px 4px;
            font-size: 15px;
            color: #F8FAFC;
            outline: none;
            font-family: inherit;
            width: 100%;
          }
          .input-inner::placeholder { color: #4B5563; }

          .btn-entrar {
            width: 100%;
            padding: 15px;
            background: linear-gradient(90deg, #8B5CF6, #A855F7);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.2s;
            font-family: inherit;
            margin-bottom: 20px;
          }
          .btn-entrar:hover { opacity: 0.88; transform: translateY(-1px); }

          .btn-google {
            width: 100%;
            padding: 13px;
            border-radius: 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 15px;
            font-weight: 600;
            color: #F8FAFC;
            font-family: inherit;
            transition: background 0.2s, border-color 0.2s;
            margin: 0 auto;
          }
          .btn-google:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }

          .feature-card {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 16px 18px;
            border-radius: 14px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.07);
            margin-bottom: 12px;
            max-width: 400px;
            transition: background 0.2s;
          }
          .feature-card:hover { background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.2); }

          .sep-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }

          .link-purple {
            color: #a855f7;
            cursor: pointer;
            font-weight: 700;
            text-decoration: none;
          }
          .link-purple:hover { text-decoration: underline; }

          .link-forgot {
            color: rgba(168,85,247,0.8);
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            text-decoration: none;
            font-family: inherit;
            background: none;
            border: none;
          }
          .link-forgot:hover { color: #a855f7; text-decoration: underline; }

          .lang-btn {
            padding: 5px 12px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            font-family: inherit;
            transition: all 0.15s;
          }
          .lang-active {
            background: rgba(139,92,246,0.2);
            border: 1px solid #8B5CF6;
            color: #a855f7;
          }
          .lang-idle {
            background: transparent;
            border: 1px solid rgba(255,255,255,0.12);
            color: rgba(255,255,255,0.35);
          }

          .eye-btn {
            background: none; border: none; cursor: pointer;
            color: rgba(255,255,255,0.3); font-size: 16px;
            padding: 0; line-height: 1; flex-shrink: 0;
          }
          .eye-btn:hover { color: rgba(255,255,255,0.7); }
        `}</style>

        <div style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#0a0818',
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        }}>
          {/* Columna izquierda */}
          <div style={{
            width: '45%',
            background: 'linear-gradient(160deg, #1e0a3c 0%, #130820 60%, #0a0818 100%)',
            padding: '56px 52px',
            display: 'flex',
            flexDirection: 'column' as any,
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(120,40,220,0.25) 0%, transparent 70%)',
              top: -100, left: -80, pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', width: 300, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
              bottom: 50, right: -50, pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
              <span style={{ fontSize: 44 }}>🎁</span>
              <span style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Giftu</span>
            </div>

            <h1 style={{ fontSize: 54, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-2px', margin: '0 0 0 0' }}>
              {idioma === 'es' ? 'Regala sin' : 'Gift without'}
            </h1>
            <h1 style={{
              fontSize: 54, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', margin: '0 0 24px 0',
              background: 'linear-gradient(90deg, #8B5CF6, #F59E0B)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {idioma === 'es' ? 'spoilers' : 'spoilers'}
            </h1>

            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 48, lineHeight: 1.7, maxWidth: 320 }}>
              {idioma === 'es'
                ? 'La forma más fácil de coordinar regalos sin arruinar la sorpresa.'
                : 'The easiest way to coordinate gifts without ruining the surprise.'}
            </p>

            {[
              { icon: '🎉', bg: 'rgba(139,92,246,0.2)', title: idioma === 'es' ? 'Listas de regalos' : 'Gift lists', desc: idioma === 'es' ? 'Crea y comparte listas para cualquier ocasión.' : 'Create and share lists for any occasion.' },
              { icon: '🔒', bg: 'rgba(245,158,11,0.15)', title: idioma === 'es' ? 'Sin spoilers' : 'No spoilers', desc: idioma === 'es' ? 'El festejado nunca sabe quién regala qué.' : 'The guest of honor never knows who gives what.' },
              { icon: '👥', bg: 'rgba(16,185,129,0.15)', title: idioma === 'es' ? 'En equipo' : 'Team up', desc: idioma === 'es' ? 'Coordina fácilmente con familia y amigos.' : 'Easily coordinate with family and friends.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha */}
          <div style={{
            flex: 1,
            background: '#0f0d1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '56px 64px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', width: 300, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
              top: -60, right: '10%', pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 48 }}>
                {[['es', 'MX ES'], ['en', 'US EN']].map(([lang, label]) => (
                  <button key={lang} className={idioma === lang ? 'lang-btn lang-active' : 'lang-btn lang-idle'}
                    onClick={() => cambiarIdioma(lang as any)}>{label}</button>
                ))}
              </div>

              <h2 style={{ fontSize: 34, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>
                {idioma === 'es' ? 'Bienvenido de nuevo' : 'Welcome back'}
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 40 }}>
                {idioma === 'es' ? 'Inicia sesión para continuar' : 'Sign in to continue'}
              </p>

              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' as any }}>
                {idioma === 'es' ? 'Correo electrónico' : 'Email address'}
              </label>
              <div className="input-outer">
                <span style={{ fontSize: 16, opacity: 0.4, flexShrink: 0 }}>✉️</span>
                <input className="input-inner" type="email" placeholder="ejemplo@correo.com"
                  value={email} onChange={(e: any) => setEmail(e.target.value)}
                  onKeyDown={(e: any) => e.key === 'Enter' && handleLogin()} />
              </div>

              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' as any }}>
                {idioma === 'es' ? 'Contraseña' : 'Password'}
              </label>
              <div className="input-outer">
                <span style={{ fontSize: 16, opacity: 0.4, flexShrink: 0 }}>🔑</span>
                <input className="input-inner" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={(e: any) => setPassword(e.target.value)}
                  onKeyDown={(e: any) => e.key === 'Enter' && handleLogin()} />
                <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              <div style={{ textAlign: 'right' as any, marginBottom: 28 }}>
                <button className="link-forgot" onClick={handleOlvideContrasena}>
                  {idioma === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot your password?'}
                </button>
              </div>

              <button className="btn-entrar" onClick={handleLogin}>
                {idioma === 'es' ? 'Entrar' : 'Sign in'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div className="sep-line" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' as any }}>
                  {idioma === 'es' ? 'o continúa con' : 'or continue with'}
                </span>
                <div className="sep-line" />
              </div>

              <button className="btn-google">
                <span style={{ fontSize: 18, fontWeight: 800, color: '#4285F4', fontFamily: 'Arial' }}>G</span>
                <span>{idioma === 'es' ? 'Continuar con Google' : 'Continue with Google'}</span>
              </button>

              <p style={{ textAlign: 'center' as any, fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 32 }}>
                {idioma === 'es' ? '¿No tienes cuenta? ' : "Don't have an account? "}
                <a className="link-purple" onClick={() => router.push('/(tabs)/registro')} style={{ fontSize: 14 }}>
                  {idioma === 'es' ? 'Regístrate' : 'Sign up'}
                </a>
              </p>
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
        <TouchableOpacity onPress={handleOlvideContrasena} style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
          <Text style={{ color: '#8B5CF6', fontSize: 13 }}>
            {idioma === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot your password?'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.boton} onPress={handleLogin}>
          <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.botonGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
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