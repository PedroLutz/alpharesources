'use client';
import { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import client from "../lib/supabaseClient";

// 1. Definimos os tipos de forma clara
export interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
}

// 2. Criamos o contexto já com valores padrão e o tipo correto
const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    loading: true,
});

// 3. Tipamos o children direto nos parâmetros
const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        client.auth.getSession().then(({ data }) => {
            setUser(data.session?.user || null);
            setToken(data.session?.access_token || null);
            setLoading(false);
        });

        const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            setToken(session?.access_token || null);
        });

        return () => {
            listener.subscription.unsubscribe();
        }
    }, []);

    // 4. O retorno padrão
    return (
        <AuthContext.Provider value={{ user, token, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthContext, AuthProvider };