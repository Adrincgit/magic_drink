import {groundY} from './adventureTerrain';
export const NIGHTMARE_WORLD={key:'halloween',background:'/arcade/maps/halloween/background.webp',ground:'/arcade/maps/halloween/ground.webp',midground:null,groundInset:.235,groundFillInset:.30,farSpeed:.12,midSpeed:.55,terrain:'riverbank',surface:'#95828a',edge:'#48394f',soil:['#554353','#292633'],accent:'#c6a9ef',ambient:'none',music:{explore:{key:'witchy-witchy-town',title:'Witchy-Witchy Town',src:'/arcade/music/exploration/witchy-witchy-town.mp3'},boss:{key:'witchy-witchy-town',title:'Witchy-Witchy Town',src:'/arcade/music/exploration/witchy-witchy-town.mp3'}}};
export function makeNightmareTrail(world=NIGHTMARE_WORLD){
 const width=21440;
 // Short clearings, a climb, a continuous descent, a hollow and a second ridge.
 // The lower route stays traversable; upper boughs offer a faster safe passage.
 const points=[[0,480],[700,480],[1600,425],[2450,445],[3300,315],[3860,315],[4200,460],[4800,460],[5450,410],[6050,410],[7000,525],[7900,525],[8500,465],[9300,330],[9850,330],[10600,505],[11300,505],[12100,400],[12800,400],[13600,500],[14300,500],[15100,350],[16000,350],[16800,495],[17500,495],[18300,405],[19000,480],[21440,480]];
 const route=points.slice(0,-1).map(([x,y],i)=>({x,y,yEnd:points[i+1][1],w:points[i+1][0]-x,h:24,kind:'earth'}));
 // The cemetery approach is continuous in both directions. The former
 // one-way cliff let a returning player pass inside its solid earth.
 const floor=x=>groundY(route,x),platforms=[...route],branchTrees=[];
 for(const start of [2020,6900,11480,16640]){
  for(let i=0;i<2;i++){
   const x=start+i*570,tree=branchTrees.length,y=Math.max(floor(x-90),floor(x),floor(x+90))+10,h=520+i*40;branchTrees.push({x,y,h});
   for(let j=0;j<2;j++){
    const side=j===0?-1:1,paintW=285,paintH=paintW/3.03;
    // One accessible bough starts each pair, then three higher landings.
    // Keep each rise within a normal jump; the canopy is a genuine upper path.
    const collarX=x+side*25,collarY=y-(i===0?[94,188]:[188,280])[j];
    const paint={x:side<0?collarX-paintW+22:collarX-22,y:collarY-paintH*.4,w:paintW,h:paintH};
    // Trace the upper bark, excluding the decorative twigs.
    const outline=[[.12,.325],[.2,.42],[.3,.525],[.4,.555],[.5,.485],[.6,.36],[.7,.305],[.8,.30],[.87,.245]];
    const surface=outline.map(([u,v])=>[side<0?1-u:u,paint.y+v*paintH]).sort((a,b)=>a[0]-b[0]);
    const lo=surface[0][0],hi=surface.at(-1)[0],top=surface[0][1];
    platforms.push({x:paint.x+lo*paintW,y:top,yEnd:surface.at(-1)[1],w:(hi-lo)*paintW,h:15,profile:surface.map(([u,v])=>[(u-lo)/(hi-lo),v-top]),paint,kind:'nightmare-branch',tree,side,breakAfter:3.5});
   }
  }
 }
 // The broad, continuous floor leads directly to the low boughs. Isolated
 // rock pedestals interrupted the path and are no longer needed as steps.
 const small=[5000,5400,5790,6600,7040,7500,8360,8790,9500,10160,10550,11240,12140,12600,13200,14020,14640,15550,16160,16900,17440,18200,18700];
 const graves=[...small.map((x,i)=>({x,y:floor(x),kind:'headstone',type:i%5===3?21:18,hp:18,delay:3.6+i%3*.35})),...[9720,15400].map(x=>({x,y:floor(x),kind:'crypt',type:18,hp:80,delay:4.2,interval:6,capacity:8}))].sort((a,b)=>a.x-b.x);
 const fugitives=[950,2250,3650,5620,9100,12950,15800].flatMap((start,group)=>Array.from({length:group<3?4:3},(_,i)=>({x:start+i*92,dir:-1,speed:330+(i*17+group*11)%61,group,lookOffset:i*.72+group*.31,tripAfter:group>=3&&i===2?130:0})));
 const apparitions=[5580,7270,9200,10900,12720,14480,16400,18400].flatMap((x,i)=>[[x,floor(x),22],...(i%2===0?[[x+300,floor(x+300),19]]:[])]);
 for(const x of [5520,6150,8150,10400,11700,13040,14500,15900,17300,18800])apparitions.push([x,floor(x),18]);
 const props=Array.from({length:43},(_,i)=>{const x=170+i*484;return{frame:x<4400?(i%3?1:0):[0,2,3,10,1][i%5],x,y:floor(x),size:i%5===0?245:i%5===2?95:145,flip:i%2===1};});
 const stars=Array.from({length:54},(_,i)=>{const x=650+i*374;return[x,floor(x)-46];});
 for(const q of platforms.filter(q=>q.kind==='nightmare-branch'&&q.side>0))stars.push([q.x+q.w*.35,q.y-35],[q.x+q.w*.7,q.y-42]);
 return{id:6,chapter:'5-1',name:['El sendero de las risas','The laughing graveyard'],subtitle:['Los payasos huyen del bosque. Al otro lado de la verja, las tumbas despiertan.','The clowns flee the woods. Beyond the iron gate, the graves awaken.'],bossName:['El Campanero Hueco','The Hollow Bellkeeper'],power:'Bubble Tape',tip:['Rescata a los payasos caídos. Rompe las lápidas y cruza las ramas antes de que cedan.','Rescue fallen clowns. Break the headstones and cross the branches before they snap.'],background:world.background,world,color:'#c49bf0',sky:['#342a50','#705478'],biome:'halloween',nightmareTrail:true,spookyIdle:true,bossType:6,bossHealth:184,groundRoute:true,themeStart:true,cameraFloor:440,width,spawn:[90,480],route,platforms,branchTrees,
  cages:[[6980,floor(6980)],[14240,floor(14240)]],enemies:[...fugitives.map(q=>[q.x,floor(q.x),0,q.dir]),...apparitions],fugitives,graves,nightmareProps:props,cemeteryStart:4400,nightmareGate:{x:20960,y:480,size:300},guardianX:20255,hazards:[],outposts:[],scenery:[],checkpoint:[4480,floor(4480)],checkpoints:[4480,8960,13440,17920,19520].map(x=>[x,floor(x)]),boss:[20255,480],exit:[21150,480],arena:{left:19680,right:20992,entry:19840,y:480},shop:{x:420,y:480},pickups:[{x:6480,y:floor(6480)-28,kind:3},{x:9760,y:floor(9760)-28,kind:8},{x:13760,y:floor(13760)-28,kind:9},{x:19360,y:452,kind:3}],supplies:[...[6480,13760,19360].map(x=>({x,y:floor(x)-28,kind:3,fixed:true})),...[8640,14680].map((x,i)=>({x,y:floor(x)-28,kind:i?8:3,fixed:true,loot:{type:'drink',kind:i?8:3,boosted:true}}))],treasurePositions:[2590,6850,11020,14720,18480],stars,
  sections:[{x:0,name:['La huida entre cenizas','Fleeing through ashes']},{x:1650,name:['Por las ramas','Through the boughs']},{x:3300,name:['La colina del susurro','Whisper Hill']},{x:4400,name:['Tras la verja','Beyond the iron gate']},{x:6500,name:['Sobre las tumbas','Above the graves']},{x:9300,name:['El viejo mirador','The old overlook']},{x:13440,name:['El sendero hundido','The sunken path']},{x:19680,name:['El Campanero Hueco','The Hollow Bellkeeper']}]};
}
