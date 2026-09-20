import { SceneButton, SceneLabel, SceneNote } from '../../global/SceneControls';
import GardenWorld from './GardenWorld';
import DJSequence from './DJSequence';
import FestivalCrowdMotion from './FestivalCrowdMotion';
import styles from '../css/indexWorldTail.module.css';

import depth from '../css/festivalDepth.module.css'; // Audience planes and sky animation.

const art = '/image/journey/';


export default function IndexWorldTail({ en = false }) {
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

      <div className={styles.interior} data-world-interior aria-hidden="true">
        <div className={styles.atriumWorld} data-atrium-world>
          <img
            className={styles.atrium}
            data-atrium
            data-look="far"
            src={`${art}atrium-distance.webp`}
            alt=""
            width="1536"
            height="1024"
            loading="lazy"
          />
          <img
            className={styles.atrium}
            data-atrium-garden
            data-look="street"
            src={`${art}atrium-garden.webp`}
            alt=""
            width="1536"
            height="1024"
            loading="lazy"
          />
          <img
            className={styles.atrium}
            data-atrium-bar
            data-look="near"
            src={`${art}atrium-bar.webp`}
            alt=""
            width="1536"
            height="1024"
            loading="lazy"
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
        className={`${styles.copy} ${styles.interiorCopy}`}
        data-world-copy="interior"
        aria-label={en ? 'Inside WonderPop Plaza' : 'Dentro de WonderPop Plaza'}
      >
        <SceneLabel>WONDERPOP PLAZA</SceneLabel>
        <h2>
          {en ? (
            <>
              Make yourself
              <br />
              <em>at home.</em>
            </>
          ) : (
            <>
              Quédate.
              <br />
              <em>Estás en casa.</em>
            </>
          )}
        </h2>
        <SceneNote>{en
            ? 'Official shops, games, music and Magic Bunnies. Welcome to Magic Drink’s shopping plaza.'
            : 'Tiendas oficiales, juegos, música y Magic Bunnies. Bienvenido al centro comercial de Magic Drink.'}</SceneNote>
        <SceneButton href="/wonderpop-plaza">{en ? 'Discover WonderPop' : 'Descubre WonderPop'}</SceneButton>
      </section>

      <section
        className={styles.closing}
        id="la-original"
        data-world-scene="closing"
        aria-label="Magic Drink"
      >
        <div className={styles.closingShade} aria-hidden="true" />
        <div className={styles.closingDisplay} data-closing-display data-look="near">
          <div className={styles.productHalo} aria-hidden="true" />
          <div className={styles.productOrbit} aria-hidden="true">
            {Array.from({ length: 22 }, (_, i) => (
              <i
                key={i}
                style={{
                  '--i': i,
                  '--size': `${3 + (i % 5) * 2}px`,
                  left: `${8 + ((i * 37) % 86)}%`,
                  top: `${8 + ((i * 29) % 84)}%`,
                }}
              />
            ))}
          </div>
          <img
            className={styles.closingCan}
            src={`${art}original-dynamic-v2.webp`}
            alt="Magic Drink"
            width="1024"
            height="1536"
            loading="lazy"
          />
        </div>
        <div className={`${styles.copy} ${styles.closingCopy}`} data-world-copy="closing">
          <SceneLabel>06 / MAGIC DRINK</SceneLabel>
          <h2>
            {en ? (
              <>
                Magic
                <br />
                <em>Drink.</em>
              </>
            ) : (
              <>
                Magic
                <br />
                <em>Drink.</em>
              </>
            )}
          </h2>
          <SceneNote>{en
              ? 'The world’s favorite drink. Get to know what’s behind the purple can.'
              : 'La bebida favorita del mundo. Descubre qué hay detrás de la lata morada.'}</SceneNote>
          <SceneButton href="/bebidas">{en ? 'Discover Magic Drink' : 'Conoce Magic Drink'}</SceneButton>
          <span className={styles.signature}>Spark more everyday.</span>
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
      <div className={styles.doorLight} data-door-light aria-hidden="true" />
      <img className={styles.canopyVeil} data-canopy-veil
        src={`${art}garden-canopy-veil-v3.webp`} width="1536" height="1024" alt="" loading="lazy" />
      <div className={styles.worldRail} data-world-rail aria-hidden="true">
        <span data-world-label>MAGIC DRINK DAY</span>
        <i />
        <span>SPARK MORE EVERYDAY</span>
      </div>
    </div>
  );
}
