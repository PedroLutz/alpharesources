import React from 'react';
import Link from 'next/link';
import Logout from '../LogoutButton';
import styles from '../../styles/modules/navbar.module.css';
import { useEffect, useContext, useState } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

const Navbar = () => {
  const { setTitulo } = useContext(TituloContext);

  useEffect(() => {
    setTitulo('Communication');
  }, [setTitulo]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
    const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };

  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pages/communication/stakeholders">Alpha Management/Communication</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" style={{ width: '80px' }} />
      <ul>
        <li>
          <div className={styles.dropdown}>
            <a onMouseOver={toggleDropdown}>Stakeholders</a>
            {isDropdownOpen && (
              <div className={styles.dropdownContent}>
                <Link href="/pages/communication/stakeholderGroups">Groups</Link>
                <Link href="/pages/communication/stakeholders">Identification</Link>
                <Link href="/pages/communication/engagement">Engagement</Link>
              </div>
            )}
          </div>
        </li>
        <li>
          <Link href="/pages/communication/information">Communicated Information</Link>
        </li>
        <li>
          <Link href="/pages/communication/monitoring">Monitoring</Link>
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