import { ScrollTrigger } from 'gsap/ScrollTrigger';

let refreshFrame = 0;
let layoutUsers = 0;
let layoutObserver;

// client:only islands and fonts can change the page after DOMContentLoaded/load.
// Transforms do not resize this box; ordinary scroll animation won't refresh it.
export function observeLandingLayout() {
  layoutUsers += 1;
  if (!layoutObserver) {
    let previousWidth = -1;
    let previousHeight = -1;
    layoutObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === previousWidth && height === previousHeight) return;
      previousWidth = width;
      previousHeight = height;
      refreshLandingScroll();
    });
    layoutObserver.observe(document.body);
  }
  return () => {
    layoutUsers -= 1;
    if (!layoutUsers) {
      layoutObserver.disconnect();
      layoutObserver = null;
    }
  };
}

// Astro hydrates sections independently. Measure upstream pins first, once per frame.
export function refreshLandingScroll() {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });
}

// Media readiness must never determine the existence or length of a scroll scene.
export function createScrollVideo(video, start, end, maxDuration = Infinity) {
  let progress = 0;
  let frame = 0;
  let disposed = false;
  let enabled = true;
  video.pause();

  const render = () => {
    frame = 0;
    if (disposed || !enabled || video.readyState < 1 || video.error || video.seeking) return;
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;

    const duration = Math.min(video.duration, maxDuration);
    const fraction = Math.max(0, Math.min(1, (progress - start) / (end - start)));
    // Stay on a decoded frame at the end, including after large scroll jumps.
    const target = fraction * Math.max(0, duration - 1 / 30);
    if (Math.abs(video.currentTime - target) > 1 / 60) video.currentTime = target;
  };

  const schedule = () => {
    if (!disposed && !frame) frame = requestAnimationFrame(render);
  };
  const events = ['loadedmetadata', 'loadeddata', 'durationchange', 'canplay', 'seeked'];
  events.forEach((event) => video.addEventListener(event, schedule));

  return {
    setEnabled(value) {
      if (enabled === value) return;
      enabled = value;
      if (enabled) { video.pause(); schedule(); }
      else { cancelAnimationFrame(frame); frame = 0; }
    },
    setProgress(value) {
      progress = value;
      schedule();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      events.forEach((event) => video.removeEventListener(event, schedule));
    },
  };
}
