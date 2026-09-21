import { useEffect, useRef } from 'react';
import styles from '../css/plazaLife.module.css';

const feet = [488, 490, 490, 463, 465, 463];
const idle = [0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 5, 5, 0, 0, 0, 3, 4, 5, 0];

// Animation cels have their own clock. Their painted feet share one baseline,
// even though the source sheet has different padding in the second row.
export default function MagicBunny({ en, className = '', from = .8, to = 1.08, interactive = false, offset = 0 }) {
  const host = useRef(null);
  const waveUntil = useRef(0);
  const greetingTimer = useRef(null);
  useEffect(() => () => clearTimeout(greetingTimer.current), []);
  useEffect(() => {
    const el = host.current, root = el.closest('[data-journey]');
    const image = new Image();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let timer, disposed = false, ready = false, position = offset;
    let state = { progress: Number(root.dataset.worldProgress || 0), reduced: media.matches };
    const sprite = el.querySelector('[data-bunny-cel]');
    const pose = index => {
      el.dataset.pose = String(index);
      sprite.style.backgroundPosition = `${index % 3 * 50}% ${Math.floor(index / 3) * 100}%`;
      sprite.style.translate = `0 ${(0.95 - feet[index] / 512) * 100}%`;
    };
    const active = () => ready && !disposed && !media.matches && !document.hidden && state.progress >= from && state.progress < to;
    const tick = () => {
      clearTimeout(timer);
      if (!active()) { if (media.matches) pose(0); return; }
      const waving = performance.now() < waveUntil.current;
      el.dataset.waving = String(waving);
      pose(waving ? position++ % 6 : idle[position++ % idle.length]);
      timer = setTimeout(tick, waving ? 135 : 180);
    };
    const update = event => { state = event.detail; if (!active()) { clearTimeout(timer); timer = null; } else if (!timer) tick(); };
    const resume = () => { clearTimeout(timer); timer = null; tick(); };
    image.src = '/image/journey/bunny-wave-v17.webp';
    image.decode().then(() => { if (!disposed) { ready = true; el.dataset.ready = 'true'; pose(0); tick(); } }).catch(() => {});
    root.addEventListener('journey:scene', update);
    media.addEventListener('change', resume);
    document.addEventListener('visibilitychange', resume);
    return () => { disposed = true; clearTimeout(timer); root.removeEventListener('journey:scene', update); media.removeEventListener('change', resume); document.removeEventListener('visibilitychange', resume); };
  }, [from, to, offset]);
  const content = <><i className={styles.contact} /><span className={styles.cel} data-bunny-cel /><span className={styles.hello} aria-hidden="true">{en ? 'Hi!' : '¡Hola!'}<i>✦</i></span></>;
  return interactive
    ? <button ref={host} className={`${styles.bunny} ${className}`} data-magic-bunny type="button" aria-label={en ? 'Wave to the Magic Bunny' : 'Saluda al Magic Bunny'} onClick={() => {
      waveUntil.current = performance.now() + 2100;
      host.current.dataset.waving = 'true';
      clearTimeout(greetingTimer.current);
      greetingTimer.current = setTimeout(() => { if (host.current) host.current.dataset.waving = 'false'; }, 2100);
    }}>{content}</button>
    : <span ref={host} className={`${styles.bunny} ${className}`} data-magic-bunny aria-hidden="true">{content}</span>;
}
