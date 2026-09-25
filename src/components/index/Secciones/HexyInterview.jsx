import { useEffect, useRef, useState } from 'react';
import { FILM_END } from '../../../data/wonderpopFilm';
import { JOURNEY_END } from '../../../data/journeyChapters';
import { hexyQuestions, interviewTopics, interviewTour, interviewMoment, interviewStop } from '../../../data/hexyInterview';
import { INTERVIEW_READY } from '../../../data/hexyInterviewTiming';
import HexyReply from './HexyReply';
import usePlazaDialog from './usePlazaDialog';
import styles from '../css/hexyInterview.module.css';

const art = '/image/journey/hexy-interview/';
const poses = ['listen', 'explain', 'excited', 'thoughtful'];

export default function HexyInterview({ en = false }) {
  const host = useRef(null), dialog = useRef(null), beat = useRef(0);
  const { open, close } = usePlazaDialog(dialog);
  const [moment, setMoment] = useState({ index: 0, answer: false });
  const [selected, setSelected] = useState(null);
  const [topic, setTopic] = useState('all');
  const [loaded, setLoaded] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [active, setActive] = useState(false);
  const lang = en ? 1 : 0;
  const question = hexyQuestions.find(q => q.id === (selected || interviewTour[moment.index]));
  const answerVisible = reduced || (selected ? !reacting : moment.answer);
  const pose = answerVisible ? question.pose : 'listen';

  useEffect(() => {
    const el = host.current, root = el.closest('[data-journey]');
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let progress = Number(root.dataset.worldProgress || 0);
    let blocked = false;
    const update = event => {
      if (event?.detail) progress = event.detail.progress;
      const current = interviewMoment(progress);
      const active = !document.hidden && !blocked && (media.matches || (progress >= INTERVIEW_READY && progress < JOURNEY_END - .125));
      el.dataset.interviewActive = String(active);
      setActive(active);
      el.style.setProperty('--interview-p', current.progress.toFixed(4));
      if (progress > FILM_END - .25 || media.matches) setLoaded(true);
      if (!media.matches) {
        if (current.index !== beat.current) { beat.current = current.index; setSelected(null); }
        const answer = current.started && current.local >= .16;
        setMoment(previous => previous.index === current.index && previous.answer === answer ? previous : { index: current.index, answer });
      }
    };
    const preference = () => { setReduced(media.matches); update(); };
    const modal = event => { blocked = event.detail.open; update(); };
    root.addEventListener('journey:scene', update);
    root.addEventListener('journey:modal', modal);
    document.addEventListener('visibilitychange', update);
    media.addEventListener('change', preference); preference();
    return () => { root.removeEventListener('journey:scene', update); root.removeEventListener('journey:modal', modal); document.removeEventListener('visibilitychange', update); media.removeEventListener('change', preference); };
  }, []);

  useEffect(() => {
    if (!selected || reduced) { setReacting(false); return; }
    setReacting(true);
    const timer = setTimeout(() => setReacting(false), 360);
    return () => clearTimeout(timer);
  }, [selected, reduced]);

  function ask(id) {
    if (id !== selected) { setReacting(!reduced); setSelected(id); }
    close();
  }

  return <section ref={host} id="preguntas-wonderpop" className={styles.scene} data-world-scene="interview" data-hexy-interview data-pose={pose} data-question={question.id} data-answer-visible={answerVisible} aria-label={en ? 'Hexy answers your questions' : 'Hexy responde a tus preguntas'}>
    <div className={styles.world} aria-hidden="true">
      {loaded && <>
        <img className={styles.backdrop} data-interview-layer="plaza" src={`${art}plaza.webp`} alt="" width="1672" height="941" draggable="false" />
        <div className={styles.sunlight} />
        <div className={styles.sparks}>{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--i': i, left: `${8 + i * 7}%`, top: `${21 + i * 19 % 62}%` }} />)}</div>
        <div className={styles.character} data-interview-layer="hexy">
          {poses.map(name => <div key={name} className={styles.pose} data-character-pose={name} data-current={name === pose}>
            <img src={`${art}hexy-${name}.webp`} alt="" width="1024" height="1024" draggable="false" />
            <img className={styles.blink} src={`${art}hexy-${name}-blink.webp`} alt="" width="1024" height="1024" draggable="false" />
          </div>)}
        </div>
        <img className={styles.lantern} data-interview-layer="lantern" src={`${art}foreground.webp`} alt="" width="1672" height="941" draggable="false" />
        <img className={styles.flowers} data-interview-layer="flowers" src={`${art}foreground.webp`} alt="" width="1672" height="941" draggable="false" />
      </>}
    </div>
    <div className={styles.shade} aria-hidden="true" />
    <div className={styles.copy} data-world-copy="interview">
      <div className={styles.conversation}>
      <div className={styles.heading} data-interview-heading>
        <span className={styles.eyebrow}><span aria-hidden="true">✦</span> {en ? 'A MOMENT WITH OUR STAR' : 'UN RATITO CON NUESTRA ESTRELLA'}</span>
        <h2>{en ? 'Hexy answers' : 'Hexy responde'}</h2>
        <p>{en ? 'Between songs and questions.' : 'Entre canciones y preguntas.'}</p>
      </div>
      <div className={styles.exchange}>
        <div className={styles.question}>
          <span className={styles.caption}>{en ? 'YOU ASK' : 'TÚ PREGUNTAS'} <small>{selected ? '✦' : `${String(moment.index + 1).padStart(2, '0')} / 03`}</small></span>
          <h3 id="hexy-question">{question.question[lang]}</h3>
        </div>
        <HexyReply text={question.answer[lang]} visible={answerVisible} active={active} reduced={reduced} en={en} />
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.askButton} onClick={open} aria-haspopup="dialog"><span aria-hidden="true">✧</span> {en ? 'Ask her something else' : 'Hazle otra pregunta'} <span aria-hidden="true">＋</span></button>
        <button type="button" className={styles.continue} data-go-world={reduced ? undefined : moment.index < 2 ? interviewStop(moment.index + 1) : JOURNEY_END - .06} onClick={reduced ? () => host.current.closest('[data-journey]').querySelector('[data-world-farewell]').scrollIntoView({ behavior: 'instant' }) : undefined}>{en ? 'Continue' : 'Continuar'} <span aria-hidden="true">↓</span></button>
      </div>
      <p className={styles.scrollHint}>{en ? 'SCROLL TO FOLLOW THE CONVERSATION' : 'DESLIZA PARA SEGUIR LA CONVERSACIÓN'}</p>
      </div>
    </div>
    <dialog ref={dialog} className={styles.questionsDialog} aria-labelledby="hexy-topics-title" data-hexy-questions data-lenis-prevent onClick={e => { if (e.target === dialog.current) close(); }}>
      <button type="button" className={styles.close} onClick={close} aria-label={en ? 'Close questions' : 'Cerrar preguntas'}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg></button>
      <span className={styles.eyebrow}>✦ {en ? 'YOUR TURN' : 'AHORA TE TOCA A TI'}</span>
      <h2 id="hexy-topics-title">{en ? 'What would you ask me?' : '¿Qué quieres preguntarme?'}</h2>
      <div className={styles.topics} aria-label={en ? 'Question topics' : 'Temas de las preguntas'}>
        {interviewTopics.map(item => <button key={item.id} type="button" aria-pressed={topic === item.id} onClick={() => setTopic(item.id)}>{item.label[lang]}</button>)}
      </div>
      <div className={styles.questionList}>
        {hexyQuestions.filter(q => topic === 'all' || topic === q.topic).map(q => <button key={q.id} type="button" onClick={() => ask(q.id)} data-ask={q.id} aria-pressed={question.id === q.id}>{q.question[lang]}<span aria-hidden="true">↗</span></button>)}
      </div>
    </dialog>
  </section>;
}
