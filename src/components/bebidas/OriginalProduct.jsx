import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import { SceneButton, SceneLabel, SceneNote, SceneStar } from '../global/SceneControls';
import styles from './originalProduct.module.css';

export default function OriginalProduct() {
  const en = useStore(isEnglish);
  const facts = en ? [
    ['A taste that stays with you', 'Sweet, unmistakable and the reason so many people keep coming back. Everyday life feels a little less ordinary with Magic Drink.'],
    ['Healthy. Caffeine free.', 'Magic Drink contains no caffeine or harmful ingredients. Its unmistakable taste and the way it makes people feel have made it the world’s favorite.'],
    ['Much more than a drink', 'Hexy’s songs, the Magic Drink Day parades and WonderPop Plaza. A whole culture has grown around the purple can.'],
  ] : [
    ['Un sabor que se queda contigo', 'Dulce, inconfundible y la razón por la que tantos quieren repetir. Con Magic Drink, lo cotidiano se siente un poco menos aburrido.'],
    ['Saludable. Sin cafeína.', 'Magic Drink no contiene cafeína ni ingredientes nocivos. Su sabor y la sensación que deja la han convertido en la favorita del mundo.'],
    ['Mucho más que una bebida', 'Las canciones de Hexy, los desfiles de Magic Drink Day y WonderPop Plaza. Toda una cultura ha crecido alrededor de la lata morada.'],
  ];
  return <div className={styles.product}>
    <section className={styles.hero}>
      <div className={styles.copy}>
        <SceneLabel>{en ? 'THE WORLD’S No. 1 DRINK' : 'LA BEBIDA N.º 1 DEL MUNDO'}</SceneLabel>
        <h1>Magic<br /><em>Drink.</em></h1>
        <SceneNote>{en ? 'A taste you keep coming back for. Healthy, caffeine free, and loved around the world.' : 'Un sabor que no puedes dejar de querer. Saludable, sin cafeína y la favorita del mundo.'}</SceneNote>
        <div className={styles.links}>
          <SceneButton href="/wonderpop-plaza">{en ? 'Visit WonderPop' : 'Visita WonderPop'}</SceneButton>
          <SceneButton href="/#hexy" variant="violet" icon="play">{en ? 'Listen to Hexy' : 'Escucha a Hexy'}</SceneButton>
        </div>
      </div>
      <img src="/image/journey/original.webp" alt="Magic Drink" width="1024" height="1536" className={styles.can} />
    </section>
    <section className={styles.details}>
      <SceneLabel>{en ? 'GET TO KNOW MAGIC DRINK' : 'ASÍ ES MAGIC DRINK'}</SceneLabel>
      <h2>{en ? <>The drink<br /><em>everyone knows.</em></> : <>La bebida que<br /><em>todo el mundo conoce.</em></>}</h2>
      <div className={styles.facts}>{facts.map(([title, body], i) => <article key={i}>
        <span className={styles.factNumber}><SceneStar />0{i + 1}</span>
        <h3>{title}</h3><p>{body}</p>
      </article>)}</div>
      <SceneButton href="/" variant="violet">{en ? 'Explore Magic Drink' : 'Explora Magic Drink'}</SceneButton>
    </section>
  </div>;
}
