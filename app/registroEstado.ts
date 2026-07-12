// Bandera simple y compartida entre pantallas.
// Se usa para avisarle a la pantalla de login que NO redirija automáticamente
// al Dashboard mientras la pantalla de Registro todavía está terminando de
// guardar los datos del usuario nuevo (updateProfile, Firestore, etc).
export const registroEstado = {
  enProceso: false,
};
