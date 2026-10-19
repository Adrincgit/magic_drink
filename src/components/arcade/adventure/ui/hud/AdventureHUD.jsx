import {DRINKS} from '../../world/adventureLevels';
import {SUPER_COST,spellFor} from '../../engine/adventureMagic';
import {DRINK_SHOTS} from '../../engine/adventureAmmo';
import {SUPER_RECHARGE} from '../../engine/adventureRewards';
import {MODS} from '../../engine/adventureMods';
import AdventureModIcon from './AdventureModIcon';
import css from './adventureHUD.module.css';
const Icon=({name,className='',...props})=><img className={`${css.icon} ${className}`} src={`/arcade/sprites/ui/${name}.webp`} alt="" draggable="false" {...props}/>;
export default function AdventureHUD({hud,en,playing,inRun,onPause,onSwap,onCoaster,hidden=false}){
 const active=hud.basicFire?-1:hud.weapon,max=hud.maxHearts||5,magic=Math.floor(hud.magic??100),drink=DRINKS[hud.weapon],cooldown=hud.superCooldown||0;
 const charge=Math.max(0,Math.min(1,1-cooldown/SUPER_RECHARGE)),reserve=hud.superCapacity>1&&hud.superReserve>0,ready=(charge===1||reserve)&&magic>=SUPER_COST&&!hud.exhaustion;
 const dance=hud.ribbonRemaining>0,capacity=dance?hud.ribbonDuration:hud.ammoCapacity||DRINK_SHOTS[hud.weapon],remaining=dance?hud.ribbonRemaining:hud.ammo??capacity,ammoFraction=drink?Math.max(0,Math.min(1,remaining/capacity)):0;
 const pocket=hud.mods?.includes('double-pocket')||(hud.modCategorySlots?.drinks||1)>=2,spare=pocket&&hud.spareDrink,spareFlavor=DRINKS[spare?.kind];
 const nextDrink=hud.basicFire?(spareFlavor&&hud.basicCycle?spareFlavor:drink):spareFlavor&&!hud.basicCycle?spareFlavor:null,nextBasic=!hud.basicFire&&!nextDrink;
 const nextLabel=nextBasic?(en?'basic shot':'disparo b?sico'):nextDrink?.name||(en?'basic shot':'disparo b?sico');
 const status=hud.superActive?(en?'STARLIGHT ENCORE':'ENCORE ESTELAR'):cooldown>0&&!reserve?(en?'Super recharging':'Recargando el súper'):hud.exhaustion>0?(en?'RECOVERY':'RECUPERACIÓN'):ready?(en?'SUPER READY':'SÚPER LISTO'):(en?'Super charged; needs 90 magic':'Súper cargado; necesita 90 de magia');
 return <div className={css.hud} data-game-hud data-nightmare-right={!!hud.nightmareClash&&hud.nightmarePlayerRight} style={hidden?{visibility:'hidden'}:undefined}>
  {hud.ambush&&<div className={css.ambush} data-harbor-ambush role="status"><b>{en?'Bridge ambush!':'¡Emboscada en el puente!'}</b><span>{en?'Wave':'Oleada'} {hud.ambush.wave} / {hud.ambush.total} · {hud.ambush.remaining} {en?'remaining':'restantes'}</span><small>{en?'Aim down to sink the boats':'Apunta hacia abajo para hundir las lanchas'}</small></div>}
  <div className={css.vitals} data-exhausted={hud.exhaustion>0}>
   <div className={css.hearts} role="img" aria-label={`${en?'Life':'Vida'}: ${hud.hearts} / ${max}`} data-life>
    {Array.from({length:max},(_,i)=><Icon key={i} name={i<hud.hearts?'heart-full':'heart-empty'} data-full={i<hud.hearts}/>)}
   </div>
   <div className={css.magicRow}>
    <Icon name="magic-gem" className={css.gem}/>
    <div className={css.track} aria-hidden="true"><span className={css.fill} style={{width:magic+'%'}}/>{(dance?[]:[1,2]).map(n=><i key={n} style={{left:n*spellFor(active).cost+'%'}} data-ready={magic>=n*spellFor(active).cost}/>)}</div>
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
   {!!hud.mods?.length&&<div className={css.mods} aria-label={en?'Equipped Mods':'Mods equipados'}>{hud.mods.map(id=>{const mod=MODS.find(m=>m.id===id);if(!mod)return null;const level=hud.modLevels?.[id]||1;return <div key={id} data-hud-mod={id} data-mod-level={level} data-cooling={id==='confetti-step'&&hud.confettiWait>0||id==='enchanted-coaster'&&hud.coasterUsed} data-reply={id==='reply-bell'&&hud.parryFlash>0} role="img" aria-label={`${mod.name[en?1:0]} · ${en?'level':'nivel'} ${level}`} title={`${mod.name[en?1:0]} · ${level}`}><AdventureModIcon mod={mod} className={css.modIcon}/><small aria-hidden="true">{'•'.repeat(level)}</small></div>;})}</div>}
  </div>
  {!hud.bossOnly&&(hud.rescueGoal??3)>0&&<div className={css.companions} role="img" aria-label={`${en?'Bunnies rescued':'Bunnies rescatados'}: ${hud.rescued} / ${hud.rescueGoal??3}`} data-bunny-hud>
   {Array.from({length:hud.rescueGoal??3},(_,i)=><Icon key={i} name="bunny-face" data-rescued={i<hud.rescued}/>)}
  </div>}
  <div className={css.tools}>
   {hud.mods?.includes('enchanted-coaster')&&inRun&&<button className={css.pocket} data-coaster disabled={!playing||hud.coasterUsed||!hud.coasterAirborne} onClick={onCoaster} aria-label={en?'Deploy enchanted coaster':'Desplegar posavasos encantado'} title={en?'Enchanted coaster · B / L3':'Posavasos encantado · B / L3'}><img src="/arcade/sprites/ui/enchanted-coaster.webp" alt=""/><small>B / L3</small></button>}
   {inRun&&(drink||spareFlavor)&&<button className={css.pocket} data-swap-drink data-basic-active={!!hud.basicFire} disabled={!playing||dance} onClick={onSwap} aria-label={(en?'Switch to ':'Cambiar a ')+nextLabel} title={(en?'Alternate shot':'Alternar disparo')+' ? Q / R3'}>
    {nextBasic?<Icon name="quick-cast"/>:nextDrink?<img src={nextDrink.image} alt=""/>:<Icon name="quick-cast"/>}<small>? Q / R3</small>
   </button>}
   {hud.basicFire&&<span className={css.basicMode} data-basic-shot role="status">{en?'BASIC':'B?SICO'}</span>}
   {hud.overdrive>0&&<div className={css.drinkCharge} data-original-buff role="img" aria-label={en?'Original: invincible and rapid fire':'Original: invencible y disparo rápido'}>
    <img className={`${css.drink} ${css.drinkEmpty}`} src="/arcade/sprites/pickups/original.webp" alt=""/>
    <img className={`${css.drink} ${css.drinkFill}`} src="/arcade/sprites/pickups/original.webp" alt="" style={{clipPath:`inset(${(1-Math.min(1,hud.overdrive/(hud.overdriveDuration||8)))*100}% 0 0 0)`}}/>
   </div>}
   {drink&&<div className={css.drinkCharge} data-drink-tier={hud.drinkTier||1} data-drink-charge={ammoFraction.toFixed(3)}>
    <img className={`${css.drink} ${css.drinkEmpty}`} src={drink.image} alt={drink.name} title={drink.name}/>
    <img className={`${css.drink} ${css.drinkFill}`} src={drink.image} alt="" aria-hidden="true" style={{clipPath:`inset(${(1-ammoFraction)*100}% 0 0 0)`}}/>
    <meter className={css.srOnly} min="0" max={capacity} value={remaining} aria-label={dance?(en?'Ribbon seconds remaining':'Segundos de Ribbon restantes'):en?'Drink shots remaining':'Disparos de la bebida'}/>
    {dance&&<span className={css.powerTier} data-ribbon-timer>{remaining.toFixed(1)} s</span>}
    {hud.overdrive>0?<span className={css.powerTier} aria-label={en?'Unlimited shots':'Disparos sin consumo'}>∞</span>:hud.drinkTier===2&&<span className={css.powerTier} aria-label={en?'Powered drink':'Bebida potenciada'}>✦✦</span>}
   </div>}
   {inRun&&<button className={css.pause} aria-label={en?'Pause or resume':'Pausar o continuar'} onClick={onPause}>{playing?'Ⅱ':'▶'}</button>}
  </div>
  {!hud.bossOnly&&<div className={css.treasures} data-treasure-hud aria-label={(en?'Special stars: ':'Estrellas especiales: ')+(hud.treasures||0)+' / 5'}><Icon name="treasure-star"/>{hud.treasures||0} / 5</div>}
  <div className={css.score} data-score-hud data-star-pulse={hud.starPulse>0} aria-label={`${en?'Star money':'Dinero en estrellas'}: ${hud.money||0}`}><i aria-hidden="true"/>{hud.money||0}</div>
 </div>;
}
