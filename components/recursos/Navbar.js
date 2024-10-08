import React from 'react';
import Link from 'next/link';
import styles from '../../styles/modules/navbar.module.css';
import Logout from '../LogoutButton';
import { useContext, useEffect, useState } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

const Navbar = () => {
  const { setTitulo } = useContext(TituloContext);

  useEffect(() => {
    setTitulo('Budget & Resource Management');
  }, [setTitulo]);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pages/timeline/table">Alpha Management/Budget & Resources</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />
      <ul>
        <li>
          <div className={styles.dropdown}>
            <a onMouseOver={toggleDropdown}>Finances</a>
            {isDropdownOpen && (
              <div className={styles.dropdownContent}>
                <Link href="/pages/finances/table">Cash flow</Link>
                <Link href="/pages/finances/report">Report</Link>
              </div>
            )}
          </div>
        </li>
        <li>
          <div className={styles.dropdown}>
            <a onMouseOver={toggleDropdown}>Resources</a>
            {isDropdownOpen && (
              <div className={styles.dropdownContent}>
                <Link href="/pages/resources/identification">Resource Identification</Link>
                <Link href="/pages/resources/acquisition_planning">Resource Acquisition</Link>
                <Link href="/pages/resources/report">Report</Link>
              </div>
            )}
          </div>
        </li>
        <li>
          <Link href="/">Menu</Link>
        </li>

        <Logout />
      </ul>
    </nav>
  );
};

export default Navbar;