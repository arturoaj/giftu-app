import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useIdioma } from '../../app/IdiomaContext';
import { auth, db } from '../../firebaseConfig';

export default function Dashboard() {
  const router = useRouter();
  const usuario = auth.currentUser;
  const { t, idioma } = useIdioma();
  const [eventos, setEventos] = useState([]);
  const [participaciones, setParticipaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoP, setCargandoP] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const q = query(collection(db, 'eventos'), where('creadoPor', '==', usuario.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(lista);
      setCargando(false);
    });
    return () => unsubscribe();
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;
    const q = query(collection(db, 'participaciones'), where('usuarioId', '==', usuario.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipaciones(lista);
      setCargandoP(false);
    });
    return () => unsubscribe();
  }, [usuario]);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(idioma === 'es' ? '¿Cerrar sesión?' : 'Sign out?');
      if (confirmar) {
        try { await signOut(auth); router.replace('/(tabs)'); }
        catch { window.alert('No se pudo cerrar sesión'); }
      }
    } else {
      Alert.alert(t.cerrarSesion, t.cerrarSesionPregunta, [
        { text: t.cancelar, style: 'cancel' },
        {
          text: t.salir, onPress: async () => {
            try { await signOut(auth); router.replace('/(tabs)'); }
            catch { Alert.alert(t.error, 'No se pudo cerrar sesión'); }
          }
        }
      ]);
    }
  };

  const nombre = usuario?.displayName || usuario?.email?.split('@')[0] || 'Usuario';

  if (Platform.OS === 'web') {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #0a0818; }

          .dash-card {
            background: rgba(22,27,46,0.8);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 16px;
            padding: 20px 24px;
            margin-bottom: 12px;
            min-height: 110px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            gap: 10px;
            transition: border-color 0.2s, background 0.2s;
          }
          .dash-card:hover {
            border-color: rgba(139,92,246,0.35);
            background: rgba(139,92,246,0.06);
          }
          .dash-card-gold { border-color: rgba(245,158,11,0.25) !important; }
          .dash-card-gold:hover {
            border-color: rgba(245,158,11,0.5) !important;
            background: rgba(245,158,11,0.06) !important;
          }
          .card-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .card-bottom {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(30,37,64,0.9);
            padding: 10px 14px;
            border-radius: 10px;
          }
          .btn-accion {
            flex: 1; padding: 20px; border: none; border-radius: 16px;
            cursor: pointer; font-family: inherit;
            transition: opacity 0.2s, transform 0.2s;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
          }
          .btn-accion:hover { opacity: 0.88; transform: translateY(-2px); }
          .btn-logout {
            padding: 8px 16px; border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            background: transparent; color: rgba(255,255,255,0.5);
            font-size: 13px; font-weight: 600; cursor: pointer;
            font-family: inherit; transition: all 0.2s;
          }
          .btn-logout:hover { border-color: #EF4444; color: #EF4444; }
          .vacio-box {
            background: rgba(22,27,46,0.8);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 16px;
            padding: 24px 32px;
            text-align: center;
            margin-bottom: 24px;
            min-height: 110px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
        `}</style>

        <div style={{
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          backgroundColor: '#0a0818',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>

          {/* Navbar */}
          <div style={{
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '0 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 64,
            backgroundColor: 'rgba(10,8,24,0.95)',
            position: 'sticky', top: 0, zIndex: 100,
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>🎁</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Giftu</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginRight: 8 }}>
                {idioma === 'es' ? '¡Hola,' : 'Hello,'}{' '}
                <strong style={{ color: '#fff' }}>{nombre}</strong>
              </span>
              <button className="btn-logout" onClick={handleLogout}>
                {idioma === 'es' ? '⎋ Salir' : '⎋ Sign out'}
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px 60px 24px' }}>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { num: eventos.length, label: idioma === 'es' ? 'Mis eventos' : 'My events', color: '#8B5CF6' },
                { num: participaciones.length, label: idioma === 'es' ? 'Participo en' : 'Joined', color: '#F59E0B' },
                { num: '🎁', label: 'Giftu', color: '#EC4899' },
              ].map((s, i) => (
                <div key={i} style={{
                  backgroundColor: 'rgba(22,27,46,0.8)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, padding: '20px 24px', textAlign: 'center' as any
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginBottom: 6 }}>{s.num}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Botones acción */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
              <button className="btn-accion"
                onClick={() => router.push('/(tabs)/crear-evento')}
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #A855F7)' }}>
                <span style={{ fontSize: 28 }}>✨</span>
                <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
                  {idioma === 'es' ? 'Crear evento' : 'Create event'}
                </span>
              </button>
              <button className="btn-accion"
                onClick={() => router.push('/(tabs)/unirse')}
                style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}>
                <span style={{ fontSize: 28 }}>🔑</span>
                <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
                  {idioma === 'es' ? 'Unirse con código' : 'Join with code'}
                </span>
              </button>
            </div>

            {/* Mis eventos */}
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{t.misEventos}</div>
            {cargando
              ? <div style={{ textAlign: 'center' as any, padding: 40, color: '#8B5CF6' }}>Cargando...</div>
              : eventos.length === 0
                ? (
                  <div className="vacio-box">
                    <div style={{ fontSize: 36 }}>🎉</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#8B5CF6' }}>{t.sinEventos}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{t.creaEvento}</div>
                  </div>
                )
                : eventos.map((evento: any) => (
                  <div key={evento.id} className="dash-card"
                    onClick={() => router.push({
                      pathname: '/(tabs)/evento-detalle',
                      params: { id: evento.id, nombre: evento.nombre, codigo: evento.codigo }
                    })}>
                    <div className="card-row">
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{evento.nombre}</span>
                      <span style={{ color: '#8B5CF6', fontSize: 18 }}>→</span>
                    </div>
                    {evento.fecha && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>📅 {evento.fecha}</div>
                    )}
                    <div className="card-bottom">
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.codigoParaCompartir}:</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B', letterSpacing: 3 }}>{evento.codigo}</span>
                    </div>
                  </div>
                ))
            }

            {/* Eventos donde participo */}
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16, marginTop: 32 }}>
              {t.eventosDondeParticipo}
            </div>
            {cargandoP
              ? <div style={{ textAlign: 'center' as any, padding: 40, color: '#F59E0B' }}>Cargando...</div>
              : participaciones.length === 0
                ? (
                  <div className="vacio-box">
                    <div style={{ fontSize: 36 }}>🔑</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#F59E0B' }}>{t.sinParticipar}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{t.usaCodigo}</div>
                  </div>
                )
                : participaciones.map((p: any) => (
                  <div key={p.id} className="dash-card dash-card-gold"
                    onClick={() => router.push({
                      pathname: '/(tabs)/participante-evento',
                      params: { id: p.eventoId, nombre: p.eventoNombre, codigo: '' }
                    })}>
                    <div className="card-row">
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{p.eventoNombre}</span>
                      <span style={{ color: '#F59E0B', fontSize: 18 }}>→</span>
                    </div>
                    <div className="card-bottom">
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {idioma === 'es' ? 'Rol:' : 'Role:'}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>🎁 {t.participante}</span>
                    </div>
                  </div>
                ))
            }

            <div style={{ height: 40 }} />
          </div>
        </div>
      </>
    );
  }

  // ── MÓVIL ─────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#161B2E', '#0D0D0D']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.saludo}>
                {idioma === 'es' ? '¡Hola,' : 'Hello,'}{' '}
                <Text style={styles.saludoNombre}>{nombre} 👋</Text>
              </Text>
              <Text style={styles.saludoSub}>
                {idioma === 'es' ? 'Bienvenido a Giftu' : 'Welcome to Giftu'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.botonSalirIcon}>
              <Text style={styles.botonSalirIconTexto}>⎋</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumero}>{eventos.length}</Text>
              <Text style={styles.statLabel}>{idioma === 'es' ? 'Eventos' : 'Events'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumero}>{participaciones.length}</Text>
              <Text style={styles.statLabel}>{idioma === 'es' ? 'Participo' : 'Joined'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumero}>🎁</Text>
              <Text style={styles.statLabel}>Giftu</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contenido}>
          <View style={styles.accionesRow}>
            <TouchableOpacity style={styles.accionBoton} onPress={() => router.push('/(tabs)/crear-evento')}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.accionGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.accionEmoji}>✨</Text>
                <Text style={styles.accionTexto}>{idioma === 'es' ? 'Crear\nevento' : 'Create\nevent'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accionBoton} onPress={() => router.push('/(tabs)/unirse')}>
              <LinearGradient colors={['#F59E0B', '#FBBF24']} style={styles.accionGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.accionEmoji}>🔑</Text>
                <Text style={styles.accionTexto}>{idioma === 'es' ? 'Unirse\ncon código' : 'Join\nwith code'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.seccionTitulo}>{t.misEventos}</Text>
          {cargando
            ? <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
            : eventos.length === 0
              ? (
                <View style={styles.vacio}>
                  <Text style={styles.vacioEmoji}>🎉</Text>
                  <Text style={styles.vacioTexto}>{t.sinEventos}</Text>
                  <Text style={styles.vacioSubtexto}>{t.creaEvento}</Text>
                </View>
              )
              : eventos.map((evento: any) => (
                <TouchableOpacity key={evento.id} style={styles.tarjeta}
                  onPress={() => router.push({
                    pathname: '/(tabs)/evento-detalle',
                    params: { id: evento.id, nombre: evento.nombre, codigo: evento.codigo }
                  })}>
                  <View style={styles.tarjetaHeader}>
                    <Text style={styles.tarjetaNombre}>{evento.nombre}</Text>
                    <Text style={styles.tarjetaFlecha}>→</Text>
                  </View>
                  {evento.fecha ? <Text style={styles.tarjetaFecha}>📅 {evento.fecha}</Text> : null}
                  <View style={styles.codigoContainer}>
                    <Text style={styles.codigoLabel}>{t.codigoParaCompartir}: </Text>
                    <Text style={styles.codigo}>{evento.codigo}</Text>
                  </View>
                </TouchableOpacity>
              ))
          }

          <Text style={styles.seccionTitulo}>{t.eventosDondeParticipo}</Text>
          {cargandoP
            ? <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
            : participaciones.length === 0
              ? (
                <View style={styles.vacio}>
                  <Text style={styles.vacioEmoji}>🔑</Text>
                  <Text style={styles.vacioTexto}>{t.sinParticipar}</Text>
                  <Text style={styles.vacioSubtexto}>{t.usaCodigo}</Text>
                </View>
              )
              : participaciones.map((p: any) => (
                <TouchableOpacity key={p.id} style={styles.tarjetaDorada}
                  onPress={() => router.push({
                    pathname: '/(tabs)/participante-evento',
                    params: { id: p.eventoId, nombre: p.eventoNombre, codigo: '' }
                  })}>
                  <View style={styles.tarjetaHeader}>
                    <Text style={styles.tarjetaNombre}>{p.eventoNombre}</Text>
                    <Text style={[styles.tarjetaFlecha, { color: '#F59E0B' }]}>→</Text>
                  </View>
                  <View style={styles.codigoContainer}>
                    <Text style={styles.codigoLabel}>{idioma === 'es' ? 'Rol: ' : 'Role: '}</Text>
                    <Text style={[styles.codigo, { color: '#F59E0B' }]}>🎁 {t.participante}</Text>
                  </View>
                </TouchableOpacity>
              ))
          }

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  saludo: { fontSize: 22, color: '#94A3B8', fontWeight: '400' },
  saludoNombre: { color: '#F8FAFC', fontWeight: 'bold' },
  saludoSub: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  botonSalirIcon: { backgroundColor: '#161B2E', borderWidth: 1, borderColor: '#2D3343', borderRadius: 12, padding: 10 },
  botonSalirIconTexto: { fontSize: 18, color: '#6B7280' },
  statsContainer: { flexDirection: 'row', backgroundColor: '#161B2E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2D3343' },
  statBox: { flex: 1, alignItems: 'center' },
  statNumero: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statDivider: { width: 1, backgroundColor: '#2D3343', marginHorizontal: 8 },
  contenido: { padding: 24 },
  accionesRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  accionBoton: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  accionGradiente: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 100 },
  accionEmoji: { fontSize: 28, marginBottom: 8 },
  accionTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12, marginTop: 4 },
  vacio: { backgroundColor: '#161B2E', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#2D3343', minHeight: 110, justifyContent: 'center' },
  vacioEmoji: { fontSize: 36, marginBottom: 10 },
  vacioTexto: { fontSize: 15, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 4 },
  vacioSubtexto: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  tarjeta: { backgroundColor: '#161B2E', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#2D3343', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3, minHeight: 110 },
  tarjetaDorada: { backgroundColor: '#161B2E', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F59E0B40', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3, minHeight: 110 },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tarjetaNombre: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', flex: 1 },
  tarjetaFlecha: { fontSize: 16, color: '#8B5CF6' },
  tarjetaFecha: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  codigoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2540', padding: 10, borderRadius: 10, marginTop: 4 },
  codigoLabel: { fontSize: 12, color: '#6B7280' },
  codigo: { fontSize: 14, fontWeight: 'bold', color: '#F59E0B', letterSpacing: 3 },
});