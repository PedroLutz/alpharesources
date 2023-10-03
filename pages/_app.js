import React from 'react';
import '../styles/global.css';
import '../styles/radio.css';
import '../styles/navbar.css'; // Importe seus estilos globais que incluem a fonte Montserrat

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;