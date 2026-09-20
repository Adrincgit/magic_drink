import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import Button from '../../global/Button';
import styles from '../css/nosotrosSeccion6.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const brands = [
  { src: '/image/brands/google.webp', alt: 'Google' },
  { src: '/image/brands/meta.webp', alt: 'Meta' },
  { src: '/image/brands/microsoft.webp', alt: 'Microsoft' },
  { src: '/image/brands/disneyland.webp', alt: 'Disneyland' },
  { src: '/image/brands/nissan.webp', alt: 'Nissan' },
  { src: '/image/brands/televisa.webp', alt: 'Televisa' },
  { src: '/image/brands/shopyfy.webp', alt: 'Shopify' },
  { src: '/image/brands/sharp.webp', alt: 'Sharp' },
];

const content = {
  es: {
    brandsLabel: 'Confían en nosotros',
    closingTitle: 'Magic Drink ocupa su lugar con una suavidad difícil de discutir.',
    closingBody:
      'Eso es exactamente lo que la hace especial: una marca brillante, querida y perfectamente integrada en el ritmo de la vida moderna. No necesitas entenderlo. Solo necesitas probarlo.',
    ctaPrimary: 'Conoce Magic Drink',
    ctaSecondary: 'Conocer Wonderpop Plaza',
  },
  en: {
    brandsLabel: 'They trust us',
    closingTitle: 'Magic Drink takes its place with a softness that\'s hard to argue with.',
    closingBody:
      'That is exactly what makes it special: a bright, beloved brand perfectly integrated into the rhythm of modern life. You don\'t need to understand it. You just need to try it.',
    ctaPrimary: 'Discover Magic Drink',
    ctaSecondary: 'Visit Wonderpop Plaza',
  },
};

export default function NosotrosSeccion6() {
  const ingles = useStore(isEnglish);
  const sectionRef = useRef(null);
  const t = ingles ? content.en : content.es;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.innerWidth <= 900) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('[data-reveal]'),
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%' },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.brandsBlock} data-reveal>
          <span className={styles.brandsLabel}>{t.brandsLabel}</span>
          <div className={styles.brandsStrip}>
            {brands.map((b) => (
              <img
                key={b.alt}
                src={b.src}
                alt={b.alt}
                className={styles.brandLogo}
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className={styles.closingCard} data-reveal>
          <h2 className={styles.closingTitle}>{t.closingTitle}</h2>
          <p className={styles.closingBody}>{t.closingBody}</p>
          <div className={styles.actions}>
            <Button
              href="/bebidas"
              textEs={t.ctaPrimary}
              textEn={t.ctaPrimary}
              variant="magic"
              size="lg"
              showArrow
            />
            <Button
              href="/wonderpop-plaza"
              textEs={t.ctaSecondary}
              textEn={t.ctaSecondary}
              variant="secondary"
              size="lg"
              showArrow
            />
          </div>
        </div>
      </div>
    </section>
  );
}
