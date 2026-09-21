import MagicBunny from './MagicBunny';
import styles from '../css/plazaLife.module.css';

export default function AtriumLife({ en }) {
  return <div className={styles.atriumLife} data-atrium-life>
    <div className={styles.farFriends} data-atrium-friends>
      <MagicBunny en={en} className={styles.farBunny} offset={7} />
      <img className={styles.farPlanter} src="/image/journey/garden-planter-v10.webp" alt="" width="1024" height="1024" loading="lazy" />
    </div>
    <img className={`${styles.pier} ${styles.pierLeft}`} data-atrium-pier="left" src="/image/journey/plaza-pier-v17.webp" alt="" width="1024" height="1536" loading="lazy" />
    <img className={`${styles.pier} ${styles.pierRight}`} data-atrium-pier="right" src="/image/journey/plaza-pier-v17.webp" alt="" width="1024" height="1536" loading="lazy" />
    <div className={styles.nearFriends} data-atrium-near>
      <MagicBunny en={en} className={styles.hostBunny} from={.87} interactive />
      <img className={styles.nearPlanter} src="/image/journey/garden-planter-v10.webp" alt="" width="1024" height="1024" loading="lazy" />
    </div>
  </div>;
}
