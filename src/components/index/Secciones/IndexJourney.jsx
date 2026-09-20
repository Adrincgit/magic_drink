import { useEffect, useRef, useState } from 'react';
import { mountJourney } from '../animations/journeyMotion';
import styles from '../css/indexJourney.module.css';
import IndexWorldTail from './IndexWorldTail';
import BillboardSequence from './BillboardSequence';
import { SceneButton, SceneLabel, SceneNote } from '../../global/SceneControls';
import ScenePlayer from '../../global/ScenePlayer';

const art = '/image/journey/';
const words = {
  es: {
    claim: 'LA BEBIDA N.º 1 DEL MUNDO',
    world: (
      <>
        Un sabor que no puedes dejar de querer.
        <br />
        Saludable y sin cafeína.
      </>
    ),
    enter: 'Descubre por qué',
    listen: 'Escucha a Hexy',
    eyebrow: 'ASÍ SE SIENTE MAGIC DRINK',
    city: (
      <>
        Adiós, días
        <br />
        <em>aburridos.</em>
      </>
    ),
    cityBody: (
      <>
        Con Magic Drink, lo cotidiano se siente menos aburrido.
        <br />
        Por algo se ha convertido en la favorita del mundo.
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
    musicBody: 'Sus canciones ya se quedan en tu cabeza. Los fans dicen que, con una Magic Drink, se vuelven todavía más adictivas.',
    meet: 'Conoce a Hexy',
    scroll: 'DESLIZA Y DESCUBRE',
    chapters: ['MAGIC DRINK', 'LA CIUDAD', 'HEXY'],
    next: 'LA CELEBRACIÓN CONTINÚA',
    pause: 'Pausar',
    play: 'Reproducir',
    skip: 'Ir al contenido',
  },
  en: {
    claim: 'THE WORLD’S No. 1 DRINK',
    world: (
      <>
        A taste you keep coming back for.
        <br />Healthy and caffeine free.
      </>
    ),
    enter: 'Discover why',
    listen: 'Listen to Hexy',
    eyebrow: 'THIS IS HOW MAGIC DRINK FEELS',
    city: (
      <>
        Goodbye,
        <br />
        <em>boring days.</em>
      </>
    ),
    cityBody: (
      <>
        With Magic Drink, everyday life feels less ordinary.
        <br />
        There’s a reason it became the world’s favorite.
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
    musicBody: 'Her songs already stay in your head. Fans say they become even more addictive with a Magic Drink.',
    meet: 'Meet Hexy',
    scroll: 'SCROLL TO DISCOVER',
    chapters: ['MAGIC DRINK', 'THE CITY', 'HEXY'],
    next: 'THE CELEBRATION CONTINUES',
    pause: 'Pause',
    play: 'Play',
    skip: 'Skip to content',
  },
};

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
        aria-label={en ? 'Magic Drink, the city and Hexy' : 'Magic Drink, la ciudad y Hexy'}
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
          <div className={styles.sunPlane} data-depth="sun" data-look="sun" aria-hidden="true">
            <i />
          </div>
          <div
            className={`${styles.distance} ${styles.hills}`}
            data-depth="hills"
            data-look="far"
            aria-hidden="true"
          >
            <img src={`${art}distance-hills-v2.webp`} alt="" width="2172" height="724" />
          </div>
          <div
            className={styles.distance}
            data-depth="distance"
            data-look="city"
            aria-hidden="true"
          >
            <img src={`${art}distance-city-v2.webp`} alt="" width="2172" height="724" />
          </div>
          <div
            className={`${styles.distance} ${styles.water}`}
            data-depth="water"
            data-look="water"
            aria-hidden="true"
          >
            <img src={`${art}distance-water-v2.webp`} alt="" width="2172" height="724" />
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
          <div className={styles.openingScene} data-opening>
            <div
              className={styles.street}
              data-depth="street"
              data-look="street"
              aria-hidden="true"
            >
              <img
                className={styles.streetArt}
                src={`${art}street-separated.webp`}
                alt=""
                width="2172"
                height="724"
                fetchpriority="high"
              />
              <BillboardSequence active={chapter === 1 || chapter === 2} />
              <span className={`${styles.shopLight} ${styles.lightOne}`} />
              <span className={`${styles.shopLight} ${styles.lightTwo}`} />
            </div>
            <div
              className={styles.streetFurniture}
              data-depth="furniture"
              data-look="near"
              aria-hidden="true"
            >
              <div className={`${styles.lamp} ${styles.lampOne}`} data-opening-lamp>
                <img src={`${art}lamp.webp`} alt="" width="1024" height="1536" />
              </div>
              <div className={`${styles.lamp} ${styles.lampTwo}`} data-opening-lamp>
                <img src={`${art}lamp.webp`} alt="" width="1024" height="1536" />
              </div>
            </div>
            <div
              className={styles.foreground}
              data-depth="counter"
              data-look="near"
              aria-hidden="true"
            >
              <img
                className={styles.counter}
                src={`${art}counter.webp`}
                alt=""
                width="1672"
                height="941"
              />
              <span className={styles.contactShadow} />
            </div>
            <div
              className={styles.productPlane}
              data-depth="product"
              data-look="near"
              aria-hidden="true"
            >
              <img
                className={styles.can}
                src={`${art}original.webp`}
                alt=""
                width="1024"
                height="1536"
                fetchpriority="high"
              />
            </div>
            <div
              className={styles.nearPlants}
              data-depth="plants"
              data-look="near"
              aria-hidden="true"
            >
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
              <SceneLabel>{t.claim}</SceneLabel>
              <h1>
                <span className={styles.brandTop}>MAGIC</span>{' '}
                <span className={styles.brandBottom}>
                  DRINK<span>.</span>
                </span>
              </h1>
              <SceneNote>{t.world}</SceneNote>
              <div className={styles.actions}>
                <SceneButton href="#ciudad" data-go=".45">{t.enter}</SceneButton>
                <SceneButton className={styles.listenAction} variant="violet" icon="play" href="#hexy" data-go=".87">{t.listen}</SceneButton>
              </div>
            </div>
            <section id="ciudad" className={`${styles.copy} ${styles.cityCopy}`} data-chapter="1">
              <SceneLabel>{t.eyebrow}</SceneLabel>
              <h2>{t.city}</h2>
              <SceneNote>{t.cityBody}</SceneNote>
              <SceneButton variant="violet" href="#hexy" data-go=".87">{t.follow}</SceneButton>
            </section>
            <section id="hexy" className={`${styles.copy} ${styles.musicCopy}`} data-chapter="2">
              <SceneLabel>{t.voice}</SceneLabel>
              <h2>{t.music}</h2>
              <SceneNote>{t.musicBody}</SceneNote>
              <ScenePlayer en={en} playing={playing} elapsed={elapsed} duration={duration} onToggle={toggleAudio}
                onSeek={(time) => { if (audioRef.current) audioRef.current.currentTime = time; }} />
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
