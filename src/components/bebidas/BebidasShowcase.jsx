import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import { magicDrinkFlavors } from '../../data/magicDrinkFlavors';
import useFlavorAudio from '../global/useFlavorAudio';
import Button from '../global/Button';
import styles from './BebidasShowcase.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const detectMobile = () => typeof window !== 'undefined' && window.innerWidth <= 900;
const getText = (value, ingles) => (typeof value === 'string' ? value : ingles ? value.en : value.es);
const formatFlavorName = (slug) => slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

const pageContent = {
  es: {
    eyebrow: 'Coleccion Oficial de Sabores',
    title: 'Bebidas que convierten un sorbo en atmosfera.',
    subtitle:
      'Magic Drink no se presenta como una lista de latas. Se presenta como una coleccion de estados de animo diseñados para quedarse contigo.',
    selectorLabel: 'Explora la linea',
    selectorHint: 'Salta al sabor que quieras ver primero.',
    notesLabel: 'Notas',
    ritualLabel: 'Momento ideal',
    compareTitle: 'Toda la linea, de un vistazo',
    compareBody:
      'Seis perfiles distintos. Una sola promesa: energia emocional, cero cafeina y una fidelidad que se siente demasiado natural.',
    compareColumns: {
      flavor: 'Sabor',
      energy: 'Energia',
      taste: 'Perfil',
      vibe: 'Vibe',
    },
    ctaTitle: 'La coleccion sigue expandiendose fuera de la lata.',
    ctaBody:
      'Conoce como Hexy convierte cada sabor en musica y como Wonderpop Plaza vuelve todo el universo de Magic Drink una experiencia fisica.',
    ctaPrimary: 'Entrar al mundo de Hexy',
    ctaSecondary: 'Explorar Wonderpop Plaza',
    audioPlay: 'Escuchar su tono',
    audioPause: 'Pausar tono',
    heroBadge: '6 sabores oficiales',
    heroButton: 'Empezar por Magic Original',
  },
  en: {
    eyebrow: 'Official Flavor Collection',
    title: 'Drinks that turn one sip into atmosphere.',
    subtitle:
      'Magic Drink does not present itself as a list of cans. It presents itself as a collection of moods designed to stay with you.',
    selectorLabel: 'Explore the line',
    selectorHint: 'Jump to the flavor you want to see first.',
    notesLabel: 'Notes',
    ritualLabel: 'Best moment',
    compareTitle: 'The full line, at a glance',
    compareBody:
      'Six different profiles. One shared promise: emotional energy, zero caffeine, and loyalty that feels almost too natural.',
    compareColumns: {
      flavor: 'Flavor',
      energy: 'Energy',
      taste: 'Profile',
      vibe: 'Vibe',
    },
    ctaTitle: 'The collection keeps expanding beyond the can.',
    ctaBody:
      'See how Hexy turns each flavor into music and how Wonderpop Plaza turns the whole Magic Drink universe into a physical experience.',
    ctaPrimary: 'Enter Hexy world',
    ctaSecondary: 'Explore Wonderpop Plaza',
    audioPlay: 'Hear its tone',
    audioPause: 'Pause tone',
    heroBadge: '6 official flavors',
    heroButton: 'Start with Magic Original',
  },
};

const BebidasShowcase = () => {
  const ingles = useStore(isEnglish);
  const [isMobile, setIsMobile] = useState(detectMobile);
  const [visibleFlavor, setVisibleFlavor] = useState(magicDrinkFlavors[0].slug);
  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const heroCanRefs = useRef([]);
  const flavorRefs = useRef([]);
  const selectorRefs = useRef([]);
  const { toggleFlavor, isFlavorPlaying, currentFlavor, isPlaying } = useFlavorAudio();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || isMobile) return undefined;

    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.querySelectorAll('[data-hero-reveal]'),
          { y: 48, opacity: 0, filter: 'blur(12px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      }

      heroCanRefs.current.filter(Boolean).forEach((can, index) => {
        gsap.fromTo(
          can,
          { y: 120, opacity: 0, rotate: index % 2 === 0 ? -8 : 8, scale: 0.88 },
          {
            y: 0,
            opacity: 1,
            rotate: 0,
            scale: 1,
            duration: 1.1,
            delay: 0.18 + index * 0.08,
            ease: 'back.out(1.35)',
          }
        );
      });

      flavorRefs.current.filter(Boolean).forEach((section, index) => {
        const media = section.querySelector('[data-flavor-media]');
        const text = section.querySelector('[data-flavor-text]');
        const selector = selectorRefs.current[index];
        const slug = section.dataset.slug;

        gsap.fromTo(
          text,
          { x: -48, opacity: 0, filter: 'blur(10px)' },
          {
            x: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
            },
          }
        );

        gsap.fromTo(
          media,
          { x: 48, opacity: 0, scale: 0.92, filter: 'blur(10px)' },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
            },
          }
        );

        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setVisibleFlavor(slug),
          onEnterBack: () => setVisibleFlavor(slug),
          onToggle: (self) => {
            if (!selector) return;
            selector.dataset.active = self.isActive ? 'true' : 'false';
          },
        });
      });
    }, page);

    return () => ctx.revert();
  }, [isMobile]);

  const activeFlavor =
    magicDrinkFlavors.find((flavor) => flavor.audioId === currentFlavor && isPlaying) ||
    magicDrinkFlavors.find((flavor) => flavor.slug === visibleFlavor) ||
    magicDrinkFlavors[0];
  const t = ingles ? pageContent.en : pageContent.es;

  const handleJumpToFlavor = (slug) => {
    const element = document.getElementById(slug);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      ref={pageRef}
      className={styles.page}
      style={{
        '--ambient-color': activeFlavor.color,
        '--ambient-accent': activeFlavor.accentColor,
      }}
    >
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.ambientMesh} aria-hidden="true" />

      <section ref={heroRef} className={styles.heroSection}>
        <div className={styles.heroCopy}>
          <span className={styles.heroBadge} data-hero-reveal>
            {t.heroBadge}
          </span>
          <p className={styles.eyebrow} data-hero-reveal>
            {t.eyebrow}
          </p>
          <h1 className={styles.heroTitle} data-hero-reveal>
            {t.title}
          </h1>
          <p className={styles.heroSubtitle} data-hero-reveal>
            {t.subtitle}
          </p>
          <div className={styles.heroActions} data-hero-reveal>
            <Button
              href="#magic-original"
              textEs={t.heroButton}
              textEn={t.heroButton}
              variant="magic"
              size="lg"
              showArrow={true}
            />
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroRing} aria-hidden="true" />
          <div className={styles.heroCanGrid}>
            {magicDrinkFlavors.map((flavor, index) => (
              <img
                key={flavor.slug}
                ref={(el) => {
                  heroCanRefs.current[index] = el;
                }}
                src={flavor.image}
                alt={getText(flavor.tagline, ingles)}
                className={styles.heroCan}
                style={{
                  '--can-color': flavor.color,
                  '--can-accent': flavor.accentColor,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.selectorBand}>
        <div className={styles.selectorHeader}>
          <p className={styles.selectorLabel}>{t.selectorLabel}</p>
          <span className={styles.selectorHint}>{t.selectorHint}</span>
        </div>
        <div className={styles.selectorRail}>
          {magicDrinkFlavors.map((flavor, index) => {
            const active = visibleFlavor === flavor.slug || currentFlavor === flavor.audioId;
            return (
              <button
                key={flavor.slug}
                ref={(el) => {
                  selectorRefs.current[index] = el;
                }}
                type="button"
                className={`${styles.selectorButton} ${active ? styles.selectorButtonActive : ''}`}
                style={{ '--selector-color': flavor.color }}
                onClick={() => handleJumpToFlavor(flavor.slug)}
              >
                <span className={styles.selectorDot} />
                <span>{formatFlavorName(flavor.slug)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.flavorStack}>
        {magicDrinkFlavors.map((flavor, index) => {
          const playing = isFlavorPlaying(flavor.audioId);
          return (
            <article
              key={flavor.slug}
              id={flavor.slug}
              ref={(el) => {
                flavorRefs.current[index] = el;
              }}
              data-slug={flavor.slug}
              className={`${styles.flavorSection} ${playing ? styles.flavorPlaying : ''}`}
              style={{
                '--flavor-color': flavor.color,
                '--flavor-accent': flavor.accentColor,
              }}
            >
              <div className={styles.flavorInfo} data-flavor-text>
                <span className={styles.flavorIndex}>0{index + 1}</span>
                <p className={styles.flavorTagline}>{getText(flavor.tagline, ingles)}</p>
                <h2 className={styles.flavorTitle}>{formatFlavorName(flavor.slug)}</h2>
                <p className={styles.flavorDescription}>{getText(flavor.description, ingles)}</p>
                <p className={styles.flavorSpotlight}>{getText(flavor.spotlight, ingles)}</p>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>{t.compareColumns.energy}</span>
                    <strong className={styles.statValue}>{flavor.stats.energy}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>{t.compareColumns.taste}</span>
                    <strong className={styles.statValue}>{getText(flavor.stats.taste, ingles)}</strong>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>{t.compareColumns.vibe}</span>
                    <strong className={styles.statValue}>{getText(flavor.stats.vibe, ingles)}</strong>
                  </div>
                </div>

                <div className={styles.metaBlock}>
                  <span className={styles.metaTitle}>{t.notesLabel}</span>
                  <div className={styles.notePills}>
                    {getText(flavor.notes, ingles).map((note) => (
                      <span key={note} className={styles.notePill}>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.ritualCard}>
                  <span className={styles.metaTitle}>{t.ritualLabel}</span>
                  <p>{getText(flavor.ritual, ingles)}</p>
                </div>

                <button
                  type="button"
                  className={`${styles.audioButton} ${playing ? styles.audioButtonActive : ''}`}
                  onClick={() => toggleFlavor(flavor.audioId)}
                >
                  <span className={styles.audioIcon}>{playing ? 'II' : '>'}</span>
                  <span>{playing ? t.audioPause : t.audioPlay}</span>
                </button>
              </div>

              <div className={styles.flavorMedia} data-flavor-media>
                <div className={styles.mediaHalo} aria-hidden="true" />
                <div className={styles.orbit} aria-hidden="true" />
                <div className={styles.orbitSecondary} aria-hidden="true" />
                <img src={flavor.image} alt={getText(flavor.tagline, ingles)} className={styles.flavorCan} />
              </div>
            </article>
          );
        })}
      </div>

      <section className={styles.compareSection}>
        <div className={styles.compareCopy}>
          <p className={styles.eyebrow}>{t.compareTitle}</p>
          <h2 className={styles.compareHeading}>{t.compareTitle}</h2>
          <p className={styles.compareBody}>{t.compareBody}</p>
        </div>

        <div className={styles.compareTable}>
          <div className={styles.compareHeader}>
            <span>{t.compareColumns.flavor}</span>
            <span>{t.compareColumns.energy}</span>
            <span>{t.compareColumns.taste}</span>
            <span>{t.compareColumns.vibe}</span>
          </div>
          {magicDrinkFlavors.map((flavor) => (
            <div key={flavor.slug} className={styles.compareRow}>
              <span className={styles.compareFlavor}>
                <img src={flavor.image} alt="" className={styles.compareCan} />
                {formatFlavorName(flavor.slug)}
              </span>
              <span>{flavor.stats.energy}</span>
              <span>{getText(flavor.stats.taste, ingles)}</span>
              <span>{getText(flavor.stats.vibe, ingles)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <p className={styles.eyebrow}>Magic Drink Universe</p>
        <h2 className={styles.ctaTitle}>{t.ctaTitle}</h2>
        <p className={styles.ctaBody}>{t.ctaBody}</p>
        <div className={styles.ctaButtons}>
          <Button
            href="/hexy"
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
      </section>
    </section>
  );
};

export default BebidasShowcase;
