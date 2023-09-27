import React from 'react';
import Home from './TelaInicial';
import { useState } from 'react';
import '../styles/global.css';


function Verdadeiro() {
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Função para alternar entre os modos claro e escuro
    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
      document.body.classList.toggle('dark-mode', !isDarkMode);
    };

  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <Home /> 
      <div>
        <br/>
        <button onClick={toggleDarkMode}>Alternar modo de cor</button>
      </div>
    </div>
  );
}

export default Verdadeiro;