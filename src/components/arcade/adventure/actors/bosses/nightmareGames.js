// These games commit their aim during anticipation. The second pounce has its
// own warning; neither a landing nor a rain lane follows the player on release.
import {stepNightmareStaffChain,NIGHTMARE_STAFF_CHAIN} from './nightmareStaffCombo';
import {nightmareStaffStrike} from './nightmareStaffDefense';
import {createNightmareIllusions,stepNightmareIllusions} from './nightmareIllusions';
import {beginNightmareAcrobatics,stepNightmareAcrobatics} from './nightmareChoreography';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const enter=(b,phase,time)=>Object.assign(b,{phase,timer:time,phaseAge:0});
export const NIGHTMARE_GAMES={
 'candy-fan':{warn:1,attack:1.65,rest:1.15},
 'moon-hop':{warn:1.1,attack:1.35,rest:1.4},
 'spiral-volley':{warn:1,attack:1.75,rest:1.1},
 'double-pounce':{warn:1,attack:1.05,rest:1.45},
 'nightmare-rain':{warn:1.2,attack:1.8,rest:1.2},
 'wind-blink':{warn:.9,attack:1.55,rest:1.15},
 'wind-shear':{warn:1.1,attack:1.7,rest:1.1},
 'staff-counter':{warn:.55,attack:1.05,rest:1.15},
 'staff-chain':{warn:.55,attack:NIGHTMARE_STAFF_CHAIN.end,rest:1.35},
 'wind-tug':{warn:.35,attack:.42,rest:.8},
 'wind-push':{warn:.35,attack:.42,rest:.8},
 'staff-spin':{warn:.14,attack:1,rest:.75},
 'staff-barrage':{warn:.2,attack:1.1,rest:1.2},
 'prism-mirage':{warn:.85,attack:3.6,rest:.9},
 'staff-sweep':{warn:.6,attack:1.22,rest:.9},
 'staff-vault':{warn:.55,attack:1.2,rest:.8}
};
export function startNightmareGame(s,kind){
 const b=s.boss,a=s.level.arena,p=s.player,settings=NIGHTMARE_GAMES[kind];
 if(!settings)return false;
 b.move=kind;b.attackDir=b.dir;b.originX=b.x;b.originY=b.y;b.volley=0;
 b.aim={x:p.x,y:p.y-35};b.targetX=clamp(p.x+(['moon-hop','double-pounce'].includes(kind)?b.attackDir*180:0),a.left+130,a.right-130);
 const width=(a.right-a.left-240)/7;
 b.game={kind,step:0,safe:clamp(Math.floor((p.x-a.left-120)/width),0,6),width};
 if(kind==='staff-spin')b.staffDefenseCooldown=10;
 if(kind==='wind-blink')b.targetX=clamp(p.x+(b.x>p.x?-1:1)*230,a.left+140,a.right-140);
 if(kind==='staff-counter'||kind==='staff-chain'){
  b.targetX=clamp(p.x-p.dir*86,a.left+100,a.right-100);b.game.strikeDir=Math.sign(p.x-b.targetX)||p.dir;
  b.staffCooldown=kind==='staff-chain'?8:5.2;b.game.recover=true;
 }
 if(kind==='prism-mirage')b.game.copies=createNightmareIllusions(s);
 if(['staff-sweep','staff-vault'].includes(kind))beginNightmareAcrobatics(s,kind);
 b.vulnerable=true;enter(b,'game-windup',settings.warn+(s.gentle?.2:0));s.events.push('harlequinPowerPulse');
 return true;
}
function gusts(s,shoot,muzzle,angle,offsets,speed){
 const b=s.boss,{x,y}=muzzle(s);
 for(const offset of offsets)shoot(s,x,y,angle+offset,speed,'nightmare-gust',{actTwo:true,r:14,life:4,floor:s.level.arena.y,element:'magic',windShape:b.game?.kind});
 b.muzzleTime=.18;s.events.push('harlequinCast');
}
export function stepNightmareGame(s,dt,{shoot,muzzle}){
 const b=s.boss,g=b.game,a=s.level.arena,p=s.player,settings=NIGHTMARE_GAMES[g?.kind];
 if(!settings)return;
 if(b.staffRebound){
  if(s.time-b.staffRebound.at<b.staffRebound.duration){b.phaseAge-=dt;b.timer+=dt;return;}
  delete b.staffRebound;
  if(b.staffBarragePending){delete b.staffBarragePending;startNightmareGame(s,'staff-barrage');return;}
 }
 if(b.phase==='game-windup'){
  b.y+=(a.y-b.y)*Math.min(1,dt*8);
  if(b.timer>0)return;
  enter(b,'game-attack',settings.attack);b.vulnerable=true;b.volley=0;
  const tip=muzzle(s);b.game.angle=Math.atan2(b.aim.y-tip.y,b.aim.x-tip.x);
  s.events.push('harlequinRelease');
 }
 if(b.phase!=='game-attack')return;
 const age=b.phaseAge,fast=s.gentle?.84:1;
 if(g.kind==='candy-fan'||g.kind==='spiral-volley'){
  const spiral=g.kind==='spiral-volley',count=spiral?4:3,interval=spiral?.42:.52;
  while(b.volley<count&&age>=b.volley*interval){
   const turn=b.volley++,offsets=spiral?[-.6,-.3,0,.3,.6]:[-.27,0,.27];
   gusts(s,shoot,muzzle,g.angle+(spiral?(turn%2?.15:-.15):0),offsets,(spiral?350:290)*fast);
  }
 }else if(g.kind==='moon-hop'||g.kind==='double-pounce'){
  const leap=g.kind==='double-pounce'?.82:1.05,t=Math.min(1,age/leap),before=b.x;
  b.x=b.originX+(b.targetX-b.originX)*(t*t*(3-2*t));b.y=a.y-Math.sin(t*Math.PI)*(g.step?260:220);
  b.gait=(b.gait||0)+Math.abs(b.x-before)/100;
  if(t>.45&&t<1&&Math.abs(p.x-b.x)<52&&Math.abs(p.y-b.y)<82)s.damage({x:b.x,element:'magic'});
  if(t>=1&&!b.volley){
   b.volley=1;s.shake=.18;s.events.push('harlequinLand');
   // The first pounce lands without extra bullets, leaving its next warning
   // readable. The last landing sends two low gusts that can be jumped.
   if(g.kind==='moon-hop'||g.step)for(const dir of [-1,1])shoot(s,b.x+dir*55,a.y-20,dir>0?0:Math.PI,255*fast,'nightmare-gust',{actTwo:true,r:13,life:2.8,floor:a.y,element:'magic'});
  }
  if(b.timer<=0&&g.kind==='double-pounce'&&!g.step){
   g.step=1;b.originX=b.x;b.attackDir=Math.sign(p.x-b.x)||-b.attackDir;b.targetX=clamp(p.x+b.attackDir*180,a.left+130,a.right-130);b.dir=b.attackDir;
   enter(b,'game-windup',.85+(s.gentle?.2:0));s.events.push('harlequinPowerPulse');return;
  }
 }else if(g.kind==='nightmare-rain'){
  while(b.volley<2&&age>=b.volley*.58){
   const pass=b.volley++;
   for(let i=0;i<7;i++)if(i!==g.safe&&i%2===pass){
    const x=a.left+120+(i+.5)*g.width;
    shoot(s,x,a.y-440,Math.PI/2,325*fast,'nightmare-gust',{actTwo:true,r:17,life:2.3,floor:a.y,element:'magic',windShape:'nightmare-rain'});
   }
   s.events.push('harlequinCast');
  }
 }else if(g.kind==='wind-blink'){
  b.vulnerable=age>=.3;
  if(age>=.3&&!g.arrived){
   g.arrived=true;b.x=b.targetX;b.y=a.y;b.dir=Math.sign(b.aim.x-b.x)||b.dir;
   const tip=muzzle(s);g.angle=Math.atan2(b.aim.y-tip.y,b.aim.x-tip.x);s.events.push('harlequinPowerPulse');
  }
  // A visible reappearance precedes release. The aim was committed before
  // disappearing, so retreat/jump can evade it; no independent illusion fires.
  if(age>=.78&&!b.volley){b.volley=1;gusts(s,shoot,muzzle,g.angle,[-.18,0,.18],310*fast);}
 }else if(g.kind==='staff-counter'){
  b.vulnerable=age>=.18;
  if(age>=.18&&!g.arrived){g.arrived=true;b.x=b.targetX;b.y=a.y;b.dir=g.strikeDir;s.events.push('harlequinPowerPulse');}
  // The destination and direction are committed before vanishing. The
  // reappeared caster visibly raises her staff before its active swing.
  if(age>=.52&&age<.72&&!g.struck){
   const dx=(p.x-b.x)*b.dir,close=dx>12&&dx<145&&Math.abs(p.y-a.y)<68;
   if(close){g.struck=true;nightmareStaffStrike(s);}
  }
  if(age>=.52&&!g.released){g.released=true;s.shake=.12;s.events.push('harlequinCast');}
 }else if(g.kind==='staff-chain'){
  stepNightmareStaffChain(s);
 }else if(g.kind==='staff-barrage'){
  const due=Math.min(4,Math.max(0,Math.floor((age-.18)/.23)+1));
  if(b.volley<due){b.volley++;const dx=(p.x-b.x)*b.dir;if(dx>0&&dx<160&&Math.abs(p.y-a.y)<72)nightmareStaffStrike(s,{followup:false});s.events.push('harlequinCast');}
 }else if(g.kind==='staff-spin'){
  b.vulnerable=true;
 }else if(g.kind==='prism-mirage'){
  stepNightmareIllusions(s,shoot);
 }else if(g.kind==='staff-sweep'||g.kind==='staff-vault'){
  stepNightmareAcrobatics(s,dt);
 }else if(g.kind==='wind-tug'||g.kind==='wind-push'){
  // The wind field moves Hexy through the normal movement integration;
  // it creates no damaging projectile and does not call damage().
  if(age>=.02&&!b.volley){b.volley=1;s.events.push('harlequinRelease');}
 }else if(g.kind==='wind-shear'){
  while(b.volley<3&&age>=b.volley*.48){const pass=b.volley++;gusts(s,shoot,muzzle,g.angle+(pass-1)*.12,[-.32,0,.32],390*fast);}
 }
 if(b.timer<=0){b.y=a.y;b.vulnerable=true;b.lastNightmareGame=g.kind;delete b.game;enter(b,'recover',settings.rest+(s.gentle?.25:0));}
}
export function nightmareGameWarnings(s){
 const b=s.boss,g=b.game,a=s.level.arena;
 if(!g)return[];
 if(g.kind==='prism-mirage'&&b.phase==='game-attack')return g.copies.filter(q=>q.aim&&(q.kind==='vault'?!q.struck&&b.phaseAge<1.38+q.id*.3:q.shots<2)).map(q=>({x:q.kind==='vault'?q.to:q.x,y:a.y,w:q.kind==='vault'?115:65,kind:'illusion'}));
 if(g.kind==='staff-vault'&&b.phase==='game-windup')return[{x:b.targetX,y:a.y,w:140,kind:'landing'}];
 if(g.kind==='staff-chain'&&b.phase==='game-attack'){
  if(g.slam&&!g.impacted)return[{x:g.slam.x,y:a.y,w:170,kind:'landing'}];
  if(g.front&&!g.frontArrived)return[{x:g.front.x,y:a.y,w:95,kind:'blink'}];
 }
 if(b.phase!=='game-windup')return[];
 if(g.kind==='moon-hop'||g.kind==='double-pounce')return[{x:b.targetX,y:a.y,w:125,kind:'landing'}];
 if(g.kind==='nightmare-rain')return Array.from({length:7},(_,i)=>({x:a.left+120+(i+.5)*g.width,y:a.y,w:g.width-45,safe:i===g.safe,kind:'rain'}));
 if(['wind-blink','staff-counter','staff-chain'].includes(g.kind))return[{x:b.targetX,y:a.y,w:g.kind.startsWith('staff-')?95:125,kind:'blink'}];
 return[];
}
