import {groundY} from './adventureTerrain';
import {VILLAGE_OBSTACLE_ART} from './villageObstacleArt';
import {addVillageBlockade} from './villageBlockade';

export function addVillageDestruction(level){
 const floor=x=>groundY(level.route,x);
 const layout=[[8050,'wagon'],[10160,'crates'],[10580,'beam'],[13350,'wagon'],[15750,'beam'],[16200,'crates'],[18700,'wagon'],[20400,'crates']];
 const shape={wagon:{w:218,h:152,size:240,hp:12,frame:0},crates:{w:132,h:108,size:210,hp:7,frame:4},beam:{w:128,h:70,size:145,hp:8,frame:8}};
 level.obstacles=layout.map(([x,kind],i)=>({id:'village-obstacle:'+i,x,y:floor(x),kind,...shape[kind],ambush:[0,1,3,4,6].includes(i),secondWave:i===0||i===3}));
 for(const r of [...level.obstacles])if(r.kind==='wagon')for(const dir of [-1,1]){const x=r.x+dir*165;level.obstacles.push({id:r.id+':step:'+dir,x,y:floor(x),kind:'step',w:95,h:76,size:138,hp:4,frame:4});}
 for(const r of level.obstacles){r.h=VILLAGE_OBSTACLE_ART[r.kind].height;r.profile=VILLAGE_OBSTACLE_ART[r.kind].profile;}
 // The families are caught between two barriers. They still have real bodies
 // and remain vulnerable to the witches until the westward route is opened.
 for(const [group,x] of [[0,10355],[1,15940]])for(let i=0;i<3;i++){
  const q=level.villagers.find(n=>n.group>=5&&!n.rubbleId&&!n.defender&&n.obstaclePocket===undefined&&n.style===[0,2,7][i]);
  Object.assign(q,{x:x+i*45,y:floor(x+i*45),wakeX:x-760,warning:false,trip:false,obstaclePocket:group});
 }
 for(const q of level.villagers)if(q.obstaclePocket===undefined)for(const r of level.obstacles)if(Math.abs(q.x-r.x)<r.w/2+35){q.x=r.x+r.w/2+45;q.y=floor(q.x);}
 for(const x of [8800,11280,14350,16800,19250])level.enemies.push([x,floor(x),25,-1]);
 for(const [i,x] of [10950,14550,17450,19650].entries()){
  const style=i%2?7:6,q=level.villagers.find(n=>n.group>=6&&n.style===style&&!n.rubbleId&&!n.defender&&n.obstaclePocket===undefined);
  const id='shelter:'+i;Object.assign(q,{x,y:floor(x),wakeX:x-850,warning:false,trip:false,rubbleId:id,hidingCover:id});
  level.rubble.push({id,x,y:floor(x),hp:4,villager:q.id,shelter:true});
 }
 // The evacuation carriage belongs to the approach. The street wrecks have
 // no horse or passengers, and are physical objects rather than decoration.
 level.carriages=[{id:0,x:1300,y:floor(1300)-28,wakeX:0,speed:285}];
 return addVillageBlockade(level);
}
