import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav>
        <h2>Alpha Resources/Finances</h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '80px'}}/>
        <ul>
          <li>
            <Link href="/financas/cadastro">Register</Link>
          </li>
          <li>
            <Link href="/financas/tabela">Spreadsheet</Link>
          </li>
          <li>
            <Link href="/financas/resumo">Report</Link>
          </li>
          <li>
            <Link href="/plano/cadastro">Go to Planning</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;