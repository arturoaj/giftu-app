import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const mostrarAlerta = (titulo: string, mensaje: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}\n\n${mensaje}`);
      if (onOk) onOk();
    } else {
      Alert.alert(titulo, mensaje, onOk ? [{ text: t.ok, onPress: onOk }] : undefined);
    }
  };

  const handleCompartir = async () => {
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(`🎁 Evento: "${nombre}"\nCódigo: ${codigo}\ngiftu-app.vercel.app`);
        window.alert(idioma === 'es' ? '✅ Código copiado al portapapeles' : '✅ Code copied to clipboard');
      } catch {
        window.alert(`Código del evento: ${codigo}`);
      }
    } else {
      try {
        await Share.share({ message: `🎁 ${t.mensajeCompartir} "${nombre}"\n\n${t.uneteConCodigo} *${codigo}*\n\n${t.descargaApp}` });
      } catch { Alert.alert(t.error, 'No se pudo compartir'); }
    }
  };

  const handleSeleccionarImagen = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onload = (ev: any) => setImagenRegalo(ev.target.result); reader.readAsDataURL(file); }
      };
      input.click(); return;
    }
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) { Alert.alert(t.error, idioma === 'es' ? 'Necesitamos acceso a tu galería' : 'We need access to your gallery'); return; }
      const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
      if (!resultado.canceled && resultado.assets[0].base64) setImagenRegalo(`data:image/jpeg;base64,${resultado.assets[0].base64}`);
    } catch { Alert.alert(t.error, idioma === 'es' ? 'No se pudo seleccionar la imagen' : 'Could not select image'); }
  };

  const handleCargarPreview = async () => {
    if (!linkRegalo.trim()) { mostrarAlerta(t.error, idioma === 'es' ? 'Ingresa un link primero' : 'Enter a link first'); return; }
    setCargandoPreview(true);
    try {
      const url = linkRegalo.startsWith('http') ? linkRegalo : `https://${linkRegalo}`;
      const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      if (data.status === 'success') {
        if (data.data.image?.url && !imagenRegalo) setImagenRegalo(data.data.image.url);
        if (data.data.title && !nombreRegalo) setNombreRegalo(data.data.title.slice(0, 60));
        if (data.data.price?.amount && !precioRegalo) setPrecioRegalo(String(data.data.price.amount));
        mostrarAlerta('✅', idioma === 'es' ? 'Información cargada automáticamente' : 'Information loaded automatically');
      } else {
        mostrarAlerta(idioma === 'es' ? 'Sin vista previa' : 'No preview', idioma === 'es' ? 'No se pudo cargar la información' : 'Could not load info');
      }
    } catch { mostrarAlerta(idioma === 'es' ? 'Sin vista previa' : 'No preview', idioma === 'es' ? 'No se pudo cargar la información' : 'Could not load info'); }
    finally { setCargandoPreview(false); }
  };

  const handleAgregarRegalo = async () => {
    if (!nombreRegalo.trim()) { mostrarAlerta(t.error, t.nombreRegalObligatorio); return; }
    try {
      await addDoc(collection(db, 'eventos', id as string, 'regalos'), { nombre: nombreRegalo.trim(), precio: precioRegalo.trim(), link: linkRegalo.trim(), imagen: imagenRegalo, estado: 'disponible', creadoEn: new Date() });
      setNombreRegalo(''); setPrecioRegalo(''); setLinkRegalo(''); setImagenRegalo(''); setMostrarFormulario(false);
      mostrarAlerta(t.listo, t.regaloAgregado);
    } catch { mostrarAlerta(t.error, t.errorAgregar); }
  };

  const handleEliminarRegalo = async (regalo: any) => {
    if (regalo.estado === 'apartado') { mostrarAlerta(t.error, t.noSePuedeEliminar); return; }
    if (Platform.OS === 'web') {
      if (window.confirm(idioma === 'es' ? `¿Eliminar "${regalo.nombre}"?` : `Delete "${regalo.nombre}"?`)) {
        try { await deleteDoc(doc(db, 'eventos', id as string, 'regalos', regalo.id)); } catch { mostrarAlerta(t.error, t.errorEliminar); }
      }
    } else {
      Alert.alert(t.eliminarRegalo, t.confirmarEliminar, [
        { text: t.cancelar, style: 'cancel' },
        { text: t.eliminar, style: 'destructive', onPress: async () => { try { await deleteDoc(doc(db, 'eventos', id as string, 'regalos', regalo.id)); } catch { Alert.alert(t.error, t.errorEliminar); } } }
      ]);
    }
  };

  const handleAbrirLink = async (link: string) => {
    if (!link) return;
    const url = link.startsWith('http') ? link : `https://${link}`;
    if (Platform.OS === 'web') { window.open(url, '_blank'); } else { await Linking.openURL(url); }
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #0a0818; min-height: 100%; }
          .web-card { background: rgba(22,27,46,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px 24px; margin-bottom: 12px; transition: border-color 0.2s; }
          .web-card:hover { border-color: rgba(139,92,246,0.2); }
          .web-input { width: 100%; background: rgba(30,37,64,0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #F8FAFC; outline: none; font-family: inherit; margin-bottom: 12px; transition: border-color 0.2s; }
          .web-input:focus { border-color: rgba(139,92,246,0.6); }
          .web-input::placeholder { color: #4B5563; }
          .btn-primary { padding: 14px 20px; background: linear-gradient(90deg, #8B5CF6, #A855F7); border: none; border-radius: 12px; color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.2s; width: 100%; margin-bottom: 10px; }
          .btn-primary:hover { opacity: 0.88; }
          .btn-secondary { padding: 12px 20px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #6B7280; font-size: 14px; cursor: pointer; font-family: inherit; width: 100%; }
          .btn-secondary:hover { background: rgba(255,255,255,0.04); }
          .btn-regresar { background: rgba(22,27,46,0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 8px 16px; color: #8B5CF6; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
          .btn-regresar:hover { background: rgba(139,92,246,0.1); }
          .btn-compartir { padding: 10px 20px; background: linear-gradient(90deg, #8B5CF6, #A855F7); border: none; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; white-space: nowrap; }
          .btn-eliminar { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 8px; }
          .btn-eliminar:hover { background: rgba(239,68,68,0.1); }
          .btn-link { background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3); border-radius: 20px; padding: 4px 12px; color: #8B5CF6; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
          .btn-cargar { background: #8B5CF6; border: none; border-radius: 10px; padding: 12px 16px; color: #fff; font-size: 18px; cursor: pointer; flex-shrink: 0; transition: opacity 0.2s; }
          .btn-cargar:hover { opacity: 0.85; }
          .progreso-barra { height: 8px; background: rgba(30,37,64,0.9); border-radius: 4px; overflow: hidden; }
          .progreso-relleno { height: 8px; background: linear-gradient(90deg, #8B5CF6, #F59E0B); border-radius: 4px; }
        `}</style>

        {/* Navbar */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, backgroundColor: 'rgba(10,8,24,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎁</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Giftu</span>
          </div>
          <button className="btn-regresar" onClick={() => router.replace('/(tabs)/dashboard')}>← {t.regresar}</button>
        </div>

        {/* Contenido */}
        <div style={{ backgroundColor: '#0a0818', minHeight: 'calc(100vh - 64px)', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 40px' }}>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 20 }}>{nombre}</h1>

            {/* Código */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(22,27,46,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px 24px', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{t.codigoParaCompartir}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#F59E0B', letterSpacing: 6 }}>{codigo}</div>
              </div>
              <button className="btn-compartir" onClick={handleCompartir}>{t.compartir}</button>
            </div>

            {/* Progreso */}
            {totalRegalos > 0 && (
              <div className="web-card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>🎁 {regalosApartados}/{totalRegalos} {t.apartado}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>{Math.round(progreso * 100)}%</span>
                </div>
                <div className="progreso-barra"><div className="progreso-relleno" style={{ width: `${progreso * 100}%` }} /></div>
              </div>
            )}

            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>{t.listaRegalos}</h2>

            {cargando ? (
              <div style={{ textAlign: 'center' as any, padding: 40, color: '#8B5CF6' }}>Cargando...</div>
            ) : regalos.length === 0 ? (
              <div className="web-card" style={{ textAlign: 'center' as any, padding: 40, marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#8B5CF6', marginBottom: 6 }}>{t.sinRegalos}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{t.agregaPrimero}</div>
              </div>
            ) : (
              regalos.map((regalo: any) => (
                <div key={regalo.id} className="web-card">
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {regalo.imagen
                      ? <img src={regalo.imagen} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                      : <div style={{ width: 80, height: 80, borderRadius: 12, background: 'rgba(30,37,64,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🎁</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', flex: 1 }}>{regalo.nombre}</span>
                        <button className="btn-eliminar" onClick={() => handleEliminarRegalo(regalo)}>🗑</button>
                      </div>
                      {regalo.precio && <div style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600, marginBottom: 8 }}>💰 ${regalo.precio}</div>}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as any }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, backgroundColor: regalo.estado === 'apartado' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: regalo.estado === 'apartado' ? '#F59E0B' : '#10B981', border: `1px solid ${regalo.estado === 'apartado' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                          {regalo.estado === 'apartado' ? `🔒 ${t.apartado}` : `✅ ${t.disponible}`}
                        </span>
                        {regalo.link && <button className="btn-link" onClick={() => handleAbrirLink(regalo.link)}>🔗 {idioma === 'es' ? 'Ver en tienda' : 'View in store'}</button>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Formulario */}
            {mostrarFormulario ? (
              <div className="web-card" style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 20 }}>✨ {t.nuevoRegalo}</h3>

                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{idioma === 'es' ? '🔗 Link de tienda' : '🔗 Store link'}</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input className="web-input" type="url" placeholder="amazon.com/producto..." value={linkRegalo} onChange={(e: any) => setLinkRegalo(e.target.value)} style={{ marginBottom: 0, flex: 1 }} />
                  <button className="btn-cargar" onClick={handleCargarPreview} disabled={cargandoPreview}>{cargandoPreview ? '...' : '⚡'}</button>
                </div>
                <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 16 }}>{idioma === 'es' ? '⚡ Clic en el rayo para cargar info automáticamente' : '⚡ Click lightning to load info automatically'}</p>

                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{idioma === 'es' ? '📷 Foto del regalo' : '📷 Gift photo'}</label>
                {imagenRegalo ? (
                  <div style={{ marginBottom: 16 }}>
                    <img src={imagenRegalo} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }} />
                    <button onClick={() => setImagenRegalo('')} style={{ marginTop: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '6px 16px', color: '#EF4444', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>✕ {idioma === 'es' ? 'Quitar foto' : 'Remove photo'}</button>
                  </div>
                ) : (
                  <div onClick={handleSeleccionarImagen} style={{ background: 'rgba(30,37,64,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>📷</span>
                    <span style={{ color: '#6B7280', fontSize: 14 }}>{idioma === 'es' ? 'Clic para agregar foto' : 'Click to add photo'}</span>
                  </div>
                )}

                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.nombreRegalo}</label>
                <input className="web-input" type="text" placeholder={t.ejNombre} value={nombreRegalo} onChange={(e: any) => setNombreRegalo(e.target.value)} />

                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{t.precio}</label>
                <input className="web-input" type="number" placeholder="0.00" value={precioRegalo} onChange={(e: any) => setPrecioRegalo(e.target.value)} />

                <button className="btn-primary" onClick={handleAgregarRegalo}>{t.guardarRegalo}</button>
                <button className="btn-secondary" onClick={() => { setMostrarFormulario(false); setImagenRegalo(''); setLinkRegalo(''); setNombreRegalo(''); setPrecioRegalo(''); }}>{t.cancelar}</button>
              </div>
            ) : (
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setMostrarFormulario(true)}>{t.agregarRegalo}</button>
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
          <View style={styles.codigoBox}>
            <View>
              <Text style={styles.codigoLabel}>{t.codigoParaCompartir}</Text>
              <Text style={styles.codigo}>{codigo}</Text>
            </View>
            <TouchableOpacity style={styles.botonCompartir} onPress={handleCompartir}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.botonCompartirGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.botonCompartirTexto}>{t.compartir}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {totalRegalos > 0 && (
            <View style={styles.progresoContainer}>
              <View style={styles.progresoHeader}>
                <Text style={styles.progresoLabel}>🎁 {regalosApartados}/{totalRegalos} {t.apartado}</Text>
                <Text style={styles.progresoPorcentaje}>{Math.round(progreso * 100)}%</Text>
              </View>
              <View style={styles.progresoBarraFondo}>
                <LinearGradient colors={['#8B5CF6', '#F59E0B']} style={[styles.progresoBarraRelleno, { width: `${progreso * 100}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              </View>
            </View>
          )}
        </View>
        <View style={styles.contenido}>
          <Text style={styles.seccionTitulo}>{t.listaRegalos}</Text>
          {cargando ? <ActivityIndicator size="large" color="#8B5CF6" /> : regalos.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioEmoji}>🎁</Text>
              <Text style={styles.vacioTexto}>{t.sinRegalos}</Text>
              <Text style={styles.vacioSubtexto}>{t.agregaPrimero}</Text>
            </View>
          ) : (
            regalos.map((regalo: any) => (
              <View key={regalo.id} style={styles.tarjeta}>
                {regalo.imagen ? <Image source={{ uri: regalo.imagen }} style={styles.tarjetaImagenGrande} resizeMode="cover" /> : <View style={styles.tarjetaImagenPlaceholder}><Text style={styles.tarjetaImagenEmoji}>🎁</Text></View>}
                <View style={styles.tarjetaInfo}>
                  <View style={styles.tarjetaHeader}>
                    <Text style={styles.tarjetaNombre}>{regalo.nombre}</Text>
                    <TouchableOpacity onPress={() => handleEliminarRegalo(regalo)}><Text style={styles.eliminarTexto}>🗑</Text></TouchableOpacity>
                  </View>
                  {regalo.precio ? <Text style={styles.tarjetaPrecio}>💰 ${regalo.precio}</Text> : null}
                  <View style={styles.tarjetaFooter}>
                    <View style={[styles.estadoBadge, regalo.estado === 'apartado' ? styles.estadoApartado : styles.estadoDisponible]}>
                      <Text style={[styles.estadoTexto, regalo.estado === 'apartado' ? styles.estadoApartadoTexto : styles.estadoDisponibleTexto]}>{regalo.estado === 'apartado' ? `🔒 ${t.apartado}` : `✅ ${t.disponible}`}</Text>
                    </View>
                    {regalo.link ? <TouchableOpacity style={styles.botonLink} onPress={() => handleAbrirLink(regalo.link)}><Text style={styles.botonLinkTexto}>🔗 {idioma === 'es' ? 'Ver en tienda' : 'View in store'}</Text></TouchableOpacity> : null}
                  </View>
                </View>
              </View>
            ))
          )}
          {mostrarFormulario ? (
            <View style={styles.formulario}>
              <Text style={styles.formularioTitulo}>✨ {t.nuevoRegalo}</Text>
              <Text style={styles.inputLabel}>{idioma === 'es' ? '🔗 Link de tienda' : '🔗 Store link'}</Text>
              <View style={styles.linkRow}>
                <TextInput style={[styles.input, styles.linkInput]} placeholder="amazon.com/producto..." placeholderTextColor="#4B5563" value={linkRegalo} onChangeText={setLinkRegalo} autoCapitalize="none" keyboardType="url" />
                <TouchableOpacity style={styles.botonCargar} onPress={handleCargarPreview} disabled={cargandoPreview}>
                  {cargandoPreview ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.botonCargarTexto}>⚡</Text>}
                </TouchableOpacity>
              </View>
              <Text style={styles.linkHint}>{idioma === 'es' ? '⚡ Toca el rayo para cargar info automáticamente' : '⚡ Tap lightning to load info automatically'}</Text>
              <Text style={styles.inputLabel}>{idioma === 'es' ? '📷 Foto del regalo' : '📷 Gift photo'}</Text>
              {imagenRegalo ? (
                <View style={styles.imagenPreviewContainer}>
                  <Image source={{ uri: imagenRegalo }} style={styles.imagenPreview} resizeMode="cover" />
                  <TouchableOpacity style={styles.cambiarFotoBtn} onPress={() => setImagenRegalo('')}><Text style={styles.cambiarFotoTexto}>{idioma === 'es' ? '✕ Quitar foto' : '✕ Remove photo'}</Text></TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagenPicker} onPress={handleSeleccionarImagen}>
                  <Text style={styles.imagenPickerEmoji}>📷</Text>
                  <Text style={styles.imagenPickerTexto}>{idioma === 'es' ? 'Tocar para agregar foto' : 'Tap to add photo'}</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.inputLabel}>{t.nombreRegalo}</Text>
              <TextInput style={styles.input} placeholder={t.ejNombre} placeholderTextColor="#4B5563" value={nombreRegalo} onChangeText={setNombreRegalo} />
              <Text style={styles.inputLabel}>{t.precio}</Text>
              <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#4B5563" value={precioRegalo} onChangeText={setPrecioRegalo} keyboardType="numeric" />
              <TouchableOpacity style={styles.botonGuardar} onPress={handleAgregarRegalo}>
                <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.botonGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}><Text style={styles.botonTexto}>{t.guardarRegalo}</Text></LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => { setMostrarFormulario(false); setImagenRegalo(''); setLinkRegalo(''); setNombreRegalo(''); setPrecioRegalo(''); }}>
                <Text style={styles.botonCancelarTexto}>{t.cancelar}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.botonAgregar} onPress={() => setMostrarFormulario(true)}>
              <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.botonGradiente} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}><Text style={styles.botonTexto}>{t.agregarRegalo}</Text></LinearGradient>
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