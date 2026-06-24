import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useIdioma } from '../../app/IdiomaContext';
import { auth, db } from '../../firebaseConfig';

export default function ParticipanteEvento() {
  const router = useRouter();
  const { id, nombre } = useLocalSearchParams();
  const { t, idioma } = useIdioma();
  const [regalos, setRegalos] = useState([]);
  const [misApartados, setMisApartados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarConfetti, setMostrarConfetti] = useState(false);
  const confettiRef = useRef<any>(null);
  const usuario = auth.currentUser;

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
    const q = query(
      collection(db, 'apartados_privados'),
      where('usuarioId', '==', usuario?.uid),
      where('eventoId', '==', id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMisApartados(lista);
    });
    return () => unsubscribe();
  }, [id]);

  const handleApartar = async (regalo: any) => {
    if (regalo.estado === 'apartado') {
      Alert.alert(t.error, t.noDisponible);
      return;
    }

    Alert.alert(
      t.apartarRegalo,
      `${t.quieresApartar} "${regalo.nombre}"?`,
      [
        { text: t.cancelar, style: 'cancel' },
        {
          text: t.siApartar,
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'eventos', id as string, 'regalos', regalo.id), {
                estado: 'apartado'
              });
              await addDoc(collection(db, 'apartados_privados'), {
                usuarioId: usuario?.uid,
                usuarioEmail: usuario?.email,
                eventoId: id,
                regaloId: regalo.id,
                regaloNombre: regalo.nombre,
                fechaApartado: new Date(),
                cancelado: false,
              });
              setMostrarConfetti(true);
              setTimeout(() => setMostrarConfetti(false), 3000);
              Alert.alert('🎉', t.apartadoExito);
            } catch (error) {
              Alert.alert(t.error, t.errorApartar);
            }
          }
        }
      ]
    );
  };

  const handleCancelar = async (apartado: any) => {
    Alert.alert(
      t.cancelarApartadoPregunta,
      `${t.quieresLiberar} "${apartado.regaloNombre}"?`,
      [
        { text: t.cancelar, style: 'cancel' },
        {
          text: t.siCancelar,
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'eventos', id as string, 'regalos', apartado.regaloId), {
                estado: 'disponible'
              });
              await deleteDoc(doc(db, 'apartados_privados', apartado.id));
              Alert.alert(t.listo, t.regaloCancelado);
            } catch (error) {
              Alert.alert(t.error, t.errorCancelar);
            }
          }
        }
      ]
    );
  };

  const misApartadosIds = misApartados.map((a: any) => a.regaloId);
  const totalRegalos = regalos.length;
  const regalosDisponibles = regalos.filter((r: any) => r.estado === 'disponible').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {mostrarConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: 200, y: 0 }}
          autoStart={true}
          fadeOut={true}
          colors={['#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#FBBF24']}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/dashboard')}
            style={styles.botonRegresar}
          >
            <Text style={styles.botonRegresarTexto}>← {t.regresar}</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>{nombre}</Text>
          <Text style={styles.subtitulo}>
            🎁 {regalosDisponibles} {idioma === 'es' ? 'regalos disponibles de' : 'gifts available of'} {totalRegalos}
          </Text>
        </View>

        <View style={styles.contenido}>

          {/* Mis apartados */}
          {misApartados.length > 0 && (
            <View style={styles.misApartadosBox}>
              <Text style={styles.misApartadosTitulo}>{t.misRegalosApartados}</Text>
              {misApartados.map((apartado: any) => (
                <View key={apartado.id} style={styles.tarjetaApartada}>
                  <Text style={styles.tarjetaApartadaNombre}>{apartado.regaloNombre}</Text>
                  <TouchableOpacity
                    style={styles.botonCancelarApartado}
                    onPress={() => handleCancelar(apartado)}
                  >
                    <Text style={styles.botonCancelarTexto}>{t.cancelarApartado}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Lista de regalos */}
          <Text style={styles.seccionTitulo}>{t.listaRegalos}</Text>

          {cargando ? (
            <ActivityIndicator size="large" color="#8B5CF6" />
          ) : (
            regalos.map((regalo: any) => {
              const yoAparte = misApartadosIds.includes(regalo.id);
              const disponible = regalo.estado !== 'apartado';
              return (
                <TouchableOpacity
                  key={regalo.id}
                  style={[
                    styles.tarjeta,
                    yoAparte && styles.tarjetaYo,
                    !disponible && !yoAparte && styles.tarjetaNoDisponible,
                  ]}
                  onPress={() => disponible && !yoAparte && handleApartar(regalo)}
                  disabled={!disponible && !yoAparte}
                  activeOpacity={disponible ? 0.7 : 1}
                >
                  <View style={styles.tarjetaHeader}>
                    <Text style={[styles.tarjetaNombre, !disponible && !yoAparte && styles.tarjetaNombreMuted]}>
                      {regalo.nombre}
                    </Text>
                    {yoAparte && <Text style={styles.checkEmoji}>✓</Text>}
                  </View>

                  {regalo.precio ? (
                    <Text style={styles.tarjetaPrecio}>💰 ${regalo.precio}</Text>
                  ) : null}

                  <View style={[
                    styles.estadoBadge,
                    yoAparte ? styles.estadoYo : disponible ? styles.estadoDisponible : styles.estadoNoDisponible
                  ]}>
                    <Text style={[
                      styles.estadoTexto,
                      yoAparte ? styles.textoYo : disponible ? styles.textoDisponible : styles.textoNoDisponible
                    ]}>
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