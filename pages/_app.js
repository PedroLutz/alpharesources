'use client';
import { useContext } from 'react';
import Head from 'next/head';
import { useState, useEffect } from "react";
import { TituloProvider, TituloContext } from '../contexts/TituloContext';
import Footer from '../components/ui/Footer';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import { PermissionProvider } from '../contexts/PermissionProvider';

import { AuthProvider } from '../contexts/AuthProvider';

import '../styles/global.css';
import '../styles/graficos.css';
import '../styles/botoes.css';
import '../styles/tabela.css';

function AuthGuard({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isMounted && !user) {
      router.replace('/login');
    }
  }, [loading, isMounted, user]);

  if (!isMounted || loading) {
    return null;
  }

  return children;
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <PermissionProvider>
          <AuthGuard>
        <TituloProvider>
          <InnerApp Component={Component} pageProps={pageProps} />
        </TituloProvider>
      </AuthGuard>
      </PermissionProvider>
      
    </AuthProvider>
  );
}

function InnerApp({ Component, pageProps }) {
  const { titulo } = useContext(TituloContext);
  const title = `${titulo ? 'AM | ' + titulo : 'Alpha Management'}`

  return (
    <div>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/images/logo.png" />
      </Head>
        <Component {...pageProps} />
        <Footer />
    </div>
  );
}

export default MyApp;
