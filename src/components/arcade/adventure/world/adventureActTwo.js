import {buildCornfield} from './cornfieldRoute';
const root='/arcade/act-two/';
const world=(key,background,ground,explore,boss,soil)=>({key,background:root+background+'-v1.webp',ground:root+'prop-'+ground+'-v1.webp',midground:null,farSpeed:.09,midSpeed:.94,terrain:'enchanted',surface:soil[0],edge:soil[1],soil,accent:'#baafff',ambient:'none',music:{explore:{key:'act-two-'+key,title:explore[0],src:explore[1]},boss:{key:'act-two-'+key+'-boss',title:boss[0],src:boss[1]}}});
export const ACT_TWO_WORLDS=[
 world('last-corn','corn',8,['El último atardecer','/arcade/music/exploration/ember-trail.mp3'],['La corona de paja','/arcade/music/bosses/agresivo.ogg'],['#67503e','#29212a']),
 world('mask-mansion','mansion',9,['Tras las máscaras','/arcade/music/exploration/silence.ogg'],['El Conde de Medianoche','/arcade/music/bosses/muta.ogg'],['#625675','#282334']),
 world('bad-dreams','ring',10,['La carpa de los malos sueños','/arcade/music/exploration/ring.ogg'],['La arlequín de dos conos','/arcade/music/bosses/serio.mp3'],['#68506b','#292137']),
];
const floor=(x,y,w)=>({x,y,w,h:28,kind:'earth'});
const ledge=(x,y,w,art=5,extra={})=>({x,y,w,h:25,kind:'act-two',art,...extra});
const common=(id,chapter,name,subtitle,bossName,world,width,arena)=>({id,chapter,name,subtitle,bossName,world,background:world.background,width,arena,actTwo:true,spookyIdle:true,biome:'halloween',color:'#b7b8ef',sky:['#29243f','#796283'],groundRoute:false,spawn:[90,480],boss:[arena.right-260,arena.y],exit:[arena.right-65,arena.y],hazards:[],outposts:[],scenery:[],pickups:[],supplies:[],cages:[],stars:[],enemies:[],sections:[],checkpoint:[90,480],checkpoints:[],bossHealth:180,power:'Popcorn Panic',tip:['Salta sobre los restos o destrúyelos para abrir el camino.','Jump over wreckage or destroy it to open a path.']});
export function makeCornfield(world=ACT_TWO_WORLDS[0]){
 const s=common(8,'2-3',['El maizal del último atardecer','The last-sunset cornfield'],['Los espantapájaros despiertan entre las hileras. Busca un camino por los graneros.','Scarecrows awaken between the rows. Find a way across the barns.'],['El Rey de Paja','The Straw King'],world,9800,{left:8240,right:9800,entry:8420,y:480});
 s.cornfield=true;s.groundRoute=true;s.cameraFloor=440;
 return buildCornfield(s);
}
export function makeMaskMansion(world=ACT_TWO_WORLDS[1]){
 const s=common(9,'2-4',['La mansión de las máscaras','The mansion of masks'],['Cruza el jardín, sube por los salones y alcanza al Conde en los balcones.','Cross the garden, climb the halls and reach the Count on the balconies.'],['El Conde de Medianoche','The Midnight Count'],world,8800,{left:7240,right:8800,entry:7410,y:180});
 s.maskMansion=true;s.bossHealth=205;s.boss=[s.arena.entry+660,180];s.tip=['Las armaduras anuncian sus tajos. Usa los balcones para esquivarlos.','Armor telegraphs its slashes. Use the balconies to evade.'];
 s.platforms=[floor(0,480,1800),floor(1800,560,1400),floor(3200,590,1550),floor(4750,520,1500),floor(6250,480,990),floor(7240,180,1560),
  ledge(720,385,170,6,{h:95}),ledge(1060,300,240),ledge(1450,380,220),ledge(1880,420,210),ledge(2200,310,230),ledge(2550,200,250),ledge(2870,110,230),
  ledge(3190,210,220),ledge(3500,325,240),ledge(3840,420,230),ledge(4140,315,230),ledge(4470,200,250),ledge(4820,90,250),ledge(5150,195,220),ledge(5450,300,240),
  ledge(5800,400,230),ledge(6150,360,210),ledge(6470,265,240),ledge(6810,180,300),ledge(7100,180,180)];
 s.enemies=[[920,480,30],[1530,380,31],[1900,560,30],[2310,310,31],[2660,200,30],[3070,160,32],[3450,590,31],[3650,325,30],[4350,315,31],[4920,90,30],[5300,210,32],[5640,520,30],[6080,520,31],[6570,265,31],[6990,180,30]];
 s.ambushes=[{x:1700,enemies:[[2100,300,32],[2290,220,32]]},{x:4500,enemies:[[4860,260,32],[5120,320,32]]}];
 s.cages=[[1200,300],[2920,110],[4900,90]];s.checkpoints=[[1790,480],[3830,590],[6250,480],[7130,180]];s.checkpoint=s.checkpoints[0];s.shop={x:350,y:480};
 s.platforms.push(ledge(2050,470,110,7,{h:90,solid:true,hp:24}),ledge(3650,480,150,7,{h:110,solid:true,hp:30}),ledge(5660,410,150,7,{h:110,solid:true,hp:30}));
 s.supplies=[{x:580,y:452,kind:9,fixed:true,loot:{type:'drink',kind:9}},{x:3010,y:82,kind:4,fixed:true},{x:4960,y:62,kind:9,fixed:true},{x:7160,y:152,kind:13,fixed:true,loot:{type:'drink',kind:13}}];
 s.stars=s.platforms.filter(q=>q.kind!=='earth').flatMap(q=>[[q.x+45,q.y-42],[q.x+q.w-45,q.y-42]]);
 s.sections=[{x:0,name:['El jardín sin invitados','The uninvited garden']},{x:1800,name:['Galería de los rostros','Gallery of faces']},{x:4300,name:['Sobre los salones','Above the halls']},{x:6250,name:['Los balcones de medianoche','Midnight balconies']},{x:7240,name:s.bossName}];return s;
}
export function makeBadDreams(world=ACT_TWO_WORLDS[2]){
 const s=common(10,'2-5',['La carpa de los malos sueños','The tent of bad dreams'],['Dos conos. Tres pesadillas. Mantén los ojos en el suelo y rompe sus ilusiones.','Two cones. Three nightmares. Watch the floor and break her illusions.'],['La Arlequín de los Malos Sueños','The Harlequin of Bad Dreams'],world,2480,{left:520,right:2480,entry:690,y:480});
 s.badDreams=true;s.bossOnly=true;s.bossHealth=360;s.groundRoute=true;s.cameraFloor=440;s.spawn=[180,480];s.boss=[1410,480];s.platforms=[floor(0,480,2480)];s.route=s.platforms;s.checkpoint=[570,480];s.checkpoints=[[570,480]];
 s.supplies=[{x:380,y:452,kind:9,fixed:true,loot:{type:'drink',kind:9}},{x:570,y:452,kind:13,fixed:true,loot:{type:'drink',kind:13}}];
 s.tip=['Las marcas en el suelo avisan del siguiente sueño. Dispara a los espejos para deshacer sus ataques.','Floor markings warn of the next dream. Shoot the mirrors to unravel their attacks.'];s.sections=[{x:0,name:s.name}];return s;
}
