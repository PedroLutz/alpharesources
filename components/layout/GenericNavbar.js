import Link from 'next/link';
import Logout from '../ui/LogoutButton';
import styles from '../../styles/modules/navbar.module.css';
import { useEffect, useContext, useState } from 'react';
import { TituloContext } from '../../contexts/TituloContext';

const GenericNavbar = ({ base, itens, dropdowns }) => {
  const { setTitulo } = useContext(TituloContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setTitulo(base.titulo);
  }, [setTitulo]);

  const [isDropdownOpen, setIsDropdownOpen] = useState();

  const toggleDropdown = (index) => {
    if(isDropdownOpen == index){
      setIsDropdownOpen();
    } else {
      setIsDropdownOpen(index);
    }
  }

  const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true)
      } else {
        setIsMobile(false)
      }
    }
  
    useEffect(() => {
      handleResize();
      window.addEventListener("resize", handleResize);
    }, []);

  return (
    <nav className={styles.nav}>
      <h2 style={{fontSize: (base.titulo.length > 10 && isMobile) && '1rem'}}><Link href={base.link}>Alpha Management/{base.titulo}</Link></h2>
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
              <a onClick={() => toggleDropdown(index)} onMouseOver={() => toggleDropdown(index)}>{dropdown.titulo}</a>
              {isDropdownOpen == index && (
                <div className={styles.dropdownContent}
                onMouseLeave={() => toggleDropdown(-1)}
                style={{ display: isDropdownOpen == index ? 'block' : 'none' }}>
                  {dropdown.itens.map((item, index) => (
                    <Link key={index} href={item.link}>{item.label}</Link>
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