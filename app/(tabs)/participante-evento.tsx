import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebaseConfig';
import { useAuth } from '../AuthContext';
import { useIdioma } from '../IdiomaContext';

export default function ParticipanteEvento() {
  const router = useRouter();
  const { id, nombre } = useLocalSearchParams();
  const { t, idioma } = useIdioma();
  const { usuario } = useAuth();
  const [regalos, setRegalos] = useState([]);
  const [misApartados, setMisApartados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'eventos', id as string, 'regalos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegalos(lista);
      setCargando(false);
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!usuario) {
      setMisApartados([]);
      return;
    }
    const q = query(collection(db, 'apartados_privados'), where('usuarioId', '==', usuario.uid), where('eventoId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMisApartados(lista);
    });
    return () => unsubscribe();
  }, [id, usuario]);

  const mostrarAlerta = (titulo: string, mensaje: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const handleApartar = async (regalo: any) => {
    if (!usuario) { mostrarAlerta(t.error, idioma === 'es' ? 'Debes iniciar sesión' : 'You must be signed in'); return; }
    if (regalo.estado === 'apartado') { mostrarAlerta(t.error, t.noDisponible); return; }
    const confirmar = Platform.OS === 'web'
      ? window.confirm(`${t.quieresApartar} "${regalo.nombre}"?`)
      : await new Promise(resolve => Alert.alert(t.apartarRegalo, `${t.quieresApartar} "${regalo.nombre}"?`, [{ text: t.cancelar, style: 'cancel', onPress: () => resolve(false) }, { text: t.siApartar, onPress: () => resolve(true) }]));
    if (!confirmar) return;
    try {
      await updateDoc(doc(db, 'eventos', id as string, 'regalos', regalo.id), { estado: 'apartado' });
      await addDoc(collection(db, 'apartados_privados'), { usuarioId: usuario.uid, usuarioEmail: usuario.email, eventoId: id, regaloId: regalo.id, regaloNombre: regalo.nombre, fechaApartado: new Date(), cancelado: false });
      mostrarAlerta('🎉', t.apartadoExito);
    } catch { mostrarAlerta(t.error, t.errorApartar); }
  };

  const handleCancelar = async (apartado: any) => {
    const confirmar = Platform.OS === 'web'
      ? window.confirm(`${t.quieresLiberar} "${apartado.regaloNombre}"?`)
      : await new Promise(resolve => Alert.alert(t.cancelarApartadoPregunta, `${t.quieresLiberar} "${apartado.regaloNombre}"?`, [{ text: t.cancelar, style: 'cancel', onPress: () => resolve(false) }, { text: t.siCancelar, onPress: () => resolve(true) }]));
    if (!confirmar) return;
    try {
      await updateDoc(doc(db, 'eventos', id as string, 'regalos', apartado.regaloId), { estado: 'disponible' });
      await deleteDoc(doc(db, 'apartados_privados', apartado.id));
      mostrarAlerta(t.listo, t.regaloCancelado);
    } catch { mostrarAlerta(t.error, t.errorCancelar); }
  };

  const misApartadosIds = misApartados.map((a: any) => a.regaloId);
  const totalRegalos = regalos.length;
  const regalosDisponibles = regalos.filter((r: any) => r.estado === 'disponible').length;

  if (Platform.OS === 'web') {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #0a0818; }
          .regalo-card { background: rgba(22,27,46,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 12px; transition: all 0.2s; cursor: pointer; }
          .regalo-card:hover { border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.06); transform: translateY(-1px); }
          .regalo-card-yo { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.3); }
          .regalo-card-no { opacity: 0.5; cursor: not-allowed; }
          .regalo-card-no:hover { transform: none; border-color: rgba(255,255,255,0.07); background: rgba(22,27,46,0.8); }
          .btn-cancelar-apartado { padding: 6px 14px; border-radius: 10px; border: 1px solid rgba(239,68,68,0.4); background: rgba(239,68,68,0.1); color: #EF4444; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
          .btn-cancelar-apartado:hover { background: rgba(239,68,68,0.2); }
          .btn-regresar { background: rgba(22,27,46,0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 8px 16px; color: #8B5CF6; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
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

          {/* Contenido centrado */}
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{nombre}</h1>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>
              🎁 {regalosDisponibles} {idioma === 'es' ? 'regalos disponibles de' : 'gifts available of'} {totalRegalos}
            </p>

            {/* Mis apartados */}
            {misApartados.length > 0 && (
              <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: 20, marginBottom: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#10B981', marginBottom: 16 }}>{t.misRegalosApartados}</h3>
                {misApartados.map((apartado: any) => (
                  <div key={apartado.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(22,27,46,0.8)', borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC' }}>{apartado.regaloNombre}</span>
                    <button className="btn-cancelar-apartado" onClick={() => handleCancelar(apartado)}>{t.cancelarApartado}</button>
                  </div>
                ))}
              </div>
            )}

            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{t.listaRegalos}</h2>

            {cargando ? (
              <div style={{ textAlign: 'center' as any, padding: 40, color: '#8B5CF6' }}>Cargando...</div>
            ) : regalos.length === 0 ? (
              <div style={{ background: 'rgba(22,27,46,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 40, textAlign: 'center' as any }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#8B5CF6', marginBottom: 6 }}>{t.sinRegalos}</div>
              </div>
            ) : (
              regalos.map((regalo: any) => {
                const yoAparte = misApartadosIds.includes(regalo.id);
                const disponible = regalo.estado !== 'apartado';
                return (
                  <div key={regalo.id}
                    className={`regalo-card ${yoAparte ? 'regalo-card-yo' : ''} ${!disponible && !yoAparte ? 'regalo-card-no' : ''}`}
                    onClick={() => disponible && !yoAparte && handleApartar(regalo)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: !disponible && !yoAparte ? '#6B7280' : '#fff', flex: 1 }}>{regalo.nombre}</span>
                      {yoAparte && <span style={{ fontSize: 18, color: '#10B981' }}>✓</span>}
                    </div>
                    {regalo.precio && <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>💰 ${regalo.precio}</div>}
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
                      backgroundColor: yoAparte ? 'rgba(16,185,129,0.1)' : disponible ? 'rgba(139,92,246,0.1)' : 'rgba(107,114,128,0.1)',
                      color: yoAparte ? '#10B981' : disponible ? '#8B5CF6' : '#6B7280',
                      border: `1px solid ${yoAparte ? 'rgba(16,185,129,0.3)' : disponible ? 'rgba(139,92,246,0.3)' : 'rgba(107,114,128,0.3)'}`
                    }}>
                      {yoAparte ? `✓ ${t.tuLoApartaste}` : disponible ? `✅ ${t.disponibleApartar}` : `🔒 ${t.noDisponible}`}
                    </span>
                  </div>
                );
              })
            )}
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
          <Text style={styles.titulo}>{nombre}</Text>
          <Text style={styles.subtitulo}>🎁 {regalosDisponibles} {idioma === 'es' ? 'regalos disponibles de' : 'gifts available of'} {totalRegalos}</Text>
        </View>
        <View style={styles.contenido}>
          {misApartados.length > 0 && (
            <View style={styles.misApartadosBox}>
              <Text style={styles.misApartadosTitulo}>{t.misRegalosApartados}</Text>
              {misApartados.map((apartado: any) => (
                <View key={apartado.id} style={styles.tarjetaApartada}>
                  <Text style={styles.tarjetaApartadaNombre}>{apartado.regaloNombre}</Text>
                  <TouchableOpacity style={styles.botonCancelarApartado} onPress={() => handleCancelar(apartado)}>
                    <Text style={styles.botonCancelarTexto}>{t.cancelarApartado}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.seccionTitulo}>{t.listaRegalos}</Text>
          {cargando ? <ActivityIndicator size="large" color="#8B5CF6" /> : (
            regalos.map((regalo: any) => {
              const yoAparte = misApartadosIds.includes(regalo.id);
              const disponible = regalo.estado !== 'apartado';
              return (
                <TouchableOpacity key={regalo.id} style={[styles.tarjeta, yoAparte && styles.tarjetaYo, !disponible && !yoAparte && styles.tarjetaNoDisponible]} onPress={() => disponible && !yoAparte && handleApartar(regalo)} disabled={!disponible && !yoAparte} activeOpacity={disponible ? 0.7 : 1}>
                  <View style={styles.tarjetaHeader}>
                    <Text style={[styles.tarjetaNombre, !disponible && !yoAparte && styles.tarjetaNombreMuted]}>{regalo.nombre}</Text>
                    {yoAparte && <Text style={styles.checkEmoji}>✓</Text>}
                  </View>
                  {regalo.precio ? <Text style={styles.tarjetaPrecio}>💰 ${regalo.precio}</Text> : null}
                  <View style={[styles.estadoBadge, yoAparte ? styles.estadoYo : disponible ? styles.estadoDisponible : styles.estadoNoDisponible]}>
                    <Text style={[styles.estadoTexto, yoAparte ? styles.textoYo : disponible ? styles.textoDisponible : styles.textoNoDisponible]}>
                      {yoAparte ? `✓ ${t.tuLoApartaste}` : disponible ? `✅ ${t.disponibleApartar}` : `🔒 ${t.noDisponible}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 40 }} />
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
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 8 },
  subtitulo: { fontSize: 14, color: '#6B7280' },
  contenido: { paddingHorizontal: 24 },
  misApartadosBox: { backgroundColor: '#10B98115', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#10B98140' },
  misApartadosTitulo: { fontSize: 15, fontWeight: 'bold', color: '#10B981', marginBottom: 12 },
  tarjetaApartada: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161B2E', borderRadius: 12, padding: 12, marginBottom: 8 },
  tarjetaApartadaNombre: { fontSize: 14, fontWeight: '600', color: '#F8FAFC', flex: 1 },
  botonCancelarApartado: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#EF444440', backgroundColor: '#EF444415' },
  botonCancelarTexto: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12 },
  tarjeta: { backgroundColor: '#161B2E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2D3343' },
  tarjetaYo: { borderColor: '#10B98140', backgroundColor: '#10B98110' },
  tarjetaNoDisponible: { opacity: 0.5 },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tarjetaNombre: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', flex: 1 },
  tarjetaNombreMuted: { color: '#6B7280' },
  checkEmoji: { fontSize: 18, color: '#10B981' },
  tarjetaPrecio: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  estadoBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  estadoDisponible: { backgroundColor: '#8B5CF620', borderWidth: 1, borderColor: '#8B5CF640' },
  estadoYo: { backgroundColor: '#10B98120', borderWidth: 1, borderColor: '#10B98140' },
  estadoNoDisponible: { backgroundColor: '#6B728020', borderWidth: 1, borderColor: '#6B728040' },
  estadoTexto: { fontSize: 12, fontWeight: '600' },
  textoDisponible: { color: '#8B5CF6' },
  textoYo: { color: '#10B981' },
  textoNoDisponible: { color: '#6B7280' },
});