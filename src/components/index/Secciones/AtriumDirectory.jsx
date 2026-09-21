import { useEffect, useRef } from 'react';
import styles from '../css/atrium.module.css';

const destinations = [
  { href: '/bebidas', name: 'Magic Drink', es: 'Conoce la bebida', en: 'Meet the drink', icon: 'can' },
  { href: '/hexy', name: 'Hexy', es: 'Entra a su música', en: 'Step into her music', icon: 'music' },
  { href: '/wonderpop-plaza', name: 'Magic Bunnies', es: 'Descubre la plaza', en: 'Explore the plaza', icon: 'bunny' },
];

function DirectoryIcon({ kind }) {
  const name = { can: 'lata', music: 'hexy', bunny: 'bolsa' }[kind];
  return <img src={`/icons/icono_${name}.webp`} width="35" height="35" alt="" />;
}

export default function AtriumDirectory({ en }) {
  const dialog = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    const root = trigger.current?.closest('[data-journey]');
    const leave = event => {
      if (!event.detail.reduced && event.detail.progress < .9) dialog.current?.close();
    };
    root?.addEventListener('journey:scene', leave);
    return () => root?.removeEventListener('journey:scene', leave);
  }, []);
  const questions = en ? [
    ['What is WonderPop Plaza?', 'Magic Drink’s official shopping plaza. A place to explore its shops, music, games and Magic Bunnies.'],
    ['What can I find here?', 'Magic Drink, rabbit plush toys, clothing and accessories, all part of the same world. Choose a destination in the directory to keep exploring.'],
    ['Where can I listen to Hexy?', 'Her music has its own space. Open Hexy from the directory; if you are already listening, the compact player stays with you throughout this landing page.'],
    ['What is Magic Drink Day?', 'A celebration with parades, giant balloons and Hexy on stage. Visit Magic Drink Day to discover the festival.'],
  ] : [
    ['¿Qué es WonderPop Plaza?', 'El centro comercial oficial de Magic Drink. Un lugar para recorrer sus tiendas, descubrir música, juegos y encontrarte con los Magic Bunnies.'],
    ['¿Qué puedo encontrar aquí?', 'Magic Drink, conejitos de peluche, ropa y accesorios que forman parte del mismo mundo. Elige un destino en el directorio para seguir explorando.'],
    ['¿Dónde puedo escuchar a Hexy?', 'Su música tiene su propio espacio. Abre Hexy desde el directorio; si ya estás escuchando una canción, el reproductor compacto te acompaña durante todo este recorrido.'],
    ['¿Qué es Magic Drink Day?', 'Una celebración con desfiles, globos gigantes y Hexy sobre el escenario. Visita Magic Drink Day para conocer el festival.'],
  ];
  return <>
    <div className={styles.directory} data-closing-display data-atrium-directory>
      <div className={styles.directoryHeading}><span aria-hidden="true">✦</span><div><small>WONDERPOP PLAZA</small><h2>{en ? 'Where shall we go?' : '¿Por dónde empezamos?'}</h2></div><span aria-hidden="true">✦</span></div>
      <nav aria-label={en ? 'Plaza directory' : 'Directorio de la plaza'}>
        {destinations.map(destination => <a href={destination.href} key={destination.icon}>
          <DirectoryIcon kind={destination.icon} />
          <span><strong>{destination.name}</strong><small>{en ? destination.en : destination.es}</small></span><b aria-hidden="true">↗</b>
        </a>)}
      </nav>
      <button ref={trigger} type="button" onClick={() => dialog.current.showModal()} aria-haspopup="dialog">{en ? 'Questions about the plaza' : 'Preguntas de la plaza'} <span aria-hidden="true">✧</span></button>
    </div>
    <dialog ref={dialog} className={styles.guide} data-atrium-guide data-lenis-prevent aria-labelledby="atrium-guide-title" onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}>
      <div className={styles.guidePaper}>
        <button className={styles.close} type="button" onClick={() => dialog.current.close()} aria-label={en ? 'Close plaza guide' : 'Cerrar guía de la plaza'}>×</button>
        <small>WONDERPOP PLAZA</small>
        <h2 id="atrium-guide-title">{en ? 'A little guide to the plaza' : 'Una pequeña guía de la plaza'}</h2>
        {questions.map(([question, answer], i) => <details key={question} open={i === 0}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
        <a className={styles.festivalLink} href="/magicdrinkday">{en ? 'Discover Magic Drink Day' : 'Conoce Magic Drink Day'} ↗</a>
        <footer>DJ Sweet Hex</footer>
      </div>
    </dialog>
  </>;
}
