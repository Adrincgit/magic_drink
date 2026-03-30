import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/indexSeccion6.module.css';
import Button from '../../global/Button';
import GradientText from '../../global/animations/GradientText/GradientText';
import CountUp from '../../global/animations/CountUp';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const detectMobile = () => typeof window !== 'undefined' && window.innerWidth <= 900;

const IndexSeccion6 = () => {
  const ingles = useStore(isEnglish);
  
  // ═══════════════════════════════════════════════════════════════
  // CONTENIDO - Objeto de traducciones (patrón estándar)
  // ═══════════════════════════════════════════════════════════════
  const content = {
    es: {
      title: "Wonderpop Plaza",
      tagline: "El corazón oficial de Magic Drink",
      subtitle: "Más que una tienda. Un mundo Magic Drink.",
      description: "Wonderpop Plaza es el centro comercial oficial de Magic Drink. Un espacio donde la bebida, la música y la creatividad se encuentran. Aquí nacen ediciones especiales, eventos exclusivos y experiencias únicas.",
      highlightsTitle: "Todo lo que encontrarás",
      highlights: [
        { icon: '/icons/icono_lata.png', text: 'Tienda oficial Magic Drink' },
        { icon: '/icons/icono_gorro.png', text: 'Música y experiencias de Hexy' },
        { icon: '/icons/icono_bolsa.png', text: 'Merch exclusivo y ediciones limitadas' },
        { icon: '/icons/icono_globo.png', text: 'Eventos especiales durante el Magic Drink Day' }
      ],
      cta: "Explorar Wonderpop Plaza",
      statsTitle: "Nuestro Impacto Global",
      stats: [
        { value: 24, suffix: '', label: 'Ubicaciones globales', icon: '✦', iconClass: 'globe' },
        { value: 2, suffix: 'M+', label: 'Visitantes mensuales', icon: '★', iconClass: 'people' },
        { value: 4.9, suffix: '', label: 'Calificación promedio', icon: '✶', hasStar: true, iconClass: 'star' },
        { value: 500, suffix: 'K+', label: 'Fotos compartidas', icon: '♫', iconClass: 'camera' }
      ]
    },
    en: {
      title: "Wonderpop Plaza",
      tagline: "The official heart of Magic Drink",
      subtitle: "More than a store. A Magic Drink world.",
      description: "Wonderpop Plaza is the official shopping center of Magic Drink. A space where the drink, music and creativity meet in one place. Here special editions are born, exclusive events and unique experiences.",
      highlightsTitle: "Everything you'll find",
      highlights: [
        { icon: '/icons/icono_lata.png', text: 'Official Magic Drink Store' },
        { icon: '/icons/icono_gorro.png', text: 'Music and Hexy experiences' },
        { icon: '/icons/icono_bolsa.png', text: 'Exclusive merch and limited editions' },
        { icon: '/icons/icono_globo.png', text: 'Special events during Magic Drink Day' }
      ],
      cta: "Explore Wonderpop Plaza",
      statsTitle: "Our Global Impact",
      stats: [
        { value: 24, suffix: '', label: 'Global locations', icon: '✦', iconClass: 'globe' },
        { value: 2, suffix: 'M+', label: 'Monthly visitors', icon: '★', iconClass: 'people' },
        { value: 4.9, suffix: '', label: 'Average rating', icon: '✶', hasStar: true, iconClass: 'star' },
        { value: 500, suffix: 'K+', label: 'Photos shared', icon: '♫', iconClass: 'camera' }
      ]
    }
  };

  const t = ingles ? content.en : content.es;

  // ═══════════════════════════════════════════════════════════════
  // REFS PARA GSAP
  // ═══════════════════════════════════════════════════════════════
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const particlesRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const videoRef = useRef(null);
  
  // Fase 1: Intro (subtítulo + descripción)
  const introContentRef = useRef(null);
  
  // Fase 2: Highlights + CTA
  const highlightsContainerRef = useRef(null);
  const highlightItemsRef = useRef([]);
  const ctaRef = useRef(null);
  
  // Fase 3: Stats
  const statsContainerRef = useRef(null);
  const statCardsRef = useRef([]);

  // Estado para activar CountUp
  const [statsVisible, setStatsVisible] = useState(false);
  // Ref para evitar que statsVisible en el dep array destruya el ScrollTrigger
  const statsVisibleRef = useRef(false);

  // Detección móvil
  const [isMobile, setIsMobile] = useState(detectMobile);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // TIMELINE CINEMÁTICO - Contenido en racimos/fases
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const particles = particlesRef.current;
    const videoWrapper = videoWrapperRef.current;
    const video = videoRef.current;
    const introContent = introContentRef.current;
    const highlightsContainer = highlightsContainerRef.current;
    const cta = ctaRef.current;
    const statsContainer = statsContainerRef.current;

    if (isMobile || !section || !video || !title) return;

    let ctx;
    let rafId;

    const initCinematicTimeline = () => {
      const waitForVideo = new Promise((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          video.addEventListener('loadeddata', resolve, { once: true });
          setTimeout(resolve, 3000);
        }
      });

      waitForVideo.then(() => {
        video.pause();
        video.currentTime = 0;
        
        const videoDuration = video.duration || 10;

        ctx = gsap.context(() => {
          
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=550%",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              // No tocar document.body.style — el layout tiene background fijo
              onEnter: () => {},
              onLeave: () => {},
              onEnterBack: () => {},
              onLeaveBack: () => {},
              onUpdate: (self) => {
                const progress = self.progress;
                
                // Video scrub: 12% - 72%
                if (progress >= 0.12 && progress <= 0.72) {
                  const videoProgress = (progress - 0.12) / 0.60;
                  const targetTime = videoProgress * videoDuration;
                  
                  if (Math.abs(video.currentTime - targetTime) > 0.02) {
                    video.currentTime = targetTime;
                  }
                }

                // Activar stats CountUp al 80%
                if (progress >= 0.80 && !statsVisibleRef.current) {
                  statsVisibleRef.current = true;
                  setStatsVisible(true);
                }
              }
            }
          });

          // ═══════════════════════════════════════════════════════════
          // FASE 1: TÍTULO ZOOM-IN (0% - 10%)
          // ═══════════════════════════════════════════════════════════
          tl.fromTo(title,
            { scale: 0.15, opacity: 0, filter: "blur(25px)" },
            { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.10, ease: "back.out(1.4)" },
            0
          );

          // Partículas aparecen con fade-in después del título
          if (particles) {
            tl.fromTo(particles,
              { opacity: 0 },
              { opacity: 1, duration: 0.08, ease: "power2.out" },
              0.06
            );
          }

          // ═══════════════════════════════════════════════════════════
          // FASE 2: TÍTULO SE REDUCE Y SUBE (10% - 15%)
          // ═══════════════════════════════════════════════════════════
          tl.to(title,
            { scale: 0.35, y: "-30vh", duration: 0.05, ease: "power2.inOut" },
            0.10
          );

          // ═══════════════════════════════════════════════════════════
          // FASE 3: VIDEO APARECE CENTRADO (12% - 22%)
          // ═══════════════════════════════════════════════════════════
          tl.fromTo(videoWrapper,
            { opacity: 0, scale: 0.75, y: 80 },
            { opacity: 1, scale: 1, y: 0, duration: 0.10, ease: "power2.out" },
            0.12
          );

          tl.fromTo(video,
            { filter: "blur(30px) brightness(0.5)" },
            { filter: "blur(0px) brightness(1)", duration: 0.10, ease: "power2.out" },
            0.12
          );

          // ═══════════════════════════════════════════════════════════
          // FASE 4: INTRO CONTENT APARECE (22% - 32%)
          // Subtítulo + descripción aparecen debajo del video
          // ═══════════════════════════════════════════════════════════
          if (introContent) {
            tl.fromTo(introContent,
              { opacity: 0, y: 60, filter: "blur(12px)" },
              { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.10, ease: "power2.out" },
              0.22
            );
          }

          // ═══════════════════════════════════════════════════════════
          // FASE 5: INTRO DESAPARECE (38% - 45%)
          // ═══════════════════════════════════════════════════════════
          if (introContent) {
            tl.to(introContent,
              { opacity: 0, y: -40, filter: "blur(10px)", duration: 0.07, ease: "power2.in" },
              0.38
            );
          }

          // ═══════════════════════════════════════════════════════════
          // FASE 6: HIGHLIGHTS APARECEN UNO A UNO (45% - 62%)
          // ═══════════════════════════════════════════════════════════
          if (highlightsContainer) {
            tl.fromTo(highlightsContainer,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.05 },
              0.45
            );
          }

          const highlightItems = highlightItemsRef.current.filter(Boolean);
          highlightItems.forEach((item, index) => {
            tl.fromTo(item,
              { opacity: 0, x: 100, scale: 0.8 },
              { opacity: 1, x: 0, scale: 1, duration: 0.04, ease: "back.out(1.3)" },
              0.48 + (index * 0.03)
            );
          });

          // CTA aparece después de highlights
          if (cta) {
            tl.fromTo(cta,
              { opacity: 0, y: 40, scale: 0.85 },
              { opacity: 1, y: 0, scale: 1, duration: 0.05, ease: "back.out(1.4)" },
              0.62
            );
          }

          // ═══════════════════════════════════════════════════════════
          // FASE 7: PAUSA - TODO VISIBLE (62% - 72%)
          // ═══════════════════════════════════════════════════════════
          tl.to({}, { duration: 0.10 }, 0.62);

          // ═══════════════════════════════════════════════════════════
          // FASE 8: TODO DESAPARECE (72% - 80%)
          // ═══════════════════════════════════════════════════════════
          tl.to([videoWrapper, highlightsContainer, title],
            { opacity: 0, y: -60, scale: 0.9, filter: "blur(12px)", duration: 0.08, ease: "power2.in" },
            0.72
          );

          // ═══════════════════════════════════════════════════════════
          // FASE 9: STATS APARECEN (80% - 100%)
          // ═══════════════════════════════════════════════════════════
          if (statsContainer) {
            tl.fromTo(statsContainer,
              { opacity: 0, y: 100, scale: 0.8, pointerEvents: 'none' },
              { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto', duration: 0.10, ease: "power2.out" },
              0.80
            );
          }

          const statCards = statCardsRef.current.filter(Boolean);
          statCards.forEach((card, index) => {
            tl.fromTo(card,
              { opacity: 0, y: 80, scale: 0.7, rotateY: 20 },
              { opacity: 1, y: 0, scale: 1, rotateY: 0, duration: 0.06, ease: "back.out(1.3)" },
              0.84 + (index * 0.03)
            );
          });

        }, section);
      });
    };

    rafId = requestAnimationFrame(() => {
      setTimeout(initCinematicTimeline, 150);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
    };
  }, [isMobile]); // Re-init si cambia móvil/desktop

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  /* ─── RENDER MÓVIL — layout estático sin GSAP/pin ─── */
  if (isMobile) {
    return (
      <section className={styles.wonderpopMobileSection}>
        <div className={styles.darkBackground}></div>

        {/* Título */}
        <div className={styles.mobileHeroTitle}>
          <h2 className={styles.titleText}>
            <GradientText
              colors={['#FF6AD7', '#AA37F2', '#82D2FF', '#F9F871', '#FF6AD7']}
              animationSpeed={6}
              className={styles.gradientTitle}
            >
              ✦ {t.title} ✦
            </GradientText>
          </h2>
          <p className={styles.tagline}>{t.tagline}</p>
        </div>

        {/* Vídeo en loop (no scrubbing) */}
        <div className={styles.mobileVideoWrapper}>
          <video
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/image/wonderpop/wonderpop-poster.png"
          >
            <source src="/videos/wonderpop.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Intro content */}
        <div className={styles.mobileIntroContent}>
          <h3 className={styles.subtitle}>{t.subtitle}</h3>
          <p className={styles.description}>{t.description}</p>
          <div className={styles.wonderpopImgGallery}>
            <img src="/image/wonderpop/wonderpop-exterior.png" alt="" className={styles.wonderpopImg} onError={(e) => { e.target.style.display = 'none'; }} />
            <img src="/image/wonderpop/wonderpop-interior.png" alt="" className={styles.wonderpopImg} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        </div>

        {/* Highlights */}
        <div className={styles.mobileHighlightsContainer}>
          <h4 className={styles.highlightsTitle}>{t.highlightsTitle}</h4>
          <ul className={styles.highlights}>
            {t.highlights.map((item, index) => (
              <li key={index} className={styles.highlightItem}>
                <div className={styles.iconWrapper}>
                  <img src={item.icon} alt="" className={styles.icon} loading="lazy" />
                </div>
                <span className={styles.highlightText}>{item.text}</span>
              </li>
            ))}
          </ul>
          <div className={styles.ctaWrapper}>
            <Button
              href="/wonderpop-plaza"
              textEs={content.es.cta}
              textEn={content.en.cta}
              variant="magic"
              size="lg"
              showArrow={true}
            />
          </div>
        </div>

        {/* Stats siempre visibles en móvil */}
        <div className={styles.mobileStatsContainer}>
          <h3 className={styles.statsTitle}>
            <GradientText colors={['#FF6AD7', '#AA37F2', '#82D2FF']} animationSpeed={4}>
              {t.statsTitle}
            </GradientText>
          </h3>
          <div className={styles.statsGrid}>
            {t.stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statNumber}>
                  <CountUp to={stat.value} from={0} duration={2} delay={index * 0.15} separator="," />
                  {stat.suffix}
                  {stat.hasStar && <span className={styles.starIcon}>★</span>}
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statIcon}>{stat.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ─── RENDER DESKTOP (GSAP Cinematic) ─── */
  return (
    <section ref={sectionRef} className={styles.wonderpopSection}>
      {/* Fondo sólido */}
      <div className={styles.darkBackground}></div>

      {/* Partículas decorativas */}
      <div ref={particlesRef} className={styles.particles}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.particle}></div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TÍTULO WONDERPOP PLAZA
      ══════════════════════════════════════════════════════════ */}
      <div ref={titleRef} className={styles.heroTitle}>
        <h2 className={styles.titleText}>
          <GradientText
            colors={['#FF6AD7', '#AA37F2', '#82D2FF', '#F9F871', '#FF6AD7']}
            animationSpeed={6}
            className={styles.gradientTitle}
          >
            ✦ {t.title} ✦
          </GradientText>
        </h2>
        <p className={styles.tagline}>{t.tagline}</p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          LAYOUT CENTRAL: VIDEO + CONTENIDO EN FASES
      ══════════════════════════════════════════════════════════ */}
      <div className={styles.mainLayout}>
        
        {/* Video centrado */}
        <div ref={videoWrapperRef} className={styles.videoWrapper}>
          <div className={styles.videoBorder}></div>
          <video 
            ref={videoRef}
            className={styles.video}
            muted
            playsInline
            preload="auto"
            poster="/image/wonderpop/wonderpop-poster.png"
          >
            <source src="/videos/wonderpop.mp4" type="video/mp4" />
          </video>
        </div>

        {/* FASE 1: Intro Content (debajo del video) */}
        <div ref={introContentRef} className={styles.introContent}>
          <h3 className={styles.subtitle}>{t.subtitle}</h3>
          <p className={styles.description}>{t.description}</p>

          {/* Galería atmosférica de Wonderpop Plaza */}
          <div className={styles.wonderpopImgGallery}>
            <img
              src="/image/wonderpop/wonderpop-exterior.png"
              alt=""
              className={styles.wonderpopImg}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <img
              src="/image/wonderpop/wonderpop-interior.png"
              alt=""
              className={styles.wonderpopImg}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* FASE 2: Highlights Container (reemplaza intro) */}
        <div ref={highlightsContainerRef} className={styles.highlightsContainer}>
          <h4 className={styles.highlightsTitle}>{t.highlightsTitle}</h4>
          <ul className={styles.highlights}>
            {t.highlights.map((item, index) => (
              <li 
                key={index}
                ref={el => highlightItemsRef.current[index] = el}
                className={styles.highlightItem}
              >
                <div className={styles.iconWrapper}>
                  <img src={item.icon} alt="" className={styles.icon} loading="lazy" />
                </div>
                <span className={styles.highlightText}>{item.text}</span>
              </li>
            ))}
          </ul>
          
          <div ref={ctaRef} className={styles.ctaWrapper}>
            <Button 
              href="/wonderpop-plaza"
              textEs={content.es.cta}
              textEn={content.en.cta}
              variant="magic"
              size="lg"
              icon=""
              showArrow={true}
            />
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          STATS GRID - Aparece al final
      ══════════════════════════════════════════════════════════ */}
      <div ref={statsContainerRef} className={styles.statsContainer}>
        <h3 className={styles.statsTitle}>
          <GradientText
            colors={['#FF6AD7', '#AA37F2', '#82D2FF']}
            animationSpeed={4}
          >
            {t.statsTitle}
          </GradientText>
        </h3>
        <div className={styles.statsGrid}>
          {t.stats.map((stat, index) => (
            <div 
              key={index}
              ref={el => statCardsRef.current[index] = el} 
              className={styles.statCard}
            >
              <div className={styles.statNumber}>
                {statsVisible ? (
                  <>
                    <CountUp
                      to={stat.value}
                      from={0}
                      duration={2}
                      delay={index * 0.15}
                      separator=","
                    />
                    {stat.suffix}
                    {stat.hasStar && <span className={styles.starIcon}>★</span>}
                  </>
                ) : (
                  <>0{stat.suffix}</>
                )}
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statIcon}>{stat.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndexSeccion6;
