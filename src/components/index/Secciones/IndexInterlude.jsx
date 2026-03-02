import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import CountUp from '../../global/animations/CountUp';
import styles from '../css/indexInterlude.module.css';

/**
 * IndexInterlude — Sección de "respiro" entre S3 (Sabores) y S4 (Hexy).
 * Un dato contundente con animación CountUp que valida socialmente la marca
 * sin necesidad de CTA ni elementos complejos.
 * 
 * Funciona como "palette cleanser" visual: fondo degradado limpio,
 * una sola frase poderosa, silencio visual.
 */
const IndexInterlude = () => {
  const ingles = useStore(isEnglish);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const content = {
    es: {
      stat: "97",
      statSuffix: "%",
      statLabel: "de quienes la prueban no vuelven a otra marca.",
      microQuote: "No la elegimos. Ella nos eligió a nosotros.",
      quoteAuthor: "— Emily R., España"
    },
    en: {
      stat: "97",
      statSuffix: "%",
      statLabel: "of people who try it never go back to another brand.",
      microQuote: "We didn't choose it. It chose us.",
      quoteAuthor: "— Emily R., Spain"
    }
  };

  const t = ingles ? content.en : content.es;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Gradiente de fondo */}
      <div className={styles.bgGradient}></div>
      
      {/* Partículas sutiles */}
      <div className={styles.particles} aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <span key={i} className={styles.particle} style={{ '--i': i }}>✦</span>
        ))}
      </div>

      <div className={styles.content}>
        {/* Stat principal */}
        <div className={styles.statWrapper}>
          <span className={styles.statNumber}>
            {isVisible ? (
              <CountUp to={97} from={0} duration={2.5} separator="" />
            ) : '0'}
            <span className={styles.statSuffix}>{t.statSuffix}</span>
          </span>
        </div>
        
        {/* Label del stat */}
        <p className={`${styles.statLabel} ${isVisible ? styles.visible : ''}`}>
          {t.statLabel}
        </p>

        {/* Línea divisora sutil */}
        <div className={`${styles.divider} ${isVisible ? styles.visible : ''}`}></div>

        {/* Micro quote — social proof ambiental */}
        <blockquote className={`${styles.microQuote} ${isVisible ? styles.visible : ''}`}>
          <p>"{t.microQuote}"</p>
          <cite>{t.quoteAuthor}</cite>
        </blockquote>
      </div>
    </section>
  );
};

export default IndexInterlude;
