import { useEffect, useId, useState } from 'react';
import styles from '../css/heroProduct.module.css';

// Eight drawn poses, held like animation cels. The printed can never morphs.
const droplets = [
  [231, 265, 1.4, 0], [321, 330, 1, 3], [730, 287, 1.65, 1],
  [777, 538, 1.2, 4], [228, 696, 1.75, 2], [796, 990, 1.45, 5],
  [319, 1125, 1.15, 6], [695, 1230, 1.6, 0], [571, 251, .95, 5],
];
export default function CanCondensation({ active }) {
  const [frame, setFrame] = useState(0);
  const id = `dew-${useId().replace(/:/g, '')}`;
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    const update = () => {
      clearInterval(timer);
      if (active && !document.hidden && !reduced.matches) timer = setInterval(() => setFrame(f => (f + 1) % 8), 180);
      if (reduced.matches) setFrame(0);
    };
    update(); document.addEventListener('visibilitychange', update); reduced.addEventListener('change', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); reduced.removeEventListener('change', update); };
  }, [active]);
  return <svg className={styles.condensation} viewBox="0 0 1024 1536" aria-hidden="true" data-condensation data-frame={frame}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f4f5ff" stopOpacity=".72" /><stop offset=".35" stopColor="#b9a4f3" stopOpacity=".13" /><stop offset=".8" stopColor="#4a227f" stopOpacity=".45" /><stop offset="1" stopColor="#f7e7ff" stopOpacity=".8" /></linearGradient></defs>
    {droplets.map(([x, y, scale, offset], i) => {
      const pose = (frame + offset) % 8;
      const fall = [0, 0, 3, 8, 18, 33, 50, 64][pose];
      return <g key={i} transform={`translate(${x + [0, 0, -1, -1, -2, -1, 0, 0][pose]}, ${y + fall}) scale(${scale})`} opacity={pose === 7 ? .4 : .92}>
        <path d="M0 -17 C-3 -11 -12 -2 -12 7 C-12 23 12 23 12 7 C12 -2 3 -11 0 -17Z" fill={`url(#${id})`} stroke="#583384" strokeWidth="1.5" />
        <path d="M-3 -5 Q-9 2 -7 10" fill="none" stroke="#fff3d8" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M3 16 Q7 15 8 11" fill="none" stroke="#dacbff" strokeWidth="2.5" strokeLinecap="round" />
      </g>;
    })}
  </svg>;
}
