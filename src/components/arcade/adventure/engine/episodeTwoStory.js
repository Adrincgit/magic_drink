import {groundY} from '../world/adventureTerrain';
import {followAdventureCamera} from '../render/adventureCamera';
const cues={
 6:[[650,'¡Hasta los payasos están huyendo!','Even the clowns are running away!'],[3500,'Esa silueta... ¿es un castillo?','That silhouette... is it a castle?']],
 7:[[700,'¡Salgan del pueblo! ¡No sigan las luces del castillo!','Leave the village! Do not follow the castle lights!'],[4300,'La función quiere más invitados...','The performance wants more guests...']],
 8:[[620,'El pueblo quedó atrás. El castillo sigue ahí.','The village is behind us. The castle is still there.'],[3020,'¡Nos escondimos en el granero! ¡Algo camina entre las hojas!','We hid in the barn! Something is walking among the leaves!'],[6800,'Ese atardecer no avanza... es otro decorado.','That sunset never changes... another stage set.'],[12600,'¿Oyes los cascabeles? Ya estamos cerca.','Hear the bells? We are getting close.']],
 9:[[760,'El castillo tiene costuras...','The castle has seams...'],[3990,'Bienvenida al baile. Nuestros anfitriones te esperan.','Welcome to the ball. Our hosts await you.'],[10100,'¡Hay mástiles y poleas detrás de las paredes!','There are masts and pulleys behind the walls!']],
 10:[[300,'Una colección de Halloween... ¿y tantos dulces?','A Halloween collection... why so many sweets?'],[1200,'Ese delantal... ¡es de los vecinos de Villa Lumbre!','That apron... it belongs to the villagers of Villa Lumbre!'],[1850,'¡Siguen dentro del hechizo! Tenemos que liberarlos.','They are still under the spell! We have to free them.']]
};
const cast={6:[[960,'clown']],7:[[1100,'clown']],8:[[1250,'clown'],[3310,'villager',0],[3430,'villager',3],[10800,'clown']],9:[[1550,'clown']],10:[]};
export function prepareEpisodeTwo(s){
 if(!cues[s.index])return;
 s.episodeTwo={seen:new Set(),caption:null,captionAge:0,released:false,
  npcs:(cast[s.index]||[]).map(([x,kind,style=0])=>({x,home:x,kind,style,y:groundY(s.level.route||s.platforms,x),gait:0,runAge:0,active:false,dir:-1}))};
 s.castleInside=false;s.castleTransition=null;
}
export function stepEpisodeTwo(s,dt){
 const q=s.episodeTwo;if(!q)return;
 q.captionAge=Math.max(0,q.captionAge-dt);
 if(s.index===8&&s.player.x>=6800||q.sunsetReveal>0)q.sunsetReveal=Math.min(1,(q.sunsetReveal||0)+dt*.65);
 for(const [i,cue]of cues[s.index].entries())if(!q.seen.has(i)&&s.player.x>=cue[0]){
  q.seen.add(i);q.caption=cue.slice(1);q.captionAge=4.4;
 }
 for(const n of q.npcs){
  if(Math.abs(n.home-s.player.x)<580)n.active=true;
  if(!n.active)continue;
  const pace=n.kind==='clown'?150:105;n.x-=pace*dt;n.gait+=pace*dt/150;n.runAge+=dt;n.y=groundY(s.level.route||s.platforms,n.x);
 }
 q.npcs=q.npcs.filter(n=>n.x>Math.max(0,s.camera.x-320));
}
// A deliberate doorway transition owns time, never resets health or progress.
export function stepCastleDoor(s,dt){
 if(!s.level.castleDoor)return false;
 if(!s.castleInside&&!s.castleTransition&&s.player.x>s.level.castleDoor+240){s.castleInside=true;return false;}
 if(!s.castleInside&&!s.castleTransition&&s.player.x>=s.level.castleDoor)s.castleTransition={age:0,alpha:0,entered:false};
 const q=s.castleTransition;if(!q)return false;
 q.age+=dt;s.time+=dt;s.player.vx=0;s.player.vy=0;
 q.alpha=q.age<.45?Math.min(1,q.age/.45):q.age<.7?1:Math.max(0,1-(q.age-.7)/.45);
 if(q.age>=.45&&!q.entered){q.entered=true;s.castleInside=true;s.player.x=s.level.castleDoor+180;s.player.y=groundY(s.level.route,s.player.x);s.camera.x=s.player.x-300;s.camera.y=s.player.y-440;s.hostile=[];s.shots=[];s.events.push('woodHit');}
 followAdventureCamera(s,dt);
 if(q.age>=1.15)s.castleTransition=null;
 return true;
}
