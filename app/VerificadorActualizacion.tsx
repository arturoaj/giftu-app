import Constants from 'expo-constants';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function VerificadorActualizacion() {
  const [necesitaActualizar, setNecesitaActualizar] = useState(false);
  const [urlDescarga, setUrlDescarga] = useState('');
  const [obligatoria, setObligatoria] = useState(false);

  useEffect(() => {
    // El aviso de actualización solo aplica al APK de Android/iOS, no a la web
    if (Platform.OS === 'web') return;

    const verificar = async () => {
      try {
        const ref = doc(db, 'config', 'version_app');
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const datos = snap.data();
        const versionInstalada = Constants.expoConfig?.version || '0.0.0';
        const versionUltima = datos.ultimaVersion;

        if (versionUltima && versionInstalada !== versionUltima) {
          setUrlDescarga(datos.urlApk || '');
          setObligatoria(!!datos.actualizacionObligatoria);
          setNecesitaActualizar(true);
        }
      } catch (e) {
        // Si falla la verificación (sin internet, etc.), no bloqueamos el uso de la app
      }
    };

    verificar();
  }, []);

  const descargar = () => {
    if (urlDescarga) Linking.openURL(urlDescarga);
  };

  if (!necesitaActualizar) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!obligatoria) setNecesitaActualizar(false);
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎁</Text>
          <Text style={styles.titulo}>Nueva versión disponible</Text>
          <Text style={styles.texto}>
            {obligatoria
              ? 'Giftu tiene una actualización importante. Es necesario instalarla para seguir usando la app.'
              : 'Giftu tiene una actualización lista con mejoras.'}
          </Text>

          <TouchableOpacity style={styles.boton} onPress={descargar}>
            <Text style={styles.botonTexto}>⬇️ Descargar actualización</Text>
          </TouchableOpacity>

          {!obligatoria && (
            <TouchableOpacity style={styles.botonSecundario} onPress={() => setNecesitaActualizar(false)}>
              <Text style={styles.botonSecundarioTexto}>Más tarde</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#14182b', borderRadius: 20, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  emoji: { fontSize: 48, marginBottom: 12 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  texto: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  boton: { backgroundColor: '#8B5CF6', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center' },
  botonTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  botonSecundario: { marginTop: 12, paddingVertical: 8 },
  botonSecundarioTexto: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
});