import { useEffect } from 'react';

// Scroll moves the illustrated scenery; independent CSS loops animate life in it.
// Text and controls never inherit the scenery transforms.
export default function useSceneMotion(rootRef, reduced) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scenes = [...root.querySelectorAll('[data-hexy-scene]')];
    const passages = root.querySelector('[data-hexy-passages]');
    const roomBackdrops = [...root.querySelectorAll('[data-room-backdrop]')];
    const roomScenes = [...root.querySelectorAll('[data-room-scene]')];
    const roomSections = roomBackdrops.map(backdrop => root.querySelector(`[data-hexy-scene="${backdrop.dataset.roomBackdrop}"]`));
    const fine = matchMedia('(pointer: fine)');
    let targetX = 0, targetY = 0, x = 0, y = 0, frame = 0;
    const paint = () => {
      frame = 0;
      x += (targetX - x) * .075;
      y += (targetY - y) * .075;
      scenes.forEach(scene => {
        const rect = scene.getBoundingClientRect();
        const active = rect.bottom > -100 && rect.top < innerHeight + 100 && !document.hidden;
        scene.dataset.sceneActive = String(active);
        if (!active && !reduced) return;
        scene.style.setProperty('--scene-x', `${reduced ? 0 : x.toFixed(3)}px`);
        scene.style.setProperty('--scene-y', `${reduced ? 0 : y.toFixed(3)}px`);
        const progress = Math.max(-1, Math.min(1, (innerHeight * .4 - rect.top) / (rect.height + innerHeight * .4)));
        scene.style.setProperty('--scene-scroll', `${reduced ? 0 : (progress * 80).toFixed(3)}px`);
      });
      if (passages) {
        let activeRoom = 'backstage';
        roomBackdrops.forEach((backdrop, i) => {
          const bounds = roomScenes[i].getBoundingClientRect();
          // scrollIntoView rounds its destination to device pixels. A leftover
          // fraction of a pixel must not keep an offscreen room's loops alive.
          const visible = bounds.bottom > .5 && bounds.top < innerHeight - .5;
          backdrop.dataset.roomVisible = String(visible);
          if (bounds.top <= innerHeight * .5 && bounds.bottom > innerHeight * .5) activeRoom = backdrop.dataset.roomBackdrop;
          // Each room has its own camera travel. Measuring the entire long
          // passage would make the movement almost imperceptible within a room.
          const rect = roomSections[i]?.getBoundingClientRect();
          const progress = rect ? Math.max(-.3, Math.min(1, (innerHeight * .65 - rect.top) / (rect.height + innerHeight * .5))) : 0;
          backdrop.style.setProperty('--room-scroll', `${reduced ? 0 : (progress * 170).toFixed(3)}px`);
        });
        passages.dataset.activeRoom = activeRoom;
      }
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .02) frame = requestAnimationFrame(paint);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const pointer = event => {
      if (reduced || !fine.matches || event.pointerType === 'touch') return;
      targetX = (event.clientX / innerWidth - .5) * 15;
      targetY = (event.clientY / innerHeight - .5) * 5;
      schedule();
    };
    const reset = () => { targetX = 0; targetY = 0; schedule(); };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { entry.target.dataset.sceneActive = String(entry.isIntersecting); });
      schedule();
    }, { rootMargin: '100px' });
    scenes.forEach(scene => observer.observe(scene));
    const sizeObserver = new ResizeObserver(schedule);
    if (passages) sizeObserver.observe(passages);
    root.addEventListener('pointermove', pointer, { passive: true });
    root.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', reset);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizeObserver.disconnect();
      root.removeEventListener('pointermove', pointer);
      root.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', reset);
    };
  }, [rootRef, reduced]);
}
