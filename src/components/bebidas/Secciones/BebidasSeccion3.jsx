import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish, isDarkMode } from '../../../data/variables';
import styles from '../css/bebidasSeccion3.module.css';

const content = {
  es: {
    title: '¿Ya encontraste tu sabor?',
    subtitle: 'Magic Drink tiene un sabor para cada momento, cada mood y cada playlist.',
    cta1: 'Explorar la tienda',
    cta2: 'Conoce a Hexy',
  },
  en: {
    title: 'Found your flavor yet?',
    subtitle: 'Magic Drink has a flavor for every moment, every mood, and every playlist.',
    cta1: 'Explore the store',
    cta2: 'Meet Hexy',
  },
};

export default function BebidasSeccion3() {
  const ingles = useStore(isEnglish);
  const dark = useStore(isDarkMode);
  const t = ingles ? content.en : content.es;

  return (
    <section className={`${styles.section} ${dark ? styles.dark : ''}`}>
      {/* Decorative background shapes */}
      <div className={styles.bgDecorations}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
      </div>

      <div className={styles.inner}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.subtitle}>{t.subtitle}</p>
        <div className={styles.buttons}>
          <a href="/wonderpop" className={styles.btnPrimary}>
            {t.cta1}
          </a>
          <a href="/hexy" className={styles.btnSecondary}>
            {t.cta2}
          </a>
        </div>
      </div>
    </section>
  );
}
