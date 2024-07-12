import { createContext, useState } from 'react';

export const TituloContext = createContext();

export const TituloProvider = ({ children }) => {
  const [titulo, setTitulo] = useState(null);

  return (
    <TituloContext.Provider value={{ titulo, setTitulo }}>
      {children}
    </TituloContext.Provider>
  );
};