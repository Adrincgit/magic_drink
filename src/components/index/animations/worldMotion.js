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
  const crowd = query('[data-crowd]');
  const crowdMiddle = query('[data-crowd-middle]');
  const crowdFar = query('[data-crowd-far]');
  const plaza = query('[data-world-scene="plaza"]');
  const gardenFar = query('[data-approach-garden="far"]');
  const gardenNear = query('[data-approach-garden="near"]');
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
    crowd,
    crowdMiddle,
    crowdFar,
    plaza,
    gardenFar,
    gardenNear,
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
    render(r, width, height, openingX, reduced) {
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
      const walk = phase(r, 0.625, 0.79);
      if (active(0.34, 0.86)) {
        gsap.set(ground, {
          autoAlpha: phase(r, 0.35, 0.44) * (1 - phase(r, 0.79, 0.85)),
          scale: 1 + 0.42 * walk,
          transformOrigin: '50% 60%',
          y: height * 0.06 * walk,
        });
      }
      const concertTravel = phase(r, 0.422, 0.595);
      if (active(0.34, 0.66)) {
        const arrive = phase(r, 0.382, 0.416);
        const festivalExit = phase(r, 0.607, 0.641);
        gsap.set(festival, { autoAlpha: arrive * (1 - festivalExit) });
        // Environment, pavilion and each audience plane pass the camera at
        // different speeds; the DJ never moves independently of the platform.
        gsap.set(courtyard, {
          x: -width * 0.04 * concertTravel,
          y: height * (mobile ? 0.14 : 0.015),
          scale: 1.025,
          transformOrigin: '68% 70%',
        });
        gsap.set(rig, {
          x: -width * (mobile ? 0.025 : 0.11) * concertTravel,
          y: height * ((mobile ? 0.14 : 0.015) + 0.035 * concertTravel),
          scale: 0.94 + 0.14 * concertTravel,
        });
        gsap.set(crowdFar, {
          x: -width * 0.08 * concertTravel,
          scale: 0.94 + 0.12 * concertTravel,
          y: height * 0.025 * concertTravel,
        });
        gsap.set(crowdMiddle, {
          x: -width * 0.14 * concertTravel,
          scale: 1 + 0.17 * concertTravel,
          y: height * 0.07 * concertTravel,
        });
        gsap.set(crowd, {
          x: -width * 0.25 * concertTravel,
          scale: 1 + 0.23 * concertTravel,
          y: height * 0.1 * concertTravel,
        });
        festival.dataset.worldActive = String(r > 0.34 && r < 0.66 && !document.hidden);
        copy('festival', phase(r, 0.43, 0.46) * (1 - phase(r, 0.566, 0.597)), -22 * festivalExit);
      }

      // The landmark moves into view behind the concert, then centers on the
      // entrance axis while foreground leaves conceal the change of direction.
      if (r > OPENING_END && active(0.36, 0.86)) {
        const baseHeight = height * 0.95;
        const baseWidth = (baseHeight * 2) / 3;
        const approach = phase(r, 0.36, 0.465);
        const festivalScale = 0.89;
        const festivalLeft =
          width * mix(0.7, 0.55, concertTravel) - baseWidth * festivalScale * 0.5;
        const approachLeft = width * 0.5 - baseWidth * 0.64 * 0.5;
        const turn = phase(r, 0.581, 0.651);
        const exteriorScale = mix(mix(1, festivalScale, approach), 0.64, turn);
        const exteriorLeft = mix(
          mix(height * 2.4 + openingX * 0.88, festivalLeft, approach),
          approachLeft,
          turn,
        );
        const exteriorTop = mix(
          mix(-height * 0.099, -height * 0.17, approach),
          height * 0.31,
          turn,
        );
        const advance = phase(r, 0.655, 0.745);
        const door = phase(r, 0.739, 0.846);
        const zoom = 1 + 0.22 * advance + 4.8 * door;
        const scale = exteriorScale * zoom;
        const left = exteriorLeft - baseWidth * exteriorScale * 0.5 * (zoom - 1);
        const top =
          exteriorTop - baseHeight * exteriorScale * 0.8 * (zoom - 1) - height * 0.14 * door;
        gsap.set(landmark, {
          scale,
          x: left - height * 2.4 * scale,
          y: top + height * 0.09 * scale,
          transformOrigin: '0 0',
          autoAlpha: 1 - phase(r, 0.8, 0.853),
        });
      }
      if (active(0.59, 0.86)) {
        gsap.set(plaza, { autoAlpha: phase(r, 0.602, 0.644) * (1 - phase(r, 0.801, 0.855)) });
        gsap.set(gardenFar, { scale: 0.76 + 0.74 * walk, y: height * 0.1 * walk });
        gsap.set(gardenNear, { scale: 0.86 + 1.4 * walk, y: height * 0.19 * walk });
        const passArch = phase(r, 0.614, 0.74);
        gsap.set(arch, { scale: 0.72 + 3.9 * passArch, autoAlpha: 1 - phase(r, 0.748, 0.778) });
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
        gsap.set(doorLight, { opacity: Math.sin(Math.PI * phase(r, 0.788, 0.87)) * 0.28 });
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
        const secondPass = r > 0.52;
        const crossing = secondPass ? phase(r, 0.565, 0.663) : phase(r, 0.345, 0.447);
        const cover = secondPass
          ? phase(r, 0.56, 0.585) * (1 - phase(r, 0.657, 0.68))
          : phase(r, 0.342, 0.365) * (1 - phase(r, 0.44, 0.46));
        gsap.set(passingLeaves, {
          x: secondPass
            ? mix(-width * 1.15, width * 1.1, crossing)
            : mix(width * 1.1, -width * 1.15, crossing),
          y: height * 0.07 * Math.sin(crossing * Math.PI),
          autoAlpha: cover,
          scale: 1.12,
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
