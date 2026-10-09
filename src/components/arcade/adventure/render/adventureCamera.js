import {groundY} from '../world/adventureTerrain';
import {clashThrowTarget} from '../engine/clashGeometry';
import {balloonVolleySockets} from '../actors/bosses/adventureBalloonCrew';
export {BALLOON_SIZE} from '../actors/bosses/adventureBalloonCrew';
export const cameraView=s=>({zoom:s.camera.zoom||1,width:960/(s.camera.zoom||1),height:540/(s.camera.zoom||1)});
export function adventureBounds(s){
 if(s.level.circusEntrance&&s.player.x<0)return{left:-1382,right:s.level.circusEntrance.doorX+18};
 if(!s.arenaLocked)return{left:18,right:s.level.width-18};
 const a=s.level.arena,view=cameraView(s);
 if(s.index===3&&s.clashRetreatBounds){
  if(s.player.x>=a.left+24&&s.player.x<=a.right-24)delete s.clashRetreatBounds;
  else return{left:Math.max(18,s.clashRetreatBounds.left),right:Math.min(s.level.width-18,s.clashRetreatBounds.right)};
 }
 if(s.index<=3&&s.boss.phase==='intro')return{left:a.left+24,right:a.right-24};
 if(s.index===0)return{left:Math.max(a.left+16,s.camera.x+16),right:Math.min(a.right-16,s.camera.x+view.width-16)};
 if(s.index===1||s.index===2||s.index===3)return{left:a.left+24,right:a.right-24};
 const center=(a.left+a.right)/2;
 return{left:center-450,right:center+450};
}
export function followAdventureCamera(s,dt){
 const afterClash=s.index===3&&(s.clashRetreatBounds||s.arenaLocked&&(s.boss.x>s.level.arena.right-24||s.boss.x<s.level.arena.left+24));
 if(afterClash||s.powerClash&&['resolve','flight','land'].includes(s.powerClash.state)){
  const a=s.level.arena,q=s.powerClash,previousFloor=(a.y-s.camera.y)*s.camera.zoom;
  const loser=q?.won?s.boss:s.player,winner=q?.won?s.player:s.boss;
  const destination=q?.state==='resolve'?clashThrowTarget(s,loser,winner,q.won):q?.flight?.toX;
  const left=Math.min(s.player.x,s.boss.x,destination??Infinity),right=Math.max(s.player.x,s.boss.x,destination??-Infinity);
  const target=Math.max(.28,Math.min(.65,960/(right-left+360)));
  s.camera.zoom+=(target-s.camera.zoom)*(1-Math.exp(-dt*4));
  const width=960/s.camera.zoom,x=Math.max(0,Math.min(s.level.width-width,(left+right)/2-width/2));
  s.camera.x=Math.max(0,Math.min(s.level.width-width,s.camera.x+(x-s.camera.x)*(1-Math.exp(-dt*6))));
  // Anticipate the flight during breakthrough, then keep whole silhouettes
  // inside the lens even while the zoom is still easing.
  const near=Math.max(0,Math.max(s.player.x+80,s.boss.x+135)-width),far=Math.min(s.level.width-width,Math.min(s.player.x-80,s.boss.x-135));
  if(near<=far)s.camera.x=Math.max(near,Math.min(far,s.camera.x));
  s.camera.y=a.y-(previousFloor+(454-previousFloor)*(1-Math.exp(-dt*4)))/s.camera.zoom;return;
 }
 if(s.level.circusEntrance&&s.player.x<0){
  const zoom=.8,x=Math.max(-1400,s.player.x-960/zoom*.3125);
  s.camera.zoom=zoom;s.camera.y=s.level.circusEntrance.floor-440/zoom;s.camera.backdropY=40;
  s.camera.x+=(x-s.camera.x)*Math.min(1,dt*7);return;
 }
 if(s.level.circusArrival&&s.clear){
  const zoom=s.camera.zoom+(1-s.camera.zoom)*(1-Math.exp(-dt*1.2));
  const floor=(s.level.arena.y-s.camera.y)*s.camera.zoom;
  s.camera.zoom=zoom;s.camera.y=s.level.arena.y-(floor+(440-floor)*(1-Math.exp(-dt*3)))/zoom;
  const x=Math.max(0,Math.min(s.level.width-960/zoom,s.player.x-960/zoom*.33));
  s.camera.x+=(x-s.camera.x)*Math.min(1,dt*4);return;
 }
 const a=s.level.arena,balloon=s.index===0&&(s.arenaLocked||!!s.clear||!!s.boss.defeat);
 const organ=s.index===1&&(s.arenaLocked||!!s.clear||!!s.boss.defeat);
 const barge=s.index===2&&(s.arenaLocked||!!s.clear||!!s.boss.defeat);
 const harlequin=s.index===3&&(s.arenaLocked||!!s.clear||!!s.boss.defeat);
 const previousFloor=(a.y-s.camera.y)*(s.camera.zoom||1);
 const rushing=organ&&s.boss.move==='organ-charge'&&['warn','attack'].includes(s.boss.phase);
 const organZoom=Math.max(.62,Math.min(rushing?.72:s.boss.transformed?.8:.82,960/(Math.abs(s.boss.x-s.player.x)+440)));
 const zoom=harlequin?Math.max(.56,Math.min(1.08,960/(Math.abs(s.boss.x-s.player.x)+420))):barge?Math.max(.52,Math.min(.8,960/(Math.abs(s.boss.x-s.player.x)+590))):balloon ? (s.boss.move==='bombing-run'&&['warn','attack'].includes(s.boss.phase)?.72:.82) : organ?organZoom:1;
 s.camera.zoom=(s.camera.zoom??1)+(zoom-(s.camera.zoom??1))*Math.min(1,dt*3.4);
 if(harlequin)s.camera.zoom=Math.min(s.camera.zoom,960/(Math.abs(s.boss.x-s.player.x)+270),430/Math.max(300,a.y-Math.min(s.boss.y-205,s.player.y-110)));
 const view=cameraView(s),center=(a.left+a.right)/2;
 const organCenter=(Math.min(s.player.x,s.boss.x-204)+Math.max(s.player.x,s.boss.x+170))/2;
 const bargeCenter=(Math.min(s.player.x-70,s.boss.x-335)+s.boss.x+340)/2;
 const battleX=harlequin?(s.player.x+s.boss.x)/2-view.width/2:barge?Math.max(a.left,Math.min(a.right-view.width,bargeCenter-view.width/2)):s.index===0?Math.max(a.left,Math.min(a.right-view.width,s.player.x-view.width*.42)):s.index===1?Math.max(a.left,Math.min(a.right-view.width,organCenter-view.width/2)):center-view.width/2;
 const x=s.arenaLocked?battleX:Math.max(0,Math.min(s.level.width-view.width,s.player.x-view.width*.3125));
 // A zoomed battle keeps the floor visible and opens room above the balloon.
 const y=barge?a.y-440/view.zoom:balloon?a.y-475/view.zoom:organ?a.y-470/view.zoom:s.level.groundRoute?groundY(s.platforms,s.player.x)-(s.level.cameraFloor||440):s.arenaLocked?a.y-420:Math.max(-190,Math.min(150,s.player.y-380));
 s.camera.x+=(x-s.camera.x)*Math.min(1,dt*7);
 // Zoom widens the viewport immediately; the eased x must respect the NEW
 // width on this same frame, including the boss arrival and retreat.
 if(s.level.groundRoute)s.camera.x=Math.max(0,Math.min(Math.max(0,s.level.width-view.width),s.camera.x));
 if(harlequin){
  const near=Math.max(0,Math.max(s.player.x+75,s.boss.x+130)-view.width),far=Math.min(s.level.width-view.width,Math.min(s.player.x-75,s.boss.x-130));
  if(near<=far)s.camera.x=Math.max(near,Math.min(far,s.camera.x));
 }
 if(s.index>=4){s.camera.y+=(y-s.camera.y)*Math.min(1,dt*5);return;}
 if(balloon||organ||barge||harlequin){
  // Pull back around the arena floor. Easing zoom and world y independently
  // made the entire stage jump upwards before the camera caught up.
  const floor=previousFloor+((harlequin?454:barge?440:balloon?475:470)-previousFloor)*(1-Math.exp(-dt*3));
  s.camera.y=a.y-floor/view.zoom;
 }else{
  const rise=(y-s.camera.y)*(1-Math.exp(-dt*3));
  s.camera.y+=Math.max(-140*dt,Math.min(140*dt,rise));
 }
 // Distant scenery follows a slower elevation channel, never the sampled
 // slope beneath the centre of the screen or the player's airborne motion.
 const background=s.camera.backdropY??s.camera.y;
 // Landscape elevation follows the route, not the world-y compensation for
 // a boss zoom. The horizon and distant roots must not climb during pullback.
 const elevation=s.level.groundRoute?groundY(s.platforms,s.player.x)-(s.level.cameraFloor||440):s.camera.y;
 s.camera.backdropY=background+Math.max(-48*dt,Math.min(48*dt,(elevation-background)*(1-Math.exp(-dt*1.25))));
}
// Front basket mouths/hands: the same points drive anticipation and release.
export function balloonSockets(s){
 return balloonVolleySockets(s);
}
