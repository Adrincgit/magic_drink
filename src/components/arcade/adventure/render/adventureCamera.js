import {groundY} from '../world/adventureTerrain';
import {clashThrowTarget} from '../engine/clashGeometry';
import {balloonVolleySockets} from '../actors/bosses/adventureBalloonCrew';
export {BALLOON_SIZE} from '../actors/bosses/adventureBalloonCrew';
export const cameraView=s=>({zoom:s.camera.zoom||1,width:960/(s.camera.zoom||1),height:540/(s.camera.zoom||1)});
export function adventureBounds(s){
 if(s.harborAmbush?.state==='active'){const a=s.level.harborAmbush;return{left:a.left+24,right:a.right-24};}
 if(s.level.circusEntrance&&s.player.x<0)return{left:(s.level.circusEntrance.left??-1400)+18,right:s.level.circusEntrance.doorX+18};
 if(!s.arenaLocked)return{left:18,right:s.level.width-18};
 const a=s.level.arena,view=cameraView(s);
 if(s.level.nightmareTrail)return{left:a.left+24,right:s.level.nightmareGate.x-44};
 if(s.level.villageTrail||s.level.actTwo)return{left:a.left+24,right:a.right-24};
 if(s.index===3&&s.clashRetreatBounds){
  if(s.player.x>=a.left+24&&s.player.x<=a.right-24)delete s.clashRetreatBounds;
  else return{left:Math.max(18,s.clashRetreatBounds.left),right:Math.min(s.level.width-18,s.clashRetreatBounds.right)};
 }
 if(s.index<=3&&s.boss.phase==='intro')return{left:a.left+24,right:a.right-24};
 if(s.index===0)return{left:Math.max(a.left+16,s.camera.x+16),right:Math.min(a.right-16,s.camera.x+view.width-16)};
 if(s.index===1||s.index===2||s.index===3||s.index===5)return{left:a.left+24,right:a.right-24};
 const center=(a.left+a.right)/2;
 return{left:center-450,right:center+450};
}
export function followAdventureCamera(s,dt){
 if(s.level.actTwo){
  const a=s.level.arena,b=s.boss,battle=s.arenaLocked||!!s.clear||!!b.defeat,ease=1-Math.exp(-dt*4);
  const zoom=battle?s.level.cornfield?Math.max(.5,Math.min(.86,960/(Math.abs(s.player.x-b.x)+520))):Math.max(.68,Math.min(.88,960/(Math.abs(s.player.x-b.x)+510))):1;
  const previousFloor=(a.y-s.camera.y)*(s.camera.zoom||1);s.camera.zoom+=(zoom-s.camera.zoom)*ease;
  const width=960/s.camera.zoom,targetX=battle?Math.max(a.left,Math.min(a.right-width,(s.player.x+b.x)/2-width/2)):Math.max(0,Math.min(s.level.width-width,s.player.x-width*.32));
  s.camera.x+=(targetX-s.camera.x)*ease;s.camera.x=Math.max(0,Math.min(Math.max(0,s.level.width-width),s.camera.x));
  if(battle)s.camera.y=a.y-(previousFloor+(440-previousFloor)*ease)/s.camera.zoom;
  else {const targetY=s.level.maskMansion?Math.max(-320,Math.min(180,s.player.y-385)):s.level.cornfield?groundY(s.level.route,s.player.x)-440:40;s.camera.y+=(targetY-s.camera.y)*Math.min(1,dt*3);}
  s.camera.backdropY+=(40-s.camera.backdropY)*Math.min(1,dt);return;
 }

 const harvester=s.level.villageTrail&&s.arenaLocked&&s.enemies.find(e=>e.type===28&&e.hp>0&&e.active);
 if(harvester){
  const floor=groundY(s.level.route,s.player.x),screenFloor=(floor-s.camera.y)*(s.camera.zoom||1),ease=1-Math.exp(-dt*3.4);
  const zoom=Math.max(.64,Math.min(harvester.harvestStage===2?.8:.95,960/(Math.abs(s.player.x-harvester.x)+440)));
  s.camera.zoom+=(zoom-s.camera.zoom)*ease;const width=960/s.camera.zoom;
  const x=Math.max(s.level.arena.left,Math.min(s.level.width-width,(s.player.x+harvester.x)/2-width/2));
  s.camera.x+=(x-s.camera.x)*ease;s.camera.y=floor-(screenFloor+(440-screenFloor)*ease)/s.camera.zoom;s.camera.backdropY=40;return;
 }
 const blockade=s.villageBlockade,wall=s.villageObstacles?.find(q=>q.id===blockade?.wallId);
 if(s.level.villageTrail&&(blockade?.started&&wall&&!wall.broken&&Math.abs(s.player.x-wall.x)<1200||(s.camera.zoom||1)<1)){
  const active=blockade?.started&&wall&&!wall.broken&&Math.abs(s.player.x-wall.x)<1200,target=active?.78:1,ease=1-Math.exp(-dt*2.8),oldZoom=s.camera.zoom||1;
  const floor=groundY(s.level.route,s.player.x),oldScreen=(floor-s.camera.y)*oldZoom;
  s.camera.zoom=oldZoom+(target-oldZoom)*ease;if(Math.abs(s.camera.zoom-target)<.0005)s.camera.zoom=target;
  const width=960/s.camera.zoom,normal=s.player.x-width*.3125,focus=wall?wall.x+365-width/2:normal;
  const desired=active?Math.max(s.player.x+85-width,Math.min(s.player.x-100,focus)):normal;
  s.camera.x+=(Math.max(0,Math.min(s.level.width-width,desired))-s.camera.x)*(1-Math.exp(-dt*4));
  s.camera.y=floor-(oldScreen+(floor-40-oldScreen)*ease)/s.camera.zoom;s.camera.backdropY=40;return;
 }
 if(s.harborAmbush?.state==='active'){
  const a=s.level.harborAmbush,target=960/(a.right-a.left),ease=1-Math.exp(-dt*5);
  const floor=(a.y-s.camera.y)*(s.camera.zoom||1);
  const approach=(v,to)=>Math.abs(v-to)<.001?to:v+(to-v)*ease;
  s.camera.zoom=approach(s.camera.zoom||1,target);s.camera.x=approach(s.camera.x,a.left);
  s.camera.y=a.y-approach(floor,385)/s.camera.zoom;
  s.camera.backdropY=approach(s.camera.backdropY??75,a.y-385);return;
 }
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
  const zoom=s.level.circusCamp?1:.8,x=Math.max(s.level.circusEntrance.left??-1400,s.player.x-960/zoom*.3125);
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
 const fort=s.index===5&&(s.arenaLocked||!!s.boss.defeat||!!s.clear);
 const nightmare=s.level.nightmareTrail&&(s.arenaLocked||!!s.clear||!!s.boss.defeat);
 const zoom=nightmare?Math.max(.6,Math.min(.8,960/(Math.abs(s.player.x-s.boss.x)+500))):fort?.43:harlequin?Math.max(.56,Math.min(1.08,960/(Math.abs(s.boss.x-s.player.x)+420))):barge?Math.max(.52,Math.min(.8,960/(Math.abs(s.boss.x-s.player.x)+650))):balloon ? (s.boss.move==='bombing-run'&&['warn','attack'].includes(s.boss.phase)?.72:.82) : organ?organZoom:1;
 s.camera.zoom=(s.camera.zoom??1)+(zoom-(s.camera.zoom??1))*Math.min(1,dt*3.4);
 if(harlequin)s.camera.zoom=Math.min(s.camera.zoom,960/(Math.abs(s.boss.x-s.player.x)+270),430/Math.max(300,a.y-Math.min(s.boss.y-205,s.player.y-110)));
 const view=cameraView(s),center=(a.left+a.right)/2;
 const organCenter=(Math.min(s.player.x,s.boss.x-204)+Math.max(s.player.x,s.boss.x+170))/2;
 const bargeCenter=(Math.min(s.player.x-70,s.boss.x-370)+s.boss.x+375)/2;
 const battleX=nightmare?Math.max(a.left,Math.min(a.right-view.width,(s.player.x+s.boss.x)/2-view.width/2)):fort?Math.max(a.left,Math.min(a.right-view.width,(s.player.x-80+s.boss.x+650)/2-view.width/2)):harlequin?(s.player.x+s.boss.x)/2-view.width/2:barge?Math.max(a.left,Math.min(a.right-view.width,bargeCenter-view.width/2)):s.index===0?Math.max(a.left,Math.min(a.right-view.width,s.player.x-view.width*.42)):s.index===1?Math.max(a.left,Math.min(a.right-view.width,organCenter-view.width/2)):center-view.width/2;
 const x=s.arenaLocked||fort?battleX:Math.max(0,Math.min(s.level.width-view.width,s.player.x-view.width*.3125));
 // A zoomed battle keeps the floor visible and opens room above the balloon.
 // Collision gaps have no earth platform. The continuous route still has an
 // elevation there; sampling a missing collider used to fall back to y=480.
 const routeY=groundY(s.level.route||s.platforms,s.player.x);
 const pitLook=s.level.emberTrail?Math.min(20,Math.max(0,s.player.y-routeY-40)*.35):0;
 const y=s.level.villageTrail?40:nightmare?a.y-440/view.zoom:fort?a.y-440/view.zoom:barge?a.y-440/view.zoom:balloon?a.y-475/view.zoom:organ?a.y-470/view.zoom:s.level.groundRoute?routeY-(s.level.cameraFloor||440)+pitLook:s.arenaLocked?a.y-420:Math.max(-190,Math.min(150,s.player.y-380));
 s.camera.x+=(x-s.camera.x)*Math.min(1,dt*7);
 // Zoom widens the viewport immediately; the eased x must respect the NEW
 // width on this same frame, including the boss arrival and retreat.
 if(s.level.groundRoute)s.camera.x=Math.max(0,Math.min(Math.max(0,s.level.width-view.width),s.camera.x));
 if(harlequin){
  const near=Math.max(0,Math.max(s.player.x+75,s.boss.x+130)-view.width),far=Math.min(s.level.width-view.width,Math.min(s.player.x-75,s.boss.x-130));
  if(near<=far)s.camera.x=Math.max(near,Math.min(far,s.camera.x));
 }
 if(s.index>=4){
  if(s.level.nightmareTrail&&!nightmare){
   // The broad floor gives room for elevation changes inside the frame.
   // Average nearby earth and damp reversals instead of tracking each slope
   // directly; distant landscape planes keep their fixed vertical anchors.
   const route=s.level.route,near=(groundY(route,Math.max(0,s.player.x-260))+routeY*2+groundY(route,Math.min(s.level.width-1,s.player.x+260)))/4;
   const target=Math.max(routeY-480,Math.min(routeY-350,near-(s.level.cameraFloor||440)));
   const shift=(target-s.camera.y)*(1-Math.exp(-dt*1.65));
   s.camera.y+=Math.max(-70*dt,Math.min(70*dt,shift));
   s.camera.y=Math.max(routeY-495,Math.min(routeY-335,s.camera.y));s.camera.backdropY=40;return;
  }
  if(fort||s.level.emberTrail&&Math.abs(view.zoom-1)>.001){
   const targetFloor=fort?440:s.level.cameraFloor||440;
   const floor=previousFloor+(targetFloor-previousFloor)*(1-Math.exp(-dt*3));
   s.camera.y=routeY-floor/view.zoom;return;
  }
  const shift=(y-s.camera.y)*(1-Math.exp(-dt*5));
  s.camera.y+=Math.max(-180*dt,Math.min(180*dt,shift));
  const elevation=routeY-(s.level.cameraFloor||440),back=s.camera.backdropY??elevation;
  s.camera.backdropY=back+(elevation-back)*(1-Math.exp(-dt*1.25));return;
 }
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
