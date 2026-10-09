import {groundY} from './adventureTerrain';

// A shoreline walk, raised optional piers and a final wide wharf. Every pier
// and its water contact belong to world coordinates, including the boss zoom.
export function shapeHarborRoute(level){
 const points=[[0,500],[1500,500],[2300,465],[2850,465],[4100,465],[4520,500],[6800,500],[7160,460],[9180,460],[9540,510],[11040,510],[11400,480],[12780,480],[13250,520],[15150,520],[16680,520]];
 const bridges=new Set([2850,7160,13250,15150]);
 Object.assign(level,{name:['La ribera de los redobles','The drumroll waterfront'],bossName:['La Barcaza del Redoble','The Drumroll Dreadnought'],
  subtitle:['Los faroles llevan al último embarcadero. La comparsa prepara su gran redoble.','Follow the lanterns to the last wharf. The troupe is preparing its grand drumroll.'],
  groundRoute:true,harborRoute:true,riverRoute:true,themeStart:true,cameraFloor:410,width:16680,
  arena:{left:13250,right:15150,y:520,entry:13390},boss:[14750,520],exit:[15780,520],sky:['#283766','#f3aa86'],
  circusArrival:{doorX:16200,floor:520,width:1120,stopX:15780}});
 level.platforms=points.slice(0,-1).map(([x,y],i)=>({x,y,yEnd:points[i+1][1],w:points[i+1][0]-x,h:24,kind:'earth',bridge:bridges.has(x)}));
 const floor=x=>groundY(level.platforms,x);
 level.rivers=level.platforms.filter(q=>q.bridge).map(q=>({x:q.x,w:q.w,y:q.y+62}));
 // Alternate rescue route: three connected little docks with short, visible jumps.
 level.platforms.push(...[[5170,435,230],[5480,365,230],[5790,300,350],[6190,380,250],[10040,420,260],[10380,340,320]].map(([x,y,w])=>({x,y,w,h:24,kind:'dock',footY:floor(x)})));
 level.cages=[[1850,floor(1850)],[5960,300],[10540,340]];
 level.checkpoints=[[4530,floor(4530)],[12880,floor(12880)]];level.checkpoint=level.checkpoints[0];
 // The cast here is deliberate: foot clowns, jugglers, divers and two zeppelins.
 const encounters=[[990,0],[1590,3],[2430,0],[3180,8],[3770,8],[4800,3],[5740,0],[6540,7],[7590,8],[8490,8],[9540,3],[10240,0],[11260,7],[11730,8],[12420,3]];
 level.enemies=encounters.map(([x,t])=>[x,floor(x)-(t===7?205:0),t]);
 level.enemies=level.enemies.filter(([x,,t])=>t!==8||bridges.has(level.platforms.find(q=>q.kind==='earth'&&x>=q.x&&x<=q.x+q.w)?.x));
 level.hazards=[[2210,floor(2210)-20,42],[6660,floor(6660)-20,46],[12180,floor(12180)-20,45]];
 level.supplies=[{x:1400,kind:2},{x:6470,kind:0},{x:12600,kind:2}].map(q=>({...q,y:floor(q.x)-28}));level.pickups=level.supplies;
 level.outposts=[{x:4790,y:floor(4790),drink:2},{x:10880,y:floor(10880),drink:3}];
 level.stars=[];for(let x=780;x<12900;x+=610)for(let i=0;i<3;i++)level.stars.push([x+i*42,floor(x+i*42)-44-(i===1?12:0)]);
 for(const q of level.platforms.filter(q=>q.kind==='dock'))for(let x=q.x+45;x<q.x+q.w-30;x+=60)level.stars.push([x,q.y-42]);
 level.scenery=[];level.woodland=[];
 level.harborProps=[...[740,2260,2810,4140,5000,6820,7110,9220,9880,11370,12720,13230,15090].map(x=>({kind:'harbor-lantern',x,y:floor(x)+8,h:172})),
  ...[[1660,240],[4540,280],[9790,220],[12950,290]].map(([x,h])=>({kind:'harbor-grove',x,y:floor(x)+36,h})),
  ...[1230,4360,6970,9630,12040].map(x=>({kind:'harbor-reeds',x,y:floor(x)+26,h:82})),
  {kind:'harbor-boat',x:3410,y:floor(3410)+137,h:98},{kind:'harbor-boat',x:8170,y:floor(8170)+151,h:115}];
 level.sections=[{x:0,name:level.name},{x:2750,name:['Los muelles de los faroles','Lantern wharves']},{x:5100,name:['Entre cuerdas y tablones','Ropes and boardwalks']},{x:7160,name:['El paso de los buzos','The divers’ crossing']},{x:13250,name:level.bossName}];
}
