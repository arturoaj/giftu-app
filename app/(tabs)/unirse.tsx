import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';
import { useAuth } from '../AuthContext';
import { useIdioma } from '../IdiomaContext';

export default function Unirse() {
  const params = useLocalSearchParams();
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { usuario, cargandoAuth } = useAuth();
  const { t, idioma } = useIdioma();

  useEffect(() => {
    if (params.codigo && typeof params.codigo === 'string') {
      setCodigo(params.codigo.toUpperCase());
    }
  }, [params.codigo]);

  // Si no hay sesión iniciada, mandamos a LOGIN guardando el código
  // Desde login, si la persona no tiene cuenta, puede darle a "Regístrate"
  // y el código se sigue pasando de pantalla en pantalla
  useEffect(() => {
    if (!cargandoAuth && !usuario) {
      const codigoParaGuardar = typeof params.codigo === 'string' ? params.codigo : codigo;
      router.replace({
        pathname: '/(tabs)',
        params: codigoParaGuardar ? { codigo: codigoParaGuardar } : {},
      });
    }
  }, [cargandoAuth, usuario]);

  const mostrarAlerta = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') { window.alert(`${titulo}\n\n${mensaje}`); } else { Alert.alert(titulo, mensaje); }
  };

  const handleUnirse = async () => {
    if (!codigo.trim()) { mostrarAlerta(t.error, t.ingresaCodigoError); return; }
    if (!usuario) { mostrarAlerta(t.error, idioma === 'es' ? 'Debes iniciar sesión' : 'You must be signed in'); return; }
    setCargando(true);
    try {
      const q = query(collection(db, 'eventos'), where('codigo', '==', codigo.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) { mostrarAlerta(t.error, t.codigoIncorrecto); setCargando(false); return; }
      const eventoDoc = snapshot.docs[0];
      const evento = { id: eventoDoc.id, ...eventoDoc.data() } as any;
      const participacionQuery = query(collection(db, 'participaciones'), where('usuarioId', '==', usuario.uid), where('eventoId', '==', evento.id));
      const participacionSnapshot = await getDocs(participacionQuery);
      if (participacionSnapshot.empty) {
        await addDoc(collection(db, 'participaciones'), { usuarioId: usuario.uid, usuarioEmail: usuario.email, eventoId: evento.id, eventoNombre: evento.nombre, rol: 'participante', unidoEn: new Date() });
      }
      router.replace({ pathname: '/(tabs)/participante-evento', params: { id: evento.id, nombre: evento.nombre, codigo: evento.codigo } });
    } catch { mostrarAlerta(t.error, t.errorUnirse); }
    finally { setCargando(false); }
  };

  // Mientras se determina si hay sesión, o mientras redirige por no tener sesión,
  // mostramos un loader en vez del formulario (evita flash del formulario sin login)
  if (cargandoAuth || !usuario) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0818', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #0a0818; }
          .codigo-input {
            width: 100%; background: rgba(22,27,46,0.95); border: 2px solid #8B5CF6;
            border-radius: 16px; padding: 20px; font-size: 36px; color: #F59E0B;
            outline: none; font-family: monospace; text-align: center; letter-spacing: 12px;
            font-weight: 700; margin-bottom: 8px; transition: border-color 0.2s, box-shadow 0.2s;
          }
          .codigo-input:focus { border-color: #A855F7; box-shadow: 0 0 0 4px rgba(139,92,246,0.2); }
          .codigo-input::placeholder { color: rgba(45,51,67,0.8); font-size: 28px; }
          .btn-unirse {
            width: 100%; padding: 15px; background: linear-gradient(90deg, #F59E0B, #FBBF24);
            border: none; border-radius: 12px; color: #fff; font-size: 16px; font-weight: 700;
            cursor: pointer; font-family: inherit; transition: opacity 0.2s, transform 0.2s; margin-bottom: 24px;
          }
          .btn-unirse:hover { opacity: 0.88; transform: translateY(-1px); }
          .btn-unirse:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
          .btn-regresar {
            background: rgba(22,27,46,0.95); border: 1px solid rgba(255,255,255,0.08);
            border-radius: 20px; padding: 8px 16px; color: #8B5CF6; font-size: 14px;
            font-weight: 600; cursor: pointer; font-family: inherit; margin-bottom: 32px; display: inline-block;
          }
          .btn-regresar:hover { background: rgba(139,92,246,0.1); }
        `}</style>

        <div style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#0a0818',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          {/* Navbar */}
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, backgroundColor: 'rgba(10,8,24,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🎁</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Giftu</span>
            </div>
            <button className="btn-regresar" onClick={() => router.replace('/(tabs)/dashboard')}>← {t.regresar}</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
            <div style={{ width: '100%', maxWidth: 480 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>{t.unirseEvento}</h1>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 36 }}>{t.ingresaCodigo}</p>

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 12 }}>{t.codigoEvento}</label>
              <input className="codigo-input" type="text" placeholder="XXXXXX" maxLength={6}
                value={codigo} onChange={(e: any) => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={(e: any) => e.key === 'Enter' && handleUnirse()} />
              <p style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 28 }}>
                {idioma === 'es' ? '6 caracteres — letras y números' : '6 characters — letters and numbers'}
              </p>

              <button className="btn-unirse" onClick={handleUnirse} disabled={cargando}>
                {cargando ? (idioma === 'es' ? 'Buscando...' : 'Searching...') : `🔑 ${t.unirseBtn}`}
              </button>

              <div style={{ backgroundColor: 'rgba(22,27,46,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                  {idioma === 'es' ? 'El organizador del evento te compartió un código de 6 caracteres. Ingrésalo arriba para ver la lista de regalos.' : 'The event organizer shared a 6-character code with you. Enter it above to see the gift list.'}
                </p>
              </div>
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
        <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')} style={styles.botonRegresar}>
          <Text style={styles.botonRegresarTexto}>← {t.regresar}</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>{t.unirseEvento}</Text>
        <Text style={styles.subtitulo}>{t.ingresaCodigo}</Text>
      </View>
      <View style={styles.formulario}>
        <View style={styles.codigoInputContainer}>
          <Text style={styles.inputLabel}>{t.codigoEvento}</Text>
          <TextInput style={styles.codigoInput} placeholder="XXXXXX" placeholderTextColor="#2D3343" value={codigo} onChangeText={setCodigo} autoCapitalize="characters" maxLength={6} autoFocus />
          <Text style={styles.codigoHint}>{idioma === 'es' ? '6 caracteres — letras y números' : '6 characters — letters and numbers'}</Text>
        </View>
        <TouchableOpacity style={[styles.boton, cargando && styles.botonDesactivado]} onPress={handleUnirse} disabled={cargando}>
          <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.botonGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {cargando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTexto}>🔑 {t.unirseBtn}</Text>}
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoTexto}>{idioma === 'es' ? 'El organizador del evento te compartió un código de 6 caracteres.' : 'The event organizer shared a 6-character code with you.'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
  botonRegresar: { marginBottom: 24, alignSelf: 'flex-start', backgroundColor: '#161B2E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2D3343' },
  botonRegresarTexto: { fontSize: 14, color: '#8B5CF6', fontWeight: '600' },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 },
  subtitulo: { fontSize: 14, color: '#6B7280' },
  formulario: { paddingHorizontal: 24 },
  codigoInputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 12 },
  codigoInput: { backgroundColor: '#161B2E', borderWidth: 2, borderColor: '#8B5CF6', borderRadius: 16, padding: 20, fontSize: 32, color: '#F59E0B', textAlign: 'center', letterSpacing: 8, fontWeight: 'bold' },
  codigoHint: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  boton: { borderRadius: 14, overflow: 'hidden', marginBottom: 24 },
  botonDesactivado: { opacity: 0.6 },
  botonGradiente: { padding: 18, alignItems: 'center' },
  botonTexto: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  infoBox: { flexDirection: 'row', backgroundColor: '#161B2E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2D3343', gap: 12, alignItems: 'flex-start' },
  infoEmoji: { fontSize: 20 },
  infoTexto: { fontSize: 13, color: '#6B7280', flex: 1, lineHeight: 20 },
});