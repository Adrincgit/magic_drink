import {drawWindCloth,FORT_FLAGS} from './windClothCanvas';
import {drawFortVents} from './fortWeaponsCanvas';
import {fortWindows,fortWindowFrame} from '../actors/bosses/adventureFortWindows';
import {groundY} from '../world/adventureTerrain';
import {RIVER_TREE_ART} from '../world/riverTreeArt';
import {emberForestEdges,woodlandCoverage,emberForestPlacement,emberValleyPlacement,emberSceneryTrees} from './emberComposition';
import {paintWoodlandBush} from './emberWoodlandLayers';
import {fortRig,fortSystems} from '../actors/bosses/adventureEmberFort';
import {FORT_SCALE,FORT_WIDTH} from '../actors/bosses/fortGeometry';
import {emberBurnAt,EMBER_BRANCH_ART} from '../world/adventureEmberTrail';
import {painted,paintedParticle,energyGlow} from './paintedDuelCanvas';
import {drawSiegeCannon} from './siegeCannonCanvas';
const JET_TIPS=[[36,142],[23,141],[17,140],[14,141],[20,136],[21,136],[17,137],[15,137],[21,134],[21,135],[17,135],[16,135],[20,132],[21,133],[19,132],[16,133]];
const forestBands=new WeakMap();
let forestScreen;
function forestBand(img){
 let band=forestBands.get(img);if(band)return band;
 band=document.createElement('canvas');band.width=img.width;band.height=img.height;const g=band.getContext('2d');g.drawImage(img,0,0);
 // An overlapping painted edge avoids both hard joins and mirrored trees.
 const fade=g.createLinearGradient(0,0,band.width*100/1320,0);fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000');
 g.globalCompositeOperation='destination-in';g.fillStyle=fade;g.fillRect(0,0,band.width,band.height);forestBands.set(img,band);return band;
}
export function drawEmberBackdrop(c,s,art){
 const valley=emberValleyPlacement(s,art.world5),p=emberForestPlacement(s,art['forest-canopy-healthy']);
 c.drawImage(art.world5,valley.x,valley.y,valley.w,valley.h);
 const burn=emberBurnAt(s.player.x);
 if(!forestScreen){forestScreen=document.createElement('canvas');forestScreen.width=960;forestScreen.height=540;}
 const g=forestScreen.getContext('2d');g.clearRect(0,0,960,540);
 // The canopy has a geographical edge. We uncover the valley from the
 // side as the last stand passes, without fading the entire landscape.
 for(let i=-1;i<2;i++){
  const x=p.x+i*p.step;if(x+p.w<0||x>960)continue;
  g.save();g.translate(x,p.y);
  g.drawImage(forestBand(art['forest-canopy-healthy']),0,0,p.w,p.h);
  g.globalAlpha=burn;g.drawImage(forestBand(art['forest-canopy-burned']),0,0,p.w,p.h);g.restore();
 }
 const edge=emberForestEdges(s),mask=g.createLinearGradient(0,0,960,0);
 const stops=[0,960,edge.exit-28,edge.exit,edge.exit+28,edge.entry-28,edge.entry,edge.entry+28].filter(x=>x>=0&&x<=960).sort((a,b)=>a-b);
 for(const x of stops)mask.addColorStop(x/960,`rgba(0,0,0,${woodlandCoverage(s,x)})`);
 g.save();g.globalCompositeOperation='destination-in';g.fillStyle=mask;g.fillRect(0,0,960,540);g.restore();c.drawImage(forestScreen,0,0);
}
export function emberBackdropPlacement(s,img){
 return emberForestPlacement(s,img);
}
export function drawEmberScenery(c,s,art){
 if(s.fortInside)return;
 const width=960/(s.camera.zoom||1);
 // Roots belong to the route; the panoramic forest recedes behind them.
 for(const {x,i,h}of emberSceneryTrees(s.level)){
  if(x<s.camera.x-260||x>s.camera.x+width+270)continue;
  const green=((i*37)%101)/100>=emberBurnAt(x),key=green&&x<7500&&i%3!==2?'river-tree-oak':'forest-tree-'+(green?(x<5000?2:i%3):4+i%4),img=art[key];
  const w=h*img.width/img.height,y=groundY(s.level.route,x)-50;
  c.save();c.translate(x,y+8);if(i%2)c.scale(-1,1);c.drawImage(img,-w*(RIVER_TREE_ART[key]?.rootX??.5),-h*.977,w,h);c.restore();
  // Low painted grass hides the root tips inside the soil at the same world
  // coordinate; it never moves at a different parallax speed from the tree.
  const gw=w*1.03;
  const slope=(groundY(s.level.route,x+gw/2)-groundY(s.level.route,x-gw/2))/gw;
  c.save();c.translate(x,groundY(s.level.route,x)-24);c.transform(1,slope,0,1,0,0);
  paintWoodlandBush(c,art,0,0,gw,i%3,emberBurnAt(x));c.restore();
 }
 for(const q of s.level.branchTrees){
  if(q.x+q.size/2<s.camera.x||q.x-q.size/2>s.camera.x+width)continue;
  c.drawImage(art['forest-branch-tree'],q.x-q.size*EMBER_BRANCH_ART.rootX,q.y-q.size*EMBER_BRANCH_ART.rootY,q.size,q.size);
 }
}
export function drawEmberFort(c,s,art,reduced=false){
 const b=s.boss;if(s.fortInside||b.x+650<s.camera.x||b.x-650>s.camera.x+960/(s.camera.zoom||1))return;
 const img=art['ember-fort'],parts=fortSystems(s),rig=fortRig(s),k=FORT_WIDTH/1536,dead=b.defeat;
 c.save();
 if(dead){
  const sheet=art['fort-collapse'],cw=sheet.width/2,ch=sheet.height/2,frame=Math.min(3,Math.floor(dead.age/1.05));
  c.drawImage(sheet,frame%2*cw,Math.floor(frame/2)*ch,cw,ch,b.x-FORT_WIDTH/2,b.y-740,FORT_WIDTH,780);c.restore();return;
 }
 drawWindCloth(c,img,b.x-FORT_WIDTH/2,b.y-950*k,FORT_WIDTH,1024*k,s.fxTime,{windArt:art,flags:FORT_FLAGS,cloth:false,reduced});
 for(const q of fortWindows(s)){
  const sheet=art['ember-fort-windows'],frame=fortWindowFrame(q),size=64*FORT_SCALE;
  c.save();c.translate(q.x,q.y);c.scale(-q.dir,1);
  c.beginPath();c.arc(0,0,26.5*FORT_SCALE,0,Math.PI*2);c.clip();
  if(q.flash>0)c.filter='brightness(1.9) saturate(.5)';
  c.drawImage(sheet,frame%4*256,Math.floor(frame/4)*256,256,256,-size/2,-size/2,size,size);c.restore();
  if(q.phase==='aim'&&q.age>.4&&q.hp>0&&!dead)energyGlow(c,true,q.x+q.dir*24*FORT_SCALE,q.y+7*FORT_SCALE,30,.25+q.age*.4);
 }
 // Separate transparent mechanism: damage light follows its painted silhouette.
 const mechanisms=art['ember-mechanisms'],cw=mechanisms.width/4,ch=mechanisms.height/2;
 const opening=parts.gate.hp>0?0:b.phase==='transform'?Math.min(3,Math.floor((2.3-b.timer)/.57)):2+(Math.floor(s.fxTime*5)%2);
 c.save();if(parts.core.flash>0||parts.gate.flash>0)c.filter='brightness(1.8) saturate(.55)';
 if(!b.coreOpened)c.drawImage(mechanisms,opening*cw,0,cw,ch,rig.core.x-135,rig.core.y-150,270,300);c.restore();
 if(parts.gate.hp>0&&parts.gate.hp<parts.gate.maxHp*.5){c.save();c.globalAlpha=.7;painted(c,art,'fire-show',Math.floor(s.fxTime*12)%8,rig.gate.x,rig.gate.y+25,45,70);c.restore();}
 const hatchFrame=b.hatchOpen>0?Math.min(3,Math.floor(Math.min(4.8-b.hatchOpen,b.hatchOpen)*5)):0;
 // Open the large painted entrance already present in the rear facade.
 const door=rig.doorway;
 c.drawImage(art['fort-grand-gate'],hatchFrame*384,0,384,384,door.x,door.y,door.w,door.h);
 for(const key of ['upper','lower']){
  const q=parts[key],m=rig[key];
  if(q.hp<=0){painted(c,art,'fire-show',Math.floor(s.fxTime*12)%8,m.x,m.y-15,95,70,0,dead?.35:.6);continue;}
  const angle=b.gunAngles?.[key]||0;
  c.save();if(q.flash>0)c.filter='brightness(2.1) saturate(.25)';
  drawSiegeCannon(c,art,{x:m.x,y:m.y,width:156*FORT_SCALE,angle,shotAge:b.gunBursts?.[key]??-1,reduced});c.restore();
  const barrel=326/513*156*FORT_SCALE,lip=44/513*156*FORT_SCALE;
  const mx=m.x-Math.cos(angle)*barrel+Math.sin(angle)*lip,my=m.y-Math.sin(angle)*barrel-Math.cos(angle)*lip;
  if(b.phase==='warn'&&b.move==='salvo'){energyGlow(c,true,mx,my,48,.45+Math.sin(s.fxTime*19)*.1);paintedParticle(c,art,3,s.fxTime,mx,my,14,angle,.9);}
 }
 drawFortVents(c,s,art,reduced);
 if(b.coreOpened)energyGlow(c,true,rig.core.x,rig.core.y,130,.45+Math.sin(s.fxTime*6)*.12);
 // Animated crews keep tending their cannons; their hands and tools are in each frame.
 for(const [i,key]of ['upper','lower'].entries()){
  const m=rig[key],broken=parts[key].hp<=0,frame=(broken?12:b.phase==='warn'?4:0)+(reduced?0:Math.floor(s.fxTime*6+i)%4),size=104;
  if(dead||broken)continue;
  c.drawImage(art['barge-gunner'],frame%4*256,Math.floor(frame/4)*256,256,256,m.x+108-size*.61,m.y+48-size*250/256,size,size);
 }
 const wall=art['fort-wall'],wc=wall.width/2,hc=wall.height/2;
 const wf=parts.wall.hp>0?(parts.wall.hp<parts.wall.maxHp*.6?1:0):(b.wallBreakAge||0)<.65?2:3;
 c.save();if(parts.wall.flash>0)c.filter='brightness(1.8)';
 c.drawImage(wall,wf%2*wc,Math.floor(wf/2)*hc,wc,hc,rig.wall.x-162,b.y-305,324,337);c.restore();
 c.restore();
}
export function drawEmberProjectile(c,q,art,reduced=false){
 const img=art['ember-flames'],cw=img.width/4,ch=img.height/2;
 energyGlow(c,true,q.x,q.y,q.kind.includes('breath')?100:(q.drawSize||80)*1.1,.6);
 if(q.kind==='ember-torch'){
  const torch=art['ember-torch'],w=torch.width/4,size=q.drawSize||58;
  c.save();c.translate(q.x,q.y);c.rotate((q.spin||7)*q.age);c.drawImage(torch,(reduced?0:Math.floor(q.age*14)%4)*w,0,w,torch.height,-size/2,-size/2,size,size);c.restore();return;
 }
 if(['ember-breath','fort-breath'].includes(q.kind)){
  const jet=art['ember-jet'],frame=q.age<.38?Math.min(3,Math.floor(q.age/.095)):reduced?6:4+Math.floor((q.age-.38)*24)%12;
  const w=(q.maxRange||320)*1.13,h=w/2;
  c.save();c.translate(q.x,q.y);if(Number.isFinite(q.angle))c.rotate(q.angle);else c.scale(q.dir,1);c.globalAlpha=Math.min(1,q.life/.22);
  // Every painting has a fixed mouth registration and fixed scale. Startup
  // grows through four drawings; the sustained jet curls through twelve.
  const [tipX,tipY]=JET_TIPS[frame];
  c.drawImage(jet,frame%4*512,Math.floor(frame/4)*256,512,256,-w*tipX/512,-h*tipY/256,w,h);
  energyGlow(c,true,w*.5,0,w*.55,.35);c.restore();return;
 }
 const angle=Math.atan2(q.vy,q.vx),age=q.age,size=q.drawSize||96;
 for(let i=5;i>0;i--)paintedParticle(c,art,3,age+i*.1,q.x-q.vx*i*.035,q.y-q.vy*i*.035,17-i*2,angle,.45);
 c.save();c.translate(q.x,q.y);c.rotate(angle);c.drawImage(img,(reduced?1:Math.floor(age*14)%4)*cw,ch,cw,ch,-size*.5,-size*.5,size,size);c.restore();
}
export function drawFortFade(c,s,en=false){
 if(s.level.emberTrail&&s.arenaLocked){
  const b=s.boss;
  const parts=fortSystems(s),label=parts.wall.hp>0?(en?'BREAK THE OUTER WALL':'ROMPE EL MURO EXTERIOR'):parts.gate.hp>0?(en?'BREAK OPEN THE CORE DOOR':'ABRE LA COMPUERTA DEL NÚCLEO'):b.phase==='transform'?(en?'THE CORE IS EXPOSED':'EL NÚCLEO QUEDA EXPUESTO'):(en?'DESTROY THE CORE':'DESTRUYE EL NÚCLEO');
  c.save();c.textAlign='center';c.font='bold 16px Nunito, sans-serif';c.shadowColor='#170b11';c.shadowBlur=5;c.fillStyle='#ffe4a4';c.fillText(label,480,92);c.restore();
 }
 if(!s.fortFade)return;c.save();c.globalAlpha=s.fortFade;c.fillStyle='#110e1b';c.fillRect(0,0,960,540);c.restore();
}
