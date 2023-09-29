import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav>
        <h2>Alpha Finances</h2>
        <ul>
          <li>
            <Link href="/cadastro">Cadastro</Link>
          </li>
          <li>
            <Link href="/tabela">Tabela</Link>
          </li>
          <li>
            <Link href="/resumo">Resumo</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;