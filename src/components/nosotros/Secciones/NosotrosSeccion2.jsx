import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/nosotrosSeccion2.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const content = {
  es: {
    eyebrow: 'La Promesa Oficial',
    title: 'Una bebida que no necesita explicarse demasiado.',
    manifesto:
      'Creamos una bebida moderna, saludable y emocionalmente memorable. Una que no necesita cafeína para sentirse viva ni exceso para volverse indispensable. Lo que Magic Drink ofrece es algo que la ciencia aún estudia y los consumidores simplemente disfrutan.',
    metrics: [
      { value: '190+', label: 'mercados que reconocen la marca' },
      { value: '1', label: 'Original que nos conecta' },
      { value: '24/7', label: 'presencia en rutinas reales' },
    ],
    cardLabel: 'Manifiesto Corporativo',
    cardText: 'Nos comprometemos con la transparencia, la innovación responsable y la satisfacción constante del consumidor. Todo lo que hacemos tiene un propósito claro.',
  },
  en: {
    eyebrow: 'The Official Promise',
    title: 'A drink that doesn\'t need too much explaining.',
    manifesto:
      'We created a modern, healthy, emotionally memorable drink. One that does not need caffeine to feel alive or excess to become indispensable. What Magic Drink offers is something science still studies and consumers simply enjoy.',
    metrics: [
      { value: '190+', label: 'markets where the brand is recognized' },
      { value: '1', label: 'Original bringing us together' },
      { value: '24/7', label: 'presence inside real routines' },
    ],
    cardLabel: 'Corporate Manifesto',
    cardText: 'We are committed to transparency, responsible innovation, and consistent consumer satisfaction. Everything we do has a clear purpose.',
  },
};

export default function NosotrosSeccion2() {
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
        { opacity: 0, y: 50, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.95,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 72%' },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div className={styles.copyBlock}>
            <span className={styles.eyebrow} data-reveal>{t.eyebrow}</span>
            <h2 className={styles.title} data-reveal>{t.title}</h2>
            <p className={styles.manifesto} data-reveal>{t.manifesto}</p>
          </div>

          <div className={styles.visualBlock} data-reveal>
            <div className={styles.manifestoCard}>
              <span className={styles.cardLabel}>{t.cardLabel}</span>
              <p>{t.cardText}</p>
            </div>
            <img
              src="/image/hexy/hexy-live-corporate.webp"
              alt="Hexy - Magic Drink Corporate"
              className={styles.hexyImage}
              loading="lazy"
            />
          </div>
        </div>

        <div className={styles.metricsRow}>
          {t.metrics.map((m) => (
            <article key={m.value} className={styles.metricCard} data-reveal>
              <strong className={styles.metricValue}>{m.value}</strong>
              <span className={styles.metricLabel}>{m.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
