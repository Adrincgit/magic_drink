import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish, isDarkMode } from '../../../data/variables';
import Button from '../../global/Button';
import styles from '../css/indexSeccion5.module.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const IndexSeccion5 = () => {
  const ingles = useStore(isEnglish);
  const darkMode = useStore(isDarkMode);
  
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const videoRef = useRef(null);
  const vignetteRef = useRef(null);
  const subtitlesRef = useRef(null);
  const finalSubtitlesRef = useRef(null);
  
  const content = {
    es: {
      titlePrefix: "¡Día de la ",
      titleMagic: "Magic",
      titleDrink: "Drink",
      titleSuffix: "!",
      subtitle: "El festival mundial donde celebramos la bebida más querida del planeta.",
      body: "Cada año, millones de fans se reúnen para disfrutar desfiles llenos de color, globos gigantes, música de Hexy y momentos mágicos.",
      highlight: "Porque cuando compartes una Magic Drink, compartes felicidad.",
      cta: "Descubre más sobre el Magic Drink Day"
    },
    en: {
      titlePrefix: "",
      titleMagic: "Magic",
      titleDrink: "Drink",
      titleSuffix: " Day!",
      subtitle: "The worldwide festival celebrating the most beloved beverage on the planet.",
      body: "Every year, millions of fans gather to enjoy colorful parades, giant balloons, Hexy's music, and magical moments.",
      highlight: "Because when you share a Magic Drink, you share happiness.",
      cta: "Discover more about Magic Drink Day"
    }
  };
  
  const t = ingles ? content.en : content.es;
  
  // 🎬 TIMELINE CINEMÁTICO LIMPIO - Sin conflictos con Sección 6
  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const imageWrapper = imageWrapperRef.current;
    const video = videoRef.current;
    const vignette = vignetteRef.current;
    const subtitles = subtitlesRef.current;
    const finalSubtitles = finalSubtitlesRef.current;
    
    if (!section || !title || !imageWrapper || !video) return;

    let ctx;
    let rafId;

    const initCinematicTimeline = () => {
      const waitForVideo = new Promise((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          video.addEventListener('loadeddata', resolve, { once: true });
        }
      });

      waitForVideo.then(() => {
        video.pause();
        video.currentTime = 0;
        
        const videoDuration = 9;
        
        ctx = gsap.context(() => {
          
          // 🎯 TIMELINE PRINCIPAL - Reducido a 300% para evitar solapamiento
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=300%", // Reducido de 400%
              pin: true,
              scrub: 0.5, // Más suave
              anticipatePin: 1,
              onUpdate: (self) => {
                const progress = self.progress;
                
                // Video scrub: 20% - 85%
                if (progress >= 0.20 && progress <= 0.85) {
                  const videoProgress = (progress - 0.20) / 0.65;
                  const targetTime = videoProgress * videoDuration;
                  
                  if (Math.abs(video.currentTime - targetTime) > 0.016) {
                    video.currentTime = targetTime;
                  }
                }
              }
            }
          });

          // ═══════════════════════════════════════════════════════════
          // FASE 1: TÍTULO ZOOM IN (0% - 12%)
          // ═══════════════════════════════════════════════════════════
          tl.fromTo(title,
            { scale: 0.3, opacity: 0 },
            { scale: 1.5, opacity: 1, duration: 0.12, ease: "power2.out" }, 0
          );

          // ═══════════════════════════════════════════════════════════
          // FASE 2: TÍTULO FADE OUT (12% - 20%)
          // ═══════════════════════════════════════════════════════════
          tl.to(title,
            { opacity: 0, scale: 2.2, duration: 0.08, ease: "power2.in" }, 0.12
          );

          // ═══════════════════════════════════════════════════════════
          // FASE 3: VIDEO FADE IN + BLUR TO SHARP (20% - 35%)
          // ═══════════════════════════════════════════════════════════
          tl.fromTo(imageWrapper,
            { opacity: 0 },
            { opacity: 1, duration: 0.10, ease: "power2.inOut" }, 0.20
          );

          tl.fromTo(video,
            { filter: "blur(40px) brightness(0.7)", scale: 1.2 },
            { filter: "blur(0px) brightness(1)", scale: 1, duration: 0.15, ease: "power2.out" }, 0.20
          );

          if (vignette) {
            tl.fromTo(vignette,
              { opacity: 0 },
              { opacity: 1, duration: 0.15, ease: "power2.inOut" }, 0.25
            );
          }

          // ═══════════════════════════════════════════════════════════
          // FASE 4: SUBTÍTULOS APARECEN (35% - 55%)
          // ═══════════════════════════════════════════════════════════
          if (subtitles) {
            tl.fromTo(subtitles,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.10, ease: "power2.out" }, 0.35
            );

            tl.to(subtitles,
              { opacity: 0, y: -20, duration: 0.06, ease: "power2.in" }, 0.55
            );
          }

          // ═══════════════════════════════════════════════════════════
          // FASE 5: SUBTÍTULOS FINALES + CTA (58% - 80%)
          // ═══════════════════════════════════════════════════════════
          if (finalSubtitles) {
            tl.fromTo(finalSubtitles,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.10, ease: "power2.out" }, 0.58
            );

            tl.to(finalSubtitles,
              { opacity: 0, scale: 0.95, duration: 0.08, ease: "power2.in" }, 0.78
            );
          }

          // ═══════════════════════════════════════════════════════════
          // FASE 6: FADE OUT SUAVE - Sin oscurecer (85% - 100%)
          // ═══════════════════════════════════════════════════════════
          tl.to(imageWrapper,
            { 
              opacity: 0, 
              scale: 1.05, 
              filter: "blur(10px)",
              duration: 0.15, 
              ease: "power2.in" 
            }, 0.85
          );

        }, section);
      });
    };

    rafId = requestAnimationFrame(() => {
      setTimeout(initCinematicTimeline, 100);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (ctx) ctx.revert();
    };
  }, []);
  
  return (
    <section 
      ref={sectionRef}
      className={`${styles.cinematicSection} ${!darkMode ? styles.sectionLight : ''}`}
    >
      <div className={styles.cinematicBackground}></div>

      {/* Imágenes decorativas del desfile — capa atmosférica, sin GSAP */}
      <div className={styles.paradeImgCollage} aria-hidden="true">
        <img
          src="/image/parade/parade-float.png"
          alt=""
          className={`${styles.paradeImg} ${styles.paradeImgLeft}`}
          onError={(e) => { e.target.parentElement.style.display = 'none'; }}
        />
        <img
          src="/image/parade/parade-crowd.png"
          alt=""
          className={`${styles.paradeImg} ${styles.paradeImgRight}`}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      <div ref={titleRef} className={styles.cinematicTitle}>
        <h1 className={styles.titleText}>
          {t.titlePrefix && <span className={styles.titlePrefix}>{t.titlePrefix}</span>}
          <span className={styles.titleMagic}>{t.titleMagic}</span>
          {" "}
          <span className={styles.titleDrink}>{t.titleDrink}</span>
          <span className={styles.titleSuffix}>{t.titleSuffix}</span>
        </h1>
      </div>

      <div ref={imageWrapperRef} className={styles.cinematicImageWrapper}>
        <video
          ref={videoRef}
          className={styles.cinematicImage}
          muted
          playsInline
          preload="auto"
        >
          <source src="/videos/parade2.mp4" type="video/mp4" />
        </video>
        <div ref={vignetteRef} className={styles.vignetteOverlay}></div>
      </div>

      <div ref={subtitlesRef} className={styles.subtitlesBox}>
        <h3 className={styles.subtitleText}>{t.subtitle}</h3>
        <p className={styles.bodyText}>{t.body}</p>
      </div>

      <div ref={finalSubtitlesRef} className={styles.finalSubtitlesBox}>
        <p className={styles.highlightText}>{t.highlight}</p>
        <div className={styles.ctaBox}>
          <Button
            variant="magic"
            href="/magicdrinkday"
            textEs={t.cta}
            textEn={t.cta}
            size="lg"
            showArrow={true}
          />
        </div>
      </div>
    </section>
  );
};

export default IndexSeccion5;
