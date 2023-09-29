import React from 'react';
import '../styles/global.css'; // Importe seus estilos globais que incluem a fonte Montserrat

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;