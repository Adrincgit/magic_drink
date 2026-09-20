import { useEffect, useRef } from 'react';
import styles from '../css/gardenWorld.module.css';

// HTML survives delayed artwork, unsupported WebGL and reduced motion.
// The renderer only loads when the visitor approaches the garden.
export default function GardenWorld() {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    let disposed = false;
    let pending = false;
    let renderer;
    let state = host.gardenState;
    const update = async (event) => {
      state = event?.detail || host.gardenState;
      if (!state) return;
      if (renderer) return renderer.update(state);
      if (state.reduced || state.progress < 0.48 || state.progress > 0.87 || pending) return;
      pending = true;
      host.querySelector('img[src*="garden-static"]').loading = 'eager';
      try {
        const { createGardenWorld } = await import('../animations/gardenWorld');
        if (disposed) return;
        renderer = await createGardenWorld(host);
        if (disposed) renderer.dispose();
        else renderer.update(state);
      } catch {
        // Keep the complete illustrated fallback; never interrupt native scroll.
        if (!disposed) host.dataset.renderer = 'fallback';
      }
    };
    host.addEventListener('garden:camera', update);
    update();
    return () => {
      disposed = true;
      host.removeEventListener('garden:camera', update);
      renderer?.dispose();
    };
  }, []);
  return (
    <div ref={ref} className={styles.world} data-garden-world data-renderer="fallback" aria-hidden="true">
      <img className={styles.sky} src="/image/journey/clouds.webp" alt="" loading="lazy" />
      <img className={`${styles.sky} ${styles.highClouds}`} src="/image/journey/clouds.webp" alt="" loading="lazy" />
      <img className={styles.fallback} src="/image/journey/garden-static-v10.webp" alt="" width="1536" height="1024" loading="lazy" />
    </div>
  );
}
