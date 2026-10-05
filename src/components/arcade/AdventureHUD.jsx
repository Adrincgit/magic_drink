import {DRINKS} from './adventureLevels';
import {SUPER_COST,STRONG_COST} from './adventureMagic';
import {DRINK_SHOTS} from './adventureAmmo';
import {SUPER_RECHARGE} from './adventureRewards';
import {MODS} from './adventureMods';
import AdventureModIcon from './AdventureModIcon';
import css from './adventureHUD.module.css';
const Icon=({name,className='',...props})=><img className={`${css.icon} ${className}`} src={`/arcade/sprites/ui/${name}.webp`} alt="" draggable="false" {...props}/>;
export default function AdventureHUD({hud,en,playing,inRun,onPause,hidden=false}){
 const max=hud.maxHearts||5,magic=Math.floor(hud.magic??100),drink=DRINKS[hud.weapon],cooldown=hud.superCooldown||0;
 const charge=Math.max(0,Math.min(1,1-cooldown/SUPER_RECHARGE)),reserve=hud.superCapacity>1&&hud.superReserve>0,ready=(charge===1||reserve)&&magic>=SUPER_COST&&!hud.exhaustion;
 const capacity=hud.ammoCapacity||DRINK_SHOTS[hud.weapon],ammoFraction=drink?Math.max(0,Math.min(1,(hud.ammo??capacity)/capacity)):0;
 const status=hud.superActive?(en?'STARLIGHT ENCORE':'ENCORE ESTELAR'):cooldown>0&&!reserve?(en?'Super recharging':'Recargando el súper'):hud.exhaustion>0?(en?'RECOVERY':'RECUPERACIÓN'):ready?(en?'SUPER READY':'SÚPER LISTO'):(en?'Super charged; needs 90 magic':'Súper cargado; necesita 90 de magia');
 return <div className={css.hud} data-game-hud style={hidden?{visibility:'hidden'}:undefined}>
  <div className={css.vitals} data-exhausted={hud.exhaustion>0}>
   <div className={css.hearts} role="img" aria-label={`${en?'Life':'Vida'}: ${hud.hearts} / ${max}`} data-life>
    {Array.from({length:max},(_,i)=><Icon key={i} name={i<hud.hearts?'heart-full':'heart-empty'} data-full={i<hud.hearts}/>)}
   </div>
   <div className={css.magicRow}>
    <Icon name="magic-gem" className={css.gem}/>
    <div className={css.track} aria-hidden="true"><span className={css.fill} style={{width:magic+'%'}}/>{[1,2,3].map(n=><i key={n} style={{left:n*STRONG_COST+'%'}} data-ready={magic>=n*STRONG_COST}/>)}</div>
    <meter className={css.srOnly} min="0" max="100" low="30" value={magic} aria-label={en?'Magic energy':'Energía de magia'}/>
    <div className={css.super} data-super-charge={charge.toFixed(3)} data-ready={ready||hud.superActive} title={status}>
     <Icon name="super-empty"/><Icon name="super-ready" className={css.superFill} style={{clipPath:`inset(${(1-charge)*100}% 0 0 0)`}}/>
    </div>
    {hud.superCapacity>1&&<div className={css.super} data-super-reserve={hud.superReserve||0} title={en?'Second super charge':'Segunda carga de súper'}><Icon name="super-empty"/><Icon name="super-ready" className={css.superFill} style={{clipPath:`inset(${reserve?0:Math.min(1,(hud.reserveCooldown||0)/(hud.reserveDuration||SUPER_RECHARGE))*100}% 0 0 0)`}}/></div>}
    <meter className={css.srOnly} min="0" max={SUPER_RECHARGE} value={SUPER_RECHARGE-cooldown} aria-label={en?'Super recharge':'Recarga del súper'}/>
    <span className={css.srOnly} data-super-status role="status">{status}</span>
   </div>
   {(hud.shield>0)&&<div className={css.charms} role="img" aria-label={`${en?'Collected protection':'Protección recogida'}: ${hud.shield}`}>
    {Array.from({length:3},(_,i)=><Icon key={i} name={i<hud.shield?'charm-full':'charm-empty'}/>)}
   </div>}
   {!!hud.mods?.length&&<div className={css.mods} aria-label={en?'Equipped Mods':'Mods equipados'}>{hud.mods.map(id=>{const mod=MODS.find(m=>m.id===id);if(!mod)return null;const level=hud.modLevels?.[id]||1;return <div key={id} data-hud-mod={id} data-mod-level={level} role="img" aria-label={`${mod.name[en?1:0]} · ${en?'level':'nivel'} ${level}`} title={`${mod.name[en?1:0]} · ${level}`}><AdventureModIcon mod={mod} className={css.modIcon}/><small aria-hidden="true">{'•'.repeat(level)}</small></div>;})}</div>}
  </div>
  <div className={css.companions} role="img" aria-label={`${en?'Bunnies rescued':'Bunnies rescatados'}: ${hud.rescued} / 3`} data-bunny-hud>
   {Array.from({length:3},(_,i)=><Icon key={i} name="bunny-face" data-rescued={i<hud.rescued}/>)}
  </div>
  <div className={css.tools}>
   {hud.overdrive>0&&<div className={css.drinkCharge} data-original-buff role="img" aria-label={en?'Original: invincible and rapid fire':'Original: invencible y disparo rápido'}>
    <img className={`${css.drink} ${css.drinkEmpty}`} src="/arcade/sprites/pickups/original.webp" alt=""/>
    <img className={`${css.drink} ${css.drinkFill}`} src="/arcade/sprites/pickups/original.webp" alt="" style={{clipPath:`inset(${(1-Math.min(1,hud.overdrive/8))*100}% 0 0 0)`}}/>
   </div>}
   {drink&&<div className={css.drinkCharge} data-drink-tier={hud.drinkTier||1} data-drink-charge={ammoFraction.toFixed(3)}>
    <img className={`${css.drink} ${css.drinkEmpty}`} src={drink.image} alt={drink.name} title={drink.name}/>
    <img className={`${css.drink} ${css.drinkFill}`} src={drink.image} alt="" aria-hidden="true" style={{clipPath:`inset(${(1-ammoFraction)*100}% 0 0 0)`}}/>
    <meter className={css.srOnly} min="0" max={capacity} value={hud.ammo??capacity} aria-label={en?'Drink shots remaining':'Disparos de la bebida'}/>
    {hud.overdrive>0?<span className={css.powerTier} aria-label={en?'Unlimited shots':'Disparos sin consumo'}>∞</span>:hud.drinkTier===2&&<span className={css.powerTier} aria-label={en?'Powered drink':'Bebida potenciada'}>✦✦</span>}
   </div>}
   {inRun&&<button className={css.pause} aria-label={en?'Pause or resume':'Pausar o continuar'} onClick={onPause}>{playing?'Ⅱ':'▶'}</button>}
  </div>
  <div className={css.score} data-score-hud data-star-pulse={hud.starPulse>0} aria-label={`${en?'Star money':'Dinero en estrellas'}: ${hud.money||0}`}><i aria-hidden="true"/>{hud.money||0}</div>
 </div>;
}
