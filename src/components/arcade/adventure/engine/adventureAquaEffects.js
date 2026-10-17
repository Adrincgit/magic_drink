import {groundY} from '../world/adventureTerrain';
import {worldSound} from './adventureWorldAudio';

export function aquaFloor(s,x){
 const pit=s.level.emberPits?.find(p=>x>p.x&&x<p.x+p.w);
 const river=s.level.rivers?.find(q=>x>=q.x&&x<=q.x+q.w),bridge=s.platforms.find(q=>q.bridge&&x>=q.x&&x<=q.x+q.w);
 const channel=s.level.arena.waterY!==undefined&&x>=s.level.arena.left&&x<=s.level.arena.right?s.level.arena.waterY:bridge?bridge.y+143:river?.y;
 return pit?.y??channel??groundY(s.level.route||s.platforms,x);
}
const aquaSlope=(s,x)=>s.level.emberPits?.some(p=>x>p.x&&x<p.x+p.w)?0:
 Math.max(-.65,Math.min(.65,(groundY(s.level.route||s.platforms,x+8)-groundY(s.level.route||s.platforms,x-8))/16));
const effect=(s,kind,x,y,size,duration,extra={})=>{
 const q={aqua:true,aquaKind:kind,x,y,size,age:0,life:duration,duration,...extra};s.effects.push(q);return q;
};
function puddle(s,x,y,size){
 const old=s.effects.find(q=>q.aquaKind==='puddle'&&Math.abs(q.x-x)<40&&Math.abs(q.y-y)<18);
 if(old){old.life=Math.min(old.duration,old.life+.35);old.size=Math.min(105,Math.max(old.size,size));return;}
 effect(s,'puddle',x,y+2,size,2.2,{slope:aquaSlope(s,x)});
}
export function aquaImpact(s,x,y,size=75,steam=false){
 // A burning shrub also owns a ground-fire hitbox. One contact gets one splash.
 if(s.effects.some(q=>q.aquaKind==='impact'&&q.age<.045&&Math.abs(q.x-x)<65&&Math.abs(q.y-y)<65))return;
 const floor=aquaFloor(s,x),grounded=y>=floor-18;
 y=Math.min(y,floor-3);
 effect(s,'impact',x,grounded?floor:y,size,.36,{grounded,slope:grounded?aquaSlope(s,x):0});
 if(grounded)puddle(s,x,floor,size*.85);
 const count=size>100?11:7;
 for(let i=0;i<count;i++){
  const spread=(i/(count-1)-.5)*2;
  effect(s,'drop',x+spread*6,y-5,12+(i%3)*3,2.8,{
   vx:spread*(85+size*.35),vy:-95-(i*47%120),mark:i%3===0,seed:i,
  });
 }
 if(steam)for(let i=0;i<3;i++){
  const delay=i*.11,duration=1.5+i*.16;
  effect(s,'steam',x+(i-1)*size*.16,y+12,size*(.7+i*.12),duration,{
   age:-delay,life:duration+delay,vx:(i-1)*13-6,rise:32+i*9,seed:i,opacity:.76,
  });
 }
 if(!s.events.some(q=>(typeof q==='string'?q:q.kind)==='impactWater'))worldSound(s,'impactWater',x,y);
}
export function aquaExtinction(s,x,y,width,height,strength=1){
 // This remnant has no hitbox: damage stops immediately, the painting settles
 // into the soaked ground for a fraction of a second behind the rising vapor.
 if(s.effects.some(q=>q.aquaKind==='extinction'&&q.age<.05&&Math.abs(q.x-x)<65&&Math.abs(q.y-y)<25))return;
 effect(s,'extinction',x,y,width,.34,{height,strength});
 effect(s,'steam',x,y-8,Math.min(145,Math.max(85,width*.65)),1.85,{
  age:-.08,life:1.93,vx:8,rise:37,seed:1,opacity:.78,
 });
}
export function stepAquaEffect(s,q,dt){
 if(q.aquaKind!=='drop')return;
 const pit=s.level.emberPits?.find(p=>q.x>p.x&&q.x<p.x+p.w);
 q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=580*dt;
 // Water below a hollow's lip hits its side, then drains down. It must never
 // snap upward onto the higher trail when its horizontal arc crosses the wall.
 if(pit&&q.y>Math.min(aquaFloor(s,pit.x),aquaFloor(s,pit.x+pit.w))+3&&(q.x<=pit.x+2||q.x>=pit.x+pit.w-2)){
  q.x=Math.max(pit.x+2,Math.min(pit.x+pit.w-2,q.x));q.vx=0;
 }
 const floor=aquaFloor(s,q.x);
 if(q.vy>0&&q.y>=floor){
  q.y=floor;q.aquaKind='landing';q.size*=2.6;q.age=0;q.life=q.duration=.27;
  q.slope=aquaSlope(s,q.x);
  if(q.mark)puddle(s,q.x,floor,q.size*1.5);
 }
}
