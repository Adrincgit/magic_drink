import {groundY} from '../world/adventureTerrain';
import {DRINKS} from '../world/adventureLevels';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {orbitPosition} from '../engine/adventureExtraDrinks';
const lights=new Map();
export function paintMagicLight(c,x,y,r,color='#bf63ff',strength=.3,flat=false){
 let img=lights.get(color);
 if(!img){img=document.createElement('canvas');img.width=128;img.height=128;const b=img.getContext('2d'),g=b.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#fff9eeaa');g.addColorStop(.18,color+'a0');g.addColorStop(.5,color+'48');g.addColorStop(1,color+'00');b.fillStyle=g;b.fillRect(0,0,128,128);lights.set(color,img);}
 c.save();c.globalCompositeOperation='screen';c.globalAlpha*=strength;c.filter='none';c.drawImage(img,x-r,y-r*(flat?.35:1),r*2,r*(flat?.7:2));c.restore();
}
export function drawProjectileLights(c,s){
 const route=s.level.route||s.platforms;
 const lit=(x,y,r,color,strength)=>{if(!Number.isFinite(x+y))return;paintMagicLight(c,x,y,r,color,strength);const floor=groundY(route,x),distance=Math.abs(floor-y);if(distance<200)paintMagicLight(c,x,floor-3,r*1.3,color,strength*.7*(1-distance/200),true);};
 const segment=(from,to,color,power)=>{const d=Math.hypot(to.x-from.x,to.y-from.y),count=Math.max(1,Math.ceil(d/62));for(let i=0;i<=count;i++){const u=i/count;lit(from.x+(to.x-from.x)*u,from.y+(to.y-from.y)*u,58,color,power);}lit(to.x,to.y,88,color,power*1.5);};
 // Channels use hidden damage probes; light follows their visible path instead.
 for(const q of s.voltBeam?.segments||[])segment(q.from,q.to,'#48cfff',.12+(s.voltBeam.strength||0)*.12);
 for(const [i,q]of (s.aquaJet?.points||[]).entries())if(i%5===0)lit(q.x,q.y,63,'#69dfff',.28);
 for(const f of s.drinkFields||[]){
  if(f.life<=0)continue;const color=DRINKS[f.kind]?.color||'#bd94ff';
  if(f.orbs){for(const orb of f.orbs)if(orb.alive){const p=orbitPosition(f,orb);lit(p.x,p.y,64,color,.38);}}
  else lit(f.kind===8?f.muzzle.x:f.x,f.kind===8?f.muzzle.y:f.y,f.puddle?70:85,color,f.kind===8?.15:.25);
 }
 for(const e of s.effects||[]){
  if(e.life<=0)continue;const fade=Math.min(1,e.life/.18);
  if(e.drinkArc)segment({x:e.x,y:e.y},{x:e.toX,y:e.toY},'#53dfff',.4*fade);
  else if(e.popcornBlast)lit(e.x+Math.cos(e.angle)*65,e.y+Math.sin(e.angle)*65,140,'#ffa238',.65*fade);
  else if(Number.isFinite(e.drinkFx))lit(e.x,e.y,Math.min(135,(e.size||60)*1.2),DRINKS[e.drinkFx]?.color||'#ffd46f',.5*fade);
  else if(Number.isFinite(e.spell)||e.super||e.dragon)lit(e.x,e.y,Math.min(150,(e.size||60)*1.2),DRINKS[e.spell]?.color||'#ffe17a',.5*fade);
 }
 const p=s.player;
 if(!p.candy&&!s.clear&&!s.done&&(p.cast>0||p.specialCast>0||s.voltBeam||s.aquaJet)){
  const m=hexyMuzzle(s),kind=s.basicFire?-1:s.weapon,color=DRINKS[kind]?.color||'#ffe280';
  lit(m.x,m.y,p.specialCast>0?96:60,color,p.specialCast>0?.48:.28);
 }
 for(const [shots,hostile] of [[s.shots,false],[s.hostile,true]])for(const q of shots){
  if(q.life<=0||q.hidden||q.rain==='wait'||!Number.isFinite(q.x+q.y))continue;
  if(q.kind===12&&q.points?.length){for(const [i,p]of q.points.entries())if(i%3===0)lit(p.x,p.y,48,'#ff87c8',.18);}
  if(hostile&&['bone','juggle','red-pellet','ball','bomb'].includes(q.kind))continue;
  const color=hostile?['candy-ray','witch-drop','witch-puddle'].includes(q.kind)?'#d163ff':['lantern-soul','soul-flame','bell-soul','bell-wisp'].includes(q.kind)?'#40cfff':q.element==='fire'||q.ember||q.harlequin?'#ff9146':'#8ebdff':DRINKS[q.kind]?.color||'#ffd870';
  const hex=/^#[a-f0-9]{6}$/i.test(color)?color:'#d695ff',r=Math.min(100,42+(q.r||8)*1.8+(q.heavy?20:0));
  paintMagicLight(c,q.x,q.y,r,hex,q.heavy?.55:.36);
  const floor=groundY(route,q.x),distance=Math.abs(floor-q.y);
  if(distance<180)paintMagicLight(c,q.x,floor-3,r*1.35,hex,.35*(1-distance/180),true);
 }
}
