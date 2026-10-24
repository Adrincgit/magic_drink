import styles from './sceneBunnies.module.css';

// Scenery only: no clicks, currency, rewards, account or browser save.
export default function SceneBunny({ id, place = '', active = true }) {
  return <span className={`${styles.bunny} ${styles[place] || ''}`} hidden={!active} aria-hidden="true" data-scene-bunny={id}>
    <span className={styles.sprite} />
  </span>;
}
