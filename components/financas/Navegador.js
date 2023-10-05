import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav>
        <h2>Alpha Resources/Finanças</h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '5%'}}/>
        <ul>
          <li>
            <Link href="/financas/cadastro">Cadastro</Link>
          </li>
          <li>
            <Link href="/financas/tabela">Tabela</Link>
          </li>
          <li>
            <Link href="/financas/resumo">Resumo</Link>
          </li>
          <li>
            <Link href="/plano/cadastro">Ir para Plano</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;