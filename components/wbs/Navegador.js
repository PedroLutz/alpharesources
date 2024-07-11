import React from 'react';
import Link from 'next/link';
import Logout from '../LogoutButton';
import styles from '../../styles/modules/navbar.module.css';

const Navbar = ({autenticacao}) => {
  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pages/wbs">Alpha Management/WBS</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" style={{ width: '80px' }} />
      <ul>
        <li>
          <Link href="/">Go to Menu</Link>
        </li>
        <Logout autenticacao={autenticacao}/>
      </ul>
    </nav>
  );
};

export default Navbar;