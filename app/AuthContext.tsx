import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from '../firebaseConfig';

type AuthContextType = {
  usuario: User | null;
  cargandoAuth: boolean;
};

const AuthContext = createContext<AuthContextType>({ usuario: null, cargandoAuth: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargandoAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Mientras Firebase determina la sesión, no renderiza nada de la app
  // Esto evita pantallas en blanco o parpadeos con usuario incorrecto
  if (cargandoAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0818', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ usuario, cargandoAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}