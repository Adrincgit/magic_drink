import {buildCastleCircus,buildNightmareAscent} from './castleCircusRoute';
import {buildCornfield} from './cornfieldRoute';
const root='/arcade/act-two/';
const world=(key,background,ground,explore,boss,soil)=>({key,background:root+background+'-v1.webp',ground:root+'prop-'+ground+'-v1.webp',midground:null,farSpeed:.09,midSpeed:.94,terrain:'enchanted',surface:soil[0],edge:soil[1],soil,accent:'#baafff',ambient:'none',music:{explore:{key:'act-two-'+key,title:explore[0],src:explore[1]},boss:{key:'act-two-'+key+'-boss',title:boss[0],src:boss[1]}}});
export const ACT_TWO_WORLDS=[
 world('last-corn','corn',8,['El último atardecer','/arcade/music/exploration/ember-trail.mp3'],['La corona de paja','/arcade/music/bosses/agresivo.ogg'],['#67503e','#29212a']),
 world('mask-mansion','mansion',9,['Tras las máscaras','/arcade/music/exploration/silence.ogg'],['El Conde de Medianoche','/arcade/music/bosses/muta.ogg'],['#625675','#282334']),
 world('bad-dreams','ring',10,['La carpa de los malos sueños','/arcade/music/exploration/ring.ogg'],['La arlequín de dos conos','/arcade/music/bosses/alegre.ogg'],['#68506b','#292137']),
];
// Chapter cards and the picker show the same finished scenery as the route.
for(const [i,name]of ['corn-sunset','interior','ring'].entries())ACT_TWO_WORLDS[i].background=root+'episode-two-v1/'+name+'.webp';
const floor=(x,y,w)=>({x,y,w,h:28,kind:'earth'});
const ledge=(x,y,w,art=5,extra={})=>({x,y,w,h:25,kind:'act-two',art,...extra});
const common=(id,chapter,name,subtitle,bossName,world,width,arena)=>({id,chapter,name,subtitle,bossName,world,background:world.background,width,arena,actTwo:true,spookyIdle:true,biome:'halloween',color:'#b7b8ef',sky:['#29243f','#796283'],groundRoute:false,spawn:[90,480],boss:[arena.right-260,arena.y],exit:[arena.right-65,arena.y],hazards:[],outposts:[],scenery:[],pickups:[],supplies:[],cages:[],stars:[],enemies:[],sections:[],checkpoint:[90,480],checkpoints:[],bossHealth:180,power:'Popcorn Panic',tip:['Salta sobre los restos o destrúyelos para abrir el camino.','Jump over wreckage or destroy it to open a path.']});
export function makeCornfield(world=ACT_TWO_WORLDS[0]){
 const s=common(8,'2-3',['El maizal del último atardecer','The last-sunset cornfield'],['Los espantapájaros despiertan entre las hileras. Busca un camino por los graneros.','Scarecrows awaken between the rows. Find a way across the barns.'],['El Rey de Paja','The Straw King'],world,9800,{left:8240,right:9800,entry:8420,y:480});
 s.cornfield=true;s.groundRoute=true;s.cameraFloor=440;
 return buildCornfield(s);
}
export function makeMaskMansion(world=ACT_TWO_WORLDS[1]){
 const s=common(9,'2-4',['El castillo del gran tel?n','The castle of the great curtain'],[],[],world,15200,{left:13200,right:15200,entry:13400,y:180});
 s.maskMansion=true;return buildCastleCircus(s);
}
export function makeBadDreams(world=ACT_TWO_WORLDS[2]){
 const s=common(10,'2-5',['La carpa de los malos sueños','The tent of bad dreams'],['Dos conos. Tres pesadillas. Mantén los ojos en el suelo y rompe sus ilusiones.','Two cones. Three nightmares. Watch the floor and break her illusions.'],['La Arlequín de los Malos Sueños','The Harlequin of Bad Dreams'],world,2480,{left:520,right:2480,entry:690,y:480});
 s.badDreams=true;s.bossOnly=true;s.bossHealth=360;s.groundRoute=true;s.cameraFloor=440;s.spawn=[180,480];s.boss=[1410,480];s.platforms=[floor(0,480,2480)];s.route=s.platforms;s.checkpoint=[570,480];s.checkpoints=[[570,480]];
 s.supplies=[{x:380,y:452,kind:9,fixed:true,loot:{type:'drink',kind:9}},{x:570,y:452,kind:13,fixed:true,loot:{type:'drink',kind:13}}];
 s.tip=['Las marcas en el suelo avisan del siguiente sueño. Dispara a los espejos para deshacer sus ataques.','Floor markings warn of the next dream. Shoot the mirrors to unravel their attacks.'];s.sections=[{x:0,name:s.name}];return buildNightmareAscent(s);
}
