import { useEffect, useRef, useState } from 'react';
import styles from '../css/festivalMotion.module.css';

const frames = ['hexy-dj-v2', 'hexy-dj-mix-v11', 'hexy-dj-wave-v11'];
const sequence = [0, 1, 0, 2];
export default function DJSequence({ en }) {
  const ref = useRef(null);
  const images = useRef([]);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const host = ref.current;
    const root = host.closest('[data-journey]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let timer, disposed = false, requested = false, visible = false, ready = [0], step = 0;
    const schedule = () => {
      clearInterval(timer);
      if (reduced.matches) setFrame(0);
      if (visible && !document.hidden && !reduced.matches && ready.length > 1) {
        timer = setInterval(() => {
          step = (step + 1) % sequence.length;
          const next = sequence[step];
          setFrame(ready.includes(next) ? next : ready[0]);
        }, 1800);
      }
    };
    const update = event => {
      const { progress } = event.detail;
      const nextVisible = progress >= .37 && progress < .63;
      if (nextVisible !== visible) { visible = nextVisible; schedule(); }
      if (progress >= .30 && !requested && !reduced.matches) {
        requested = true;
        images.current.forEach(image => { image.loading = 'eager'; });
        Promise.allSettled(images.current.map(image => image.decode())).then(results => {
          if (disposed) return;
          ready = results.flatMap((result, i) => result.status === 'fulfilled' ? [i] : []);
          schedule();
        });
      }
    };
    root.addEventListener('journey:scene', update);
    reduced.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', schedule);
    update({ detail: { progress: Number(root.dataset.worldProgress || 0) } });
    return () => {
      disposed = true;
      clearInterval(timer);
      root.removeEventListener('journey:scene', update);
      reduced.removeEventListener('change', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, []);
  return (
    <div ref={ref} className={styles.performer} data-dj-sequence data-frame={frame}
      role="img" aria-label={en ? 'Hexy playing music on stage' : 'Hexy mezclando música en el escenario'}>
      {frames.map((name, i) => <img key={name} ref={image => { images.current[i] = image; }}
        className={styles.pose} data-visible={frame === i} src={`/image/journey/${name}.webp`}
        width="1122" height="1402" alt="" loading="lazy" />)}
      <img className={styles.desk} data-static-desk src="/image/journey/hexy-dj-v2.webp" width="1122" height="1402" alt="" loading="lazy" />
    </div>
  );
}
