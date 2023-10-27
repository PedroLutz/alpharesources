import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav>
        <h2>Alpha Resources/Acquisition planning</h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '80px'}}/>
        <ul>
          <li>
            <Link href="/plano/cadastro">Register</Link>
          </li>
          <li>
            <Link href="/plano/tabela">Spreadsheet</Link>
          </li>
          <li>
            <Link href="/plano/resumo">Report</Link>
          </li>
          <li>
            <Link href="/financas/cadastro">Go to Finances</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;