import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    return (

      <nav>
        <h2><Link href="/pages/wbs">Alpha Management/Status Report</Link></h2>
        <img src={'/images/logo.png'} alt="Logo" style={{width: '80px'}}/>
        <ul>
          <li>
            <Link href="/">Go to Menu</Link>
          </li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;