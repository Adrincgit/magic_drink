import {useEffect,useRef,useState} from 'react';
import {MODS,MOD_SLOTS,modPrice,modDescription,availableMod,maxModLevel,slotPrice,canUpgradeMod} from '../../engine/adventureMods';
import {buyAdventureMod,upgradeAdventureMod,toggleAdventureMod,buyAdventureSlot} from '../../../shared/arcadeStore';
import {navigateGamepadMenu} from '../../input/adventureGamepad';
import ModIcon from '../hud/AdventureModIcon';
import {misoFrame} from './misoAnimation';
import css from './adventureShop.module.css';

const lines={
 welcome:['¡Soy Miso! Tus estrellas tienen muy buen gusto.','I’m Miso! Your stars have excellent taste.'],
 bought:['¡Trato hecho! Tu amuleto te espera en la colección.','Sold! Your charm is waiting in your collection.'],
 upgraded:['¡Una pizca más de magia! Pruébalo en el camino.','A little more magic! Try it on the path.'],
 equipped:['¡Ese te queda de maravilla!','That one suits you wonderfully!'],
 removed:['Lo guardamos para otra aventura.','We’ll keep it for another adventure.'],
 full:['¡Estuche lleno! Amplíalo o guarda un amuleto.','Full case! Buy a slot or put away a charm.'],
 poor:['Nos faltan algunas estrellitas para ese deseo.','We need a few more stars for that wish.'],
 collection:['Aquí puedes equipar y mejorar tus amuletos.','Equip and improve your charms here.'],
 inspect:['Mira sus encantos. ¡La letra pequeña también es mágica!','Look at its charms. Even the fine print is magic!'],
 idle0:['Mrr… cada estrellita merece una buena aventura.','Purr… every little star deserves an adventure.'],
 idle1:['Toca lo que te guste. ¡Te cuento sus secretos!','Tap anything you like. I’ll tell you its secrets!'],
 idle2:['Sin prisa, Hexy. La magia se elige con cariño.','Take your time, Hexy. Choose your magic with care.'],
 idle3:['Mis amuletos no muerden. Bueno… ninguno de estos.','My charms don’t bite. Well… none of these do.'],
 shelf:['El que brilla está esperando que lo descubras.','The glowing one is waiting to be discovered.']
};
export default function AdventureShop({save,en,onLeave,onSettings,muted,onSound,reduced}){
 const dialog=useRef(null),popup=useRef(null),opener=useRef(null),working=useRef(false),idle=useRef(0);
 const [busy,setBusy]=useState(false),[line,setLine]=useState('welcome'),[reaction,setReaction]=useState(0),[view,setView]=useState('counter'),[selected,setSelected]=useState(0),[detailId,setDetailId]=useState(null),[frame,setFrame]=useState(0);
 const [collectionPage,setCollectionPage]=useState(0);
 const catalog=MODS.filter(m=>availableMod(m,save)||save.modsOwned?.includes(m.id));
 const lang=en?1:0,owned=save.modsOwned||[],equipped=save.modsEquipped||[],mod=catalog[selected%catalog.length],detail=MODS.find(m=>m.id===detailId);
 const collection=MODS.filter(m=>owned.includes(m.id)),collectionPages=Math.max(1,Math.ceil(collection.length/4));
 const levelOf=item=>owned.includes(item.id)?save.modLevels?.[item.id]||1:0;
 const level=detail?levelOf(detail):0,cost=detail?modPrice(detail,level):null;
 useEffect(()=>{dialog.current.focus({preventScroll:true});},[]);
 useEffect(()=>{
  setFrame(0);if(reduced)return;
  const start=performance.now(),mood=line==='bought'||line==='upgraded'?'happy':'talk';
  const timer=setInterval(()=>setFrame(misoFrame(performance.now()-start,mood)),40);return()=>clearInterval(timer);
 },[line,reaction,reduced]);
 useEffect(()=>{
  const timer=setTimeout(()=>{setLine('idle'+idle.current++%4);setReaction(n=>n+1);},7200);
  return()=>clearTimeout(timer);
 },[line,reaction]);
 useEffect(()=>{if(detailId)popup.current?.focus({preventScroll:true});},[detailId,view]);
 function speak(next){setLine(next);setReaction(n=>n+1);}
 function inspect(item,event){opener.current=event?.currentTarget;setSelected(Math.max(0,catalog.indexOf(item)));setDetailId(item.id);speak('inspect');}
 function closeDetail(){setDetailId(null);requestAnimationFrame(()=>{const target=opener.current?.isConnected?opener.current:dialog.current;target?.focus({preventScroll:true});});}
 function changeView(next,item=null){setView(next);setDetailId(item?.id||null);if(item)setCollectionPage(Math.floor(Math.max(0,collection.indexOf(item))/4));speak(next==='collection'?'collection':'shelf');}
 async function purchase(improve=false){
  if(!detail||working.current||cost===null)return;
  if(improve?(view!=='collection'||!level):level>0)return;
  working.current=true;setBusy(true);
  try{const ok=await(improve?upgradeAdventureMod(detail.id,level):buyAdventureMod(detail.id));speak(ok?(improve?'upgraded':'bought'):'poor');if(ok)onSound('coin');}
  finally{working.current=false;setBusy(false);}
 }
 async function expand(){
  if(working.current)return;working.current=true;setBusy(true);
  try{const ok=await buyAdventureSlot(save.modSlots);speak(ok?'upgraded':'poor');if(ok)onSound('coin');}finally{working.current=false;setBusy(false);}
 }
 async function equip(item){
  if(working.current)return;working.current=true;setBusy(true);
  try{const was=equipped.includes(item.id),ok=await toggleAdventureMod(item.id);speak(ok?(was?'removed':'equipped'):'full');if(ok)onSound('power');}
  finally{working.current=false;setBusy(false);}
 }
 function move(delta){const pages=Math.ceil(catalog.length/3);setSelected(n=>((Math.floor(n/3)+delta+pages)%pages)*3);speak('shelf');requestAnimationFrame(()=>dialog.current?.querySelector('[data-selected="true"]')?.focus({preventScroll:true}));}
 function key(e){
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(detail)closeDetail();else if(!working.current)onLeave();}
  else if(detail&&e.key==='Tab'){
   const buttons=[...popup.current.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===popup.current)){e.preventDefault();last?.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }else if(!detail&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();navigateGamepadMenu(dialog.current,e.key.slice(5).toLowerCase());}
 }
 const page=Math.floor(selected/3),pages=Math.ceil(catalog.length/3),visible=catalog.slice(page*3,page*3+3);
 const describe=(item,n=levelOf(item))=>modDescription(item,Math.max(1,n),en);
 return <section ref={dialog} role="dialog" tabIndex={-1} className={css.shop} data-adventure-shop data-shop-view={view} onKeyDown={key} aria-label={en?'Miso’s travelling shop':'La tiendita viajera de Miso'}>
  <div className={css.stage} data-view={view}>
   <div className={css.contents} inert={detail?'':undefined}>
    <div className={css.topline}><div className={css.wallet} data-shop-money aria-label={(en?'Stars: ':'Estrellas: ')+save.stars}><i/>{save.stars}</div><nav aria-label={en?'Shop screens':'Pantallas de la tienda'}>
     <button className={css.paintedButton} onClick={()=>changeView(view==='counter'?'collection':'counter')} data-shop-collection>{view==='counter'?(en?'My charms':'Mis amuletos'):(en?'The counter':'El mostrador')}</button>
     <button className={css.paintedButton} onClick={()=>onSound('mute')} aria-label={en?'Shop sound':'Sonido de la tienda'} aria-pressed={!muted}>{muted?'♫ ×':'♫'}</button>
     <button className={css.paintedButton} onClick={onSettings} aria-label={en?'Audio and controller settings':'Ajustes de audio y mando'}>⚙</button>
     <button className={css.paintedButton} onClick={onLeave} disabled={busy} aria-label={en?'Leave shop':'Salir de la tienda'}>↪</button>
    </nav></div>
    {view==='counter'&&<><div className={css.cat} data-merchant-frame={frame} style={{backgroundPosition:(frame%3*50)+'% '+(Math.floor(frame/3)*100)+'%'}} role="img" aria-label={en?'Miso, the cat merchant':'Miso, el gato mercader'}/>
    <div className={css.speech} data-miso-dialogue={line}><div key={reaction}><b>Miso</b><p role="status">{lines[line][lang]}</p></div></div></>}
    {view==='collection'&&<div className={css.dressing}><img src="/arcade/shop/hexy-collection.webp" alt={en?'Hexy choosing her charms':'Hexy eligiendo sus amuletos'}/><h2>{en?'Ready for magic':'Lista para la magia'}</h2><p>{equipped.length} / {save.modSlots} {en?'equipped':'equipados'}</p></div>}
    {view==='counter'?<>
     <div className={css.products} aria-label={en?'Browse Mods':'Explorar Mods'}>{visible.map((item,i)=>{const index=page*3+i,lv=levelOf(item);return <button key={item.id} className={css.product} data-mod={item.id} data-selected={index===selected} onFocus={()=>setSelected(index)} onPointerEnter={()=>setSelected(index)} onClick={e=>inspect(item,e)} aria-label={item.name[lang]} aria-pressed={index===selected}><span className={css.productFigure}><ModIcon mod={item} className={css.productIcon}/></span><span className={css.priceTag}><b>{item.name[lang]}</b><small>{lv?(en?'Owned · Lv. ':'Tuyo · Nv. ')+lv:item.price+' ★'}</small></span></button>;})}</div>
     <div className={css.browse}><button className={css.paintedButton} onClick={()=>move(-1)} aria-label={en?'Previous page':'Página anterior'}>◀</button><span>{en?'Shelf':'Estante'} {page+1} / {pages}</span><button className={css.paintedButton} onClick={()=>move(1)} aria-label={en?'Next page':'Página siguiente'}>▶</button></div>
     <div className={css.summary} data-shop-description={mod.id}><h2>{mod.name[lang]}</h2><p>{describe(mod)}</p></div>
    </>:<>
     <section className={css.collection} aria-label={en?'Your charms':'Tus amuletos'}><h2>{en?'My charms':'Mis amuletos'}</h2><p className={css.caseHint}>{en?'Your equipped charms':'Los que te acompañan'}</p>
      <div className={css.slots}>{Array.from({length:MOD_SLOTS},(_,i)=>{const item=MODS.find(m=>m.id===equipped[i]),locked=i>=save.modSlots,next=i===save.modSlots;return <button key={i} disabled={busy||(locked?!next||save.stars<slotPrice(save.modSlots):!item)} onClick={()=>locked?expand():equip(item)} data-buy-slot={next?'':undefined} data-locked={locked} data-equipped-slot={item?.id||''} aria-label={item?(en?'Unequip ':'Quitar ')+item.name[lang]:locked?(en?'Buy slot ':'Comprar espacio ')+(i+1):en?'Empty slot':'Espacio libre'}>{item?<ModIcon mod={item} className={css.charmIcon}/>:<span>{locked?'✦ +':'✧'}</span>}<small>{item?(en?'Equipped':'Equipado'):next?slotPrice(save.modSlots)+' ★':locked?'🔒':(en?'Free':'Libre')}</small></button>;})}</div>
      <div className={css.collectionItems}>{collection.slice(collectionPage*4,collectionPage*4+4).map(item=><button key={item.id} data-collection-mod={item.id} data-equipped={equipped.includes(item.id)} onClick={e=>inspect(item,e)} aria-label={item.name[lang]}><ModIcon mod={item} className={css.charmIcon}/><span>{item.name[lang]}<small>{en?'Level ':'Nivel '}{levelOf(item)} · {equipped.includes(item.id)?(en?'Equipped':'Equipado'):(en?'View charm':'Ver amuleto')}</small></span></button>)}{!owned.length&&<p>{en?'Your first charm is waiting at the counter.':'Tu primer amuleto te espera en el mostrador.'}</p>}</div>
      {collectionPages>1&&<div className={css.casePages}><button className={css.paintedButton} aria-label={en?'Previous charms':'Amuletos anteriores'} onClick={()=>setCollectionPage(n=>(n-1+collectionPages)%collectionPages)}>◀</button><span>{collectionPage+1} / {collectionPages}</span><button className={css.paintedButton} aria-label={en?'Next charms':'Más amuletos'} onClick={()=>setCollectionPage(n=>(n+1)%collectionPages)}>▶</button></div>}
     </section>
     <p className={css.collectionHint}>{en?'Select a charm to equip or improve it.':'Selecciona un amuleto para equiparlo o mejorarlo.'}</p>
    </>}
    <button className={css.paintedButton+' '+css.leave} disabled={busy} onClick={onLeave}>{en?'Back to the path':'Volver al camino'} →</button>
   </div>
   {detail&&<div className={css.popupShade} onClick={e=>{if(e.target===e.currentTarget)closeDetail();}}>
    <section ref={popup} role="dialog" tabIndex={-1} className={css.detail} data-item-popup={detail.id} data-product-info aria-label={detail.name[lang]}>
     <button className={css.paintedButton+' '+css.closeDetail} onClick={closeDetail} aria-label={en?'Close item':'Cerrar artículo'}>×</button>
     <div className={css.detailArt}><ModIcon mod={detail} className={css.detailIcon}/><span>{level?(en?'Level ':'Nivel ')+level+' / '+maxModLevel(detail):detail.price+' ★'}</span></div>
     <div className={css.detailCopy}><h2>{detail.name[lang]}</h2><p className={css.benefit}>{describe(detail,level)}</p>
      {view==='collection'&&level>0&&level<maxModLevel(detail)&&<div className={css.nextLevel}><b>{en?'Next enchantment':'Siguiente encanto'}</b><p>{describe(detail,level+1)}</p></div>}
      {view==='collection'&&level===maxModLevel(detail)&&<p className={css.maxLevel}>{en?'Maximum enchantment!':'¡Encanto máximo!'} ✦</p>}
      <div className={css.detailActions}>
       {view==='counter'?(level?<button className={css.actionButton} onClick={()=>changeView('collection',detail)} data-open-owned>{en?'View in my charms':'Ver en mis amuletos'}</button>:<button className={css.actionButton} disabled={busy||save.stars<cost} onClick={()=>purchase()} data-buy-mod={detail.id}>{en?'Take it!':'¡Me lo llevo!'}<strong>{cost} ★</strong></button>):<>
        <button className={css.actionButton} disabled={busy} onClick={()=>equip(detail)} data-equip-mod={detail.id}>{equipped.includes(detail.id)?(en?'Put away':'Guardar'):(en?'Equip':'Equipar')}</button>
        {cost!==null&&<button className={css.actionButton} disabled={busy||save.stars<cost||!canUpgradeMod(detail,level,save)} onClick={()=>purchase(true)} data-upgrade-mod={detail.id}>{en?'Improve':'Mejorar'}<strong>{cost} ★</strong></button>}
       </>}
      </div>
      {view==='collection'&&level<maxModLevel(detail)&&!canUpgradeMod(detail,level,save)&&<p className={css.popupStatus}>{en?'Complete more chapters to unlock the next enchantment.':'Completa más capítulos para desbloquear el siguiente encanto.'}</p>}
      <p className={css.popupStatus} role="status">{['bought','upgraded','full','poor','equipped','removed'].includes(line)?lines[line][lang]:cost!==null&&save.stars<cost?(en?'You need more stars for this wish.':'Te faltan estrellas para este deseo.'):''}</p>
     </div>
    </section>
   </div>}
  </div>
 </section>;
}
