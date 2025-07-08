import { useContext } from 'react';
import Head from 'next/head';
import { useState, useEffect } from "react";
import { TituloProvider, TituloContext } from '../contexts/TituloContext';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import FormularioLogin from '../components/Login'
import MobileBlock from '../components/MobileBlock';

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

function InnerApp({ Component, pageProps }) {
  const { titulo } = useContext(TituloContext);
  const { autenticado } = useContext(AuthContext);
  const title = `${titulo ? 'AM | ' + titulo : 'Alpha Management'}`
  const [isMobile, setIsMobile] = useState(false);

  // const handleResize = () => {
  //   if (window.innerWidth < 900) {
  //     setIsMobile(true)
  //   } else {
  //     setIsMobile(false)
  //   }
  // }

  // useEffect(() => {
  //   window.addEventListener("resize", handleResize);
  // })

  return (
    <div>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/images/logo.png" />
      </Head>
      {isMobile && <MobileBlock />}
      {autenticado ? (
        <>
          <Component {...pageProps} />
          <Footer />
        </>
      ) : (
        <>
          <FormularioLogin {...pageProps} />
        </>
      )}
    </div>
  );
}

export default MyApp;
