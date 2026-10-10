import {makeEnemy} from '../actors/enemies/adventureEnemies';
import {waterSplash} from '../actors/enemies/adventureDiver';

export function resetHarborAmbush(s,x=s.player.x){
 const room=s.level.harborAmbush;
 if(room)s.harborAmbush={state:x>room.right?'cleared':'waiting',wave:0,age:0,next:0};
}
export function harborAmbushStatus(s){
 const a=s.harborAmbush,room=s.level.harborAmbush;
 if(a?.state!=='active')return null;
 return{wave:a.wave+1,total:room.waves.length,remaining:room.waves[a.wave].length-a.next+s.enemies.filter(e=>e.harborAmbush&&e.hp>0).length};
}
function arrive(s,q){
 const room=s.level.harborAmbush,dir=q.side===-1?1:-1;
 const x=q.x??(q.side===-1?room.left-90:room.right+90);
 const e=makeEnemy(x,room.y-(q.type===7?205:0),q.type,0);
 Object.assign(e,{harborAmbush:true,dir,timer:1.3});
 if(q.type===9)Object.assign(e,{boat:true,waterY:room.y+143,y:room.y+143,left:room.left+130,right:room.right-130,sailDir:dir});
 if(q.type===7)Object.assign(e,{flightActive:true,patrol:{left:room.left+145,right:room.right-145,speed:s.gentle?120:150}});
 if(q.type===8)waterSplash(s,x,room.y+132,85);
 s.enemies.push(e);
}
export function stepHarborAmbush(s,dt){
 const room=s.level.harborAmbush,a=s.harborAmbush;
 if(!room||!a||a.state==='cleared')return;
 if(a.state==='waiting'){
  // A later checkpoint (or a boss preview) must never reopen this encounter.
  if(s.player.x>room.right){a.state='cleared';return;}
  if(s.player.x<room.trigger)return;
  a.state='active';a.age=0;s.events.push('checkpoint');
 }
 a.age+=dt;
 const wave=room.waves[a.wave];
 while(a.next<wave.length&&a.age>=wave[a.next].at)arrive(s,wave[a.next++]);
 if(a.next<wave.length||s.enemies.some(e=>e.harborAmbush&&e.hp>0))return;
 if(a.wave+1<room.waves.length){a.wave++;a.next=0;a.age=-1.1;return;}
 a.state='cleared';s.hostile=[];s.events.push('rescue');
}
