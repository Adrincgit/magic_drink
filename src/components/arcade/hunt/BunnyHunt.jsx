import { useEffect, useRef, useState } from 'react';
import { BUNNIES, collectBunny, useArcadeSave, seeBunnyGuide, discoverArcade } from '../shared/arcadeStore';
import MagicCoin from './MagicCoin';
import usePlazaDialog from '../../index/Secciones/usePlazaDialog';
import {SceneButton} from '../../global/SceneControls';
import { arcadeSound } from '../shared/arcadeSound';
import styles from './bunnyHunt.module.css';

export function BunnySprite({ pose='idle', className='' }) {
  return <span aria-hidden="true" className={`${styles.sprite} ${className}`} data-pose={pose} />;
}
export function HuntBunny({ id, en=false, place='', active=true }) {
  const save=useArcadeSave(), bunny=BUNNIES.find(b=>b.id===id);
  const found=save.found.includes(id), [celebrate,setCelebrate]=useState(false);
  useEffect(()=>{if(!celebrate)return;const timer=setTimeout(()=>setCelebrate(false),1800);return()=>clearTimeout(timer);},[celebrate]);
  async function discover() {
    if(id==='shore'&&!save.guideSeen)window.dispatchEvent(new CustomEvent('arcade:guide'));
    if(found)return;
    if(await collectBunny(id)) {
      setCelebrate(true);arcadeSound('coin');
      window.dispatchEvent(new CustomEvent('arcade:found',{detail:{id}}));
    }
  }
  return <button type="button" className={`${styles.bunny} ${styles[place]||''}`} data-hunt-bunny={id} data-found={found} data-celebrate={celebrate}
    hidden={!active} aria-pressed={found} aria-label={found ? `${bunny[en?'en':'es']} · ${en?'found':'encontrado'}` : `${en?'Find':'Encontrar a'} ${bunny[en?'en':'es']}`}
    onPointerDown={e=>{if(id!=='lookout')e.stopPropagation();e.preventDefault();e.currentTarget.focus({preventScroll:true});}} onClick={discover}>
    <BunnySprite pose={celebrate?'celebrate':'idle'} />
    <span className={styles.name}>{bunny[en?'en':'es']} {found?'♥':'?'}</span>
    {celebrate&&<span className={styles.reward}><MagicCoin/><b>+50 ★</b></span>}
    {found&&!celebrate&&<span className={styles.found} aria-hidden="true">♥</span>}
  </button>;
}

export function ArcadeCabinet({ en=false }) {
  return <a href="/arcade" className={styles.cabinet} data-arcade-cabinet onClick={async e=>{if(e.metaKey||e.ctrlKey)return;e.preventDefault();await discoverArcade();window.location.assign('/arcade');}} aria-label={en?'Play at Bunny Arcade':'Jugar en Bunny Arcade'}>
    <img src="/arcade/sprites/props/cabinet.webp" alt="" width="506" height="900" loading="lazy" />
    <span>{en?'Play':'Jugar'} <b aria-hidden="true">↗</b></span>
  </a>;
}

export function ArcadeWallet({ en=false }) {
  const save=useArcadeSave();
  return <details className={styles.wallet} data-arcade-wallet>
    <summary><span className={styles.coin} aria-hidden="true">★</span><span>{en?'My little treasures':'Mis pequeños tesoros'}<small>{save.found.length}/5 Magic Bunnies</small></span><b>{save.stars} <span aria-hidden="true">◉</span></b></summary>
    <div className={styles.walletBody}>
      <p>{en?'Five friends hide across these pages. Each one gives you 50 coins for Hexy’s shop.':'Cinco amigos se esconden por estas páginas. Cada uno te regala 50 monedas para la tienda de Hexy.'}</p>
      <ul>{BUNNIES.map(b=><li key={b.id} data-found={save.found.includes(b.id)}><b>{save.found.includes(b.id)?'♥':'✧'} {b[en?'en':'es']}</b><span>{save.found.includes(b.id)?(en?'Already your friend!':'¡Ya es tu amigo!'):b.hint[en?1:0]}</span></li>)}</ul>
      <p>{save.stars} ★ · {en?'Stars for your bunny’s wardrobe':'Estrellas para vestir a tu bunny'}</p>
      <a href={save.arcadeFound?'/arcade':'/#directorio-wonderpop'}>{save.arcadeFound?(en?'Go to Bunny Arcade':'Ir a Bunny Arcade'):(en?'Look for the machine in Wonderpop':'Buscar la máquina en Wonderpop')} ↗</a>
      <small>{en?'Saved in this browser. Playing is free.':'Guardado en este navegador. Jugar es gratis.'}</small>
    </div>
  </details>;
}

export function HuntToast({ en=false }) {
  const [found,setFound]=useState(null),save=useArcadeSave();
  const dialog=useRef(null),{open,close}=usePlazaDialog(dialog);
  useEffect(()=>{const show=()=>open();window.addEventListener('arcade:guide',show);return()=>window.removeEventListener('arcade:guide',show);},[open]);
  useEffect(()=>{let timer;const show=e=>{setFound(e.detail.id);clearTimeout(timer);timer=setTimeout(()=>setFound(null),4400);};window.addEventListener('arcade:found',show);return()=>{window.removeEventListener('arcade:found',show);clearTimeout(timer);};},[]);
  const bunny=BUNNIES.find(b=>b.id===found);
  return <><div className={styles.toast} data-open={!!bunny} role="status" aria-live="polite" aria-atomic="true">
    {bunny&&<><MagicCoin className={styles.toastCoin}/><span><b>{save.found.length===5?(en?'The whole gang is here!':'¡Ya está toda la pandilla!'):`${bunny[en?'en':'es']} ${en?'says hello!':'te saluda!'}`}</b><small>{en?'+50 coins · For your adventure':'+50 monedas · Para tu aventura'}</small></span></>}
  </div><dialog ref={dialog} className={styles.guide} data-bunny-guide aria-labelledby="bunny-guide-title" onClose={()=>void seeBunnyGuide()}>
    <button className={styles.guideClose} onClick={close} aria-label={en?'Close invitation':'Cerrar invitación'}>×</button>
    <div className={styles.guideBunny}><BunnySprite pose="celebrate"/><MagicCoin/></div>
    <div className={styles.speech}><span>MIGA · MAGIC BUNNY</span><h2 id="bunny-guide-title">{en?'Psst… shall I tell you a secret?':'Psst… ¿te cuento un secreto?'}</h2>
    <p>{en?'My friends are hiding around these pages! Find their little ears. Each friend has 50 coins for you.':'¡Mis amigos se escondieron por estas páginas! Busca sus orejitas. Cada amigo tiene 50 monedas para ti.'}</p>
    <p>{en?'Then find our arcade machine in Wonderpop Plaza. Hexy needs you for a very big adventure.':'Después encuentra nuestra máquina de arcade en Wonderpop Plaza. Hexy te necesita para una aventura muy grande.'}</p>
    <SceneButton onClick={close} showArrow={false}>{en?'Let’s find them!':'¡Voy a encontrarlos!'}</SceneButton></div>
  </dialog></>;
}
