import { useId } from 'react';
import styles from './HexyConcert.module.css';

// Registered windows into the original transparent artwork, in its 1122×1402
// coordinates. Each chain pivots at its own painted attachment; the roof never
// rotates with the lamps. Multiple stars on one chain stay together.
const pendants = [
  [138, 0, [[127, 0, 24, 135], [91, 93, 91, 151]]],
  [218, 96, [[207, 96, 24, 149], [178, 203, 80, 157]]],
  [283, 0, [[273, 0, 21, 409], [256, 383, 56, 76]]],
  [356, 0, [[345, 0, 23, 519], [290, 219, 132, 150], [324, 477, 57, 77]]],
  [427, 0, [[417, 0, 22, 421], [390, 105, 77, 100], [394, 379, 68, 82]]],
  [478, 0, [[467, 0, 24, 510], [439, 466, 82, 91]]],
  [559, 0, [[548, 0, 22, 506], [481, 126, 153, 166]]],
  [638, 0, [[628, 0, 22, 511], [612, 281, 54, 68], [590, 465, 98, 95]]],
  [689, 0, [[679, 0, 23, 437], [657, 106, 67, 77], [662, 401, 58, 76]]],
  [759, 0, [[748, 0, 24, 510], [695, 221, 129, 147], [732, 472, 62, 76]]],
  [837, 0, [[826, 0, 24, 414], [804, 377, 65, 83]]],
  [903, 96, [[892, 96, 24, 149], [868, 193, 69, 128]]],
  [980, 0, [[969, 0, 24, 209], [939, 146, 84, 158]]],
  [233, 954, [[222, 954, 22, 137], [182, 1034, 101, 111]]],
  [314, 959, [[303, 959, 22, 308], [282, 1086, 64, 78], [289, 1227, 51, 64]]],
  [392, 969, [[381, 969, 23, 231], [351, 1154, 84, 86]]],
  [553, 924, [[542, 924, 23, 161], [478, 1013, 151, 143]]],
  [729, 966, [[718, 966, 23, 234], [691, 1158, 80, 82]]],
  [810, 956, [[799, 956, 22, 312], [777, 1088, 67, 79], [784, 1224, 53, 67]]],
  [892, 951, [[881, 951, 23, 137], [841, 1037, 105, 114]]],
];

export default function ConcertLanterns() {
  const id = useId().replace(/:/g, '');
  return <svg className={styles.starRig} viewBox="0 0 1122 1402" preserveAspectRatio="none" data-concert-layer="hanging-stars" data-room-layer="hanging-stars" aria-hidden="true">
    <defs>{pendants.map(([, , windows], i) => <clipPath key={i} id={`${id}-lamp-${i}`}>
      {windows.map(([x, y, width, height], j) => <rect key={j} x={x} y={y} width={width} height={height} />)}
    </clipPath>)}</defs>
    {pendants.map(([x, y], i) => <g key={i} className={styles.pendant} data-concert-pendant={i} data-anchor-x={x} data-anchor-y={y}
      style={{ transformOrigin: `${x}px ${y}px`, '--sway': `${.65 + i % 4 * .16}deg`, '--duration': `${4.8 + i % 5 * .43}s`, '--delay': `${i * -.37}s` }}>
      <g clipPath={`url(#${id}-lamp-${i})`}><image href="/image/hexy/world-v46/hanging-stars.webp" width="1122" height="1402" /></g>
    </g>)}
  </svg>;
}
