import {nightmarePressureFrame} from '../../engine/nightmarePressureActing';
import {coherentNightmareDrawing,nightmareSpritePoint} from './nightmareDrawing';
import {NIGHTMARE_STORM_PALMS,NIGHTMARE_STORM_AERIAL_PALMS} from './nightmareStormRegistration';
import {NIGHTMARE_COMBAT_PALMS} from './nightmareCombatRegistration';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const NIGHTMARE_ULTIMATE={leap:1.45,charge:3.1,travel:.8,fire:2.1,recover:2.4,cooldown:25,elevation:1450,desperateHealth:.15};
export function nightmareUltimateDrawing(s,reduced=false){
 const b=s.boss,u=b.nightmareUltimate,q=s.powerClash?.kind==='nightmare'?s.powerClash:null;if(!u&&!q)return null;
 let frame=0,key='aerial-boss-air-actions';
 if(u?.state==='leap')return coherentNightmareDrawing({key:'nightmare-jump-3',frame:u.age<.22?Math.min(1,Math.floor(u.age/.11)):2+Math.min(4,Math.floor((u.age-.22)/(NIGHTMARE_ULTIMATE.leap-.22)*5)),size:0});
 if(q&&['flight','land'].includes(q.state))return coherentNightmareDrawing(q.won?{key:q.state==='flight'?'aerial-boss-air-actions':'nightmare-phase-three',frame:q.state==='flight'?14+Math.min(1,Math.floor(q.age/.45)):q.age<.8?14:15,size:280}:{key:'pressure-boss-air',frame:nightmarePressureFrame(q||{},s.fxTime,true,reduced),size:280});
 if(q&&q.state!=='windup'){key='pressure-boss-air';frame=nightmarePressureFrame(q||{},s.fxTime,true,reduced);}
 else if(u?.state==='leap')frame=Math.min(3,Math.floor(u.age/NIGHTMARE_ULTIMATE.leap*4));
 else if(q?.state==='windup'||u?.state==='charge')frame=4+(reduced?0:Math.floor(s.fxTime*12)%6);
 else if(u?.state==='fire'){key='pressure-boss-air';frame=nightmarePressureFrame(q||{},s.fxTime,true,reduced);}
 else frame=10+Math.min(3,Math.floor((u?.age||0)*10));
 return coherentNightmareDrawing({key,frame,size:280});
}
export function nightmareHand(s,charging=false){
 const q=s.powerClash||{},d=coherentNightmareDrawing(charging?{key:'aerial-boss-air-actions',frame:4+Math.floor(s.fxTime*12)%6,size:280}:{key:'pressure-boss-air',frame:nightmarePressureFrame(q,s.fxTime,true),size:280});
 const point=(charging?NIGHTMARE_STORM_AERIAL_PALMS[d.frame]:(NIGHTMARE_COMBAT_PALMS[d.frame]||NIGHTMARE_STORM_PALMS[d.frame]))||(charging?[150,80]:[65,215]);
 return nightmareSpritePoint(s,d,point);
}
export function nightmareCrown(s){const h=nightmareHand(s,true);return{x:h.x+s.boss.dir*40,y:h.y-200-Math.min(1,(s.powerClash?.bossCharged+s.powerClash?.age||s.boss.nightmareUltimate?.age||0)/3.1)*380};}
export function beginNightmareUltimate(s){
 const b=s.boss,a=s.level.arena,p=s.player,side=p.x<(a.left+a.right)/2?1:-1;
 b.dir=-side;b.phase='nightmare-leap';b.phaseAge=0;b.vulnerable=false;b.nightmareLastStandUsed=true;
 const x=clamp(p.x+side*1650,a.left+260,a.right-260);
 b.nightmareUltimate={state:'leap',age:0,from:{x:b.x,y:b.y},hover:{x,y:a.y-NIGHTMARE_ULTIMATE.elevation},target:{x:p.x,y:p.y-35}};
 s.hostile=[];s.dreamHazards=[];s.dreamMirrors=[];for(const e of s.enemies)if(e.summoned){e.hp=0;e.deadTime=.4;e.deathAge=0;}
 s.events.push('harlequinPowerPulse');
 if(s.episodeTwo)Object.assign(s.episodeTwo,{caption:['¡Un salto así…! Está reuniendo algo enorme.','That leap…! She is gathering something enormous.'],captionAge:3.4});
}
export function stepNightmareUltimate(s,dt,{shoot}){
 const b=s.boss,u=b.nightmareUltimate,a=s.level.arena;if(!u)return;
 u.age+=dt;b.clock+=dt;b.phaseAge+=dt;b.flash=Math.max(0,b.flash-dt);
 if(u.state==='leap'){
  const t=clamp((u.age-.22)/(NIGHTMARE_ULTIMATE.leap-.22),0,1),x=t*t*(3-2*t);
  b.x=u.from.x+(u.hover.x-u.from.x)*x;b.y=u.from.y+(u.hover.y-u.from.y)*(1-(1-t)**2.2);
  if(t>=1){u.state='charge';u.age=0;b.phase='nightmare-charge';u.target={x:s.player.x,y:s.player.y-35};s.events.push('harlequinPower');}
 }else if(u.state==='charge'){
  b.x=u.hover?.x??b.x;b.y=(u.hover?.y??a.y-NIGHTMARE_ULTIMATE.elevation)+Math.sin(u.age*2)*7;u.crown=nightmareCrown(s);
  if(Math.floor(u.age/.5)!==Math.floor((u.age-dt)/.5))s.events.push('harlequinPowerPulse');
  if(u.age>=NIGHTMARE_ULTIMATE.charge){
   u.state='fire';u.age=0;b.phase='nightmare-fall';const h=nightmareHand(s),angle=Math.atan2(u.target.y-h.y,u.target.x-h.x);
   shoot(s,h.x,h.y,angle,2450,'nightmare-storm',{actTwo:true,r:65,life:3.6,element:'magic',floor:a.y});s.events.push('harlequinRelease');s.shake=.28;
  }
 }else if(u.age>=NIGHTMARE_ULTIMATE.fire){
  u.state='descend';u.age=0;u.descendFrom=b.y;b.phase='nightmare-descend';
 }
 if(u.state==='descend'){
  const t=clamp(u.age/1.1,0,1);b.y=u.descendFrom+(a.y-u.descendFrom)*t*t;
  if(t>=1){delete b.nightmareUltimate;b.nightmareCooldown=NIGHTMARE_ULTIMATE.cooldown;b.phase='recover';b.phaseAge=0;b.timer=NIGHTMARE_ULTIMATE.recover;b.vulnerable=true;b.y=a.y;s.events.push('harlequinLand');}
 }
}
