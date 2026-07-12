import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { useIdioma } from '../IdiomaContext';
import { registroEstado } from '../registroEstado';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { t, idioma } = useIdioma();

  const mostrarAlerta = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const handleRegistro = async () => {
    if (!nombre.trim()) {
      mostrarAlerta(t.error, t.ingresaNombre);
      return;
    }
    if (!email.trim()) {
      mostrarAlerta(t.error, t.ingresaCorreo);
      return;
    }
    if (password.length < 6) {
      mostrarAlerta(t.error, t.contrasenaMinimo);
      return;
    }
    if (password !== confirmar) {
      mostrarAlerta(t.error, t.contrasenasNoCoinciden);
      return;
    }
    setCargando(true);
    registroEstado.enProceso = true;
    try {
      const resultado = await createUserWithEmailAndPassword(auth, email, password);

      // A partir de aquí la cuenta YA existe en Firebase. Todo lo siguiente es
      // "best effort": si algo falla, no se muestra como error, porque la cuenta
      // de todas formas se creó correctamente.
      try {
        await updateProfile(resultado.user, { displayName: nombre.trim() });
      } catch (e) {
        console.log('No se pudo actualizar el perfil:', e);
      }

      try {
        await setDoc(doc(db, 'usuarios', resultado.user.uid), {
          nombre: nombre.trim(),
          email: email.trim(),
          creadoEn: new Date(),
        });
      } catch (e) {
        console.log('No se pudo guardar el usuario en Firestore:', e);
      }

      try {
        await sendEmailVerification(resultado.user);
      } catch (e) {
        console.log('No se pudo enviar el correo de verificación:', e);
      }

      // En vez de una alerta de "cuenta creada", vamos directo al dashboard,
      // que ya muestra el saludo de bienvenida con el nombre del usuario.
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      // Este catch SOLO se dispara si falla la creación de la cuenta en sí.
      if (error.code === 'auth/email-already-in-use') {
        mostrarAlerta(t.error, t.correoEnUso);
      } else if (error.code === 'auth/weak-password') {
        mostrarAlerta(t.error, t.contrasenaMinimo);
      } else {
        mostrarAlerta(t.error, idioma === 'es' ? 'No se pudo crear la cuenta' : 'Could not create account');
      }
    } finally {
      registroEstado.enProceso = false;
      setCargando(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #0a0818; }
          .reg-input {
            width: 100%;
            background: rgba(22,27,46,0.95);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 14px 16px;
            font-size: 15px;
            color: #F8FAFC;
            outline: none;
            font-family: inherit;
            transition: border-color 0.2s;
          }
          .reg-input:focus { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
          .reg-input::placeholder { color: #4B5563; }
          .reg-input-outer {
            display: flex;
            align-items: center;
            background: rgba(22,27,46,0.95);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 0 14px;
            transition: border-color 0.2s;
          }
          .reg-input-outer:focus-within { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
          .reg-input-inner {
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
          .reg-input-inner::placeholder { color: #4B5563; }
          .eye-btn { background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.3); font-size: 16px; padding: 0; line-height: 1; flex-shrink: 0; }
          .eye-btn:hover { color: rgba(255,255,255,0.7); }
          .btn-crear {
            width: 100%;
            padding: 15px;
            background: linear-gradient(90deg, #8B5CF6, #A855F7);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
            transition: opacity 0.2s, transform 0.2s;
            margin-bottom: 20px;
          }
          .btn-crear:hover { opacity: 0.88; transform: translateY(-1px); }
          .btn-crear:disabled { opacity: 0.5; cursor: not-allowed; transform: none; background: #374151; }
          .btn-login {
            width: 100%;
            padding: 14px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: #8B5CF6;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.2s;
          }
          .btn-login:hover { background: rgba(139,92,246,0.08); }
          .sep-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
          .btn-regresar {
            background: rgba(22,27,46,0.95);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px;
            padding: 8px 16px;
            color: #8B5CF6;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.2s;
            margin-bottom: 32px;
            display: inline-block;
          }
          .btn-regresar:hover { background: rgba(139,92,246,0.1); }
        `}</style>

        <div style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#0a0818',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          padding: '40px 20px',
          position: 'relative',
        }}>
          {/* Glows */}
          <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,40,220,0.2) 0%, transparent 70%)', top: -150, left: -100, pointerEvents: 'none' }} />
          <div style={{ position: 'fixed', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', bottom: -50, right: -50, pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

            {/* Regresar */}
            <button className="btn-regresar" onClick={() => router.replace('/(tabs)')}>
              ← {t.regresar}
            </button>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 40 }}>🎁</span>
              <span style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Giftu</span>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 4 }}>{t.crearCuenta}</h2>
            <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 36 }}>
              {idioma === 'es' ? '✨ Empieza a regalar sin spoilers' : '✨ Start gifting without spoilers'}
            </p>

            {/* Nombre */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
                👤 {idioma === 'es' ? 'Tu nombre' : 'Your name'}
              </label>
              <input className="reg-input" type="text" placeholder={idioma === 'es' ? 'Arturo Gutiérrez' : 'John Smith'}
                value={nombre} onChange={(e: any) => setNombre(e.target.value)} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
                📧 {t.correo}
              </label>
              <input className="reg-input" type="email" placeholder="ejemplo@correo.com"
                value={email} onChange={(e: any) => setEmail(e.target.value)} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
                🔒 {t.contrasena}
              </label>
              <div className="reg-input-outer">
                <input className="reg-input-inner" type={mostrarPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={(e: any) => setPassword(e.target.value)} />
                <button type="button" className="eye-btn" onClick={() => setMostrarPassword(!mostrarPassword)}>
                  {mostrarPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>
                {idioma === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}
              </p>
            </div>

            {/* Confirmar password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>
                🔒 {t.confirmarContrasena}
              </label>
              <div className="reg-input-outer" style={{ borderColor: confirmar && password !== confirmar ? '#EF4444' : undefined }}>
                <input className="reg-input-inner" type={mostrarConfirmar ? 'text' : 'password'} placeholder="••••••••"
                  value={confirmar} onChange={(e: any) => setConfirmar(e.target.value)}
                  onKeyDown={(e: any) => e.key === 'Enter' && handleRegistro()} />
                <button type="button" className="eye-btn" onClick={() => setMostrarConfirmar(!mostrarConfirmar)}>
                  {mostrarConfirmar ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmar && password !== confirmar && (
                <p style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{t.contrasenasNoCoinciden}</p>
              )}
            </div>

            {/* Botón crear */}
            <button className="btn-crear" onClick={handleRegistro} disabled={cargando}>
              {cargando
                ? (idioma === 'es' ? 'Creando cuenta...' : 'Creating account...')
                : `🎁 ${t.crearCuenta}`}
            </button>

            {/* Separador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className="sep-line" />
              <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' as any }}>
                {idioma === 'es' ? '¿ya tienes cuenta?' : 'already have an account?'}
              </span>
              <div className="sep-line" />
            </div>

            <button className="btn-login" onClick={() => router.replace('/(tabs)')}>
              {t.yaTieneCuenta}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Versión móvil
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.botonRegresar}>
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
            <Text style={styles.inputLabel}>{idioma === 'es' ? '👤 Tu nombre' : '👤 Your name'}</Text>
            <TextInput style={styles.input} placeholder={idioma === 'es' ? 'Arturo Gutiérrez' : 'John Smith'} placeholderTextColor="#4B5563" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📧 {t.correo}</Text>
            <TextInput style={styles.input} placeholder="ejemplo@correo.com" placeholderTextColor="#4B5563" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 {t.contrasena}</Text>
            <View style={styles.inputConOjo}>
              <TextInput
                style={styles.inputConOjoTexto}
                placeholder="••••••••"
                placeholderTextColor="#4B5563"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
              />
              <TouchableOpacity onPress={() => setMostrarPassword(!mostrarPassword)}>
                <Text style={styles.ojoEmoji}>{mostrarPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>{idioma === 'es' ? 'Mínimo 6 caracteres' : 'Minimum 6 characters'}</Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 {t.confirmarContrasena}</Text>
            <View style={[styles.inputConOjo, confirmar && password !== confirmar && styles.inputError]}>
              <TextInput
                style={styles.inputConOjoTexto}
                placeholder="••••••••"
                placeholderTextColor="#4B5563"
                value={confirmar}
                onChangeText={setConfirmar}
                secureTextEntry={!mostrarConfirmar}
              />
              <TouchableOpacity onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                <Text style={styles.ojoEmoji}>{mostrarConfirmar ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {confirmar && password !== confirmar && (
              <Text style={styles.errorTexto}>{t.contrasenasNoCoinciden}</Text>
            )}
          </View>
          <TouchableOpacity style={[styles.boton, cargando && styles.botonDesactivado]} onPress={handleRegistro} disabled={cargando}>
            <LinearGradient colors={cargando ? ['#374151', '#374151'] : ['#8B5CF6', '#A855F7']} style={styles.botonGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.botonTexto}>
                {cargando ? (idioma === 'es' ? 'Creando cuenta...' : 'Creating account...') : `🎁 ${t.crearCuenta}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.separador}>
            <View style={styles.separadorLinea} />
            <Text style={styles.separadorTexto}>{idioma === 'es' ? '¿ya tienes cuenta?' : 'already have an account?'}</Text>
            <View style={styles.separadorLinea} />
          </View>
          <TouchableOpacity style={styles.botonLogin} onPress={() => router.replace('/(tabs)')}>
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
  inputConOjo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B2E', borderWidth: 1, borderColor: '#2D3343', borderRadius: 14, paddingHorizontal: 16 },
  inputConOjoTexto: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#F8FAFC' },
  ojoEmoji: { fontSize: 18, marginLeft: 8 },
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
