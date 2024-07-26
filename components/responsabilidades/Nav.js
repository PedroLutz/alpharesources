import React from 'react';
import Link from 'next/link';
import Logout from '../LogoutButton';
import { useContext, useEffect } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

import styles from '../../styles/modules/navbar.module.css';

const Navbar = () => {
  const { setTitulo } = useContext(TituloContext);

  useEffect(() => {
    setTitulo('Responsibilities');
  }, [setTitulo]);

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
        <Logout/>
      </ul>
    </nav>
  );
};

export default Navbar;