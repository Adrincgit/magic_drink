import React from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../../data/variables';
import styles from '../css/hexySeccion3.module.css';
import { Play, Pause } from 'lucide-react';
import { useHexyAudio } from '../components/HexyAudioProvider';

const content = {
  es: {
    eyebrow: 'El Sonido',
    title: 'Coros de ',
    titleAccent: 'Magic Bunnies',
    subtitle:
      'Esas voces peque\u00F1as, dulces y casi imposibles de separar del beat aparecen en varias canciones de Hexy.',
    heading: 'Las voces que saltan entre el beat',
    paragraphs: [
      'Los Magic Bunnies son el coro juguet\u00F3n de Hexy: voces agudas, suaves y brillantes, como ni\u00F1os cantando dentro de un filtro de conejito digital.',
      'No ocupan el centro de la canci\u00F3n. Responden a Hexy, repiten s\u00EDlabas, hacen peque\u00F1os ecos y convierten cada hook en algo m\u00E1s f\u00E1cil de tararear.',
    ],
    studioBadge: 'Chorus take 03',
    studioCaption: 'Grabaci\u00F3n nocturna con los Magic Bunnies',
    rumorText:
      'Algunos fans dicen que los coros se sienten m\u00E1s n\u00EDtidos despu\u00E9s de una Magic Drink. La empresa lo llama producci\u00F3n pop bien hecha.',
    rumorSource: '\u2014 Comentario recurrente en comunidades de Hexy',
    signatureHeading: 'La firma que aparece y desaparece',
    signatureCopy:
      'De vez en cuando, en cr\u00E9ditos peque\u00F1os, posters o publicaciones oficiales, aparece una firma: DJ Sweet Hex. No hay rostro, entrevistas ni explicaci\u00F3n p\u00FAblica. Solo ese nombre, como una nota al margen que los fans coleccionan.',
    details: [
      {
        title: 'Magic Bunnies',
        body: 'Sus coros suenan tiernos, r\u00E1pidos y ligeramente sint\u00E9ticos. Entran como respuesta, eco o peque\u00F1a risa mel\u00F3dica dentro del beat.',
      },
      {
        title: 'Hook pegajoso',
        body: 'Las frases cortas se repiten con variaciones peque\u00F1as, suficientes para sentirse nuevas sin dejar de quedarse en la cabeza.',
      },
      {
        title: 'Cr\u00E9ditos borrosos',
        body: 'La firma misteriosa no se anuncia como protagonista. Aparece peque\u00F1a, casi escondida, y eso la vuelve m\u00E1s comentada.',
      },
    ],
  },
  en: {
    eyebrow: 'The Sound',
    title: 'Magic Bunnies ',
    titleAccent: 'Chorus',
    subtitle:
      'Those tiny, sweet voices that feel almost inseparable from the beat appear in several Hexy songs.',
    heading: 'The voices bouncing through the beat',
    paragraphs: [
      'The Magic Bunnies are Hexy\u2019s playful chorus: bright, high little voices, like children singing through a digital bunny filter.',
      'They do not take the center of the song. They answer Hexy, repeat syllables, create tiny echoes, and make every hook easier to hum.',
    ],
    studioBadge: 'Chorus take 03',
    studioCaption: 'Late-night recording with the Magic Bunnies',
    rumorText:
      'Some fans say the choruses feel sharper after a Magic Drink. The company calls it polished pop production.',
    rumorSource: '\u2014 Recurring comment in Hexy fan communities',
    signatureHeading: 'The signature that appears and vanishes',
    signatureCopy:
      'Every now and then, in tiny credits, posters, or official posts, a signature appears: DJ Sweet Hex. No face, no interviews, no public explanation. Just that name, like a margin note fans keep collecting.',
    details: [
      {
        title: 'Magic Bunnies',
        body: 'Their backing vocals sound tender, quick, and slightly synthetic. They enter as responses, echoes, or tiny melodic laughs inside the beat.',
      },
      {
        title: 'Sticky hook',
        body: 'Short phrases repeat with small variations, enough to feel new while still staying in your head.',
      },
      {
        title: 'Blurred credits',
        body: 'The mysterious signature is not announced as the star. It appears small, almost hidden, which makes fans talk about it more.',
      },
    ],
  },
};

export default function HexySeccion3() {
  const ingles = useStore(isEnglish);
  const t = ingles ? content.en : content.es;
  const { playlist: tracks, trackIndex, isPlaying, chooseTrack, pause } = useHexyAudio();

  return (
    <section className={styles.section}>
      <div className={styles.backdrop} />

      <div className={styles.shell}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h2 className={styles.sectionTitle}>
            {t.title}
            <span className={styles.titleAccent}>{t.titleAccent}</span>
          </h2>
          <p className={styles.sectionSubtitle}>{t.subtitle}</p>
        </div>

        <div className={styles.soundGrid}>
          <figure className={styles.studioFrame}>
            <img
              src="/image/hexy/hexy-magic-bunnies-studio.webp"
              alt={t.studioCaption}
              className={styles.studioImage}
              loading="lazy"
              decoding="async"
            />
            <figcaption className={styles.studioCaption}>
              <span>{t.studioBadge}</span>
              {t.studioCaption}
            </figcaption>
          </figure>

          <div className={styles.soundCopy}>
            <h3>{t.heading}</h3>
            {t.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}

            <div className={styles.rumor}>
              <p className={styles.rumorText}>{t.rumorText}</p>
              <span className={styles.rumorSource}>{t.rumorSource}</span>
            </div>
          </div>
        </div>

        <div className={styles.signatureBand}>
          <div>
            <span className={styles.signatureKicker}>{ingles ? 'Tiny credit' : 'Cr\u00E9dito m\u00EDnimo'}</span>
            <h3>{t.signatureHeading}</h3>
          </div>
          <p>{t.signatureCopy}</p>
        </div>

        <div id="canciones" className={styles.musicShelf} tabIndex={-1} aria-labelledby="hexy-songs-heading">
          <div className={styles.musicHeading}>
            <div>
              <span className={styles.signatureKicker}>{ingles ? 'Hexy on repeat' : 'Hexy en repeat'}</span>
              <h3 id="hexy-songs-heading">{ingles ? 'Find your next chorus.' : 'Encuentra tu próximo coro.'}</h3>
            </div>
            <p>{ingles ? 'Choose a song. Let the music follow you.' : 'Elige una canción. Que la música te acompañe.'}</p>
          </div>
          <div className={styles.trackGrid}>
          {tracks.map((track, index) => (
            <button type="button" key={track.id}
              className={`${styles.trackCard} ${index === trackIndex && isPlaying ? styles.trackActive : ''}`}
              aria-label={`${index === trackIndex && isPlaying ? (ingles ? 'Pause' : 'Pausar') : (ingles ? 'Play' : 'Reproducir')} ${track.title}`}
              aria-pressed={index === trackIndex && isPlaying}
              onClick={() => index === trackIndex && isPlaying ? pause() : chooseTrack(index)}>
              <img
                src={track.cover}
                alt=""
                className={styles.trackImage}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.trackPlay} aria-hidden="true">
                {index === trackIndex && isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
              </span>
              <span className={styles.trackOverlay}>
                <span className={styles.trackStatus}>{index === trackIndex && isPlaying ? (ingles ? 'Now playing' : 'Ahora suena') : `${String(index + 1).padStart(2, '0')} / HEXY`}</span>
                <span className={styles.trackTitle}>{track.title}</span>
                <span className={styles.trackCredit}>{track.artist}</span>
              </span>
            </button>
          ))}
          </div>
        </div>

        <div className={styles.details}>
          {t.details.map((detail) => (
            <div key={detail.title} className={styles.detail}>
              <h4>{detail.title}</h4>
              <p>{detail.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
