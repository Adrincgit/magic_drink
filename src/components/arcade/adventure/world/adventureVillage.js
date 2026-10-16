import {groundY} from './adventureTerrain';
import {addVillageDestruction} from './villageDestruction';
export const VILLAGE_WORLD={key:'village',background:'/arcade/maps/village/panorama-v1.webp',ground:'/arcade/maps/village/street-v1.webp',groundInset:.20,groundFillInset:.24,midground:null,farSpeed:.09,midSpeed:.32,terrain:'riverbank',surface:'#92838e',edge:'#514650',soil:['#665967','#302d3a'],accent:'#e8b98e',ambient:'none',music:{explore:{key:'witchy-witchy-town',title:'Witchy-Witchy Town',src:'/arcade/music/exploration/witchy-witchy-town.mp3'},boss:{key:'witchy-witchy-town',title:'Witchy-Witchy Town',src:'/arcade/music/exploration/witchy-witchy-town.mp3'}}};
export function makeVillage(world=VILLAGE_WORLD){
 const width=21440,town=x=>4200+x*1.5;
 // Continue the cemetery floor, cross the orchard, then enter three open squares.
 const points=[[0,480],[750,480],[1600,452],[2300,452],[3300,490],[4200,480],[5600,480],[6900,452],[8400,452],[9600,480],[11250,480],[12300,444],[13950,444],[15150,480],[width,480]];
 const route=points.slice(0,-1).map(([x,y],i)=>({x,y,yEnd:points[i+1][1],w:points[i+1][0]-x,h:24,kind:'earth'})),floor=x=>groundY(route,x),platforms=[...route];
 const encounters=[[970,18],[1310,25],[1930,26],[2540,18],[2750,18],[3190,25],[3760,26],[4290,18],[4530,25],[5110,18],[5510,26],[6120,25],[6510,18],[6920,18],[7230,26],[7740,25],[8120,18],[8550,25],[9340,18],[9500,26],[9740,25],[10020,26]];
 const enemies=[...encounters.map(([x,type])=>[town(x),type]),...[2370,4750,6380,7970,9670].map(x=>[town(x),19]),[1350,19],[2080,18],[2920,25],[3680,19],[4550,26],[5300,18],[10150,18],[11800,19],[15700,18],[17850,25],[18780,19]].map(([x,type])=>[x,floor(x),type,-1]);
 const groups=[420,1500,2850,4230,5550,6750,8320,9850,11450,13040,14850,16300,18050,19500];
 const styles=[[2,0,3,1,4],[5,3,6,2],[7,4,1,2],[0,6,5,3],[2,7,4,1],[6,3,0,5],[4,7,2,6],[1,5,3,0]];
 const villagers=groups.flatMap((x,group)=>styles[group%styles.length].map((style,i)=>({id:`village:${group}:${i}`,x:x+i*98,y:floor(x+i*98),style,group,safeX:-180,wakeX:group===0?0:x-880,speed:104+(group*7+i*13)%34})));
 const plazas=[{x:9000,kind:'fountain',width:1150},{x:14500,kind:'market',width:1300},{x:20000,kind:'refuge',width:1500}];
 // Connected frontages frame the open squares; the second street behind them
 // remains continuous, so a plaza reads as part of a town, not an empty field.
 const houses=Array.from({length:57},(_,i)=>({x:5475+i*280,frame:[0,1,4,5,2,7,1,6][i%8],size:[440,390,415,430,390,420,380,410][i%8]})).filter(q=>!plazas.some(p=>Math.abs(p.x-q.x)<p.width*.34)).concat([{x:8360,frame:3,size:475},{x:13670,frame:2,size:440},{x:19200,frame:3,size:490}]).sort((a,b)=>a.x-b.x).map(q=>({...q,y:floor(q.x)-100}));
 const plazaProps=[{x:8660,frame:4,size:245},{x:9070,frame:0,size:330},{x:9390,frame:5,size:340},{x:14050,frame:2,size:330},{x:14440,frame:3,size:235},{x:14740,frame:6,size:280},{x:15020,frame:7,size:170},{x:20100,frame:1,size:420},{x:20480,frame:4,size:230},{x:20700,frame:7,size:170}].map(q=>({...q,y:floor(q.x)-28}));
 const decorations=Array.from({length:48},(_,i)=>({x:5500+i*322,frame:[2,1,6,0,7,3][i%6],size:[235,110,105,345,108,170][i%6]})).filter(q=>q.x<width-150&&!plazas.some(p=>Math.abs(p.x-q.x)<p.width*.36)).map(q=>({...q,y:floor(q.x)-17}));
 // Keep the original 49 collectible identities when moving their positions.
 const oldPoints=[[0,480],[950,480],[1800,452],[2800,452],[3600,480],[4700,480],[5400,444],[6500,444],[7300,480],[11000,480]],oldRoute=oldPoints.slice(0,-1).map(([x,y],i)=>({x,y,yEnd:oldPoints[i+1][1],w:oldPoints[i+1][0]-x,kind:'earth'}));
 const oldStars=Array.from({length:49},(_,i)=>350+i*210),stars=oldStars.map(x=>[town(x),floor(town(x))-44]),starIds=oldStars.map(x=>`7:star:${x}:${groundY(oldRoute,x)-44}`);
 for(const x of [450,780,1120,1480,1850,2230,2590,2960,3350,3730,4100,4450]){stars.push([x,floor(x)-44]);starIds.push(`7:approach-star:${x}`);}
 const checkpoints=[4000,8000,12000,16000,19000].map(x=>[x,floor(x)]);
 const level={id:7,chapter:'2-2',name:['El pueblo de los dulces','The candy-struck village'],subtitle:['Familias huyen del pueblo mientras las brujas convierten en dulces a quienes alcanzan.','Families flee the village while witches turn anyone they strike into candy.'],tip:['Sigue el camino desde el cementerio. Interrumpe a las brujas y abre paso hasta el refugio.','Follow the road from the cemetery. Interrupt the witches and clear a path to the refuge.'],power:'Bubble Tape',bossName:['La plaza del refugio','Refuge Square'],background:world.background,world,sky:['#35324f','#a38893'],color:'#cfa0d5',biome:'halloween',villageTrail:true,spookyIdle:true,groundRoute:true,themeStart:true,cameraFloor:440,width,route,platforms,spawn:[90,480],enemies,villagers,houses,plazas,plazaProps,decorations,cemeteryExit:{x:-100,y:480,size:300},villageStart:5500,cages:[town(2920),town(6640)].map(x=>[x,floor(x)]),hazards:[],outposts:[],scenery:[],checkpoint:checkpoints[0],checkpoints,boss:[20000,480],exit:[21150,480],arena:{left:19200,right:21350,entry:20580,y:480},shop:{x:390,y:480},pickups:[],supplies:[1850,4200,7050,10800,14700,17325,19100].map((x,i)=>({x,y:floor(x)-28,kind:[0,3].includes(i)?13:i%2?8:3,fixed:true,loot:{type:'drink',kind:[0,3].includes(i)?13:i%2?8:3,boosted:[1,3,5].includes(i)}})),treasurePositions:[2350,7890,11475,13545,17500],stars,starIds,sections:[{x:0,name:['La salida del cementerio','The cemetery exit']},{x:1600,name:['Familias en el camino','Families on the road']},{x:5500,name:['Las puertas del pueblo','The village gates']},{x:8500,name:['La plaza de la fuente','Fountain Square']},{x:13900,name:['El mercado de Halloween','Halloween Market']},{x:19200,name:['La plaza del refugio','Refuge Square']}]};
 return extendVillageArrival(level);
}

// Preserve the established urban layout and collectible identities; insert a
// longer country approach before the town instead of compressing its streets.
function extendVillageArrival(level){
 const move=x=>x<=1500?x:x<5500?1500+(x-1500)*1.45:x+1800;
 for(const q of level.route){const end=move(q.x+q.w);q.x=move(q.x);q.w=end-q.x;}
 const floor=x=>groundY(level.route,x);
 for(const key of ['enemies','stars','cages','checkpoints'])for(const q of level[key])q[0]=move(q[0]);
 for(const key of ['houses','plazas','plazaProps','decorations','supplies','sections'])for(const q of level[key])q.x=move(q.x);
 for(const q of level.houses){q.x=Math.max(7275,q.x);q.y=floor(q.x)-68;}
 for(const q of level.plazaProps)q.y=floor(q.x)-28;
 for(const q of level.decorations)q.y=floor(q.x)-17;
 for(const q of level.supplies)q.y=floor(q.x)-28;
 for(const q of level.stars)q[1]=floor(q[0])-44;
 for(const q of level.enemies)q[1]=floor(q[0]);
 for(const q of level.villagers){q.x=move(q.x);q.y=floor(q.x);q.wakeX=move(q.wakeX);q.speed+=86;q.warning=q.x<move(5500)-450&&[0,2].includes(q.style)&&q.id.endsWith(':0')&&q.group%3===0;q.trip=q.id.endsWith(':1')&&q.group%3===1;}
 const groups=[...new Set(level.villagers.map(q=>q.group))];
 for(const group of groups){
  const first=level.villagers.find(q=>q.group===group),count=group<2?0:Math.min(5,1+Math.floor(group/2));
  for(let i=0;i<count;i++){const x=first.x+440+i*78;level.villagers.push({id:'village:extra:'+group+':'+i,x,y:floor(x),style:(group+i*3)%8,group,safeX:-180,wakeX:first.wakeX,speed:190+(group*11+i*9)%35});}
 }
 // A standing adult carries the warning clearly while the children keep
 // escaping. Use one baker per approach group, rather than the front child.
 for(const group of [...new Set(level.villagers.filter(q=>q.warning).map(q=>q.group))]){
  for(const q of level.villagers)if(q.group===group)q.warning=false;
  const adult=level.villagers.find(q=>q.group===group&&q.style===0&&q.x<move(5500)-450);if(adult)adult.warning=true;
 }
 level.carriages=[3650,6200,10000,15100].map((x,i)=>({id:i,x:move(x),y:floor(move(x))-28,wakeX:move(x)-850,speed:280+i*14}));
 level.width+=1800;level.villageStart=move(level.villageStart);
 level.entrance={x:level.villageStart-450,y:floor(level.villageStart-450)-65,size:360};
 for(const key of ['boss','exit'])level[key][0]=move(level[key][0]);
 for(const key of ['left','right','entry'])level.arena[key]=move(level.arena[key]);
 level.treasurePositions=level.treasurePositions.map(move);
 level.rubble=[8200,13200,18500].map((x,i)=>{const npc=level.villagers.find(q=>q.style===0&&!q.rubbleId&&q.x>x-1000);npc.x=x;npc.y=floor(x);npc.wakeX=x-700;npc.rubbleId='rubble:'+i;npc.warning=false;npc.trip=false;return{id:npc.rubbleId,x,y:floor(x),hp:4,villager:npc.id};});
 for(const group of [3,5,8,11]){const npc=level.villagers.find(q=>q.group===group&&[0,6].includes(q.style)&&!q.rubbleId);if(npc){npc.defender=true;npc.warning=false;npc.trip=false;}}
 level.bossName=['La Cosechera de Dulces','The Candy Harvester'];
 level.enemies.push([level.arena.right-420,floor(level.arena.right-420),28]);
 return addVillageDestruction(level);
}
