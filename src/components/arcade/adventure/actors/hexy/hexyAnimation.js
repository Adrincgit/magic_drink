import {hitReactionPose} from '../../engine/adventureHitReactions';
import ribbonAtlas from './hexyRibbonAtlas';
import ribbonActionAtlas from './hexyRibbonActionAtlas';
import ribbonSpinAtlas from './hexyRibbonSpinAtlas';
import ribbonDanceAtlas from './hexyRibbonDanceAtlas';
import ribbonMasteryAtlas from './hexyRibbonMasteryAtlas';
import {ribbonFrame} from './ribbonChoreography';
import {guardAtlas,diveAtlas} from './hexyMobilityAtlas';
import originalAtlas from './hexyAtlas';
import combatAtlas from './hexyCombatAtlas';
import movementAtlas from './hexyMovementAtlas';
import handAtlas from './hexyHandAtlas';
import airSuperAtlas from './hexyAirSuperAtlas';
import standingDownAtlas from './hexyStandingDownAtlas';
import crouchRestAtlas from './hexyCrouchRestAtlas';
import actionAtlas from './hexyActionAtlas';
import superCastAtlas from './hexySuperCastAtlas';
import {clashPortraitFrames,castingWindFrame} from '../../engine/clashActing';
import {hexyRegistration} from './hexyPoseRegistration';
import {shopEntryPose} from '../../engine/adventureShop';
import {circusEntryPose} from '../../engine/adventureCircusEntrance';
const atlas={...originalAtlas,...combatAtlas,...movementAtlas,...handAtlas,...airSuperAtlas,...standingDownAtlas,...crouchRestAtlas,...actionAtlas};
atlas.fear=Array.from({length:12},()=>({tip:[236,250]}));
atlas['drink-original']=Array.from({length:4},()=>({tip:[236,250]}));
atlas['clash-fall']=Array.from({length:8},()=>({tip:[220,215]}));
atlas['super-cast']=superCastAtlas;
atlas['ribbon-swing']=ribbonAtlas;
atlas['ribbon-action']=ribbonActionAtlas;
atlas['ribbon-spin']=ribbonSpinAtlas;
atlas['ribbon-dance']=ribbonDanceAtlas;
atlas['ribbon-mastery']=ribbonMasteryAtlas;
atlas['guard-up']=guardAtlas;atlas['comet-kick']=diveAtlas;
for(const [sheet,count]of [['element-hits',12],['knockdown',8],['fire-hit',4],['heat',4]])atlas[sheet]=Array.from({length:count},()=>({tip:[235,245]}));
for(const sheet of ['shop-enter','shop-exit'])atlas[sheet]=Array.from({length:8},()=>({tip:[236,250]}));

export const HEXY_SHEETS=['air-aim','ground-aim','run','jump','crouch-walk','roll','cast','heavy','reactions','run-fire','run-diagonal-up','stand-fire','air-dash','guard-pose','somersault','glide','air-heavy','aim-down-diagonal','aim-down','crouch-heavy','super-charge','super-release','celebrate','flag-plant','drink-original','air-super','air-super-release','shop-enter','shop-exit'];
export const HEXY_SIZE=116;
HEXY_SHEETS.push('fear','clash-fall','super-cast','element-hits','knockdown','fire-hit','heat');
HEXY_SHEETS.push('ribbon-swing','ribbon-action','ribbon-spin','ribbon-dance','ribbon-mastery','guard-up','comet-kick');
export const HEXY_RUN_FRAMES=atlas.run.length;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Select drawings from physical state; jump poses never loop on a wall clock.
export function hexyPose(s){
 const p=s.player,cast=p.cast>0,castFrame=[1,2,0,3][clamp(Math.floor((.24-p.cast)/.06),0,3)];
 if(p.clashFlight)return{sheet:'clash-fall',frame:p.clashFlight.frame};
 const entering=circusEntryPose(s)||shopEntryPose(s);if(entering)return entering;
 if(s.clear){
  if(s.clear.stage==='land')return{sheet:'jump',frame:5};
  if(s.clear.stage==='leave')return Math.abs(p.vx)>1?{sheet:'run',frame:Math.floor(p.stride*HEXY_RUN_FRAMES)%HEXY_RUN_FRAMES}:{sheet:'reactions',frame:0};
  return{sheet:'flag-plant',frame:clamp(Math.floor(s.clear.age/.4),0,3)};
 }
 // Recoil follows each actual shot, not a separate looping wall clock. Between
 // slower shots, keep the eye and wand aimed instead of dropping to idle.
 const steadyFrame=cast?[1,2,3,0][clamp(Math.floor((.24-p.cast)/.06),0,3)]:0;
 if(s.done)return s.won?{sheet:'celebrate',frame:Math.floor(s.fxTime*6)%4}:{sheet:'reactions',frame:5};
 if(p.drinkCast>0)return{sheet:p.sipKind==='ribbon'?'ribbon-dance':'drink-original',frame:(p.sipKind==='ribbon'?16:0)+clamp(Math.floor((.7-p.drinkCast)/.175),0,3)};
 const hit=hitReactionPose(p);if(hit)return hit;
 if(s.ribbonDance&&p.dash>0)return{sheet:'ribbon-spin',frame:clamp(Math.floor((1-p.dash/p.dashDuration)*8),0,7)};
 if(p.dash>0&&p.dashAir&&p.dashY>0)return {sheet:'comet-kick',frame:clamp(Math.floor((1-p.dash/p.dashDuration)*4),0,3)};
 if(p.dash>0)return {sheet:p.dashAir?'air-dash':'roll',frame:clamp(Math.floor((1-p.dash/p.dashDuration)*8),0,7)};
 if(p.hitReact>0)return {sheet:'reactions',frame:4+clamp(Math.floor((.32-p.hitReact)*12.5),0,3)};
 if(s.ribbonDance&&p.guarding)return{sheet:'ribbon-dance',frame:12+Math.floor(p.guardAge*12)%4};
 if(p.guarding&&p.guardY<0)return {sheet:'guard-up',frame:p.guardHit>0?3:p.guardAge<.1?0:1+Math.floor(s.time*5)%2};
 if(p.guarding)return {sheet:'guard-pose',frame:p.guardHit>0?4:2+Math.floor(s.time*5)%2};
 if(p.superCast>0)return {sheet:'super-cast',frame:(s.powerClash?clashPortraitFrames(s.powerClash).hexy:3)*3+castingWindFrame(s.fxTime)};
 if(s.superCinematic?.airborne){
  if(p.charge>0)return {sheet:'air-super',frame:clamp(Math.floor(p.charge/.225),0,3)};
 }
 if(p.charge>0)return {sheet:'super-charge',frame:clamp(Math.floor(p.charge/.225),0,3)};
 if(p.ribbonSwing>0&&p.ribbonSpinning)return {sheet:'ribbon-spin',frame:Math.floor((p.ribbonSpinAge||0)/(p.ribbonSpinCel||.055))%8};
 if(p.ribbonSwing>0&&p.ribbonMasterMove)return{sheet:'ribbon-mastery',frame:(p.ribbonMasterMove==='wand-toss'?0:p.ribbonMasterMove==='reel-slam'?4:12)+clamp(Math.floor((1-p.ribbonSwing/p.ribbonDuration)*4),0,3)};
 if(p.ribbonSwing>0&&(p.ribbonFinisher==='launch'||p.ribbonFinisher==='airbind'||p.ribbonAcrobat))return{sheet:'ribbon-dance',frame:(p.ribbonFinisher==='launch'?0:p.ribbonFinisher==='airbind'?8:4)+clamp(Math.floor((1-p.ribbonSwing/p.ribbonDuration)*4),0,3)};
 if(p.ribbonSwing>0)return {sheet:'ribbon-action',frame:ribbonFrame(1-p.ribbonSwing/p.ribbonDuration,p.ribbonStrong,p.ribbonCombo)};
 if(s.ribbonDance&&p.ribbonCharge?.age>.2)return{sheet:'ribbon-mastery',frame:p.ribbonCharge.age<.5?12:13};
 if(s.ribbonDance&&p.ribbonFlip>0&&p.ground===null)return{sheet:'ribbon-mastery',frame:8+clamp(Math.floor((.48-p.ribbonFlip)/.12),0,3)};
 if(p.specialCast>0){
  const frame=[1,2,2,3][clamp(Math.floor((.36-p.specialCast)/.09),0,3)];
  if(p.crouch)return {sheet:'ground-aim',frame:8+frame};
  if(p.specialAimY>0&&(p.ground!==null||p.coasterGround))return {sheet:'ground-aim',frame:12+frame};
  if(p.specialAimY>0)return {sheet:p.specialAimX===0?'aim-down':'aim-down-diagonal',frame};
  if(p.specialAimY<0)return {sheet:(p.ground===null&&!p.coasterGround)?'air-aim':'ground-aim',frame:((p.ground===null&&!p.coasterGround)?(p.specialAimX===0?8:4):(p.specialAimX===0?4:0))+frame};
  return {sheet:(p.ground===null&&!p.coasterGround)?'air-aim':'stand-fire',frame};
 }
 if(p.crouch){
  if(Math.abs(p.vx)>20)return {sheet:'crouch-walk',frame:Math.floor(p.stride*8)%8};
  return {sheet:'ground-aim',frame:8+steadyFrame};
 }
 // Airborne state wins over standing aim. A double jump keeps its tumble
 // until an actual shot cancels the spin; aiming alone never plants the feet.
 if((p.ground===null&&!p.coasterGround)){
  if(p.spin>0)return {sheet:'somersault',frame:[0,1,2,4,5,6,7,7][clamp(Math.floor((.5-p.spin)*16),0,7)]};
  if(p.aimY<0)return {sheet:'air-aim',frame:(p.aimX===0?8:4)+steadyFrame};
  if(p.aimY>0)return {sheet:p.aimX===0?'aim-down':'aim-down-diagonal',frame:steadyFrame};
  if(cast||p.firing)return {sheet:'air-aim',frame:steadyFrame};
  if(p.gliding)return {sheet:'glide',frame:Math.floor(s.time*6)%4};
  return {sheet:'jump',frame:p.jumpAge<.065?1:p.vy< -380?2:p.vy< -120?3:p.vy<110?4:5};
 }
 if(p.aimY<0){
  if((p.ground!==null||p.coasterGround)&&Math.abs(p.vx)>20&&p.aimX!==0)return {sheet:'run-diagonal-up',frame:Math.floor(p.stride*HEXY_RUN_FRAMES)%HEXY_RUN_FRAMES};
  return {sheet:'ground-aim',frame:(p.aimX===0?4:0)+steadyFrame};
 }
 if(p.aimY>0)return {sheet:'ground-aim',frame:12+steadyFrame};
 if(p.land>0&&!cast)return {sheet:'jump',frame:p.land>.075?6:7};
 if(Math.abs(p.vx)>20)return {sheet:cast||p.firing?'run-fire':'run',frame:Math.floor(p.stride*HEXY_RUN_FRAMES)%HEXY_RUN_FRAMES};
 if(cast||p.firing)return {sheet:'stand-fire',frame:steadyFrame};
 if(p.heatIdle>.65)return {sheet:'heat',frame:Math.floor((p.heatIdle-.65)/.55)%4};
 if(p.fearAge>=0)return{sheet:'fear',frame:p.fearVariant*4+Math.min(3,Math.floor(p.fearAge/.4))};
 const phase=s.time%4;
 return {sheet:'reactions',frame:phase>3.7&&phase<3.82?2:phase<1.4?0:phase<2.6?1:3};
}

// Wand tips measured on each 320px drawing, so shots remain attached to the
// artwork when crouching, turning or aiming overhead.
export function hexyMuzzle(s,pose=hexyPose(s)){
 const tip=atlas[pose.sheet][pose.frame].tip,p=s.player,r=hexyRegistration(pose);
 return {x:p.x+((tip[0]-160)*r.scale+r.x)*HEXY_SIZE/320*p.dir,y:p.y+(tip[1]-300)*r.scale*HEXY_SIZE/320};
}
