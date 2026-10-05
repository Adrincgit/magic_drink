import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import HexyPlayer from '../components/HexyPlayer';
import { useHexyAudio } from '../components/HexyAudioProvider';
import useReducedMotion from '../components/useReducedMotion';
import styles from '../css/hexySeccion1.module.css';

const content = {
  es: {
    eyebrow: 'LA IDOL OFICIAL DE MAGIC DRINK',
    titleSmall: 'Conoce a',
    titleBig: 'Hexy',
    tagline: 'La voz detr\u00E1s de tu sensaci\u00F3n favorita.',
    description:
      'M\u00E1s que una idol virtual. M\u00E1s que una canci\u00F3n. Una sensaci\u00F3n que puedes sentir.',
    ctaPrimary: 'Escuchar m\u00FAsica',
    ctaSecondary: 'Explorar canciones',
    stats: [
      { value: '2.4B+', label: 'Reproducciones' },
      { value: '15M+', label: 'Fans en todo el mundo' },
      { value: '#1', label: 'Vibra positiva' },
    ],
  },
  en: {
    eyebrow: 'THE OFFICIAL IDOL OF MAGIC DRINK',
    titleSmall: 'Meet',
    titleBig: 'Hexy',
    tagline: 'The voice behind your favorite feeling.',
    description:
      'More than a virtual idol. More than a song. A feeling you can actually feel.',
    ctaPrimary: 'Listen to music',
    ctaSecondary: 'Explore songs',
    stats: [
      { value: '2.4B+', label: 'Streams' },
      { value: '15M+', label: 'Fans worldwide' },
      { value: '#1', label: 'Positive vibes' },
    ],
  },
};

export default function HexySeccion1() {
  const ingles = useStore(isEnglish);
  const t = ingles ? content.en : content.es;
  const { isPlaying, togglePlay } = useHexyAudio();
  const reducedMotion = useReducedMotion();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (reducedMotion) { video?.pause(); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video?.play().catch(() => {});
      else video?.pause();
    });
    if (video) observer.observe(video);
    return () => { observer.disconnect(); video?.pause(); };
  }, [reducedMotion]);

  return (
    <section className={styles.hero}>
      <video
        ref={videoRef}
        className={styles.bgVideo}
        poster="/image/backgrounds/hexy_bg1.webp"
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/videos/hexy_hero.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <span className={styles.eyebrow}>
          <img
            src="/icons/icono_hexy.webp"
            alt=""
            className={styles.eyebrowIcon}
          />
          {t.eyebrow}
        </span>

        <h1 className={styles.title}>
          <span className={styles.titleSmall}>{t.titleSmall}</span>
          <span className={styles.titleBig}>
            {t.titleBig}
            <span className={styles.star}>{'\u2726'}</span>
          </span>
        </h1>

        <p className={styles.tagline}>{t.tagline}</p>
        <p className={styles.description}>{t.description}</p>

        <div className={styles.actions}>
          <button className={styles.ctaPrimary} onClick={togglePlay} type="button">
            <span className={styles.playIcon} aria-hidden="true">{isPlaying ? 'Ⅱ' : '\u25B6'}</span>
            {isPlaying ? (ingles ? 'Pause music' : 'Pausar música') : t.ctaPrimary}
          </button>
          <a className={styles.ctaSecondary} href="#canciones" onClick={(event) => {
            event.preventDefault();
            const songs = document.getElementById('canciones');
            songs?.focus({ preventScroll: true });
            songs?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
          }}>
            <span className={styles.globeIcon} aria-hidden="true">{'\u2726'}</span>
            {t.ctaSecondary}
          </a>
        </div>

        <div className={styles.stats}>
          {t.stats.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
              {i < t.stats.length - 1 && <div className={styles.statDivider} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className={styles.playerArea}>
        <HexyPlayer />
      </div>
    </section>
  );
}
