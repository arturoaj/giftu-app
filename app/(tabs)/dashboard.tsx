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
        try {
          await signOut(auth);
          router.replace('/(tabs)');
        } catch (error) {
          window.alert('No se pudo cerrar sesión');
        }
      }
    } else {
      Alert.alert(
        t.cerrarSesion,
        t.cerrarSesionPregunta,
        [
          { text: t.cancelar, style: 'cancel' },
          {
            text: t.salir,
            onPress: async () => {
              try {
                await signOut(auth);
                router.replace('/(tabs)');
              } catch (error) {
                Alert.alert(t.error, 'No se pudo cerrar sesión');
              }
            }
          }
        ]
      );
    }
  };

  const nombre = usuario?.displayName || usuario?.email?.split('@')[0] || 'Usuario';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#161B2E', '#0D0D0D']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.saludo}>
                {idioma === 'es' ? '¡Hola,' : 'Hello,'} <Text style={styles.saludoNombre}>{nombre} 👋</Text>
              </Text>
              <Text style={styles.saludoSub}>
                {idioma === 'es' ? 'Bienvenido a Giftu' : 'Welcome to Giftu'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.botonSalirIcon}>
              <Text style={styles.botonSalirIconTexto}>⎋</Text>
            </TouchableOpacity>
          </View>

          {/* Stats bar */}
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

          {/* Botones de acción */}
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

          {/* Mis eventos */}
          <Text style={styles.seccionTitulo}>{t.misEventos}</Text>
          {cargando ? (
            <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
          ) : eventos.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioEmoji}>🎉</Text>
              <Text style={styles.vacioTexto}>{t.sinEventos}</Text>
              <Text style={styles.vacioSubtexto}>{t.creaEvento}</Text>
            </View>
          ) : (
            eventos.map((evento: any) => (
              <TouchableOpacity
                key={evento.id}
                style={styles.tarjeta}
                onPress={() => router.push({
                  pathname: '/(tabs)/evento-detalle',
                  params: { id: evento.id, nombre: evento.nombre, codigo: evento.codigo }
                })}
              >
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
          )}

          {/* Eventos donde participo */}
          <Text style={styles.seccionTitulo}>{t.eventosDondeParticipo}</Text>
          {cargandoP ? (
            <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
          ) : participaciones.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioEmoji}>🔑</Text>
              <Text style={styles.vacioTexto}>{t.sinParticipar}</Text>
              <Text style={styles.vacioSubtexto}>{t.usaCodigo}</Text>
            </View>
          ) : (
            participaciones.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                style={styles.tarjetaDorada}
                onPress={() => router.push({
                  pathname: '/(tabs)/participante-evento',
                  params: { id: p.eventoId, nombre: p.eventoNombre, codigo: '' }
                })}
              >
                <View style={styles.tarjetaHeader}>
                  <Text style={styles.tarjetaNombre}>{p.eventoNombre}</Text>
                  <Text style={styles.tarjetaFlecha}>→</Text>
                </View>
                <View style={styles.participanteBadge}>
                  <Text style={styles.participanteTexto}>🎁 {t.participante}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

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
  vacio: { backgroundColor: '#161B2E', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#2D3343' },
  vacioEmoji: { fontSize: 36, marginBottom: 10 },
  vacioTexto: { fontSize: 15, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 4 },
  vacioSubtexto: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  tarjeta: { backgroundColor: '#161B2E', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#2D3343', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  tarjetaDorada: { backgroundColor: '#161B2E', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#F59E0B40', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tarjetaNombre: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', flex: 1 },
  tarjetaFlecha: { fontSize: 16, color: '#8B5CF6' },
  tarjetaFecha: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  codigoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2540', padding: 10, borderRadius: 10 },
  codigoLabel: { fontSize: 12, color: '#6B7280' },
  codigo: { fontSize: 14, fontWeight: 'bold', color: '#F59E0B', letterSpacing: 3 },
  participanteBadge: { backgroundColor: '#F59E0B20', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#F59E0B40' },
  participanteTexto: { fontSize: 12, fontWeight: '600', color: '#F59E0B' },
});