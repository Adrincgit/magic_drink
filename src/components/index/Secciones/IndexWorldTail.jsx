import styles from '../css/indexWorldTail.module.css';

const art = '/image/journey/';
const Arrow = () => <span aria-hidden="true">↗</span>;

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
        <div className={styles.festivalRig} data-festival-rig data-look="street">
          <img
            className={styles.pavilion}
            data-pavilion
            src={`${art}festival-stage-v2.webp`}
            width="1774"
            height="887"
            alt=""
            loading="lazy"
          />
          <div className={styles.stageLights} data-stage-lights aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <i key={i} style={{ '--i': i }} />
            ))}
          </div>
          <div className={styles.dj} data-dj>
            <img
              src={`${art}hexy-dj-v2.webp`}
              alt={en ? 'Hexy playing music at the plaza' : 'Hexy mezclando música en la plaza'}
              width="1122"
              height="1402"
              loading="lazy"
            />
          </div>
          <div className={styles.stageGlow} aria-hidden="true" />
        </div>
        <div
          className={`${styles.middleCrowd} ${styles.farCrowd}`}
          data-crowd-far
          data-look="city"
          aria-hidden="true"
        >
          <img src={`${art}crowd-far-v2.webp`} alt="" width="2172" height="724" loading="lazy" />
        </div>
        <div className={styles.middleCrowd} data-crowd-middle data-look="street" aria-hidden="true">
          <img src={`${art}crowd-middle-v2.webp`} alt="" width="2172" height="724" loading="lazy" />
        </div>
        <div className={styles.crowd} data-crowd data-look="near" aria-hidden="true">
          <img src={`${art}festival-crowd.webp`} alt="" width="2172" height="724" loading="lazy" />
        </div>
        <div className={styles.festivalShade} aria-hidden="true" />
        <div className={`${styles.copy} ${styles.festivalCopy}`} data-world-copy="festival">
          <p className={styles.eyebrow}>04 / MAGIC DRINK DAY</p>
          <h2>
            {en ? (
              <>
                The city.
                <br />
                The music.
                <br />
                <em>All of us.</em>
              </>
            ) : (
              <>
                La ciudad.
                <br />
                La música.
                <br />
                <em>Todos juntos.</em>
              </>
            )}
          </h2>
          <p>
            {en
              ? 'Some moments deserve their own soundtrack.'
              : 'Hay momentos que merecen su propia canción.'}
          </p>
          <a className={styles.button} href="/magicdrinkday">
            {en ? 'Join the celebration' : 'Vive Magic Drink Day'}
            <Arrow />
          </a>
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
        <div
          className={styles.approachGarden}
          data-approach-garden="far"
          data-look="city"
          aria-hidden="true"
        >
          <img
            src={`${art}boulevard-garden-v2.webp`}
            width="1536"
            height="1024"
            alt=""
            loading="lazy"
          />
        </div>
        <div
          className={`${styles.approachGarden} ${styles.gardenNear}`}
          data-approach-garden="near"
          data-look="near"
          aria-hidden="true"
        >
          <img
            src={`${art}boulevard-garden-v2.webp`}
            width="1536"
            height="1024"
            alt=""
            loading="lazy"
          />
        </div>
        <div className={styles.approachArch} data-approach-arch data-look="near" aria-hidden="true">
          <img
            src={`${art}plaza-threshold.webp`}
            width="1536"
            height="1024"
            alt=""
            loading="lazy"
          />
        </div>
        <div className={styles.pathLights} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ '--i': i, top: `${45 + (i % 4) * 10}%` }} />
          ))}
        </div>
        <div className={styles.plazaShade} aria-hidden="true" />
        <div className={`${styles.copy} ${styles.plazaCopy}`} data-world-copy="plaza">
          <p className={styles.eyebrow}>05 / WONDERPOP PLAZA</p>
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
          <p>
            {en
              ? 'You have seen its lights. Come a little closer.'
              : 'Ya viste sus luces. Acércate un poco más.'}
          </p>
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
        <p className={styles.eyebrow}>WONDERPOP PLAZA</p>
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
        <p>
          {en
            ? 'Your music, your Original. And a thousand reasons to stay a little longer.'
            : 'Tu música, tu Original. Y mil razones para quedarte un rato más.'}
        </p>
        <a className={styles.button} href="/wonderpop-plaza">
          {en ? 'Discover WonderPop' : 'Descubre WonderPop'}
          <Arrow />
        </a>
      </section>

      <section
        className={styles.closing}
        id="la-original"
        data-world-scene="closing"
        aria-label="Magic Drink Original"
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
            alt="Magic Drink Original"
            width="1024"
            height="1536"
            loading="lazy"
          />
        </div>
        <div className={`${styles.copy} ${styles.closingCopy}`} data-world-copy="closing">
          <p className={styles.eyebrow}>06 / MAGIC DRINK ORIGINAL</p>
          <h2>
            {en ? (
              <>
                Your world.
                <br />
                <em>Your Original.</em>
              </>
            ) : (
              <>
                Tu mundo.
                <br />
                <em>Tu Original.</em>
              </>
            )}
          </h2>
          <p>
            {en
              ? 'Take a little of this moment with you.'
              : 'Llévate un poco de este momento contigo.'}
          </p>
          <a className={styles.button} href="/bebidas">
            {en ? 'Discover Original' : 'Conoce la Original'}
            <Arrow />
          </a>
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
      <div className={styles.worldRail} data-world-rail aria-hidden="true">
        <span data-world-label>MAGIC DRINK DAY</span>
        <i />
        <span>SPARK MORE EVERYDAY</span>
      </div>
    </div>
  );
}
