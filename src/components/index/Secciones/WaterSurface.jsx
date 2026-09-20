import { useEffect, useRef } from 'react';
import styles from '../css/waterSurface.module.css';

export default function WaterSurface() {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    const root = host.closest('[data-journey]');
    let disposed = false, requested = false, animator;
    let state = { progress: Number(root.dataset.worldProgress || 0), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
    const update = async event => {
      state = event.detail;
      if (animator) return animator.update(state);
      if (requested || state.reduced || state.progress >= .41) return;
      requested = true;
      try {
        const { createWaterMotion } = await import('../animations/waterMotion');
        if (disposed) return;
        animator = await createWaterMotion(host);
        if (disposed) animator.dispose(); else animator.update(state);
      } catch { /* The original river remains visible without WebGL. */ }
    };
    root.addEventListener('journey:scene', update);
    update({ detail: state });
    return () => { disposed = true; root.removeEventListener('journey:scene', update); animator?.dispose(); };
  }, []);
  return <div ref={ref} className={styles.surface} data-water-motion data-renderer="fallback">
    <img data-critical src="/image/journey/distance-water-v2.webp" alt="" width="2172" height="724" />
  </div>;
}
