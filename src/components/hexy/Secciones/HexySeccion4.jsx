import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/hexySeccion4.module.css';

const content = {
  es: {
    heading: 'Que el coro ',
    headingAccent: 'vuelva a sonar',
    headingSuffix: '',
    description:
      'Conoce Magic Drink Original o entra a Wonderpop Plaza, donde Hexy, las luces y los Magic Bunnies convierten cada momento en algo que se queda tarareando.',
    ctaPrimary: 'Conoce la Original',
    ctaSecondary: 'Entrar a Wonderpop Plaza',
  },
  en: {
    heading: 'Let the chorus ',
    headingAccent: 'play again',
    headingSuffix: '',
    description:
      'Discover Magic Drink Original or enter Wonderpop Plaza, where Hexy, the lights, and the Magic Bunnies turn each moment into something you keep humming.',
    ctaPrimary: 'Discover Original',
    ctaSecondary: 'Enter Wonderpop Plaza',
  },
};

export default function HexySeccion4() {
  const ingles = useStore(isEnglish);
  const t = ingles ? content.en : content.es;

  return (
    <section className={styles.section}>
      <div className={styles.bg} />

      {/* Decorative sparkles */}
      <div className={styles.sparkles}>
        <span className={styles.sparkle} />
        <span className={styles.sparkle} />
        <span className={styles.sparkle} />
        <span className={styles.sparkle} />
        <span className={styles.sparkle} />
      </div>

      <div className={styles.shell}>
        <h2 className={styles.heading}>
          {t.heading}
          <span className={styles.headingAccent}>{t.headingAccent}</span>
          {t.headingSuffix}
        </h2>

        <p className={styles.description}>{t.description}</p>

        <div className={styles.actions}>
          <a href="/bebidas" className={styles.btnPrimary}>
            {t.ctaPrimary} {'\u2192'}
          </a>
          <a href="/wonderpop-plaza" className={styles.btnSecondary}>
            {t.ctaSecondary} {'\u2192'}
          </a>
        </div>
      </div>
    </section>
  );
}
