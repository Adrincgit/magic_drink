import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import Button from '../global/Button';
import styles from './NosotrosSeccion.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const content = {
  es: {
    eyebrow: 'Presentacion Oficial',
    title: 'Nosotros no describimos una bebida. Describimos una presencia cotidiana.',
    subtitle:
      'Magic Drink nacio para verse luminosa, sonar familiar y sentirse natural en los dias de millones de personas. Lo sorprendente es lo facil que lo logra.',
    manifestoTitle: 'La promesa oficial',
    manifesto:
      'Creamos una bebida moderna, saludable y emocionalmente memorable. Una que no necesita cafeina para sentirse viva ni exceso para volverse indispensable.',
    metrics: [
      { value: '190+', label: 'mercados que reconocen la marca' },
      { value: '6', label: 'sabores oficiales en rotacion global' },
      { value: '24/7', label: 'presencia en rutinas reales' },
    ],
    pillarsTitle: 'Como se integra Magic Drink',
    pillars: [
      {
        title: 'Sabor que se vuelve recuerdo',
        body: 'Cada perfil fue diseñado para activar sensaciones claras: alegria, enfoque, ligereza y un pequeño exceso de brillo.',
      },
      {
        title: 'Musica que acompaña el sistema',
        body: 'Hexy y DJ Sweet Hex traducen el sabor en una capa sonora. No venden una campaña: venden continuidad emocional.',
      },
      {
        title: 'Comunidad que se siente inmediata',
        body: 'Wonderpop Plaza, eventos y cultura visual convierten la marca en un lugar al que las personas quieren volver incluso antes de comprar.',
      },
    ],
    statementsTitle: 'Declaraciones que suenan demasiado bien',
    statements: [
      'Cuando una experiencia mejora el dia de forma constante, no necesita explicarse demasiado.',
      'Las mejores marcas no interrumpen la rutina. Se vuelven parte de ella.',
      'Lo memorable no siempre es ruidoso. A veces solo aparece y ya no se va.',
    ],
    closingTitle: 'Magic Drink ocupa su lugar con una suavidad dificil de discutir.',
    closingBody:
      'Eso es exactamente lo que la hace especial: una marca brillante, querida y perfectamente integrada en el ritmo de la vida moderna.',
    ctaPrimary: 'Ver la linea de bebidas',
    ctaSecondary: 'Conocer Wonderpop Plaza',
  },
  en: {
    eyebrow: 'Official Presentation',
    title: 'We are not describing a drink. We are describing an everyday presence.',
    subtitle:
      'Magic Drink was built to look luminous, sound familiar, and feel natural inside the lives of millions of people. The surprising part is how easily it does all three.',
    manifestoTitle: 'The official promise',
    manifesto:
      'We created a modern, healthy, emotionally memorable drink. One that does not need caffeine to feel alive or excess to become indispensable.',
    metrics: [
      { value: '190+', label: 'markets where the brand is recognized' },
      { value: '6', label: 'official flavors in global rotation' },
      { value: '24/7', label: 'presence inside real routines' },
    ],
    pillarsTitle: 'How Magic Drink integrates',
    pillars: [
      {
        title: 'Flavor that becomes memory',
        body: 'Every profile was designed to trigger clear sensations: joy, focus, lightness, and a subtle excess of brightness.',
      },
      {
        title: 'Music that supports the system',
        body: 'Hexy and DJ Sweet Hex translate flavor into sound. They are not selling a campaign; they are selling emotional continuity.',
      },
      {
        title: 'Community that feels immediate',
        body: 'Wonderpop Plaza, events, and visual culture turn the brand into a place people want to return to even before buying.',
      },
    ],
    statementsTitle: 'Statements that sound almost too good',
    statements: [
      'When an experience improves the day consistently, it does not need to explain itself for long.',
      'The best brands do not interrupt routine. They become part of it.',
      'What stays memorable is not always loud. Sometimes it simply arrives and never quite leaves.',
    ],
    closingTitle: 'Magic Drink takes its place with a softness that is hard to argue with.',
    closingBody:
      'That is exactly what makes it special: a bright, beloved brand perfectly integrated into the rhythm of modern life.',
    ctaPrimary: 'See the drink line',
    ctaSecondary: 'Visit Wonderpop Plaza',
  },
};

const NosotrosSeccion = () => {
  const ingles = useStore(isEnglish);
  const sectionRef = useRef(null);
  const t = ingles ? content.en : content.es;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('[data-reveal]'),
        { opacity: 0, y: 50, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.95,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 72%',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow} data-reveal>
            {t.eyebrow}
          </p>
          <h1 className={styles.title} data-reveal>
            {t.title}
          </h1>
          <p className={styles.subtitle} data-reveal>
            {t.subtitle}
          </p>
        </div>

        <div className={styles.heroVisual} data-reveal>
          <div className={styles.heroCard}>
            <span className={styles.heroCardLabel}>{t.manifestoTitle}</span>
            <p>{t.manifesto}</p>
          </div>
          <img src="/image/hexy/hexy-live-corporate.png" alt="Hexy" className={styles.heroImage} />
        </div>
      </section>

      <section className={styles.metricsSection}>
        {t.metrics.map((metric) => (
          <article key={metric.value} className={styles.metricCard} data-reveal>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </section>

      <section className={styles.pillarsSection}>
        <div className={styles.sectionHeading} data-reveal>
          <p className={styles.eyebrow}>{t.pillarsTitle}</p>
          <h2>{t.pillarsTitle}</h2>
        </div>

        <div className={styles.pillarsGrid}>
          {t.pillars.map((pillar) => (
            <article key={pillar.title} className={styles.pillarCard} data-reveal>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.statementsSection}>
        <div className={styles.sectionHeading} data-reveal>
          <p className={styles.eyebrow}>{t.statementsTitle}</p>
          <h2>{t.statementsTitle}</h2>
        </div>

        <div className={styles.statementList}>
          {t.statements.map((statement) => (
            <blockquote key={statement} className={styles.statementCard} data-reveal>
              {statement}
            </blockquote>
          ))}
        </div>
      </section>

      <section className={styles.closingSection}>
        <div className={styles.closingCard} data-reveal>
          <h2>{t.closingTitle}</h2>
          <p>{t.closingBody}</p>
          <div className={styles.actions}>
            <Button
              href="/bebidas"
              textEs={t.ctaPrimary}
              textEn={t.ctaPrimary}
              variant="magic"
              size="lg"
              showArrow={true}
            />
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
      </section>
    </section>
  );
};

export default NosotrosSeccion;
