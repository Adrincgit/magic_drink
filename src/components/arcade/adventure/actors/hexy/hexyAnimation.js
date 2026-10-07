import originalAtlas from './hexyAtlas';
import combatAtlas from './hexyCombatAtlas';
import movementAtlas from './hexyMovementAtlas';
import handAtlas from './hexyHandAtlas';
import airSuperAtlas from './hexyAirSuperAtlas';
import standingDownAtlas from './hexyStandingDownAtlas';
import crouchRestAtlas from './hexyCrouchRestAtlas';
import actionAtlas from './hexyActionAtlas';
import {hexyRegistration} from './hexyPoseRegistration';
import {shopEntryPose} from '../../engine/adventureShop';
const atlas={...originalAtlas,...combatAtlas,...movementAtlas,...handAtlas,...airSuperAtlas,...standingDownAtlas,...crouchRestAtlas,...actionAtlas};
atlas['drink-original']=Array.from({length:4},()=>({tip:[236,250]}));
for(const sheet of ['shop-enter','shop-exit'])atlas[sheet]=Array.from({length:8},()=>({tip:[236,250]}));

export const HEXY_SHEETS=['air-aim','ground-aim','run','jump','crouch-walk','roll','cast','heavy','reactions','run-fire','run-diagonal-up','stand-fire','air-dash','guard-pose','somersault','glide','air-heavy','aim-down-diagonal','aim-down','crouch-heavy','super-charge','super-release','celebrate','flag-plant','drink-original','air-super','air-super-release','shop-enter','shop-exit'];
export const HEXY_SIZE=116;
export const HEXY_RUN_FRAMES=atlas.run.length;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Select drawings from physical state; jump poses never loop on a wall clock.
export function hexyPose(s){
 const p=s.player,cast=p.cast>0,castFrame=[1,2,0,3][clamp(Math.floor((.24-p.cast)/.06),0,3)];
 const entering=shopEntryPose(s);if(entering)return entering;
 if(s.clear){
  if(s.clear.stage==='land')return{sheet:'jump',frame:5};
  if(s.clear.stage==='leave')return{sheet:'run',frame:Math.floor(p.stride*HEXY_RUN_FRAMES)%HEXY_RUN_FRAMES};
  return{sheet:'flag-plant',frame:clamp(Math.floor(s.clear.age/.4),0,3)};
 }
 // Recoil follows each actual shot, not a separate looping wall clock. Between
 // slower shots, keep the eye and wand aimed instead of dropping to idle.
 const steadyFrame=cast?[1,2,3,0][clamp(Math.floor((.24-p.cast)/.06),0,3)]:0;
 if(s.done)return s.won?{sheet:'celebrate',frame:Math.floor(s.fxTime*6)%4}:{sheet:'reactions',frame:5};
 if(p.drinkCast>0)return{sheet:'drink-original',frame:clamp(Math.floor((.7-p.drinkCast)/.175),0,3)};
 if(p.dash>0)return {sheet:p.dashAir?'air-dash':'roll',frame:clamp(Math.floor((1-p.dash/p.dashDuration)*8),0,7)};
 if(p.hitReact>0)return {sheet:'reactions',frame:4+clamp(Math.floor((.32-p.hitReact)*12.5),0,3)};
 if(p.guarding)return {sheet:'guard-pose',frame:p.guardHit>0?4:2+Math.floor(s.time*5)%2};
 if(s.superCinematic?.airborne){
  if(p.superCast>0)return {sheet:'air-super-release',frame:Math.floor(s.superCinematic.age*10)%4};
  if(p.charge>0)return {sheet:'air-super',frame:clamp(Math.floor(p.charge/.225),0,3)};
 }
 if(p.superCast>0)return {sheet:'super-release',frame:s.superCinematic?.age>2.95?3:1+Math.floor((s.superCinematic?.age||s.fxTime)*10)%2};
 if(p.charge>0)return {sheet:'super-charge',frame:clamp(Math.floor(p.charge/.225),0,3)};
 if(p.specialCast>0){
  const frame=[1,2,2,3][clamp(Math.floor((.36-p.specialCast)/.09),0,3)];
  if(p.crouch)return {sheet:'ground-aim',frame:8+frame};
  if(p.specialAimY>0&&p.ground!==null)return {sheet:'ground-aim',frame:12+frame};
  if(p.specialAimY>0)return {sheet:p.specialAimX===0?'aim-down':'aim-down-diagonal',frame};
  if(p.specialAimY<0)return {sheet:p.ground===null?'air-aim':'ground-aim',frame:(p.ground===null?(p.specialAimX===0?8:4):(p.specialAimX===0?4:0))+frame};
  return {sheet:p.ground===null?'air-aim':'stand-fire',frame};
 }
 if(p.crouch){
  if(Math.abs(p.vx)>20)return {sheet:'crouch-walk',frame:Math.floor(p.stride*8)%8};
  return {sheet:'ground-aim',frame:8+steadyFrame};
 }
 // Airborne state wins over standing aim. A double jump keeps its tumble
 // until an actual shot cancels the spin; aiming alone never plants the feet.
 if(p.ground===null){
  if(p.spin>0)return {sheet:'somersault',frame:[0,1,2,4,5,6,7,7][clamp(Math.floor((.5-p.spin)*16),0,7)]};
  if(p.aimY<0)return {sheet:'air-aim',frame:(p.aimX===0?8:4)+steadyFrame};
  if(p.aimY>0)return {sheet:p.aimX===0?'aim-down':'aim-down-diagonal',frame:steadyFrame};
  if(cast||p.firing)return {sheet:'air-aim',frame:steadyFrame};
  if(p.gliding)return {sheet:'glide',frame:Math.floor(s.time*6)%4};
  return {sheet:'jump',frame:p.jumpAge<.065?1:p.vy< -380?2:p.vy< -120?3:p.vy<110?4:5};
 }
 if(p.aimY<0){
  if(p.ground!==null&&Math.abs(p.vx)>20&&p.aimX!==0)return {sheet:'run-diagonal-up',frame:Math.floor(p.stride*HEXY_RUN_FRAMES)%HEXY_RUN_FRAMES};
  return {sheet:'ground-aim',frame:(p.aimX===0?4:0)+steadyFrame};
 }
 if(p.aimY>0)return {sheet:'ground-aim',frame:12+steadyFrame};
 if(p.land>0&&!cast)return {sheet:'jump',frame:p.land>.075?6:7};
 if(Math.abs(p.vx)>20)return {sheet:cast||p.firing?'run-fire':'run',frame:Math.floor(p.stride*HEXY_RUN_FRAMES)%HEXY_RUN_FRAMES};
 if(cast||p.firing)return {sheet:'stand-fire',frame:steadyFrame};
 const phase=s.time%4;
 return {sheet:'reactions',frame:phase>3.7&&phase<3.82?2:phase<1.4?0:phase<2.6?1:3};
}

// Wand tips measured on each 320px drawing, so shots remain attached to the
// artwork when crouching, turning or aiming overhead.
export function hexyMuzzle(s,pose=hexyPose(s)){
 const tip=atlas[pose.sheet][pose.frame].tip,p=s.player,r=hexyRegistration(pose);
 return {x:p.x+((tip[0]-160)*r.scale+r.x)*HEXY_SIZE/320*p.dir,y:p.y+(tip[1]-300)*r.scale*HEXY_SIZE/320};
}
