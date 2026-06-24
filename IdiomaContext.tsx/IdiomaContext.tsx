import React, { createContext, useContext, useState } from 'react';
import { Idioma, textos } from '../.vscode/idiomas';

type IdiomaContextType = {
  idioma: Idioma;
  t: typeof textos.es;
  cambiarIdioma: (idioma: Idioma) => void;
};

const IdiomaContext = createContext<IdiomaContextType>({
  idioma: 'es',
  t: textos.es,
  cambiarIdioma: () => {},
});

export function IdiomaProvider({ children }: { children: React.ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>('es');

  const cambiarIdioma = (nuevoIdioma: Idioma) => {
    setIdioma(nuevoIdioma);
  };

  return (
    <IdiomaContext.Provider value={{ idioma, t: textos[idioma], cambiarIdioma }}>
      {children}
    </IdiomaContext.Provider>
  );
}

export function useIdioma() {
  return useContext(IdiomaContext);
}