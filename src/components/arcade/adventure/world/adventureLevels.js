import {WORLDS} from './adventureWorlds';
import {extendAdventureRoutes} from './adventureRoutes';
import {shapeMeadowRoute} from './adventureTerrain';
import {shapeRiverRoute} from './adventureRiverRoute';
import {shapeHarborRoute} from './adventureHarborRoute';
import {shapeGrandRing} from './adventureGrandRing';
const p=(x,y,w,kind='stone',extra={})=>({x,y,w,h:24,kind,...extra});
export const LEVELS=[
 {id:0,name:['El puente de las luces','The bridge of lights'],subtitle:['Rescata al coro antes de que zarpe la feria.','Rescue the chorus before the fair sets sail.'],power:'Dragon Grape',tip:['Tu magia atraviesa enemigos. Mantén pulsado atacar.','Your magic pierces enemies. Hold attack.'],color:'#eeaa66',sky:['#7963a0','#f7b6ab'],background:'/arcade/maps/waterfront/background.webp',width:3100,bossName:['Don Cascabel','Mr. Jingle'],bossType:0,
 platforms:[p(0,480,650),p(740,480,490),p(1350,480,630),p(2090,480,1010),p(350,380,160),p(590,300,150),p(920,355,170),p(1460,375,150),p(1690,280,160),p(1960,365,150,'moving',{axis:'x',range:55,speed:1}),p(2260,350,160)],
 cages:[[490,380],[1030,355],[1770,280]],enemies:[[830,480,0],[1510,480,0],[1880,480,1]],hazards:[[1150,458,65]],checkpoint:[1500,480],boss:[2680,480],exit:[2990,480]},
 {id:1,name:['Tejados a contratiempo','Rooftops offbeat'],subtitle:['Un búmeran, dos caminos y muchas alturas.','One boomerang, two paths, plenty of heights.'],power:'Banna Drama',tip:['El búmeran regresa y recoge estrellas a distancia.','The boomerang returns and gathers distant stars.'],color:'#f5dc76',sky:['#514375','#cd8db8'],background:'/image/journey/distance-city-v2.webp',width:3300,bossName:['La Pirueta','The Tumbler'],bossType:1,
 platforms:[p(0,520,420),p(440,440,250),p(730,365,230),p(980,285,260),p(1250,390,220,'moving',{axis:'y',range:45,speed:1}),p(1530,480,350),p(1920,390,210),p(2150,300,200),p(2420,410,170),p(2620,500,680),p(1640,290,170),p(1870,205,160)],
 cages:[[570,440],[1730,290],[2260,300]],enemies:[[820,365,1],[1120,285,0],[2020,390,1]],hazards:[[1800,458,55]],checkpoint:[1640,480],boss:[2890,500],exit:[3200,500]},
 {id:2,name:['El invernadero travieso','The mischievous greenhouse'],subtitle:['Las raíces esconden un camino por las copas.','The roots hide a path through the treetops.'],power:'Witchy Kiwii',tip:['Salta otra vez en el aire para llegar más alto.','Jump again in midair to reach higher places.'],color:'#92d99e',sky:['#31505a','#a1c49e'],background:'/image/journey/atrium-garden.webp',width:3200,bossName:['Maestro Espinas','Master Thorns'],bossType:2,
 platforms:[p(0,510,620,'moss'),p(620,430,210,'moss'),p(870,310,220,'moss'),p(1130,180,220,'moss'),p(1420,340,260,'moving',{axis:'y',range:60,speed:.8}),p(1510,530,450,'moss'),p(1920,375,240,'moss'),p(2200,235,220,'moss'),p(2430,370,160,'moss'),p(2620,500,580,'moss'),p(1060,510,250,'moss')],
 cages:[[745,430],[1260,180],[2310,235]],enemies:[[920,310,0],[1640,530,1],[2040,375,1]],hazards:[[1210,488,60],[1800,508,70]],checkpoint:[1600,530],boss:[2850,500],exit:[3120,500]},
 {id:3,name:['La feria de los espejos','The mirror fair'],subtitle:['Atrapa a los arlequines y rompe sus trucos.','Trap the harlequins and break their tricks.'],power:'Bubble Tape',tip:['Encierra enemigos en burbujas; tócalas para romperlas.','Trap enemies in bubbles; touch them to pop them.'],color:'#f29ecc',sky:['#533266','#c487b4'],background:'/image/hexy/world-v36/backstage.webp',width:3450,bossName:['Madame Doble','Madame Double'],bossType:3,
 platforms:[p(0,500,630),p(710,420,250),p(1010,335,210),p(1290,400,180,'moving',{axis:'x',range:75,speed:1}),p(1540,480,410),p(1900,360,200),p(2160,285,210),p(2400,380,240),p(2720,490,730),p(1570,265,170)],
 cages:[[850,420],[1660,265],[2500,380]],enemies:[[800,420,1],[1100,335,1],[1650,480,0],[2250,285,1]],hazards:[[1840,458,65],[2530,358,60]],checkpoint:[1600,480],boss:[3060,490],exit:[3360,490]},
 {id:4,name:['La última función','The last performance'],subtitle:['La bruja robó el coro. Devuélvele la voz a la noche.','The witch stole the chorus. Give the night its voice back.'],power:'Sparkle Soda',tip:['Impulso: X / Mayús. Cruza el peligro y lanza tres estrellas.','Dash: X / Shift. Cross danger and cast three stars.'],color:'#97dff3',sky:['#242448','#735a93'],background:'/image/hexy/world-v46/hall.webp',width:3700,bossName:['La Bruja del Silencio','The Witch of Silence'],bossType:4,
 platforms:[p(0,510,600),p(690,425,230),p(990,340,220),p(1290,425,230,'moving',{axis:'x',range:40,speed:1}),p(1550,510,500),p(1780,335,230),p(2050,245,250),p(2350,350,250),p(2680,455,1020),p(2230,510,180)],
 cages:[[815,425],[1920,335],[2470,350]],enemies:[[780,425,1],[1090,340,0],[1710,510,1],[2170,245,1],[2540,350,1]],hazards:[[1830,488,75],[2830,433,65]],checkpoint:[1640,510],boss:[3290,455],exit:[3590,455]},
];
// Intermediate ledges keep the upper rescue routes reachable with one jump.
LEVELS[0].platforms.push(p(805,415,100));
LEVELS[1].platforms.push(p(1510,380,160),p(1780,365,150));
LEVELS[3].platforms.push(p(1480,350,125),p(1810,420,125));
LEVELS[4].platforms.push(p(1660,420,140));

// V55: one travelling circus, from the meadow to its last big top.
export const DRINKS=[
 {id:0,name:'Dragon Grape',color:'#f39a58',image:'/arcade/sprites/pickups/dragon-grape.webp',tip:['Llama que atraviesa enemigos.','Flame that pierces enemies.']},
 {id:1,name:'Banna Drama',color:'#ffe280',image:'/arcade/sprites/pickups/banna-drama.webp',tip:['Búmeran: golpea y vuelve a ti.','Boomerang: it strikes and returns.']},
 {id:2,name:'Witchy Kiwii',color:'#a2ecad',image:'/arcade/sprites/pickups/witchy-kiwii.webp',tip:['Hojas mágicas; el remolino frena enemigos.','Magic leaves; the cyclone slows enemies.']},
 {id:3,name:'Bubble Tape',color:'#fca7de',image:'/arcade/sprites/pickups/bubble-tape.webp',tip:['Captura disparos y frena enemigos; las burbujas estallan en cadena.','Captures shots and roots enemies; bubbles burst in chains.']},
 {id:4,name:'Sparkle Soda',color:'#a4edff',image:'/arcade/sprites/pickups/sparkle-soda.webp',tip:['Tres estrellas y esquiva más rápida.','Three stars and a faster dodge.']},
];
const chapters=[
 ['El campo de los globos','The balloon meadow','La comparsa voladora','The flying troupe'],
 ['El bosque del compás','The marching woods','Arlequín Serio','The Serious Harlequin'],
 ['La ribera de los redobles','The drumroll waterfront','La Barcaza del Redoble','The Drumroll Dreadnought'],
 ['La pista de los tres conos','The three-cone ring','Arlequín Agresivo','The Fierce Harlequin'],
 ['El Circo del Silencio','The Circus of Silence','Madame Muta','Madame Muta'],
];
const arenas=[[2090,3100,480],[2620,3720,500],[2620,3720,500],[2720,3820,490],[2680,3780,455]];
LEVELS.forEach((level,i)=>{
 level.name=chapters[i].slice(0,2);level.bossName=chapters[i].slice(2);
 level.world=WORLDS[i];level.background=level.world.background;level.biome=i<3?'forest':'circus';
 const [left,right,y]=arenas[i];level.width=right;level.arena={left,right,y,entry:left+110};
 const floor=level.platforms.find(p=>p.x===left&&p.w>300);floor.w=right-left;
 level.boss=[right-290,y];level.exit=[right-90,y];level.power=DRINKS[i].name;level.tip=DRINKS[i].tip;
 level.pickups=[{x:210,y:level.platforms[0].y-28,kind:i},{x:level.checkpoint[0]+40,y:level.checkpoint[1]-28,kind:(i+1)%5},{x:left+65,y:y-28,kind:i}];
 // Flying clowns, jugglers, acrobats and cannons have distinct behaviours.
 level.enemies.push([620,level.platforms[0].y-120,2],[level.checkpoint[0]+120,level.checkpoint[1],3]);
 if(i>0)level.enemies.push([level.cages[2][0]-30,level.cages[2][1],4]);
 if(i===1||i===3)level.enemies.push([left-140,level.platforms.find(p=>p.x<left-140&&p.x+p.w>left-140)?.y||y,5]);
 level.subtitle=[
  ['Los bunnies se niegan a tocar la marcha del circo. Ayúdalos a escapar.','The bunnies refuse to play the circus march. Help them escape.'],
  ['Sigue las carpas entre los árboles. El director ya prepara sus cañones.','Follow the tents through the trees. The conductor is preparing his cannons.'],
  ['Una función de malabares esconde las voces de tus amigos.','A juggling show is hiding your friends’ voices.'],
  ['La pista tiembla: esquiva, agáchate y busca el momento de responder.','The ring shakes: dodge, duck and find your moment to answer.'],
  ['Madame Muta quiere todas las bebidas y un coro que solo la obedezca.','Madame Muta wants every drink and a chorus that only obeys her.'],
 ][i];
});

// The opening chapter is a journey along the ground: meadow, woods, fair,
// then a separate boss clearing. Upper routes remain in the later chapters.
Object.assign(LEVELS[0],{
 groundRoute:true,width:4400,arena:{left:3300,right:4400,y:480,entry:3420},
 platforms:[p(0,480,3300,'earth'),p(3300,480,1100,'earth')],
 cages:[[700,480],[1840,480],[3020,480]],
 // Leave the travelling shop and its doorway outside the first patrol.
 enemies:[[820,480,0],[1070,352,2],[1420,480,3],[2150,480,4],[2600,480,5],[3180,480,0]],
 hazards:[[1210,460,48],[2310,460,58]],checkpoint:[2000,480],boss:[4110,480],exit:[4310,480],
 pickups:[{x:210,y:452,kind:0},{x:2040,y:452,kind:0},{x:3365,y:452,kind:0}],
 stars:[[330,438],[380,438],[850,438],[905,418],[960,438],[1160,402],[1215,378],[1270,402],[1590,438],[1640,438],[2225,422],[2300,375],[2375,422],[2820,438],[2870,438]],
 scenery:[
  {kind:'log',x:490,y:475,h:64,depth:.88},
  {kind:'trees',x:1060,y:450,h:330,depth:.7},
  {kind:'trees',x:1590,y:456,h:400,depth:.78},
  {kind:'log',x:1820,y:475,h:72,depth:.9},
  {kind:'trees',x:2150,y:455,h:415,depth:.8},
  {kind:'tent',x:2470,y:456,h:210,depth:.84},
  {kind:'wagon',x:2880,y:466,h:155,depth:.9},
  {kind:'trees',x:3200,y:450,h:385,depth:.84},
  {kind:'tent',x:3690,y:460,h:315,depth:1},
  {kind:'wagon',x:4230,y:462,h:170,depth:1},
 ],
 subtitle:['El campo lleva al bosque y sus carpas. Rescata al coro antes de llegar al claro de los globos.','The meadow leads into the woods and their tents. Rescue the chorus before the balloon clearing.'],
});
extendAdventureRoutes(LEVELS);
shapeMeadowRoute(LEVELS[0]);
Object.assign(LEVELS[1],{name:['El río del organillo','The barrel-organ river'],bossName:['Fortaleza Organillo','The Barrel-Organ Fortress'],sky:['#b9d5c2','#edbc92'],subtitle:['Miso te espera entre los árboles. Sigue el río hasta la fortaleza de los payasos.','Miso awaits among the trees. Follow the river to the clowns’ fortress.']});
shapeRiverRoute(LEVELS[1]);
shapeHarborRoute(LEVELS[2]);
shapeGrandRing(LEVELS[3]);
