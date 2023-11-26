import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav style={{color: 'white'}}>
        <h2><Link href="/pages/cronograma/tabela">Alpha Management/Timeline</Link></h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '80px'}}/>
        <ul>
          <li>
            <Link href="/pages/cronograma/cadastro">Register</Link>
          </li>
          <li>
            <Link href="/pages/cronograma/tabela">Timeline</Link>
          </li>
          <li>
            <Link href="/pages/cronograma/monitoramento">Monitoring</Link>
          </li>
          <li>
            <Link href="/">Go to menu</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;