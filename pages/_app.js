import React from 'react';
import Head from 'next/head';
import { useState, useEffect } from "react";
import Footer from '../components/Footer';
import FormularioLogin from '../components/Login'

import '../styles/global.css';
import '../styles/graficos.css';
import '../styles/botoes.css';

function MyApp({ Component, pageProps }) {
  const [autenticado, setAutenticado] = useState(false);
  const autenticacao = {isAutenticado: autenticado, autenticar: setAutenticado}

  if (autenticado){
    return (
      <div>
        <Head>
          <title>Alpha Management</title>
          <link rel="icon" href="/images/logo.png" />
        </Head>
          <Component {...pageProps} autenticacao={autenticacao}/>
          <Footer/>
      </div>
    );
  } else {
    return (
      <>
        <FormularioLogin {...pageProps} autenticacao={autenticacao}/>
        <Footer/>
      </>
    );
  }
}

export default MyApp;
