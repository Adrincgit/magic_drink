import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import styles from './originalProduct.module.css';

export default function OriginalProduct() {
  const en = useStore(isEnglish);
  return <div className={styles.product}>
    <section className={styles.hero}>
      <div className={styles.copy}><p className={styles.eyebrow}>MAGIC DRINK ORIGINAL</p><h1>{en ? 'The' : 'La'}<br /><em>Original.</em></h1><p className={styles.intro}>{en ? 'The purple can. The yellow star. The beginning of everything.' : 'La lata morada. La estrella amarilla. El principio de todo.'}</p><div className={styles.links}><a href="/wonderpop-plaza">{en ? 'Find your moment' : 'Encuentra tu momento'} ↗</a><a href="/#hexy">{en ? 'Follow the music' : 'Sigue la música'} →</a></div></div>
      <img src="/image/journey/original.webp" alt="Magic Drink Original" width="1024" height="1536" className={styles.can} />
    </section>
    <section className={styles.details}><p className={styles.eyebrow}>{en ? 'THE ORIGINAL EXPERIENCE' : 'LA EXPERIENCIA ORIGINAL'}</p><h2>{en ? <>Your day, with<br /><em>a little more sparkle.</em></> : <>Tu día, con<br /><em>un poco más de brillo.</em></>}</h2><div className={styles.facts}><article><span>01</span><h3>{en ? 'Unmistakable' : 'Inconfundible'}</h3><p>{en ? 'The signature purple-fruit profile. A familiar taste, from the very first sip.' : 'El perfil de frutas púrpuras de nuestra fórmula insignia. Un sabor familiar, desde el primer sorbo.'}</p></article><article><span>02</span><h3>{en ? 'Caffeine free' : 'Sin cafeína'}</h3><p>{en ? 'Original is made to accompany your everyday moments, your people and your favorite playlists.' : 'Original acompaña tus momentos de todos los días, a tu gente y a tus playlists favoritas.'}</p></article><article><span>03</span><h3>{en ? 'A whole world' : 'Todo un mundo'}</h3><p>{en ? 'Hexy, Magic Drink Day and WonderPop Plaza. The experience continues beyond the can.' : 'Hexy, Magic Drink Day y WonderPop Plaza. La experiencia continúa más allá de la lata.'}</p></article></div><a className={styles.back} href="/">{en ? 'Back to its world' : 'Vuelve a su mundo'} ↗</a></section>
  </div>;
}
