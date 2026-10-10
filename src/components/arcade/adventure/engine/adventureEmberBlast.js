import {fireImpact} from '../actors/bosses/harlequinFire';
// Relative to the previous 648px impacts: torches/cinders -40%, mortars -25%.
export function emberBlastSize(kind){return 648*(kind==='ember-mortar'?.75:.6);}
export function emberBlastHitbox(q){
 if(q.kind!=='ember-blast'||q.age>=.575)return null;
 // The first five fire-show drawings contain flame; the last three are
 // dissipating smoke. Collision follows the same expansion as those frames.
 const frame=Math.min(4,Math.floor(q.age/.92*8));
 const radius=q.size*[.12,.24,.36,.43,.32][frame],h=q.size*[.14,.30,.45,.46,.43][frame];
 return{x:q.x-radius,y:q.y-h*(q.grounded?1:.68),w:radius*2,h};
}
export function burstEmberProjectile(s,q,{grounded=false,damaging=true,multiplier=1}={}){
 const size=emberBlastSize(q.kind)*multiplier;
 fireImpact(s,q.x,q.y,size/270,grounded);
 if(damaging)s.hostile.push({kind:'ember-blast',element:'fire',x:q.x,y:q.y,vx:0,vy:0,r:0,size,grounded,age:0,life:.575});
 s.events.push('emberImpact');
}
