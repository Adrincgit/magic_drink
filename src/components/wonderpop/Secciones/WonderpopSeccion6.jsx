import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import Button from '../../global/Button';
import styles from '../css/wonderpopSeccion6.module.css';

const content = {
  es: {
    heading: 'Te esperamos en ',
    headingAccent: 'la Plaza',
    body: 'Visita Wonderpop Plaza y descubre por qué millones de personas la consideran su lugar favorito en el mundo. Bebida, música, merch y comunidad — todo en un solo destino.',
    ctaBebidas: 'Conoce la Original',
    ctaMerch: 'Ver merch',
    ctaContacto: 'Contacto',
    footnote: 'WONDERPOP PLAZA \u00b7 Una experiencia Magic Drink',
  },
  en: {
    heading: 'We\'re waiting at ',
    headingAccent: 'the Plaza',
    body: 'Visit Wonderpop Plaza and discover why millions of people consider it their favorite place in the world. Drink, music, merch, and community — all in one destination.',
    ctaBebidas: 'Discover Original',
    ctaMerch: 'See merch',
    ctaContacto: 'Contact',
    footnote: 'WONDERPOP PLAZA \u00b7 A Magic Drink Experience',
  },
};

export default function WonderpopSeccion6() {
  const ingles = useStore(isEnglish);
  const t = ingles ? content.en : content.es;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <img
            className={styles.icon}
            src="/icons/icono_plaza.webp"
            alt="Wonderpop Plaza"
          />
          <h2 className={styles.heading}>
            {t.heading}<span className={styles.headingAccent}>{t.headingAccent}</span>
          </h2>
          <p className={styles.body}>{t.body}</p>
          <div className={styles.actions}>
            <Button href="/bebidas" textEs={t.ctaBebidas} textEn={t.ctaBebidas} variant="magic" size="lg" showArrow />
            <Button href="/bebidas" textEs={t.ctaMerch} textEn={t.ctaMerch} variant="secondary" size="md" />
            <Button href="/contacto" textEs={t.ctaContacto} textEn={t.ctaContacto} variant="outline" size="md" />
          </div>
        </div>

        <hr className={styles.divider} />
        <p className={styles.footnote}>{t.footnote}</p>
      </div>
    </section>
  );
}
