import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [autenticado, setAutenticado] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <AuthContext.Provider value={{ autenticado, setAutenticado, isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};