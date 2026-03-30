import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import Button from '../global/Button';
import styles from './MagicDrinkDaySeccion.module.css';

const content = {
  es: {
    eyebrow: 'Magic Drink Day',
    title: 'El desfile anual donde el brillo de la marca se vuelve ciudad.',
    body:
      'Carrozas, globos, musica de Hexy y miles de personas celebrando el sabor mas querido del planeta. El evento sigue creciendo como una fiesta oficial de escala global.',
    ctaPrimary: 'Volver a bebidas',
    ctaSecondary: 'Ver Wonderpop Plaza',
  },
  en: {
    eyebrow: 'Magic Drink Day',
    title: 'The annual parade where the brand glow turns into a whole city.',
    body:
      'Floats, balloons, Hexy music, and thousands of people celebrating the worlds most beloved beverage. The event keeps growing like an official festival of global scale.',
    ctaPrimary: 'Back to drinks',
    ctaSecondary: 'See Wonderpop Plaza',
  },
};

const MagicDrinkDaySeccion = () => {
  const ingles = useStore(isEnglish);
  const t = ingles ? content.en : content.es;

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
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
        <video className={styles.video} autoPlay muted loop playsInline>
          <source src="/videos/parade2.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
};

export default MagicDrinkDaySeccion;
