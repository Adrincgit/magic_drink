import {groundY} from './adventureTerrain';
import {RIVER_TREE_ART} from './riverTreeArt';
import {RIVER_WOODLAND} from './adventureRiverDepth';
export const RIVER_BRIDGE_SPANS=[[3660,4400],[7540,8230]];
// Expand the river crossings, carrying every authored landmark downstream.
export function riverRouteX(x){return x+RIVER_BRIDGE_SPANS.reduce((extra,[start,end])=>extra+Math.max(0,Math.min(x-start,end-start)),0);}

// A horizontal woodland walk, then two gentle descents to the river. Bridges
// are collision surfaces in the same continuous trail, not floating scenery.
export function shapeRiverRoute(level){
 const points=[[0,480],[1900,480],[3000,610],[3660,610],[4400,610],[6220,610],[6860,650],[7540,650],[8230,650],[10400,650],[12000,650]].map(([x,y])=>[riverRouteX(x),y]);
 Object.assign(level,{groundRoute:true,riverRoute:true,cameraFloor:400,themeStart:true,width:riverRouteX(12000),arena:{left:riverRouteX(10400),right:riverRouteX(12000),y:650,entry:riverRouteX(10520)},boss:[riverRouteX(11655),650],exit:[riverRouteX(11910),650]});
 level.platforms=points.slice(0,-1).map(([x,y],i)=>({x,y,w:points[i+1][0]-x,yEnd:points[i+1][1],h:24,kind:'earth',bridge:RIVER_BRIDGE_SPANS.some(([start])=>riverRouteX(start)===x)}));
 const floor=x=>groundY(level.platforms,x);
 level.rivers=level.platforms.filter(q=>q.bridge).map(q=>({x:q.x,w:q.w,y:q.y+62}));
 // The middle rescue travels with the first zeppelin; the other two stay on the trail.
 level.cages=[1720,3420,9220].map((at,i)=>{const x=riverRouteX(at);return[x,floor(x),...(i===1?[3420]:[])];});
 level.checkpoints=[4520,10100].map(at=>{const x=riverRouteX(at);return[x,floor(x)];});level.checkpoint=level.checkpoints[0];
 const encounters=[[940,0],[1420,3],[2050,2],[2580,4],[3160,0],[3480,3],[3940,2],[4700,4],[5050,0],[5540,3],[6020,2],[6540,4],[7040,0],[7360,3],[7880,2],[8580,4],[8930,0],[9480,3],[9870,4],[10240,0]];
 encounters.push([3420,7],[7140,7]);encounters.sort((a,b)=>a[0]-b[0]);
 level.enemies=encounters.map(([at,t])=>{const x=riverRouteX(at);return[x,floor(x)-(t===2?130:t===7?195:0),t];});
 level.hazards=[2280,5640,8800].map(at=>{const x=riverRouteX(at);return[x,floor(x)-20,48];});
 level.supplies=[{x:1510,kind:1},{x:5930,kind:2},{x:9900,kind:1}].map(q=>({...q,x:riverRouteX(q.x),y:floor(riverRouteX(q.x))-28}));level.pickups=level.supplies;
 level.outposts=[{x:3270,drink:1},{x:6860,drink:3}].map(q=>({...q,x:riverRouteX(q.x),y:floor(riverRouteX(q.x))}));
 level.stars=[];for(let at=760;at<10200;at+=680)for(let k=0;k<3;k++){const x=riverRouteX(at+k*45);level.stars.push([x,floor(x)-43-(k===1?12:0)]);}
 level.scenery=[
  ['river-tree-oak',790,390],['log',1230,65],['river-tree-birch',1840,420],
  ['river-tree-hawthorn',2390,320],['river-tree-willow',2890,400],['log',3540,72],
  ['river-tree-birch',4770,410],['log',5020,75],['river-tree-oak',5810,375],
  ['river-tree-hawthorn',6470,315],['river-tree-willow',7050,420],['log',8440,76],
  ['river-tree-birch',9030,390],['river-tree-hawthorn',9510,305],
  ['river-tree-oak',10040,410],
 ].map(([kind,at,h])=>{const x=riverRouteX(at);return{kind,x,y:floor(x),h,depth:1,...RIVER_TREE_ART[kind],embed:kind==='log'?9:28};});
 level.sections=[{x:0,name:level.name},{x:1900,name:['La bajada al río','Down to the river']},{x:3660,name:['El puente de los susurros','Whispering bridge']},{x:7540,name:['Agua bajo las raíces','Water beneath the roots']},{x:10400,name:level.bossName}].map(q=>({...q,x:riverRouteX(q.x)}));
 level.woodland=RIVER_WOODLAND.map(q=>({...q,x:riverRouteX(q.x)}));
}
