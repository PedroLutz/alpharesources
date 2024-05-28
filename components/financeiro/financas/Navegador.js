import React from 'react';
import Link from 'next/link';
import styles from '../../../styles/modules/navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <h2><Link href="/pages/financial/finances/register">Alpha Management/Finances</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />

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

      {/*fim do nav*/}
    </nav>
  );
};

export default Navbar;