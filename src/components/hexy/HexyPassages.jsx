import { SceneStar } from '../global/SceneControls';
import styles from './HexyWorld.module.css';

const roomArt = '/image/hexy/world-v36/';
const rooms = [
  ['backstage', `${roomArt}backstage.webp`],
  ['studio', `${roomArt}studio.webp`],
  ['records', `${roomArt}records.webp`],
  ['encore', '/image/journey/wonderpop-film/hexy-concert-wide-v28.webp'],
];

// A single sticky stage spans all four rooms. The scroll controller blends
// their backdrops through the passages, while content remains in document flow.
export function PassageScenery() {
  return <div className={styles.passageScenery} aria-hidden="true">
    <div className={styles.roomViewport} data-room-viewport>
      {rooms.map(([name, src], i) => <div key={name} className={styles.roomBackdrop}
        data-room-backdrop={name} style={{ '--room-opacity': i === 0 ? 1 : 0 }}>
        <div className={styles.roomCamera}>
          <img src={src} alt="" width="1672" height="941" loading="lazy" draggable="false" />
        </div>
      </div>)}
      <div className={styles.roomAtmosphere} />
      <div className={styles.roomMotes}>{Array.from({ length: 12 }, (_, i) =>
        <i key={i} style={{ '--i': i, left: `${(i * 29 + 5) % 97}%`, top: `${(i * 17 + 9) % 91}%` }} />)}</div>
    </div>
  </div>;
}

// These objects live across the join, outside either section's crop. They
// remain visible over both rooms instead of fading out at a section boundary.
function PassageOrnaments({ room }) {
  if (room === 'backstage') return null; // The hero's real foliage crosses here.
  return <div className={styles.passageOrnaments} data-passage-overlap={room} aria-hidden="true">
    <svg className={styles.melodyRibbon} viewBox="0 0 280 500" fill="none">
      <path d="M-30 12C310 50 225 180 106 210S-55 360 239 485" />
      <path d="M-30 22C310 60 225 190 106 220S-55 370 239 495" />
      <path d="M-30 32C310 70 225 200 106 230S-55 380 239 505" />
    </svg>
    {room === 'records' ? <div className={styles.passageRecord}>
      <span className={styles.passageSleeve}><SceneStar /></span>
      <span className={styles.passageVinyl}><i><SceneStar /></i></span>
    </div> : <div className={styles.passageNotes}><span>♪</span><span>♫</span><SceneStar /></div>}
    <div className={styles.passagePendants}>
      {[0, 1, 2].map(i => <span key={i} style={{ '--i': i }}><SceneStar /></span>)}
    </div>
  </div>;
}

export function RoomPassage({ to, en }) {
  const copy = {
    backstage: ['Detrás del telón', 'Behind the curtain', 'Lejos del foco. Un poquito más cerca de Hexy.', 'Away from the spotlight. A little closer to Hexy.'],
    studio: ['La puerta de al lado', 'Just next door', '¿Oyes esas risitas? Los Bunnies ya están ensayando.', 'Hear those giggles? The Bunnies are already rehearsing.'],
    records: ['Del estudio a tus oídos', 'From the studio to your ears', 'La última nota se queda sonando. Ahora elige la tuya.', 'The last note lingers. Now pick one of your own.'],
    encore: ['Nos vemos en el próximo coro', 'See you in the next chorus', 'Llévate una canción. La magia sigue afuera.', 'Take a song with you. There is more magic outside.'],
  }[to];
  return <div className={styles.roomPassage} data-room-door={to} data-hexy-scene={`passage-${to}`}>
    <PassageOrnaments room={to} />
    <div className={styles.passageWords}>
      <span>{copy[en ? 1 : 0]}</span>
      <p>{copy[en ? 3 : 2]}</p>
      <SceneStar />
    </div>
  </div>;
}
