import {rollLoot} from './adventureLoot';
export const SUPPLY_SIZE=110;
export const supplyBody=q=>({x:q.x-33,y:q.y-62,w:66,h:62});
export function createSupplies(level){
 const positions=level.pickups.filter(q=>q.x>1000).sort((a,b)=>a.x-b.x);
 const selected=[positions[0],positions[Math.floor(positions.length/2)],positions.at(-1)].filter((q,i,a)=>q&&a.indexOf(q)===i);
 return selected.map((q,id)=>({x:q.x,y:q.y+28,kind:q.kind,id,hp:4,maxHp:4,flash:0,age:0}));
}
export function releaseItem(s,x,floor,item){
 const drop={x,y:floor-35,...item,taken:false,vy:-165,floor:floor-28,collectWait:.18,dropAge:0};s.pickups.push(drop);return drop;
}
export const releaseDrink=(s,x,floor,kind)=>releaseItem(s,x,floor,{type:'drink',kind});
export function damageSupply(s,q,damage){
 if(q.hp<=0)return;
 q.hp=Math.max(0,q.hp-damage);q.flash=.13;s.events.push(q.hp?'pop':'impact');
 s.effects.push({x:q.x,y:q.y-30,row:1,size:q.hp?42:75,age:0,life:.3});
 if(!q.hp){q.age=0;releaseItem(s,q.x,q.y,q.loot||rollLoot(s,q.kind));}
}
export function updateSupplies(s,dt){
 for(const q of s.supplies){q.flash=Math.max(0,q.flash-dt);if(q.hp<=0)q.age+=dt;}
 for(const q of s.pickups){
  if(q.taken||q.floor===undefined)continue;
  q.dropAge+=dt;q.collectWait=Math.max(0,q.collectWait-dt);
  if(q.y<q.floor||q.vy<0){q.vy+=700*dt;q.y+=q.vy*dt;if(q.y>=q.floor){q.y=q.floor;q.vy=0;}}
 }
}
export const supplyFrame=q=>q.hp>0?(q.hp<q.maxHp?1:0):q.age<.12?2:q.age<.28?3:q.age<.45?4:q.age<.62?5:q.age<.8?6:7;
