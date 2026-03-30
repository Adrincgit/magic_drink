import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { isEnglish, isDarkMode } from '../../../data/variables';
import { magicDrinkFlavors } from '../../../data/magicDrinkFlavors';
import styles from '../css/bebidasSeccion1.module.css';

const getText = (v, eng) => (typeof v === 'string' ? v : eng ? v.en : v.es);

const content = {
  es: { badge: '6 sabores oficiales', cta: 'Conoce este sabor' },
  en: { badge: '6 official flavors', cta: 'Meet this flavor' },
};

/* ═══════════════════════════════════════════
   PARTICLE SVG SHAPES (24x24 viewBox)
   ═══════════════════════════════════════════ */
const S = {
  star: (c) => <path d="M12 2l3 7.4h7.8l-6.3 4.6 2.4 7.4L12 17l-6.9 4.4 2.4-7.4L1.2 9.4H9z" fill={c} strokeLinejoin="round" />,
  heart: (c) => <path d="M12 21l-1.4-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.5z" fill={c} />,
  dot: (c) => <circle cx="12" cy="12" r="7" fill={c} />,
  banana: (c) => <path d="M6 19c0-6.5 3.5-13 11-13-.8 2.8-.8 7.5 1.8 10.2C16 17 11 19 6 19z" fill={c} />,
  exclamation: (c) => <><rect x="10" y="3" width="4" height="12" rx="2" fill={c} /><circle cx="12" cy="19.5" r="2.5" fill={c} /></>,
  bubble: (c) => <><circle cx="12" cy="12" r="10" fill={c} opacity="0.45" /><circle cx="8" cy="7" r="2.5" fill="#fff" opacity="0.4" /></>,
  bubbleFace: (c) => <><circle cx="12" cy="12" r="10" fill={c} opacity="0.5" /><circle cx="8" cy="7" r="2.2" fill="#fff" opacity="0.35" /><circle cx="9" cy="11" r="1.2" fill="#4a2040" /><circle cx="15" cy="11" r="1.2" fill="#4a2040" /><path d="M9 15.5q3 2.5 6 0" fill="none" stroke="#4a2040" strokeWidth="1.2" strokeLinecap="round" /></>,
  serpentina: (c) => <path d="M2 12c3-5 5-5 8 0s5 5 8 0" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" />,
  clawMark: (c) => <><line x1="5" y1="3" x2="9" y2="21" stroke={c} strokeWidth="2.5" strokeLinecap="round" /><line x1="10.5" y1="2" x2="14.5" y2="20" stroke={c} strokeWidth="2.5" strokeLinecap="round" /><line x1="16" y1="3" x2="20" y2="21" stroke={c} strokeWidth="2.5" strokeLinecap="round" /></>,
  grape: (c) => <><circle cx="9" cy="8" r="3.5" fill={c} /><circle cx="15" cy="8" r="3.5" fill={c} /><circle cx="12" cy="13" r="3.5" fill={c} /><circle cx="7" cy="13" r="3.5" fill={c} /><circle cx="17" cy="13" r="3.5" fill={c} /><line x1="12" y1="1" x2="12" y2="5" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" /></>,
  musicNote: (c) => <><circle cx="8" cy="18" r="3.5" fill={c} /><rect x="11" y="4" width="2.2" height="14" rx="1" fill={c} /><path d="M13.2 4c2.5-.8 5.5 0 5.5 2.8s-2.5 3-5.5 2" fill={c} /></>,
  sparkle4: (c) => <path d="M12 2L13.8 9.2 21 12 13.8 14.8 12 22 10.2 14.8 3 12 10.2 9.2z" fill={c} />,
  magicWand: (c) => <><line x1="3" y1="21" x2="16" y2="6" stroke={c} strokeWidth="2" strokeLinecap="round" /><path d="M16 6l1.5 4 4-1.5z" fill={c} /><circle cx="19.5" cy="3" r="1.3" fill={c} /><circle cx="22" cy="5.5" r="0.8" fill={c} /></>,
  spiral: (c) => <path d="M12 21c-5 0-9-4-9-9s4-9 9-9c3.5 0 6.5 2.5 7.5 5.5" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" />,
  kiwi: (c) => <><ellipse cx="12" cy="12" rx="10" ry="10.5" fill={c} /><ellipse cx="12" cy="12" rx="4.5" ry="5" fill="#8BC34A" opacity="0.65" /><circle cx="10" cy="9" r="1" fill="#3E2723" opacity="0.55" /><circle cx="14" cy="9" r="1" fill="#3E2723" opacity="0.55" /><circle cx="9" cy="13" r="1" fill="#3E2723" opacity="0.55" /><circle cx="15" cy="13" r="1" fill="#3E2723" opacity="0.55" /><circle cx="12" cy="16" r="1" fill="#3E2723" opacity="0.55" /></>,
  witchHat: (c) => <path d="M12 1l-6 13h12L12 1zM4 14.5c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5H4z" fill={c} />,
  wave: (c) => <path d="M1 12c3-5 5-5 8 0s5 5 8 0 5-5 8 0" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />,
};

/* ═══════════════════════════════════════════
   FLAVOR CONFIGS
   bg: background style (solid or gradient)
   p: [type, color, count, minSize, maxSize]
   ti: title icons [type, color]
   tc: text color (default white)
   ═══════════════════════════════════════════ */
const FC = {
  'magic-original': {
    bg: '#AA37F2',
    p: [
      ['star', '#F9F871', 4, 22, 38], ['star', '#82D2FF', 3, 18, 32],
      ['heart', '#FF6AD7', 3, 16, 28], ['dot', '#F9F871', 2, 10, 16], ['dot', '#FF6AD7', 2, 10, 16],
    ],
    ti: [['star', '#F9F871'], ['heart', '#FF6AD7']],
  },
  'banana-drama': {
    bg: '#FFE066',
    tc: '#5D3800',
    p: [
      ['banana', '#D4930D', 4, 22, 38], ['star', '#E67E00', 4, 18, 32],
      ['exclamation', '#D4930D', 3, 16, 26], ['dot', '#E67E00', 3, 8, 14],
    ],
    ti: [['banana', '#D4930D'], ['star', '#E67E00']],
  },
  'bubble-tape': {
    bg: '#FF6AD7',
    p: [
      ['bubble', '#FFB6E1', 3, 26, 42], ['bubbleFace', '#E8A0D0', 3, 30, 46],
      ['bubble', '#C77DBA', 3, 20, 34], ['serpentina', '#FF1493', 3, 32, 48],
      ['dot', '#FFB6E1', 2, 8, 14],
    ],
    ti: [['bubble', '#FFB6E1'], ['bubbleFace', '#E8A0D0']],
  },
  'dragon-grape': {
    bg: 'linear-gradient(180deg, #9B4DCA 0%, #C0392B 100%)',
    p: [
      ['clawMark', '#FF4444', 3, 24, 38], ['grape', '#8E44AD', 3, 26, 40],
      ['musicNote', '#FF6AD7', 3, 22, 34], ['sparkle4', '#FFD700', 3, 14, 24],
    ],
    ti: [['grape', '#8E44AD'], ['musicNote', '#FF6AD7']],
  },
  'sparkle-soda': {
    bg: 'linear-gradient(180deg, #82D2FF 0%, #FF6AD7 100%)',
    tc: '#1A3C5A',
    p: [
      ['sparkle4', '#FFFFFF', 5, 14, 28], ['star', '#F9F871', 3, 18, 30],
      ['magicWand', '#E8D5F5', 2, 28, 40], ['bubble', '#FFFFFF', 3, 18, 28],
    ],
    ti: [['sparkle4', '#fff'], ['magicWand', '#E8D5F5']],
  },
  'witchy-kiwi': {
    bg: 'linear-gradient(180deg, #7ED957 0%, #1B5E20 100%)',
    p: [
      ['wave', '#98FFDE', 3, 32, 48], ['spiral', '#B2FF59', 3, 26, 38],
      ['kiwi', '#558B2F', 3, 24, 36], ['witchHat', '#4A148C', 3, 22, 32],
    ],
    ti: [['kiwi', '#558B2F'], ['witchHat', '#4A148C']],
  },
};

/* ═══════════════════════════════════════════
   PARTICLE GENERATOR
   ═══════════════════════════════════════════ */
const genParticles = (slug) => {
  const c = FC[slug];
  if (!c) return [];
  const out = [];
  let id = 0;
  for (const [type, color, count, mn, mx] of c.p) {
    for (let i = 0; i < count; i++) {
      out.push({
        id: id++, type, color,
        size: mn + Math.random() * (mx - mn),
        x: 5 + Math.random() * 88,
        y: 5 + Math.random() * 80,
        delay: Math.random() * 5,
        dur: 6 + Math.random() * 8,
      });
    }
  }
  return out;
};

/* ═══════════════════════════════════════════
   CAN ANIMATION VARIANTS
   ═══════════════════════════════════════════ */
const canVariants = {
  enter: (d) => ({ x: d > 0 ? 100 : -100, opacity: 0, scale: 0.8, rotateZ: d > 0 ? 6 : -6 }),
  center: { x: 0, opacity: 1, scale: 1, rotateZ: 0 },
  exit: (d) => ({ x: d > 0 ? -100 : 100, opacity: 0, scale: 0.8, rotateZ: d > 0 ? -6 : 6 }),
};

const textVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const BebidasSeccion1 = () => {
  const ingles = useStore(isEnglish);
  const dark = useStore(isDarkMode);
  const t = ingles ? content.en : content.es;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const flavor = magicDrinkFlavors[current];
  const config = FC[flavor.slug] || FC['magic-original'];
  const flavorName = flavor.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const tc = config.tc || '#fff';
  const particles = useMemo(() => genParticles(flavor.slug), [flavor.slug]);

  const go = useCallback((dir) => {
    setDirection(dir === 'next' ? 1 : -1);
    setCurrent((prev) =>
      dir === 'next'
        ? (prev + 1) % magicDrinkFlavors.length
        : (prev - 1 + magicDrinkFlavors.length) % magicDrinkFlavors.length
    );
  }, []);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => go('next'), 5000);
    return () => clearInterval(timerRef.current);
  }, [go]);

  const handleNav = (dir) => {
    clearInterval(timerRef.current);
    go(dir);
    timerRef.current = setInterval(() => go('next'), 5000);
  };

  const handleDot = (i) => {
    if (i === current) return;
    clearInterval(timerRef.current);
    setDirection(i > current ? 1 : -1);
    setCurrent(i);
    timerRef.current = setInterval(() => go('next'), 5000);
  };

  const handleCta = () => {
    const el = document.getElementById(`flavor-${flavor.slug}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Wave fill
  const waveFill = dark ? 'var(--md-gray-dark)' : 'var(--md-gray)';

  return (
    <>
      <section
        className={styles.hero}
        style={{
          '--tc': tc,
          '--tc2': tc === '#fff' ? 'rgba(255,255,255,0.85)' : `${tc}bb`,
          '--ub': tc === '#fff' ? 'rgba(255,255,255,0.5)' : `${tc}55`,
          '--ubg': tc === '#fff' ? 'rgba(255,255,255,0.15)' : `${tc}18`,
          '--uhov': tc === '#fff' ? 'rgba(255,255,255,0.35)' : `${tc}30`,
        }}
      >
        {/* ── Background layers (crossfade) ── */}
        {magicDrinkFlavors.map((f, i) => (
          <motion.div
            key={f.slug}
            className={styles.bgLayer}
            style={{ background: (FC[f.slug] || FC['magic-original']).bg }}
            animate={{ opacity: i === current ? 1 : 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        ))}

        {/* ── Particles ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={flavor.slug + '-particles'}
            className={styles.particlesWrap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {particles.map((p, i) => (
              <motion.div
                key={p.id}
                className={styles.particle}
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  '--pdur': `${p.dur}s`,
                  '--pdel': `${p.delay}s`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.65, scale: 1 }}
                transition={{ duration: 0.35, delay: i * 0.025 }}
              >
                <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none" stroke="none">
                  {S[p.type](p.color)}
                </svg>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Badge ── */}
        <div className={styles.badge}>
          <span className={styles.badgeStar}>&#10022;</span>
          {t.badge}
        </div>

        {/* ── Flavor Name with title icons ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.h1
            key={flavor.slug + '-name'}
            className={styles.flavorName}
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className={styles.titleIcon}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="none">
                {S[config.ti[0][0]](config.ti[0][1])}
              </svg>
            </span>
            {flavorName}
            <span className={styles.titleIcon}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="none">
                {S[config.ti[1][0]](config.ti[1][1])}
              </svg>
            </span>
          </motion.h1>
        </AnimatePresence>

        {/* ── Tagline ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.p
            key={flavor.slug + '-tag'}
            className={styles.tagline}
            custom={direction}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            {getText(flavor.tagline, ingles)}
          </motion.p>
        </AnimatePresence>

        {/* ── Can stage ── */}
        <div className={styles.canStage}>
          <button className={styles.arrow} onClick={() => handleNav('prev')} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className={styles.canArea}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={flavor.slug + '-can'}
                className={styles.canWrapper}
                custom={direction}
                variants={canVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              >
                <img src={flavor.image} alt={flavorName} className={styles.canImage} draggable={false} />
                <div className={styles.canGlow} style={{ background: `radial-gradient(circle, ${flavor.accentColor} 0%, transparent 70%)` }} />
              </motion.div>
            </AnimatePresence>
          </div>

          <button className={styles.arrow} onClick={() => handleNav('next')} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* ── Dots ── */}
        <div className={styles.dots}>
          {magicDrinkFlavors.map((f, i) => (
            <button
              key={f.slug}
              className={`${styles.dotIndicator} ${i === current ? styles.dotActive : ''}`}
              onClick={() => handleDot(i)}
              aria-label={f.slug}
            />
          ))}
        </div>

        {/* ── CTA ── */}
        <button className={styles.ctaButton} onClick={handleCta}>
          {t.cta}
          <span className={styles.ctaArrow}>&#8595;</span>
        </button>
      </section>

      {/* ── Wave transition to next section ── */}
      <div className={styles.waveTransition}>
        <svg viewBox="0 0 1200 150" preserveAspectRatio="none" className={`${styles.waveSvg} ${styles.waveSvgDesktop}`}>
          <path d="M0,50 Q30,90 60,50 T120,50 T180,50 T240,50 T300,50 T360,50 T420,50 T480,50 T540,50 T600,50 T660,50 T720,50 T780,50 T840,50 T900,50 T960,50 T1020,50 T1080,50 T1140,50 T1200,50 L1200,150 L0,150 Z" fill={waveFill} opacity="0.6" />
          <path d="M0,70 Q30,105 60,70 T120,70 T180,70 T240,70 T300,70 T360,70 T420,70 T480,70 T540,70 T600,70 T660,70 T720,70 T780,70 T840,70 T900,70 T960,70 T1020,70 T1080,70 T1140,70 T1200,70 L1200,150 L0,150 Z" fill={waveFill} opacity="0.8" />
          <path d="M0,85 Q30,115 60,85 T120,85 T180,85 T240,85 T300,85 T360,85 T420,85 T480,85 T540,85 T600,85 T660,85 T720,85 T780,85 T840,85 T900,85 T960,85 T1020,85 T1080,85 T1140,85 T1200,85 L1200,150 L0,150 Z" fill={waveFill} opacity="1" />
        </svg>
        <svg viewBox="0 0 1200 150" preserveAspectRatio="none" className={`${styles.waveSvg} ${styles.waveSvgMobile}`}>
          <path d="M0,50 Q75,90 150,50 T300,50 T450,50 T600,50 T750,50 T900,50 T1050,50 T1200,50 L1200,150 L0,150 Z" fill={waveFill} opacity="0.6" />
          <path d="M0,70 Q75,105 150,70 T300,70 T450,70 T600,70 T750,70 T900,70 T1050,70 T1200,70 L1200,150 L0,150 Z" fill={waveFill} opacity="0.8" />
          <path d="M0,85 Q75,115 150,85 T300,85 T450,85 T600,85 T750,85 T900,85 T1050,85 T1200,85 L1200,150 L0,150 Z" fill={waveFill} opacity="1" />
        </svg>
      </div>
    </>
  );
};

export default BebidasSeccion1;
