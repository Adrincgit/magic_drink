import React from "react";
import { isEnglish, isDarkMode } from '../../data/variables';
import { useStore } from '@nanostores/react';
import { magicDrinkGlobalContent } from '../../data/magicDrinkGlobalContent';
import styles from "./css/footnethive.module.css";
import { useState, useRef } from 'react';

const FootNetHive = () => {
  const ingles = useStore(isEnglish);
  const darkMode = useStore(isDarkMode);
  const [email, setEmail] = useState('');
  
  const content = {
    es: {
      heroTagline: "La Magia en Cada Sorbo ✦",
      col1Title: "Descubre Magic Drink",
      col1Links: magicDrinkGlobalContent.es.footer.quickLinks,
      col2Title: "Conéctate",
      newsletterPlaceholder: "tu@email.com",
      newsletterBtn: "¡Únete!",
      badges: ["Promos exclusivas", "Noticias de Hexy", "Nuevos sabores"],
      col3Title: "Síguenos",
      shareHashtag: "Comparte tu #MagicMoment",
      socials: [
        { name: "Instagram", icon: "/icons/insta.svg", href: "#", color: "#E1306C" },
        { name: "Facebook", icon: "/icons/facebook.svg", href: "#", color: "#1877F2" },
        { name: "Twitter", icon: "/icons/twitter.svg", href: "#", color: "#1DA1F2" },
        { name: "LinkedIn", icon: "/icons/linkedin.svg", href: "#", color: "#0A66C2" }
      ],
      bottomCopyright: "© 2024 Magic Drink — Todos los derechos reservados",
      bottomPrivacy: "Privacidad",
      bottomTerms: "Términos",
      langEs: "🇪🇸 ES",
      langEn: "🇺🇸 EN"
    },
    en: {
      heroTagline: "Magic in Every Sip ✦",
      col1Title: "Discover Magic Drink",
      col1Links: magicDrinkGlobalContent.en.footer.quickLinks,
      col2Title: "Connect",
      newsletterPlaceholder: "your@email.com",
      newsletterBtn: "Join Us!",
      badges: ["Exclusive promos", "Hexy news", "New flavors"],
      col3Title: "Follow Us",
      shareHashtag: "Share your #MagicMoment",
      socials: [
        { name: "Instagram", icon: "/icons/insta.svg", href: "#", color: "#E1306C" },
        { name: "Facebook", icon: "/icons/facebook.svg", href: "#", color: "#1877F2" },
        { name: "Twitter", icon: "/icons/twitter.svg", href: "#", color: "#1DA1F2" },
        { name: "LinkedIn", icon: "/icons/linkedin.svg", href: "#", color: "#0A66C2" }
      ],
      bottomCopyright: "© 2024 Magic Drink — All rights reserved",
      bottomPrivacy: "Privacy",
      bottomTerms: "Terms",
      langEs: "🇪🇸 ES",
      langEn: "🇺🇸 EN"
    }
  };
  
  const t = ingles ? content.en : content.es;
  const sectionRef = useRef(null);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer ref={sectionRef} className={`${styles.footer} ${!darkMode ? styles.footerLight : ''}`}>
      {/* Wavy top border */}
      <div className={styles.wavyTop}>
        {/* Desktop version - muchas olitas */}
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`${styles.wavySvg} ${styles.wavySvgDesktop}`}>
          <path d="M0,60 Q30,100 60,60 T120,60 T180,60 T240,60 T300,60 T360,60 T420,60 T480,60 T540,60 T600,60 T660,60 T720,60 T780,60 T840,60 T900,60 T960,60 T1020,60 T1080,60 T1140,60 T1200,60 L1200,120 L0,120 Z" fill={darkMode ? "#2C2633" : "#F8F4FB"}/>
        </svg>
        {/* Mobile version - pocas olitas */}
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className={`${styles.wavySvg} ${styles.wavySvgMobile}`}>
          <path d="M0,60 Q75,100 150,60 T300,60 T450,60 T600,60 T750,60 T900,60 T1050,60 T1200,60 L1200,120 L0,120 Z" fill={darkMode ? "#2C2633" : "#F8F4FB"}/>
        </svg>
      </div>

      {/* Decorative stars background */}
      <div className={styles.starsContainer}>
        <div className={`${styles.star} ${styles.starSmall} ${styles.star1}`}>✦</div>
        <div className={`${styles.star} ${styles.starMedium} ${styles.star2}`}>✶</div>
        <div className={`${styles.star} ${styles.starLarge} ${styles.star3}`}>★</div>
        <div className={`${styles.star} ${styles.starSmall} ${styles.star4}`}>✦</div>
        <div className={`${styles.star} ${styles.starMedium} ${styles.star5}`}>✶</div>
      </div>

      {/* Bubbles decoration */}
      <div className={styles.bubblesContainer}>
        <div className={`${styles.bubble} ${styles.bubble1}`}></div>
        <div className={`${styles.bubble} ${styles.bubble2}`}></div>
        <div className={`${styles.bubble} ${styles.bubble3}`}></div>
        <div className={`${styles.bubble} ${styles.bubble4}`}></div>
      </div>

      {/* Hero section */}
      <div className={styles.heroSection}>
        <div className={styles.logoContainer}>
          <img src="/logo.png" alt="Magic Drink" className={styles.logo} />
        </div>
        <p className={styles.tagline}>{t.heroTagline}</p>
      </div>

      {/* Divider gradient */}
      <div className={styles.divider}></div>

      {/* Main grid navigation */}
      <div className={styles.gridContainer}>
        {/* Column 1: Discover */}
        <div className={styles.column}>
          <h3 className={`${styles.columnTitle} ${styles.titlePink}`}>{t.col1Title}</h3>
          <nav className={styles.navList}>
            {t.col1Links.map((link, index) => (
              <a key={index} href={link.href} className={styles.navLink}>
                <img src={link.icon} alt={link.text} className={styles.navIcon} />
                <span>{link.text}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Column 2: Connect */}
        <div className={styles.column}>
          <h3 className={`${styles.columnTitle} ${styles.titleBlue}`}>{t.col2Title}</h3>
          <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
            <input
              type="email"
              placeholder={t.newsletterPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.newsletterInput}
              required
            />
            <button type="submit" className={styles.newsletterBtn}>
              {t.newsletterBtn}
            </button>
          </form>
          <div className={styles.badgesContainer}>
            {t.badges.map((badge, index) => (
              <span key={index} className={styles.badge}>
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Column 3: Follow */}
        <div className={styles.column}>
          <h3 className={`${styles.columnTitle} ${styles.titleMint}`}>{t.col3Title}</h3>
          <div className={styles.socialsContainer}>
            {t.socials.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className={styles.socialPill}
                style={{ '--social-color': social.color }}
                aria-label={social.name}
              >
                <img src={social.icon} alt={social.name} className={styles.socialIcon} />
                <span className={styles.socialName}>{social.name}</span>
              </a>
            ))}
          </div>
          <p className={styles.shareText}>{t.shareHashtag}</p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContent}>
          <p className={styles.copyright}>{t.bottomCopyright}</p>
          <div className={styles.legalLinks}>
            <a href="/privacy" className={styles.legalLink}>{t.bottomPrivacy}</a>
            <span className={styles.separator}>|</span>
            <a href="/terms" className={styles.legalLink}>{t.bottomTerms}</a>
          </div>
          <div className={styles.langSwitcher}>
            <button 
              onClick={() => isEnglish.set(false)} 
              className={`${styles.langBtn} ${!ingles ? styles.langActive : ''}`}
            >
              {t.langEs}
            </button>
            <button 
              onClick={() => isEnglish.set(true)} 
              className={`${styles.langBtn} ${ingles ? styles.langActive : ''}`}
            >
              {t.langEn}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FootNetHive;
