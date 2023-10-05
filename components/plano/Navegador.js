import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav>
        <h2>Alpha Resources</h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '5%'}}/>
        <ul>
          <li>
            <Link href="/plano/cadastro">Cadastro</Link>
          </li>
          <li>
            <Link href="/plano/tabela">Tabela</Link>
          </li>
          <li>
            <Link href="/plano/resumo">Resumo</Link>
          </li>
          <li>
            <Link href="/financas/cadastro">Ir para Finanças</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;