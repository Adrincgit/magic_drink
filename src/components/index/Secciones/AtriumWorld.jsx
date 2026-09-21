import { useEffect, useRef } from 'react';
import styles from '../css/atriumWorld.module.css';

export default function AtriumWorld() {
  const host = useRef(null);
  useEffect(() => {
    const el = host.current, root = el.closest('[data-journey]');
    let disposed = false, pending = false, engine;
    let state = { progress: Number(root.dataset.worldProgress || 0), width: innerWidth, height: innerHeight, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
    const update = async event => {
      state = event?.detail || state;
      if (engine) { engine.update(state); return; }
      if (pending || state.reduced || state.progress < .66 || state.progress > 1.10) return;
      pending = true;
      try {
        const { createAtriumWorld } = await import('../animations/atriumWorld');
        if (disposed) return;
        engine = await createAtriumWorld(el);
        if (disposed) engine.dispose(); else engine.update(state);
      } catch { if (!disposed) { el.dataset.renderer = 'fallback'; root.dataset.atriumRenderer = 'fallback'; } }
    };
    root.addEventListener('journey:scene', update);
    update();
    return () => { disposed = true; root.removeEventListener('journey:scene', update); engine?.dispose(); };
  }, []);
  return <div ref={host} className={styles.world} data-atrium-engine data-renderer="fallback">
    <img data-atrium src="/image/journey/wonderpop-atrium-v15.webp" className={styles.fallback} alt="" width="1536" height="1024" loading="eager" fetchpriority="low" />
  </div>;
}
