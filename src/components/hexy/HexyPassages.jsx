import { SceneStar } from '../global/SceneControls';
import HexyRoomArtwork from './HexyRoomArtwork';
import styles from './HexyWorld.module.css';

// Each opaque stage belongs to one room. Native sticky positioning lets the
// scenery leave with that room; no subsequent room is painted behind its copy.
function RoomScenery({ room }) {
  return <div className={styles.passageScenery} aria-hidden="true">
    <div className={styles.roomViewport} data-room-viewport={room}>
      <div className={styles.roomBackdrop} data-room-backdrop={room} data-room-visible="false">
        <HexyRoomArtwork room={room} />
      </div>
      <div className={styles.roomAtmosphere} />
      <div className={styles.roomMotes}>{Array.from({ length: 12 }, (_, i) =>
        <i key={i} style={{ '--i': i, left: `${(i * 29 + 5) % 97}%`, top: `${(i * 17 + 9) % 91}%` }} />)}</div>
    </div>
  </div>;
}

export function RoomScene({ room, en, children }) {
  return <div className={styles.roomScene} data-room-scene={room} data-hexy-scene={`room-${room}`}>
    <RoomScenery room={room} />
    {room === 'studio' && <div className={styles.roomFoliageJoin} data-passage-overlap={room} aria-hidden="true">
      <div className={styles.roomThreshold} />
      {['left', 'right'].map(side => <span data-side={side} key={side}>
        <img src="/image/hexy/world-v37/trailing-plants.webp" alt="" width="1672" height="941" loading="lazy" draggable="false" />
      </span>)}
    </div>}
    {room !== 'encore' && <RoomPassage to={room} en={en} />}
    {children}
  </div>;
}

export function RoomPassage({ to, en }) {
  const copy = {
    backstage: ['Detrás del telón', 'Behind the curtain', 'Lejos del foco. Un poquito más cerca de Hexy.', 'Away from the spotlight. A little closer to Hexy.'],
    studio: ['La puerta de al lado', 'Just next door', '¿Oyes esas risitas? Los Bunnies ya están ensayando.', 'Hear those giggles? The Bunnies are already rehearsing.'],
    encore: ['Nos vemos en el próximo coro', 'See you in the next chorus', 'Llévate una canción. La magia sigue afuera.', 'Take a song with you. There is more magic outside.'],
  }[to];
  return <div className={styles.roomPassage} data-room-door={to} data-hexy-scene={`passage-${to}`}>
    <div className={styles.passageWords}>
      <span>{copy[en ? 1 : 0]}</span>
      <p>{copy[en ? 3 : 2]}</p>
      <SceneStar />
    </div>
  </div>;
}
