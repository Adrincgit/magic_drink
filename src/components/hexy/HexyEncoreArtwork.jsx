import { useRef, useState } from 'react';
import styles from './HexyEncoreArtwork.module.css';

const art = '/image/hexy/world-v44/';
const imageProps = { alt: '', width: 1672, height: 941, loading: 'lazy', draggable: false };
const farewellArt = '/image/hexy/world-v45/';
const farewellFrames = ['ground-farewell', 'wave-out', 'wave-in'];

function FarewellGround() {
  const loaded = useRef(new Set());
  const [ready, setReady] = useState(false);
  const frameLoaded = index => {
    loaded.current.add(index);
    if (loaded.current.size === farewellFrames.length) setReady(true);
  };
  return <>
    <img {...imageProps} className={styles.ground} src={`${farewellArt}ground-farewell.webp`}
      data-room-plate data-ground-props data-encore-plane="ground" data-wave-ready={ready} />
    {/* Only the waving hand/forearm changes cels. Feet, body and floor use
        the single base plate. Do not cut its hand out until every cel loads. */}
    <div className={styles.wave} data-encore-wave data-wave-ready={ready}>
      {farewellFrames.map((frame, index) => <img {...imageProps} key={frame}
        className={styles.waveCel} data-wave-cel={index} style={{ '--cel': index }}
        src={`${farewellArt}${frame}.webp`} onLoad={() => frameLoaded(index)}
        onError={() => setReady(false)} />)}
    </div>
  </>;
}

// The window openings are real alpha holes in the architecture. The exterior
// travels behind them; the complete floor plate keeps every contact together.
export default function HexyEncoreArtwork() {
  return <div className={styles.camera} data-room-layer="room" data-ground-plane>
    <div className={styles.composition} data-ground-composition>
      <div className={styles.sky} data-encore-plane="sky" data-room-layer="sky" />
      <div className={styles.clouds} data-encore-plane="clouds" data-room-layer="clouds">
        <img {...imageProps} src="/image/hexy/world-v35/clouds.webp" data-encore-clouds />
      </div>
      <div className={styles.farCity} data-encore-plane="distant-city" data-room-layer="distant-city">
        <img {...imageProps} src={`${art}distant-city.webp`} />
      </div>
      <div className={styles.nearCity} data-encore-plane="near-city" data-room-layer="near-city">
        <img {...imageProps} src="/image/hexy/world-v35/palaces.webp" />
      </div>
      <div className={styles.walls} data-encore-plane="walls" data-room-layer="walls">
        <img {...imageProps} src={`${art}architecture.webp`} data-encore-windows />
      </div>
      <FarewellGround />
      <div className={styles.lights} data-encore-plane="hanging-lights" data-room-layer="hanging-lights">
        <img {...imageProps} src={`${art}hanging-lights.webp`} />
      </div>
    </div>
  </div>;
}

// Only this foreground fabric crosses the scene boundary. The next room,
// including Hexy, remains clipped to its own section throughout the scroll.
export function EncoreCurtainBridge() {
  return <div className={styles.curtainBridge} data-passage-overlap="encore-curtains" aria-hidden="true">
    <div className={styles.curtainViewport}>
      <div className={styles.curtains} data-encore-plane="curtains" data-room-layer="curtains">
        <img {...imageProps} src={`${farewellArt}fuchsia-curtains.webp`} />
      </div>
    </div>
  </div>;
}
