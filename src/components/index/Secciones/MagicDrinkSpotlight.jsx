import styles from '../css/magicDrinkSpotlight.module.css';

const point = (angle, radius) => {
  const radians = angle * Math.PI / 180;
  return `${(500 + Math.cos(radians) * radius).toFixed(2)},${(500 + Math.sin(radians) * radius).toFixed(2)}`;
};
const rays = Array.from({ length: 26 }, (_, i) => {
  const angle = i * 360 / 26;
  return `500,500 ${point(angle, 760)} ${point(angle + (i % 3 === 0 ? 8 : 5), 760)}`;
});
const streaks = Array.from({ length: 38 }, (_, i) => {
  const angle = i * 360 / 38 + 4;
  return `${point(angle, 200 + i % 5 * 33)} ${point(angle - .6, 760)} ${point(angle + .6, 760)}`;
});
const silhouettes = [
  ['bunny', 13, 23, -18, 0], ['star', 30, 13, 13, 1],
  ['star', 82, 13, -10, 2], ['bunny', 87, 67, 17, 3],
  ['star', 18, 78, 12, 4], ['star', 76, 80, -19, 5],
  ['bunny', 79, 39, 12, 6], ['star', 8, 49, -15, 7],
];
const colors = ['#ffe58e', '#ff8fca', '#80e6ef', '#fff1cf'];

export default function MagicDrinkSpotlight({ en }) {
  return <div className={styles.spotlight} data-film-product>
    <div className={styles.backdrop} aria-hidden="true" data-product-burst>
      <svg className={styles.rays} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        <g className={styles.spin} data-product-rays>
          {rays.map((points, i) => <polygon key={i} points={points} fill={i % 2 ? '#db5cad' : '#a270df'} />)}
        </g>
        <g className={styles.counterSpin}>
          {streaks.map((points, i) => <polygon key={i} points={points} fill={i % 3 ? '#ffd991' : '#d7ffff'} />)}
        </g>
      </svg>
      <div className={styles.halftone} />
      <div className={styles.halo} />
      {silhouettes.map(([kind, x, y, turn, i]) => <span key={i} className={`${styles.silhouette} ${styles[kind]}`}
        style={{ '--x': `${x}%`, '--y': `${y}%`, '--turn': `${turn}deg`, '--delay': `${-i * .9}s` }} />)}
      <div className={styles.confetti}>
        {Array.from({ length: 32 }, (_, i) => <i key={i} className={i % 5 === 0 ? styles.star : i % 3 === 0 ? styles.ribbon : undefined}
          style={{ '--x': `${(i * 37 + 9) % 100}%`, '--y': `${(i * 23 + 7) % 100}%`, '--drift': `${(i % 2 ? 1 : -1) * (18 + i % 4 * 12)}px`, '--duration': `${7 + i % 5}s`, '--delay': `${-i * .81}s`, '--turn': `${i % 2 ? 260 : -320}deg`, '--size': `${7 + i % 4 * 3}px`, color: colors[i % colors.length] }} />)}
      </div>
    </div>
    <img className={styles.can} src="/image/journey/wonderpop-film/magic-drink-comic-can-v29.webp" alt="Magic Drink" draggable="false" data-film-can />
    <span className={styles.seal}>{en ? 'THE ONE THAT STARTED IT ALL' : 'LA QUE LO EMPEZÓ TODO'}</span>
  </div>;
}
