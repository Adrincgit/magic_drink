import { useStore } from '@nanostores/react';
import { isEnglish, isDarkMode } from '../../../data/variables';
import styles from '../css/indexSeccion7.module.css';

const IndexSeccion7 = () => {
  const ingles = useStore(isEnglish);
  const darkMode = useStore(isDarkMode);
  
  const content = {
    es: {
      title: "Lo que opinan nuestros consumidores",
      subtitle: "Personas reales, de distintos países, que hicieron de Magic Drink parte de su día."
    },
    en: {
      title: "What our consumers say",
      subtitle: "Real people, from different countries, who made Magic Drink part of their day."
    }
  };
  
  const testimonials = [
    {
      id: "t1",
      name: "Andrea L.",
      country: "México",
      countryEn: "Mexico",
      image: "/image/testimonials/luna.png",
      quote: "No tiene cafeína, pero me siento con energía todo el día. Ya es parte de mi rutina.",
      quoteEn: "It has no caffeine, but I feel energized all day. It's already part of my routine."
    },
    {
      id: "t2",
      name: "Lucas M.",
      country: "Argentina",
      countryEn: "Argentina",
      image: "/image/testimonials/lucas.png",
      quote: "La probé por curiosidad y ahora siempre tengo una en mi mochila. Me pone de buen humor.",
      quoteEn: "I tried it out of curiosity and now I always have one in my backpack. It puts me in a good mood."
    },
    {
      id: "t3",
      name: "Emily R.",
      country: "España",
      countryEn: "Spain",
      image: "/image/testimonials/emily.png",
      quote: "Me encanta el sabor y la estética. Es como una pausa feliz en medio del día.",
      quoteEn: "I love the taste and aesthetics. It's like a happy break in the middle of the day."
    },
    {
      id: "t4",
      name: "Daniel K.",
      country: "Estados Unidos",
      countryEn: "United States",
      image: "/image/testimonials/daniel.png",
      quote: "Trabajo muchas horas frente a la computadora y Magic Drink me ayuda a mantenerme enfocado sin nervios.",
      quoteEn: "I work long hours in front of the computer and Magic Drink helps me stay focused without jitters."
    },
    {
      id: "t5",
      name: "Yuki A.",
      country: "Japón",
      countryEn: "Japan",
      image: "/image/testimonials/yuki.png",
      quote: "Me gusta porque es divertida y diferente. Me inspira cuando dibujo o escucho música.",
      quoteEn: "I like it because it's fun and different. It inspires me when I draw or listen to music."
    },
    {
      id: "t6",
      name: "Malik S.",
      country: "Colombia",
      countryEn: "Colombia",
      image: "/image/testimonials/malik.png",
      quote: "Me sube el ánimo al instante. La siento ligera, pero con un punch que me activa.",
      quoteEn: "It lifts my mood instantly. I feel it light, but with a punch that activates me."
    }
  ];
  
  const t = ingles ? content.en : content.es;
  
  return (
    <section 
      className={`${styles.section} ${!darkMode ? styles.sectionLight : ''}`}
    >
      {/* Header de la sección */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.subtitle}>{t.subtitle}</p>
      </div>
      
      {/* Grid de testimonios */}
      <div className={styles.testimonialsGrid}>
        {testimonials.map((testimonial, index) => (
          <div key={testimonial.id} className={styles.testimonialCard}>
            {/* Sección superior - Imagen con decoraciones */}
            <div className={styles.imageSection}>
              <img 
                src={testimonial.image} 
                alt={testimonial.name}
                className={styles.userImage}
              />
              {/* Decoraciones kawaii flotantes sobre la imagen */}
              <div className={styles.imageDecorations}>
                <span className={styles.imageDeco}>{index % 3 === 0 ? '✦' : index % 3 === 1 ? '★' : '♪'}</span>
                <span className={styles.imageDeco}>{index % 3 === 0 ? '★' : index % 3 === 1 ? '✦' : '✶'}</span>
                <span className={styles.imageDeco}>{index % 3 === 0 ? '✶' : index % 3 === 1 ? '♫' : '★'}</span>
                <span className={styles.imageDeco}>{index % 3 === 0 ? '♫' : index % 3 === 1 ? '♪' : '✦'}</span>
              </div>
            </div>
            
            {/* Sección inferior - Contenido de texto */}
            <div className={styles.contentSection}>
              {/* Nombre */}
              <h3 className={styles.userName}>{testimonial.name}</h3>
              
              {/* País */}
              <p className={styles.userCountry}>{ingles ? testimonial.countryEn : testimonial.country}</p>
              
              {/* Cita */}
              <blockquote className={styles.quote}>
                “{ingles ? testimonial.quoteEn : testimonial.quote}”
              </blockquote>
            </div>
          </div>
        ))}
      </div>
      
      {/* Decoraciones de fondo */}
      <div className={styles.decorations} aria-hidden="true">
        <span className={styles.deco}>✦</span>
        <span className={styles.deco}>★</span>
        <span className={styles.deco}>♪</span>
        <span className={styles.deco}>✶</span>
        <span className={styles.deco}>♫</span>
        <span className={styles.deco}>♪</span>
        <span className={styles.deco}>✦</span>
        <span className={styles.deco}>★</span>
      </div>
    </section>
  );
};

export default IndexSeccion7;
