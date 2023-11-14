import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav style={{color: 'white'}}>
        <h2><Link href="/pages/financas/cadastro">Alpha Resources/Finances</Link></h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '80px'}}/>
        <ul>
          <li>
            <Link href="/pages/financeiro/financas/cadastro">Register</Link>
          </li>
          <li>
            <Link href="/pages/financeiro/financas/tabela">Spreadsheet</Link>
          </li>
          <li>
            <Link href="/pages/financeiro/financas/resumo">Report</Link>
          </li>
          <li>
            <Link href="/pages/financeiro/plano/cadastro">Go to Planning</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;