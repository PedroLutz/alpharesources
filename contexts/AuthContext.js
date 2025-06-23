import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [autenticado, setAutenticado] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // pra evitar piscar

  useEffect(() => {
    const checarToken = async () => {
      try {
        const res = await fetch('/api/verificaLogin');
        const data = await res.json();

        if (res.ok && data.autenticado) {
          setAutenticado(true);
          setIsAdmin(data.admin);
        } else {
          setAutenticado(false);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('erro ao verificar token', err);
        setAutenticado(false);
        setIsAdmin(false);
      } finally {
        setLoading(false); // quando terminar a verificação
      }
    };

    checarToken();
  }, []);

  if (loading) return <div>carregando...</div>; // evita piscar conteúdo

  return (
    <AuthContext.Provider value={{ autenticado, setAutenticado, isAdmin, setIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
