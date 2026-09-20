import { gsap } from 'gsap';

export const OPENING_END = 0.36;
const clamp = (n) => Math.max(0, Math.min(1, n));
const mix = (a, b, p) => a + (b - a) * p;
const phase = (p, a, b) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// All chapters share this one viewport. Every group uses a common vanishing
// point, and the DJ is a child of the pavilion's coordinate system.
export function createWorldDirector(root) {
  const query = (selector) => root.querySelector(selector);
  const opening = query('[data-opening]');
  const openingNav = query('[data-opening-navigation]');
  const landmark = query('[data-depth="plaza"]');
  const ground = query('[data-world-ground]');
  const festival = query('[data-world-scene="festival"]');
  const courtyard = query('[data-courtyard]');
  const rig = query('[data-festival-rig]');
  const audience = [...root.querySelectorAll('[data-audience-row]')];
  const crowdFar = query('[data-crowd-far]');
  const airship = query('[data-airship]');
  const plaza = query('[data-world-scene="plaza"]');
  const terrain = query('[data-garden-terrain]');
  const gardenFar = query('[data-approach-garden="far"]');
  const trees = [...root.querySelectorAll('[data-garden-tree]')];
  const canopyVeil = query('[data-canopy-veil]');
  const arch = query('[data-approach-arch]');
  const interior = query('[data-world-interior]');
  const atriumWorld = query('[data-atrium-world]');
  const atrium = query('[data-atrium]');
  const atriumGarden = query('[data-atrium-garden]');
  const atriumBar = query('[data-atrium-bar]');
  const pendants = query('[data-pendants]');
  const insideLeaves = query('[data-inside-leaves]');
  const closing = query('[data-world-scene="closing"]');
  const display = query('[data-closing-display]');
  const passingLeaves = query('[data-passing-leaves]');
  const doorLight = query('[data-door-light]');
  const footer = query('[data-world-footer]');
  const rail = query('[data-world-rail]');
  const label = query('[data-world-label]');
  const copies = [...root.querySelectorAll('[data-world-copy]')];
  let previous = null;
  let viewport = '';
  const animated = [
    opening,
    openingNav,
    ground,
    festival,
    courtyard,
    rig,
    ...audience,
    crowdFar,
    airship,
    plaza,
    landmark,
    terrain,
    gardenFar,
    ...trees,
    canopyVeil,
    arch,
    interior,
    atriumWorld,
    atrium,
    atriumGarden,
    atriumBar,
    pendants,
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
    render(r, width, height, reduced) {
      if (reduced) {
        animated.forEach((element) => gsap.set(element, { clearProps: 'all' }));
        copies.forEach((element) => {
          element.inert = false;
          element.removeAttribute('aria-hidden');
        });
        footer.inert = false;
        previous = null;
        return;
      }
      const mobile = width <= 700;
      if (viewport !== `${width}:${height}`) previous = null;
      viewport = `${width}:${height}`;
      // Update visible planes and give a departing group one last update.
      const active = (a, b) =>
        previous === null || (Math.min(r, previous) <= b && Math.max(r, previous) >= a);
      if (active(0, 0.44)) {
        const handoff = phase(r, 0.355, 0.435);
        gsap.set(opening, {
          y: -height * 0.07 * handoff,
          x: -width * 0.03 * handoff,
          scale: 1 + 0.3 * handoff,
          autoAlpha: 1 - phase(r, 0.38, 0.408),
        });
        gsap.set(openingNav, { autoAlpha: 1 - phase(r, 0.335, 0.365) });
      }
      const walk = phase(r, 0.635, 0.795);
      if (active(0.34, 0.86)) {
        gsap.set(ground, {
          autoAlpha: phase(r, 0.35, 0.44) * (1 - phase(r, 0.613, 0.619)),
          scale: 1,
          transformOrigin: '50% 60%',
          y: 0,
        });
      }
      const concertTravel = phase(r, 0.422, 0.595);
      if (active(0.34, 0.66)) {
        const arrive = phase(r, 0.382, 0.416);
        const festivalExit = phase(r, 0.613, 0.619);
        gsap.set(festival, { autoAlpha: arrive * (1 - festivalExit) });
        // Environment, pavilion and each audience plane pass the camera at
        // different speeds; the DJ never moves independently of the platform.
        gsap.set(courtyard, {
          x: -width * 0.015 * concertTravel,
          y: height * (mobile ? 0.14 : 0.015),
          scale: 1.04,
          transformOrigin: '50% 70%',
        });
        gsap.set(rig, {
          x: -width * 0.018 * concertTravel,
          y: height * ((mobile ? 0.14 : 0.015) + 0.035 * concertTravel),
          scale: 0.98 + 0.08 * concertTravel,
        });
        gsap.set(crowdFar, {
          x: -width * 0.028 * concertTravel,
          scale: 1 + 0.06 * concertTravel,
          y: height * 0.015 * concertTravel,
        });
        audience.forEach((row, i) => gsap.set(row, {
          x: -width * (0.045 + i * 0.047) * concertTravel,
          scale: 1 + (0.045 + i * 0.034) * concertTravel,
          y: height * (0.008 + i * 0.018) * concertTravel,
        }));
        gsap.set(airship, {
          x: -width * 0.04 * concertTravel,
          y: -height * 0.02 * concertTravel,
        });
        festival.dataset.worldActive = String(r > 0.34 && r < 0.66 && !document.hidden);
        copy('festival', phase(r, 0.43, 0.46) * (1 - phase(r, 0.566, 0.597)), -22 * festivalExit);
      }

      // Reveal a new, already centered view under an opaque canopy. Its camera
      // only advances: the building never shrinks or slides in from the concert.
      if (active(0.59, 0.86)) {
        const door = phase(r, 0.752, 0.846);
        gsap.set(plaza, { autoAlpha: phase(r, 0.613, 0.619) * (1 - phase(r, 0.815, 0.853)) });
        plaza.dataset.worldActive = String(r > 0.6 && r < 0.86 && !document.hidden);
        gsap.set(landmark, {
          x: 0, y: -height * 0.19 * door,
          scale: 1 + 0.5 * walk + 7 * door,
          transformOrigin: '50% 74%',
        });
        gsap.set(terrain, { scale: 1 + 0.5 * walk + 0.65 * door, transformOrigin: '50% 76%' });
        gsap.set(gardenFar, { scale: 1.1 + 1.3 * walk + 2 * door, y: height * 0.15 * walk });
        trees.forEach(tree => {
          const near = tree.dataset.treeDistance === 'near';
          const side = tree.dataset.gardenTree === 'left' ? -1 : 1;
          gsap.set(tree, {
            x: side * height * (near ? 0.8 : 0.36) * walk,
            y: height * (near ? 0.18 : 0.06) * walk,
            scale: 1 + (near ? 1.1 : 0.65) * walk + 2 * door,
          });
        });
        const passArch = phase(r, 0.614, 0.71);
        gsap.set(arch, { scale: 1.5 + 3.9 * passArch, autoAlpha: 1 - phase(r, 0.7, 0.74) });
        copy('plaza', phase(r, 0.642, 0.667) * (1 - phase(r, 0.711, 0.742)), -30 * walk);
      }

      if (active(0.78, 1)) {
        const indoors = phase(r, 0.8, 0.858);
        const indoorTravel = phase(r, 0.811, 1);
        gsap.set(interior, { autoAlpha: indoors });
        interior.dataset.worldActive = String(r > 0.79 && !document.hidden);
        // Shared zoom and common vanishing point keep every object grounded.
        gsap.set(atriumWorld, {
          scale: 1.01 + 0.12 * indoorTravel,
          x: -width * 0.022 * indoorTravel,
        });
        gsap.set(atrium, { scale: 1.03 + 0.025 * indoorTravel });
        gsap.set(atriumGarden, { scale: 1.03 + 0.065 * indoorTravel });
        gsap.set(atriumBar, { scale: 1.03 + 0.1 * indoorTravel });
        gsap.set(pendants, { scale: 1 + 0.23 * indoorTravel, y: -height * 0.045 * indoorTravel });
        gsap.set(insideLeaves, { scale: 1 + 0.34 * indoorTravel, x: width * 0.09 * indoorTravel });
        copy('interior', phase(r, 0.844, 0.867) * (1 - phase(r, 0.895, 0.92)), 0);
        // Warm entrance light hides the exterior/interior dissolve at the door.
        const light = phase(r, 0.8, 0.827) * (1 - phase(r, 0.837, 0.869));
        gsap.set(doorLight, { opacity: light });
      }

      if (active(0.89, 1)) {
        const finalReveal = phase(r, 0.903, 0.952);
        gsap.set(closing, { autoAlpha: finalReveal });
        closing.dataset.worldActive = String(r > 0.89 && !document.hidden);
        gsap.set(display, {
          scale: 0.82 + 0.18 * finalReveal,
          y: height * 0.055 * (1 - finalReveal),
          x: 0,
        });
        copy('closing', phase(r, 0.922, 0.959), 10 * (1 - finalReveal));
        gsap.set(footer, { autoAlpha: phase(r, 0.967, 0.995) });
        footer.inert = r < 0.977;
      }

      if (active(0.34, 0.69)) {
        const crossing = phase(r, 0.345, 0.447);
        const cover = phase(r, 0.342, 0.365) * (1 - phase(r, 0.44, 0.46));
        gsap.set(passingLeaves, {
          x: mix(width * 1.1, -width * 1.15, crossing),
          y: height * 0.07 * Math.sin(crossing * Math.PI),
          autoAlpha: cover,
          scale: 1.12,
        });
        const canopyTravel = phase(r, 0.565, 0.667);
        gsap.set(canopyVeil, {
          x: mix(Math.max(width * 2.3, height * 2.5), -Math.max(width * 2.3, height * 2.5), canopyTravel),
          xPercent: -50, yPercent: -50,
          autoAlpha: phase(r, 0.56, 0.575) * (1 - phase(r, 0.662, 0.68)),
        });
        gsap.set(rail, { autoAlpha: phase(r, 0.367, 0.432) });
      }
      const nextLabel =
        r < 0.62
          ? '04 / MAGIC DRINK DAY'
          : r < 0.915
            ? '05 / WONDERPOP PLAZA'
            : '06 / MAGIC DRINK ORIGINAL';
      if (label.textContent !== nextLabel) label.textContent = nextLabel;
      root.dataset.worldChapter =
        r < 0.36 ? 'opening' : r < 0.62 ? 'festival' : r < 0.915 ? 'wonderpop' : 'original';
      previous = r;
    },
  };
}
