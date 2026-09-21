import { useEffect, useRef } from 'react';
import styles from '../css/wonderpopGallery.module.css';

export default function ExhibitScreen({ image, alt }) {
  const host = useRef(null), engine = useRef(null), currentImage = useRef(image);
  currentImage.current = image;
  useEffect(() => {
    const el = host.current, root = el.closest('[data-journey]');
    let disposed = false, pending = false;
    let state = { progress: Number(root.dataset.worldProgress || 0), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
    const update = async event => {
      state = event?.detail || state;
      if (engine.current) { engine.current.update(state); return; }
      if (pending || state.reduced || state.progress < .94) return;
      pending = true;
      try {
        const { createExhibitSurface } = await import('../animations/exhibitSurface');
        if (disposed) return;
        engine.current = createExhibitSurface(el);
        engine.current.update(state);
        engine.current.setArtwork(currentImage.current);
      } catch { if (!disposed) el.dataset.renderer = 'fallback'; }
    };
    root.addEventListener('journey:scene', update);
    update();
    return () => { disposed = true; root.removeEventListener('journey:scene', update); engine.current?.dispose(); engine.current = null; };
  }, []);
  useEffect(() => { engine.current?.setArtwork(image); }, [image]);
  return <div className={styles.screen} ref={host} data-exhibit-screen data-renderer="fallback">
    <img src={image} alt={alt} width="520" height="520" draggable={false} loading="lazy" />
    <i className={styles.glass} aria-hidden="true" />
  </div>;
}
