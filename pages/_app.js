import React, { useContext } from 'react';
import Head from 'next/head';
import { useState } from "react";
import { TituloProvider, TituloContext } from '../contexts/TituloContext';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import FormularioLogin from '../components/Login'

import '../styles/global.css';
import '../styles/graficos.css';
import '../styles/botoes.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <TituloProvider>
        <InnerApp Component={Component} pageProps={pageProps} />
      </TituloProvider>
    </AuthProvider>
  );
}

function InnerApp({ Component, pageProps}) {
  const { titulo } = useContext(TituloContext);
  const { autenticado } = useContext(AuthContext);
  const title = `${titulo ? 'AM | ' + titulo : 'Alpha Management'}`

  return (
    <div>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/images/logo.png" />
      </Head>
      {autenticado ? (
        <>
          <Component {...pageProps} />
          <Footer />
        </>
      ) : (
        <>
          <FormularioLogin {...pageProps} />
          <Footer />
        </>
      )}
    </div>
  );
}

export default MyApp;
