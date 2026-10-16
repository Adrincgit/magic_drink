import {jugglerWalkPose} from '../actors/enemies/adventureJugglerWalk';

export function drawJugglerWalk(c,e,art,size=160,reduced=false,torsoKey='juggler-walk-torso'){
 const pose=jugglerWalkPose(e.gait||0,reduced),legs=art['juggler-leg-cycle'];
 c.save();c.translate(e.x,e.y);c.scale((e.dir>0?-1:1)*size/256,size/256);
 const drawLeg=part=>{
  // These upper attachments belong inside the shorts. Hide them above the
  // hip seam even when a bent leg's painted attachment reaches past the belly.
  c.save();c.beginPath();c.rect(-128,-250+214+pose.bodyY,256,42-pose.bodyY);c.clip();
  c.drawImage(legs,part.frame%4*256,Math.floor(part.frame/4)*256,256,256,-128+part.offsetX,-250+part.offsetY,256,256);c.restore();
 };
 c.save();c.filter=(c.filter==='none'?'':c.filter+' ')+'brightness(0.86)';drawLeg(pose.far);c.restore();
 drawLeg(pose.near);
 c.drawImage(art[torsoKey],-128,-250+pose.bodyY,256,256);
 c.restore();
}
