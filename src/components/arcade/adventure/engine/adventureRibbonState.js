import {currentDrink,equipDrink} from './adventureAmmo';
import {modLevel} from './adventureMods';
import {movablePellet} from './adventureTacticalMods';

export const ribbonActive=s=>!!s.ribbonDance&&s.ribbonDance.remaining>0&&!s.player.drinkCast&&!s.player.pendingSip;
export const ribbonLevel=s=>s.ribbonDance?.level||Math.max(1,modLevel(s,'ribbon-duration'));
export const ribbonDuration=s=>[10,13,16,18,20][modLevel(s,'ribbon-duration')];
export function ribbonWeapon(s){s.weapon=s.ammoWeapon=12;s.power=true;s.ammo=s.ammoCapacity=44;s.drinkTier=1;}
export function beginRibbonDance(s){
 const previous=s.ribbonDance,p=s.player;
 s.ribbonDance={remaining:ribbonDuration(s),duration:ribbonDuration(s),level:Math.max(1,modLevel(s,'ribbon-duration')),stored:previous?.stored??currentDrink(s)};
 s.overdrive=0;s.ribbonPetals=[];s.ribbonPetalWait=0;s.ribbonQueued=null;ribbonWeapon(s);
 Object.assign(p,{ribbonSequence:'',ribbonJumpHits:[],ribbonCharge:null,ribbonSpecialBuffer:0,ribbonChargeRelease:null,ribbonSwing:0,ribbonChain:0,ribbonFlip:0,ribbonSpinning:false,ribbonCanChain:false,ribbonFinishWindow:0,specialCast:0,pendingSpecial:null,charge:0,guarding:false,cast:0,dash:0,ribbonAcrobat:false});
 p.drinkCast=p.ground!==null?.7:0;p.pendingSip=p.ground===null;p.sipKind='ribbon';
 s.aquaJet=null;s.voltBeam=null;s.placement=null;s.events.push('ribbonDrink');
}
export function endRibbonDance(s){
 const form=s.ribbonDance;if(!form)return;
 s.ribbonDance=null;s.ribbonQueued=null;const q=form.stored;equipDrink(s,q?.kind??-1,q?.ammo||0,q?.tier||1,q?.capacity||0);
 const p=s.player;Object.assign(p,{ribbonSequence:'',ribbonJumpHits:[],ribbonCharge:null,ribbonSpecialBuffer:0,ribbonChargeRelease:null,ribbonBuffer:0,ribbonSwing:0,ribbonSpinning:false,ribbonStep:0,ribbonFlip:0,ribbonChain:0,ribbonCanChain:false,ribbonDashHits:null,specialCast:0,pendingSpecial:null,guarding:false,ribbonAcrobat:false});
 if(p.sipKind==='ribbon'){p.sipKind=null;p.pendingSip=false;p.drinkCast=0;}
 s.shots=s.shots.filter(q=>!q.ribbon&&!q.ribbonProbe);s.events.push('ribbonFade');
}
// A can collected during the dance updates the underlying loadout, never
// turns a ten-second transformation into a persistent third drink slot.
export function withRibbonLoadout(s,fn){
 const form=s.ribbonDance;s.ribbonDance=null;const q=form.stored;
 equipDrink(s,q?.kind??-1,q?.ammo||0,q?.tier||1,q?.capacity||0);fn();form.stored=currentDrink(s);s.ribbonDance=form;ribbonWeapon(s);
}
export function stepRibbonState(s,dt){
 const p=s.player;p.ribbonFlip=Math.max(0,(p.ribbonFlip||0)-dt);p.ribbonJumpLink=Math.max(0,(p.ribbonJumpLink||0)-dt);
 if(p.ground!==null){p.ribbonFlip=0;p.ribbonHop=false;if(!p.ribbonSwing)p.ribbonAcrobat=false;}
 s.ribbonPetals=(s.ribbonPetals||[]).filter(q=>(q.life-=dt)>0);
 for(const q of s.ribbonPetals){q.x+=q.vx*dt;q.y+=q.vy*dt;q.angle+=dt*1.8;}
 if(!s.ribbonDance)return;
 if(s.playerDefeat||s.done){endRibbonDance(s);return;}
 if(!ribbonActive(s))return;
 s.ribbonDance.remaining=Math.max(0,s.ribbonDance.remaining-dt);
 if(!s.ribbonDance.remaining){endRibbonDance(s);return;}
 s.ribbonPetalWait=Math.max(0,(s.ribbonPetalWait||0)-dt);
 if(!s.ribbonPetalWait){
  const i=s.ticks||0;s.ribbonPetals.push({x:p.x-p.dir*13,y:p.y-27-(i%4)*7,vx:-p.dir*(15+i%13),vy:-12-i%19,life:.8,angle:i*.7,frame:i%4,size:p.dash>0?42:28});s.ribbonPetalWait=p.dash>0?.026:Math.abs(p.vx)>25||p.ribbonSwing>0?.045:.13;
 }
 if(s.ribbonPetals.length>28)s.ribbonPetals.splice(0,s.ribbonPetals.length-28);
}
export function ribbonReflect(s,q){
 if(!ribbonActive(s)||!movablePellet(q))return false;
 const p=s.player;if(!p.guarding&&!(p.dash>0)&&!ribbonJumpSpin(s))return false;
 const x=q.x-p.x,y=q.y-(p.y-40),radius=p.dash>0?65:70;
 if(Math.hypot(x,y)>radius+(q.r||8))return false;
 const speed=Math.max(360,Math.min(650,Math.hypot(q.vx,q.vy))),n=Math.hypot(q.vx,q.vy);
 s.shots.push({x:q.x,y:q.y,vx:-q.vx/n*speed,vy:-q.vy/n*speed,r:10,kind:-1,damage:2.5,age:0,life:1.2,hits:[],reflected:true,ribbonReflected:true});
 q.life=0;p.guardHit=.18;s.effects.push({drinkFx:12,x:q.x,y:q.y,size:55,age:0,life:.25,duration:.25});s.events.push('ribbonParry');return true;
}
export const ribbonJumpSpin=s=>ribbonActive(s)&&s.player.ground===null&&s.player.ribbonFlip>0&&!s.player.ribbonSwing&&!s.player.hitReact&&!s.player.guarding&&!s.player.dash;
export function stepRibbonDash(s,oldX,oldY){
 const p=s.player,jump=ribbonJumpSpin(s);if(!ribbonActive(s)||!(p.dash>0)&&!jump)return;
 p.ribbonDashHits??=[];
 const steps=Math.max(1,Math.ceil(Math.hypot(p.x-oldX,p.y-oldY)/15));
 for(let i=0;i<=steps;i++)s.shots.push({x:oldX+(p.x-oldX)*i/steps,y:oldY+(p.y-oldY)*i/steps-35,vx:0,vy:0,kind:12,hidden:true,heavy:true,sustained:true,r:40,damage:jump?.2:2,life:.0084,age:0,hits:jump?(p.ribbonJumpHits??=[]):p.ribbonDashHits,ribbonProbe:true,ribbonSpin:true,ribbonDash:true});
}
