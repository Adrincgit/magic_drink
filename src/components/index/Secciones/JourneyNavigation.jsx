import { memo, useEffect, useRef, useState } from 'react';
import styles from '../css/journeyNavigation.module.css';

// Arrival points and chapter boundaries share the full journey's 0–1 timeline.
const stops = [0, .162, .3132, .49, .68, .88];
const boundaries = [.0828, .2412, .36, .62, .86];
const labels = {
  es: ['MAGIC DRINK', 'LA CIUDAD', 'HEXY', 'MAGIC DRINK DAY', 'WONDERPOP PLAZA', 'EL ATRIO'],
  en: ['MAGIC DRINK', 'THE CITY', 'HEXY', 'MAGIC DRINK DAY', 'WONDERPOP PLAZA', 'THE ATRIUM'],
};

function JourneyNavigation({ root, en }) {
  const bar = useRef(null);
  const current = useRef(-1);
  const finished = useRef(false);
  const [chapter, setChapter] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const names = labels[en ? 'en' : 'es'];
  useEffect(() => {
    const scene = root.current;
    const update = ({ detail: { progress } }) => {
      const index = boundaries.filter(boundary => progress >= boundary).length;
      bar.current.style.transform = `scaleX(${progress})`;
      if (index !== current.current) { current.current = index; setChapter(index); }
      const end = progress >= .985;
      if (end !== finished.current) { finished.current = end; setAtEnd(end); }
    };
    scene.addEventListener('journey:scene', update);
    update({ detail: { progress: Number(scene.dataset.worldProgress || 0) } });
    return () => scene.removeEventListener('journey:scene', update);
  }, [root]);
  return <nav className={styles.navigation} data-journey-navigation aria-label={en ? 'Journey scenes' : 'Escenas del recorrido'}>
    <span className={styles.label} data-journey-label>
      <b>{String(chapter + 1).padStart(2, '0')}<small> / {String(stops.length).padStart(2, '0')}</small></b>
      <span>{names[chapter]}</span>
    </span>
    <div className={styles.dots}>
      {stops.map((progress, index) => <button key={progress} type="button" data-go-world={progress}
        aria-label={names[index]} title={`${index + 1}. ${names[index]}`}
        aria-pressed={chapter === index} aria-current={chapter === index ? 'step' : undefined}>
        <i aria-hidden="true" />
      </button>)}
    </div>
    <span className={styles.hint}>{atEnd ? (en ? 'WHERE NEXT?' : '¿DÓNDE SEGUIMOS?') : (en ? 'SCROLL TO DISCOVER' : 'DESLIZA Y DESCUBRE')}<span aria-hidden="true">{atEnd ? '✦' : '↓'}</span></span>
    <div className={styles.progress} aria-hidden="true"><i ref={bar} data-progress-bar /></div>
  </nav>;
}

export default memo(JourneyNavigation);
