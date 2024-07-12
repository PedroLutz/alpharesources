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
  const [autenticado, setAutenticado] = useState(false);
  const autenticacao = { isAutenticado: autenticado, autenticar: setAutenticado };

  return (
    <AuthProvider>
      <TituloProvider>
        <InnerApp Component={Component} pageProps={pageProps} autenticado={autenticado} autenticacao={autenticacao} />
      </TituloProvider>
    </AuthProvider>
  );
}

function InnerApp({ Component, pageProps, autenticacao }) {
  const { titulo } = useContext(TituloContext);
  const { autenticado } = useContext(AuthContext);
  const title = `AM ${titulo ? '| ' + titulo : ''}`

  return (
    <div>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/images/logo.png" />
      </Head>
      {autenticado ? (
        <>
          <Component {...pageProps} autenticacao={autenticacao} />
          <Footer />
        </>
      ) : (
        <>
          <FormularioLogin {...pageProps} autenticacao={autenticacao} />
          <Footer />
        </>
      )}
    </div>
  );
}

export default MyApp;
