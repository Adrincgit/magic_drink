import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import { ACCESSORIES, beginRun, equipAccessory, finishRun, recoverRun, useArcadeSave } from './arcadeStore';
import { ArcadeWallet, BunnySprite } from './BunnyHunt';
import { createRun, jump, RUN_SECONDS, step } from './runnerModel';
import { loadRunnerArt, renderRunner } from './runnerCanvas';
import { arcadeSound } from './arcadeSound';
import { SceneButton } from '../global/SceneControls';
import IllustratedMenu, { IllustratedMenuTrigger } from '../global/IllustratedMenu';
import useIllustratedFinish from '../global/useIllustratedFinish';
import usePlazaDialog from '../index/Secciones/usePlazaDialog';
import styles from './bunnyArcade.module.css';
import HexyFinish from '../hexy/HexyFinish';

export default function BunnyArcade() {
  const storedEnglish=useStore(isEnglish),[languageReady,setLanguageReady]=useState(false),save=useArcadeSave();
  const en=languageReady&&storedEnglish;
  const canvas=useRef(null),simulation=useRef(null),engine=useRef(null),receipt=useRef(null),sound=useRef(true),options=useRef({}),phaseRef=useRef('loading');
  const music=useRef(null),countTimer=useRef(null);
  const [countdown,setCountdown]=useState(3);
  const [menuOpen,setMenuOpen]=useState(false);
  const [phase,setPhaseState]=useState('loading'),[art,setArt]=useState(null),[retry,setRetry]=useState(0),[muted,setMuted]=useState(false),[gentle,setGentle]=useState(false),[reduced,setReduced]=useState(false),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[notice,setNotice]=useState('');
  const [hud,setHud]=useState({hearts:3,stars:0,time:0});
  const [finish,setFinish]=useIllustratedFinish(),dialog=useRef(null),{open,close}=usePlazaDialog(dialog);
  const setPhase=useCallback(value=>{phaseRef.current=value;setPhaseState(value);},[]);
  options.current={reduced,equipped:save.equipped};sound.current=!muted;
  const active=phase==='playing',playingOrPaused=active||phase==='paused'||phase==='countdown';
  useEffect(()=>{
    try {isEnglish.set(localStorage.getItem('lang')==='en');}catch{/* Keep Spanish if storage is blocked. */}
    setLanguageReady(true);
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    let live=true;setPhase('loading');
    loadRunnerArt().then(value=>{if(live){setArt(value);setPhase('ready');}}).catch(()=>{if(live)setPhase('error');});
    return()=>{live=false;};
  },[retry,setPhase]);
  useEffect(()=>{
    if(!art)return;
    const element=canvas.current;
    let frame=0,last=0,accumulator=0,lastHud=0,disposed=false;
    simulation.current=createRun(960);
    const paint=()=>renderRunner(element,simulation.current,art,{...options.current,idle:phaseRef.current==='ready'});
    const resize=()=>{
      const run=simulation.current,old=run.width;
      run.width=Math.max(640,element.clientWidth/Math.max(1,element.clientHeight)*540);
      if(old!==run.width){const delta=(run.width-old)*.2;run.objects.forEach(o=>o.x+=delta);}
      paint();
    };
    async function complete(run) {
      const ticket=receipt.current;if(!ticket)return;
      receipt.current=null;setPhase('settling');
      const settled=await finishRun(ticket.id,{stars:run.stars,won:run.won});
      if(disposed)return;
      setResult({won:run.won,stars:run.stars,practice:ticket.practice,settled});setPhase('result');
    }
    function tick(now) {
      frame=0;if(disposed||phaseRef.current!=='playing')return;
      accumulator+=Math.min(.05,(now-(last||now))/1000);last=now;
      const run=simulation.current;
      while(accumulator>=1/120&&!run.done){step(run,1/120);accumulator-=1/120;for(const event of run.events)if(['jump','coin','hit','win'].includes(event))arcadeSound(event,sound.current);}
      paint();
      if(now-lastHud>100||run.done){
        setHud({hearts:run.hearts,stars:run.stars,time:run.time});lastHud=now;
        element.dataset.playerY=run.y.toFixed(2);element.dataset.runTime=run.time.toFixed(2);
        const obstacle=run.objects.find(o=>o.kind==='obstacle'&&o.x>=run.width*.2);
        element.dataset.obstacleGap=obstacle?(obstacle.x-run.width*.2).toFixed(1):'';
      }
      if(run.done){void complete(run);return;}
      frame=requestAnimationFrame(tick);
    }
    const wake=()=>{last=0;accumulator=0;if(!frame)frame=requestAnimationFrame(tick);};
    engine.current={start:easy=>{const width=simulation.current.width;simulation.current=createRun(width,easy);wake();},jump:()=>{if(phaseRef.current==='playing')jump(simulation.current);},wake,paint};
    const hidden=()=>{if(document.hidden&&phaseRef.current==='playing'){setPhase('paused');cancelAnimationFrame(frame);frame=0;}};
    const observer=new ResizeObserver(resize);observer.observe(element);resize();document.addEventListener('visibilitychange',hidden);
    const visible=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting&&phaseRef.current==='playing')setPhase('paused');},{threshold:0});visible.observe(element);
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();visible.disconnect();document.removeEventListener('visibilitychange',hidden);engine.current=null;};
  },[art,setPhase]);
  useEffect(()=>{if(!active)engine.current?.paint();},[save.equipped,active,reduced]);
  useEffect(()=>{
    const audio=music.current;audio.volume=.18;
    if((active||phase==='countdown')&&!muted)void audio.play().catch(()=>{});else audio.pause();
  },[active,phase,muted]);
  useEffect(()=>()=>clearInterval(countTimer.current),[]);
  useEffect(()=>{
    const key=e=>{if((e.code==='Escape'||e.code==='KeyP')&&phaseRef.current==='playing'){e.preventDefault();setPhase('paused');}};
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[setPhase]);
  async function start(practice) {
    if(busy||!art)return;setBusy(true);setNotice('');
    try {
      const ticket=await beginRun(practice);
      if(!ticket){setNotice(en?'Recover your interrupted game or find another coin.':'Recupera tu partida interrumpida o encuentra otra moneda.');return;}
      receipt.current=ticket;setResult(null);setHud({hearts:3,stars:0,time:0});setCountdown(3);setPhase('countdown');
      simulation.current=createRun(simulation.current.width,gentle);engine.current.paint();
      arcadeSound('start',sound.current);music.current.currentTime=0;
      canvas.current.scrollIntoView({block:'center',behavior:'instant'});canvas.current.focus({preventScroll:true});
      let count=3;countTimer.current=setInterval(()=>{
        if(document.hidden)return;
        count--;setCountdown(count);
        if(count===0){clearInterval(countTimer.current);setPhase('playing');engine.current.start(gentle);}
      },650);
    } finally {setBusy(false);}
  }
  function resume(){setPhase('playing');engine.current?.wake();canvas.current.focus({preventScroll:true});}
  async function abandon(){if(busy)return;setBusy(true);clearInterval(countTimer.current);await recoverRun();receipt.current=null;setPhase('ready');simulation.current=createRun(simulation.current?.width||960);engine.current?.paint();setResult(null);setBusy(false);}
  function changeLanguage(value){isEnglish.set(value);try{localStorage.setItem('lang',value?'en':'es');}catch{/* Visit-only selection. */}}
  const area=hud.time<20?(en?'THE LAKE':'EL LAGO'):hud.time<40?(en?'THE BRIDGE':'EL PUENTE'):hud.time<55?(en?'WONDERPOP PLAZA':'WONDERPOP PLAZA'):(en?'THE CONCERT':'EL CONCIERTO');
  return <div className={styles.page} data-bunny-arcade data-phase={phase}>
    <nav className={styles.topbar} aria-label={en?'Arcade navigation':'Navegación del arcade'}>
      <a href="/" className={styles.brand}>★ MAGIC DRINK <span>{en?'Back to the walk':'Volver al paseo'} ↗</span></a>
      <div className={styles.topActions}><button onClick={()=>changeLanguage(!en)} aria-label={en?'Cambiar a español':'Switch to English'}>{en?'ES':'EN'}</button><IllustratedMenuTrigger en={en} onClick={()=>{if(active)setPhase('paused');if(phase==='countdown'){clearInterval(countTimer.current);setPhase('paused');}open();setMenuOpen(true);}} aria-haspopup="dialog" /></div>
    </nav>
    <div className={styles.intro}><span>WONDERPOP PLAZA · ARCADE CLUB</span><h1>{en?'Little paws.':'Patitas pequeñas.'}<br/><em>{en?'A very big show.':'Un show muy grande.'}</em></h1><p>{en?'Hexy is about to sing. There’s still time to make the chorus.':'Hexy está por cantar. Todavía alcanzas el coro.'}</p></div>
    <section className={styles.machine} aria-label="Magic Bunny Arcade">
      <div className={styles.marquee}><i aria-hidden="true">★</i><div><span>MAGIC BUNNY</span><b>{en?'TO THE STAGE!':'¡AL ESCENARIO!'}</b></div><i aria-hidden="true">★</i></div>
      <div className={styles.bezel}>
        <div className={styles.hud} aria-label={en?'Game progress':'Progreso de la partida'}>
          <span aria-label={`${hud.hearts} ${en?'hearts':'corazones'}`} className={styles.hearts}>{'♥'.repeat(hud.hearts)}<i>{'♡'.repeat(3-hud.hearts)}</i></span>
          <b data-run-stars>★ {hud.stars.toString().padStart(2,'0')}</b><span className={styles.area}>{area}</span><span>{Math.max(0,60-Math.floor(hud.time))}s</span>
          {(active||phase==='paused')&&<button onClick={()=>active?setPhase('paused'):resume()} aria-label={active?(en?'Pause game':'Pausar partida'):(en?'Resume game':'Continuar partida')}>{active?'Ⅱ':'▶'}</button>}
        </div>
        <div className={styles.screen} data-active={active}>
          <canvas ref={canvas} tabIndex="0" aria-label={en?'Jump with Space, Arrow Up or a tap. P pauses.':'Salta con Espacio, flecha arriba o un toque. P pausa.'}
            onPointerDown={e=>{if(active){e.preventDefault();engine.current?.jump();e.currentTarget.focus({preventScroll:true});}}}
            onKeyDown={e=>{if(['Space','ArrowUp'].includes(e.code)&&active){e.preventDefault();if(!e.repeat)engine.current?.jump();}}}>
            {en?'A bunny runs towards Hexy’s concert, jumping over gifts and collecting stars.':'Un bunny corre al concierto de Hexy, saltando regalos y recogiendo estrellas.'}
          </canvas>
          {phase!=='playing'&&<div className={styles.overlay} data-game-overlay>
            {phase==='loading'&&<><span className={styles.spinner}>✦</span><h2>{en?'Lighting up the arcade…':'Encendiendo el arcade…'}</h2></>}
            {phase==='countdown'&&<><span className={styles.small}>{en?'SEE YOU AT THE CONCERT':'NOS VEMOS EN EL CONCIERTO'}</span><b className={styles.countdown} key={countdown}>{countdown}</b></>}
            {phase==='error'&&<><h2>{en?'The stage needs a moment.':'El escenario necesita un momento.'}</h2><button onClick={()=>setRetry(r=>r+1)}>{en?'Try again':'Intentar otra vez'}</button></>}
            {phase==='ready'&&<><span className={styles.small}>{en?'ONE TOUCH · A WHOLE ADVENTURE':'UN TOQUE · TODA UNA AVENTURA'}</span><h2>{en?'The chorus won’t wait!':'¡El coro no espera!'}</h2><p>{en?'Jump over surprises. Follow the stars.':'Salta las sorpresas. Sigue las estrellas.'}</p><div className={styles.instructions}><span>↥ {en?'Space / tap':'Espacio / toque'}</span><span>♥ 3 {en?'chances':'oportunidades'}</span></div></>}
            {phase==='paused'&&<><span className={styles.small}>{en?'TAKE A BREATHER':'UN RESPIRO'}</span><h2>{en?'We saved your place.':'Te guardamos tu lugar.'}</h2><SceneButton onClick={resume} showArrow={false}>{en?'Keep running':'Seguir corriendo'} ▶</SceneButton><button className={styles.quiet} onClick={abandon} disabled={busy}>{receipt.current?.practice?(en?'End practice':'Terminar práctica'):(en?'Return my coin and leave':'Devolver mi moneda y salir')}</button></>}
            {phase==='settling'&&<h2>{en?'Counting little stars…':'Contando estrellitas…'}</h2>}
            {phase==='result'&&result&&<><span className={styles.small}>{result.practice?(en?'PRACTICE':'PRÁCTICA'):(en?'THE APPLAUSE IS YOURS':'LOS APLAUSOS SON TUYOS')}</span><h2>{result.won?(en?'You made the chorus!':'¡Llegaste al coro!'):(en?'A little stumble. Another story.':'Un tropiezo. Otra historia.')}</h2><p>{result.stars} ★ {result.practice?(en?'collected · practice only':'recogidas · solo práctica'):(en?'for your wardrobe':'para tu vestuario')}{result.won&&!result.practice&&' · +1 ◉'}</p>{!result.settled&&<p>{en?'This game was already closed in another tab.':'Esta partida ya se cerró en otra pestaña.'}</p>}</>}
          </div>}
          {active&&hud.time<5&&<div className={styles.tapHint}>{en?'Tap or press Space to jump':'Toca o pulsa Espacio para saltar'} ↥</div>}
          <div className={styles.progress} role="progressbar" aria-label={en?'Journey to the concert':'Camino al concierto'} aria-valuenow={Math.floor(hud.time)} aria-valuemin={0} aria-valuemax={RUN_SECONDS}><i style={{width:`${hud.time/RUN_SECONDS*100}%`}}/></div>
        </div>
      </div>
      <div className={styles.deck}>
        <div className={styles.coinSlot} data-credit-count><span>{en?'YOUR COINS':'TUS MONEDAS'}</span><b>★ {save.coins.toString().padStart(2,'0')}</b><i aria-hidden="true"/>{phase==='countdown'&&!receipt.current?.practice&&<em className={styles.insertedCoin} aria-hidden="true">★</em>}</div>
        <div className={styles.controls}>
          {!playingOrPaused&&phase!=='settling'&&<>
            {save.run&&!receipt.current?<SceneButton onClick={abandon} disabled={busy}>{en?'Recover interrupted game':'Recuperar partida interrumpida'}</SceneButton>:<>
              <SceneButton onClick={()=>start(false)} disabled={busy||!art||phase==='error'||save.coins===0} showArrow={false} data-insert-coin>{en?'Insert coin':'Echar moneda'} <b>1 ◉</b></SceneButton>
              <button className={styles.practice} onClick={()=>start(true)} disabled={busy||!art||phase==='error'} data-practice>{en?'Free practice':'Práctica gratis'} ↗</button>
            </>}
          </>}
          {playingOrPaused&&<button className={styles.jump} onClick={()=>engine.current?.jump()} disabled={!active}>{en?'JUMP':'SALTAR'} <span>↥</span></button>}
        </div>
        <button className={styles.sound} aria-pressed={!muted} onClick={()=>setMuted(!muted)} aria-label={en?'Game sound':'Sonido del juego'}>{muted?'♪ ×':'♪'}<small>{en?'SOUND':'SONIDO'}</small></button>
      </div>
      <div className={styles.underDeck}><label><input type="checkbox" checked={gentle} disabled={playingOrPaused} onChange={e=>setGentle(e.target.checked)}/>{en?'A gentler pace':'Un paseo más tranquilo'}</label><span>{en?'BEST':'RÉCORD'} {save.best} ★</span></div>
      <p className={styles.notice} role="status" aria-live="polite">{notice|| (save.coins===0?(en?'No coins? Practice is always free. Find more bunnies on the walk.':'¿Sin monedas? La práctica siempre es gratis. Encuentra más bunnies en el paseo.'):(en?'A coin to play. A coin back if you make the concert.':'Una moneda para jugar. Otra de regalo si llegas al concierto.'))}</p>
    </section>
    <section className={styles.wardrobe} aria-labelledby="wardrobe-title">
      <div className={styles.wardrobeIntro}><span>{en?'A LITTLE MORE YOU':'UN POQUITO MÁS TÚ'}</span><h2 id="wardrobe-title">{en?'Dress for the encore.':'Listo para el encore.'}</h2><p>{en?'Your collected stars become little treasures.':'Tus estrellas recogidas se convierten en pequeños tesoros.'}</p><strong data-banked-stars>{save.stars} ★</strong><div className={styles.dressedBunny}><BunnySprite/><span data-accessory={save.equipped}>{save.equipped==='crown'?'♛':save.equipped==='scarf'?'✿':save.equipped==='comet'?'✦':''}</span></div></div>
      <div className={styles.accessories}>{ACCESSORIES.map(item=>{const owned=save.owned.includes(item.id),selected=save.equipped===item.id;return <button key={item.id} data-accessory-choice={item.id} aria-pressed={selected} disabled={playingOrPaused||(!owned&&save.stars<item.cost)} onClick={()=>equipAccessory(item.id)}><span aria-hidden="true">{item.icon}</span><b>{item[en?'en':'es']}</b><small>{selected?(en?'Wearing it':'Lo llevas puesto'):owned?(en?'Wear it':'Póntelo'):`${item.cost} ★`}</small></button>;})}</div>
    </section>
    <section className={styles.explore}><div><span>{en?'FIVE FRIENDS ARE WAITING':'CINCO AMIGOS TE ESPERAN'}</span><h2>{en?'There’s magic outside, too.':'Afuera también hay magia.'}</h2><p>{en?'Find the Magic Bunnies on the walk. Each one has a coin with your name on it.':'Encuentra a los Magic Bunnies en el paseo. Cada uno tiene una moneda con tu nombre.'}</p><SceneButton href="/" variant="violet">{en?'Look for my friends':'Buscar a mis amigos'}</SceneButton></div><ArcadeWallet en={en}/></section>
    <footer className={styles.footer}>MAGIC DRINK <span>★</span> {en?'Made for little moments of joy.':'Para esos ratitos que se quedan contigo.'}</footer>
    <audio ref={music} src="/audio/demos/no_brain_just_vibes_demo.mp3" preload="none" loop />
    <IllustratedMenu dialogRef={dialog} id="arcade-menu" en={en} currentPath="/arcade" finish={finish} onFinishChange={setFinish} onClose={close} onClosed={()=>setMenuOpen(false)} resume={en?'Back to the arcade':'Volver al arcade'}/>
    <HexyFinish enabled={finish.enabled} reduced={reduced} settings={finish} target={menuOpen?dialog.current:null}/>
  </div>;
}
