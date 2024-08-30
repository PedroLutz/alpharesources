import React from 'react';
import Link from 'next/link';
import Logout from '../LogoutButton';
import { useContext, useEffect } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

import styles from '../../styles/modules/navbar.module.css';

const Navbar = () => {
  const { setTitulo } = useContext(TituloContext);

  useEffect(() => {
    setTitulo('Report Generator');
  }, [setTitulo]);

  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pages/responsibilities/raci">Alpha Management/Report Generator</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />
      <ul>
        <li>
          <Link href="/">Menu</Link>
        </li>
        <Logout/>
      </ul>
    </nav>
  );
};

export default Navbar;