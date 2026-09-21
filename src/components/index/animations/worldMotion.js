import { gsap } from 'gsap';

import { JOURNEY_END } from '../../../data/journeyChapters';

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
  const ground = query('[data-world-ground]');
  const festival = query('[data-world-scene="festival"]');
  const courtyard = query('[data-courtyard]');
  const rig = query('[data-festival-rig]');
  const audience = [...root.querySelectorAll('[data-audience-row]')];
  const airship = query('[data-airship]');
  const plaza = query('[data-world-scene="plaza"]');
  const garden = query('[data-garden-world]');
  const canopyVeil = query('[data-canopy-veil]');
  const interior = query('[data-world-interior]');
  const atriumWorld = query('[data-atrium-world]');
  const atrium = query('[data-atrium]');
  const entrance = query('[data-atrium-entrance]');
  const pendants = query('[data-pendants]');
  const insideLeaves = query('[data-inside-leaves]');
  const closing = query('[data-world-scene="closing"]');
  const display = query('[data-closing-display]');
  const passingLeaves = query('[data-passing-leaves]');
  const footer = query('[data-world-footer]');
  const life = query('[data-atrium-life]');
  const friends = query('[data-atrium-friends]');
  const nearFriends = query('[data-atrium-near]');
  const piers = [...root.querySelectorAll('[data-atrium-pier]')];
  const gallery = query('[data-world-scene="gallery"]');
  const galleryPlane = query('[data-gallery-plane]');
  const galleryDecor = query('[data-gallery-decor]');
  const passage = query('[data-plaza-passage]');
  const copies = [...root.querySelectorAll('[data-world-copy]')];
  let previous = null;
  let viewport = '';
  const animated = [
    opening,
    ground,
    festival,
    courtyard,
    rig,
    ...audience,
    airship,
    plaza,
    canopyVeil,
    interior,
    atriumWorld,
    atrium,
    entrance,
    pendants,
    insideLeaves,
    closing,
    display,
    passingLeaves,
    footer,
    life, friends, nearFriends, ...piers, gallery, galleryPlane, galleryDecor, passage,
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
      garden.gardenState = { progress: r, width, height, reduced };
      garden.dispatchEvent(new CustomEvent('garden:camera', { detail: garden.gardenState }));
      root.dispatchEvent(new CustomEvent('journey:scene', { detail: garden.gardenState }));
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
          x: -width * 0.035 * concertTravel,
          y: 0,
          scale: 1,
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
        const throughDoor = garden.dataset.renderer === 'webgl';
        gsap.set(plaza, { autoAlpha: phase(r, 0.613, 0.619) * (1 - phase(r, throughDoor ? 0.852 : 0.817, 0.858)) });
        plaza.dataset.worldActive = String(r > 0.6 && r < 0.86 && !document.hidden);
        copy('plaza', phase(r, 0.642, 0.667) * (1 - phase(r, 0.711, 0.742)), -30 * walk);
      }

      if (active(0.78, 1.12)) {
        const indoors = phase(r, 0.785, 0.803);
        const indoorTravel = phase(r, 0.84, 0.96);
        const turn = phase(r, 1.01, 1.075);
        gsap.set(interior, { autoAlpha: r < 1.075 ? indoors : 0 });
        interior.dataset.worldActive = String(r > 0.79 && r < 1.075 && !document.hidden);
        // One room image covers the whole aperture. Its bottom stays beyond the
        // viewport while approaching, so no second floor/background is exposed.
        const threshold = phase(r, .815, .854);
        gsap.set(atriumWorld, {
          scale: 1 + .085 * threshold + .075 * indoorTravel + .06 * turn,
          x: -width * .075 * turn,
          y: -height * .025 * (1 - phase(r, .845, .878)) * threshold,
        });
        gsap.set(atrium, { scale: 1 });
        gsap.set(entrance, { scale: 1 + 1.35 * phase(r, .85, .903), autoAlpha: 1 - phase(r, .885, .906) });
        gsap.set(pendants, { scale: 1 + 0.23 * indoorTravel, y: -height * 0.045 * indoorTravel });
        gsap.set(insideLeaves, { scale: 1 + 0.34 * indoorTravel, x: width * 0.09 * indoorTravel });
        copy('interior', phase(r, 0.86, 0.875) * (1 - phase(r, 0.897, 0.925)), 0);
        gsap.set(life, { autoAlpha: phase(r, .865, .9) * (1 - phase(r, 1.04, 1.073)) });
        life.inert = r < .88 || r >= 1.065;
        life.setAttribute('aria-hidden', String(life.inert));
        gsap.set(friends, { scale: 1 + .05 * indoorTravel, x: -width * .05 * turn, transformOrigin: '50% 60%' });
        gsap.set(nearFriends, { x: -width * .26 * turn, scale: 1 + .08 * indoorTravel, transformOrigin: '15% 95%' });
        piers.forEach((pier, i) => gsap.set(pier, { x: (i ? 1 : -1) * width * .07 * indoorTravel - width * .22 * turn, scale: 1 + .12 * indoorTravel }));
      }

      if (active(0.89, 1.12)) {
        const finalReveal = phase(r, 0.903, 0.952);
        const leave = phase(r, 1.025, 1.065);
        gsap.set(closing, { autoAlpha: finalReveal * (1 - leave) });
        closing.dataset.worldActive = String(r > 0.89 && r < 1.075 && !document.hidden);
        gsap.set(display, {
          scale: 1,
          y: height * 0.025 * (1 - finalReveal),
          x: -width * .06 * leave,
        });
        copy('closing', phase(r, 0.922, 0.959) * (1 - leave), 10 * (1 - finalReveal));
      }

      if (active(1, JOURNEY_END)) {
        // The near pier covers the cut; reverse scrolling retraces the crossing.
        const travel = phase(r, 1.04, 1.11);
        gsap.set(passage, { x: mix(Math.max(width, height) * 2.3, -Math.max(width, height) * 2.3, travel), autoAlpha: phase(r, 1.025, 1.04) * (1 - phase(r, 1.11, 1.125)) });
        gsap.set(gallery, { autoAlpha: r >= 1.075 ? 1 : 0 });
        gallery.dataset.worldActive = String(r >= 1.075 && !document.hidden);
        const arrive = phase(r, 1.075, 1.2);
        gsap.set(galleryPlane, { scale: 1.035 + .025 * arrive, x: width * .015 * (1 - arrive), transformOrigin: '50% 65%' });
        gsap.set(galleryDecor, { x: -width * .02 * arrive, scale: 1 + .06 * arrive, transformOrigin: '50% 95%' });
        copy('gallery', phase(r, 1.095, 1.145), 14 * (1 - arrive));
        gsap.set(footer, { autoAlpha: phase(r, 1.355, 1.395) });
        footer.inert = r < 1.375;
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
      }
      root.dataset.worldChapter =
        r < .36 ? 'opening' : r < .62 ? 'festival' : r < .86 ? 'wonderpop' : r < 1.075 ? 'atrium' : 'gallery';
      previous = r;
    },
  };
}
