import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import Button from '../global/Button';
import styles from './WonderpopPlazaSeccion.module.css';

const content = {
  es: {
    eyebrow: 'Wonderpop Plaza',
    title: 'El universo fisico de Magic Drink ahora tambien concentra el merch.',
    body:
      'Wonderpop Plaza funciona como tienda oficial, escenario para Hexy, zona de coleccionables y experiencia social. Aqui la bebida deja de ser solo producto y se convierte en destino.',
    features: [
      'Tienda oficial de sabores y ediciones especiales',
      'Merch kawaii integrado en el recorrido principal',
      'Espacios instagrameables, musica y activaciones',
      'Eventos temporales ligados a lanzamientos de la marca',
    ],
    ctaPrimary: 'Ver bebidas',
    ctaSecondary: 'Ir a contacto',
  },
  en: {
    eyebrow: 'Wonderpop Plaza',
    title: 'The physical Magic Drink universe now also concentrates the merch experience.',
    body:
      'Wonderpop Plaza works as official store, Hexy stage, collectible zone, and social experience. Here the drink stops being just a product and becomes a destination.',
    features: [
      'Official flavor store and special editions',
      'Kawaii merch integrated into the main route',
      'Instagram-ready spaces, music, and activations',
      'Temporary events tied to brand launches',
    ],
    ctaPrimary: 'See drinks',
    ctaSecondary: 'Go to contact',
  },
};

const WonderpopPlazaSeccion = () => {
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
            <ul className={styles.featureList}>
              {t.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className={styles.actions}>
              <Button href="/bebidas" textEs={t.ctaPrimary} textEn={t.ctaPrimary} variant="magic" size="lg" showArrow={true} />
              <Button href="/contacto" textEs={t.ctaSecondary} textEn={t.ctaSecondary} variant="secondary" size="lg" showArrow={true} />
            </div>
          </div>

          <div className={styles.visual}>
            <video className={styles.video} autoPlay muted loop playsInline poster="/image/wonderpop/wonderpop-poster.png">
              <source src="/videos/wonderpop.mp4" type="video/mp4" />
            </video>
          </div>
        </div>

        <div className={styles.gallery}>
          <img src="/image/wonderpop/wonderpop-exterior.png" alt="Wonderpop Plaza exterior" className={styles.galleryImage} />
          <img src="/image/wonderpop/wonderpop-interior.png" alt="Wonderpop Plaza interior" className={styles.galleryImage} />
        </div>
      </div>
    </section>
  );
};

export default WonderpopPlazaSeccion;
