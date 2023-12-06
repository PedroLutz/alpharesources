import React from 'react';
import Head from 'next/head';
import { getStaticPaths, getStaticProps } from 'next';

import '../styles/global.css';
import '../styles/radio.css';
import '../styles/navbar.css';
import '../styles/menu.css';
import '../styles/wbs.css';

function MyApp({ Component, pageProps }) {
  
  return (
    <div>
      <Head>
        <title>Alpha Management</title>
        <link rel="icon" href="/images/logo.png" /> {/* Adicione esta linha */}
      </Head>
        <Component {...pageProps} />
    </div>
  )
}

export default MyApp;