import {useStore} from '@nanostores/react';
import {isEnglish} from '../../data/variables';
import {ArcadeCabinet,HuntBunny,HuntToast} from './BunnyHunt';
import styles from './bunnyHunt.module.css';
export default function ArcadeNook(){
 const en=useStore(isEnglish);
 return <section className={styles.nook} data-arcade-nook aria-label={en?'A quiet corner of Wonderpop':'Un rincón de Wonderpop'}>
  <div className={styles.nookCaption}><span>WONDERPOP PLAZA</span><h2>{en?'Some corners keep secrets.':'Hay rincones que guardan secretos.'}</h2><p>{en?'Take a closer look.':'Acércate un poquito.'}</p></div>
  <div className={styles.nookWorld}><ArcadeCabinet en={en}/><HuntBunny id="plaza" place="nookBunny" en={en}/><img className={styles.nookPlant} src="/image/journey/garden-planter-v10.webp" alt="" loading="lazy"/></div>
  <HuntToast en={en}/>
 </section>;
}
