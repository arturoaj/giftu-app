import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIdioma } from '../../app/IdiomaContext';
import { auth, db } from '../../firebaseConfig';

function generarCodigo() {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

export default function CrearEvento() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { t, idioma } = useIdioma();

  const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
      if (onOk) onOk();
    } else {
      Alert.alert(titulo, mensaje, onOk ? [{ text: t.ok, onPress: onOk }] : undefined);
    }
  };

  const handleCrear = async () => {
    if (!nombre.trim()) {
      mostrarAlerta(t.error, t.nombreObligatorio);
      return;
    }
    setCargando(true);
    try {
      const codigo = generarCodigo();
      const usuario = auth.currentUser;
      await addDoc(collection(db, 'eventos'), {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        fecha: fecha.trim(),
        codigo,
        creadoPor: usuario?.uid,
        creadoPorEmail: usuario?.email,
        estado: 'activo',
        creadoEn: new Date(),
      });
      mostrarAlerta(t.eventoCreado, `${t.codigoCompartir} ${codigo}`, () => router.replace('/(tabs)/dashboard'));
    } catch (error) {
      mostrarAlerta(t.error, t.errorCrear);
    } finally {
      setCargando(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; background: #0a0818; }
          .web-input {
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
            margin-bottom: 20px;
          }
          .web-input:focus { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
          .web-input::placeholder { color: #4B5563; }
          .web-textarea {
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
            margin-bottom: 20px;
            resize: vertical;
            min-height: 100px;
          }
          .web-textarea:focus { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
          .web-textarea::placeholder { color: #4B5563; }
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
            margin-bottom: 12px;
          }
          .btn-crear:hover { opacity: 0.88; transform: translateY(-1px); }
          .btn-crear:disabled { opacity: 0.5; cursor: not-allowed; transform: none; background: #374151; }
          .btn-cancelar {
            width: 100%;
            padding: 14px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: #6B7280;
            font-size: 15px;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.2s;
          }
          .btn-cancelar:hover { background: rgba(255,255,255,0.04); }
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
            margin-bottom: 32px;
            display: inline-block;
            transition: background 0.2s;
          }
          .btn-regresar:hover { background: rgba(139,92,246,0.1); }
        `}</style>

        {/* Navbar */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 40px',
          display: 'flex', alignItems: 'center', height: 64,
          backgroundColor: 'rgba(10,8,24,0.95)', position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(12px)', fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          <span style={{ fontSize: 24 }}>🎁</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginLeft: 10 }}>Giftu</span>
        </div>

        <div style={{
          minHeight: '100vh', backgroundColor: '#0a0818', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}>
          <div style={{ width: '100%', maxWidth: 520 }}>
            <button className="btn-regresar" onClick={() => router.replace('/(tabs)/dashboard')}>
              ← {t.regresar}
            </button>

            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>{t.nuevoEvento}</h1>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 36 }}>
              {idioma === 'es' ? 'Completa los detalles de tu evento' : 'Fill in the details of your event'}
            </p>

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.nombreEvento}</label>
            <input className="web-input" type="text" placeholder={t.ejNombre} value={nombre} onChange={(e: any) => setNombre(e.target.value)} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.descripcion}</label>
            <textarea className="web-textarea" placeholder={t.ejDescripcion} value={descripcion} onChange={(e: any) => setDescripcion(e.target.value)} />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.fecha} 📅</label>
            <input className="web-input" type="text" placeholder={t.ejFecha} value={fecha} onChange={(e: any) => setFecha(e.target.value)} />

            <button className="btn-crear" onClick={handleCrear} disabled={cargando}>
              {cargando ? (idioma === 'es' ? 'Creando...' : 'Creating...') : `✨ ${t.crearEventoBtn}`}
            </button>
            <button className="btn-cancelar" onClick={() => router.replace('/(tabs)/dashboard')}>{t.cancelar}</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')} style={styles.botonRegresar}>
            <Text style={styles.botonRegresarTexto}>← {t.regresar}</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>{t.nuevoEvento}</Text>
          <Text style={styles.subtitulo}>{idioma === 'es' ? 'Completa los detalles de tu evento' : 'Fill in the details of your event'}</Text>
        </View>
        <View style={styles.formulario}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.nombreEvento}</Text>
            <TextInput style={styles.input} placeholder={t.ejNombre} placeholderTextColor="#4B5563" value={nombre} onChangeText={setNombre} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.descripcion}</Text>
            <TextInput style={[styles.input, styles.inputMultiline]} placeholder={t.ejDescripcion} placeholderTextColor="#4B5563" value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.fecha} 📅</Text>
            <TextInput style={styles.input} placeholder={t.ejFecha} placeholderTextColor="#4B5563" value={fecha} onChangeText={setFecha} />
          </View>
          <TouchableOpacity style={[styles.boton, cargando && styles.botonDesactivado]} onPress={handleCrear} disabled={cargando}>
            <LinearGradient colors={cargando ? ['#374151', '#374151'] : ['#8B5CF6', '#A855F7']} style={styles.botonGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.botonTexto}>{cargando ? t.creando : `✨ ${t.crearEventoBtn}`}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonCancelar} onPress={() => router.replace('/(tabs)/dashboard')}>
            <Text style={styles.botonCancelarTexto}>{t.cancelar}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
  botonRegresar: { marginBottom: 20, alignSelf: 'flex-start', backgroundColor: '#161B2E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2D3343' },
  botonRegresarTexto: { fontSize: 14, color: '#8B5CF6', fontWeight: '600' },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 },
  subtitulo: { fontSize: 14, color: '#6B7280' },
  formulario: { paddingHorizontal: 24, paddingBottom: 40 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8 },
  input: { backgroundColor: '#161B2E', borderWidth: 1, borderColor: '#2D3343', borderRadius: 14, padding: 16, fontSize: 16, color: '#F8FAFC' },
  inputMultiline: { height: 100, textAlignVertical: 'top' },
  boton: { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 12 },
  botonDesactivado: { opacity: 0.6 },
  botonGradiente: { padding: 18, alignItems: 'center' },
  botonTexto: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  botonCancelar: { padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2D3343' },
  botonCancelarTexto: { color: '#6B7280', fontSize: 15 },
});