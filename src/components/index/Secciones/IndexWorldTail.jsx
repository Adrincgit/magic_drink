import { memo } from 'react';
import { SceneButton } from '../../global/SceneControls';
import StoryPanel from './StoryPanel';
import GardenWorld from './GardenWorld';
import DJSequence from './DJSequence';
import FestivalCrowdMotion from './FestivalCrowdMotion';
import WonderPopStory from './WonderPopStory';
import WonderpopFilm from './WonderpopFilm';
import styles from '../css/indexWorldTail.module.css';

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
        <div className={`${styles.copy} ${styles.festivalCopy}`} data-world-copy="festival" data-story-wrapper>
          <StoryPanel en={en} number="04" label={en ? 'THE STREETS JOIN THE CHORUS' : 'LAS CALLES SE SUMAN AL CORO'} title={<>Magic Drink<br /><em>Day.</em></>}
            compactText={en ? 'Music, balloons and parades fill the streets. Hexy is on stage. Coming?' : 'La calle se llena de música, globos y desfiles. Hexy está en el escenario. ¿Vienes?'}
            actions={<SceneButton href="/magicdrinkday" variant="ticket">{en ? 'Join the celebration' : 'Vive Magic Drink Day'}</SceneButton>}>
            {en ? 'A little further on, the streets fill with music. Parades, giant balloons, and Hexy on stage. The whole world joins in.' : 'Un poco más adelante, las calles se llenan de música. Desfiles, globos gigantes y Hexy sobre el escenario. Todo el mundo se suma.'}
          </StoryPanel>
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
        <div className={`${styles.copy} ${styles.plazaCopy}`} data-world-copy="plaza" data-story-wrapper>
          <StoryPanel en={en} number="05" label="WONDERPOP PLAZA" title={en ? <>Follow the lights.<br /><em>Come on in.</em></> : <>Sigue las luces.<br /><em>Ya estás cerca.</em></>} actions={<SceneButton href="#directorio-wonderpop" data-go-world=".92">{en ? 'Let’s go inside' : 'Vamos a entrar'}</SceneButton>}>
            {en ? 'The music leads us to Wonderpop Plaza. Follow the lights: a whole world is waiting behind those doors.' : 'La música nos lleva hasta Wonderpop Plaza. Sigue las luces: hay todo un mundo esperando detrás de esas puertas.'}
          </StoryPanel>
        </div>
      </section>

      <WonderpopFilm en={en} />

      <WonderPopStory en={en} filmMode />

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
