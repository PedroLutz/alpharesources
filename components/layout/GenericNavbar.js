import Link from 'next/link';
import Logout from '../ui/LogoutButton';
import styles from '../../styles/modules/navbar.module.css';
import { useEffect, useContext, useState } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

const GenericNavbar = ({base, itens, dropdowns}) => {
  const { setTitulo } = useContext(TituloContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setTitulo(base.titulo);
  }, [setTitulo]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
    const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };

  return (
    <nav className={styles.nav}>
      <h2><Link href={base.link}>Alpha Management/{base.titulo}</Link></h2>
      <img src={'/images/logo.png'} alt="Logo" />

      <button
        className={styles.hamburger}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? '✖' : '☰'}
      </button>

      <ul className={`${styles.menu} ${mobileMenuOpen ? styles.open : ''}`}>
        {dropdowns && dropdowns.map((dropdown, index) => (
            <li key={index}>
                <div className={styles.dropdown}>
                    <a onMouseOver={toggleDropdown}>{dropdown.titulo}</a>
                    {isDropdownOpen && (
                    <div className={styles.dropdownContent}>
                        {dropdown.itens.map((item, index) => (
                            <Link index={index} href={item.link}>{item.label}</Link>
                        ))}
                    </div>
                    )}
                </div>
            </li>
        ))}
        {itens && itens.map((item, index) => (
            <li key={index}>
                <Link href={item.link}>{item.label}</Link>
            </li>
        ))}
        <li>
          <Link href="/">Menu</Link>
        </li>
        <Logout />
      </ul>
    </nav>
  );
};

export default GenericNavbar;