import { useEffect, useRef, useState } from 'react';
import { SceneButton, SceneStar } from '../global/SceneControls';
import { useHexyAudio } from './components/HexyAudioProvider';
import ConcertLanterns from './ConcertLanterns';
import styles from './HexyConcert.module.css';

const art = '/image/hexy/world-v46/';
const imageProps = { alt: '', loading: 'lazy', draggable: false };

function ConcertPerformer() {
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState(false);
  return <div className={styles.performer} data-concert-hexy data-ground-props data-frames-ready={loaded === 3 && !failed}>
    <span className={styles.groundShadow} data-hexy-shadow />
    <span className={styles.contactShadow} />
    <img {...imageProps} src="/image/hexy/world-v47/hexy-front.webp" width="1024" height="1536" data-hexy-master />
    {['vowel', 'blink'].map((name, i) => <img {...imageProps} key={name} className={styles.expressionCel}
      src={`/image/hexy/world-v48/hexy-${name}.webp`} width="1024" height="1536" data-concert-cel={name}
      onLoad={() => setLoaded(value => value | (1 << i))} onError={() => setFailed(true)} />)}
  </div>;
}

function ConcertScenery() {
  return <div className={styles.scenery} data-room-viewport="encore" aria-hidden="true">
    <div className={styles.backdrop} data-room-backdrop="encore" data-room-visible="false">
      <div className={styles.canvas} data-concert-canvas>
        <div className={styles.sky} data-concert-layer="sky" data-room-layer="sky">
          <img {...imageProps} src={`${art}sky.webp`} />
        </div>
        <div className={styles.farClouds} data-concert-layer="far-clouds" data-room-layer="far-clouds">
          <img {...imageProps} src="/image/hexy/world-v35/clouds.webp" />
        </div>
        <div className={styles.nearClouds} data-concert-layer="near-clouds" data-room-layer="near-clouds">
          <img {...imageProps} src="/image/hexy/world-v35/clouds.webp" />
        </div>
        {/* All physical stage contacts share this camera and art coordinate
            system. Hexy is an independent, full-resolution transparent asset. */}
        <div className={styles.stageCoordinates} data-ground-plane data-ground-composition data-room-layer="room">
          <img {...imageProps} className={styles.hall} src={`${art}hall.webp`} data-room-plate data-concert-layer="architecture" />
          <div className={styles.beams} data-concert-layer="lights">
            {[0, 1, 2, 3].map(i => <i key={i} style={{ '--i': i }} />)}
          </div>
          <ConcertLanterns />
          <ConcertPerformer />
        </div>
        <div className={styles.confetti} data-concert-layer="confetti">
          {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ '--i': i, '--x': `${(i * 41 + 11) % 97}%` }} />)}
        </div>
      </div>
    </div>
  </div>;
}

export default function HexyConcert({ en }) {
  const { openExpanded } = useHexyAudio();
  const journey = useRef(null);
  useEffect(() => {
    // Prepare the entire composition on approach, including the performer who
    // is still below the fold. Native lazy loading alone waits too long here.
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      journey.current?.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
      observer.disconnect();
    }, { rootMargin: '1200px' });
    if (journey.current) observer.observe(journey.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={journey} className={styles.concert} data-room-scene="encore" data-hexy-scene="encore" data-concert-journey>
    <ConcertScenery />
    <div className={styles.balconyJoin} data-passage-overlap="concert-balcony" aria-hidden="true">
      <img {...imageProps} src="/image/hexy/world-v48/balcony-join.webp" />
    </div>
    <section className={styles.arrival} aria-label={en ? 'The way to the stage' : 'El camino al escenario'} data-concert-transition />
    <section className={styles.show} aria-labelledby="hexy-farewell-title" data-concert-show>
      <div className={styles.ticket} data-concert-ticket>
        <img {...imageProps} className={styles.consoleArt} src="/image/hexy/world-v48/stage-console.webp" aria-hidden="true" />
        <div className={styles.consoleCopy}>
        <h2 id="hexy-farewell-title">{en ? 'See you in the' : 'Nos vemos en el'}<br /><em>{en ? 'next chorus.' : 'próximo coro.'}</em></h2>
        <div className={styles.actions}>
          <SceneButton size="sm" onClick={openExpanded} showArrow={false}>{en ? 'One more song' : 'Una canción más'} ♪</SceneButton>
          <SceneButton size="sm" variant="violet" href="/wonderpop-plaza">Wonderpop</SceneButton>
        </div>
        </div>
      </div>
      <footer className={styles.footer}><a href="/">MAGIC DRINK <SceneStar /></a><a href="#hexy-stage">{en ? 'From the beginning' : 'Otra vez desde el principio'} ↑</a></footer>
    </section>
  </div>;
}
