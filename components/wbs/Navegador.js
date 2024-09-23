import React from 'react';
import Link from 'next/link';
import Logout from '../LogoutButton';
import styles from '../../styles/modules/navbar.module.css';
import { useEffect, useContext } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

const Navbar = () => {
  const { setTitulo } = useContext(TituloContext);

  useEffect(() => {
    setTitulo('WBS');
  }, [setTitulo]);

  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pages/wbs">Alpha Management/WBS</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" style={{ width: '80px' }} />
      <ul>
        <li>
          <Link href="/pages/wbs/wbs">WBS</Link>
        </li>
        <li>
          <Link href="/pages/wbs/dictionary">Dictionary</Link>
        </li>
        <li>
          <Link href="/">Menu</Link>
        </li>
        <Logout/>
      </ul>
    </nav>
  );
};

export default Navbar;