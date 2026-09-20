import { useEffect, useRef } from 'react';
import styles from '../css/festivalMotion.module.css';

export default function FestivalCrowdMotion() {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    const root = host.closest('[data-journey]');
    let disposed = false, requested = false, animator;
    let state = { progress: Number(root.dataset.worldProgress || 0), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
    const update = async event => {
      state = event.detail;
      if (animator) return animator.update(state);
      if (requested || state.reduced || state.progress < .30 || state.progress > .65) return;
      requested = true;
      try {
        const { createCrowdMotion } = await import('../animations/crowdMotion');
        if (disposed) return;
        animator = await createCrowdMotion(host);
        if (disposed) animator.dispose(); else animator.update(state);
      } catch {
        // Original opaque audience planes remain visible if WebGL is unavailable.
      }
    };
    root.addEventListener('journey:scene', update);
    update({ detail: state });
    return () => {
      disposed = true;
      root.removeEventListener('journey:scene', update);
      animator?.dispose();
    };
  }, []);
  return <div ref={ref} className={styles.crowdCanvas} data-crowd-motion aria-hidden="true" />;
}
