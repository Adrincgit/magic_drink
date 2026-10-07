const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// One surface function drives collisions, artwork and planted scenery.
export function surfaceY(platform,x){
 return platform.y+((platform.yEnd??platform.y)-platform.y)*clamp((x-platform.x)/platform.w,0,1);
}
export function groundAt(platforms,x){
 return platforms.find(q=>q.kind==='earth'&&x>=q.x&&x<=q.x+q.w);
}
export function groundY(platforms,x,fallback=480){
 const floor=groundAt(platforms,x);return floor?surfaceY(floor,x):fallback;
}
export function sceneryPlacement(prop,camera){
 return {x:prop.x-camera.x,y:prop.y-camera.y};
}

// Keep the trunk upright. Bury its lowest roots below the deepest part of
// the footprint, so a slope cannot leave the downhill root tips in midair.
export function rootedSceneryPlacement(prop,platforms,image){
 const w=prop.h*image.width/image.height;
 const pivot=prop.rootX??.5,leftRoot=prop.rootLeft??.05,rightRoot=prop.rootRight??.95;
 const rootX=prop.flip?1-pivot:pivot;
 const lo=prop.flip?1-rightRoot:leftRoot,hi=prop.flip?1-leftRoot:rightRoot;
 const left=prop.x-rootX*w,rootLeft=left+lo*w,rootRight=left+hi*w;
 const samples=[rootLeft,prop.x,rootRight];
 for(const q of platforms)if(q.x>rootLeft&&q.x<rootRight)samples.push(q.x);
 const baseline=Math.max(...samples.map(x=>groundY(platforms,x)))+(prop.embed??28);
 return {x:left,y:baseline-prop.h,w,h:prop.h,baseline,rootLeft,rootRight};
}

// A continuous walking trail: open field, rolling forest, circus camp,
// then a flat boss clearing. Changes in elevation are real collision surfaces.
export function shapeMeadowRoute(level){
 // Enough room for a short camera pan during the balloon encounter.
 level.arena={...level.arena,right:level.arena.right+420};level.width+=420;level.exit=[level.exit[0]+420,level.exit[1]];
 const points=[[0,480],[960,480],[1320,435],[1880,435],[2260,480],
  [2780,480],[3220,425],[3860,425],[4320,460],[4820,460],
  [5240,390],[5740,390],[6260,465],[6840,465],[7260,405],
  [7800,405],[8300,450],[8760,450],[9200,395],[9660,395],
  [9880,445],[10320,445],[10800,480],[level.arena.left,480],[level.width,480]];
 level.platforms=points.slice(0,-1).map(([x,y],i)=>({x,y,w:points[i+1][0]-x,yEnd:points[i+1][1],h:24,kind:'earth'}));
 const floor=x=>groundY(level.platforms,x);
 level.cages=level.cages.map(([x])=>[x,floor(x)]);
 level.enemies=level.enemies.map(([x,,type])=>[x,floor(x)-(type===2?128:0),type]);
 level.hazards=level.hazards.map(([x,,w])=>[x,floor(x+w/2)-20,w]);
 level.pickups=level.pickups.map(q=>({...q,y:floor(q.x)-28}));
 level.stars=level.stars.map(([x,y])=>[x,floor(x)-(480-y)]);
 level.checkpoint=[level.checkpoint[0],floor(level.checkpoint[0])];
 level.checkpoints=level.checkpoints.map(([x])=>[x,floor(x)]);
 // A first flavor after the opening encounter, a refill mid-route and a final
 // supply before the boss. Keep the path out of the shop and checkpoint doors.
 level.supplies=[{x:1440,kind:0},{x:5920,kind:1},{x:level.arena.left-540,kind:0}].map(q=>({...q,y:floor(q.x)-28}));
 level.scenery=level.scenery.map(q=>({...q,y:floor(q.x)+20,depth:1}));
 // Leave the opening sky clear; close trees only enter at the forest edge.
 level.scenery=level.scenery.filter(q=>q.kind!=='tent'&&(q.kind!=='trees'||q.x>=level.arena.left-1300));
 // This chapter reaches the forest edge. Dense forest belongs to 1-2.
 level.outposts=[{x:2800,drink:0},{x:6450,drink:1},{x:9800,drink:3}].map(q=>({...q,y:floor(q.x)}));
 level.scenery.sort((a,b)=>a.x-b.x);
 level.forestEdge={start:level.arena.left-2200,speed:.55};
}
