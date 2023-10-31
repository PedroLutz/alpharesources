import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav style={{color: 'white'}}>
        <h2><Link href="/pages/plano/cadastro">Alpha Resources/Acquisition planning</Link></h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '80px'}}/>
        <ul>
          <li>
            <Link href="/pages/plano/cadastro">Register</Link>
          </li>
          <li>
            <Link href="/pages/plano/tabela">Spreadsheet</Link>
          </li>
          <li>
            <Link href="/pages/plano/resumo">Report</Link>
          </li>
          <li>
            <Link href="/pages/financas/cadastro">Go to Finances</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;