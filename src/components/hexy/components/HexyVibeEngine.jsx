/**
 * HexyVibeEngine — motor de animaciones GSAP activo mientras el reproductor suena.
 * Se monta/desmonta en función del atom isHexyPlaying.
 */
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from '../css/hexyVibeEngine.module.css';

const SYMBOLS = ['✦', '♪', '♫', '✧', '★', '♬', '✿', '◆', '❋', '⋆'];
const COLORS  = ['#FF6AD7', '#AA37F2', '#82D2FF', '#F9F871', '#98FFDE', '#FF6AD7', '#AA37F2'];
const COUNT   = 38;

export default function HexyVibeEngine() {
  const engineRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('hexy-playing');

    const engine   = engineRef.current;
    const particles = [];
    const animations = new Set();
    let disposed = false;

    // ── 1. Lluvia de partículas desde el fondo ──────────────────────────
    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('span');
      el.textContent = SYMBOLS[i % SYMBOLS.length];
      Object.assign(el.style, {
        position:     'fixed',
        left:         '0',
        top:          '0',
        pointerEvents:'none',
        userSelect:   'none',
        zIndex:       '9998',
        fontSize:     `${0.9 + Math.random() * 1.8}rem`,
        color:         COLORS[i % COLORS.length],
        textShadow:   '0 0 10px currentColor, 0 0 22px currentColor',
        willChange:   'transform, opacity',
        fontStyle:    'normal',
      });
      engine.appendChild(el);
      particles.push(el);

      const launch = () => {
        if (disposed) return;
        gsap.set(el, {
          x:        Math.random() * window.innerWidth,
          y:        window.innerHeight + 30,
          opacity:  0,
          scale:    0.4 + Math.random() * 0.4,
          rotation: Math.random() * 360,
        });

        const tl = gsap.timeline({ delay: Math.random() * 5, onComplete: () => {
          animations.delete(tl);
          launch();
        } });
        animations.add(tl);

        tl.to(el, {
          opacity:  0.95,
          duration: 0.45,
          ease:     'back.out(1.5)',
        })
          .to(el, {
            y:        `-=${180 + Math.random() * window.innerHeight * 0.75}`,
            x:        `+=${(Math.random() - 0.5) * 220}`,
            rotation: `+=${(Math.random() - 0.5) * 240}`,
            scale:    0.9 + Math.random() * 0.7,
            duration: 3.5 + Math.random() * 4.5,
            ease:     'power1.out',
          }, 0)
          .to(el, {
            opacity:  0,
            duration: 1.1,
            ease:     'power2.in',
          }, '-=1.3');
      };

      launch();
    }

    // ── 2. Aurora blobs drifting ────────────────────────────────────────
    if (engine) {
      const blobEls = Array.from(engine.querySelectorAll('[data-blob]'));

      const driftBlob = (blob) => {
        if (disposed) return;
        const tween = gsap.to(blob, {
          x:        (Math.random() - 0.5) * 640,
          y:        (Math.random() - 0.5) * 420,
          duration: 5 + Math.random() * 6,
          ease:     'sine.inOut',
          onComplete: () => { animations.delete(tween); driftBlob(blob); },
        });
        animations.add(tween);
      };

      blobEls.forEach(blob => driftBlob(blob));

      // ── 3. Edge glow pulse ──────────────────────────────────────────
      const edgeEl = engine.querySelector('[data-edge]');
      if (edgeEl) {
        gsap.to(edgeEl, {
          opacity:  0.85,
          duration: 1.3,
          repeat:   -1,
          yoyo:     true,
          ease:     'sine.inOut',
        });
      }

      // ── 4. Beat flash ───────────────────────────────────────────────
      const flashEl = engine.querySelector('[data-flash]');
      if (flashEl) {
        const flashTl = gsap.timeline({ repeat: -1, delay: 0.9 });
        animations.add(flashTl);
        flashTl
          .to(flashEl, { opacity: 0.10, duration: 0.07, ease: 'power4.in' })
          .to(flashEl, { opacity: 0,    duration: 0.40, ease: 'power2.out' })
          .to({},       { duration: 1.7 }); // pausa entre flashes
      }
    }

    return () => {
      disposed = true;
      animations.forEach(animation => animation.kill());
      animations.clear();
      document.body.classList.remove('hexy-playing');

      // Matar y remover partículas
      particles.forEach(el => {
        gsap.killTweensOf(el);
        el.remove();
      });

      // Matar blobs / edge / flash
      if (engine) {
        const blobEls = engine.querySelectorAll('[data-blob]');
        blobEls.forEach(b => gsap.killTweensOf(b));

        const edgeEl  = engine.querySelector('[data-edge]');
        const flashEl = engine.querySelector('[data-flash]');
        if (edgeEl)  gsap.killTweensOf(edgeEl);
        if (flashEl) gsap.killTweensOf(flashEl);
      }
    };
  }, []);

  return (
    <div ref={engineRef} className={styles.engine} aria-hidden="true">
      <div data-blob className={styles.blob1} />
      <div data-blob className={styles.blob2} />
      <div data-blob className={styles.blob3} />
      <div data-edge className={styles.edgeGlow} />
      <div data-flash className={styles.flash} />
    </div>
  );
}
