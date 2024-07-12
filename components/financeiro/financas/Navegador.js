import React from 'react';
import Link from 'next/link';
import styles from '../../../styles/modules/navbar.module.css';
import Logout from '../../LogoutButton';
import { useEffect, useContext } from 'react';
import { TituloContext } from '../../../contexts/TituloContext';

const Navbar = () => {
  const { setTitulo } = useContext(TituloContext);

  useEffect(() => {
    setTitulo('Finances');
  }, [setTitulo]);

  return (
    <nav className={styles.nav}>
      <h2><Link href="/pages/financial/finances/register">Alpha Management/Finances</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />

      <ul>
        <li>
          <Link href="/pages/financial/finances/table">Spreadsheet</Link>
        </li>
        <li>
          <Link href="/pages/financial/finances/report">Report</Link>
        </li>
        <li>
          <Link href="/">Go to Menu</Link>
        </li>
        <Logout/>
      </ul>
    </nav>
  );
};

export default Navbar;