import { useEffect, useState } from 'react';
import { SceneStar } from '../../global/SceneControls';
import styles from '../css/journeyLoading.module.css';

// Server-rendered curtain: wait for decoded opening layers, not a cosmetic timer.
export default function JourneyLoading({ root, en, onReady }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    let disposed = false;
    let completed = false;
    const finish = () => {
      if (disposed || completed) return;
      completed = true;
      setProgress(100);
      setReady(true);
      onReady();
    };
    const images = [...root.current.querySelectorAll('[data-critical]')];
    let loaded = 0;
    const settled = () => {
      if (!disposed && !completed) setProgress(Math.round(++loaded / (images.length + 1) * 100));
    };
    const jobs = images.map(img => img.decode().catch(() => {}).then(settled));
    jobs.push(document.fonts.ready.then(settled));
    Promise.all(jobs).then(() => requestAnimationFrame(finish));
    const slowTimer = setTimeout(() => { if (!disposed) setSlow(true); }, 4000);
    // An unavailable image or a stalled font must never trap the visitor.
    const deadline = setTimeout(finish, 8000);
    return () => { disposed = true; clearTimeout(slowTimer); clearTimeout(deadline); };
  }, [root, onReady]);

  return <div className={styles.curtain} data-journey-loader data-complete={ready} aria-hidden={ready}>
    <div className={styles.ticket}>
      <span className={styles.eyebrow}>MAGIC DRINK</span>
      <div className={styles.emblem} aria-hidden="true"><i /><i /><SceneStar /><span>♪</span><span>✦</span></div>
      <strong>{en ? 'A little magic…' : 'Un poquito de magia…'}</strong>
      <p role="status">{en ? 'Lighting up your visit' : 'Encendiendo tu visita'}</p>
      <div className={styles.meter} role="progressbar" aria-label={en ? 'Loading the scene' : 'Cargando la escena'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
      {slow && !ready && <button type="button" onClick={() => { setReady(true); onReady(); }}>{en ? 'Enter now' : 'Entrar ahora'} ↗</button>}
    </div>
  </div>;
}
