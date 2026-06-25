import { useRouter } from 'expo-router';
import { reload, sendEmailVerification, signOut } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useIdioma } from '../../app/IdiomaContext';
import { auth } from '../../firebaseConfig';

export default function VerificarEmail() {
  const router = useRouter();
  const { idioma } = useIdioma();
  const [enviando, setEnviando] = useState(false);

  const mostrarAlerta = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const handleReenviar = async () => {
    const usuario = auth.currentUser;
    if (!usuario) return;
    setEnviando(true);
    try {
      await sendEmailVerification(usuario);
      mostrarAlerta('✅', idioma === 'es' ? `Correo enviado a ${usuario.email}` : `Email sent to ${usuario.email}`);
    } catch (error) {
      mostrarAlerta('Error', idioma === 'es' ? 'No se pudo enviar el correo' : 'Could not send email');
    } finally {
      setEnviando(false);
    }
  };

  const handleYaVerifique = async () => {
    try {
      await reload(auth.currentUser!);
      const usuarioActualizado = auth.currentUser;
      if (usuarioActualizado?.emailVerified) {
        router.replace('/(tabs)/dashboard');
      } else {
        mostrarAlerta(
          idioma === 'es' ? 'Aún no verificado' : 'Not verified yet',
          idioma === 'es' ? 'Revisa tu correo y haz clic en el link de verificación.' : 'Check your email and click the verification link.'
        );
      }
    } catch (error) {
      mostrarAlerta('Error', idioma === 'es' ? 'Intenta de nuevo' : 'Try again');
    }
  };

  const handleSalir = async () => {
    await signOut(auth);
    router.replace('/(tabs)');
  };

  const usuario = auth.currentUser;

  if (Platform.OS === 'web') {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#0a0818', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' as any }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>📧</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            {idioma === 'es' ? 'Verifica tu correo' : 'Verify your email'}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 8, lineHeight: 1.6 }}>
            {idioma === 'es' ? 'Enviamos un link de verificación a:' : 'We sent a verification link to:'}
          </p>
          <p style={{ fontSize: 16, color: '#8B5CF6', fontWeight: 700, marginBottom: 40 }}>{usuario?.email}</p>

          <button onClick={handleYaVerifique} style={{
            width: '100%', padding: '15px', background: 'linear-gradient(90deg, #8B5CF6, #A855F7)',
            border: 'none', borderRadius: 12, color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit',
          }}>
            {idioma === 'es' ? '✅ Ya verifiqué mi correo' : '✅ I already verified my email'}
          </button>

          <button onClick={handleReenviar} disabled={enviando} style={{
            width: '100%', padding: '14px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
            color: '#94A3B8', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            marginBottom: 16, fontFamily: 'inherit',
          }}>
            {enviando ? (idioma === 'es' ? 'Enviando...' : 'Sending...') : (idioma === 'es' ? '📨 Reenviar correo' : '📨 Resend email')}
          </button>

          <button onClick={handleSalir} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
            fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {idioma === 'es' ? 'Cerrar sesión' : 'Sign out'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contenido}>
        <Text style={styles.emoji}>📧</Text>
        <Text style={styles.titulo}>{idioma === 'es' ? 'Verifica tu correo' : 'Verify your email'}</Text>
        <Text style={styles.subtitulo}>
          {idioma === 'es' ? 'Enviamos un link de verificación a:' : 'We sent a verification link to:'}
        </Text>
        <Text style={styles.email}>{usuario?.email}</Text>
        <TouchableOpacity style={styles.botonPrimario} onPress={handleYaVerifique}>
          <Text style={styles.botonPrimarioTexto}>
            {idioma === 'es' ? '✅ Ya verifiqué mi correo' : '✅ I already verified my email'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonSecundario} onPress={handleReenviar} disabled={enviando}>
          <Text style={styles.botonSecundarioTexto}>
            {enviando ? (idioma === 'es' ? 'Enviando...' : 'Sending...') : (idioma === 'es' ? '📨 Reenviar correo' : '📨 Resend email')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSalir}>
          <Text style={styles.salir}>{idioma === 'es' ? 'Cerrar sesión' : 'Sign out'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' },
  contenido: { padding: 32, alignItems: 'center', maxWidth: 360 },
  emoji: { fontSize: 80, marginBottom: 24 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 12 },
  subtitulo: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 8 },
  email: { fontSize: 16, color: '#8B5CF6', fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  botonPrimario: { width: '100%', backgroundColor: '#8B5CF6', padding: 18, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  botonPrimarioTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonSecundario: { width: '100%', backgroundColor: '#161B2E', padding: 18, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2D3343', marginBottom: 24 },
  botonSecundarioTexto: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  salir: { fontSize: 14, color: 'rgba(255,255,255,0.3)' },
});