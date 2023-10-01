import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav>
        <h2>Alpha Finances</h2>
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
        </ul>
      </nav>
    );
  };
  
  export default Navbar;