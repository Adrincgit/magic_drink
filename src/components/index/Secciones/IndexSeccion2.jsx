import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/indexSeccion2.module.css';
import Button from '../../global/Button';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ReactBits Animations
import BlurText from '../../global/animations/BlurText/BlurText';
import ShinyText from '../../global/animations/ShinyText/ShinyText';

gsap.registerPlugin(ScrollTrigger);

const IndexSeccion2 = () => {
  const ingles = useStore(isEnglish);
  const sectionRef = useRef(null);
  const heroRef = useRef(null);
  const canRef = useRef(null);
  const statsRef = useRef(null);

  const content = {
    es: {
      tagline: "✦ LA #1 DEL MUNDO • DESDE 2018 ✦",
      brandMagic: "Magic",
      brandDrink: "Drink",
      subtitle: "Un sorbo y el mundo se siente diferente",
      description: "Cero cafeína. Cero ingredientes artificiales. Y aun así, millones de personas juran que les cambia el día. La ciencia no lo explica del todo — pero tu sonrisa sí.",
      stats: [
        { number: "820", suffix: "M+", label: "Latas vendidas al año" },
        { number: "94", suffix: "%", label: "Repiten después del primer sorbo" },
        { number: "53", suffix: "+", label: "Países conquistados" },
        { number: "0", suffix: "mg", label: "Cafeína añadida" }
      ],
      cta: "Descubre los sabores",
      scrollHint: "Desliza para explorar"
    },
    en: {
      tagline: "✦ WORLD'S #1 • SINCE 2018 ✦",
      brandMagic: "Magic",
      brandDrink: "Drink",
      subtitle: "One sip and the world feels different",
      description: "Zero caffeine. Zero artificial ingredients. And yet, millions swear it changes their entire day. Science can't fully explain it — but your smile does.",
      stats: [
        { number: "820", suffix: "M+", label: "Cans sold per year" },
        { number: "94", suffix: "%", label: "Come back after first sip" },
        { number: "53", suffix: "+", label: "Countries conquered" },
        { number: "0", suffix: "mg", label: "Caffeine added" }
      ],
      cta: "Discover flavors",
      scrollHint: "Scroll to explore"
    }
  };

  const t = ingles ? content.en : content.es;

  // Animaciones GSAP épicas
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax de la lata
      gsap.to(canRef.current, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });

      // Stats counter animation on scroll
      const statNumbers = statsRef.current?.querySelectorAll(`.${styles.statNumber}`);
      statNumbers?.forEach((stat) => {
        const target = parseInt(stat.dataset.target);
        gsap.fromTo(stat, 
          { innerText: 0 },
          {
            innerText: target,
            duration: 2,
            ease: "power2.out",
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: stat,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // Entrada épica del hero
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      });

      tl.fromTo(`.${styles.tagline}`, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      )
      .fromTo(`.${styles.canShowcase}`,
        { opacity: 0, scale: 0.8, rotation: -15 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.5)" },
        "-=0.4"
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Fondo con gradiente animado */}
  {/*     <div className={styles.backgroundGradient}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div> */}

      {/* Grid de puntos decorativo */}
      <div className={styles.dotGrid}></div>

      {/* ═══════════════════════════════════════════════════════════════
          HERO ZONE - El impacto inicial
      ═══════════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className={styles.heroZone}>
        {/* Tagline superior */}
        <div className={styles.tagline}>
          <ShinyText
            text={t.tagline}
            speed={3}
            color="rgba(255,255,255,0.6)"
            shineColor="#F9F871"
            className={styles.taglineText}
          />
        </div>

        {/* TÍTULO GIGANTE - Magic (amarillo) Drink (azul) */}
        <div className={styles.brandTitle}>
          <div className={styles.brandLine}>
            <BlurText
              text={t.brandMagic}
              delay={80}
              animateBy="letters"
              direction="bottom"
              className={styles.brandMagic}
            />
          </div>
          <div className={styles.brandLine}>
            <BlurText
              text={t.brandDrink}
              delay={80}
              animateBy="letters"
              direction="top"
              className={styles.brandDrink}
            />
          </div>
        </div>

        {/* Subtítulo con entrada */}
        <div className={styles.subtitleWrapper}>
          <BlurText
            text={t.subtitle}
            delay={40}
            animateBy="words"
            direction="top"
            className={styles.subtitle}
          />
        </div>

        {/* LA LATA - Hero Product */}
        <div ref={canRef} className={styles.canShowcase}>
          <div className={styles.canGlow}></div>
          <div className={styles.canRings}>
            <div className={styles.ring1}></div>
            <div className={styles.ring2}></div>
            <div className={styles.ring3}></div>
          </div>
          <img 
            src="/image/drinks/lata_original.png" 
            alt="Magic Drink Original"
            className={styles.canImage}
          />
          {/* Partículas flotantes */}
          <div className={styles.particles}>
            {[...Array(12)].map((_, i) => (
              <span 
                key={i} 
                className={styles.particle}
                style={{ 
                  '--i': i,
                  '--delay': `${i * 0.2}s`,
                  '--angle': `${i * 30}deg`
                }}
              >✦</span>
            ))}
          </div>
        </div>

        {/* Descripción */}
        <p className={styles.description}>{t.description}</p>

        {/* Scroll Indicator */}
      {/*   <div className={styles.scrollIndicator}>
          <span className={styles.scrollText}>{t.scrollHint}</span>
          <div className={styles.scrollLine}>
            <div className={styles.scrollDot}></div>
          </div>
        </div> */}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STATS ZONE - Los números que impresionan
      ═══════════════════════════════════════════════════════════════ */}
      <div ref={statsRef} className={styles.statsZone}>
        <div className={styles.statsGrid}>
          {t.stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statNumberWrapper}>
                <span 
                  className={styles.statNumber}
                  data-target={stat.number}
                >
                  {stat.number}
                </span>
                <span className={styles.statSuffix}>{stat.suffix}</span>
              </div>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndexSeccion2;
