import { useEffect, useRef } from 'react';
import styles from '../css/atriumWorld.module.css';

export default function IllustrationWorld({ source, gesture = null, kind, from, to }) {
  const host = useRef(null);
  useEffect(() => {
    const el = host.current, root = el.closest('[data-journey]');
    let disposed = false, pending = false, engine;
    let state = { progress: Number(root.dataset.worldProgress || 0), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
    async function update(event) {
      state = event?.detail || state;
      if (engine) { engine.update(state); return; }
      if (pending || state.reduced || state.progress < from - .15 || state.progress > to) return;
      pending = true;
      try {
        const { createIllustrationWorld } = await import('../animations/atriumWorld');
        if (disposed) return;
        engine = await createIllustrationWorld(el, { source, gesture, kind, from, to });
        if (disposed) engine.dispose(); else engine.update(state);
      } catch { el.dataset.renderer = 'fallback'; }
    }
    root.addEventListener('journey:scene', update); update();
    return () => { disposed = true; root.removeEventListener('journey:scene', update); engine?.dispose(); };
  }, [source, gesture, kind, from, to]);
  return <div ref={host} className={styles.world} data-illustration={kind} data-renderer="fallback" aria-hidden="true">
    <img className={styles.fallback} src={`/image/journey/${source}`} alt="" width="1536" height="1024" loading="lazy" draggable="false" />
  </div>;
}
