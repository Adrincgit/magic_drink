import {foley,createTextureVoice} from './foleyTexture';
export const WORLD_COMBAT_EVENTS=['witchRay','witchDrop','soulCast','magicImpact','magicSplash','candyTransform','candyRelease','witchAbsorb','pumpkinBirth','pumpkinBreak','rubbleHit','rubbleBreak','woodHit','woodBreak','wagonBreak','wallCollapse','stoneThrow','bodyFall','harvesterArrival','harvesterCast','harvesterCrack','break'];
const kinds=new Set(WORLD_COMBAT_EVENTS);
export function playWorldCombatSound(ctx,out,kind,at=ctx.currentTime,placement={}){
 if(!kinds.has(kind))return false;const f=foley(ctx,out,at,{...placement,space:.32});
 switch(kind){
  case 'witchRay':case 'harvesterCast':f.air(.42,.24,1700,390,0,'breath',.012);f.air(.12,.14,4400,1300);f.grit(6,.11,3900,.026);f.body(106,38,.32,.11);break;
  case 'soulCast':f.air(.38,.22,2100,540,0,'breath',.018);f.air(.19,.13,4700,1700,0,'grit');f.body(170,55,.17,.06);break;
  case 'witchDrop':f.air(.23,.15,1000,400,0,'breath');f.body(220,62,.11,.075);f.grit(3,.07,1400);break;
  case 'magicImpact':f.air(.2,.22,4200,700,0,'grit');f.body(145,40,.18,.11);f.grit(4,.11,3100,.035);break;
  case 'magicSplash':f.air(.48,.2,2400,420,0,'breath',.01);f.grit(8,.09,3200,.037);f.body(85,32,.24,.12);break;
  case 'candyTransform':f.air(.42,.2,420,2800,0,'breath',.08);f.air(.07,.25,4300,1000,.23);f.body(250,60,.1,.14,.23);f.grit(5,.1,3800,.035);break;
  case 'candyRelease':f.air(.23,.18,1200,3600,0,'breath',.02);f.air(.36,.07,4600,1600,.12);f.grit(4,.08,4600,.035);break;
  case 'witchAbsorb':f.air(.65,.19,360,1700,0,'breath',.16);f.body(49,74,.6,.08);break;
  case 'pumpkinBirth':f.air(.22,.22,1400,430,0,'breath');f.body(140,42,.26,.15);f.grit(6,.09,2700,.04);break;
  case 'pumpkinBreak':f.air(.25,.25,1800,320,0,'grit');f.body(130,39,.23,.16);f.grit(8,.17,2200,.045);break;
  case 'rubbleHit':case 'woodHit':f.air(.095,.18,kind==='woodHit'?920:2400,400,0,'grit');f.body(kind==='woodHit'?180:115,60,.1,.08);f.grit(3,.08,2600,.02);break;
  case 'rubbleBreak':case 'woodBreak':case 'wagonBreak':case 'wallCollapse':case 'break':{
   const large=['wagonBreak','wallCollapse'].includes(kind),wood=['woodBreak','wagonBreak'].includes(kind);
   f.air(large?1.1:.5,large?.35:.22,wood?1300:2100,180,0,'grit');f.air(large?1.3:.55,large?.24:.12,240,45,0,'rumble');f.body(wood?130:85,29,large?.75:.28,large?.18:.1);
   f.grit(large?13:7,large?.22:.13,wood?1600:3300,.046);
   if(wood){f.air(.25,.15,650,180,.02,'breath',.015,3);f.body(390,350,.15,.04,.05);}break;
  }
  case 'stoneThrow':f.air(.14,.08,2800,650,0,'breath',.02);break;
  case 'bodyFall':f.air(.22,.18,720,160,0,'breath');f.body(80,30,.19,.11);break;
  case 'harvesterArrival':f.air(1.4,.3,120,520,0,'rumble',.15);f.air(.95,.16,700,280,0,'breath',.2);f.grit(9,.08,1200,.085);break;
  case 'harvesterCrack':f.air(.55,.22,3900,700,0,'grit');f.grit(10,.18,4100,.037);f.body(80,28,.6,.15);break;
 }return true;
}
export function villageChannelProfile(s){
 if(!s?.level?.villageTrail||s.done||s.clear||s.playerDefeat)return null;
 const witches=(s.enemies||[]).filter(e=>[26,28].includes(e.type)&&e.hp>0&&['absorb','absorb-player'].includes(e.phase)).sort((a,b)=>Math.abs(a.x-s.player.x)-Math.abs(b.x-s.player.x));
 const e=witches[0];if(!e)return null;const dx=e.x-s.player.x,d=Math.abs(dx);if(d>1000)return null;
 return{gain:(.075+Math.min(1,(e.phaseAge||0)/2)*.035)*(1-d/1150),frequency:600+Math.min(1,(e.phaseAge||0)/3)*1200,pitch:43,crackle:.45,pan:Math.max(-.8,Math.min(.8,dx/600))};
}
export const createVillageVoice=createTextureVoice;
