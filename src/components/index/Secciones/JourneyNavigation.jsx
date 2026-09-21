import { memo, useEffect, useRef, useState } from 'react';
import styles from '../css/journeyNavigation.module.css';
import { JOURNEY_END, journeyChapters } from '../../../data/journeyChapters';

function JourneyNavigation({ root, en }) {
  const bar = useRef(null);
  const current = useRef(-1);
  const finished = useRef(false);
  const [chapter, setChapter] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const names = journeyChapters.map(scene => scene[en ? 'en' : 'es']);
  useEffect(() => {
    const scene = root.current;
    const update = ({ detail: { progress } }) => {
      const index = journeyChapters.filter(scene => progress >= scene.from).length - 1;
      bar.current.style.transform = `scaleX(${progress / JOURNEY_END})`;
      if (index !== current.current) { current.current = index; setChapter(index); }
      const end = progress >= JOURNEY_END - .015;
      if (end !== finished.current) { finished.current = end; setAtEnd(end); }
    };
    scene.addEventListener('journey:scene', update);
    update({ detail: { progress: Number(scene.dataset.worldProgress || 0) } });
    return () => scene.removeEventListener('journey:scene', update);
  }, [root]);
  return <nav className={styles.navigation} data-journey-navigation aria-label={en ? 'Journey scenes' : 'Escenas del recorrido'}>
    <span className={styles.label} data-journey-label>
      <b>{String(chapter + 1).padStart(2, '0')}<small> / {String(journeyChapters.length).padStart(2, '0')}</small></b>
      <span>{names[chapter]}</span>
    </span>
    <div className={styles.dots}>
      {journeyChapters.map(({ at }, index) => <button key={at} type="button" data-go-world={at}
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
