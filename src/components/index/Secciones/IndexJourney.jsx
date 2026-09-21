import { useCallback, useEffect, useRef, useState } from 'react';
import { mountJourney } from '../animations/journeyMotion';
import { createAudioReaction } from '../animations/audioReaction';
import styles from '../css/indexJourney.module.css';
import IndexWorldTail from './IndexWorldTail';
import BillboardSequence from './BillboardSequence';
import { SceneButton, SceneLabel, SceneNote } from '../../global/SceneControls';
import ScenePlayer from '../../global/ScenePlayer';
import JourneyLoading from './JourneyLoading';
import JourneyStars from './JourneyStars';
import JourneyNavigation from './JourneyNavigation';
import HeroProduct, { HeroTable } from './HeroProduct';
import WaterSurface from './WaterSurface';
import { hexyPlaylist } from '../../../data/hexyPlaylist';
import { JOURNEY_END } from '../../../data/journeyChapters';

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
    next: 'THE CELEBRATION CONTINUES',
    pause: 'Pause',
    play: 'Play',
    skip: 'Skip to content',
  },
};

export default function IndexJourney({ en = false }) {
  const root = useRef(null);
  const audioRef = useRef(null);
  const audioReaction = useRef(null);
  const audioActions = useRef(null);
  const continuePlayback = useRef(false);
  const t = words[en ? 'en' : 'es'];
  const [chapter, setChapter] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const finishLoading = useCallback(() => setAssetsReady(true), []);
  const playRequest = useRef(0);
  const track = hexyPlaylist[trackIndex];

  useEffect(() => {
    return mountJourney(root.current, setChapter);
  }, []);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const stage = root.current.querySelector('[data-stage]');
    stage.inert = !assetsReady;
    return () => { stage.inert = false; };
  }, [assetsReady]);
  useEffect(() => {
    document.documentElement.lang = en ? 'en' : 'es';
  }, [en]);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setPlayerVisible(entry.isIntersecting), { threshold: .6 });
    const player = root.current.querySelector('[data-scene-player]');
    observer.observe(player);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) { continuePlayback.current = false; audioRef.current?.pause(); }
    };
    document.addEventListener('visibilitychange', pause);
    return () => {
      document.removeEventListener('visibilitychange', pause);
      playRequest.current++;
      audioRef.current?.pause();
      audioReaction.current?.dispose();
      audioReaction.current = null;
    };
  }, []);

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      playRequest.current++;
      continuePlayback.current = false;
      audio.pause();
      return;
    }
    const request = ++playRequest.current;
    try {
      await prepareAudioReaction(audio);
      if (request !== playRequest.current) return;
      await audio.play();
      if (request === playRequest.current) setAudioError(false);
    } catch {
      if (request === playRequest.current) setAudioError(true);
    }
  }
  audioActions.current = () => {
    if (audioRef.current?.paused) toggleAudio();
    else setHasPlayed(true);
  };
  useEffect(() => {
    const element = root.current;
    const listen = () => audioActions.current?.();
    element.addEventListener('journey:listen', listen);
    return () => element.removeEventListener('journey:listen', listen);
  }, []);

  async function prepareAudioReaction(audio) {
    try {
      audioReaction.current ??= createAudioReaction(audio, root.current);
      await audioReaction.current.resume();
    } catch { /* Audio playback remains available without visual analysis. */ }
  }

  async function selectTrack(index, shouldPlay = true) {
    const audio = audioRef.current;
    if (!audio) return;
    const request = ++playRequest.current;
    setTrackIndex(index);
    continuePlayback.current = false;
    setElapsed(0);
    setDuration(0);
    setAudioError(false);
    audio.src = hexyPlaylist[index].src;
    audio.load();
    if (shouldPlay) {
      try {
        await prepareAudioReaction(audio);
        if (request !== playRequest.current) return;
        await audio.play();
      }
      catch { if (request === playRequest.current) setAudioError(true); }
    }
  }
  const playerProps = {
    en, playing, elapsed, duration, track, tracks: hexyPlaylist, trackIndex, audioError,
    onToggle: toggleAudio,
    onSelect: selectTrack,
    onNext: () => selectTrack((trackIndex + 1) % hexyPlaylist.length),
    onSeek: time => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = time;
      // Keep the controlled range in sync with its input event; waiting for
      // timeupdate lets the following change event restore the old position.
      setElapsed(time);
    },
  };

  return (
    <>
    <JourneyLoading root={root} en={en} onReady={finishLoading} />
    <div className={styles.journey} ref={root} data-journey data-world-end={JOURNEY_END} data-music-playing={playing} data-active="true" data-assets-ready={assetsReady}
      style={{ '--journey-length': JOURNEY_END }}
      onDragStart={event => { if (event.target.tagName === 'IMG') event.preventDefault(); }}>
      <a className={styles.skipLink} href="#festival" data-go-world=".49">
        {t.skip}
      </a>

      <section
        className={styles.runway}
        id="original"
        data-runway
        aria-label={en ? 'Magic Drink, the city and Hexy' : 'Magic Drink, la ciudad y Hexy'}
      >
        <div className={styles.stage} data-stage aria-busy={!assetsReady}>
          <div className={styles.sky} data-depth="sky" aria-hidden="true">
            <div className={styles.skyGlow} />
            <JourneyStars />
            <div className={styles.comet} />
          </div>
          <div
            className={`${styles.cloudLayer} ${styles.cloudFar}`}
            data-depth="cloud-far"
            aria-hidden="true"
          >
            <img data-critical src={`${art}clouds.webp`} alt="" width="1536" height="1024" fetchpriority="low" />
          </div>
          <div
            className={`${styles.cloudLayer} ${styles.cloudNear}`}
            data-depth="cloud-near"
            aria-hidden="true"
          >
            <img src={`${art}clouds.webp`} alt="" width="1536" height="1024" fetchpriority="low" />
          </div>
          <div className={styles.sunPlane} data-depth="sun" data-look="city" aria-hidden="true">
            <i />
          </div>
          <div
            className={`${styles.distance} ${styles.hills}`}
            data-depth="hills"
            data-look="far"
            aria-hidden="true"
          >
            <img data-critical src={`${art}distance-hills-v2.webp`} alt="" width="2172" height="724" />
          </div>
          <div
            className={styles.distance}
            data-depth="distance"
            data-look="city"
            aria-hidden="true"
          >
            <img data-critical src={`${art}distance-city-v2.webp`} alt="" width="2172" height="724" />
          </div>
          <div
            className={`${styles.distance} ${styles.water}`}
            data-depth="water"
            data-look="city"
            aria-hidden="true"
          >
            <WaterSurface />
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
                data-critical
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
              data-look="street"
              aria-hidden="true"
            >
              <div className={`${styles.lamp} ${styles.lampOne}`} data-opening-lamp>
                <img data-critical src={`${art}lamp.webp`} alt="" width="1024" height="1536" />
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
              <HeroTable />
            </div>
            <div
              className={styles.productPlane}
              data-depth="product"
              data-look="near"
            >
              <HeroProduct en={en} active={assetsReady && chapter === 0} />
            </div>
            <div
              className={styles.nearPlants}
              data-depth="plants"
              data-look="near"
              aria-hidden="true"
            >
              <img
                data-critical
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
              <ScenePlayer {...playerProps} />
              <a className={styles.textLink} href="/hexy">
                {t.meet}
                <span>↗</span>
              </a>
            </section>
          </div>
          <IndexWorldTail en={en} />
          <JourneyNavigation root={root} en={en} />
          <div className={styles.exitShade} data-exit-shade aria-hidden="true" />
        </div>
      </section>
      {hasPlayed && (!playerVisible || (!reducedMotion && chapter !== 2)) && <ScenePlayer {...playerProps} compact onClose={() => {
        playRequest.current++;
        continuePlayback.current = false;
        audioRef.current?.pause();
        setHasPlayed(false);
      }} />}
      <audio
        ref={audioRef}
        preload="none"
        src="/audio/demos/no_brain_just_vibes_demo.mp3"
        onPlay={() => { continuePlayback.current = true; setPlaying(true); setHasPlayed(true); }}
        onPause={event => {
          // Natural completion pauses the media before firing `ended`.
          // Seeking to the end of an already paused track must stay paused.
          if (!event.currentTarget.ended) continuePlayback.current = false;
          setPlaying(false);
        }}
        onEnded={() => { if (continuePlayback.current) selectTrack((trackIndex + 1) % hexyPlaylist.length); }}
        onError={() => { continuePlayback.current = false; setPlaying(false); setAudioError(true); }}
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
      />
    </div>
    </>
  );
}
