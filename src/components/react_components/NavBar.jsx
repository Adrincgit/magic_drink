import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { isEnglish } from "../../data/variables";
import { useLang } from "../../data/signals";
import { magicDrinkGlobalContent } from "../../data/magicDrinkGlobalContent";
import styles from "./navbar.module.css";

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { changeLang } = useLang();
  const ingles = useStore(isEnglish);
  
  // Traducciones del navbar
  const navTranslations = ingles ? magicDrinkGlobalContent.en.navbar : magicDrinkGlobalContent.es.navbar;

  // Función para navegar al inicio
  const handleLogoClick = (e) => {
    e.preventDefault();
    window.location.href = '/';
  };

  useEffect(() => {
    // Detectar scroll para efectos de navbar
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 24);
    };

    // Detectar la página actual inicialmente
    setCurrentPath(window.location.pathname);

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Función para verificar si el enlace está activo
  const isActiveLink = (href) => {
    if (href === "/" && currentPath === "/") return true;
    if (href !== "/" && currentPath.startsWith(href)) return true;
    return false;
  };

  // Función para cambiar idioma
  const handleLanguageChange = (newLang) => {
    isEnglish.set(newLang === 'en');
    changeLang(newLang);
  };

  // Función para toggle del menú móvil
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Función para cerrar el menú móvil
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      {/* Contenedor Principal de la Cápsula */}
      <div className={styles.capsuleContainer}>
        
        {/* === LEFT: Logo === */}
        <div className={styles.logoSection}>
          <a href="/" onClick={handleLogoClick} className={styles.logoLink}>
            <img 
              src="/logo.png" 
              alt="Magic Drink" 
              className={`${styles.logoImage} ${isScrolled ? styles.logoCompact : ''}`}
            />
          </a>
        </div>

        {/* === CENTER: Links === */}
        <ul className={styles.navLinks}>
          {navTranslations.links.map((link) => (
            <li key={link.href} className={styles.navItem}>
              <a 
                href={link.href} 
                className={`${styles.navLink} ${isActiveLink(link.href) ? styles.activeLink : ""}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* === RIGHT: Idioma === */}
        <div className={styles.actionsSection}>
          <div className={styles.languageToggle}>
            <button 
              className={`${styles.langButton} ${!ingles ? styles.langActive : ''}`}
              onClick={() => handleLanguageChange('es')}
            >
              ES
            </button>
            <span className={styles.langSeparator}>|</span>
            <button 
              className={`${styles.langButton} ${ingles ? styles.langActive : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
          </div>
        </div>

        {/* === MOBILE: Hamburguesa === */}
        <button 
          className={styles.hamburger}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerActive : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerActive : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerActive : ''}`}></span>
        </button>

        {/* Onda Decorativa INTERNA "Liquid Signature" - 3 Capas */}
        <div className={styles.liquidWave}>
        <svg viewBox="0 0 1200 50" preserveAspectRatio="none" className={styles.waveSvg}>
          {/* Capa 1: Ola Principal Púrpura */}
          <path 
            d="M0,25 Q150,15 300,25 T600,25 T900,25 T1200,25 L1200,50 L0,50 Z" 
            className={styles.wavePath}
          />
          {/* Capa 2: Ola Secundaria Rosa */}
          <path 
            d="M0,20 Q200,30 400,20 T800,20 T1200,20 L1200,50 L0,50 Z" 
            className={styles.wavePath}
          />
          {/* Capa 3: Ola de Acento Azul */}
          <path 
            d="M0,30 Q250,25 500,30 T1000,30 T1200,30 L1200,50 L0,50 Z" 
            className={styles.wavePath}
          />
        </svg>
        </div>
      </div>

      {/* === MENÚ MÓVIL OVERLAY === */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu}>
          <div className={styles.mobileContent} onClick={(e) => e.stopPropagation()}>
            
            {/* Logo en menú móvil */}
            <div className={styles.mobileLogo}>
              <img src="/logo.png" alt="Magic Drink" />
            </div>

            {/* Links móvil */}
            <ul className={styles.mobileLinks}>
              {navTranslations.links.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    className={`${styles.mobileLink} ${isActiveLink(link.href) ? styles.mobileLinkActive : ""}`}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Idioma en móvil */}
            <div className={styles.mobileLangToggle}>
              <button 
                className={`${styles.mobileLangButton} ${!ingles ? styles.mobileLangActive : ''}`}
                onClick={() => { handleLanguageChange('es'); closeMobileMenu(); }}
              >
                ES
              </button>
              <span className={styles.langSeparator}>|</span>
              <button 
                className={`${styles.mobileLangButton} ${ingles ? styles.mobileLangActive : ''}`}
                onClick={() => { handleLanguageChange('en'); closeMobileMenu(); }}
              >
                EN
              </button>
            </div>

            {/* Botón cerrar */}
            <button className={styles.closeButton} onClick={closeMobileMenu}>
              ✕
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
