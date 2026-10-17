import {foley} from './foleyTexture';
export const MATERIAL_COMBAT_EVENTS=['impactFire','impactWater','impactHoney','impactJelly','impactElectric','impactBubble','bubbleCapture','bubbleBurst','jellyBounce','enemyBall','enemyStreamer','enemyRing','enemyJuggle','enemyBone','enemyBomb','enemyFlame','diverThrow','bargeSplash','bargeBeat','bargeJet','bargeSpout','bargeSurge','bargePressureBurst','cannon','bargeCannon'];
const events=new Set(MATERIAL_COMBAT_EVENTS);
export function playMaterialCombatSound(ctx,out,kind,at=ctx.currentTime,placement={}){
 if(!events.has(kind))return false;
 const f=foley(ctx,out,at,{space:.16,...placement,gain:(placement.gain??1)*(['impactFire','enemyFlame'].includes(kind)?1.6:1)});
 switch(kind){
  case 'bargeBeat':
   f.air(.055,.23,2400,600,0,'grit');f.body(98,38,.42,.24);f.body(167,92,.28,.09);f.air(.34,.1,280,65,0,'rumble');f.grit(3,.075,1800,.025);break;
  case 'bargeJet':case 'bargeSpout':
   f.air(.07,.22,2500,800,0,'grit');f.air(kind==='bargeJet'?1.65:.72,.25,4100,750,.02,'breath',.025);f.air(kind==='bargeJet'?1.5:.5,.12,420,120,.02,'rumble');f.grit(kind==='bargeJet'?14:7,.08,3200,kind==='bargeJet'?.11:.065);break;
  case 'bargeSurge':
   f.air(.08,.27,1700,500,0,'grit');f.air(.92,.31,3000,320,0,'breath',.02);f.air(.9,.18,180,45,0,'rumble');f.body(86,29,.52,.15);f.grit(11,.075,3500,.055);break;
  case 'bargePressureBurst':
   f.air(.06,.3,4700,900,0,'grit');f.air(.7,.26,3400,360,.025,'breath');f.body(105,28,.42,.19);f.grit(9,.14,2500,.04);f.air(.7,.1,200,45,0,'rumble');break;
  case 'impactFire':case 'enemyFlame':
   f.air(.34,.2,1700,260,0,'breath');f.air(.12,.13,4100,1200,0,'grit');f.grit(6,.1,2900,.034);f.body(95,34,.18,.085);break;
  case 'impactWater':case 'bargeSplash':
   f.air(.14,.24,2100,700,0,'breath',.005);f.air(.48,.16,4300,1100,.025,'air',.028);f.air(.23,.1,620,180,.02,'breath');f.grit(9,.085,3900,.036);f.body(130,43,.12,.085);break;
  case 'impactHoney':
   f.air(.26,.25,700,180,0,'breath',.012,1.3);f.air(.19,.12,180,850,.08,'grit',.025,2);f.body(145,43,.16,.13);f.body(240,78,.08,.045,.06);f.grit(3,.08,1500,.06);break;
  case 'impactJelly':case 'jellyBounce':
   f.air(.09,.17,980,310,0,'breath');f.body(190,62,.09,.16);f.body(92,340,.13,.08,.07);f.air(.18,.075,420,1300,.05,'breath',.04,2.4);f.body(300,110,.16,.035,.16);break;
  case 'impactElectric':
   f.air(.14,.17,4700,1600,0,'grit');f.grit(7,.12,5700,.018);f.air(.23,.08,1500,750,0,'breath');f.body(95,37,.1,.075);break;
  case 'impactBubble':case 'bubbleCapture':case 'bubbleBurst':{
   const capture=kind==='bubbleCapture';f.air(capture?.25:.09,.19,capture?380:1800,capture?1200:450,0,'breath',.009,1.6);
   f.body(capture?105:280,capture?360:55,.1,.14);f.air(.18,.08,2900,1000,.025);f.grit(capture?3:6,.07,2600,.028);break;
  }
  case 'cannon':case 'bargeCannon':case 'enemyBomb':
   f.air(.055,.32,2800,800,0,'grit');f.air(.32,.27,1000,100,0,'breath');f.air(.48,.2,160,40,.025,'rumble');f.body(105,28,.36,.21);f.grit(5,.11,1800,.04);break;
  case 'diverThrow':
   f.air(.13,.16,2400,600,0,'breath');f.air(.055,.1,4400,1800);f.body(210,75,.08,.055);f.grit(4,.06,3800,.022);break;
  case 'enemyStreamer':
   f.air(.21,.16,3400,700,0,'air',.018);f.air(.06,.13,5000,1400,.015,'grit');f.body(190,75,.075,.045);break;
  case 'enemyRing':
   f.air(.22,.13,2800,650,0,'air',.02);f.body(1780,1610,.19,.021);f.body(2900,2650,.13,.012,.018);f.grit(3,.055,3600,.032);break;
  case 'enemyJuggle':case 'enemyBall':
   f.air(.12,.12,1800,450,0,'breath');f.body(210,70,.075,.08);f.air(.08,.06,3400,1200,.02);break;
  case 'enemyBone':
   f.air(.17,.12,2600,750,0,'air',.01);f.grit(3,.085,2300,.025);f.body(420,170,.07,.04);break;
 }return true;
}
