import React from 'react';
import Link from 'next/link';
import styles from '../../../styles/modules/navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pages/financial/plan/register">Alpha Management/Acquisition planning</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />
      <ul>
        <li>
          <Link href="/pages/financial/plan/register">Register</Link>
        </li>
        <li>
          <Link href="/pages/financial/plan/table">Spreadsheet</Link>
        </li>
        <li>
          <Link href="/pages/financial/plan/report">Report</Link>
        </li>
        <li>
          <Link href="/">Go to Menu</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;