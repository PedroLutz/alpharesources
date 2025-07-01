import Link from 'next/link';
import Logout from '../LogoutButton';
import styles from '../../styles/modules/navbar.module.css';
import { useEffect, useContext, useState } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

const Navbar = () => {
  const { setTitulo } = useContext(TituloContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setTitulo('WBS');
  }, [setTitulo]);

  return (
    <nav className={styles.nav} style={{ color: 'white' }}>
      <h2><Link href="/pags/wbs/wbs">Alpha Management/WBS</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />

      <button
        className={styles.hamburger}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? '✖' : '☰'}
      </button>

      <ul className={`${styles.menu} ${mobileMenuOpen ? styles.open : ''}`}>
        <li>
          <Link href="/pags/wbs/wbs">WBS</Link>
        </li>
        <li>
          <Link href="/pags/wbs/dictionary">Dictionary</Link>
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