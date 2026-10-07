import {groundY} from '../world/adventureTerrain';

export function bindCarriedBunnies(s){
 for(const c of s.cages){
  if(c.carrier===undefined||!c.carried||c.rescued||c.lost)continue;
  const e=s.enemies.find(e=>e.type===7&&e.home===c.carrier);
  if(e)e.captive=c;
  else{c.carried=false;c.lost=true;}
 }
}
export function releaseCarriedBunny(e){
 const c=e.captive;if(!c||c.lost||c.rescued||!c.carried)return;
 Object.assign(c,{carried:false,open:true,hp:0,x:e.x,y:e.y+40,falling:true,vy:-65,vx:45});
 e.captive=null;
}
export function loseCarriedBunny(e){
 const c=e.captive;if(!c||!c.carried)return;
 c.carried=false;c.lost=true;e.captive=null;
}
export function stepFreedBunnies(s,dt){
 for(const c of s.cages){
  if(!c.falling||c.rescued||c.lost)continue;
  c.vy+=480*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;
  const floor=groundY(s.platforms,c.x);
  if(c.y>=floor){c.y=floor;c.vy=0;c.vx=0;c.falling=false;}
 }
}
