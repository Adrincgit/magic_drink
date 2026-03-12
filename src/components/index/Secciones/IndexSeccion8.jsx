import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish, isDarkMode } from '../../../data/variables';
import styles from '../css/indexSeccion8.module.css';

const faqs = [
  {
    qEs: '¿Magic Drink realmente no tiene cafeína?',
    aEs: 'Sí, nuestra fórmula está libre de cafeína y demás estimulantes. Lo que sientes no viene de cafeína sino de un efecto sensorial único.',
    qEn: 'Does Magic Drink really have no caffeine?',
    aEn: "Yes – the recipe contains zero caffeine or stimulants. The feeling comes from a unique sensory effect, not traditional energy ingredients."
  },
  {
    qEs: '¿Por qué la música suena mejor cuando la tomo?',
    aEs: 'Muchos consumidores reportan que sus canciones favoritas se perciben más nítidas tras beberla; es parte del misterio positivo de la marca.',
    qEn: 'Why does music sound better when I drink it?',
    aEn: "Many people say their favorite songs feel sharper after drinking it; its part of the brands positive mystery."
  },
  {
    qEs: '¿Puedo consumirla todos los días?',
    aEs: 'Sí, la bebida está diseñada para un consumo diario. Al no contener cafeína, no genera dependencia química, sólo acostumbramiento emocional.',
    qEn: 'Can I drink it every day?',
    aEn: "Yes, it's made for daily enjoyment. With no caffeine, there's no chemical dependencyjust emotional habit."
  },
  {
    qEs: '¿Por qué Hexy aparece en todo?',
    aEs: 'Hexy es nuestra idol virtual. La combinamos con la bebida porque queremos que la experiencia sea más divertida y memorable.',
    qEn: 'Why is Hexy everywhere?',
    aEn: "Hexy is our virtual idol. We pair her with the drink to make the experience more fun and memorable."
  },
  {
    qEs: '¿Todos los sabores son saludables?',
    aEs: 'Claro, todas nuestras variedades son formuladas para ser inocuas: sin cafeína, sin azúcar dañina y con ingredientes aprobados. La marca se promociona incluso como una opción saludable.',
    qEn: 'Are all the flavors healthy?',
    aEn: "Absolutely – every flavor is crafted to be harmless: no caffeine, no harmful sugars, just approved ingredients. We even market it as a healthy choice."
  },
  {
    qEs: '¿Por qué me parece aburrido si dejo de tomarla?',
    aEs: 'Muchas personas jóvenes notan que el mundo pierde un poco de brillo al dejarla; ese es el llamado "efecto aburrimiento" que ocurre principalmente entre el público juvenil.',
    qEn: 'Why does life feel boring when I stop drinking it?',
    aEn: "A lot of young drinkers notice the world loses a bit of shine when they stop—the so‑called 'boring effect' that hits mostly youth."
  },
  {
    qEs: '¿Dónde se vende oficialmente Magic Drink?',
    aEs: 'La única tienda oficial es la WonderPop Plaza. Allí encontrarás la bebida junto a merchandising, ropa, juguetes y accesorios de Hexy. Otros locales pueden venderla, pero la plaza es el hogar verdadero.',
    qEn: 'Where can I officially buy Magic Drink?',
    aEn: "The only official spot is WonderPop Plaza. You'll find the drink there alongside merch, clothes, toys and Hexy accessories. Other shops might stock it, but the plaza is the true home."
  },
  {
    qEs: '¿Quién compone la música de Hexy?',
    aEs: 'Obviamente, la propia Hexy. O al menos eso es lo que nos gusta decir; el misterio forma parte de la magia.',
    qEn: 'Who composes Hexy’s music?',
    aEn: "Obviously, Hexy herself. Or at least that’s what we like to say; the mystery is part of the magic."
  }
];

const IndexSeccion8 = () => {
  const ingles = useStore(isEnglish);
  const darkMode = useStore(isDarkMode);
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(open === i ? null : i);
  const t = ingles ? 'en' : 'es';

  return (
    <section className={`${styles.section} ${!darkMode ? styles.sectionLight : ''}`}>      
      <div className={styles.header}>
        <h2 className={styles.title}>{ingles ? 'Frequently Asked Questions' : 'Preguntas frecuentes'}</h2>
      </div>
      <div className={styles.qaList}>
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className={`${styles.qaItem} ${open === idx ? styles.open : ''}`}
            onClick={() => toggle(idx)}
          >
            <div className={styles.question}>{item[`q${t.charAt(0).toUpperCase() + t.slice(1)}`]}</div>
            <div className={styles.answer}>{open === idx && item[`a${t.charAt(0).toUpperCase() + t.slice(1)}`]}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default IndexSeccion8;
