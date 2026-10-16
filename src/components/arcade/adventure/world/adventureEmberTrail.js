import {groundY,surfaceY} from './adventureTerrain';
export const emberBurnAt=x=>{const t=Math.max(0,Math.min(1,(x-5000)/23000));return t*t*(3-2*t);};
// Measured landing surfaces in branch-tree.webp. Artwork and colliders share
// these root/branch coordinates, including each branch's slight natural slope.
export const EMBER_BRANCH_ART={rootX:.53,rootY:.977,surfaces:[[.16,.43,.639,.649],[.60,.85,.453,.454],[.17,.42,.240,.247]]};
export function makeEmberTrail(world){
 const points=[[0,510],[3400,510],[4600,400],[7600,-170],[10600,-520],[14400,-520],[16100,-350],[18700,240],[21600,620],[33200,620]];
 const route=points.slice(0,-1).map(([x,y],i)=>({x,y,yEnd:points[i+1][1],w:points[i+1][0]-x,h:24,kind:'earth'}));
 const floor=x=>groundY(route,x);
 const emberPits=[[11600,220],[13700,220],[25100,220],[27500,240],[29200,220]].map(([x,w])=>({x,w,rim:floor(x),y:Math.max(floor(x),floor(x+w))+100}));
 const platforms=[];
 for(const q of route){let start=q.x;for(const pit of emberPits){if(pit.x+pit.w<=q.x||pit.x>=q.x+q.w)continue;if(pit.x>start)platforms.push({...q,x:start,y:surfaceY(q,start),w:pit.x-start,yEnd:surfaceY(q,pit.x)});start=Math.max(start,pit.x+pit.w);}if(start<q.x+q.w)platforms.push({...q,x:start,y:surfaceY(q,start),w:q.x+q.w-start});}
 platforms.push(...emberPits.map(p=>({x:p.x,y:p.y,w:p.w,h:24,kind:'ember-bed'})));
 for(const [x,w,rise]of [[2200,300,85],[2570,330,160],[8700,280,90],[9030,300,160],[13200,340,115],[17300,290,90],[21880,180,68],[26350,330,120],[30700,230,135]])platforms.push({x,y:floor(x)-rise,w,h:24,kind:'stone'});
 const branchTrees=[22210,22640,23070,23500,23930,24360].map(x=>({x,y:floor(x)+7,size:430}));
 for(const [tree,q]of branchTrees.entries())for(const [branch,[left,right,top,end]]of EMBER_BRANCH_ART.surfaces.entries())platforms.push({
  x:q.x+(left-EMBER_BRANCH_ART.rootX)*q.size,y:q.y+(top-EMBER_BRANCH_ART.rootY)*q.size,
  yEnd:q.y+(end-EMBER_BRANCH_ART.rootY)*q.size,w:(right-left)*q.size,h:14,kind:'branch',tree,branch});
 const encounters=[[900,0],[1420,11],[2050,10],[2980,0]];
 for(let x=3800,i=0;x<29500;x+=630,i++)if(!emberPits.some(p=>x>p.x-150&&x<p.x+p.w+150))encounters.push([x,[10,0,11,12,10,11][i%6]]);
 for(let x=22100,i=0;x<29600;x+=520,i++)if(!emberPits.some(p=>x>p.x-170&&x<p.x+p.w+170))encounters.push([x,i%4===0?12:i%3===0?10:11]);
 encounters.push([23500,13],[25800,13],[28300,13]);
 // A running jump has a clear approach and landing. Artillery belongs to
 // separate encounters, beyond its firing range from a hollow's far lip.
 const safeEncounters=encounters.filter(([x,t],i)=>!emberPits.some(p=>x>p.x-(t===12?900:450)&&x<p.x+p.w+(t===12?1000:600))&&!encounters.slice(0,i).some(([other,kind])=>kind===t&&Math.abs(other-x)<400));
 const enemies=safeEncounters.map(([x,t])=>[x,floor(x)-(t===13?160:0),t]);
 const stars=[];for(let x=650;x<32900;x+=480)if(!emberPits.some(p=>x+90>p.x-30&&x<p.x+p.w+30))for(let i=0;i<3;i++)stars.push([x+i*43,floor(x+i*43)-44-(i===1?16:0)]);
 for(const pit of emberPits)for(let i=0;i<5;i++)stars.push([pit.x-35+i*(pit.w+70)/4,pit.rim-60-Math.sin(i/4*Math.PI)*75]);
 for(const q of platforms.filter(q=>q.kind==='branch'&&q.branch<2))for(let i=0;i<3;i++)stars.push([q.x+q.w*(.2+i*.3),q.y-35]);
 // The two summit trees now belong to the fully burned forest. Keep their
 // roots on the world terrain; the scenic layer supplies its own depth.
 const fallingTrees=[[26700,1],[28900,-1],[16300,-1],[19500,1],[25550,1],[28150,-1]].map(([x,dir],i)=>({x,y:floor(x),h:430+i%3*45,dir,art:4+i%4,trigger:540,warning:2,burning:true,scenic:true}));
 const heatZones=[[6000,1400],[10100,1900],[15700,1700],[21600,7700]].map(([x,w])=>({x,w,y:floor(x),strength:.9}));
 const bushes=safeEncounters.filter(([,t])=>t===10).flatMap(([x],i)=>[-170,185].map((dx,j)=>({x:x+dx,y:floor(x+dx),seed:i*2+j}))).filter(q=>!emberPits.some(p=>q.x>p.x-260&&q.x<p.x+p.w+340));
 for(let x=21900,i=0;x<24700;x+=115,i++)bushes.push({x,y:floor(x),seed:100+i});
 return{id:5,chapter:'1-4',name:['El bosque de las brasas','The emberwood approach'],bossName:['El Bastión de las Antorchas','The Torch Bastion'],
  subtitle:['Su ejército incendia el bosque. El Arlequín absorbe las llamas para hacerse más fuerte.','His army burns the forest. The Harlequin absorbs the flames to grow stronger.'],
  tip:['Aqua Berry apaga el fuego. Rompe el muro y la compuerta para alcanzar el núcleo del bastión.','Aqua Berry puts out fire. Break the wall and its door to reach the fortress core.'],power:'Aqua Berry',color:'#ed915b',sky:['#513851','#dc9469'],
  world,background:world.background,biome:'forest',groundRoute:true,emberTrail:true,themeStart:true,cameraFloor:420,width:33200,platforms,enemies,stars,drinkPool:[5,1,2,3,4],
  cages:[[1600,floor(1600)],[9180,floor(9030)-160],[26500,floor(26350)-120]],hazards:[],checkpoint:[3200,floor(3200)],checkpoints:[3200,8200,12300,17000,22200,26000,29600].map(x=>[x,floor(x)]),
  arena:{left:30000,right:32900,y:620,entry:30240},boss:[32000,620],exit:[33000,620],
  supplies:[1380,5400,9200,13600,17800,23000,27300].map(x=>({x,y:floor(x)-28,kind:5})).concat([{x:720,y:floor(720)-28,kind:5,fixed:true,loot:{type:'drink',kind:5}},{x:29800,y:592,kind:3}]),pickups:[],
  outposts:[{x:3100,y:floor(3100),drink:5},{x:14000,y:floor(14000),drink:3},{x:28700,y:floor(28700),drink:5}],scenery:[],
  route,emberPits,fallingTrees,heatZones,bushes,branchTrees,greenEnd:5000,
  birdFlocks:[3300,5250,7650,9700,12800,15200,17400,20500,23600,26700].map((x,i)=>({x,y:125+(i%3)*36,count:5+i%3,depth:.2+i%2*.09})),
  sections:[{x:0,name:['Bajo el bosque frondoso','Beneath the canopy']},{x:3400,name:['La colina de las antorchas','Torch Hill']},{x:10600,name:['Sobre el humo','Above the smoke']},{x:14800,name:['El descenso de las cenizas','The ash descent']},{x:21600,name:['La emboscada entre las ramas','The thicket ambush']},{x:25000,name:['El bosque carbonizado','The blackened forest']},{x:30000,name:['El Bastión de las Antorchas','The Torch Bastion']}]};
}
