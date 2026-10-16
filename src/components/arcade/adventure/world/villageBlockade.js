import {groundY} from './adventureTerrain';
import {VILLAGE_BLOCKADE_ART} from './villageBlockadeArt';
export function addVillageBlockade(level){
 const x=14880,wall={id:'village-blockade',x,y:groundY(level.route,x),kind:'collapse',w:245,size:320,h:VILLAGE_BLOCKADE_ART.height,profile:VILLAGE_BLOCKADE_ART.profile,hp:96,blockade:true};
 level.obstacles.push(wall);
 level.blockade={wallId:wall.id,x,trigger:x-540};
 for(const [i,style] of [6,0,7,1,2,3,4,5,6,7,0,1,2,3].entries()){
  const n=level.villagers.find(q=>q.group>=6&&q.style===style&&!q.rubbleId&&!q.defender&&q.obstaclePocket===undefined&&!q.blockadeGroup);
  if(!n)continue;const at=x+wall.w/2+38+i*48;
  Object.assign(n,{x:at,y:groundY(level.route,at),wakeX:x-540,warning:false,trip:false,blockadeGroup:true,blockadeOrder:i});
 }
 return level;
}
