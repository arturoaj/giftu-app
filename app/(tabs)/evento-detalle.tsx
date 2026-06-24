import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIdioma } from '../../app/IdiomaContext';
import { db } from '../../firebaseConfig';

export default function EventoDetalle() {
  const router = useRouter();
  const { id, nombre, codigo } = useLocalSearchParams();
  const { t, idioma } = useIdioma();
  const [regalos, setRegalos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreRegalo, setNombreRegalo] = useState('');
  const [precioRegalo, setPrecioRegalo] = useState('');
  const [linkRegalo, setLinkRegalo] = useState('');
  const [imagenRegalo, setImagenRegalo] = useState('');
  const [cargandoPreview, setCargandoPreview] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'eventos', id as string, 'regalos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegalos(lista);
      setCargando(false);
    });
    return () => unsubscribe();
  }, [id]);

  const totalRegalos = regalos.length;
  const regalosApartados = regalos.filter((r: any) => r.estado === 'apartado').length;
  const progreso = totalRegalos > 0 ? regalosApartados / totalRegalos : 0;

  const handleCompartir = async () => {
    try {
      await Share.share({
        message: `🎁 ${t.mensajeCompartir} "${nombre}"\n\n${t.uneteConCodigo} *${codigo}*\n\n${t.descargaApp}`,
      });
    } catch (error) {
      Alert.alert(t.error, 'No se pudo compartir');
    }
  };

  const handleSeleccionarImagen = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(t.error, idioma === 'es' ? 'Necesitamos acceso a tu galería' : 'We need access to your gallery');
        return;
      }
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!resultado.canceled && resultado.assets[0].base64) {
        setImagenRegalo(`data:image/jpeg;base64,${resultado.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert(t.error, idioma === 'es' ? 'No se pudo seleccionar la imagen' : 'Could not select image');
    }
  };

  const handleCargarPreview = async () => {
    if (!linkRegalo.trim()) {
      Alert.alert(t.error, idioma === 'es' ? 'Ingresa un link primero' : 'Enter a link first');
      return;
    }
    setCargandoPreview(true);
    try {
      const url = linkRegalo.startsWith('http') ? linkRegalo : `https://${linkRegalo}`;
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.status === 'success') {
        if (data.data.image?.url && !imagenRegalo) {
          setImagenRegalo(data.data.image.url);
        }
        if (data.data.title && !nombreRegalo) {
          setNombreRegalo(data.data.title.slice(0, 60));
        }
        if (data.data.price?.amount && !precioRegalo) {
          setPrecioRegalo(String(data.data.price.amount));
        }
        Alert.alert(
          '✅',
          idioma === 'es' ? 'Información cargada automáticamente' : 'Information loaded automatically'
        );
      } else {
        Alert.alert(
          idioma === 'es' ? 'Sin vista previa' : 'No preview',
          idioma === 'es' ? 'No se pudo cargar la información, agrégala manualmente' : 'Could not load info, add it manually'
        );
      }
    } catch (error) {
      Alert.alert(
        idioma === 'es' ? 'Sin vista previa' : 'No preview',
        idioma === 'es' ? 'No se pudo cargar la información' : 'Could not load info'
      );
    } finally {
      setCargandoPreview(false);
    }
  };

  const handleAgregarRegalo = async () => {
    if (!nombreRegalo.trim()) {
      Alert.alert(t.error, t.nombreRegalObligatorio);
      return;
    }
    try {
      await addDoc(collection(db, 'eventos', id as string, 'regalos'), {
        nombre: nombreRegalo.trim(),
        precio: precioRegalo.trim(),
        link: linkRegalo.trim(),
        imagen: imagenRegalo,
        estado: 'disponible',
        creadoEn: new Date(),
      });
      setNombreRegalo('');
      setPrecioRegalo('');
      setLinkRegalo('');
      setImagenRegalo('');
      setMostrarFormulario(false);
      Alert.alert(t.listo, t.regaloAgregado);
    } catch (error) {
      Alert.alert(t.error, t.errorAgregar);
    }
  };

  const handleEliminarRegalo = async (regalo: any) => {
    if (regalo.estado === 'apartado') {
      Alert.alert(t.error, t.noSePuedeEliminar);
      return;
    }
    Alert.alert(
      t.eliminarRegalo,
      t.confirmarEliminar,
      [
        { text: t.cancelar, style: 'cancel' },
        {
          text: t.eliminar,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'eventos', id as string, 'regalos', regalo.id));
            } catch (error) {
              Alert.alert(t.error, t.errorEliminar);
            }
          }
        }
      ]
    );
  };

  const handleAbrirLink = async (link: string) => {
    if (!link) return;
    const url = link.startsWith('http') ? link : `https://${link}`;
    await Linking.openURL(url);
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
          <Text style={styles.titulo}>{nombre}</Text>

          <View style={styles.codigoBox}>
            <View>
              <Text style={styles.codigoLabel}>{t.codigoParaCompartir}</Text>
              <Text style={styles.codigo}>{codigo}</Text>
            </View>
            <TouchableOpacity style={styles.botonCompartir} onPress={handleCompartir}>
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.botonCompartirGradiente}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.botonCompartirTexto}>{t.compartir}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {totalRegalos > 0 && (
            <View style={styles.progresoContainer}>
              <View style={styles.progresoHeader}>
                <Text style={styles.progresoLabel}>
                  🎁 {regalosApartados}/{totalRegalos} {t.apartado}
                </Text>
                <Text style={styles.progresoPorcentaje}>
                  {Math.round(progreso * 100)}%
                </Text>
              </View>
              <View style={styles.progresoBarraFondo}>
                <LinearGradient
                  colors={['#8B5CF6', '#F59E0B']}
                  style={[styles.progresoBarraRelleno, { width: `${progreso * 100}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.contenido}>
          <Text style={styles.seccionTitulo}>{t.listaRegalos}</Text>

          {cargando ? (
            <ActivityIndicator size="large" color="#8B5CF6" />
          ) : regalos.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioEmoji}>🎁</Text>
              <Text style={styles.vacioTexto}>{t.sinRegalos}</Text>
              <Text style={styles.vacioSubtexto}>{t.agregaPrimero}</Text>
            </View>
          ) : (
            regalos.map((regalo: any) => (
              <View key={regalo.id} style={styles.tarjeta}>
                {regalo.imagen ? (
                  <Image
                    source={{ uri: regalo.imagen }}
                    style={styles.tarjetaImagenGrande}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.tarjetaImagenPlaceholder}>
                    <Text style={styles.tarjetaImagenEmoji}>🎁</Text>
                  </View>
                )}
                <View style={styles.tarjetaInfo}>
                  <View style={styles.tarjetaHeader}>
                    <Text style={styles.tarjetaNombre}>{regalo.nombre}</Text>
                    <TouchableOpacity onPress={() => handleEliminarRegalo(regalo)}>
                      <Text style={styles.eliminarTexto}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                  {regalo.precio ? <Text style={styles.tarjetaPrecio}>💰 ${regalo.precio}</Text> : null}
                  <View style={styles.tarjetaFooter}>
                    <View style={[styles.estadoBadge, regalo.estado === 'apartado' ? styles.estadoApartado : styles.estadoDisponible]}>
                      <Text style={[styles.estadoTexto, regalo.estado === 'apartado' ? styles.estadoApartadoTexto : styles.estadoDisponibleTexto]}>
                        {regalo.estado === 'apartado' ? `🔒 ${t.apartado}` : `✅ ${t.disponible}`}
                      </Text>
                    </View>
                    {regalo.link ? (
                      <TouchableOpacity style={styles.botonLink} onPress={() => handleAbrirLink(regalo.link)}>
                        <Text style={styles.botonLinkTexto}>🔗 {idioma === 'es' ? 'Ver en tienda' : 'View in store'}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>
            ))
          )}

          {mostrarFormulario ? (
            <View style={styles.formulario}>
              <Text style={styles.formularioTitulo}>✨ {t.nuevoRegalo}</Text>

              {/* Link con carga automática */}
              <Text style={styles.inputLabel}>
                {idioma === 'es' ? '🔗 Link de tienda' : '🔗 Store link'}
              </Text>
              <View style={styles.linkRow}>
                <TextInput
                  style={[styles.input, styles.linkInput]}
                  placeholder="amazon.com/producto..."
                  placeholderTextColor="#4B5563"
                  value={linkRegalo}
                  onChangeText={setLinkRegalo}
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <TouchableOpacity
                  style={styles.botonCargar}
                  onPress={handleCargarPreview}
                  disabled={cargandoPreview}
                >
                  {cargandoPreview ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.botonCargarTexto}>
                      {idioma === 'es' ? '⚡' : '⚡'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.linkHint}>
                {idioma === 'es' ? '⚡ Toca el rayo para cargar info automáticamente' : '⚡ Tap lightning to load info automatically'}
              </Text>

              {/* Foto */}
              <Text style={styles.inputLabel}>
                {idioma === 'es' ? '📷 Foto del regalo' : '📷 Gift photo'}
              </Text>
              {imagenRegalo ? (
                <View style={styles.imagenPreviewContainer}>
                  <Image source={{ uri: imagenRegalo }} style={styles.imagenPreview} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.cambiarFotoBtn}
                    onPress={() => setImagenRegalo('')}
                  >
                    <Text style={styles.cambiarFotoTexto}>{idioma === 'es' ? '✕ Quitar foto' : '✕ Remove photo'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagenPicker} onPress={handleSeleccionarImagen}>
                  <Text style={styles.imagenPickerEmoji}>📷</Text>
                  <Text style={styles.imagenPickerTexto}>{idioma === 'es' ? 'Tocar para agregar foto' : 'Tap to add photo'}</Text>
                </TouchableOpacity>
              )}

              {/* Nombre */}
              <Text style={styles.inputLabel}>{t.nombreRegalo}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.ejNombre}
                placeholderTextColor="#4B5563"
                value={nombreRegalo}
                onChangeText={setNombreRegalo}
              />

              {/* Precio */}
              <Text style={styles.inputLabel}>{t.precio}</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#4B5563"
                value={precioRegalo}
                onChangeText={setPrecioRegalo}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.botonGuardar} onPress={handleAgregarRegalo}>
                <LinearGradient
                  colors={['#8B5CF6', '#A855F7']}
                  style={styles.botonGradiente}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.botonTexto}>{t.guardarRegalo}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => {
                  setMostrarFormulario(false);
                  setImagenRegalo('');
                  setLinkRegalo('');
                  setNombreRegalo('');
                  setPrecioRegalo('');
                }}
              >
                <Text style={styles.botonCancelarTexto}>{t.cancelar}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.botonAgregar} onPress={() => setMostrarFormulario(true)}>
              <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.botonGradiente}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.botonTexto}>{t.agregarRegalo}</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16 },
  codigoBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161B2E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2D3343', marginBottom: 16 },
  codigoLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  codigo: { fontSize: 24, fontWeight: 'bold', color: '#F59E0B', letterSpacing: 4 },
  botonCompartir: { borderRadius: 12, overflow: 'hidden' },
  botonCompartirGradiente: { paddingHorizontal: 16, paddingVertical: 10 },
  botonCompartirTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  progresoContainer: { backgroundColor: '#161B2E', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2D3343' },
  progresoHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progresoLabel: { fontSize: 13, color: '#94A3B8' },
  progresoPorcentaje: { fontSize: 13, fontWeight: 'bold', color: '#F59E0B' },
  progresoBarraFondo: { height: 8, backgroundColor: '#1E2540', borderRadius: 4, overflow: 'hidden' },
  progresoBarraRelleno: { height: 8, borderRadius: 4 },
  contenido: { paddingHorizontal: 24 },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 12 },
  vacio: { backgroundColor: '#161B2E', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#2D3343' },
  vacioEmoji: { fontSize: 36, marginBottom: 10 },
  vacioTexto: { fontSize: 15, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 4 },
  vacioSubtexto: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  tarjeta: { backgroundColor: '#161B2E', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2D3343', overflow: 'hidden' },
  tarjetaImagenGrande: { width: '100%', height: 180 },
  tarjetaImagenPlaceholder: { width: '100%', height: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E2540' },
  tarjetaImagenEmoji: { fontSize: 40 },
  tarjetaInfo: { padding: 14 },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tarjetaNombre: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', flex: 1 },
  tarjetaPrecio: { fontSize: 13, color: '#F59E0B', fontWeight: '600', marginBottom: 8 },
  tarjetaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eliminarTexto: { fontSize: 16 },
  estadoBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  estadoDisponible: { backgroundColor: '#10B98120', borderWidth: 1, borderColor: '#10B98140' },
  estadoApartado: { backgroundColor: '#F59E0B20', borderWidth: 1, borderColor: '#F59E0B40' },
  estadoTexto: { fontSize: 11, fontWeight: '600' },
  estadoDisponibleTexto: { color: '#10B981' },
  estadoApartadoTexto: { color: '#F59E0B' },
  botonLink: { backgroundColor: '#8B5CF620', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#8B5CF640' },
  botonLinkTexto: { color: '#8B5CF6', fontSize: 12, fontWeight: '600' },
  formulario: { backgroundColor: '#161B2E', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D3343' },
  formularioTitulo: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 8, marginTop: 4 },
  linkRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  linkInput: { flex: 1, marginBottom: 0 },
  botonCargar: { backgroundColor: '#8B5CF6', borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  botonCargarTexto: { fontSize: 20 },
  linkHint: { fontSize: 11, color: '#6B7280', marginBottom: 16 },
  imagenPicker: { backgroundColor: '#1E2540', borderRadius: 12, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#2D3343', gap: 8 },
  imagenPickerEmoji: { fontSize: 32 },
  imagenPickerTexto: { color: '#6B7280', fontSize: 14 },
  imagenPreviewContainer: { marginBottom: 16 },
  imagenPreview: { width: '100%', height: 180, borderRadius: 12 },
  cambiarFotoBtn: { marginTop: 8, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#EF444440', backgroundColor: '#EF444415' },
  cambiarFotoTexto: { color: '#EF4444', fontSize: 13 },
  input: { backgroundColor: '#1E2540', borderWidth: 1, borderColor: '#2D3343', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12, color: '#F8FAFC' },
  botonAgregar: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  botonGuardar: { borderRadius: 12, overflow: 'hidden', marginBottom: 10 },
  botonGradiente: { padding: 16, alignItems: 'center' },
  botonTexto: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  botonCancelar: { padding: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2D3343' },
  botonCancelarTexto: { color: '#6B7280', fontSize: 14 },
});