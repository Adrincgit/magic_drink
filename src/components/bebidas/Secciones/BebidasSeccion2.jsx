import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish, isDarkMode } from '../../../data/variables';
import { magicDrinkFlavors } from '../../../data/magicDrinkFlavors';
import styles from '../css/bebidasSeccion2.module.css';

const getText = (v, ingles) => (typeof v === 'string' ? v : ingles ? v.en : v.es);

const content = {
  es: {
    title: 'Nuestros Sabores',
    subtitle: 'Cada sabor tiene su propia personalidad, su propia energía y su propio ritual.',
    energy: 'Energía',
    taste: 'Sabor',
    vibe: 'Vibe',
    ritual: 'Ritual',
    notes: 'Notas',
  },
  en: {
    title: 'Our Flavors',
    subtitle: 'Each flavor has its own personality, its own energy, and its own ritual.',
    energy: 'Energy',
    taste: 'Taste',
    vibe: 'Vibe',
    ritual: 'Ritual',
    notes: 'Notes',
  },
};

export default function BebidasSeccion2() {
  const ingles = useStore(isEnglish);
  const dark = useStore(isDarkMode);
  const t = ingles ? content.en : content.es;

  return (
    <section className={`${styles.section} ${dark ? styles.dark : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.subtitle}>{t.subtitle}</p>
      </div>

      <div className={styles.grid}>
        {magicDrinkFlavors.map((flavor) => (
          <FlavorCard key={flavor.slug} flavor={flavor} ingles={ingles} t={t} />
        ))}
      </div>
    </section>
  );
}

function FlavorCard({ flavor, ingles, t }) {
  const [hovered, setHovered] = useState(false);
  const flavorName = flavor.slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <article
      id={`flavor-${flavor.slug}`}
      className={styles.card}
      style={{
        '--card-color': flavor.color,
        '--card-accent': flavor.accentColor,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color accent bar */}
      <div className={styles.accentBar} />

      <div className={styles.cardContent}>
        {/* Left: Can */}
        <div className={styles.canSide}>
          <img
            src={flavor.image}
            alt={flavorName}
            className={`${styles.canImg} ${hovered ? styles.canHover : ''}`}
            draggable={false}
          />
        </div>

        {/* Right: Info */}
        <div className={styles.infoSide}>
          <h3 className={styles.cardName}>{flavorName}</h3>
          <p className={styles.cardTagline}>{getText(flavor.tagline, ingles)}</p>
          <p className={styles.cardDesc}>{getText(flavor.description, ingles)}</p>

          {/* Stats row */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t.energy}</span>
              <span className={styles.statValue}>{flavor.stats.energy}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t.taste}</span>
              <span className={styles.statValue}>{getText(flavor.stats.taste, ingles)}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t.vibe}</span>
              <span className={styles.statValue}>{getText(flavor.stats.vibe, ingles)}</span>
            </div>
          </div>

          {/* Ritual */}
          <div className={styles.ritual}>
            <span className={styles.ritualLabel}>&#10022; {t.ritual}</span>
            <p className={styles.ritualText}>{getText(flavor.ritual, ingles)}</p>
          </div>

          {/* Notes */}
          <div className={styles.notes}>
            {getText(flavor.notes, ingles).map((note) => (
              <span key={note} className={styles.noteTag}>
                {note}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
