import styles from '../css/indexJourney.module.css';

// Fixed seed keeps SSR/hydration identical; no repeating CSS tiles or grid.
let seed = 85167;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const stars = Array.from({ length: 92 }, () => ({
  left: `${random() * 100}%`, top: `${random() * 47}%`,
  '--size': `${.6 + random() * 1.6}px`, '--glow': .2 + random() * .5,
  '--duration': `${3.5 + random() * 7}s`, '--delay': `${-random() * 12}s`,
}));
export default function JourneyStars() {
  return <div className={styles.stars} data-journey-stars>{stars.map((style, i) => <i key={i} style={style} />)}</div>;
}
