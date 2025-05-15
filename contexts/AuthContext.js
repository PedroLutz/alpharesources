import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [autenticado, setAutenticado] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    setAutenticado(true);
    
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
    setIsAdmin(payload.admin);
  } else {
    setAutenticado(false);
  }
}, []);

  return (
    <AuthContext.Provider value={{ autenticado, setAutenticado, isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};