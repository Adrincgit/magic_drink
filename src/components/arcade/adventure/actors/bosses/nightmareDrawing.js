import {NIGHTMARE_BODY_REGISTRATION,NIGHTMARE_STATURE} from './nightmareBodyRegistration';
import {NIGHTMARE_STORM_BODY} from './nightmareStormRegistration';
import {NIGHTMARE_COMBO_BODY} from './nightmareComboRegistration';
import {NIGHTMARE_PERFORMANCE_BODY} from './nightmarePerformanceRegistration';
import {NIGHTMARE_COMBAT_BODY} from './nightmareCombatRegistration';
import {nightmareAcrobaticCel} from './nightmareChoreography';
import {NIGHTMARE_STAFF_CHAIN} from './nightmareStaffCombo';
export {NIGHTMARE_STATURE};
export const nightmareStrideSpeed=stage=>[0,150,215,285][stage]||150;
export function coherentNightmareDrawing(drawing){
 const r=(NIGHTMARE_COMBAT_BODY[drawing.key]||NIGHTMARE_PERFORMANCE_BODY[drawing.key]||NIGHTMARE_COMBO_BODY[drawing.key]||NIGHTMARE_STORM_BODY[drawing.key]||NIGHTMARE_BODY_REGISTRATION[drawing.key])?.[drawing.frame];
 return r?{...drawing,size:r.size,offsetX:r.offsetX}:drawing;
}
export function nightmareGroundLoop(s,reduced=false){
 const b=s.boss,phase=b.stage||1,casting=['windup','attack','game-windup','game-attack'].includes(b.phase);
 const variant=phase===3?3:2;
 const acrobatic=casting&&nightmareAcrobaticCel(b,reduced);if(acrobatic)return coherentNightmareDrawing(acrobatic);
 if(b.staffRebound){const t=Math.max(0,s.time-b.staffRebound.at)/b.staffRebound.duration;return coherentNightmareDrawing({key:'nightmare-staff-defense-'+variant,frame:8+Math.min(3,Math.floor(t*4)),size:0});}
 if(['staff-spin','staff-barrage'].includes(b.game?.kind)&&casting){
  const spin=b.game.kind==='staff-spin',frame=b.phase==='game-windup'?(spin?0:12):spin?(reduced?2:Math.floor(b.phaseAge*18)%8):12+Math.floor(Math.max(0,b.phaseAge-.18)% .23/.23*4);
  return coherentNightmareDrawing({key:'nightmare-staff-defense-'+variant,frame,size:0});
 }
 if(['moon-hop','double-pounce'].includes(b.move)&&['game-windup','game-attack'].includes(b.phase)){
  const t=b.phaseAge/(b.move==='double-pounce'?.82:1.05),frame=b.phase==='game-windup'?Math.min(1,Math.floor(b.phaseAge/.25)):t<1?2+Math.min(6,Math.floor(t*7)):9+Math.min(2,Math.floor((b.phaseAge-(b.move==='double-pounce'?.82:1.05))/.08));
  return coherentNightmareDrawing({key:'nightmare-jump-'+variant,frame,size:0});
 }
 if(['staff-counter','staff-chain'].includes(b.game?.kind)&&['game-windup','game-attack'].includes(b.phase)){
  const mad=phase===3,raw=b.phaseAge||0,T=NIGHTMARE_STAFF_CHAIN;
  if(b.game.kind==='staff-chain'&&b.phase==='game-attack'&&raw>=1.76){
   const age=raw-T.airArrive,frame=raw<T.drop?(Math.floor(Math.max(0,age)*9)%2):raw<T.impact?2+Math.min(1,Math.floor((raw-T.drop)/.16)):raw<T.impact+.2?4:raw<T.impact+.38?5:raw<T.impact+.58?6:7;
   return coherentNightmareDrawing({key:'nightmare-staff-down-'+(mad?3:2),frame,size:0});
  }
  const age=b.game.kind==='staff-chain'&&b.phase==='game-attack'&&raw>=T.frontWarn?raw-T.frontWarn:raw;
  const frame=b.phase==='game-windup'?Math.min(1,Math.floor(age/.28)):age<.52?1+Math.min(mad?1:2,Math.floor(Math.max(0,age-.18)/.12)):age<.72?(mad?3:4)+Math.min(2,Math.floor((age-.52)/.067)):age<.88?6:7;
  return coherentNightmareDrawing({key:'nightmare-staff-'+(mad?3:2),frame,size:0});
 }
 if(b.flash>0&&!casting||['dying','defeated'].includes(b.phase))return null;
 if(!casting&&!['intro','transform','recover','sleep'].includes(b.phase)&&!(b.phase==='patrol'&&b.walking===false))return null;
 const frame=reduced?0:[0,1,2,3,2,1][Math.floor(b.clock*(casting?12:8))%6];
 return coherentNightmareDrawing({key:`nightmare-phase-${phase}-${casting?'cast':'idle'}`,frame,size:0});
}
export function nightmareSpritePoint(s,d,point){
 const facing=s.boss.dir>0?-1:1;
 return{x:s.boss.x+((point[0]/512-.5)*d.size+(d.offsetX||0))*facing,y:s.boss.y+(point[1]/512-.975)*d.size};
}
