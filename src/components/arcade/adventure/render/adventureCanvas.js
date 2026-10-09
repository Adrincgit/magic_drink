import {drawFireImpact} from './harlequinFireCanvas';
import {buddyFrame,buddyPosition,buddyRollFrame} from '../engine/adventureDefense';
import {shopForLevel} from '../engine/adventureShop';
import {shieldCharges} from '../engine/adventureLoot';
import {paintOriginalTrail,paintOriginalScreen} from '../engine/adventureOriginal';
import {MEADOW_PLANES,paintMeadowPlane} from '../world/adventureParallax';
import {superBackdrop,superBeam,superCaption,superCameraOffset} from './adventureSuperCanvas';
import {drawSuperCutin} from './adventureSuperCutin';
import {drawBarge,drawBargeProjectile,drawHarborFX} from './bargeCanvas';
import {drawHarborBackdrop,drawHarborProps,drawHarborDock} from './adventureHarborCanvas';
import {drawGrandRingBackdrop,drawGrandRingStage,drawHarlequin,drawHarlequinProjectile,drawHarlequinFX,drawHarlequinMeter} from './harlequinCanvas';
import {drawInfernoBarriers} from './infernoStageCanvas';
import {drawInfernoForeground} from './infernoBackdropCanvas';
import {drawInfernoFloorLights} from './infernoLightCanvas';
import {GRAND_RING_FLOOR,grandRingFloorView,drawRingContactShadow} from './grandRingFloor';
import {drawCircusFacade,drawCircusOutsideBackdrop,drawCircusForecourt,drawCircusWalkway,drawCircusTransition,outsideCircus} from './circusEntranceCanvas';
import {circusEntryFigure} from '../engine/adventureCircusEntrance';
import {drawPowerBackdrop,drawPowerWorld,drawHarlequinCutin,drawClashMeter} from './powerClashCanvas';
import {drawClashDust,drawClashPortraits,drawClashScreenFlash,drawCinematicSmoke} from './clashSpectacleCanvas';
import {drawOrgan} from './organCanvas';
import {drawOrganDebris,drawOrganRedNote,drawOrganWave} from './organEffectsCanvas';
import {bossHitFilter} from '../actors/bosses/bossFeedback';
import {drawZeppelin,drawRedPellet} from './zeppelinCanvas';
import {ZEPPELIN_DUST_DURATION} from '../actors/enemies/adventureZeppelin';
import {drawBalloonDetails} from './balloonDetailsCanvas';
import {drawWandGlow} from './wandGlow';
import {drawRiverBackdrop,drawRiverWater,drawRiverBridge,drawRiverPierWater} from './adventureRiverCanvas';
import {RIVER_TREE_ART} from '../world/riverTreeArt';
import {enemyGeometry} from '../actors/enemies/adventureEnemyGeometry';
import {cameraView,BALLOON_SIZE} from './adventureCamera';
import {balloonCrewDrawing,BALLOON_RIM_Y} from '../actors/bosses/adventureBalloonCrew';
import {surfaceY,sceneryPlacement,rootedSceneryPlacement,groundY} from '../world/adventureTerrain';
import {OUTPOST_SIZE,outpostFrame} from '../actors/enemies/adventureOutposts';
import {SUPPLY_SIZE,supplyFrame} from '../world/adventureSupplies';
import {drawMeadowSky} from '../world/adventureSky';
import {LEVELS,DRINKS} from '../world/adventureLevels';
import {HEXY_SHEETS,hexyPose,hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {drawHexy as hexy} from './hexyCanvas';
import {SPECIALS,SUPER_WINDUP,specialArt,spellFor} from '../engine/adventureMagic';
import {ACTOR_SHEETS,bossDrawing,enemyDrawing,MAGIC_ROWS,HOSTILE_ROWS,effectFrame} from './adventureSprites';

export async function loadAdventureArt(){
 const paths={bunny:'/arcade/sprites/bunnies/bunny-atlas.webp',ground:'/arcade/maps/meadow/ground.webp',magic:'/arcade/sprites/effects/magic.webp',hostile:'/arcade/sprites/effects/hostile.webp',impacts:'/arcade/sprites/effects/impacts.webp'};
 paths['treasure-star']='/arcade/sprites/ui/treasure-star.webp';
 paths['hexy-encore-portrait']='/arcade/sprites/ui/hexy-encore-full.webp';
 paths['hexy-clash-portraits']='/arcade/sprites/ui/hexy-clash-full.webp?v=20261008-fire-acting';
 for(const name of ['poses','mid','final','effects','ultimate','ultimate-portrait','ultimate-effects','ultimate-beam','motion','motion-mid','motion-final','clash-fall','clash-portraits','clash-effects'])paths['harlequin-'+name]='/arcade/sprites/bosses/harlequin/'+name+'.webp';
 paths['harlequin-clash-portraits']='/arcade/sprites/bosses/harlequin/clash-full.webp?v=20261008-cinematic';
 for(const name of ['motion','motion-mid','motion-final','fire-actions','fire-actions-mid','super-cast'])paths['harlequin-'+name]='/arcade/sprites/bosses/harlequin/'+name+'.webp?v=20261008-fire-acting';
 paths['grand-ring-exterior']='/arcade/maps/grand-ring/exterior.webp';
 for(const name of ['burning','inferno'])paths['grand-ring-'+name]='/arcade/maps/grand-ring/background-'+name+'-v2.webp?v=20261008-inferno';
 paths['harlequin-pyres']='/arcade/sprites/bosses/harlequin/pyres.webp?v=20261008-impact';
 for(const name of ['heads','particles','dust','fire','pyres','meter','fire-show'])paths['duel-'+name]='/arcade/sprites/effects/painted-duel/'+name+'.webp?v=20261008-painted';
 paths['impact-smoke']='/arcade/sprites/effects/impact-smoke.webp?v=20261008-impact';
 for(const name of ['sprint','sprint-mid','sprint-final','arrival'])paths['harlequin-'+name]='/arcade/sprites/bosses/harlequin/'+name+'.webp?v=20261008-fire-show';
 for(const name of ['inferno','inferno-mid','inferno-final'])paths['harlequin-'+name]='/arcade/sprites/bosses/harlequin/'+name+'.webp?v=20261008-inferno';
 paths['inferno-scene']='/arcade/sprites/effects/painted-duel/inferno-scene.webp?v=20261008-inferno';
 paths['circus-chaos']='/arcade/sprites/effects/painted-duel/circus-chaos.webp?v=20261008-chaos';
 for(const name of ['motion-fluid','motion-fluid-mid','motion-fluid-final'])paths['harlequin-'+name]='/arcade/sprites/bosses/harlequin/'+name+'.webp?v=20261008-impact';
 for(const name of ['body','damaged','wheel','mallet','shield','cannon'])paths['barge-'+name]='/arcade/sprites/bosses/barge/'+name+'.webp';
 for(const name of ['water','lantern','boat','reeds','grove','distant','fair'])paths['harbor-'+name]='/arcade/maps/harbor/'+name+'.webp';
 paths['river-diver']='/arcade/sprites/enemies/river-diver.webp';paths['harbor-effects']='/arcade/sprites/effects/harbor-effects.webp';
 paths['forest-edge']='/arcade/maps/meadow/forest-edge.webp';
 for(const name of ['sunset-sky','meadow-horizon','sunset-clouds'])paths[name]='/arcade/maps/meadow/'+name+'.webp';
 for(const {key} of MEADOW_PLANES)paths[key]='/arcade/maps/meadow/'+key+'.webp';
 paths['bunny-roll']='/arcade/sprites/bunnies/roll.webp';paths['mod-charms']='/arcade/sprites/ui/mod-charms.webp';
 paths['juggler-actions']='/arcade/sprites/enemies/juggler-actions.webp';paths['juggler-balls']='/arcade/sprites/effects/juggler-balls.webp';paths['loot-items']='/arcade/sprites/pickups/loot-items.webp';
 paths['meadow-midground']='/arcade/maps/meadow/midground.webp';
 paths['pier-foam']='/arcade/sprites/effects/pier-foam.webp';
 paths['circus-supply']='/arcade/sprites/props/circus-supply.webp';paths['wand-burst']='/arcade/sprites/effects/wand-burst.webp';
 for(const name of ['acrobat-motion','acrobat-rings'])paths[name]='/arcade/sprites/enemies/'+name+'.webp';
 for(const name of ['balloon-damaged','balloon-crash'])paths[name]='/arcade/sprites/bosses/'+name+'.webp';
 for(const name of ['red-clown-walk','red-clown-air','red-clown-throw'])paths[name]='/arcade/sprites/enemies/'+name+'.webp';
 for(const name of ['clown-zeppelin','zeppelin-propeller'])paths[name]='/arcade/sprites/enemies/'+name+'.webp';
 paths['zeppelin-actions']='/arcade/sprites/enemies/zeppelin-actions.webp';
 paths['zeppelin-dust']='/arcade/sprites/effects/zeppelin-dust.webp';
 paths['organ-sonic']='/arcade/sprites/effects/organ-sonic.webp';
 paths['armor-ricochet']='/arcade/sprites/effects/armor-ricochet.webp';
 paths['balloon-hatch']='/arcade/sprites/bosses/balloon-hatch.webp';
 paths['balloon-shell']='/arcade/sprites/bosses/balloon-shell.webp';
 for(const name of ['body','pipes','horn','wheel','cover'])paths['organ-'+name]='/arcade/sprites/bosses/organ/'+name+'.webp';
 for(const key of ['water','bridge'])paths['river-'+key]='/arcade/maps/riverwoods/'+key+'.webp';
 paths['river-mountains']='/arcade/maps/riverwoods/mountains.webp';
 for(const key of Object.keys(RIVER_TREE_ART))paths[key]='/arcade/maps/riverwoods/trees/'+key.slice(11)+'.webp';
 paths['wagon-open']='/arcade/sprites/props/wagon-open.webp';
 paths['clown-outpost']='/arcade/sprites/props/clown-outpost.webp';
 for(const name of ACTOR_SHEETS)paths[name]='/arcade/sprites/'+(['boss-balloon','serio','alegre','agresivo','muta'].includes(name)?'bosses/':'enemies/')+name+'.webp';
 paths['boss-balloon']='/arcade/sprites/bosses/balloon-hd.webp';paths['balloon-damaged']='/arcade/sprites/bosses/balloon-damaged-hd.webp';
 for(const name of HEXY_SHEETS)paths['hexy-'+name]='/arcade/sprites/hexy/'+name+'.webp';
 paths['hexy-air-super-release']+='?v=20261006-new-air-pose';
 // The rebuilt air pose also holds the windup: no return to the rejected
 // arm drawing immediately before the new release animation.
 paths['hexy-air-super']=paths['hexy-air-super-release'];
 for(const name of ['tent','wagon','trees','log','cannon-tower','rescue-cage'])paths[name]='/arcade/sprites/props/'+name+'.webp';
 paths.dragon='/arcade/sprites/effects/dragon.webp';
 for(const spec of SPECIALS.slice(1))paths['special-'+spec.key]='/arcade/sprites/effects/'+spec.key+'.webp';
 for(const name of ['bunny-shield','music-guard','super-star','super-beam'])paths[name]='/arcade/sprites/effects/'+name+'.webp';
 for(const name of ['serio-actions','alegre-actions','agresivo-actions','muta-actions'])paths[name]='/arcade/sprites/bosses/'+name+'.webp';
 paths['bunny-cast']='/arcade/sprites/bunnies/cast.webp';paths['bunny-movement']='/arcade/sprites/bunnies/movement.webp';
 paths['cannon-clown']='/arcade/sprites/enemies/cannon-clown.webp';
 paths['circus-projectiles']='/arcade/sprites/effects/circus-projectiles.webp';
 for(const name of ['collectible-star','thorn-spikes','trap-bubble','victory-flag'])paths[name]='/arcade/sprites/props/'+name+'.webp';
 LEVELS.forEach((l,i)=>{paths['world'+i]=l.background;if(l.world.midground)paths['mid'+i]=l.world.midground;paths[l.world.key+'-ground']=l.world.ground;});
 DRINKS.forEach((d,i)=>paths['drink'+i]=d.image);
 return Object.fromEntries(await Promise.all(Object.entries(paths).map(([key,src])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([key,img]);img.onerror=()=>reject(new Error(src));img.src=src;}))));
}
function star(c,x,y,r,color='#ffe7a0'){
 c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.44:r;c.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k);}c.closePath();c.fillStyle=color;c.fill();c.lineWidth=1.5;c.strokeStyle='#764e54';c.stroke();
}
function sprite(c,img,frame,x,y,size,flip=false,center=false,rotation=0){
 c.save();c.translate(x,y);c.rotate(rotation);if(flip)c.scale(-1,1);
 const cell=img.width/4;c.drawImage(img,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,-size/2,center?-size/2:-size*250/256,size,size);c.restore();
}
function round(c,x,y,w,h,r,fill,stroke='#482f54'){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}
function shadow(c,x,y,w=25,alpha=.2,ring=false){if(ring){drawRingContactShadow(c,x,y,w,alpha);return;}c.fillStyle='rgba(38,24,47,'+alpha+')';c.beginPath();c.ellipse(x,y+2,w,Math.max(3,w*.18),0,0,Math.PI*2);c.fill();}
function layer(c,img,camera,factor,y,height,alpha=1){
 const w=height*img.width/img.height,offset=((camera*factor)%w+w)%w,tile=Math.floor(camera*factor/w);c.globalAlpha=alpha;
 for(let i=-1;i<Math.ceil(960/w)+1;i++){c.save();c.translate(i*w-offset,y);if((tile+i)%2){c.translate(w,0);c.scale(-1,1);}c.drawImage(img,0,0,w,height);c.restore();}c.globalAlpha=1;
}
function terrain(c,q,world,art){
 if(q.kind==='dock'){drawHarborDock(c,q,art);return;}
 if(q.bridge){drawRiverBridge(c,q,art);return;}
 if(q.kind==='earth'){
  const slope=((q.yEnd??q.y)-q.y)/q.w,img=art[world.key+'-ground'],tileH=270,tileW=tileH*img.width/img.height,inset=world.groundInset??.22;
  c.save();c.translate(q.x,q.y);c.transform(1,slope,0,1,0,0);
  // Solid soil starts beneath opaque leaves, never behind the ragged alpha edge.
  const fillTop=tileH*((world.groundFillInset??inset)-inset);
  c.fillStyle=world.soil[1];c.fillRect(0,fillTop,q.w,750);
  c.beginPath();c.rect(0,-tileH*inset,q.w,tileH+750);c.clip();
  // The same world anchor spans adjacent flats and slopes without sliding.
  for(let x=Math.floor(q.x/tileW)*tileW;x<q.x+q.w;x+=tileW){
   c.save();c.translate(x-q.x,-tileH*inset);
   if(world.terrain==='riverbank'&&Math.abs(Math.floor(x/tileW))%2){c.translate(tileW,0);c.scale(-1,1);}
   c.drawImage(img,0,0,tileW,tileH);c.restore();
  }
  c.restore();return;
 }
 const main=q.w>300,h=main?210:44;
 const gradient=c.createLinearGradient(0,q.y,0,q.y+h);
 gradient.addColorStop(0,world.soil[0]);gradient.addColorStop(1,world.soil[1]);
 if(q.kind==='earth'){c.fillStyle=gradient;c.fillRect(q.x,q.y,q.w,600);}else round(c,q.x,q.y,q.w,h,main?9:13,gradient,world.edge);
 if(world.terrain==='grass'){
  const img=art.ground,tileH=main?270:68,tileW=tileH*img.width/img.height,y=q.y-tileH*.22;
  c.save();c.beginPath();c.roundRect(q.x,y,q.w,tileH,q.kind==='earth'?0:main?8:15);c.clip();
  for(let x=Math.floor(q.x/tileW)*tileW;x<q.x+q.w;x+=tileW)c.drawImage(img,x,y,tileW,tileH);
  c.restore();
 }else{
  const img=art[world.key+'-ground'],sourceH=main?img.height:Math.min(300,img.height),tileW=h*img.width/sourceH;
  c.save();c.beginPath();c.roundRect(q.x,q.y,q.w,h,main?7:12);c.clip();
  // Texture is anchored to its platform, including vertically moving branches.
  for(let x=q.x;x<q.x+q.w;x+=tileW)c.drawImage(img,0,0,img.width,sourceH,x,q.y,tileW,h);
  c.restore();
 }
 if(q.kind==='moving'){star(c,q.x+q.w/2,q.y+h+5,6,'#ffe7a8');}
}
function atmosphere(c,s,reduced){
 const world=s.level.world,time=reduced?0:s.time;
 c.save();
 if(world.ambient==='bulbs'||world.ambient==='crystals'){
  const spacing=world.ambient==='bulbs'?145:210,shift=s.camera.x*.51;
  for(let i=Math.floor(shift/spacing)-1;i<(shift+1060)/spacing;i++){
   const x=i*spacing-shift,y=world.ambient==='bulbs'?55:90+(i%3)*28,swing=Math.sin(time*.9+i)*6;
   c.strokeStyle=world.edge;c.lineWidth=2;c.beginPath();c.moveTo(x,-20);c.lineTo(x+swing,y);c.stroke();
   c.shadowColor=world.accent;c.shadowBlur=8+Math.sin(time*2+i)*3;star(c,x+swing,y+8,world.ambient==='bulbs'?9:13,world.accent);c.shadowBlur=0;
  }
 }else{
  // Positions belong to world coordinates. They pass the camera instead of following it.
  const shift=s.camera.x*.65;
  for(let i=Math.floor(shift/95)-1;i<(shift+1060)/95;i++){
   const x=i*95-shift+Math.sin(time*.65+i)*14,y=145+(Math.sin(i*19)*.5+.5)*240-(s.index<2?(s.camera.backdropY??s.camera.y):s.camera.y)*.55;
   c.fillStyle=world.accent;
   if(world.ambient==='leaves'){c.save();c.translate(x,y+Math.sin(time+i)*13);c.rotate(time*.4+i);c.beginPath();c.ellipse(0,0,5,2,0,0,Math.PI*2);c.fill();c.restore();}
   else{c.globalAlpha=world.ambient==='fireflies'?.35+(.5+.5*Math.sin(time*2+i))*.5:.4;c.beginPath();c.arc(x,y,world.ambient==='fireflies'?2.5:1.5,0,Math.PI*2);c.fill();}
  }
 }
 c.restore();
}
export function renderAdventure(canvas,s,art,{reduced=false,en=false,circusFloor=GRAND_RING_FLOOR}={}){
 const cw=canvas.clientWidth,ch=canvas.clientHeight,dpr=Math.min(globalThis.devicePixelRatio||1,2);if(!cw||!ch)return;
 if(canvas.width!==Math.round(cw*dpr)||canvas.height!==Math.round(ch*dpr)){canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);}
 // Use one projected camera for the room, feet, fire, beams and portraits.
 // This is a render-only comparison; the physical arena and wood view remain.
 s=grandRingFloorView(s,circusFloor);
 const c=canvas.getContext('2d'),W=960,H=540;c.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);c.clearRect(0,0,W,H);
 c.save();if(s.superCinematic){const offset=superCameraOffset(s,reduced);c.translate(offset.x,offset.y);}
 else if(!reduced&&s.shake>0){const force=Math.min(1,s.shake/.12);c.translate(Math.sin(s.fxTime*137)*3*force,Math.cos(s.fxTime*113)*2*force);}
 const world=s.level.world,bg=art['world'+s.index],view=cameraView(s),outside=outsideCircus(s);
 c.fillStyle=s.level.sky[0];c.fillRect(0,0,W,H);
 if(outside)drawCircusOutsideBackdrop(c,s,art,reduced);
 else if(s.level.grandRing)drawGrandRingBackdrop(c,s,art,reduced);
 else if(s.level.harborRoute)drawHarborBackdrop(c,s,art,reduced);
 else if(s.level.riverRoute)drawRiverBackdrop(c,s,art,reduced);
 else if(s.level.groundRoute){drawMeadowSky(c,s,art,reduced);for(const plane of MEADOW_PLANES)paintMeadowPlane(c,art[plane.key],s.camera,plane,s.level.width);}
 else layer(c,bg,s.camera.x,world.farSpeed,-70-s.camera.y*.12,610);
 if(s.level.groundRoute&&!s.level.riverRoute&&!s.level.grandRing){
  // The forest enters from the right as solid cutouts. Crossfading entire
  // panoramas made trunks transparent against the hills behind them.
  const edge=s.level.forestEdge,img=art['forest-edge'],height=610,width=height*img.width/img.height;
  const origin=(edge.start-s.camera.x)*edge.speed;
  for(let i=0;i<3;i++){
   const x=origin+i*width;if(x>960||x+width<0)continue;
   c.save();c.translate(x,-65-(s.camera.backdropY??s.camera.y)*.18);if(i%2){c.translate(width,0);c.scale(-1,1);}c.drawImage(img,0,0,width,height);c.restore();
  }
  // Extra rolling vegetation moves between the distant panorama and the
  // rooted scenery. Its bottom stays behind the opaque playable ground.
  layer(c,art['meadow-midground'],s.camera.x,.56,170-(s.camera.backdropY??s.camera.y)*.23,370);
  c.save();c.scale(view.zoom,view.zoom);
  for(const prop of s.level.scenery){if(prop.kind==='wagon')continue;const img=art[prop.kind],width=prop.h*img.width/img.height,{x,y}=sceneryPlacement(prop,s.camera);
   if(x+width/2< -50||x-width/2>view.width+50)continue;
   c.save();c.translate(x,y);if(prop.flip)c.scale(-1,1);c.drawImage(img,-width/2,-prop.h,width,prop.h);c.restore();
  }c.restore();
 }else if(!s.level.riverRoute&&!s.level.grandRing)layer(c,art['mid'+s.index],s.camera.x,world.midSpeed,55-s.camera.y*.35,425);
 if(!s.level.grandRing)atmosphere(c,s,reduced);
 c.save();c.scale(view.zoom,view.zoom);c.translate(-s.camera.x,-s.camera.y);
 if(outside)drawCircusForecourt(c,s,art,reduced);
 else if(s.level.grandRing)drawGrandRingStage(c,s,art,reduced);
 if(s.level.riverRoute){
  drawRiverWater(c,s,art,reduced);
  if(s.level.harborRoute)drawHarborProps(c,s,art,reduced);
  if(s.level.circusArrival)drawCircusFacade(c,s,art);
  if(s.index===2)drawBarge(c,s,art,reduced);
  for(const prop of s.level.scenery){
   const img=art[prop.kind],q=rootedSceneryPlacement(prop,s.platforms,img);
   if(q.x+q.w<s.camera.x||q.x>s.camera.x+view.width)continue;
   c.save();c.translate(q.x,q.y);if(prop.flip){c.translate(q.w,0);c.scale(-1,1);}c.drawImage(img,0,0,q.w,q.h);c.restore();
  }
 }
 if(!outside&&!(s.level.grandRing&&circusFloor==='dark'))for(const q of s.platforms)if(q.x+q.w>s.camera.x-100&&q.x<s.camera.x+view.width+100){
  if(q.bridge&&s.level.circusArrival&&q.x>=s.level.arena.right)drawCircusWalkway(c,q,art,s.level.circusArrival.doorX);
  else terrain(c,q,world,art);
 }
 if(s.level.riverRoute)drawRiverPierWater(c,s,art,reduced);
 if(s.level.grandRing&&!outside)drawInfernoBarriers(c,s,art,reduced);
 drawPowerBackdrop(c,s,reduced);
 if(s.level.grandRing&&!outside)drawInfernoFloorLights(c,s,reduced);
 const shop=shopForLevel(s.level);if(shop){const h=180,w=h*art.wagon.width/art.wagon.height,q=s.shopTransition,open=q&&(q.leaving?q.age<1.35:q.age>q.walk+.35);c.drawImage(open?art['wagon-open']:art.wagon,shop.x-w/2,shop.y-h,w,h);sprite(c,art['mod-charms'],0,shop.x+62,shop.y-138,30,false,true);}
 for(const q of s.outposts){
  if(q.x<s.camera.x-220||q.x>s.camera.x+view.width+220)continue;
  shadow(c,q.x,q.y,105,.16);c.save();if(q.flash>0)c.filter='brightness(1.65)';
  sprite(c,art['clown-outpost'],outpostFrame(q),q.x,q.y+5,OUTPOST_SIZE);c.restore();
 }
 for(const q of s.supplies){
  if(q.x<s.camera.x-100||q.x>s.camera.x+view.width+100)continue;
  shadow(c,q.x,q.landingY??q.y,32,q.falling?.08:.16,s.ringPerspective);c.save();if(q.flash>0)c.filter='brightness(1.7)';sprite(c,art['circus-supply'],supplyFrame(q),q.x,q.y,SUPPLY_SIZE);c.restore();
 }
 for(const h of s.hazards){
  const frame=reduced?0:Math.floor(s.time*4+h.x)%4;
  c.drawImage(art['thorn-spikes'],frame*256,0,256,256,h.x-3,h.y-8,h.w+6,h.h+13);
 }
 for(const q of s.stars)if(!outside&&!q.taken&&!q.hidden){
  if(q.value===10){
   const pulse=reduced?1:1+Math.sin(s.time*2.5+q.x)*.06,size=52*pulse,img=art['treasure-star'];
   c.save();c.shadowColor='#ffe191';c.shadowBlur=reduced?10:18;c.drawImage(img,q.x-size/2,q.y-size/2,size,size);c.restore();
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3+(reduced?0:s.time*.8);star(c,q.x+Math.cos(a)*32,q.y+Math.sin(a)*32,3.5,'#fff4b1');}
   c.save();c.textAlign='center';c.font='bold 12px Georgia';c.lineWidth=3;c.strokeStyle='#56304b';c.strokeText('10',q.x,q.y+39);c.fillStyle='#fff1b6';c.fillText('10',q.x,q.y+39);c.restore();
  }else sprite(c,art['collectible-star'],reduced?0:Math.floor(s.time*7+q.x)%4,q.x,q.y,30,false,true);
 }
 for(const q of s.cages){
  if(q.carried||q.lost)continue;
  if(q.carrier!==undefined){
   if(!q.rescued){if(!q.falling)shadow(c,q.x,q.y,16,.13);sprite(c,art.bunny,q.falling?9:8,q.x,q.y,48);}
   continue;
  }
  shadow(c,q.x,q.y,30);
  // The illustrated captive, back bars, floor and front bars form one depth-
  // consistent drawing. Never place a second bunny behind the whole cage.
  sprite(c,art['rescue-cage'],q.rescued?3:q.open?2:q.hp===1?1:0,q.x,q.y,108);
 }
 for(const q of s.pickups)if(!q.taken){
  const bob=reduced||q.floor!==undefined?0:Math.sin(s.time*3+q.x)*3,type=q.type||'drink';shadow(c,q.x,q.floor!==undefined?q.floor+28:q.y+29,16,.16);
  c.save();c.shadowColor=DRINKS[q.kind]?.color||'#c7f0ff';c.shadowBlur=q.boosted?24:13;
  if(type==='drink'){
   if(q.boosted){const glow=c.createRadialGradient(q.x,q.y,5,q.x,q.y,55);glow.addColorStop(0,'#fff5b8b0');glow.addColorStop(1,'#ffe99300');c.fillStyle=glow;c.fillRect(q.x-55,q.y-55,110,110);}
   const scale=q.boosted?1.3:1;c.drawImage(art['drink'+q.kind],q.x-16*scale,q.y-27*scale+bob,32*scale,54*scale);
  }
  else if(type==='shield'){const charges=shieldCharges(s,q),frame=charges===3?0:charges===2?4:6;sprite(c,art['bunny-shield'],frame+(reduced?0:Math.floor(s.time*5)%2),q.x,q.y,72,false,true);for(let i=0;i<charges;i++)sprite(c,art['collectible-star'],0,q.x+(i-(charges-1)/2)*14,q.y,16,false,true);}
  else sprite(c,art['loot-items'],type==='original'?(reduced?0:Math.floor(s.time*5)%4):6+(reduced?0:Math.floor(s.time*4)%2),q.x,q.y,62,false,true);
  c.restore();sprite(c,art['collectible-star'],reduced?0:Math.floor(s.time*5)%4,q.x,q.y-38+bob,18,false,true);
  if(q.boosted)for(let i=0;i<3;i++){const angle=i*Math.PI*2/3+(reduced?0:s.time*1.6);sprite(c,art['collectible-star'],0,q.x+Math.cos(angle)*31,q.y+Math.sin(angle)*38,18,false,true);}
 }
 for(const cp of outside?[]:s.level.checkpoints||[s.level.checkpoint]){
  const active=s.checkpointAt&&cp[0]<=s.checkpointAt[0];c.save();if(!active)c.filter='saturate(.4) brightness(.8)';
  sprite(c,art['victory-flag'],reduced||!active?0:Math.floor(s.time*7)%4,cp[0]+23,cp[1],96);c.restore();
 }
 for(const e of s.enemies){
  if(e.type===6||e.type===7&&!e.flightActive)continue;
  if(Math.abs(e.x-s.camera.x-view.width/2)>view.width/2+200)continue;
  const {size,w,h}=enemyGeometry(e);
  shadow(c,e.x,e.type===2?e.baseY+120:e.type===7?groundY(s.platforms,e.x):e.baseY,w*.55,e.type===7?.06*(e.landed?e.deadTime/ZEPPELIN_DUST_DURATION:1):.15);
  c.save();if(e.hp<=0&&!e.landed)c.globalAlpha=Math.min(1,e.deadTime*3);
  if(e.emerging>0)c.globalAlpha=Math.max(.2,1-e.emerging/.8);
  if((e.flash>0&&(reduced||Math.floor(e.flash*25)%2===0))||([7,8].includes(e.type)?e.hp<=0&&(e.deathAge||0)<.12:e.deadTime>.47))c.filter='brightness(2.8) saturate(.15)';
  const drawing=enemyDrawing(e,reduced);
  if(e.type===7)drawZeppelin(c,e,art,reduced);else sprite(c,art[drawing.key],drawing.frame,e.x,e.y,size,e.dir>0);c.restore();
  if(e.trap){const frame=reduced?0:Math.floor(s.time*7)%4,bw=Math.max(w*1.65,h*1.35),bh=h*1.35;c.save();c.globalAlpha=.65;c.drawImage(art['trap-bubble'],frame*256,0,256,256,e.x-bw/2,e.y-h/2-bh/2,bw,bh);c.restore();}
  if(e.snare>0){sprite(c,art['special-kiwi'],reduced?8:8+Math.floor(s.time*10)%4,e.x,e.y-8,42,false,true);}
 }
 const b=s.boss;
 if(s.index===1&&b.phase!=='sleep')drawOrgan(c,s,art,reduced);
 if(b.phase!=='sleep'&&(b.hp>0||b.defeat||(b.deadTime||0)<1.8)){
  if(!b.shattered&&s.index!==2)shadow(c,b.x,s.level.arena.y,s.index===0?85:40,.22,s.ringPerspective);
  c.save();if(b.hp<=0&&!b.defeat)c.globalAlpha=Math.max(0,1-(b.deadTime||0)/1.8);
  c.filter=bossHitFilter(b,reduced);
  const drawing=bossDrawing(s,reduced);
  if(s.index===3)drawHarlequin(c,s,art,reduced);
  else if(s.index!==1&&s.index!==2)sprite(c,art[drawing.key],drawing.frame,b.x,b.y,s.index===0?BALLOON_SIZE:164,s.index===0?false:b.dir>0);
  if(s.index===0)drawBalloonDetails(c,s,art,reduced);
  if(s.index===0&&!b.defeat){
   const crew=balloonCrewDrawing(s,reduced);
   for(const q of crew)sprite(c,art[q.key],q.frame,q.x,q.y,q.size,q.dir>0);
   // Redraw the identical front rim over the crew's legs. Their head, hands
   // and attached props remain above it until the actual leap clears it.
   c.save();c.beginPath();c.rect(b.x-BALLOON_SIZE/2,b.y+BALLOON_RIM_Y,BALLOON_SIZE,-BALLOON_RIM_Y+12);c.clip();sprite(c,art[drawing.key],drawing.frame,b.x,b.y,BALLOON_SIZE);c.restore();
   for(const q of crew)if(q.held)sprite(c,art['circus-projectiles'],q.held.frame,q.held.x,q.held.y,q.held.size,false,true);
  }
  c.restore();
 }
 // A leaping clown crosses in front of the basket instead of disappearing
 // behind the balloon artwork during the first half of its jump.
 for(const e of s.enemies)if(e.type===6){const drawing=enemyDrawing(e,reduced);sprite(c,art[drawing.key],drawing.frame,e.x,e.y,enemyGeometry(e).size,e.dir>0);}
 if(s.clear&&s.clear.age>.5){const q=s.clear,drop=Math.max(0,1-(q.age-.5)/.7)*22;sprite(c,art['victory-flag'],reduced?0:Math.floor(s.fxTime*7)%4,q.flagX,q.flagY-drop,125);}
 for(const q of s.shots){
  if(q.super){
   const angle=Math.atan2(q.vy,q.vx),size=230;
   sprite(c,art['super-star'],4+(reduced?1:Math.floor(q.age*13)%4),q.x-Math.cos(angle)*55,q.y-Math.sin(angle)*55,size,false,true,angle);
  }else if(q.heavy){
   const spec=spellFor(q.kind),frame=q.burst?4+Math.min(3,Math.floor((q.age-q.burstAt)*16)):effectFrame(0,q.age,reduced);
   const size=(q.kind===3?(q.burst?220:spec.size*Math.min(1,.4+q.age*4)):spec.size)*(q.scale||1);
   sprite(c,art[specialArt(q.kind)],frame,q.x,q.y,size,false,true,[-1,0,4].includes(q.kind)?Math.atan2(q.vy,q.vx):0);
  }else{const size=(q.kind===3?64:q.kind===1?58:q.kind===0?44:34)*(q.scale||1),rotation=q.kind===1?q.age*15:q.kind===3?0:Math.atan2(q.vy,q.vx);sprite(c,art.magic,effectFrame(MAGIC_ROWS[q.kind],q.age,reduced),q.x,q.y,size,false,true,rotation);}
  if(q.captured?.length){
   for(const [i,h]of q.captured.entries()){const a=i*2.4+q.age*2,x=q.x+Math.cos(a)*q.r*.3,y=q.y+Math.sin(a)*q.r*.3;
    if(h.kind==='juggle')sprite(c,art['juggler-balls'],h.color*4+Math.floor(q.age*8)%4,x,y,16,false,true);
    else sprite(c,h.kind==='ball'||h.kind==='bomb'?art['circus-projectiles']:art.hostile,h.kind==='ball'?0:h.kind==='bomb'?2:effectFrame(HOSTILE_ROWS[h.kind]??0,q.age,reduced),x,y,17,false,true);
   }
  }
 }
 for(const q of s.hostile){
  if(q.life<=0||q.rain==='wait')continue;
  if(q.harlequin){drawHarlequinProjectile(c,q,art,reduced);continue;}
  if(q.barge||q.kind==='diver-hoop'){drawBargeProjectile(c,q,art,reduced);continue;}
  if(q.kind==='red-pellet'){drawRedPellet(c,q);continue;}
  if(q.kind==='sound-wave'){drawOrganWave(c,q,art,reduced);continue;}
  if(q.organ&&q.kind==='note'&&q.voice==='red'){drawOrganRedNote(c,q,art,reduced);continue;}
  if(q.rain==='fall'){c.save();c.globalAlpha=.35;c.strokeStyle='#ffe9a0';c.lineWidth=2;c.beginPath();c.ellipse(q.x,q.floor-2,18,5,0,0,Math.PI*2);c.stroke();c.restore();}
  if(q.kind==='juggle'){sprite(c,art['juggler-balls'],q.color*4+(reduced?0:Math.floor(q.age*10)%4),q.x,q.y,q.r*2.15,false,true);continue;}
  const circus=q.kind==='ball'||q.kind==='bomb',clown=q.kind==='clown';
  const size=q.drawSize||(clown?112:q.kind==='streamer'?48:q.kind==='wave'?52:q.kind==='bomb'?48:q.r*2.6);
  const rotation=clown?Math.atan2(q.vy,Math.abs(q.vx))*(q.vx<0?-1:1):q.kind==='streamer'?Math.atan2(q.vy,q.vx):q.kind==='ball'?q.age*5:0;
  const frame=circus?(q.kind==='bomb'?2:0)+(reduced?0:Math.floor(q.age*8)%2):effectFrame(clown?0:HOSTILE_ROWS[q.kind]??0,q.age,reduced);
  c.save();if(q.carpetFire)c.globalAlpha=Math.min(1,q.life/.14);
  sprite(c,circus?art['circus-projectiles']:clown?art['cannon-clown']:art.hostile,frame,q.x,q.y,size,clown&&q.vx<0,true,rotation);c.restore();
 }
 drawOrganDebris(c,s,art,reduced);
 if(!s.powerClash)superBackdrop(c,s,art,reduced);
 const p=s.player,shadowFloor=s.platforms.find(q=>p.x>=q.x&&p.x<=q.x+q.w&&surfaceY(q,p.x)>=p.y);
 paintOriginalTrail(c,s,reduced);
 if(s.overdrive>0&&!p.drinkCast){c.save();const aura=c.createRadialGradient(p.x,p.y-43,12,p.x,p.y-43,83);aura.addColorStop(0,'#fff9be66');aura.addColorStop(.55,'#ffd78d40');aura.addColorStop(1,'#ec97ff00');c.fillStyle=aura;c.fillRect(p.x-85,p.y-128,170,170);c.restore();}
 shadow(c,p.x,p.ground!==null?p.y:shadowFloor?surfaceY(shadowFloor,p.x):p.y,24,p.ground!==null?.22:.1,s.ringPerspective);
 c.save();if(p.hurt&&!s.playerDefeat&&!s.superCinematic&&!s.clear&&!b.defeat&&Math.floor(s.time*12)%2&&!reduced)c.globalAlpha=.4;
 const pose=hexyPose(s);
 if(s.overdrive>0){c.shadowColor='#fff4af';c.shadowBlur=reduced?10:20+Math.sin(s.time*8)*4;c.filter=reduced?'brightness(1.16) saturate(1.25)':`hue-rotate(${s.time*160%360}deg) brightness(${1.14+Math.sin(s.time*Math.PI*3)*.09}) saturate(1.35)`;}
 if(p.charge>0){
  const amount=p.charge/SUPER_WINDUP;
  sprite(c,art['super-star'],Math.min(3,Math.floor(amount*4)),p.x,p.y-45,125+amount*28,false,true);
  c.shadowColor='#ffe9a0';c.shadowBlur=6+amount*15;c.filter='brightness('+(1+amount*.3)+')';
 }
 if(p.dash>0&&!reduced){c.globalAlpha=.13;hexy(c,art,pose,p.x-p.dashDir*30,p.y,p.dir<0);c.globalAlpha=.23;hexy(c,art,pose,p.x-p.dashDir*15,p.y,p.dir<0);c.globalAlpha=1;}
 if(s.circusEntry&&!s.circusEntry.inside){
  const progress=circusEntryFigure(s);c.globalAlpha*=1-progress;
  c.translate(p.x,p.y-progress*12);c.scale(1-progress*.15,1-progress*.15);hexy(c,art,pose,0,0,false);
 }else if(s.shopTransition&&['shop-enter','shop-exit'].includes(pose.sheet)){
  const q=s.shopTransition,progress=q.leaving?Math.max(0,1-q.age/.75):Math.max(0,Math.min(1,(q.age-q.walk-.4)/.6));
  c.globalAlpha*=1-progress*.85;c.translate(p.x+progress*12,p.y-progress*20);c.scale(1-progress*.12,1-progress*.12);hexy(c,art,pose,0,0,false);
 }else hexy(c,art,pose,p.x,p.y,p.dir<0);c.restore();
 if(s.overdrive>0&&!p.drinkCast)for(let i=0;i<6;i++){const a=i*Math.PI/3+(reduced?0:s.time*2);c.save();c.globalAlpha=.75;sprite(c,art['collectible-star'],0,p.x+Math.cos(a)*55,p.y-43+Math.sin(a)*46,i%2?13:20,false,true);c.restore();}
 if(!s.powerClash)superBeam(c,s,art,reduced);
 drawPowerWorld(c,s,art,reduced);
 if(p.charge>0){const tip=hexyMuzzle(s);drawWandGlow(c,tip.x,tip.y,.65,16+Math.min(1,p.charge/SUPER_WINDUP)*14);
  // Automatic anticipation: R has already committed the spell.
  c.beginPath();c.strokeStyle=p.charge>=SUPER_WINDUP?'#fff1a4':'#d3a8fa';c.lineWidth=2;c.arc(tip.x,tip.y,18,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,p.charge/SUPER_WINDUP));c.stroke();
 }
 if((p.cast>0||p.specialCast>0)&&p.dash<=0){const tip=hexyMuzzle(s),strength=Math.min(1,Math.max(p.cast/.24,p.specialCast/.32));drawWandGlow(c,tip.x,tip.y,strength*.85,reduced?12:12+strength*7);}
 if(s.shield||s.shieldBreak>0){
  const frame=s.shieldBreak>0?8+Math.min(3,Math.floor((.4-s.shieldBreak)*10)):s.shield===3?(reduced?0:Math.floor(s.time*7)%4):4+(s.shield===2?0:2)+(reduced?0:Math.floor(s.time*6)%2);
  c.save();c.globalAlpha=s.shieldHit>0?.85:.68;sprite(c,art['bunny-shield'],frame,p.x,p.y-43,116,false,true);c.restore();
 }
 if(p.guarding||p.guardBreak>0){
  const frame=p.guardBreak>0?8+Math.min(3,Math.floor((.4-p.guardBreak)*10)):p.guardHit>0?4+Math.min(3,Math.floor((.22-p.guardHit)*18)):reduced?2:1+Math.floor(s.time*6)%3;
  c.save();c.globalAlpha=p.guardHit>0?.82:.58;sprite(c,art['music-guard'],frame,p.x+p.dir*48,p.y-43,115,p.dir<0,true);c.restore();
 }
 for(let i=0;i<s.rescued;i++){
  const pet=buddyPosition(s,i),frame=buddyFrame(s,i);
  let drawing=frame===null?art.bunny:art['bunny-cast'],pose=frame===null?(Math.abs(p.vx)>20?Math.floor(s.time*9+i)%4:8):frame;
  const roll=buddyRollFrame(s);
  if(roll!==null){drawing=art['bunny-roll'];pose=roll;}
  else if(p.crouch){drawing=art['bunny-movement'];pose=4+(Math.abs(p.vx)>20?Math.floor(p.stride*8+i)%4:0);}
  else if(p.ground===null){drawing=art['bunny-movement'];pose=frame===null?(p.vy< -200?1:p.vy<100?2:3):8+Math.min(3,Math.floor(frame/3));}
  else if(p.land>0){drawing=art['bunny-movement'];pose=3;}
  if(p.ground!==null)shadow(c,pet.x,pet.y,12,.13);
  sprite(c,drawing,pose,pet.x,pet.y-2,40,p.dir<0);
 }
 for(const q of s.effects)if(q.fireBurst)drawFireImpact(c,art,q,reduced);else if(q.cinematicSmoke)drawCinematicSmoke(c,art,q);else if(q.clashDust)drawClashDust(c,art,q);else if(q.harlequin)drawHarlequinFX(c,art,2,Math.min(3,Math.floor(q.age/.14)),q.x,q.y,q.size);else if(q.bargeSplash)drawHarborFX(c,art,2,Math.min(3,Math.floor(q.age/.12)),q.x,q.y,q.size,q.size*.72);else if(!q.defense)sprite(c,q.armor?art['armor-ricochet']:q.super?art['super-star']:q.spell!==undefined?art[specialArt(q.spell)]:q.dragon?art.dragon:art.impacts,(q.armor?0:q.super?8:q.spell!==undefined||q.dragon?4:q.row*4)+Math.min(3,Math.floor(q.age/.08)),q.x,q.y,q.size,false,true);
 for(const q of s.particles){c.globalAlpha=Math.min(1,q.life*3);sprite(c,art['collectible-star'],0,q.x,q.y,11,false,true);}c.globalAlpha=1;c.restore();
 c.restore();
 drawClashScreenFlash(c,s,reduced);
 drawInfernoForeground(c,s,art,reduced);
 if(b.phase!=='sleep'&&b.hp>0){
  if(b.phase==='intro'&&s.index<=3){c.save();c.globalAlpha=Math.min(1,Math.max(0,(b.arrival?.age||0)-1.8));c.textAlign='center';c.font='bold 22px sans-serif';c.lineWidth=5;c.strokeStyle='#382440';c.fillStyle='#fff0c7';c.strokeText(s.level.bossName[en?1:0],480,120);c.fillText(s.level.bossName[en?1:0],480,120);c.restore();}
  else if(b.phase==='intro'){round(c,180,150,600,120,22,'#382440ed','#f2c187');c.textAlign='center';c.fillStyle='#ffdd97';c.font='bold 19px sans-serif';c.fillText(en?'THE NEXT ACT…':'EL SIGUIENTE NÚMERO…',480,186);c.fillStyle='#fff0c7';c.font='bold 28px sans-serif';c.fillText(s.level.bossName[en?1:0],480,227);}
 }
 if(s.index===3)drawHarlequinMeter(c,s,art,en);
 paintOriginalScreen(c,s,art,reduced);
 const cutin=drawSuperCutin(c,s,art,reduced,en);
 if(!s.powerClash)superCaption(c,s,en,cutin);
 drawHarlequinCutin(c,s,art,reduced,en);drawClashMeter(c,s,art,en,reduced);
 drawClashPortraits(c,s,art,reduced);
 c.strokeStyle='#fff0c133';c.lineWidth=2;c.strokeRect(6,6,W-12,H-12);
 if(s.shopTransition?.alpha>0){c.save();c.globalAlpha=s.shopTransition.alpha;c.fillStyle='#000';c.fillRect(0,0,W,H);c.restore();}
 drawCircusTransition(c,s);
}
