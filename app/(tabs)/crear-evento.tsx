import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const { t } = useIdioma();

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Alert.alert(t.error, t.nombreObligatorio);
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
        codigo: codigo,
        creadoPor: usuario?.uid,
        creadoPorEmail: usuario?.email,
        estado: 'activo',
        creadoEn: new Date(),
      });
      Alert.alert(
        t.eventoCreado,
        `${t.codigoCompartir} ${codigo}`,
        [{ text: t.ok, onPress: () => router.replace('/(tabs)/dashboard') }]
      );
    } catch (error) {
      Alert.alert(t.error, t.errorCrear);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/dashboard')}
            style={styles.botonRegresar}
          >
            <Text style={styles.botonRegresarTexto}>← {t.regresar}</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>{t.nuevoEvento}</Text>
          <Text style={styles.subtitulo}>
            {t.descripcion === 'Description' ? 'Fill in the details of your event' : 'Completa los detalles de tu evento'}
          </Text>
        </View>

        <View style={styles.formulario}>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.nombreEvento}</Text>
            <TextInput
              style={styles.input}
              placeholder={t.ejNombre}
              placeholderTextColor="#4B5563"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.descripcion}</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder={t.ejDescripcion}
              placeholderTextColor="#4B5563"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t.fecha} 📅</Text>
            <TextInput
              style={styles.input}
              placeholder={t.ejFecha}
              placeholderTextColor="#4B5563"
              value={fecha}
              onChangeText={setFecha}
            />
          </View>

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDesactivado]}
            onPress={handleCrear}
            disabled={cargando}
          >
            <LinearGradient
              colors={cargando ? ['#374151', '#374151'] : ['#8B5CF6', '#A855F7']}
              style={styles.botonGradiente}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.botonTexto}>
                {cargando ? t.creando : `✨ ${t.crearEventoBtn}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={() => router.replace('/(tabs)/dashboard')}
          >
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