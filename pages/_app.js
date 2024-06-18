import React from 'react';
import Head from 'next/head';
import { useState, useEffect } from "react";
import Footer from '../components/Footer';

import '../styles/global.css';
import '../styles/graficos.css';
import '../styles/botoes.css';

function MyApp({ Component, pageProps }) {
  const [autenticado, setAutenticado] = useState(false);

  const FormularioLogin = () => {
    const [usuario, setUsuario] = useState("");
    const [userInfo, setUserInfo] = useState("");
    const [senha, setSenha] = useState("");

    const fetchAutenticacao = async () => {
      try {
        const response = await fetch('/api/login', {
          method: 'GET',
        });
  
        if (response.status === 200) {
          const data = await response.json();
          setUserInfo(data.usuario[0]);
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
      if (senha === userInfo.senha && usuario === userInfo.usuario.trim()) {
        setAutenticado(true);
      } else {
        // Senha incorreta
        alert("Usuário ou senha inválidos!");
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div className="centered-container" style={{height: '100vh'}}>
          <div className="modal-login">
            <div>
              <img src={'/images/logo.png'} alt="Logo" style={{width: '150px'}}/>
              <b className="gradient-text" style={{fontSize: '20px'}}>Alpha Management</b>
            </div>
            <div className="mini-input">
              <div>
                <input type="text" placeholder="Username" value={usuario} onChange={(e) => setUsuario(e.target.value)}/>
              </div>
              <div>
                <input type="password" placeholder="Password" value={senha} onChange={(e) => setSenha(e.target.value)} />
              </div>
            </div>
            <div>
              <div >
                <button className="botao-cadastro" type="submit">Login</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  };

  if (!autenticado){
    return (
      <div>
        <Head>
          <title>Alpha Management</title>
          <link rel="icon" href="/images/logo.png" />
        </Head>
          <Component {...pageProps} />
          <Footer/>
      </div>
    );
  } else {
    return (
      <>
        <FormularioLogin/>
        <Footer/>
      </>
    );
  }
}

export default MyApp;
