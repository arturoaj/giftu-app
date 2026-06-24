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

          .input-web {
            background: transparent;
            border: none;
            padding: 0;
            font-size: 14px;
            color: rgba(255,255,255,0.6);
            width: 100%;
            outline: none;
            font-family: inherit;
          }
          .input-web::placeholder { color: rgba(255,255,255,0.25); }

          .input-wrap {
            background: rgba(255,255,255,0.06);
            border: 0.5px solid rgba(255,255,255,0.12);
            border-radius: 10px;
            padding: 11px 14px;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: border-color 0.2s;
          }
          .input-wrap:focus-within {
            border-color: rgba(139,92,246,0.5);
            background: rgba(139,92,246,0.06);
          }

          .btn-entrar {
            width: 100%;
            padding: 14px;
            background: linear-gradient(90deg, #c84bff, #ff6b35);
            border: none;
            border-radius: 10px;
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.2s;
            font-family: inherit;
            letter-spacing: 0.2px;
          }
          .btn-entrar:hover { opacity: 0.88; transform: translateY(-1px); }
          .btn-entrar:active { transform: scale(0.99); }

          .btn-google {
            width: 100%;
            padding: 11px;
            border: 0.5px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            background: rgba(255,255,255,0.04);
            color: rgba(255,255,255,0.7);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-family: inherit;
            transition: background 0.2s;
          }
          .btn-google:hover { background: rgba(255,255,255,0.08); }

          .g-logo {
            width: 20px; height: 20px;
            background: #fff;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 700; color: #4285F4;
            flex-shrink: 0;
          }

          .feature-card {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 18px;
            border-radius: 12px;
            background: rgba(255,255,255,0.04);
            border: 0.5px solid rgba(255,255,255,0.08);
            margin-bottom: 10px;
            transition: background 0.2s, border-color 0.2s;
          }
          .feature-card:hover {
            background: rgba(139,92,246,0.07);
            border-color: rgba(139,92,246,0.2);
          }

          .sep-line { flex: 1; height: 0.5px; background: rgba(255,255,255,0.1); }

          .link-purple {
            color: #a855f7;
            cursor: pointer;
            text-decoration: none;
            font-weight: 600;
          }
          .link-purple:hover { text-decoration: underline; }

          .lang-btn {
            padding: 4px 12px;
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
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.3);
          }

          .eye-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: rgba(255,255,255,0.3);
            font-size: 16px;
            padding: 0;
            line-height: 1;
            flex-shrink: 0;
          }
          .eye-btn:hover { color: rgba(255,255,255,0.6); }
        `}</style>

        <div style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#0a0818',
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glows */}
          <div style={{
            position: 'absolute', width: 480, height: 480, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(100,40,200,0.30) 0%, transparent 70%)',
            top: -100, left: -80, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220,70,20,0.20) 0%, transparent 70%)',
            bottom: -80, left: 320, pointerEvents: 'none',
          }} />

          {/* Columna izquierda */}
          <div style={{
            flex: 1,
            padding: '52px 52px',
            display: 'flex',
            flexDirection: 'column' as any,
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <span style={{ fontSize: 40, filter: 'drop-shadow(0 0 10px rgba(255,150,40,0.45))' }}>🎁</span>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Giftu</span>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: 16 }}>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-2px', margin: 0 }}>
                Regala sin
              </h1>
              <h1 style={{
                fontSize: 52, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', margin: 0,
                background: 'linear-gradient(90deg, #c84bff, #ff6b35)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                spoilers
              </h1>
            </div>

            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 40, lineHeight: 1.65, maxWidth: 340 }}>
              La forma más fácil de coordinar regalos sin arruinar la sorpresa.
            </p>

            {/* Features */}
            {[
              { icon: '🎉', bg: 'rgba(139,92,246,0.15)', title: 'Listas de regalos', desc: 'Crea y comparte listas para cualquier ocasión.' },
              { icon: '🔒', bg: 'rgba(255,107,53,0.15)', title: 'Sin spoilers', desc: 'El festejado nunca sabe quién regala qué.' },
              { icon: '👥', bg: 'rgba(52,200,140,0.15)', title: 'En equipo', desc: 'Coordina fácilmente con familia y amigos.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha */}
          <div style={{
            width: 480,
            background: 'rgba(255,255,255,0.025)',
            borderLeft: '0.5px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '52px 44px',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{ width: '100%', maxWidth: 380 }}>

              {/* Selector idioma */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 36 }}>
                {[['es', 'MX ES'], ['en', 'US EN']].map(([lang, label]) => (
                  <button
                    key={lang}
                    className={idioma === lang ? 'lang-btn lang-active' : 'lang-btn lang-idle'}
                    onClick={() => cambiarIdioma(lang as any)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.3px' }}>
                Bienvenido de nuevo
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 28 }}>
                Inicia sesión para continuar
              </p>

              {/* Email */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 7, textTransform: 'uppercase' as any }}>
                  Correo electrónico
                </label>
                <div className="input-wrap">
                  <span style={{ fontSize: 15, opacity: 0.45 }}>✉️</span>
                  <input
                    className="input-web"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    onKeyDown={(e: any) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', marginBottom: 7, textTransform: 'uppercase' as any }}>
                  Contraseña
                </label>
                <div className="input-wrap">
                  <span style={{ fontSize: 15, opacity: 0.45 }}>🔑</span>
                  <input
                    className="input-web"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    onKeyDown={(e: any) => e.key === 'Enter' && handleLogin()}
                  />
                  <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Olvidaste contraseña */}
              <div style={{ textAlign: 'right' as any, marginBottom: 24 }}>
                <a className="link-purple" style={{ fontSize: 12 }}>¿Olvidaste tu contraseña?</a>
              </div>

              {/* Entrar */}
              <button className="btn-entrar" onClick={handleLogin} style={{ marginBottom: 20 }}>
                {t.entrar}
              </button>

              {/* Separador */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="sep-line" />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' as any }}>o continúa con</span>
                <div className="sep-line" />
              </div>

              {/* Google */}
              <button className="btn-google" style={{ marginBottom: 28 }}>
                <div className="g-logo">G</div>
                Continuar con Google
              </button>

              {/* Registro */}
              <p style={{ textAlign: 'center' as any, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                ¿No tienes cuenta?{' '}
                <a className="link-purple" onClick={() => router.push('/(tabs)/registro')} style={{ fontSize: 13 }}>
                  Regístrate
                </a>
              </p>

            </div>
          </div>
        </div>
      </>
    );
  }

  // Versión móvil (sin cambios)
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
