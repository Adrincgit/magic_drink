import {surfaceY} from '../world/adventureTerrain';
export const placedDrink=kind=>kind===6||kind===10;
export function placementPoint(s,q){
 const x=s.player.x+q.dir*q.distance;
 const platform=s.platforms.filter(p=>!p.gone&&x>=p.x&&x<=p.x+p.w&&surfaceY(p,x)>=s.player.y-65).sort((a,b)=>surfaceY(a,x)-surfaceY(b,x))[0];
 const floor=platform?surfaceY(platform,x):s.player.y+100;
 return {x,y:q.kind===10?floor-q.height:floor,floor,platform,valid:!!platform&&floor-s.player.y<330};
}
export function startPlacement(s,kind){s.placement={kind,dir:s.player.dir,distance:kind===6?100:210,height:175,age:0,released:false};s.events.push('prismReflect');}
export function stepPlacement(s,input,dt){
 const q=s.placement,p=s.player;if(!q)return null;
 if(p.hitReact>0||p.dash>0||p.guarding||p.drinkCast>0||s.weapon!==q.kind||s.superCinematic){s.placement=null;return null;}
 q.age+=dt;
 if(!q.released){
  q.distance=Math.max(55,Math.min(390,q.distance+((input.right?1:0)-(input.left?1:0))*q.dir*190*dt));
  q.height=Math.max(90,Math.min(250,q.height+((input.up?1:0)-(input.down?1:0))*150*dt));
 }
 Object.assign(q,placementPoint(s,q));
 if(!input.special)q.released=true;
 if(!q.released||q.age<.2)return null;
 s.placement=null;return q.valid?q:null;
}
