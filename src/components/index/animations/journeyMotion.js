import { gsap } from 'gsap';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { createWorldDirector, OPENING_END } from './worldMotion';
import { mountPointerDepth } from './pointerDepth';

const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const mix = (a, b, p) => a + (b - a) * p;
const phase = (p, a, b) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Lenis interpolates wheel input; scene and ambient animation keep separate clocks.
// Geometry never depends on media loading; every chapter shares the same stage.
export function mountJourney(root, onChapter) {
  if (!root) return () => {};
  const runway = root.querySelector('[data-runway]');
  const stage = root.querySelector('[data-stage]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const query = (s) => root.querySelector(s);
  const layers = Object.fromEntries(
    [...root.querySelectorAll('[data-depth]')].map((el) => [el.dataset.depth, el]),
  );
  const copies = [...root.querySelectorAll('[data-chapter]')];
  const left = query('[data-shade="left"]');
  const right = query('[data-shade="right"]');
  const exit = query('[data-exit-shade]');
  const world = createWorldDirector(root);
  const stopPointer = mountPointerDepth(root);
  let frame = 0;
  let current = -1;
  let start = 0;
  let distance = 1;
  let width = 0;
  let height = 0;
  let camera = [0, 0, 0];
  let lastOpening = -1;
  let disposed = false;
  let lenis;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  function configureScroll() {
    lenis?.destroy();
    lenis = undefined;
    if (!reduced.matches && fine.matches) {
      lenis = new Lenis({
        autoRaf: true, lerp: .09, smoothWheel: true, syncTouch: false,
        virtualScroll: () => root.dataset.assetsReady === 'true' && getComputedStyle(document.body).overflow !== 'hidden',
      });
      // Render in the same frame as Lenis, without a second smoothing layer.
      lenis.on('scroll', () => { cancelAnimationFrame(frame); render(); });
    }
    root.dataset.scrollEngine = lenis ? 'lenis' : 'native';
  }

  function render() {
    frame = 0;
    if (disposed) return;
    if (reduced.matches) {
      copies.forEach((el) => {
        el.inert = false;
        el.removeAttribute('aria-hidden');
        gsap.set(el, { clearProps: 'all' });
      });
      Object.values(layers).forEach((el) => gsap.set(el, { clearProps: 'all' }));
      root.dataset.progress = '0';
      root.dataset.worldProgress = '0';
      world.render(0, width, height, true);
      return;
    }
    const worldProgress = clamp((scrollY - start) / distance);
    const p = clamp(worldProgress / OPENING_END);
    if (p !== lastOpening || worldProgress < 0.41) {
      const toCity = phase(p, 0.06, 0.42);
      const toMusic = phase(p, 0.53, 0.84);
      const x = mix(mix(camera[0], camera[1], toCity), camera[2], toMusic);
      const pullback = 1.045 - 0.045 * toCity;
      gsap.set(layers.sky, { x: x * 0.025 });
      gsap.set(layers['cloud-far'], { x: x * 0.075 });
      gsap.set(layers['cloud-near'], { x: x * 0.13 });
      gsap.set(layers.distance, { x: x * 0.23, y: -height * 0.012 * toCity });
      gsap.set(layers.hills, { x: x * 0.09, y: -height * 0.004 * toCity });
      // Shoreline, bridge feet and their reflections share one camera plane.
      gsap.set(layers.water, { x: x * 0.23, y: -height * 0.012 * toCity });
      // The sun is much farther away than the waterfront; no vertical bobbing.
      gsap.set(layers.sun, { x: x * 0.045, y: 0 });
      gsap.set(layers.street, { x, scale: pullback, transformOrigin: '50% 82%' });
      // A grounded lamp follows the paving it stands on, including its pivot.
      gsap.set(layers.furniture, { x, scale: pullback, transformOrigin: '50% 82%', y: 0 });
      const foregroundX = -width * 1.23 * phase(p, 0.04, 0.35);
      gsap.set(layers.counter, {
        x: foregroundX,
        y: height * 0.11 * toCity,
        autoAlpha: 1 - phase(p, 0.3, 0.38),
      });
      gsap.set(layers.product, {
        x: foregroundX,
        y: height * 0.11 * toCity,
        rotation: 0,
        autoAlpha: 1 - phase(p, 0.28, 0.37),
      });
      gsap.set(layers.plants, { x: x * 1.3 - width * 0.2 * toCity, y: height * 0.04 * toCity });
      gsap.set(layers.window, { x: -width * 0.8 * toCity });
      gsap.set(copies[0], { autoAlpha: 1 - phase(p, 0.035, 0.17), y: -30 * toCity });
      gsap.set(copies[1], {
        autoAlpha: phase(p, 0.23, 0.38) * (1 - phase(p, 0.55, 0.67)),
        y: 22 * (1 - toCity) - 20 * toMusic,
      });
      gsap.set(copies[2], {
        autoAlpha: phase(p, 0.69, 0.83) * (1 - phase(worldProgress, 0.345, 0.373)),
        y: 28 * (1 - toMusic),
      });
      gsap.set(left, { opacity: 1 - toMusic });
      gsap.set(right, { opacity: toMusic });
      gsap.set(exit, { opacity: 0 });
      lastOpening = p;
    }
    world.render(worldProgress, width, height, false);
    const chapter = worldProgress > 0.36 ? -1 : p < 0.23 ? 0 : p < 0.67 ? 1 : 2;
    if (chapter !== current) {
      current = chapter;
      onChapter(chapter);
      copies.forEach((el, i) => {
        el.inert = i !== chapter;
        el.setAttribute('aria-hidden', String(i !== chapter));
      });
    }
    root.dataset.progress = p.toFixed(4);
    root.dataset.worldProgress = worldProgress.toFixed(4);
  }

  function measure() {
    lastOpening = -1;
    width = stage.clientWidth;
    height = stage.clientHeight;
    start = runway.getBoundingClientRect().top + scrollY;
    distance = Math.max(1, runway.offsetHeight - height);
    const worldWidth = height * 3;
    const mobile = width <= 700;
    const anchor = (position, screen) =>
      -clamp(worldWidth * position - width * screen, 0, Math.max(0, worldWidth - width));
    camera = [
      mobile ? anchor(0.15, 0.5) : 0,
      anchor(0.48, mobile ? 0.54 : 0.58),
      anchor(0.704, mobile ? 0.5 : 0.4),
    ];
    root.dataset.reduced = String(reduced.matches);
    render();
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function navigate(event) {
    const link = event.target.closest('[data-go],[data-go-world]');
    if (!link || !root.contains(link)) return;
    event.preventDefault();
    const isWorld = link.hasAttribute('data-go-world');
    const p = Number(isWorld ? link.dataset.goWorld : link.dataset.go);
    if (reduced.matches) {
      const target =
        isWorld && p >= OPENING_END
          ? query(`[data-world-copy="${p < .62 ? 'festival' : p < .86 ? 'plaza' : 'interior'}"]`)
          : copies[(isWorld ? p / OPENING_END : p) < .23 ? 0 : (isWorld ? p / OPENING_END : p) < .67 ? 1 : 2];
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }
    const top = start + p * distance * (isWorld ? 1 : OPENING_END);
    if (lenis) lenis.scrollTo(top);
    else window.scrollTo({ top, behavior: 'smooth' });
  }
  function resize() {
    measure();
  }
  function preference() { configureScroll(); measure(); }
  function visibility() {
    root.dataset.active = String(!document.hidden && runway.getBoundingClientRect().bottom > 0);
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      root.dataset.active = String(entry.isIntersecting && !document.hidden);
    },
    { rootMargin: '100px' },
  );
  observer.observe(runway);
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(stage);
  root.addEventListener('click', navigate);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', resize);
  reduced.addEventListener('change', preference);
  fine.addEventListener('change', preference);
  document.addEventListener('visibilitychange', visibility);
  document.fonts.ready.then(() => {
    if (!disposed) resize();
  });
  measure();
  configureScroll();
  root.dataset.ready = 'true';
  const initialChapter = { '#ciudad': 0.45, '#hexy': 0.87 }[location.hash];
  const initialWorld = { '#festival': 0.49, '#wonderpop': 0.68, '#directorio-wonderpop': 1, '#la-original': 1 }[location.hash];
  if (initialWorld !== undefined) {
    requestAnimationFrame(() => {
      if (disposed) return;
      if (reduced.matches) (initialWorld === 1 ? query('[data-world-scene="closing"]') : query(location.hash)).scrollIntoView();
      else window.scrollTo({ top: start + initialWorld * distance, behavior: 'instant' });
    });
  }
  if (initialChapter !== undefined) {
    requestAnimationFrame(() => {
      if (disposed) return;
      if (reduced.matches) copies[initialChapter === 0.45 ? 1 : 2].scrollIntoView();
      else
        window.scrollTo({
          top: start + initialChapter * distance * OPENING_END,
          behavior: 'instant',
        });
    });
  }
  return () => {
    disposed = true;
    lenis?.destroy();
    stopPointer();
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    root.removeEventListener('click', navigate);
    removeEventListener('scroll', schedule);
    removeEventListener('resize', resize);
    reduced.removeEventListener('change', preference);
    fine.removeEventListener('change', preference);
    document.removeEventListener('visibilitychange', visibility);
  };
}
