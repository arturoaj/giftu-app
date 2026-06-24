import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIdioma } from '../../app/IdiomaContext';
import { auth, db } from '../../firebaseConfig';

export default function Unirse() {
  const [codigo, setCodigo] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const { t, idioma } = useIdioma();

  const handleUnirse = async () => {
    if (!codigo.trim()) {
      Alert.alert(t.error, t.ingresaCodigoError);
      return;
    }
    setCargando(true);
    try {
      const q = query(
        collection(db, 'eventos'),
        where('codigo', '==', codigo.trim().toUpperCase())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert(t.error, t.codigoIncorrecto);
        setCargando(false);
        return;
      }

      const eventoDoc = snapshot.docs[0];
      const evento = { id: eventoDoc.id, ...eventoDoc.data() } as any;
      const usuario = auth.currentUser;

      const participacionQuery = query(
        collection(db, 'participaciones'),
        where('usuarioId', '==', usuario?.uid),
        where('eventoId', '==', evento.id)
      );
      const participacionSnapshot = await getDocs(participacionQuery);

      if (participacionSnapshot.empty) {
        await addDoc(collection(db, 'participaciones'), {
          usuarioId: usuario?.uid,
          usuarioEmail: usuario?.email,
          eventoId: evento.id,
          eventoNombre: evento.nombre,
          rol: 'participante',
          unidoEn: new Date(),
        });
      }

      router.replace({
        pathname: '/(tabs)/participante-evento',
        params: { id: evento.id, nombre: evento.nombre, codigo: evento.codigo }
      });

    } catch (error) {
      Alert.alert(t.error, t.errorUnirse);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/dashboard')}
          style={styles.botonRegresar}
        >
          <Text style={styles.botonRegresarTexto}>← {t.regresar}</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>{t.unirseEvento}</Text>
        <Text style={styles.subtitulo}>{t.ingresaCodigo}</Text>
      </View>

      <View style={styles.formulario}>

        <View style={styles.codigoInputContainer}>
          <Text style={styles.inputLabel}>{t.codigoEvento}</Text>
          <TextInput
            style={styles.codigoInput}
            placeholder="XXXXXX"
            placeholderTextColor="#2D3343"
            value={codigo}
            onChangeText={setCodigo}
            autoCapitalize="characters"
            maxLength={6}
            autoFocus
          />
          <Text style={styles.codigoHint}>
            {idioma === 'es' ? '6 caracteres — letras y números' : '6 characters — letters and numbers'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDesactivado]}
          onPress={handleUnirse}
          disabled={cargando}
        >
          <LinearGradient
            colors={['#F59E0B', '#FBBF24']}
            style={styles.botonGradiente}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>🔑 {t.unirseBtn}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoTexto}>
            {idioma === 'es'
              ? 'El organizador del evento te compartió un código de 6 caracteres. Ingrésalo arriba para ver la lista de regalos.'
              : 'The event organizer shared a 6-character code with you. Enter it above to see the gift list.'}
          </Text>
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