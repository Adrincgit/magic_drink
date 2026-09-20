import { gsap } from 'gsap';

export const OPENING_END = 0.36;
const clamp = (n) => Math.max(0, Math.min(1, n));
const mix = (a, b, p) => a + (b - a) * p;
const phase = (p, a, b) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// All six chapters occupy ONE sticky viewport. No second pinned block can enter
// below the first: shared sky, city and landmark remain mounted throughout.
export function createWorldDirector(root) {
  const query = (selector) => root.querySelector(selector);
  const opening = query('[data-opening]');
  const openingNav = query('[data-opening-navigation]');
  const landmark = query('[data-depth="plaza"]');
  const ground = query('[data-world-ground]');
  const festival = query('[data-world-scene="festival"]');
  const courtyard = query('[data-courtyard]');
  const dj = query('[data-dj]');
  const crowd = query('[data-crowd]');
  const plaza = query('[data-world-scene="plaza"]');
  const interior = query('[data-world-interior]');
  const atrium = query('[data-atrium]');
  const atriumGarden = query('[data-atrium-garden]');
  const atriumBar = query('[data-atrium-bar]');
  const insideLeaves = query('[data-inside-leaves]');
  const closing = query('[data-world-scene="closing"]');
  const display = query('[data-closing-display]');
  const passingLeaves = query('[data-passing-leaves]');
  const doorLight = query('[data-door-light]');
  const footer = query('[data-world-footer]');
  const rail = query('[data-world-rail]');
  const label = query('[data-world-label]');
  const copies = [...root.querySelectorAll('[data-world-copy]')];
  const animated = [
    opening,
    openingNav,
    ground,
    festival,
    courtyard,
    dj,
    crowd,
    plaza,
    interior,
    atrium,
    atriumGarden,
    atriumBar,
    insideLeaves,
    closing,
    display,
    passingLeaves,
    doorLight,
    footer,
    rail,
    ...copies,
  ];

  function copy(name, opacity, y = 0) {
    const element = copies.find((el) => el.dataset.worldCopy === name);
    gsap.set(element, { autoAlpha: opacity, y });
    const hidden = opacity < 0.35;
    element.inert = hidden;
    element.setAttribute('aria-hidden', String(hidden));
  }

  return {
    render(r, width, height, openingX, reduced) {
      if (reduced) {
        animated.forEach((element) => gsap.set(element, { clearProps: 'all' }));
        copies.forEach((element) => {
          element.inert = false;
          element.removeAttribute('aria-hidden');
        });
        footer.inert = false;
        return;
      }
      const mobile = width <= 700;
      const handoff = phase(r, 0.355, 0.435);
      gsap.set(opening, {
        y: -height * 0.07 * handoff,
        x: -width * 0.03 * handoff,
        scale: 1 + 0.3 * handoff,
        autoAlpha: 1 - phase(r, 0.38, 0.408),
      });
      gsap.set(openingNav, { autoAlpha: 1 - phase(r, 0.335, 0.365) });
      gsap.set(ground, {
        autoAlpha: phase(r, 0.35, 0.44) * (1 - phase(r, 0.775, 0.835)),
        y: height * 0.06 * phase(r, 0.45, 0.7),
      });

      const arrive = phase(r, 0.382, 0.416);
      const festivalExit = phase(r, 0.58, 0.67);
      gsap.set(festival, {
        autoAlpha: arrive * (1 - festivalExit),
        y: height * 0.12 * (1 - arrive),
        scale: 1 + 0.055 * (1 - arrive),
      });
      gsap.set(courtyard, {
        y: height * ((mobile ? 0.1 : 0) + 0.025 * (1 - phase(r, 0.44, 0.59))),
      });
      gsap.set(dj, { y: height * 0.025 * (1 - phase(r, 0.44, 0.59)) });
      gsap.set(crowd, {
        y: height * 0.045 * phase(r, 0.44, 0.59),
        scale: 1 + 0.035 * phase(r, 0.44, 0.59),
      });
      festival.dataset.worldActive = String(r > 0.34 && r < 0.68 && !document.hidden);
      copy('festival', phase(r, 0.43, 0.46) * (1 - phase(r, 0.57, 0.62)), -22 * festivalExit);

      // The landmark is the very same DOM/image plane seen beyond Hexy's screen.
      // Move to the entrance, then push toward the door, not a new rectangle.
      if (r > OPENING_END) {
        const approach = phase(r, 0.36, 0.65);
        const baseHeight = height * 0.95;
        const baseWidth = (baseHeight * 2) / 3;
        const startLeft = height * 2.4 + openingX * 0.88;
        const targetScale = mobile ? 0.75 : 1.05;
        const exteriorScale = mix(1, targetScale, approach);
        const exteriorLeft = mix(
          startLeft,
          width * (mobile ? 0.62 : 0.74) - baseWidth * targetScale * 0.5,
          approach,
        );
        const exteriorTop = mix(-height * 0.099, height * (mobile ? 0.3 : -0.1), approach);
        const zoom = 1 + 4.5 * phase(r, 0.715, 0.845);
        const scale = exteriorScale * zoom;
        const left = exteriorLeft - baseWidth * exteriorScale * 0.52 * (zoom - 1);
        const top = exteriorTop - baseHeight * exteriorScale * 0.77 * (zoom - 1);
        gsap.set(landmark, {
          scale,
          x: left - height * 2.4 * scale,
          y: top + height * 0.09 * scale,
          transformOrigin: '0 0',
          autoAlpha: 1 - phase(r, 0.785, 0.845),
        });
      }
      gsap.set(plaza, { autoAlpha: phase(r, 0.59, 0.655) * (1 - phase(r, 0.765, 0.815)) });
      copy(
        'plaza',
        phase(r, 0.625, 0.665) * (1 - phase(r, 0.735, 0.775)),
        -35 * phase(r, 0.715, 0.78),
      );

      const indoors = phase(r, 0.785, 0.85);
      gsap.set(interior, { autoAlpha: indoors });
      gsap.set(atrium, {
        scale: 1.12 - 0.1 * phase(r, 0.82, 0.97),
        y: -height * 0.035 * phase(r, 0.82, 0.97),
      });
      const indoorTravel = phase(r, 0.82, 0.97);
      gsap.set(atriumGarden, {
        scale: 1.12 - 0.1 * indoorTravel,
        x: -width * 0.025 * indoorTravel,
        y: -height * 0.02 * indoorTravel,
        transformOrigin: '35% 80%',
      });
      gsap.set(atriumBar, {
        scale: 1.12 - 0.1 * indoorTravel,
        x: width * 0.035 * indoorTravel,
        y: height * 0.01 * indoorTravel,
        transformOrigin: '80% 80%',
      });
      gsap.set(insideLeaves, {
        x: width * 0.08 * phase(r, 0.83, 0.98),
        y: height * 0.05 * phase(r, 0.83, 0.98),
      });
      copy(
        'interior',
        phase(r, 0.837, 0.863) * (1 - phase(r, 0.892, 0.925)),
        18 * (1 - phase(r, 0.837, 0.863)),
      );
      gsap.set(doorLight, { opacity: Math.sin(Math.PI * phase(r, 0.778, 0.865)) * 0.32 });

      const finalReveal = phase(r, 0.897, 0.949);
      gsap.set(closing, { autoAlpha: finalReveal });
      gsap.set(display, {
        y: height * 0.35 * (1 - finalReveal),
        x: width * 0.12 * (1 - finalReveal),
      });
      copy('closing', phase(r, 0.922, 0.959), 15 * (1 - finalReveal));
      gsap.set(footer, { autoAlpha: phase(r, 0.967, 0.995) });
      footer.inert = r < 0.977;

      const crossing = phase(r, 0.345, 0.447);
      gsap.set(passingLeaves, {
        x: mix(width * 1.1, -width * 1.15, crossing),
        y: height * 0.07 * Math.sin(crossing * Math.PI),
        autoAlpha: phase(r, 0.342, 0.365) * (1 - phase(r, 0.44, 0.46)),
        scale: 1.12,
      });
      gsap.set(rail, { autoAlpha: phase(r, 0.367, 0.432) });
      label.textContent =
        r < 0.62
          ? '04 / MAGIC DRINK DAY'
          : r < 0.915
            ? '05 / WONDERPOP PLAZA'
            : '06 / MAGIC DRINK ORIGINAL';
      root.dataset.worldChapter =
        r < 0.36 ? 'opening' : r < 0.62 ? 'festival' : r < 0.915 ? 'wonderpop' : 'original';
    },
  };
}
