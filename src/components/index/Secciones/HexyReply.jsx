import { useEffect, useRef, useState } from 'react';
import styles from '../css/hexyInterview.module.css';

export default function HexyReply({ text, visible, active, reduced, en }) {
  // A reply resumes where it stopped when a dialog opens or the scene leaves
  // view. Completed replies remain readable when scrolling backwards.
  const progress = useRef(new Map());
  const [reveal, setReveal] = useState({ text: '', count: 0 });
  const count = reduced ? text.length : reveal.text === text ? reveal.count : progress.current.get(text) || 0;
  const typing = visible && count < text.length;
  const listening = en ? 'Hexy listens…' : 'Hexy te escucha…';

  useEffect(() => {
    let count = reduced ? text.length : progress.current.get(text) || 0;
    let timer;
    let cancelled = false;
    setReveal({ text, count });
    if (reduced) progress.current.set(text, count);
    if (!visible || !active || reduced || count >= text.length) return;
    const type = () => {
      if (cancelled) return;
      count = progress.current.get(text) || 0;
      if (count >= text.length) return;
      count += 1;
      progress.current.set(text, count);
      setReveal({ text, count });
      // Time drives the voice; scroll only selects the conversational beat.
      const char = text[count - 1];
      const pause = /[.!?…]/.test(char) ? 150 : /[,;:]/.test(char) ? 65 : 18;
      if (count < text.length) timer = setTimeout(type, pause);
    };
    timer = setTimeout(type, 100);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [text, visible, active, reduced]);

  function showAll() {
    progress.current.set(text, text.length);
    setReveal({ text, count: text.length });
  }

  return <div className={styles.answer} data-hexy-answer data-visible={visible} data-typing={typing}>
    <div className={styles.caption}>
      <span>HEXY <span className={styles.voiceStar} aria-hidden="true">✦</span></span>
      <button type="button" className={styles.showAll} onClick={showAll} disabled={!typing} style={{ visibility: typing ? 'visible' : 'hidden' }}>{en ? 'Show all' : 'Mostrar todo'} <span aria-hidden="true">↠</span></button>
    </div>
    <div className={styles.replyBody} aria-hidden="true">
      <p className={styles.replyMeasure}>{text}</p>
      {visible ? <p className={styles.typed} data-hexy-typed>{text.slice(0, count)}{typing && <span className={styles.caret} data-paused={!active} />}</p>
        : <p className={styles.listening}>{listening} <span>···</span></p>}
    </div>
    <div className={styles.srOnly} aria-live="polite" aria-atomic="true" role="region" aria-labelledby="hexy-question">{visible ? text : listening}</div>
  </div>;
}
