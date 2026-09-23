import { gsap } from 'gsap';

import { FILM_END, FILM_REVEAL } from '../../../data/wonderpopFilm';
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
  const passingLeaves = query('[data-passing-leaves]');
  const gallery = query('[data-world-scene="gallery"]');
  const passage = query('[data-story-transition]');
  const visitors = query('[data-world-scene="visitors"]');
  const interview = query('[data-world-scene="interview"]');
  const farewell = query('[data-world-farewell]');
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
    passingLeaves,
    gallery, passage, visitors, interview, farewell,
    ...copies,
  ].filter(Boolean);

  function copy(name, opacity, y = 0) {
    const element = copies.find((el) => el.dataset.worldCopy === name);
    if (!element) return;
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
        [festival, plaza, gallery, visitors, interview, farewell].filter(Boolean).forEach(el => { el.inert = false; el.removeAttribute('aria-hidden'); });
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

      if (active(FILM_REVEAL, FILM_END + .05)) {
        const opacity = r < FILM_END ? phase(r, FILM_REVEAL, .803) : 0;
        gsap.set(interior, { autoAlpha: opacity });
        interior.inert = opacity < .5;
        interior.setAttribute('aria-hidden', String(interior.inert));
        interior.dataset.worldActive = String(opacity > 0 && !document.hidden);
      }

      const ending = phase(r, JOURNEY_END - .125, JOURNEY_END - .045);
      [[interview, FILM_END, JOURNEY_END + .01]].forEach(([element, from, to]) => {
        const visible = r >= from && r < to;
        gsap.set(element, { autoAlpha: visible ? 1 : 0 });
        element.inert = !visible || (element === interview && ending > .5);
        element.setAttribute('aria-hidden', String(element.inert));
        element.dataset.worldActive = String(visible && !document.hidden);
      });
      copy('interview', phase(r, FILM_END + .02, FILM_END + .06) * (1 - ending));
      gsap.set(farewell, { autoAlpha: ending, y: 16 * (1 - ending) });
      farewell.inert = ending < .5;
      farewell.setAttribute('aria-hidden', String(ending < .5));
      // A golden shop pendant approaches the lens and fully covers each cut.
      // The same reversible crossing works when scrolling back to a scene.
      const cut = [FILM_END].find(value => Math.abs(r - value) < .024);
      if (cut !== undefined) {
        const p = clamp((r - cut + .024) / .048);
        const cover = phase(p, 0, .16) * (1 - phase(p, .65, 1));
        gsap.set(passage, { xPercent: -50, yPercent: -50, x: width * .32 * (1 - phase(p, 0, .45)), y: -height * .32 * (1 - phase(p, 0, .45)), scale: mix(.02, 9, phase(p, 0, .55)), rotation: mix(-12, 20, p), autoAlpha: cover });
      } else gsap.set(passage, { autoAlpha: 0 });

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
        r < .36 ? 'opening' : r < .62 ? 'festival' : r < .86 ? 'wonderpop' : r < FILM_END ? 'film' : r < JOURNEY_END - .09 ? 'interview' : 'farewell';
      previous = r;
    },
  };
}
