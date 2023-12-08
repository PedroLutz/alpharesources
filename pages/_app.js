import React from 'react';
import Head from 'next/head';
import { getStaticPaths, getStaticProps } from 'next';
import { useState, useEffect } from "react";

import '../styles/global.css';
import '../styles/radio.css';
import '../styles/navbar.css';
import '../styles/menu.css';
import '../styles/wbs.css';

function MyApp({ Component, pageProps }) {
  const [autenticado, setAutenticado] = useState(false);

  const FormularioLogin = () => {
    const [usuario, setUsuario] = useState("");
    const [usuarioBanco, setUsuarioBanco] = useState("");
    const [senha, setSenha] = useState("");

    const fetchAutenticacao = async () => {
      try {
        const response = await fetch('/api/login', {
          method: 'GET',
        });
  
        if (response.status === 200) {
          const data = await response.json();
          setUsuarioBanco(data.usuario[0]);
        } else {
          console.error('Error in searching for timeline data');
        }
      } catch (error) {
        console.error('Error in searching for financal releases data', error);
      }
    };
  
    useEffect(() => {
      fetchAutenticacao();
    }, []);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(usuarioBanco.senha, usuarioBanco.usuario)
      if (senha === usuarioBanco.senha|| usuario === usuarioBanco.usuario) {
        setAutenticado(true);
      } else {
        // Senha incorreta
        alert("Usuário ou senha inválidos!");
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <div>
              <input type="text" placeholder="Usuário" value={usuario} onChange={(e) => setUsuario(e.target.value)} className="form-control" />
            </div>
            <div>
              <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="form-control" />
            </div>
          </div>
          <div>
            <div >
              <button type="submit">Entrar</button>
            </div>
          </div>
        </div>
      </form>
    );
  };

  if (autenticado){
  return (
    <div>
      <Head>
        <title>Alpha Management</title>
        <link rel="icon" href="/images/logo.png" /> {/* Adicione esta linha */}
      </Head>
        <Component {...pageProps} />
    </div>
  );
} else {
  return (
    <>
      <FormularioLogin/>
    </>
  );
}
}

export default MyApp;