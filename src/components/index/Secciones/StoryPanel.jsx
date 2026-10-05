import { SceneStar } from '../../global/SceneControls';
import styles from '../css/storyPanel.module.css';

// A scalable illustrated page: the artwork is decorative, while all copy and
// controls remain ordinary accessible HTML. The camera owns its visibility.
export default function StoryPanel({ number, label, title, children, compactText, actions, en = false, music = false }) {
  return <div className={styles.panel} data-story-panel data-story-music={music}>
    <svg className={styles.frame} viewBox="0 0 1000 280" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className={styles.shadow} d="M30 21 968 17 990 37 985 247 964 271 34 264 10 244 13 45Z" />
      <path className={styles.cover} d="M30 9 966 13 986 31 984 238 965 258 33 252 13 235 15 30Z" />
      <path className={styles.gilt} d="m37 19 921 4 18 14-2 197-15 14-919-5-17-13 1-194Z" />
      <path className={styles.paper} d="M44 29Q230 20 497 33Q743 22 955 31L963 231Q729 221 499 235Q225 222 40 233Z" />
      <path className={styles.pageLine} d="M42 237q232-11 455 4 250-13 460-3M47 40q244-10 448 0M509 40q241-9 438 1" />
      <path className={styles.highlight} d="m27 45 1-12 11-8M42 18l118 1M968 218v13l-10 10" />
      <path className={styles.fold} d="m942 230 20-24 1 25Z" />
    </svg>
    <svg className={`${styles.frame} ${styles.portraitFrame}`} viewBox="0 0 360 420" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className={styles.shadow} d="m15 13 330 3 10 15-1 368-13 15-326-5-10-15 2-367Z" />
      <path className={styles.cover} d="m16 5 328 5 10 12-3 368-13 13-324-7-9-13 3-364Z" />
      <path className={styles.gilt} d="m20 14 318 4 8 11-3 354-10 10-313-5-8-11 3-350Z" />
      <path className={styles.paper} d="M24 24q150-5 311 2l3 351q-159-8-317 2Z" />
      <path className={styles.pageLine} d="M25 32q148-4 307 2M22 383q154-7 312 0" />
      <path className={styles.highlight} d="m13 30 2-9 7-5m1-2 42 1m278 349-1 17-9 10" />
      <path className={styles.fold} d="m321 377 16-18 1 18Z" />
    </svg>
    <div className={styles.seal} aria-hidden="true"><SceneStar /><small>{number}</small></div>
    <div className={styles.content}>
      <div className={styles.heading}>
        <p className={styles.label} data-scene-label>{label}</p>
        <h2>{title}</h2>
      </div>
      <div className={styles.narration}>
        <p className={styles.body} data-scene-note><span className={compactText ? styles.fullCopy : undefined}>{children}</span>{compactText && <span className={styles.compactCopy}>{compactText}</span>}</p>
        <div className={styles.actions}>{actions}</div>
      </div>
    </div>
    <span className={styles.bookmark} aria-hidden="true">{en ? 'MAGIC DRINK · THE STORY' : 'MAGIC DRINK · EL RELATO'}</span>
  </div>;
}
