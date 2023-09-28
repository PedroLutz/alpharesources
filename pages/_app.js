import React from 'react';
import Cadastro from '../components/Cadastro';
import Tabela from '../components/Tabela';
import { useState, useEffect } from 'react';
import '../styles/global.css';


function Verdadeiro() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Função para alternar entre os modos claro e escuro
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark-mode", !isDarkMode);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Coloque aqui o código que usa o document
      document.body.classList.add('dark-mode');
    }
  }, []);

  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
            <Cadastro />
            <Tabela />
      <div>
        <br />
        <button onClick={toggleDarkMode}>Alternar modo de cor</button>
      </div>
    </div>
  );
}

export default Verdadeiro;
