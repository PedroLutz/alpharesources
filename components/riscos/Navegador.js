import React from 'react';
import Link from 'next/link';
import Logout from '../LogoutButton';
import { useContext, useEffect, useState } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

import styles from '../../styles/modules/navbar.module.css';

const Navbar = () => {
  const { setTitulo } = useContext(TituloContext);

  useEffect(() => {
    setTitulo('Risk Management');
  }, [setTitulo]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pags/risk/risks">Alpha Management/Risk Management</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />
      <ul>
      <li>
          <div className={styles.dropdown}>
            <a onMouseOver={toggleDropdown}>Planning</a>
            {isDropdownOpen && (
              <div className={styles.dropdownContent}>
                <Link href="/pags/risk/risks">Identification</Link>
                <Link href="/pags/risk/analysis">Analysis</Link>
                <Link href="/pags/risk/impact">Impact</Link>
                <Link href="/pags/risk/responses">Response</Link>
              </div>
            )}
          </div>
        </li>
        <li>
          <Link href="/pags/risk/audit">Audit</Link>
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