import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/hexySeccion2.module.css';
import { useHexyAudio } from '../components/HexyAudioProvider';

const coverHighlights = [
  { src: '/image/music_covers/nobrain_just_vibes.webp', alt: 'No Brain Just Vibes' },
  { src: '/image/music_covers/hexy_wow.webp', alt: 'Hexy Wow' },
  { src: '/image/music_covers/roundy_round.webp', alt: 'Roundy Round' },
];

const content = {
  es: {
    eyebrow: 'La se\u00F1al de Hexy',
    title: '\u00BFQui\u00E9n es ',
    titleAccent: 'Hexy?',
    subtitle:
      'La idol virtual de Magic Drink no solo se mira: su mundo se escucha en hooks, portadas, coros y latas que parecen tener su propia luz.',
    heading: 'La chispa que convierte una bebida en un ritual pop',
    paragraphs: [
      'Hexy es el rostro emocional de Magic Drink: cabello rosa, sombrero de bruja, estrella amarilla y una energ\u00EDa que convierte cualquier escena en un momento cantable.',
      'Su presencia vive entre conciertos, clips, empaques, stickers y canciones cortas que se sienten como peque\u00F1os hechizos pop. Cuando entra el coro de los Magic Bunnies, el universo deja de ser solo visual y se vuelve sonido.',
    ],
    visualKicker: 'Ahora suena',
    visualTitle: 'Magic Drink frequency',
    signals: [
      {
        title: 'Rostro de la sensaci\u00F3n',
        body: 'No aparece como una mascota quieta. Hexy funciona como una idol: canta, posa, salta entre portadas y empuja el tono emocional de la marca.',
      },
      {
        title: 'Hooks con burbujas',
        body: 'Las canciones mezclan brillo kawaii, frases repetibles y beats ligeros. La lata deja de ser producto y se vuelve parte del escenario.',
      },
      {
        title: 'Fandom que responde',
        body: 'Los Magic Bunnies aparecen como coros, ecos y voces peque\u00F1as que contestan a Hexy, como si cada track tuviera p\u00FAblico propio.',
      },
    ],
  },
  en: {
    eyebrow: 'Hexy Signal',
    title: 'Who is ',
    titleAccent: 'Hexy?',
    subtitle:
      'Magic Drink\u2019s virtual idol is not just something you see: her world is heard through hooks, covers, choruses, and cans that feel lit from within.',
    heading: 'The spark that turns a drink into a pop ritual',
    paragraphs: [
      'Hexy is the emotional face of Magic Drink: pink hair, witch hat, yellow star, and the kind of energy that turns any scene into something singable.',
      'Her presence lives across concerts, clips, packaging, stickers, and short songs that feel like tiny pop spells. When the Magic Bunnies chorus enters, the universe stops being only visual and becomes sound.',
    ],
    visualKicker: 'Now playing',
    visualTitle: 'Magic Drink frequency',
    signals: [
      {
        title: 'Face of the feeling',
        body: 'She does not behave like a static mascot. Hexy works like an idol: singing, posing, jumping between covers, and steering the brand\u2019s emotion.',
      },
      {
        title: 'Bubble-bright hooks',
        body: 'The songs blend kawaii shine, repeatable phrases, and light beats. The can stops being a product and becomes part of the stage.',
      },
      {
        title: 'A fandom that answers',
        body: 'The Magic Bunnies appear as choruses, echoes, and tiny voices answering Hexy, as if every track carried its own crowd.',
      },
    ],
  },
};

export default function HexySeccion2() {
  const ingles = useStore(isEnglish);
  const t = ingles ? content.en : content.es;
  const sectionRef = useRef(null);
  const { track, isPlaying } = useHexyAudio();

  useEffect(() => {
    const section = sectionRef.current;
    if (
      !section ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(min-width: 900px)').matches
    ) {
      return;
    }

    let ctx;
    let cancelled = false;

    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([gsapModule, scrollTriggerModule]) => {
      if (cancelled) return;

      const gsap = gsapModule.default;
      const { ScrollTrigger } = scrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          '[data-hexy-copy]',
          { y: 36, opacity: 0.72 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 68%',
            },
          }
        );

        gsap.fromTo(
          '[data-hexy-stage]',
          { y: 72, rotate: -1.2, scale: 0.96 },
          {
            y: -22,
            rotate: 0,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          }
        );

        gsap.fromTo(
          '[data-hexy-card]',
          { y: 24 },
          {
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: 'top 55%',
            },
          }
        );
      }, section);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.sectionMist} />

      <div className={styles.shell}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h2 className={styles.sectionTitle}>
            {t.title}
            <span className={styles.titleAccent}>{t.titleAccent}</span>
          </h2>
          <p className={styles.sectionSubtitle}>{t.subtitle}</p>
        </div>

        <div className={styles.storyGrid}>
          <figure className={styles.visualPanel} data-hexy-stage>
            <div className={styles.stageHalo} />
            <img
              src="/image/hexy/hexy-anime-banner.webp"
              alt="Hexy mixing the Magic Drink sound"
              className={styles.mainVisual}
              loading="lazy"
              decoding="async"
            />
            <div className={styles.visualShade} />
            <figcaption className={styles.nowPlaying}>
              <span>{isPlaying ? t.visualKicker : (ingles ? 'The world of Hexy' : 'El mundo de Hexy')}</span>
              <strong>{isPlaying ? track.title : t.visualTitle}</strong>
            </figcaption>
            <div className={styles.coverStrip} aria-hidden="true">
              {coverHighlights.map((cover) => (
                <img key={cover.src} src={cover.src} alt="" className={styles.coverThumb} />
              ))}
            </div>
          </figure>

          <div className={styles.textContent} data-hexy-copy>
            <h3>{t.heading}</h3>
            {t.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <div className={styles.signalList}>
              {t.signals.map((signal, index) => (
                <article key={signal.title} className={styles.signalItem} data-hexy-card>
                  <span className={styles.signalNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{signal.title}</h4>
                    <p>{signal.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
