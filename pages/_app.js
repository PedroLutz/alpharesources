import React from 'react';
import Head from 'next/head';

import '../styles/global.css';
import '../styles/radio.css';
import '../styles/navbar.css'; // Importe seus estilos globais que incluem a fonte Montserrat

function MyApp({ Component, pageProps }) {
  
  return (
    <div>
      <Head>
        <title>Alpha Resources</title>
        <link rel="icon" href="/images/logo.png" /> {/* Adicione esta linha */}
      </Head>
        <Component {...pageProps} />
    </div>
  )
}

export default MyApp;