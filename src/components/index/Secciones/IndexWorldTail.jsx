import { memo } from 'react';
import { SceneButton, SceneLabel, SceneNote } from '../../global/SceneControls';
import GardenWorld from './GardenWorld';
import DJSequence from './DJSequence';
import FestivalCrowdMotion from './FestivalCrowdMotion';
import AtriumDirectory from './AtriumDirectory';
import styles from '../css/indexWorldTail.module.css';
import atriumStyles from '../css/atrium.module.css';

import depth from '../css/festivalDepth.module.css'; // Audience planes and sky animation.

const art = '/image/journey/';


function IndexWorldTail({ en = false }) {
  return (
    <div className={styles.worldTail} data-continuation>
      <section
        className={styles.festival}
        id="festival"
        data-world-scene="festival"
        aria-label="Magic Drink Day"
      >
        <img
          className={styles.courtyard}
          data-courtyard
          data-look="far"
          src={`${art}festival-street-v2.webp`}
          alt=""
          width="1774"
          height="887"
          loading="lazy"
        />
        <div className={depth.airship} data-airship data-look="city" aria-hidden="true">
          <img src={`${art}hexy-airship-v3.webp`} alt="" width="1536" height="1024" loading="lazy" />
        </div>
        <div className={styles.festivalRig} data-festival-rig data-look="street">
          <img
            className={styles.pavilion}
            data-pavilion
            src={`${art}festival-stage-front-v11.webp`}
            width="1536"
            height="1024"
            alt=""
            loading="lazy"
          />
          <div className={styles.stageLights} data-stage-lights aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} style={{ '--i': i }} />
            ))}
          </div>
          <div className={styles.djContactShadow} aria-hidden="true" />
          {['left', 'right'].map(side => (
            <div key={side} className={styles.speaker} data-speaker={side} aria-hidden="true">
              <img src={`${art}festival-speaker-v14.webp`} alt="" width="512" height="768" loading="lazy" />
              {[0, 1].map(cone => <span className={styles.speakerCone} key={cone} style={{ '--cone-y': cone ? '67%' : '34.3%' }}>
                <img src={`${art}festival-speaker-v14.webp`} alt="" width="512" height="768" loading="lazy" />
              </span>)}
              <i className={styles.speakerHalo} data-speaker-halo />
              {[0, 1, 2].map(ring => <i key={ring} className={styles.soundRing} style={{ '--ring': ring }} />)}
              <div className={styles.musicNotes} data-music-notes>
                {[0, 1, 2, 3, 4].map(note => <span key={note} style={{ '--note': note, '--drift': `${[-32, 23, -9, 46, -44][note]}px` }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={note % 2 ? 'M9 17V5l11-2v12M9 8l11-2M9 17c0 2-2 4-4 4s-3-1-3-2 2-3 4-3 3 0 3 1Zm11-2c0 2-2 4-4 4s-3-1-3-2 2-3 4-3 3 0 3 1Z' : 'M10 17V3c2 3 7 2 7 6 0 2-1 3-2 4M10 17c0 2-2 4-4 4s-3-1-3-2 2-3 4-3 3 0 3 1Z'} /></svg>
                </span>)}
              </div>
            </div>
          ))}
          <div className={styles.musicBloom} data-music-bloom aria-hidden="true" />
          <div className={styles.dj} data-dj>
            <DJSequence en={en} />
          </div>
          <div className={styles.stageGlow} aria-hidden="true" />
        </div>
        {[1, 2, 3, 4].map(row => (
          <div key={row} className={depth.audienceRow} data-audience-row={row}
            data-crowd={row === 4 ? '' : undefined} data-look={row < 3 ? 'street' : 'near'} aria-hidden="true">
            <img src={`${art}audience-row-${row}-v3.webp`} alt="" width="2172" height="724" loading="lazy" />
          </div>
        ))}
        <FestivalCrowdMotion />
        <div className={styles.festivalShade} aria-hidden="true" />
        <div className={`${styles.copy} ${styles.festivalCopy}`} data-world-copy="festival">
          <SceneLabel>04 / MAGIC DRINK DAY</SceneLabel>
          <h2>
            {en ? (
              <>
                Magic Drink
                <br />
                <em>Day.</em>
              </>
            ) : (
              <>
                Magic Drink
                <br />
                <em>Day.</em>
              </>
            )}
          </h2>
          <SceneNote>{en
              ? 'Parades, giant balloons and Hexy on stage. The world celebrates its favorite drink.'
              : 'Desfiles, globos gigantes y Hexy sobre el escenario. El mundo celebra su bebida favorita.'}</SceneNote>
          <SceneButton href="/magicdrinkday" variant="ticket">{en ? 'Join the celebration' : 'Vive Magic Drink Day'}</SceneButton>
        </div>
        <div className={styles.confetti} data-look="near" aria-hidden="true">
          {Array.from({ length: 66 }, (_, i) => (
            <i
              key={i}
              style={{
                '--i': i,
                '--size': `${3 + (i % 4)}px`,
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 80}%`,
              }}
            />
          ))}
        </div>
      </section>

      <section
        className={styles.plaza}
        id="wonderpop"
        data-world-scene="plaza"
        aria-label="WonderPop Plaza"
      >
        <GardenWorld />
        <div className={styles.plazaShade} aria-hidden="true" />
        <div className={`${styles.copy} ${styles.plazaCopy}`} data-world-copy="plaza">
          <SceneLabel>05 / WONDERPOP PLAZA</SceneLabel>
          <h2>
            {en ? (
              <>
                Follow the lights.
                <br />
                <em>Come on in.</em>
              </>
            ) : (
              <>
                Sigue las luces.
                <br />
                <em>Ya estás cerca.</em>
              </>
            )}
          </h2>
          <SceneNote>{en
              ? 'Just a few steps from Magic Drink’s official shopping plaza.'
              : 'Estás a unos pasos del centro comercial oficial de Magic Drink.'}</SceneNote>
          <span className={styles.keepGoing}>
            {en ? 'KEEP SCROLLING' : 'SIGUE EXPLORANDO'} <span aria-hidden="true">↓</span>
          </span>
        </div>
      </section>

      <div className={`${styles.interior} ${atriumStyles.room}`} data-world-interior aria-hidden="true">
        <div className={styles.atriumWorld} data-atrium-world>
          <img
            className={styles.atrium}
            data-atrium
            src={`${art}wonderpop-atrium-v15.webp`}
            onError={event => { const image = event.currentTarget; if (!image.dataset.fallback) { image.dataset.fallback = 'true'; image.src = `${art}wonderpop-atrium.webp`; } }}
            alt=""
            width="1536"
            height="1024"
            loading="eager"
            fetchpriority="low"
          />
        </div>
        <div className={styles.pendants} data-pendants data-look="near">
          <img
            src={`${art}atrium-pendants-v2.webp`}
            width="1536"
            height="1024"
            alt=""
            loading="lazy"
          />
        </div>
        <div className={styles.interiorRays}>
          <i />
          <i />
          <i />
        </div>
        <div className={styles.interiorMotes}>
          {Array.from({ length: 24 }, (_, i) => (
            <i
              key={i}
              style={{ '--i': i, left: `${(i * 37) % 100}%`, top: `${(i * 29) % 100}%` }}
            />
          ))}
        </div>
        <div className={styles.interiorShade} />
        <img className={atriumStyles.entrance} data-atrium-entrance src={`${art}wonderpop-entry-v15.webp`} alt="" width="1536" height="1024" loading="eager" fetchpriority="low" />
        <img
          className={styles.insideLeaves}
          data-inside-leaves
          data-look="near"
          src={`${art}foliage.webp`}
          alt=""
          width="1254"
          height="1254"
          loading="lazy"
        />
      </div>
      <section
        className={`${styles.copy} ${styles.interiorCopy} ${atriumStyles.intro}`}
        data-world-copy="interior"
        aria-label={en ? 'Inside WonderPop Plaza' : 'Dentro de WonderPop Plaza'}
      >
        <SceneLabel>06 / WONDERPOP PLAZA</SceneLabel>
        <h2>
          {en ? (
            <>
              Welcome to
              <br />
              <em>WonderPop.</em>
            </>
          ) : (
            <>
              Bienvenido a
              <br />
              <em>WonderPop.</em>
            </>
          )}
        </h2>
        <SceneNote>{en
            ? 'Official shops, games, music and Magic Bunnies. Welcome to Magic Drink’s shopping plaza.'
            : 'Tiendas oficiales, juegos, música y Magic Bunnies. Bienvenido al centro comercial de Magic Drink.'}</SceneNote>
        <span className={styles.keepGoing}>{en ? 'YOUR VISIT STARTS HERE' : 'TU VISITA EMPIEZA AQUÍ'} <span aria-hidden="true">↓</span></span>
      </section>

      <section
        className={styles.closing}
        id="directorio-wonderpop"
        data-world-scene="closing"
        aria-label={en ? 'WonderPop Plaza directory' : 'Directorio de WonderPop Plaza'}
      >
        <div className={atriumStyles.directoryWrap} data-world-copy="closing">
          <AtriumDirectory en={en} />
        </div>
        <footer className={styles.footer} data-world-footer>
          <a href="/" aria-label="Magic Drink">
            <img src="/logo.webp" width="160" height="70" alt="Magic Drink" />
          </a>
          <nav aria-label={en ? 'Footer' : 'Pie de página'}>
            <a href="/hexy">Hexy</a>
            <a href="/wonderpop-plaza">WonderPop Plaza</a>
            <a href="/nosotros">{en ? 'About' : 'Nosotros'}</a>
            <a href="/contacto">{en ? 'Contact' : 'Contacto'}</a>
          </nav>
          <button
            data-go-world="0"
            type="button"
            aria-label={en ? 'Return to the start' : 'Volver al inicio'}
          >
            ↑
          </button>
        </footer>
      </section>

      <div className={styles.passingLeaves} data-passing-leaves aria-hidden="true">
        <img src={`${art}foliage.webp`} alt="" width="1254" height="1254" />
        <img src={`${art}foliage.webp`} alt="" width="1254" height="1254" />
      </div>
      <img className={styles.canopyVeil} data-canopy-veil
        src={`${art}garden-canopy-veil-v3.webp`} width="1536" height="1024" alt="" loading="lazy" />
    </div>
  );
}

// Playback time updates the controls, not the entire illustrated world.
export default memo(IndexWorldTail);
