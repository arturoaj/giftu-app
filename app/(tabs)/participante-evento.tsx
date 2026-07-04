import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [regaloDetalle, setRegaloDetalle] = useState<any>(null);

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

  const handleAbrirLink = async (link: string) => {
    if (!link) return;
    const url = link.startsWith('http') ? link : `https://${link}`;
    if (Platform.OS === 'web') { window.open(url, '_blank'); } else { await Linking.openURL(url); }
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
      setRegaloDetalle(null);
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
      setRegaloDetalle(null);
    } catch { mostrarAlerta(t.error, t.errorCancelar); }
  };

  const misApartadosIds = misApartados.map((a: any) => a.regaloId);
  const totalRegalos = regalos.length;
  const regalosDisponibles = regalos.filter((r: any) => r.estado === 'disponible').length;

  const abrirDetalle = (regalo: any) => setRegaloDetalle(regalo);
  const cerrarDetalle = () => setRegaloDetalle(null);

  // Datos del detalle actualmente abierto (se recalculan por si cambió el estado en vivo)
  const detalleActual = regaloDetalle ? regalos.find((r: any) => r.id === regaloDetalle.id) || regaloDetalle : null;
  const detalleYoAparte = detalleActual ? misApartadosIds.includes(detalleActual.id) : false;
  const detalleDisponible = detalleActual ? detalleActual.estado !== 'apartado' : false;
  const apartadoDelDetalle = detalleActual ? misApartados.find((a: any) => a.regaloId === detalleActual.id) : null;

  if (Platform.OS === 'web') {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #0a0818; }
          .regalo-card { background: rgba(22,27,46,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 12px; transition: all 0.2s; cursor: pointer; }
          .regalo-card:hover { border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.06); transform: translateY(-1px); }
          .regalo-card-yo { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.3); }
          .regalo-card-no { opacity: 0.5; }
          .regalo-card-no:hover { transform: none; border-color: rgba(255,255,255,0.07); background: rgba(22,27,46,0.8); }
          .btn-cancelar-apartado { padding: 6px 14px; border-radius: 10px; border: 1px solid rgba(239,68,68,0.4); background: rgba(239,68,68,0.1); color: #EF4444; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
          .btn-cancelar-apartado:hover { background: rgba(239,68,68,0.2); }
          .btn-regresar { background: rgba(22,27,46,0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 8px 16px; color: #8B5CF6; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
          .btn-regresar:hover { background: rgba(139,92,246,0.1); }
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
          .modal-card { background: #14182b; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 28px; max-width: 480px; width: 100%; max-height: 85vh; overflow-y: auto; }
          .btn-cerrar-modal { background: rgba(255,255,255,0.06); border: none; border-radius: 50%; width: 32px; height: 32px; color: #94A3B8; font-size: 16px; cursor: pointer; }
          .btn-cerrar-modal:hover { background: rgba(255,255,255,0.12); }
          .btn-primary-modal { width: 100%; padding: 14px; background: linear-gradient(90deg, #8B5CF6, #A855F7); border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; margin-top: 10px; }
          .btn-primary-modal:hover { opacity: 0.88; }
          .btn-danger-modal { width: 100%; padding: 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.4); border-radius: 12px; color: #EF4444; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; margin-top: 10px; }
          .btn-danger-modal:hover { background: rgba(239,68,68,0.2); }
          .btn-link-modal { width: 100%; padding: 12px; background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); border-radius: 12px; color: #8B5CF6; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 10px; }
          .btn-link-modal:hover { background: rgba(139,92,246,0.18); }
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
                    onClick={() => abrirDetalle(regalo)}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      {regalo.imagen
                        ? <img src={regalo.imagen} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 56, height: 56, borderRadius: 10, background: 'rgba(30,37,64,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🎁</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
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
                          {yoAparte ? `✓ ${t.tuLoApartaste}` : disponible ? (idioma === 'es' ? '👁️ Ver detalle' : '👁️ View details') : `🔒 ${t.noDisponible}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal de detalle */}
          {detalleActual && (
            <div className="modal-overlay" onClick={cerrarDetalle}>
              <div className="modal-card" onClick={(e: any) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button className="btn-cerrar-modal" onClick={cerrarDetalle}>✕</button>
                </div>

                {detalleActual.imagen
                  ? <img src={detalleActual.imagen} style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 14, marginBottom: 20 }} />
                  : <div style={{ width: '100%', height: 160, borderRadius: 14, background: 'rgba(30,37,64,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 20 }}>🎁</div>
                }

                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{detalleActual.nombre}</h2>
                {detalleActual.precio && <div style={{ fontSize: 16, color: '#F59E0B', fontWeight: 700, marginBottom: 12 }}>💰 ${detalleActual.precio}</div>}

                <span style={{
                  display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, marginBottom: 16,
                  backgroundColor: detalleYoAparte ? 'rgba(16,185,129,0.1)' : detalleDisponible ? 'rgba(139,92,246,0.1)' : 'rgba(107,114,128,0.1)',
                  color: detalleYoAparte ? '#10B981' : detalleDisponible ? '#8B5CF6' : '#6B7280',
                  border: `1px solid ${detalleYoAparte ? 'rgba(16,185,129,0.3)' : detalleDisponible ? 'rgba(139,92,246,0.3)' : 'rgba(107,114,128,0.3)'}`
                }}>
                  {detalleYoAparte ? `✓ ${t.tuLoApartaste}` : detalleDisponible ? `✅ ${t.disponibleApartar}` : `🔒 ${t.noDisponible}`}
                </span>

                {detalleActual.link && (
                  <button className="btn-link-modal" onClick={() => handleAbrirLink(detalleActual.link)}>
                    🔗 {idioma === 'es' ? 'Ver en tienda' : 'View in store'}
                  </button>
                )}

                {detalleYoAparte && apartadoDelDetalle && (
                  <button className="btn-danger-modal" onClick={() => handleCancelar(apartadoDelDetalle)}>
                    {t.cancelarApartado}
                  </button>
                )}

                {!detalleYoAparte && detalleDisponible && (
                  <button className="btn-primary-modal" onClick={() => handleApartar(detalleActual)}>
                    🎁 {idioma === 'es' ? 'Apartar este regalo' : 'Reserve this gift'}
                  </button>
                )}

                {!detalleYoAparte && !detalleDisponible && (
                  <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' as any, marginTop: 16 }}>
                    {idioma === 'es' ? 'Otra persona ya apartó este regalo' : 'Someone else already reserved this gift'}
                  </p>
                )}
              </div>
            </div>
          )}
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
                <TouchableOpacity key={regalo.id} style={[styles.tarjeta, yoAparte && styles.tarjetaYo, !disponible && !yoAparte && styles.tarjetaNoDisponible]} onPress={() => abrirDetalle(regalo)} activeOpacity={0.7}>
                  <View style={styles.tarjetaContenido}>
                    {regalo.imagen ? <Image source={{ uri: regalo.imagen }} style={styles.tarjetaImagenMini} resizeMode="cover" /> : <View style={styles.tarjetaImagenMiniPlaceholder}><Text style={{ fontSize: 22 }}>🎁</Text></View>}
                    <View style={{ flex: 1 }}>
                      <View style={styles.tarjetaHeader}>
                        <Text style={[styles.tarjetaNombre, !disponible && !yoAparte && styles.tarjetaNombreMuted]}>{regalo.nombre}</Text>
                        {yoAparte && <Text style={styles.checkEmoji}>✓</Text>}
                      </View>
                      {regalo.precio ? <Text style={styles.tarjetaPrecio}>💰 ${regalo.precio}</Text> : null}
                      <View style={[styles.estadoBadge, yoAparte ? styles.estadoYo : disponible ? styles.estadoDisponible : styles.estadoNoDisponible]}>
                        <Text style={[styles.estadoTexto, yoAparte ? styles.textoYo : disponible ? styles.textoDisponible : styles.textoNoDisponible]}>
                          {yoAparte ? `✓ ${t.tuLoApartaste}` : disponible ? (idioma === 'es' ? '👁️ Ver detalle' : '👁️ View details') : `🔒 ${t.noDisponible}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Modal de detalle */}
      <Modal visible={!!detalleActual} transparent animationType="slide" onRequestClose={cerrarDetalle}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.botonCerrarModal} onPress={cerrarDetalle}>
              <Text style={{ color: '#94A3B8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>

            {detalleActual?.imagen
              ? <Image source={{ uri: detalleActual.imagen }} style={styles.modalImagen} resizeMode="cover" />
              : <View style={styles.modalImagenPlaceholder}><Text style={{ fontSize: 48 }}>🎁</Text></View>
            }

            <Text style={styles.modalNombre}>{detalleActual?.nombre}</Text>
            {detalleActual?.precio ? <Text style={styles.modalPrecio}>💰 ${detalleActual.precio}</Text> : null}

            <View style={[styles.estadoBadge, detalleYoAparte ? styles.estadoYo : detalleDisponible ? styles.estadoDisponible : styles.estadoNoDisponible, { marginBottom: 16, alignSelf: 'flex-start' }]}>
              <Text style={[styles.estadoTexto, detalleYoAparte ? styles.textoYo : detalleDisponible ? styles.textoDisponible : styles.textoNoDisponible]}>
                {detalleYoAparte ? `✓ ${t.tuLoApartaste}` : detalleDisponible ? `✅ ${t.disponibleApartar}` : `🔒 ${t.noDisponible}`}
              </Text>
            </View>

            {detalleActual?.link && (
              <TouchableOpacity style={styles.botonLinkModal} onPress={() => handleAbrirLink(detalleActual.link)}>
                <Text style={styles.botonLinkModalTexto}>🔗 {idioma === 'es' ? 'Ver en tienda' : 'View in store'}</Text>
              </TouchableOpacity>
            )}

            {detalleYoAparte && apartadoDelDetalle && (
              <TouchableOpacity style={styles.botonDangerModal} onPress={() => handleCancelar(apartadoDelDetalle)}>
                <Text style={styles.botonDangerModalTexto}>{t.cancelarApartado}</Text>
              </TouchableOpacity>
            )}

            {!detalleYoAparte && detalleDisponible && (
              <TouchableOpacity style={styles.botonPrimaryModal} onPress={() => handleApartar(detalleActual)}>
                <Text style={styles.botonPrimaryModalTexto}>🎁 {idioma === 'es' ? 'Apartar este regalo' : 'Reserve this gift'}</Text>
              </TouchableOpacity>
            )}

            {!detalleYoAparte && !detalleDisponible && (
              <Text style={styles.modalInfoTexto}>
                {idioma === 'es' ? 'Otra persona ya apartó este regalo' : 'Someone else already reserved this gift'}
              </Text>
            )}
          </View>
        </View>
      </Modal>
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
  tarjetaContenido: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tarjetaImagenMini: { width: 48, height: 48, borderRadius: 10 },
  tarjetaImagenMiniPlaceholder: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#1E2540', alignItems: 'center', justifyContent: 'center' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#14182b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  botonCerrarModal: { alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.06)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modalImagen: { width: '100%', height: 200, borderRadius: 14, marginBottom: 16 },
  modalImagenPlaceholder: { width: '100%', height: 160, borderRadius: 14, backgroundColor: 'rgba(30,37,64,0.9)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalNombre: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  modalPrecio: { fontSize: 16, color: '#F59E0B', fontWeight: '700', marginBottom: 12 },
  botonLinkModal: { width: '100%', padding: 12, backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', borderRadius: 12, alignItems: 'center', marginTop: 8 },
  botonLinkModalTexto: { color: '#8B5CF6', fontSize: 14, fontWeight: '600' },
  botonPrimaryModal: { width: '100%', padding: 16, backgroundColor: '#8B5CF6', borderRadius: 12, alignItems: 'center', marginTop: 10 },
  botonPrimaryModalTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  botonDangerModal: { width: '100%', padding: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)', borderRadius: 12, alignItems: 'center', marginTop: 10 },
  botonDangerModalTexto: { color: '#EF4444', fontSize: 15, fontWeight: 'bold' },
  modalInfoTexto: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 16 },
});