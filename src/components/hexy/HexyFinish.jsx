import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createFilmGrain, createLensMap } from './components/filmGrain';
import styles from './HexyFinish.module.css';

// One optical pass above both the artwork and the UI. Filtering an ancestor of
// the page would change the containing block of its fixed navigation/player.
export default function HexyFinish({ enabled, reduced, intensity = 60, expanded = false, target = null, monochrome = 0, chromatic = 1, settings = null }) {
  const canvas = useRef(null);
  const renderer = useRef(null);
  const [lensMap, setLensMap] = useState('');
  const [viewport, setViewport] = useState({ width: 1, height: 1 });
  const [surface, setSurface] = useState(null);
  const [clip, setClip] = useState('none');
  const amount = intensity / 100;
  const grainOpacity = settings ? settings.grain / 100 * .35 : .08 + amount * .25;
  const vignetteOpacity = settings ? settings.vignette / 100 : .35 + amount * .4;
  const lensOpacity = settings ? (settings.chromatic > 0 ? .2275 : 0) : .14 + amount * .25;
  const registration = settings ? settings.chromatic / 100 * 4.1 : (1.2 + amount) * chromatic;
  const dispersion = settings ? settings.chromatic / 100 * 3.6 : (.8 + amount * 1.6) * chromatic;
  const verticalShift = settings ? settings.chromatic / 100 * .28 : amount * .3 * chromatic;
  // Native dialogs live above the page. Move the same optical pass into the
  // active dialog so its controls receive the common finish, too.
  useEffect(() => { setSurface(target || (expanded ? document.querySelector('[data-listening-room]') : null)); }, [expanded, target]);
  useEffect(() => {
    setLensMap(createLensMap());
    renderer.current = createFilmGrain(canvas.current);
    const sizeLens = () => {
      const { clientWidth: width, clientHeight: height } = canvas.current;
      if (width && height) setViewport(previous => previous.width === width && previous.height === height ? previous : { width, height });
      if (surface) {
        const rect = surface.getBoundingClientRect();
        // A dialog with a CSS filter becomes the fixed canvas's containing
        // block. Measure both boxes in the same space instead of assuming
        // that every optical surface starts at the viewport origin.
        const bounds = canvas.current.getBoundingClientRect();
        const radius = getComputedStyle(surface).borderRadius;
        setClip(`inset(${Math.max(0, rect.top - bounds.top)}px ${Math.max(0, bounds.right - rect.right)}px ${Math.max(0, bounds.bottom - rect.bottom)}px ${Math.max(0, rect.left - bounds.left)}px round ${radius})`);
      } else setClip('none');
    };
    const observer = new ResizeObserver(sizeLens);
    observer.observe(canvas.current);
    if (surface) observer.observe(surface);
    sizeLens();
    return () => { observer.disconnect(); renderer.current?.dispose(); renderer.current = null; };
  }, [surface]);
  useEffect(() => { renderer.current?.update({ enabled: enabled && grainOpacity > 0, reduced }); }, [enabled, reduced, surface, grainOpacity]);
  const finish = <div className={styles.finish} data-hexy-finish data-enabled={enabled} aria-hidden="true"
    style={{ '--finish-clip': clip, '--finish-monochrome': monochrome, '--grain-opacity': grainOpacity, '--lens-opacity': lensOpacity, '--vignette-opacity': vignetteOpacity }}>
    <div className={styles.lens} data-finish-lens data-ready={Boolean(lensMap)} style={{ display: lensOpacity === 0 ? 'none' : undefined }} />
    <canvas ref={canvas} className={styles.grain} data-finish-grain />
    <div className={styles.vignette} data-finish-vignette />
  </div>;
  return <>
    <svg className={styles.definitions} aria-hidden="true" focusable="false">
      <defs>
        <filter id="hexy-film-optics" filterUnits="userSpaceOnUse" x="0" y="0" width={viewport.width} height={viewport.height} colorInterpolationFilters="sRGB">
          <feImage href={lensMap || undefined} x="0" y="0" width={viewport.width} height={viewport.height} preserveAspectRatio="none" result="dispersion" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset in="red" dx={registration} dy={verticalShift} result="redRegistered" />
          <feDisplacementMap in="redRegistered" in2="dispersion" scale={dispersion} xChannelSelector="R" yChannelSelector="G" result="redShift" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
          <feOffset in="blue" dx={-registration} dy={-verticalShift} result="blueRegistered" />
          <feDisplacementMap in="blueRegistered" in2="dispersion" scale={-dispersion} xChannelSelector="R" yChannelSelector="G" result="blueShift" />
          <feBlend in="redShift" in2="green" mode="screen" result="redGreen" />
          <feBlend in="redGreen" in2="blueShift" mode="screen" />
        </filter>
      </defs>
    </svg>
    {surface ? createPortal(finish, surface) : finish}
  </>;
}
