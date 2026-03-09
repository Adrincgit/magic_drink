import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/indexSeccion3.module.css';
import Button from '../../global/Button';
import useFlavorAudio from '../../global/useFlavorAudio';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Símbolos flotantes únicos por sabor — se muestran cuando el sabor suena
const FLAVOR_SYMBOLS = {
  'magic-original': ['★', '✦', '✧', '★', '✦', '✧', '★', '✦'],
  'banana-drama':   ['♩', '♪', '♫', '♬', '♩', '♪', '♫', '♬'],
  'bubble-tape':    ['○', '◎', '◌', '◯', '○', '◎', '◌', '◯'],
  'dragon-grape':   ['◆', '▲', '◇', '△', '◆', '▲', '◇', '△'],
  'sparkle-soda':   ['✦', '✧', '⋆', '✦', '✧', '⋆', '✦', '✧'],
  'witchy-kiwi':    ['✶', '∴', '⁂', '✶', '∴', '⁂', '✶', '∴'],
};

// Colores por audioId — estable fuera del ciclo de render (para efectos de ambiente)
const FLAVOR_COLORS = {
  'magic-original': { color: '#AA37F2', accentColor: '#FF6AD7' },
  'banana-drama':   { color: '#FFE066', accentColor: '#FF6AD7' },
  'bubble-tape':    { color: '#FF6AD7', accentColor: '#82D2FF' },
  'dragon-grape':   { color: '#9B4DCA', accentColor: '#FF6AD7' },
  'sparkle-soda':   { color: '#82D2FF', accentColor: '#F9F871' },
  'witchy-kiwi':    { color: '#7ED957', accentColor: '#98FFDE' },
};

// Índice fijo por sabor (no cambia con el idioma)
const FLAVOR_INDEX = {
  'magic-original': 0, 'banana-drama': 1, 'bubble-tape': 2,
  'dragon-grape': 3,   'sparkle-soda': 4, 'witchy-kiwi': 5,
};

const IndexSeccion3 = () => {
  const ingles = useStore(isEnglish);
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);
  const horizontalRef = useRef(null);
  const cardRefs = useRef([]);
  const prevFlavorRef = useRef(null);
  const [kiwiAfterglow, setKiwiAfterglow] = useState(false);
  const { toggleFlavor, isFlavorPlaying, isPlaying, currentFlavor, progress, onFlavorEnded } = useFlavorAudio();
  
  const content = {
    es: {
      sectionTitle: "Descubre Nuestros Sabores",
      sectionSubtitle: "Cada lata es una chispa de alegría mágica",
      cta: "Ver todos los sabores",
      endTitle: "¿Cuál será tu favorito?",
      endSubtitle: "6 sabores únicos esperándote",
      flavors: [
        {
          name: "Magic Original",
          tagline: "El sabor que equilibró al mundo",
          description: "Frutas púrpuras en perfecta armonía — concentradas, equilibradas, pensadas para ti. No por nada fue el primero en conquistar al mundo. Ya sabes por qué.",
          color: "#AA37F2",
          accentColor: "#FF6AD7",
          image: "/image/drinks/lata_original.png",
          audioId: "magic-original",
          playText: "Prueba la leyenda",
          playingText: "La leyenda suena...",
          stats: { energy: "100%", taste: "Clásico", vibe: "Mágico" }
        },
        {
          name: "Banana Drama",
          tagline: "Explosión tropical dramática",
          description: "El trópico entra sin pedir permiso. Una ola de banana dorada, juguetona y dramática, que te envuelve en calidez y en una risa que no puedes evitar.",
          color: "#FFE066",
          accentColor: "#FF6AD7",
          image: "/image/drinks/lata_banana.png",
          audioId: "banana-drama",
          playText: "¿Listo para el drama?",
          playingText: "Drama tropical...",
          stats: { energy: "110%", taste: "Tropical", vibe: "Intenso" }
        },
        {
          name: "Bubble Tape",
          tagline: "Nostalgia rosa chicle",
          description: "Cierra los ojos y vuelves a tener diez años. Dulzura rosada que acaricia la lengua con recuerdos de tardes infinitas.",
          color: "#FF6AD7",
          accentColor: "#82D2FF",
          image: "/image/drinks/lata_bubble.png",
          audioId: "bubble-tape",
          playText: "Viaja al pasado",
          playingText: "Recordando lo mejor...",
          stats: { energy: "92%", taste: "Dulce", vibe: "Retro" }
        },
        {
          name: "Dragon Grape",
          tagline: "Desata tu lado más épico",
          description: "Para quienes no se conforman. La uva más intensa del reino, lista para despertar tu lado más feroz. Cada sorbo es combustible para quien quiere destacar.",
          color: "#9B4DCA",
          accentColor: "#FF6AD7",
          image: "/image/drinks/lata_dragon.png",
          audioId: "dragon-grape",
          playText: "Despierta al dragón",
          playingText: "El dragón rugió...",
          stats: { energy: "105%", taste: "Intenso", vibe: "Épico" }
        },
        {
          name: "Sparkle Soda",
          tagline: "Luz de estrellas líquida",
          description: "Cada burbuja es un destello que revienta en tu paladar como confeti líquido. Sabe a celebración, a cielo despejado, al momento justo antes de que todo sea perfecto.",
          color: "#82D2FF",
          accentColor: "#F9F871",
          image: "/image/drinks/lata_sparkle.png",
          audioId: "sparkle-soda",
          playText: "Siente el destello",
          playingText: "Brillando en tu oído...",
          stats: { energy: "98%", taste: "Estelar", vibe: "Brillante" }
        },
        {
          name: "Witchy Kiwi",
          tagline: "Un hechizo que no se explica",
          description: "No es para todo el mundo. Esta sensación no se parece a nada: verde, eléctrica, extraña de la mejor manera. Para quienes se sienten diferentes... y lo celebran.",
          color: "#7ED957",
          accentColor: "#98FFDE",
          image: "/image/drinks/lata_kiwi.png",
          audioId: "witchy-kiwi",
          playText: "¿Te atreves?",
          playingText: "Algo extraño suena...",
          stats: { energy: "???", taste: "Extraño", vibe: "Único" }
        }
      ]
    },
    en: {
      sectionTitle: "Discover Our Flavors",
      sectionSubtitle: "Every can is a spark of magical joy",
      cta: "See all flavors",
      endTitle: "Which one will be your favorite?",
      endSubtitle: "6 unique flavors waiting for you",
      flavors: [
        {
          name: "Magic Original",
          tagline: "The flavor that balanced the world",
          description: "Purple fruits in perfect harmony — concentrated, balanced, designed for you. There's a reason it conquered the world first. You already know why.",
          color: "#AA37F2",
          accentColor: "#FF6AD7",
          image: "/image/drinks/lata_original.png",
          audioId: "magic-original",
          playText: "Taste the legend",
          playingText: "The legend plays...",
          stats: { energy: "100%", taste: "Classic", vibe: "Magical" }
        },
        {
          name: "Banana Drama",
          tagline: "Dramatic tropical explosion",
          description: "The tropics walk in uninvited. A wave of golden banana, playful and dramatic, that wraps you in warmth and a laugh you can't hold back.",
          color: "#FFE066",
          accentColor: "#FF6AD7",
          image: "/image/drinks/lata_banana.png",
          audioId: "banana-drama",
          playText: "Ready for the drama?",
          playingText: "Pure tropical drama...",
          stats: { energy: "110%", taste: "Tropical", vibe: "Intense" }
        },
        {
          name: "Bubble Tape",
          tagline: "Pink bubblegum nostalgia",
          description: "Close your eyes and you're ten again. Pink sweetness caressing your tongue with memories of endless afternoons.",
          color: "#FF6AD7",
          accentColor: "#82D2FF",
          image: "/image/drinks/lata_bubble.png",
          audioId: "bubble-tape",
          playText: "Travel back in time",
          playingText: "Remembering the best...",
          stats: { energy: "92%", taste: "Sweet", vibe: "Retro" }
        },
        {
          name: "Dragon Grape",
          tagline: "Unleash your most epic side",
          description: "For those who don't settle. The most intense grape in the kingdom, ready to awaken your fiercest side. Every sip is fuel for those who want to stand out.",
          color: "#9B4DCA",
          accentColor: "#FF6AD7",
          image: "/image/drinks/lata_dragon.png",
          audioId: "dragon-grape",
          playText: "Wake the dragon",
          playingText: "The dragon roared...",
          stats: { energy: "105%", taste: "Intense", vibe: "Epic" }
        },
        {
          name: "Sparkle Soda",
          tagline: "Liquid starlight",
          description: "Every bubble is a tiny flash bursting on your palate like liquid confetti. Tastes like celebration, clear sky, like that perfect moment just before everything clicks.",
          color: "#82D2FF",
          accentColor: "#F9F871",
          image: "/image/drinks/lata_sparkle.png",
          audioId: "sparkle-soda",
          playText: "Feel the sparkle",
          playingText: "Sparkling in your ears...",
          stats: { energy: "98%", taste: "Stellar", vibe: "Bright" }
        },
        {
          name: "Witchy Kiwi",
          tagline: "A spell that defies explanation",
          description: "Not for everyone. This feeling doesn't resemble anything you've tried: green, electric, strange in the best way. For those who feel different... and celebrate it.",
          color: "#7ED957",
          accentColor: "#98FFDE",
          image: "/image/drinks/lata_kiwi.png",
          audioId: "witchy-kiwi",
          playText: "Do you dare?",
          playingText: "Something strange plays...",
          stats: { energy: "???", taste: "Odd", vibe: "Unique" }
        }
      ]
    }
  };
  
  const t = ingles ? content.en : content.es;

  // Flavor activo — derivado del estado reactivo del hook de audio
  const activeFlavor = (currentFlavor && isPlaying)
    ? (t.flavors.find(f => f.audioId === currentFlavor) ?? null)
    : null;

  // GSAP: pop de activación cuando empieza a sonar un sabor
  useEffect(() => {
    if (!isPlaying || !currentFlavor) return;
    if (currentFlavor === prevFlavorRef.current) return;
    const idx = FLAVOR_INDEX[currentFlavor];
    const card = cardRefs.current[idx];
    if (card) {
      gsap.fromTo(card,
        { scale: 1 },
        { scale: 1.04, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
    }
    prevFlavorRef.current = currentFlavor;
  }, [currentFlavor, isPlaying]);

  // Ambient screen glow: resplandor de color en los bordes de pantalla
  useEffect(() => {
    let el = document.getElementById('md-flavor-ambient');
    if (!el) {
      el = document.createElement('div');
      el.id = 'md-flavor-ambient';
      Object.assign(el.style, {
        position: 'fixed', inset: '0',
        pointerEvents: 'none', zIndex: '9995',
        transition: 'box-shadow 0.9s ease',
      });
      document.body.appendChild(el);
    }
    if (isPlaying && currentFlavor) {
      const c = FLAVOR_COLORS[currentFlavor];
      if (c) {
        el.style.boxShadow = [
          `inset 0 0 220px 60px ${c.color}40`,
          `inset 0 0 80px 15px ${c.accentColor}28`,
        ].join(', ');
      }
    } else {
      el.style.boxShadow = 'none';
    }
    return () => {
      const a = document.getElementById('md-flavor-ambient');
      if (a) a.style.boxShadow = 'none';
    };
  }, [currentFlavor, isPlaying]);

  // ✶ Kiwi Afterglow — Escuchar cuando Witchy Kiwi termina
  useEffect(() => {
    const unsubscribe = onFlavorEnded((endedFlavor) => {
      if (endedFlavor === 'witchy-kiwi') {
        setKiwiAfterglow(true);
      }
    });
    return unsubscribe;
  }, [onFlavorEnded]);

  // ✶ Kiwi Afterglow — Animar overlay DESPUÉS de que React lo renderice
  useEffect(() => {
    if (!kiwiAfterglow) return;
    // requestAnimationFrame para asegurar que el DOM está pintado
    const rafId = requestAnimationFrame(() => {
      const overlay = document.getElementById('kiwi-afterglow');
      if (overlay) {
        const tl = gsap.timeline();
        tl.fromTo(overlay,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: 'power2.inOut' }
        )
        .to(overlay, {
          opacity: 0, duration: 1.5, ease: 'power2.in', delay: 2.5,
          onComplete: () => setKiwiAfterglow(false)
        });
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [kiwiAfterglow]);

  // GSAP ScrollTrigger - Scroll Horizontal
  useEffect(() => {
    const section = sectionRef.current;
    const horizontal = horizontalRef.current;
    const trigger = triggerRef.current;
    
    if (!section || !horizontal || !trigger) return;

    let ctx;
    let rafId;
    
    // Función para inicializar ScrollTrigger
    const initScrollTrigger = () => {
      // Calcular el ancho total del scroll horizontal
      const totalWidth = horizontal.scrollWidth - window.innerWidth;

      ctx = gsap.context(() => {
        // Crear el ScrollTrigger para el efecto horizontal
        const scrollTween = gsap.to(horizontal, {
          x: -totalWidth,
          ease: "none",
          scrollTrigger: {
            trigger: trigger,
            start: "top top",
            end: () => `+=${horizontal.scrollWidth - window.innerWidth}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // Importante: onRefresh para sincronizar alturas
            onRefresh: (self) => {
              // Asegurar que la sección padre tenga la altura correcta
              const scrollDistance = self.end - self.start;
              section.style.minHeight = `${scrollDistance + window.innerHeight}px`;
            },
          }
        });

        // Animaciones de entrada para cada card
        const cards = horizontal.querySelectorAll(`.${styles.flavorCard}`);
        cards.forEach((card) => {
          gsap.fromTo(card.querySelector(`.${styles.canImage}`), 
            { scale: 0.8, rotation: -10, opacity: 0.5 },
            {
              scale: 1,
              rotation: 0,
              opacity: 1,
              duration: 1,
              scrollTrigger: {
                trigger: card,
                start: "left 90%",
                end: "left 50%",
                scrub: true,
                containerAnimation: scrollTween,
              }
            }
          );
        });
      }, sectionRef);
    };

    // Esperar a que el DOM esté completamente renderizado
    // Usamos múltiples estrategias para asegurar compatibilidad cross-browser
    const waitForLayout = () => {
      // 1. Esperar al siguiente frame de animación
      rafId = requestAnimationFrame(() => {
        // 2. Pequeño timeout adicional para Chrome/Edge
        setTimeout(() => {
          initScrollTrigger();
          
          // 3. Refresh adicional después de que las imágenes carguen
          const images = horizontal.querySelectorAll('img');
          let loadedImages = 0;
          const totalImages = images.length;
          
          if (totalImages === 0) {
            ScrollTrigger.refresh();
            return;
          }
          
          images.forEach((img) => {
            if (img.complete) {
              loadedImages++;
              if (loadedImages === totalImages) {
                ScrollTrigger.refresh();
              }
            } else {
              img.addEventListener('load', () => {
                loadedImages++;
                if (loadedImages === totalImages) {
                  ScrollTrigger.refresh();
                }
              }, { once: true });
            }
          });
        }, 100);
      });
    };

    // Verificar si el documento ya está cargado
    if (document.readyState === 'complete') {
      waitForLayout();
    } else {
      window.addEventListener('load', waitForLayout, { once: true });
    }

    // Cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${activeFlavor ? styles.sectionActive : ''}`}
      style={activeFlavor ? {
        '--active-color': activeFlavor.color,
        '--active-accent': activeFlavor.accentColor,
      } : undefined}
    >
      {/* Fondo con orbes flotantes */}
    {/*   <div className={styles.backgroundOrbs}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div> */}

      {/* Contenedor del trigger para el pin */}
      <div ref={triggerRef} className={styles.horizontalTrigger}>
        {/* Track horizontal con las cards */}
        <div ref={horizontalRef} className={styles.horizontalTrack}>
          
          {/* Panel Intro */}
          <div className={styles.introPanel}>
            <div className={styles.introContent}>
              <span className={styles.introTag}>✦ {ingles ? "The Collection" : "La Colección"}</span>
              <h2 className={styles.introTitle}>{t.sectionTitle}</h2>
              <p className={styles.introSubtitle}>{t.sectionSubtitle}</p>
              <div className={styles.scrollHint}>
                <span>{ingles ? "Scroll to explore" : "Desliza para explorar"}</span>
                <div
                  className={styles.scrollArrow}
                  style={activeFlavor ? {
                    background: `linear-gradient(135deg, ${activeFlavor.color}, ${activeFlavor.accentColor})`
                  } : undefined}
                >→</div>
              </div>
            </div>
          </div>

          {/* Cards de Sabores */}
          {t.flavors.map((flavor, index) => {
            const playing = isFlavorPlaying(flavor.audioId);
            return (
            <div
              key={index}
              ref={el => cardRefs.current[index] = el}
              className={`${styles.flavorCard} ${playing ? styles.flavorCardPlaying : ''}`}
              style={{
                '--flavor-color': flavor.color,
                '--flavor-accent': flavor.accentColor,
              }}
            >
              {/* Número del sabor */}
              <div className={styles.flavorNumber}>
                <span>0{index + 1}</span>
              </div>

              {/* Contenido de la card */}
              <div className={styles.cardContent}>
                {/* Lado izquierdo - Info */}
                <div className={styles.cardInfo}>
                  <span className={styles.flavorTagline}>{flavor.tagline}</span>
                  <h3 className={`${styles.flavorName} ${playing ? styles.flavorNameActive : ''}`}>{flavor.name}</h3>
                  <p className={styles.flavorDescription}>{flavor.description}</p>
                  
                  {/* Play Button — Escucha el tono de este sabor */}
                  <button
                    className={`${styles.playButton} ${playing ? styles.playButtonActive : ''}`}
                    onClick={() => toggleFlavor(flavor.audioId)}
                    aria-label={playing ? `Pause ${flavor.name} loop` : `Play ${flavor.name} loop`}
                    style={{ '--flavor-color': flavor.color }}
                  >
                    <span className={styles.playIconWrapper}>
                      {playing ? (
                        /* Pause icon */
                        <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        /* Play icon */
                        <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z" />
                        </svg>
                      )}
                    </span>
                    <span className={styles.playLabel}>
                      {playing ? flavor.playingText : flavor.playText}
                    </span>
                    {/* Equalizer bars when playing */}
                    {playing && (
                      <span className={styles.eqBars} aria-hidden="true">
                        <span className={styles.eqBar}></span>
                        <span className={styles.eqBar}></span>
                        <span className={styles.eqBar}></span>
                        <span className={styles.eqBar}></span>
                      </span>
                    )}
                  </button>
                  
                  {/* Stats del sabor */}
                  <div className={styles.flavorStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>{ingles ? "Energy" : "Energía"}</span>
                      <span className={styles.statValue}>{flavor.stats.energy}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>{ingles ? "Taste" : "Sabor"}</span>
                      <span className={styles.statValue}>{flavor.stats.taste}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Vibe</span>
                      <span className={styles.statValue}>{flavor.stats.vibe}</span>
                    </div>
                  </div>
                </div>

                {/* Lado derecho - Imagen */}
                <div className={styles.cardVisual}>
                  <div className={styles.canContainer}>
                    {/* Glow de fondo */}
                    <div className={`${styles.canGlow} ${playing ? styles.canGlowPlaying : ''}`}></div>
                    {/* Rayo de luz vertical cuando el sabor suena */}
                    {playing && (
                      <div className={styles.canBeam}></div>
                    )}
                    {/* Ondas de sonido cuando está reproduciendo */}
                    {playing && (
                      <div className={styles.soundWaves} aria-hidden="true">
                        <span className={styles.soundWave}></span>
                        <span className={styles.soundWave}></span>
                        <span className={styles.soundWave}></span>
                      </div>
                    )}
                    {/* Círculos orbitales */}
                    <div className={styles.orbitRing}></div>
                    <div className={styles.orbitRing2}></div>
                    {/* La lata */}
                    <img 
                      src={flavor.image} 
                      alt={flavor.name}
                      className={`${styles.canImage} ${playing ? styles.canImagePlaying : ''}`}
                    />
                    {/* Partículas — símbolos únicos por sabor */}
                    <div className={styles.particles}>
                      {(FLAVOR_SYMBOLS[flavor.audioId] || []).map((sym, i) => (
                        <span 
                          key={i} 
                          className={styles.particle}
                          style={{ '--i': i }}
                        >{sym}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* At mósfera: símbolos flotantes únicos por sabor */}
              {playing && (
                <div className={styles.flavorAtmosphere} aria-hidden="true">
                  {(FLAVOR_SYMBOLS[flavor.audioId] || []).map((sym, i) => (
                    <span
                      key={i}
                      className={styles.atmosphereSymbol}
                      style={{ '--sym-i': i, color: flavor.color }}
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              )}
              {/* Decoración de esquina */}
              <div className={styles.cornerDecor}>
                <span>Magic Drink</span>
              </div>
            </div>
            );
          })}

          {/* Panel Final / CTA */}
          <div className={styles.endPanel}>
            <div className={styles.endContent}>
              <h3 className={styles.endTitle}>{t.endTitle}</h3>
              <p className={styles.endSubtitle}>{t.endSubtitle}</p>
              <Button
                textEs={t.cta}
                textEn={t.cta}
                href="/bebidas"
                variant="magic"
                size="lg"
                showArrow={true}
              />
            </div>
            {/* Colección mini de todas las latas */}
            <div className={styles.miniCollection}>
              {t.flavors.map((flavor, i) => (
                <img 
                  key={i}
                  src={flavor.image} 
                  alt={flavor.name}
                  className={styles.miniCan}
                  style={{ '--delay': `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mini player fijo — visible desde cualquier posición de scroll */}
      {activeFlavor && (
        <div
          className={styles.nowPlayingFixed}
          style={{ '--dot-color': activeFlavor.color, '--dot-accent': activeFlavor.accentColor }}
        >
          {/* Barra de progreso circular / lineal */}
          <div className={styles.nowPlayingProgress}>
            <div 
              className={styles.nowPlayingProgressBar} 
              style={{ '--progress': `${(progress || 0) * 100}%` }}
            />
          </div>
          <span className={styles.nowPlayingEq} aria-hidden="true">
            <span className={styles.nowPlayingBar}></span>
            <span className={styles.nowPlayingBar}></span>
            <span className={styles.nowPlayingBar}></span>
          </span>
          <span className={styles.nowPlayingText}>
            {ingles ? 'Now:' : 'Ahora:'}&nbsp;
            <strong style={{ color: activeFlavor.color }}>{activeFlavor.name}</strong>
          </span>
          <button
            className={styles.nowPlayingStop}
            onClick={() => toggleFlavor(activeFlavor.audioId)}
            aria-label={ingles ? 'Stop playing' : 'Parar'}
          >✕</button>
        </div>
      )}

      {/* ✶ Kiwi Afterglow — Overlay misterioso al terminar Witchy Kiwi */}
      {kiwiAfterglow && (
        <div id="kiwi-afterglow" className={styles.kiwiAfterglowOverlay}>
          <div className={styles.kiwiAfterglowPulse}></div>
          <div className={styles.kiwiAfterglowContent}>
            <span className={styles.kiwiAfterglowSymbol}>✶</span>
            <p className={styles.kiwiAfterglowMessage}>
              {ingles ? 'Did you feel it?' : '¿Lo sentiste?'}
            </p>
            <span className={styles.kiwiAfterglowSubtext}>
              {ingles ? 'Some things can\'t be explained...' : 'Hay cosas que no se explican...'}
            </span>
          </div>
          {/* Símbolos dispersándose */}
          <div className={styles.kiwiAfterglowSymbols} aria-hidden="true">
            {['✶', '∴', '⁂', '✶', '∴', '⁂', '✶', '∴', '⁂', '✶', '∴', '⁂'].map((sym, i) => (
              <span
                key={i}
                className={styles.kiwiScatterSymbol}
                style={{ '--scatter-i': i }}
              >{sym}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default IndexSeccion3;
