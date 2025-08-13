'use client';
import { createContext, useState, useEffect } from "react";
import client from "../lib/supabaseClient";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.auth.getSession().then(({ data }) => {
            setUser(data.session?.user || null);
            setToken(data.session?.access_token || null);
            setLoading(false);
        });

        const { data: listener } = client.auth.onAuthStateChange((e, session) => {
            setUser(session?.user || null);
            setToken(session?.access_token || null);
        });

        return () => {
            listener.subscription.unsubscribe();
        }
    }, []);

    return <AuthContext.Provider value={{ user, token, loading }}>
        {children}
    </AuthContext.Provider>
}

export {
    AuthContext,
    AuthProvider
}