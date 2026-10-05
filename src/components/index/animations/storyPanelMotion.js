import { gsap } from 'gsap';

export function paintStoryPanel(element, opacity) {
  // Let the camera arrive before presenting the next page. The illustrated
  // card has a short cel-like entrance, never a ghost of the coming scene.
  const visible = opacity >= .72;
  if (element.dataset.storyActive !== String(visible)) element.dataset.storyActive = String(visible);
  element.inert = !visible;
  element.setAttribute('aria-hidden', String(!visible));
  gsap.set(element, { autoAlpha: visible ? 1 : 0, y: 0 });
}
