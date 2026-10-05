import styles from './HexyRoomArtwork.module.css';

const art = '/image/hexy/world-v42/';
const correctedArt = '/image/hexy/world-v43/';

function SuspendedStars() {
  return <div className={styles.hangingRig} data-hanging-rig aria-hidden="true">
    <div className={styles.lampRail} />
    {[0, 1, 2].map(i => <span key={i} className={styles.pendant} style={{ '--i': i }} data-star-pendant>
      <i className={styles.cord} />
      <svg viewBox="0 0 100 100"><path d="M50 2 61 32 82 18 68 40 98 50 68 60 82 82 60 68 50 98 40 68 18 82 32 60 2 50 32 40 18 18 40 32Z" fill="#fbe3a0" stroke="#b47b41" strokeWidth="1.8" />
        <path d="M50 2v48l11-18ZM98 50H50l18 10ZM50 98V50L40 68ZM2 50h48L32 40Z" fill="#edb650" />
        <path d="m18 18 32 32-10-18Z m64 0-32 32 18-10Z m0 64-32-32 10 18Z m-64 0 32-32-18 10Z" fill="#fff6d3" />
        <path d="M50 14v72M14 50h72" stroke="#fff9dc" strokeWidth="1.5" />
      </svg>
    </span>)}
  </div>;
}

function BunnyBand() {
  return [0, 1, 2, 3].map(i => <div key={i} className={styles.bunnySeat} style={{ '--i': i }} data-bunny-seat>
    <span className={styles.bunnySprite} data-bunny-performer>
      <img src={`${art}bunny-band.webp`} alt="" width="2079" height="756" loading="lazy" draggable="false" />
    </span>
    <span className={styles.bunnyNotes} aria-hidden="true">♪</span>
  </div>);
}

export default function HexyRoomArtwork({ room }) {
  const background = room === 'studio' ? `${correctedArt}bunny-studio.webp` : '/image/hexy/world-v39/backstage-room.webp';
  return <>
    {/* Every floor contact shares one camera AND one cover-sized coordinate
        system. No prop translates independently of its supporting surface. */}
    <div className={styles.ground} data-ground-plane data-room-layer="room">
      <div className={styles.composition} data-ground-composition>
        <img src={background} alt="" width="1672" height="941" loading="lazy" draggable="false" data-room-plate />
        {room === 'backstage' && <img src="/image/hexy/world-v39/backstage-props.webp"
          alt="" width="1672" height="941" loading="lazy" draggable="false" data-ground-props />}
        {room === 'studio' && <BunnyBand />}
      </div>
    </div>
    <SuspendedStars />
    <div className={styles.drapes} data-room-layer="curtains">
      <img src="/image/hexy/world-v34/curtains.webp"
        alt="" width="1672" height="941" loading="lazy" draggable="false" />
    </div>
    <div className={styles.lamplight} data-room-layer="light" />
    {room === 'backstage' && <div className={styles.foreground} data-room-layer="foliage">
      <img src="/image/hexy/world-v35/plants.webp" alt="" width="1672" height="941" loading="lazy" draggable="false" />
    </div>}
  </>;
}
