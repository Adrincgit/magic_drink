import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/indexSeccion4.module.css';
import Button from '../../global/Button';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ReactBits Animations - Full arsenal
import BlurText from '../../global/animations/BlurText/BlurText';
import ShinyText from '../../global/animations/ShinyText/ShinyText';
import GradientText from '../../global/animations/GradientText/GradientText';
import ScrollReveal from '../../global/animations/ScrollReveal/ScrollReveal';
import CountUp from '../../global/animations/CountUp';
import CurvedLoop from '../../global/animations/CurvedLoop/CurvedLoop';

gsap.registerPlugin(ScrollTrigger);

const IndexSeccion4 = () => {
  const ingles = useStore(isEnglish);
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const panelsRef = useRef([]);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const content = {
    es: {
      // Panel 1 - Introducción épica
      intro: {
        tag: "LA IDOL DE MAGIC DRINK",
        title: "Hexy",
        subtitle: "La brujita que mueve al mundo",
        description: "La voz que conquistó millones de corazones"
      },
      // Panel 2 - Ícono cultural
      icon: {
        title: "Un fenómeno global",
        text: "Donde Hexy aparece, la energía cambia. Sus canciones se quedan en la cabeza, sus shows agotan entradas en minutos y su imagen ya es parte de la cultura pop de toda una generación.",
        hexyQuote: "¡Cada sabor tiene su propia canción! Solo tienes que escuchar con el corazón... y con la lengua.",
        hexySign: "— Hexy ✦",
        highlight: "No es solo música. Es un estado de ánimo."
      },
      // Panel 3 - Los números
      stats: {
        title: "Los números hablan",
        items: [
          { value: 5, suffix: "B+", label: "Streams globales", icon: "♫", accentColor: "#FF6AD7" },
          { value: 40, suffix: "+", label: "Países con campañas", icon: "✦", accentColor: "#82D2FF" },
          { value: 1, prefix: "#", suffix: "", label: "Idol del Magic Drink Day", icon: "★", accentColor: "#F9F871" }
        ]
      },
      // Panel 4 - La experiencia
      experience: {
        title: "Música + Sabor",
        text: "Cuando su música suena y una Magic Drink se abre, el mundo se siente un poco más brillante.",
        cta: "Escuchar a Hexy",
        ctaSecondary: "Ver discografía"
      }
    },
    en: {
      intro: {
        tag: "THE MAGIC DRINK IDOL",
        title: "Hexy",
        subtitle: "The little witch moving the world",
        description: "The voice that conquered millions of hearts"
      },
      icon: {
        title: "A global phenomenon",
        text: "Wherever Hexy shows up, the energy shifts. Her songs get stuck in your head, her shows sell out in minutes, and her image is already part of an entire generation's pop culture.",
        hexyQuote: "Every flavor has its own song! You just have to listen with your heart... and your tongue.",
        hexySign: "— Hexy ✦",
        highlight: "It's not just music. It's a state of mind."
      },
      stats: {
        title: "Numbers speak",
        items: [
          { value: 5, suffix: "B+", label: "Global streams", icon: "♫", accentColor: "#FF6AD7" },
          { value: 40, suffix: "+", label: "Countries with campaigns", icon: "✦", accentColor: "#82D2FF" },
          { value: 1, prefix: "#", suffix: "", label: "Magic Drink Day idol", icon: "★", accentColor: "#F9F871" }
        ]
      },
      experience: {
        title: "Music + Flavor",
        text: "When her music plays and a Magic Drink opens, the world feels a little brighter.",
        cta: "Listen to Hexy",
        ctaSecondary: "View discography"
      }
    }
  };

  const t = ingles ? content.en : content.es;

  // Animaciones GSAP para los paneles
  useEffect(() => {
    const section = sectionRef.current;
    const panels = panelsRef.current;
    
    if (!section || panels.length === 0) return;

    let ctx;
    let rafId;

    const initAnimations = () => {
      ctx = gsap.context(() => {
        // Animar cada panel cuando entra en viewport
        panels.forEach((panel, index) => {
          if (!panel) return;

          // Animación de entrada del panel
          gsap.fromTo(panel,
            { 
              opacity: 0, 
              y: 80,
              scale: 0.95
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 85%",
                end: "top 40%",
                toggleActions: "play none none reverse",
              }
            }
          );

          // Animación de parallax sutil para elementos internos
          const innerElements = panel.querySelectorAll(`.${styles.animateIn}`);
          innerElements.forEach((el, i) => {
            gsap.fromTo(el,
              { opacity: 0, y: 40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: panel,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                }
              }
            );
          });
        });

        // Efecto parallax en Hexy
        const hexyImage = section.querySelector(`.${styles.hexyImage}`);
        if (hexyImage) {
          gsap.to(hexyImage, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          });
        }

      }, section);
    };

    // Esperar al layout
    rafId = requestAnimationFrame(() => {
      setTimeout(initAnimations, 100);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
    };
  }, []);

  // Función para agregar refs a los paneles
  const addPanelRef = (el, index) => {
    panelsRef.current[index] = el;
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Background decorativo */}

      {/* Notas musicales flotantes */}
      <div className={styles.musicNotes} aria-hidden="true">
        {['♪', '♫', '♪', '♫', '✦', '♪'].map((note, i) => (
          <span key={i} className={styles.note} style={{ '--i': i }}>{note}</span>
        ))}
      </div>

      <div className={styles.container}>
        {/* ═══════════════════════════════════════════════════════════════
            COLUMNA IZQUIERDA - Hexy Sticky
        ═══════════════════════════════════════════════════════════════ */}
        <div className={styles.stickyColumn}>
          <div className={styles.hexyWrapper}>
            {/* Glow de fondo */}
            <div className={styles.hexyGlow}></div>
            
            {/* Imagen principal de Hexy — Anime Banner */}
            <img
              src="/image/hexy/hexy-anime-banner.png"
              alt="Hexy - La idol de Magic Drink"
              className={styles.hexyImage}
              onError={(e) => { e.target.src = '/image/hexy/hexy-highlight.png'; }}
            />
            
            {/* Badge flotante — Anime/Real duality hint */}
            <div className={styles.hexyDualBadge}>
              <img 
                src="/image/hexy/hexy-live-can.png" 
                alt={ingles ? "Hexy in real life" : "Hexy en la vida real"}
                className={styles.dualBadgeImg}
                onError={(e) => { e.target.parentElement.style.display = 'none'; }}
              />
              <span className={styles.dualBadgeLabel}>
                {ingles ? "IRL" : "IRL"}
              </span>
            </div>

            {/* Partículas */}
            <div className={styles.particles}>
              {[...Array(8)].map((_, i) => (
                <span 
                  key={i} 
                  className={styles.particle}
                  style={{ '--i': i }}
                >✦</span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            COLUMNA DERECHA - Contenido con scroll
        ═══════════════════════════════════════════════════════════════ */}
        <div ref={contentRef} className={styles.contentColumn}>
          
          {/* Panel 1: Introducción */}
          <div ref={(el) => addPanelRef(el, 0)} className={styles.panel}>
            <div className={styles.panelInner}>
              <span className={`${styles.tag} ${styles.animateIn}`}>
                <ShinyText
                  text={t.intro.tag}
                  speed={3}
                  color="rgba(255,255,255,0.7)"
                  shineColor="#FF6AD7"
                />
              </span>
              <h2 className={`${styles.heroTitle} ${styles.animateIn}`}>
                <BlurText
                  text={t.intro.title}
                  delay={100}
                  animateBy="letters"
                  direction="bottom"
                  className={styles.heroTitleText}
                />
              </h2>
              <div className={`${styles.heroSubtitle} ${styles.animateIn}`}>
                <GradientText
                  colors={["#AA37F2", "#FF6AD7", "#82D2FF", "#AA37F2"]}
                  animationSpeed={4}
                  showBorder={false}
                >
                  {t.intro.subtitle}
                </GradientText>
              </div>
              <p className={`${styles.heroDescription} ${styles.animateIn}`}>
                {t.intro.description}
              </p>

              {/* Hexy Anime Poster */}
              <div className={`${styles.hexyPosterWrapper} ${styles.animateIn}`}>
                <img
                  src="/image/hexy/hexy-anime-poster.png"
                  alt={ingles ? "Hexy official poster" : "Póster oficial de Hexy"}
                  className={styles.hexyPosterImg}
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>

          <div ref={(el) => addPanelRef(el, 1)} className={styles.panel}>
            <div className={styles.panelInner}>
              <div className={`${styles.sectionTitle} ${styles.animateIn}`}>
                <ScrollReveal
                  enableBlur={true}
                  baseOpacity={0.15}
                  blurStrength={6}
                  containerClassName={styles.scrollRevealContainer}
                  textClassName={styles.mysteryTitleText}
                >
                  {t.icon.title}
                </ScrollReveal>
              </div>
              <p className={`${styles.mysteryText}`}>
                {t.icon.text}
              </p>
            
              <blockquote className={`${styles.hexyQuote} ${styles.animateIn}`}>
                <img 
                  src="/image/hexy/hexy-anime-chibi.png" 
                  alt="Hexy" 
                  className={styles.hexyQuoteAvatar}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className={styles.hexyQuoteBubble}>
                  <p className={styles.hexyQuoteText}>"{t.icon.hexyQuote}"</p>
                  <span className={styles.hexyQuoteSign}>{t.icon.hexySign}</span>
                </div>
              </blockquote>
              <blockquote className={`${styles.highlight} ${styles.animateIn}`}>
                <span className={styles.quoteIcon}>"</span>
                <ShinyText
                  text={t.icon.highlight}
                  speed={2}
                  color="#F9F871"
                  shineColor="#ffffff"
                />
              </blockquote>
            </div>
          </div>

         
          <div ref={(el) => addPanelRef(el, 2)} className={styles.panel}>
            <div className={styles.panelInner}>
              <div className={`${styles.sectionTitle} ${styles.animateIn}`}>
                <ScrollReveal
                  enableBlur={true}
                  baseOpacity={0.15}
                  blurStrength={5}
                  containerClassName={styles.scrollRevealContainer}
                  textClassName={styles.statsTitleText}
                >
                  {t.stats.title}
                </ScrollReveal>
              </div>
              <div className={styles.statsGrid}>
                {t.stats.items.map((stat, index) => (
                  <div 
                    key={index} 
                    className={`${styles.statCard} ${styles.animateIn}`}
                    style={{ 
                      '--delay': `${index * 0.1}s`,
                      '--accent-color': stat.accentColor 
                    }}
                  >
                    {/* Icon Badge */}
                    <div className={styles.statIconBadge}>
                      <span className={styles.statIcon}>{stat.icon}</span>
                      <div className={styles.statIconGlow}></div>
                    </div>
                    
                    {/* Value with CountUp */}
                    <span className={styles.statValue}>
                      <GradientText
                        colors={["#FF6AD7", "#AA37F2", "#82D2FF", "#F9F871", "#FF6AD7"]}
                        animationSpeed={3}
                        showBorder={false}
                      >
                        {stat.prefix || ''}
                        <CountUp
                          to={stat.value}
                          from={0}
                          duration={2.5}
                          separator=","
                        />
                        {stat.suffix}
                      </GradientText>
                    </span>
                    
                    {/* Label with accent bar */}
                    <div className={styles.statLabelWrapper}>
                      <span className={styles.statAccentBar}></span>
                      <span className={styles.statLabel}>{stat.label}</span>
                    </div>
                    
                    {/* Decorative sparkle */}
                    <span className={styles.statSparkle}>✦</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 4: Experiencia + CTA */}
          <div ref={(el) => addPanelRef(el, 3)} className={styles.panel}>
            <div className={styles.panelInner}>
              <div className={`${styles.sectionTitle} ${styles.animateIn}`}>
                <GradientText
                  colors={["#FF6AD7", "#F9F871", "#82D2FF", "#FF6AD7"]}
                  animationSpeed={5}
                  showBorder={false}
                  className={styles.experienceTitleGradient}
                >
                  {t.experience.title}
                </GradientText>
              </div>
              <p className={`${styles.experienceText} ${styles.animateIn}`}>
                {t.experience.text}
              </p>

              {/* Hexy IRL Corporate Image */}
              <div className={`${styles.hexyCorporateWrapper} ${styles.animateIn}`}>
                <img
                  src="/image/hexy/hexy-live-corporate.png"
                  alt={ingles ? "Hexy at a Magic Drink event" : "Hexy en evento Magic Drink"}
                  className={styles.hexyCorporateImg}
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
                <span className={styles.hexyCorporateLabel}>
                  {ingles ? "Hexy • Official Campaign" : "Hexy • Campaña Oficial"}
                </span>
              </div>

              <div className={`${styles.ctaGroup} ${styles.animateIn}`}>
                <Button
                  textEs={t.experience.cta}
                  textEn={t.experience.cta}
                  href="/hexy"
                  variant="magic"
                  size="lg"
                  showArrow={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CURVED LOOP - Magic Drink Banner
      ═══════════════════════════════════════════════════════════════ */}
      <div className={styles.curvedLoopWrapper}>
        <CurvedLoop
          marqueeText={ingles ? "MUSIC & FLAVOR  ♫  FEEL THE MAGIC  ♪ " : "MUSICA Y SABOR  ♫  SIENTE LA MAGIA  ♪ "}
          speed={1.5}
          curveAmount={isMobile ? 30 : 250}
          direction="left"
          interactive={false}
          className={styles.curvedLoopText}
        />
      </div>
    </section>
  );
};

export default IndexSeccion4;
