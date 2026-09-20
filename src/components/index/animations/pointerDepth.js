// A second, small camera offset. CSS translate composes with GSAP's scroll
// transforms, so pointer movement never changes scroll or moves the HTML copy.
export function mountPointerDepth(root) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let disposed = false;

  function tick() {
    frame = 0;
    if (disposed) return;
    x += (targetX - x) * 0.085;
    y += (targetY - y) * 0.085;
    if (Math.abs(targetX - x) + Math.abs(targetY - y) < 0.025) {
      x = targetX;
      y = targetY;
    } else frame = requestAnimationFrame(tick);
    root.style.setProperty('--look-x', `${x.toFixed(3)}px`);
    root.style.setProperty('--look-y', `${y.toFixed(3)}px`);
  }
  function schedule() {
    if (!frame && !disposed) frame = requestAnimationFrame(tick);
  }
  function move(event) {
    if (!fine.matches || reduced.matches || document.hidden || event.pointerType === 'touch')
      return;
    targetX = (event.clientX / innerWidth - 0.5) * -20;
    targetY = (event.clientY / innerHeight - 0.5) * -12;
    schedule();
  }
  function reset() {
    targetX = targetY = 0;
    if (reduced.matches || document.hidden || !fine.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      x = y = 0;
      root.style.setProperty('--look-x', '0px');
      root.style.setProperty('--look-y', '0px');
    } else schedule();
  }
  root.addEventListener('pointermove', move, { passive: true });
  root.addEventListener('pointerleave', reset);
  document.addEventListener('visibilitychange', reset);
  fine.addEventListener('change', reset);
  reduced.addEventListener('change', reset);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerleave', reset);
    document.removeEventListener('visibilitychange', reset);
    fine.removeEventListener('change', reset);
    reduced.removeEventListener('change', reset);
    root.style.removeProperty('--look-x');
    root.style.removeProperty('--look-y');
  };
}
