import { useEffect, useRef, useState } from 'react';
import { mountJourney } from '../animations/journeyMotion';
import styles from '../css/indexJourney.module.css';
import IndexWorldTail from './IndexWorldTail';

const art = '/image/journey/';
const words = {
  es: {
    original: 'LA',
    world: (
      <>
        Un sorbo. Tu música.
        <br />
        Un mundo por descubrir.
      </>
    ),
    enter: 'Entra en su mundo',
    listen: 'Escucha a Hexy',
    eyebrow: 'UN MUNDO MÁS BRILLANTE',
    city: (
      <>
        La ciudad tiene
        <br />
        <em>su propio ritmo.</em>
      </>
    ),
    cityBody: (
      <>
        En la calle. En tus canciones.
        <br />
        En esos momentos que quieres repetir.
      </>
    ),
    follow: 'Sigue la música',
    voice: 'HEXY · LA VOZ DE MAGIC DRINK',
    music: (
      <>
        Dale play
        <br />
        <em>a Hexy.</em>
      </>
    ),
    musicBody: 'Una canción. Una sonrisa. La Original.',
    meet: 'Conoce a Hexy',
    scroll: 'DESLIZA Y DESCUBRE',
    chapters: ['LA ORIGINAL', 'LA CIUDAD', 'HEXY'],
    next: 'LA CELEBRACIÓN CONTINÚA',
    pause: 'Pausar',
    play: 'Reproducir',
    skip: 'Ir al contenido',
  },
  en: {
    original: 'THE',
    world: (
      <>
        One sip. Your music.
        <br />A world to discover.
      </>
    ),
    enter: 'Step into its world',
    listen: 'Listen to Hexy',
    eyebrow: 'A BRIGHTER WORLD',
    city: (
      <>
        The city has
        <br />
        <em>its own rhythm.</em>
      </>
    ),
    cityBody: (
      <>
        In the streets. In your songs.
        <br />
        In the moments you want to live again.
      </>
    ),
    follow: 'Follow the music',
    voice: 'HEXY · THE VOICE OF MAGIC DRINK',
    music: (
      <>
        Press play.
        <br />
        <em>This is Hexy.</em>
      </>
    ),
    musicBody: 'A song. A smile. The Original.',
    meet: 'Meet Hexy',
    scroll: 'SCROLL TO DISCOVER',
    chapters: ['THE ORIGINAL', 'THE CITY', 'HEXY'],
    next: 'THE CELEBRATION CONTINUES',
    pause: 'Pause',
    play: 'Play',
    skip: 'Skip to content',
  },
};

function Star({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="m24 2 7 13 15 3-10 11 1 15-13-7-13 7 1-15L2 18l15-3Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function IndexJourney({ en = false }) {
  const root = useRef(null);
  const audioRef = useRef(null);
  const t = words[en ? 'en' : 'es'];
  const [chapter, setChapter] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    return mountJourney(root.current, setChapter);
  }, []);
  useEffect(() => {
    document.documentElement.lang = en ? 'en' : 'es';
  }, [en]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) audioRef.current?.pause();
    };
    document.addEventListener('visibilitychange', pause);
    return () => {
      document.removeEventListener('visibilitychange', pause);
      audioRef.current?.pause();
    };
  }, []);

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
      setAudioError(false);
    } catch {
      setAudioError(true);
    }
  }

  return (
    <div className={styles.journey} ref={root} data-journey data-active="true">
      <a className={styles.skipLink} href="#festival" data-go-world=".49">
        {t.skip}
      </a>

      <section
        className={styles.runway}
        id="original"
        data-runway
        aria-label={en ? 'Original, the city and Hexy' : 'Original, la ciudad y Hexy'}
      >
        <div className={styles.stage} data-stage>
          <div className={styles.sky} data-depth="sky" aria-hidden="true">
            <div className={styles.skyGlow} />
            <div className={styles.stars} />
            <div className={styles.comet} />
          </div>
          <div
            className={`${styles.cloudLayer} ${styles.cloudFar}`}
            data-depth="cloud-far"
            aria-hidden="true"
          >
            <img src={`${art}clouds.webp`} alt="" width="1536" height="1024" fetchpriority="low" />
          </div>
          <div
            className={`${styles.cloudLayer} ${styles.cloudNear}`}
            data-depth="cloud-near"
            aria-hidden="true"
          >
            <img src={`${art}clouds.webp`} alt="" width="1536" height="1024" fetchpriority="low" />
          </div>
          <div className={styles.distance} data-depth="distance" aria-hidden="true">
            <img src={`${art}distance.webp`} alt="" width="2172" height="724" />
          </div>
          <div className={styles.worldPavement} data-world-ground aria-hidden="true">
            <img
              src={`${art}plaza-pavement.webp`}
              alt=""
              width="2172"
              height="724"
              loading="lazy"
            />
          </div>
          <div className={styles.plazaPlane} data-depth="plaza" aria-hidden="true">
            <img src={`${art}wonderpop-building.webp`} alt="" width="1024" height="1536" />
          </div>
          <div className={styles.openingScene} data-opening>
            <div className={styles.street} data-depth="street" aria-hidden="true">
              <img
                className={styles.streetArt}
                src={`${art}street-separated.webp`}
                alt=""
                width="2172"
                height="724"
                fetchpriority="high"
              />
              <div className={styles.billboard} data-billboard>
                <img src={`${art}hexy-poster.webp`} alt="" width="1024" height="1536" />
                <div className={styles.screenGlow} />
              </div>
              <span className={`${styles.shopLight} ${styles.lightOne}`} />
              <span className={`${styles.shopLight} ${styles.lightTwo}`} />
            </div>
            <div className={styles.streetFurniture} data-depth="furniture" aria-hidden="true">
              <img
                className={styles.lampOne}
                src={`${art}lamp.webp`}
                alt=""
                width="1024"
                height="1536"
              />
              <img
                className={styles.lampTwo}
                src={`${art}lamp.webp`}
                alt=""
                width="1024"
                height="1536"
              />
            </div>
            <div className={styles.foreground} data-depth="counter" aria-hidden="true">
              <img
                className={styles.counter}
                src={`${art}counter.webp`}
                alt=""
                width="1672"
                height="941"
              />
              <span className={styles.contactShadow} />
            </div>
            <div className={styles.productPlane} data-depth="product" aria-hidden="true">
              <img
                className={styles.can}
                src={`${art}original.webp`}
                alt=""
                width="1024"
                height="1536"
                fetchpriority="high"
              />
            </div>
            <div className={styles.nearPlants} data-depth="plants" aria-hidden="true">
              <img
                src={`${art}foliage.webp`}
                className={styles.leavesRight}
                alt=""
                width="1024"
                height="1024"
              />
              <img
                src={`${art}foliage.webp`}
                className={styles.leavesLeft}
                alt=""
                width="1024"
                height="1024"
              />
            </div>
            <div className={styles.windowEdge} data-depth="window" aria-hidden="true">
              <i />
              <i />
            </div>
            <div
              className={`${styles.shade} ${styles.shadeLeft}`}
              data-shade="left"
              aria-hidden="true"
            />
            <div
              className={`${styles.shade} ${styles.shadeRight}`}
              data-shade="right"
              aria-hidden="true"
            />
            <div className={styles.atmosphere} aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <i key={i} style={{ '--i': i }} />
              ))}
            </div>

            <div className={`${styles.copy} ${styles.heroCopy}`} data-chapter="0">
              <p className={styles.eyebrow}>
                <Star /> MAGIC DRINK ORIGINAL
              </p>
              <h1>
                <span className={styles.the}>{t.original}</span>
                <span className={styles.original}>
                  ORIGINAL<span>.</span>
                </span>
              </h1>
              <p className={styles.intro}>{t.world}</p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#ciudad" data-go=".45">
                  {t.enter}
                  <span>↗</span>
                </a>
                <a className={styles.soundLink} href="#hexy" data-go=".87">
                  <span>▷</span>
                  {t.listen}
                </a>
              </div>
            </div>
            <section id="ciudad" className={`${styles.copy} ${styles.cityCopy}`} data-chapter="1">
              <p className={styles.eyebrow}>
                <Star />
                {t.eyebrow}
              </p>
              <h2>{t.city}</h2>
              <p className={styles.intro}>{t.cityBody}</p>
              <a className={`${styles.button} ${styles.outline}`} href="#hexy" data-go=".87">
                {t.follow}
                <span>→</span>
              </a>
            </section>
            <section id="hexy" className={`${styles.copy} ${styles.musicCopy}`} data-chapter="2">
              <p className={styles.eyebrow}>
                <Star />
                {t.voice}
              </p>
              <h2>{t.music}</h2>
              <p className={styles.intro}>{t.musicBody}</p>
              <div className={styles.musicPlayer}>
                <button
                  className={styles.audioPlay}
                  type="button"
                  aria-label={`${playing ? t.pause : t.play} No Brain, Just Vibes!`}
                  aria-pressed={playing}
                  onClick={toggleAudio}
                >
                  {playing ? 'Ⅱ' : '▶'}
                </button>
                <div className={styles.track}>
                  <strong>No Brain, Just Vibes!</strong>
                  <span>Hexy · DJ Sweet Hex</span>
                  <div className={styles.trackProgress}>
                    <i style={{ width: `${duration ? (elapsed / duration) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className={styles.trackTime}>
                  {Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, '0')}
                </span>
              </div>
              {audioError && (
                <p className={styles.audioError} role="status">
                  {en
                    ? 'The track could not load. Try again.'
                    : 'No se pudo cargar la canción. Inténtalo de nuevo.'}
                </p>
              )}
              <a className={styles.textLink} href="/hexy">
                {t.meet}
                <span>↗</span>
              </a>
            </section>
          </div>
          <IndexWorldTail en={en} />
          <div className={styles.sceneNavigation} data-opening-navigation>
            <span className={styles.sceneLabel}>
              <b>0{Math.max(0, chapter) + 1}</b>
              {t.chapters[Math.max(0, chapter)]}
            </span>
            <div className={styles.sceneDots} role="group" aria-label={en ? 'Scenes' : 'Escenas'}>
              {[0, 0.45, 0.87].map((p, i) => (
                <button
                  key={p}
                  data-go={p}
                  aria-label={t.chapters[i]}
                  aria-pressed={chapter === i}
                />
              ))}
            </div>
            <span className={styles.scrollHint}>
              {t.scroll}
              <span>↓</span>
            </span>
            <div className={styles.journeyProgress}>
              <i data-progress-bar />
            </div>
          </div>
          <div className={styles.exitShade} data-exit-shade aria-hidden="true" />
        </div>
      </section>
      <audio
        ref={audioRef}
        preload="none"
        src="/audio/demos/no_brain_just_vibes_demo.mp3"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  );
}
