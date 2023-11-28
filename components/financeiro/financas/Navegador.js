import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav style={{color: 'white'}}>
        <h2><Link href="/pages/financial/finances/register">Alpha Management/Finances</Link></h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '80px'}}/>
        <ul>
          <li>
            <Link href="/pages/financial/finances/register">Register</Link>
          </li>
          <li>
            <Link href="/pages/financial/finances/table">Spreadsheet</Link>
          </li>
          <li>
            <Link href="/pages/financial/finances/report">Report</Link>
          </li>
          <li>
            <Link href="/">Go to Menu</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;