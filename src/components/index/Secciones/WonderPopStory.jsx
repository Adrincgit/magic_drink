import { useRef, useState } from 'react';
import { SceneButton, SceneLabel } from '../../global/SceneControls';
import IllustrationWorld from './IllustrationWorld';
import { FILM_END } from '../../../data/wonderpopFilm';
import { JOURNEY_END } from '../../../data/journeyChapters';
import usePlazaDialog from './usePlazaDialog';
import styles from '../css/wonderpopStory.module.css';

const keepsakes = [
  { id: 'bunny', x: 24, y: 63, es: 'Tu Magic Bunny', en: 'Your Magic Bunny', text: 'Un compañero de orejas largas para recordar una tarde en WonderPop. Peluches, figuras y pequeños detalles llenos de personalidad.', english: 'A long-eared friend to remember an afternoon in WonderPop. Plush toys, figures and little details full of personality.' },
  { id: 'cosplay', x: 53, y: 57, es: 'Un toque de Hexy', en: 'A little Hexy magic', text: 'Sombreros, capas, ropa y varitas. Aquí puedes imaginar tu propia versión del universo de Hexy, de una estrella en la solapa a un cosplay completo.', english: 'Hats, capes, clothing and wands. Imagine your own part in Hexy’s universe, from a star on your lapel to a complete cosplay.' },
  { id: 'music', x: 82, y: 63, es: 'Recuerdos con ritmo', en: 'Memories with a beat', text: 'Magic Drink, música y objetos que guardan un pedacito del recorrido. Porque algunas tardes merecen tener su propia banda sonora.', english: 'Magic Drink, music and objects that hold a piece of your visit. Some afternoons deserve a soundtrack of their own.' },
];
const conversations = [
  { name: 'Luna', x: 47, es: 'Vine por una Magic Drink… y terminamos pasando aquí toda la tarde.', en: 'I came for a Magic Drink… and we ended up spending the whole afternoon here.' },
  { name: 'Mika', x: 66, es: '¿Escuchas? ¡Es Hexy! Esa canción todavía me recuerda al concierto.', en: 'Can you hear it? It’s Hexy! That song still takes me back to the concert.' },
  { name: 'Leo', x: 85, es: 'Yo solo iba a mirar. Pero este Bunny ya decidió venir conmigo.', en: 'I was only going to look. But this Bunny has decided to come home with me.' },
];
const questions = [
  { es: '¿Qué es Magic Drink?', en: 'What is Magic Drink?', answer: 'Es la bebida que da vida a este universo: una chispa para imaginar, compartir y convertir un día cualquiera en una pequeña aventura. Puedes conocer su historia y sus sabores en su propia página.', english: 'It’s the drink at the heart of this universe: a spark for imagination, sharing and turning an ordinary day into a little adventure. Explore its story and flavors on its own page.', href: '/bebidas', link: 'Conoce Magic Drink', enLink: 'Meet Magic Drink' },
  { es: '¿Quién es Hexy?', en: 'Who is Hexy?', answer: 'Nuestra estrella de la música. Su mundo mezcla canciones, magia y una personalidad que se siente en cada escenario. El reproductor te acompaña por la visita; tú eliges cuándo darle play.', english: 'Our musical star. Her world brings together songs, magic and a personality that shines on every stage. The player stays with you on your visit; you choose when to press play.', href: '/hexy', link: 'Entra al mundo de Hexy', enLink: 'Enter Hexy’s world' },
  { es: '¿Qué encuentro en la plaza?', en: 'What can I find at the plaza?', answer: 'Tiendas temáticas, Magic Bunnies, ropa, cosplay, recuerdos y rincones para compartir la música de Hexy. WonderPop reúne todo ese mundo en un mismo lugar. La visita continúa en la página de la plaza.', english: 'Themed shops, Magic Bunnies, clothing, cosplay, souvenirs and corners to share Hexy’s music. WonderPop brings that entire world together. Continue your visit on the plaza page.', href: '/wonderpop-plaza', link: 'Explora WonderPop Plaza', enLink: 'Explore WonderPop Plaza' },
  { es: '¿Se puede comprar aquí?', en: 'Can I shop here?', answer: 'Esta es una experiencia de un universo ficticio. Las tiendas y los objetos muestran lo que imaginamos para WonderPop; las fotografías son conceptos visuales. No se realizan compras ni reservas desde este recorrido.', english: 'This is an experience set in a fictional universe. The shops and objects show what we imagine for WonderPop; the photographs are visual concepts. There are no purchases or bookings in this journey.', href: '/nosotros', link: 'Conoce nuestra historia', enLink: 'Meet the world’s creators' },
];

export default function WonderPopStory({ en = false, filmMode = false }) {
  const dialog = useRef(null), { open, close } = usePlazaDialog(dialog);
  const [selected, setSelected] = useState(keepsakes[0]);
  const [speaker, setSpeaker] = useState(0), [question, setQuestion] = useState(0);
  const faq = questions[question], visitor = conversations[speaker];
  const show = item => { setSelected(item); open(); };
  return <>
    {!filmMode && <>
    <section className={`${styles.scene} ${styles.shop}`} data-world-scene="gallery" id="galeria-wonderpop" aria-label={en ? 'The souvenir boutique' : 'La tienda de los recuerdos'}>
      <div className={styles.visual}><IllustrationWorld source="shop-v20.webp" kind="shop" from={1.075} to={1.43} /></div>
      <div className={styles.shade} />
      <div className={styles.shopCopy} data-world-copy="gallery">
        <SceneLabel>07 / {en ? 'THE SOUVENIRS' : 'LOS RECUERDOS'}</SceneLabel>
        <h2>{en ? <>Take a little<br />{' '}<em>WonderPop home.</em></> : <>Un pedacito<br />{' '}<em>de WonderPop.</em></>}</h2>
        <p>{en ? 'Find your Bunny. Try on a little magic. Discover the stories behind every window.' : 'Encuentra a tu Bunny. Prueba un poco de magia. Descubre las historias detrás de cada escaparate.'}</p>
      </div>
      <div className={styles.hotspotPlane} data-shop-hotspots>
        {keepsakes.map(item => <button key={item.id} type="button" className={styles.hotspot} style={{ '--x': `${item.x}%`, '--y': `${item.y}%` }} onClick={() => show(item)} aria-label={`${en ? 'Explore' : 'Explorar'}: ${en ? item.en : item.es}`} data-keepsake={item.id}>
          <i aria-hidden="true">✦</i><span>{en ? item.en : item.es}<b aria-hidden="true">＋</b></span>
        </button>)}
      </div>
      <p className={styles.shopHint}>{en ? 'TOUCH A SPARKLE TO LOOK CLOSER · OR KEEP SCROLLING' : 'TOCA UN DESTELLO PARA MIRAR DE CERCA · O SIGUE BAJANDO'}</p>
    </section>

    <section className={`${styles.scene} ${styles.lounge}`} data-world-scene="visitors" id="entre-amigos" aria-label={en ? 'Conversations in WonderPop' : 'Conversaciones en WonderPop'}>
      <div className={styles.visual}><IllustrationWorld source="lounge-v20.webp" gesture="lounge-gesture-v20.webp" kind="lounge" from={1.43} to={1.75} /></div>
      <div className={styles.shade} />
      <div className={styles.loungeCopy} data-world-copy="visitors">
        <SceneLabel>08 / {en ? 'AMONG FRIENDS' : 'ENTRE AMIGOS'}</SceneLabel>
        <h2>{en ? <>The best part?<br />{' '}<em>Sharing it.</em></> : <>Lo mejor es<br />{' '}<em>compartirlo.</em></>}</h2>
        <p>{en ? 'A drink, a song, a reason to stay a little longer.' : 'Una bebida, una canción, una excusa para quedarse un ratito más.'}</p>
      </div>
      <div className={styles.conversation} style={{ '--speaker-x': `${visitor.x}%` }}>
        <div className={styles.bubble} aria-live="polite" aria-atomic="true"><span>{visitor.name}</span><p key={speaker}>{en ? visitor.en : visitor.es}</p></div>
        <div className={styles.voices} aria-label={en ? 'Join the conversation' : 'Escucha la conversación'}>
          {conversations.map((person, i) => <button key={person.name} type="button" onClick={() => setSpeaker(i)} aria-pressed={i === speaker}>{person.name}<span aria-hidden="true">{i === speaker ? ' ♪' : ' ···'}</span></button>)}
        </div>
        <small>{en ? 'A MOMENT WITH CHARACTERS FROM OUR WORLD' : 'UNA CHARLA ENTRE PERSONAJES DE NUESTRO UNIVERSO'}</small>
      </div>
    </section>

    </>}

    <section className={`${styles.scene} ${styles.interview}`} data-world-scene="interview" data-pose={question % 2} id="preguntas-wonderpop" aria-label={en ? 'A few questions before you go' : 'Unas preguntas antes de irte'}>
      <div className={styles.visual}><IllustrationWorld source="interview-v20.webp" gesture="interview-gesture-v20.webp" kind="interview" from={filmMode ? FILM_END : 1.75} to={filmMode ? JOURNEY_END : 2.18} /></div>
      <div className={styles.interviewCopy} data-world-copy="interview" data-lenis-prevent>
        <SceneLabel>{filmMode ? '07' : '09'} / {en ? 'BEFORE YOU GO' : 'ANTES DE IRTE'}</SceneLabel>
        <h2>{en ? <>One more<br />{' '}<em>question…</em></> : <>Una última<br />{' '}<em>preguntita…</em></>}</h2>
        <div className={styles.questions} aria-label={en ? 'Choose a question' : 'Elige una pregunta'}>
          {questions.map((item, i) => <button key={item.es} type="button" id={`question-${i}`} aria-controls="wonderpop-answer" aria-expanded={i === question} onClick={() => setQuestion(i)}><span>{String(i + 1).padStart(2, '0')}</span>{en ? item.en : item.es}<b aria-hidden="true">{i === question ? '−' : '+'}</b></button>)}
        </div>
        <div id="wonderpop-answer" className={styles.answer} role="region" aria-labelledby={`question-${question}`} aria-live="polite" aria-atomic="true">
          <span>{en ? 'THE WONDERPOP TEAM' : 'EL EQUIPO DE WONDERPOP'}</span>
          <p key={question}>{en ? faq.english : faq.answer}</p>
          <a href={faq.href}>{en ? faq.enLink : faq.link} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <span className={styles.employeeLabel}>{en ? 'Ask away. You’re among friends.' : 'Pregunta con confianza. Estás entre amigos.'}</span>
    </section>

    <section className={styles.farewell} data-world-farewell aria-label={en ? 'The visit ends here' : 'El final del recorrido'}>
      <span className={styles.endStar} aria-hidden="true">✦</span>
      <SceneLabel>{en ? 'THANK YOU FOR COMING ALONG' : 'GRACIAS POR VENIR'}</SceneLabel>
      <h2>{en ? <>The visit ends here.<br />{' '}<em>The magic stays with you.</em></> : <>La visita termina aquí.<br />{' '}<em>La magia sigue contigo.</em></>}</h2>
      <p>{en ? 'There are more stories behind every door. Where shall we go next?' : 'Detrás de cada puerta hay más historias. ¿Por dónde seguimos?'}</p>
      <nav aria-label={en ? 'Continue discovering' : 'Sigue descubriendo'}>
        <SceneButton href="/bebidas">Magic Drink</SceneButton>
        <SceneButton href="/hexy">Hexy</SceneButton>
        <SceneButton href="/wonderpop-plaza">WonderPop Plaza</SceneButton>
      </nav>
      <div className={styles.lastLinks}><a href="/nosotros">{en ? 'Our story' : 'Nuestra historia'}</a><button type="button" data-go-world="0">{en ? 'Experience it again ↑' : 'Vuelve a vivirlo ↑'}</button></div>
    </section>

    <div className={styles.transition} data-story-transition aria-hidden="true">
      <svg viewBox="0 0 200 200"><defs><linearGradient id="journey-star-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff2bb" /><stop offset=".48" stopColor="#edb84c" /><stop offset="1" stopColor="#a85a30" /></linearGradient></defs><path d="M100 7 125 69 191 76 141 120 155 185 100 150 45 185 59 120 9 76 75 69Z" fill="url(#journey-star-gold)" stroke="#ffedb0" strokeWidth="3" /><path d="m100 7 0 95 25-33Zm91 69-91 26 41 18Zm-36 109-55-83v48ZM45 185l55-83-41 18ZM9 76l91 26-25-33Z" fill="#fff2b7" opacity=".5" /></svg>
    </div>

    {!filmMode && <dialog ref={dialog} className={styles.album} aria-labelledby="keepsake-title" data-keepsake-dialog data-lenis-prevent onClick={event => { if (event.target === dialog.current) close(); }}>
      <button className={styles.close} type="button" onClick={close} aria-label={en ? 'Close album' : 'Cerrar álbum'}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg></button>
      <img src={`/image/journey/photo-${selected.id}-v20.webp`} alt={en ? `Concept photograph: ${selected.en}` : `Fotografía conceptual: ${selected.es}`} width="1536" height="1024" loading="lazy" draggable="false" />
      <div className={styles.albumText}><span>{en ? 'THE WONDERPOP KEEPSAKE ALBUM' : 'EL ÁLBUM DE RECUERDOS DE WONDERPOP'}</span><h2 id="keepsake-title">{en ? selected.en : selected.es}</h2><p>{en ? selected.english : selected.text}</p><SceneButton href="/wonderpop-plaza">{en ? 'Discover WonderPop Plaza' : 'Conoce WonderPop Plaza'}</SceneButton><small>{en ? 'Imagined objects · AI-created concept photography · Not for sale' : 'Objetos imaginados · Fotografía conceptual creada con IA · Sin venta'}</small></div>
    </dialog>}
  </>;
}
