import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish, isDarkMode } from '../../../data/variables';
import styles from '../css/indexSeccion1.module.css';
import CtaCard from '../../global/CtaCard';
import Button from '../../global/Button';
import SplashCursor from '../../global/SplashCursor';

// ReactBits Animations
import BlurText from '../../global/animations/BlurText/BlurText';


const IndexSeccion1 = () => {
  const ingles = useStore(isEnglish);
  const darkMode = useStore(isDarkMode);

  const content = {
    es: {
      h1: "La bebida más popular del mundo",
      subtitle: "Sabor único, cero cafeína y una chispa de felicidad en cada burbuja. Magic Drink ilumina tus días con el poder de la música.",
      ctaPrimary: "Ver Sabores",
      ctaSecondary: "Conoce a Hexy",
      scrollText: "Desliza, disfruta la magia"
    },
    en: {
      h1: "The world's most popular drink",
      subtitle: "Unique flavor, zero caffeine and a spark of happiness in every bubble. Magic Drink lights up your days with the power of music.",
      ctaPrimary: "See Flavors",
      ctaSecondary: "Meet Hexy",
      scrollText: "Swipe and discover the magic"
    }
  };

  const t = ingles ? content.en : content.es;

  // Efecto spotlight con cursor
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      const spotlight = document.querySelector(`.${styles.spotlightReveal}`);
      if (spotlight) {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        spotlight.style.setProperty('--mouse-x', `${x}%`);
        spotlight.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className={`${styles.heroSection} ${!darkMode ? styles.heroSectionLight : ''}`}>
      <div className={styles.heroContainer}>
        {/* SplashCursor - Líquido Mágico Interactivo */}
   
   <SplashCursor 
          splatRadius={80}
          trailLength={30}
          fadeSpeed={0.96}
          colorChangeSpeed={15}
          blurAmount={20}
          glowIntensity={0.6}
          zIndex={-1}
        />

        {/* Imagen de Fondo con Efecto Spotlight */}
        <div className={styles.backgroundImageLayer}>
          <div className={styles.backgroundImage}></div>
          <div className={styles.spotlightReveal}></div>
        </div>

        {/* Gradiente Animado de Fondo */}
        <div className={styles.animatedBackground}></div>

        {/* Partículas Flotantes Kawaii */}
        <div className={styles.particlesContainer}>
          {/* Estrellas */}
          {[...Array(12)].map((_, i) => (
            <div key={`star-${i}`} className={`${styles.particle} ${styles.star}`} style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}>✦</div>
          ))}
          
          {/* Burbujas */}
          {[...Array(8)].map((_, i) => (
            <div key={`bubble-${i}`} className={`${styles.particle} ${styles.bubble}`} style={{ 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}></div>
          ))}
          
          {/* Notas Musicales */}
          {[...Array(6)].map((_, i) => (
            <div key={`note-${i}`} className={`${styles.particle} ${styles.musicNote}`} style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 4}s`
            }}>♪</div>
          ))}
        </div>

        {/* Contenido Principal */}
        <div className={styles.heroContent}>
          {/* Headline Principal Kawaii con Sparkle */}
          <h1 className={styles.heroTitle}>
            <div className={styles.titleLine}>
              <BlurText
                text={ingles ? "The world's" : "La bebida"}
                delay={50}
                animateBy="words"
                direction="bottom"
                className={styles.titlePart1}
              />
            </div>
            <div className={styles.titleLine}>
              <BlurText
                text={ingles ? "most popular" : "más popular"}
                delay={70}
                animateBy="words"
                direction="bottom"
                className={styles.titlePart2}
              />
            </div>
            <div className={styles.titleLine}>
              <BlurText
                text={ingles ? "drink" : "del mundo"}
                delay={90}
                animateBy="words"
                direction="bottom"
                className={styles.titlePart3}
              />
            </div>
            <span className={styles.sparkle}></span>
          </h1>
          
          {/* Subtítulo Mágico */}
          <p className={styles.heroSubtitle}>{t.subtitle}</p>

          {/* CTAs Principales */}
          <div className={styles.ctaGroup}>
            <Button
              textEs={t.ctaPrimary}
              textEn={t.ctaPrimary}
              href="/bebidas"
              variant="magic"
              size="lg"
              showArrow={true}
            />
            <Button
              textEs={t.ctaSecondary}
              textEn={t.ctaSecondary}
              href="/hexy"
              variant="magic"
              size="lg"
              showArrow={false}
            />
          </div>
        </div>

     
        {/* Scroll Indicator con Estrella */}
        <div className={styles.scrollIndicator}>
          <span className={styles.scrollText}>{t.scrollText}</span>
          <div className={styles.iconicStar}>
            <img src="/favicon.png" alt="Magic Drink Star" />
          </div>
        </div>
      </div>

      {/* Ondas SVG de Transición Kawaii (Múltiples Olitas) */}
      <div className={styles.waveTransition}>
        {/* Desktop: 20 olas por capa */}
        <svg viewBox="0 0 1200 150" preserveAspectRatio="none" className={`${styles.waveSvg} ${styles.waveSvgDesktop}`}>
          {/* Ola 1 - Capa profunda (muchas olitas) */}
          <path 
            d="M0,50 Q30,90 60,50 T120,50 T180,50 T240,50 T300,50 T360,50 T420,50 T480,50 T540,50 T600,50 T660,50 T720,50 T780,50 T840,50 T900,50 T960,50 T1020,50 T1080,50 T1140,50 T1200,50 L1200,150 L0,150 Z" 
            className={`${styles.wavePath} ${styles.wave1}`} 
          />
          {/* Ola 2 - Capa media (olitas medianas) */}
          <path 
            d="M0,70 Q30,105 60,70 T120,70 T180,70 T240,70 T300,70 T360,70 T420,70 T480,70 T540,70 T600,70 T660,70 T720,70 T780,70 T840,70 T900,70 T960,70 T1020,70 T1080,70 T1140,70 T1200,70 L1200,150 L0,150 Z" 
            className={`${styles.wavePath} ${styles.wave2}`} 
          />
          {/* Ola 3 - Capa superior (olitas suaves) */}
          <path 
            d="M0,85 Q30,115 60,85 T120,85 T180,85 T240,85 T300,85 T360,85 T420,85 T480,85 T540,85 T600,85 T660,85 T720,85 T780,85 T840,85 T900,85 T960,85 T1020,85 T1080,85 T1140,85 T1200,85 L1200,150 L0,150 Z" 
            className={`${styles.wavePath} ${styles.wave3}`} 
          />
        </svg>
        
        {/* Mobile: 8 olas por capa */}
        <svg viewBox="0 0 1200 150" preserveAspectRatio="none" className={`${styles.waveSvg} ${styles.waveSvgMobile}`}>
          {/* Ola 1 - Capa profunda */}
          <path 
            d="M0,50 Q75,90 150,50 T300,50 T450,50 T600,50 T750,50 T900,50 T1050,50 T1200,50 L1200,150 L0,150 Z" 
            className={`${styles.wavePath} ${styles.wave1}`} 
          />
          {/* Ola 2 - Capa media */}
          <path 
            d="M0,70 Q75,105 150,70 T300,70 T450,70 T600,70 T750,70 T900,70 T1050,70 T1200,70 L1200,150 L0,150 Z" 
            className={`${styles.wavePath} ${styles.wave2}`} 
          />
          {/* Ola 3 - Capa superior */}
          <path 
            d="M0,85 Q75,115 150,85 T300,85 T450,85 T600,85 T750,85 T900,85 T1050,85 T1200,85 L1200,150 L0,150 Z" 
            className={`${styles.wavePath} ${styles.wave3}`} 
          />
        </svg>
      </div>
    </section>
  );
};

export default IndexSeccion1;
