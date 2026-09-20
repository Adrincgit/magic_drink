import { useEffect, useId, useRef, useState } from 'react';
import styles from '../css/indexJourney.module.css';

const frames = ['hexy-poster', 'hexy-poster-wave-v3', 'hexy-poster-sing-v3', 'hexy-poster-finale-v3'];
const screenContour = 'M .014 .063 C .30 -.019 .68 -.002 .985 .123 L .984 .981 L .015 .991 Z';

// The screen has its own clock. Only decoded images may replace the first frame.
export default function BillboardSequence({ active }) {
  const clipId = `hexy-screen-${useId().replace(/:/g, '')}`;
  const images = useRef([]);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let timer;
    let ready = [0];
    const schedule = () => {
      clearInterval(timer);
      if (reduced.matches) setFrame(0);
      if (!reduced.matches && !document.hidden && ready.length > 1) {
        timer = setInterval(() => {
          setFrame(current => ready[(Math.max(0, ready.indexOf(current)) + 1) % ready.length]);
        }, 3200);
      }
    };
    Promise.allSettled(images.current.map(image => image.decode())).then(results => {
      if (disposed) return;
      ready = results.flatMap((result, i) => result.status === 'fulfilled' ? [i] : []);
      schedule();
    });
    reduced.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      disposed = true;
      clearInterval(timer);
      reduced.removeEventListener('change', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [active]);
  return (
    <>
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs><clipPath id={clipId} clipPathUnits="objectBoundingBox"><path d={screenContour} /></clipPath></defs>
    </svg>
    <div className={styles.billboard} style={{ clipPath: `url(#${clipId})` }} data-billboard data-frame={frame} aria-hidden="true">
      {frames.map((name, i) => (
        <img key={name} ref={image => { images.current[i] = image; }}
          className={styles.posterFrame} data-visible={frame === i}
          src={`/image/journey/${name}.webp`} alt="" width="1024" height="1536"
          loading={i ? 'lazy' : 'eager'} decoding="async" />
      ))}
      <div className={styles.screenGlow} />
      <svg className={styles.screenRim} viewBox="0 0 1 1" preserveAspectRatio="none">
        <path d={screenContour} fill="none" stroke="#24132b" strokeOpacity=".68" strokeWidth=".009" />
      </svg>
    </div>
    </>
  );
}
