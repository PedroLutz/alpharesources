import React from 'react';
import Link from 'next/link';

import styles from '../../styles/modules/navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pages/responsibilities/raci">Alpha Management/Responsibilities</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />
      <ul>
        <li>
          <Link href="/pages/responsibilities/raci">RACI Matrix</Link>
        </li>
        <li>
          <Link href="/pages/responsibilities/members">Members</Link>
        </li>
        <li>
          <Link href="/">Go to menu</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;