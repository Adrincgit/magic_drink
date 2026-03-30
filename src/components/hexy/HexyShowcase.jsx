import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import Button from '../global/Button';
import styles from './HexyShowcase.module.css';

const content = {
  es: {
    eyebrow: 'Hexy Music',
    title: 'Hexy no acompaña a Magic Drink. La convierte en una experiencia que canta.',
    body:
      'Hexy es la presencia musical mas reconocible de la marca. Entre visuales kawaii, escenarios brillantes y una identidad imposible de ignorar, ella traduce cada sabor en una atmosfera pop inmediata.',
    cards: [
      {
        title: 'Idol global',
        body: 'Aparece en conciertos, campañas, loops musicales y piezas visuales que mantienen la marca en movimiento.',
      },
      {
        title: 'Firma invisible',
        body: 'DJ Sweet Hex existe como credito, firma y rumor persistente. Nadie sabe exactamente quien esta detras.',
      },
      {
        title: 'Energia sonora',
        body: 'Cada sabor tiene su propio tono. La musica no ilustra el producto: amplifica la sensacion de beberlo.',
      },
    ],
    ctaPrimary: 'Ver todos los sabores',
    ctaSecondary: 'Entrar a Wonderpop Plaza',
  },
  en: {
    eyebrow: 'Hexy Music',
    title: 'Hexy does not simply accompany Magic Drink. She turns it into an experience that sings.',
    body:
      'Hexy is the brand most recognizable musical presence. Through kawaii visuals, luminous stages, and an identity that is impossible to ignore, she translates every flavor into immediate pop atmosphere.',
    cards: [
      {
        title: 'Global idol',
        body: 'She appears in concerts, campaigns, musical loops, and visual pieces that keep the brand in motion.',
      },
      {
        title: 'Invisible signature',
        body: 'DJ Sweet Hex exists as a credit, a signature, and a persistent rumor. Nobody knows exactly who is behind it.',
      },
      {
        title: 'Sonic energy',
        body: 'Every flavor has its own tone. The music does not illustrate the product; it amplifies the feeling of drinking it.',
      },
    ],
    ctaPrimary: 'See every flavor',
    ctaSecondary: 'Enter Wonderpop Plaza',
  },
};

const HexyShowcase = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? content.en : content.es;

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>{t.eyebrow}</p>
            <h1>{t.title}</h1>
            <p>{t.body}</p>
            <div className={styles.actions}>
              <Button href="/bebidas" textEs={t.ctaPrimary} textEn={t.ctaPrimary} variant="magic" size="lg" showArrow={true} />
              <Button
                href="/wonderpop-plaza"
                textEs={t.ctaSecondary}
                textEn={t.ctaSecondary}
                variant="secondary"
                size="lg"
                showArrow={true}
              />
            </div>
          </div>

          <div className={styles.visual}>
            <img src="/image/hexy/hexy-highlight.png" alt="Hexy" className={styles.heroImage} />
          </div>
        </div>

        <div className={styles.cards}>
          {t.cards.map((card) => (
            <article key={card.title} className={styles.card}>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HexyShowcase;
