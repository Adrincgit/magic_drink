import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import { SceneButton } from '../../global/SceneControls';
import styles from '../css/hexySeccion4.module.css';

const content = {
  es: {
    heading: 'Que el coro ',
    headingAccent: 'vuelva a sonar',
    headingSuffix: '',
    description:
      'Conoce Magic Drink o entra a Wonderpop Plaza, donde Hexy, las luces y los Magic Bunnies convierten cada momento en algo que se queda tarareando.',
    ctaPrimary: 'Conoce Magic Drink',
    ctaSecondary: 'Entrar a Wonderpop Plaza',
  },
  en: {
    heading: 'Let the chorus ',
    headingAccent: 'play again',
    headingSuffix: '',
    description:
      'Discover Magic Drink or enter Wonderpop Plaza, where Hexy, the lights, and the Magic Bunnies turn each moment into something you keep humming.',
    ctaPrimary: 'Discover Magic Drink',
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
          <SceneButton href="/bebidas">{t.ctaPrimary}</SceneButton>
          <SceneButton href="/wonderpop-plaza" variant="violet">{t.ctaSecondary}</SceneButton>
        </div>
      </div>
    </section>
  );
}
