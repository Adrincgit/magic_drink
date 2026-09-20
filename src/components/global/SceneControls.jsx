import styles from './css/sceneControls.module.css';

export function SceneStar({ className = '' }) {
  return <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <path d="m20 3 5.4 10.9 12 1.8-8.7 8.5 2.1 12L20 30.5 9.2 36.2l2.1-12-8.7-8.5 12-1.8Z" fill="currentColor" stroke="#674034" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="m20 7-4 10-9 1" fill="none" stroke="#fff4c9" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}

/** A real link/button with an illustrated frame. Decorations never take focus. */
export function SceneButton({ children, href, variant = 'gold', icon = 'arrow', showArrow = true, size = 'md', fullWidth = false, className = '', ...props }) {
  const Tag = href ? 'a' : 'button';
  return <Tag {...(!href ? { type: 'button' } : {})} {...props} href={href}
    className={`${styles.button} ${styles[variant] || ''} ${styles[size] || ''} ${fullWidth ? styles.fullWidth : ''} ${className}`} data-scene-control>
    <svg className={styles.frame} viewBox="0 0 280 68" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className={styles.extrusion} d="M17 8 260 6 275 19 276 52 260 65 18 63 4 51 5 21Z" />
      <path className={styles.face} d="M18 3 259 5 275 16 274 46 259 59 18 57 4 45 5 17Z" />
      <path className={styles.innerLine} d="m21 9 235 2 13 9-1 23-12 10-235-2-11-9 1-22Z" />
      <path className={styles.shine} d="m26 13 221 2M13 24v12" />
    </svg>
    <span className={styles.seal} aria-hidden="true"><SceneStar /></span>
    <span className={styles.buttonText}>{children}</span>
    {showArrow && <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {icon === 'play' ? <path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none" /> : <path d="M5 18 18 5M6 5h12v12" />}
    </svg>}
  </Tag>;
}

export function SceneLabel({ children, className = '' }) {
  return <p className={`${styles.label} ${className}`} data-scene-label>
    <SceneStar /><span>{children}</span><i aria-hidden="true" />
  </p>;
}

export function SceneNote({ children, className = '' }) {
  return <p className={`${styles.note} ${className}`} data-scene-note>{children}</p>;
}
