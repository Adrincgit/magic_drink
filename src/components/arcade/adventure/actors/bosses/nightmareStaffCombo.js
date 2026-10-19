import {impactSmoke} from '../../engine/cinematicImpact';
import {NIGHTMARE_COMBO_BODY,NIGHTMARE_COMBO_STAFF_TIPS} from './nightmareComboRegistration';
import {nightmareStaffStrike} from './nightmareStaffDefense';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// Every follow-up commits a new destination BEFORE its own visible warning.
// Illusions belong to the caster and use her shared projectile/guard rules.
export {nightmareIllusionCopies} from './nightmareIllusions';
export const NIGHTMARE_STAFF_CHAIN={frontWarn:.8,frontArrive:1.02,frontHit:1.36,airWarn:1.65,airArrive:1.9,drop:2.18,impact:2.5,end:3.28};
export function staffChainLeg(b){
 const age=b.phaseAge||0;
 return age<NIGHTMARE_STAFF_CHAIN.frontWarn?'behind':age<NIGHTMARE_STAFF_CHAIN.airWarn?'front':'above';
}
export function stepNightmareStaffChain(s){
 const b=s.boss,g=b.game,p=s.player,a=s.level.arena,t=b.phaseAge,T=NIGHTMARE_STAFF_CHAIN;
 b.vulnerable=t>=.18;
 if(t>=.18&&!g.arrived){g.arrived=true;b.x=b.targetX;b.y=a.y;b.dir=g.strikeDir;s.events.push('harlequinPowerPulse');}
 if(t>=.52&&t<.72&&!g.firstHit){
  const dx=(p.x-b.x)*b.dir;if(dx>12&&dx<145&&Math.abs(p.y-a.y)<68){g.firstHit=true;nightmareStaffStrike(s,{followup:false});}
 }
 if(t>=.52&&!g.firstSwing){g.firstSwing=true;s.events.push('harlequinCast');}
 if(t>=T.frontWarn&&!g.front){
  g.front={x:clamp(p.x+p.dir*96,a.left+110,a.right-110),aim:p.x};
  g.front.dir=Math.sign(g.front.aim-g.front.x)||-p.dir;s.events.push('harlequinPowerPulse');
 }
 if(t>=T.frontArrive&&!g.frontArrived){g.frontArrived=true;b.x=g.front.x;b.dir=g.front.dir;s.events.push('harlequinRelease');}
 if(t>=T.frontHit&&t<T.frontHit+.2&&!g.secondHit){
  const dx=(p.x-b.x)*b.dir;if(dx>12&&dx<145&&Math.abs(p.y-a.y)<68){g.secondHit=true;nightmareStaffStrike(s,{followup:false});}
 }
 if(t>=T.airWarn&&!g.slam){
  const dir=Math.sign(p.x-b.x)||b.dir;
  g.slam={x:clamp(p.x,a.left+150,a.right-150),dir};s.events.push('harlequinPowerPulse');
 }
 if(t>=T.airArrive){
  // The staff reaches the floor just ahead of her boots. The player may
  // leave the committed landing zone throughout the overhead anticipation.
  b.dir=g.slam.dir;
  const key='nightmare-staff-down-'+(b.stage===3?3:2),pose=NIGHTMARE_COMBO_BODY[key][4],tip=NIGHTMARE_COMBO_STAFF_TIPS[key][4],facing=b.dir>0?-1:1;
  b.x=g.slam.x-((tip[0]/512-.5)*pose.size+pose.offsetX)*facing;
  const drop=clamp((t-T.drop)/(T.impact-T.drop),0,1);
  b.y=a.y-(tip[1]/512-.975)*pose.size-270*(1-drop*drop);
 }
 if(t>=T.impact&&!g.impacted){
  g.impacted=true;b.staffImpact={x:g.slam.x,y:a.y,at:s.time};
  impactSmoke(s,g.slam.x,a.y,.85);s.shake=.24;s.events.push('harlequinLand','clashPulse');
  if(Math.abs(p.x-g.slam.x)<82&&Math.abs(p.y-a.y)<72)nightmareStaffStrike(s,{heavy:true,followup:false});
 }
}
export function nightmareStaffHidden(b){
 if(b.phase!=='game-attack')return false;
 const age=b.phaseAge;
 if(b.game?.kind==='staff-counter')return age<.18;
 if(b.game?.kind!=='staff-chain')return false;
 return age<.18||age>=.86&&age<NIGHTMARE_STAFF_CHAIN.frontArrive||age>=1.76&&age<NIGHTMARE_STAFF_CHAIN.airArrive;
}
export function nightmareWindDisplacement(s,dt){
 const b=s.boss,g=b.game,p=s.player;
 if(!s.level.badDreams||b.phase!=='game-attack'||!['wind-tug','wind-push'].includes(g?.kind))return 0;
 const t=(b.phaseAge-.02)/.32,distance=Math.abs(p.x-b.x);
 if(t<=0||t>=1||distance>850||Math.abs(p.y-b.y)>230)return 0;
 const dir=(Math.sign(b.x-p.x)||-b.dir)*(g.kind==='wind-tug'?1:-1);
 const resist=p.guarding?.22:p.dash>0?.2:p.ground===null?.65:1;
 return dir*620*Math.sin(t*Math.PI)*Math.max(.45,1-distance/1200)*resist*dt;
}
export function nightmarePrismStrength(s){
 const b=s.boss;if(b.game?.kind!=='prism-mirage')return 0;
 if(b.phase==='game-windup')return clamp(b.phaseAge/.5,0,1);
 return b.phase==='game-attack'?clamp((3.6-b.phaseAge)/.6,0,1):0;
}
