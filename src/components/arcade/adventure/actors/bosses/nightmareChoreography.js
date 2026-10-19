import {nightmareStaffStrike} from './nightmareStaffDefense';
import {NIGHTMARE_COMBAT_BODY} from './nightmareCombatRegistration';
import {impactSmoke} from '../../engine/cinematicImpact';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const decks={
 1:['candy-fan','staff-vault','wind-push','moon-hop','wind-blink','staff-sweep'],
 2:['staff-vault','spiral-volley','prism-mirage','staff-sweep','wind-tug','staff-chain','moon-hop','wind-blink'],
 3:['staff-vault','staff-chain','wind-shear','prism-mirage','double-pounce','staff-sweep','wind-push','nightmare-rain','wind-tug','wind-blink','spiral-volley']
};
export function chooseNightmareGame(s){
 const b=s.boss,deck=decks[b.stage||1],recent=b.attackHistory||[],distance=Math.abs(s.player.x-b.x);
 let kind;
 for(let i=0;i<deck.length;i++){
  const next=deck[(b.turn||0)%deck.length];b.turn=(b.turn||0)+1;
  if(recent.slice(-2).includes(next)||next==='staff-sweep'&&distance>340)continue;
  kind=next;break;
 }
 kind??='wind-blink';b.attackHistory=[...recent,kind].slice(-10);return kind;
}
export function beginNightmareAcrobatics(s,kind){
 const b=s.boss,p=s.player,a=s.level.arena;
 b.targetX=clamp(b.x+clamp(p.x-b.x+b.dir*160,-560,560),a.left+160,a.right-160);
 b.game.vaultFrom=b.x;b.game.vaultTo=b.targetX;b.game.swingAim={x:p.x,y:p.y};
 if(kind==='staff-sweep')b.game.reverseAt=.72;
}
export function stepNightmareAcrobatics(s,dt){
 const b=s.boss,g=b.game,p=s.player,a=s.level.arena,t=b.phaseAge,vault=g.kind==='staff-vault';
 if(vault){
  const u=clamp(t/1.04,0,1),ease=u*u*(3-2*u);
  b.x=g.vaultFrom+(g.vaultTo-g.vaultFrom)*ease;b.y=a.y-Math.sin(u*Math.PI)*185;
  if(u<.35)b.dir=Math.sign(g.swingAim.x-b.x)||b.dir;
 }else if(t<.34){b.x=clamp(b.x+b.dir*260*(1-t/.34)*dt,a.left+140,a.right-140);}
 const pose=nightmareAcrobaticCel(b),reach=(NIGHTMARE_COMBAT_BODY[pose.key]?.[pose.frame]?.reach??90)+20;
 const windows=vault?[[.35,.73,'vaultHit'],[.88,1.06,'landingHit']]:[[.18,.34,'wideHit'],[.76,.93,'reverseHit']];
 for(const [start,end,key]of windows)if(t>=start&&t<end&&!g[key]){
  const dx=(p.x-b.x)*b.dir,dy=Math.abs(p.y-b.y);
  if(dx> -18&&dx<reach&&dy<95){g[key]=true;nightmareStaffStrike(s,{heavy:!vault,followup:false});}
 }
 for(const [at,key]of (vault?[[.35,'vaultSwing']]:[[.18,'wideSwing'],[.76,'reverseSwing']]))if(t>=at&&!g[key]){g[key]=true;s.events.push('harlequinCast');}
 if(vault&&t>=1.04&&!g.landed){g.landed=true;impactSmoke(s,b.x,a.y,.45);s.events.push('harlequinLand');}
}
export function nightmareAcrobaticCel(b,reduced=false){
 const g=b.game;if(!['staff-sweep','staff-vault'].includes(g?.kind))return null;
 const age=b.phaseAge,warning=b.phase==='game-windup';
 let frame=warning?(g.kind==='staff-vault'?4:0):g.kind==='staff-vault'?4+Math.min(3,Math.floor(age/1.04*4)):age<.58?Math.min(3,Math.floor(age/.145)):8+Math.min(3,Math.floor((age-.58)/.145));
 if(reduced&&warning)frame=g.kind==='staff-vault'?4:0;
 return{key:'nightmare-staff-sweep-'+(b.stage===3?3:2),frame,size:0};
}
