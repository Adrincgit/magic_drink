import {fortWindows,fortWindowFrame} from '../actors/bosses/adventureFortWindows';
import {groundY} from '../world/adventureTerrain';
import {RIVER_TREE_ART} from '../world/riverTreeArt';
import {emberVistaAt,emberForestPlacement,emberValleyPlacement,emberSceneryTrees} from './emberComposition';
import {forestRootCover} from './emberSurfaceCanvas';
import {fortRig,fortSystems} from '../actors/bosses/adventureEmberFort';
import {emberBurnAt,EMBER_BRANCH_ART} from '../world/adventureEmberTrail';
import {painted,paintedParticle,energyGlow} from './paintedDuelCanvas';
const JET_TIPS=[[36,142],[23,141],[17,140],[14,141],[20,136],[21,136],[17,137],[15,137],[21,134],[21,135],[17,135],[16,135],[20,132],[21,133],[19,132],[16,133]];
const forestBands=new WeakMap();
function forestBand(img){
 let band=forestBands.get(img);if(band)return band;
 band=document.createElement('canvas');band.width=img.width;band.height=img.height;const g=band.getContext('2d');g.drawImage(img,0,0);
 // An overlapping painted edge avoids both hard joins and mirrored trees.
 const fade=g.createLinearGradient(0,0,band.width*100/1320,0);fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000');
 g.globalCompositeOperation='destination-in';g.fillStyle=fade;g.fillRect(0,0,band.width,band.height);forestBands.set(img,band);return band;
}
export function drawEmberBackdrop(c,s,art){
 if(s.fortInside){const img=art['ember-interior'],p=emberBackdropPlacement(s,img);c.drawImage(img,p.x,p.y,p.w,p.h);return;}
 const valley=emberValleyPlacement(s,art.world5),p=emberForestPlacement(s,art['forest-canopy-healthy']);
 c.drawImage(art.world5,valley.x,valley.y,valley.w,valley.h);
 const burn=emberBurnAt(s.player.x),vista=emberVistaAt(s.player.x);
 c.save();
 // Distant trunks keep the panorama's authored scale. An opening in the
 // canopy reveals the valley on the ridge, independent of camera height.
 for(let i=-1;i<2;i++){
  const x=p.x+i*p.step;if(x+p.w<0||x>960)continue;
  c.save();c.translate(x,p.y);
  c.globalAlpha=1-vista;c.drawImage(forestBand(art['forest-canopy-healthy']),0,0,p.w,p.h);
  c.globalAlpha=(1-vista)*burn;c.drawImage(forestBand(art['forest-canopy-burned']),0,0,p.w,p.h);c.restore();
 }
 c.restore();
}
export function emberBackdropPlacement(s,img){
 if(!s.fortInside)return emberForestPlacement(s,img);
 const h=570,w=h*img.width/img.height,x=-((s.camera.x-s.level.fortDoor.insideX)*.12%Math.max(1,w-960));
 return{x,y:-30,w,h};
}
export function drawEmberScenery(c,s,art){
 if(s.fortInside)return;
 const width=960/(s.camera.zoom||1);
 // Roots belong to the route; the panoramic forest recedes behind them.
 for(const {x,i,h}of emberSceneryTrees(s.level)){
  if(x<s.camera.x-260||x>s.camera.x+width+270)continue;
  const green=((i*37)%101)/100>=emberBurnAt(x),key=green&&x<7500&&i%3!==2?'river-tree-oak':'forest-tree-'+(green?(x<5000?2:i%3):4+i%4),img=art[key];
  const w=h*img.width/img.height,y=Math.max(...[-.36,0,.36].map(d=>groundY(s.level.route,x+w*d)));
  c.save();c.translate(x,y+13);if(i%2)c.scale(-1,1);c.drawImage(img,-w*(RIVER_TREE_ART[key]?.rootX??.5),-h*.977,w,h);c.restore();
  // Low painted grass hides the root tips inside the soil at the same world
  // coordinate; it never moves at a different parallax speed from the tree.
  const strip=art['forest-understory-'+(green?0:1)],gw=w*.9,gh=gw*strip.height/(strip.width/3);
  const slope=(groundY(s.level.route,x+gw/2)-groundY(s.level.route,x-gw/2))/gw;
  c.save();c.translate(x,groundY(s.level.route,x)+15);c.transform(1,slope,0,1,0,0);
  c.drawImage(forestRootCover(strip,i%3),-gw/2,-gh,gw,gh);c.restore();
 }
 for(const q of s.level.branchTrees){
  if(q.x+q.size/2<s.camera.x||q.x-q.size/2>s.camera.x+width)continue;
  c.drawImage(art['forest-branch-tree'],q.x-q.size*EMBER_BRANCH_ART.rootX,q.y-q.size*EMBER_BRANCH_ART.rootY,q.size,q.size);
 }
 const door=s.level.fortDoor,img=art['grand-ring-exterior'],w=door.width,h=w*img.height/img.width;
 if(door.x+w/2>s.camera.x&&door.x-w/2<s.camera.x+width)c.drawImage(img,door.x-w/2,door.floor-h*930/1024,w,h);
}
export function drawEmberFort(c,s,art,reduced=false){
 const b=s.boss;if(s.fortInside||b.x+390<s.camera.x||b.x-390>s.camera.x+960/(s.camera.zoom||1))return;
 const img=art['ember-fort'],parts=fortSystems(s),rig=fortRig(s),k=720/1536,dead=b.defeat;
 c.save();
 if(dead){c.filter='saturate(.25) brightness(.56)';c.translate(0,Math.min(32,dead.age*14));}
 c.drawImage(img,b.x-360,b.y-950*k,720,1024*k);
 for(const q of fortWindows(s)){
  const sheet=art['ember-fort-windows'],frame=dead?7:fortWindowFrame(q),size=64;
  c.save();c.translate(q.x,q.y);c.scale(-q.dir,1);
  c.beginPath();c.arc(0,0,26.5,0,Math.PI*2);c.clip();
  if(q.flash>0)c.filter='brightness(1.9) saturate(.5)';
  c.drawImage(sheet,frame%4*256,Math.floor(frame/4)*256,256,256,-size/2,-size/2,size,size);c.restore();
  if(q.phase==='aim'&&q.age>.4&&q.hp>0&&!dead)energyGlow(c,true,q.x+q.dir*24,q.y+7,30,.25+q.age*.4);
 }
 // Separate transparent mechanism: damage light follows its painted silhouette.
 const mechanisms=art['ember-mechanisms'],cw=mechanisms.width/4,ch=mechanisms.height/2;
 const opening=b.phase==='transform'?Math.min(2,Math.floor((2.3-b.timer)/.65)):2+(Math.floor(s.fxTime*5)%2);
 c.save();if(parts.core.flash>0)c.filter='brightness(1.8) saturate(.55)';
 c.drawImage(mechanisms,opening*cw,0,cw,ch,rig.core.x-89,rig.core.y-100,178,200);c.restore();
 const hatchFrame=b.hatchOpen>0?Math.min(3,Math.floor(Math.min(4.8-b.hatchOpen,b.hatchOpen)*5)):0;
 c.drawImage(mechanisms,hatchFrame*cw,ch,cw,ch,rig.hatch.x-75,rig.hatch.y-137,150,150);
 for(const key of ['upper','lower']){
  const q=parts[key],m=rig[key];
  if(q.hp<=0){painted(c,art,'fire-show',Math.floor(s.fxTime*12)%8,m.x,m.y-15,95,70,0,dead?.35:.6);continue;}
  const recoil=b.release>0&&b.firedPort===key?Math.sin(b.release/.23*Math.PI)*9:0;
  const angle=b.gunAngles?.[key]||0;
  c.save();if(q.flash>0)c.filter='brightness(2.1) saturate(.25)';c.translate(m.x+Math.cos(angle)*recoil,m.y+Math.sin(angle)*recoil);c.rotate(angle);
  c.drawImage(art['barge-cannon'],-78,-48,156,96);c.restore();
  const mx=m.x-Math.cos(angle)*75,my=m.y-Math.sin(angle)*75;
  if(b.phase==='warn'&&b.move==='salvo'){energyGlow(c,true,mx,my,48,.45+Math.sin(s.fxTime*19)*.1);paintedParticle(c,art,3,s.fxTime,mx,my,14,angle,.9);}
  if(b.release>0&&b.firedPort===key){energyGlow(c,true,mx,my,120,.9);painted(c,art,'fire-show',Math.floor((.23-b.release)*30)%8,mx,my,145,98,Math.PI+angle);}
 }
 for(const dir of [-1,1]){
  const x=b.x+dir*145,y=b.y-68,deploy=b.move==='vent'&&['warn','attack'].includes(b.phase);
  if(deploy&&!dead){c.save();c.translate(x,y);c.scale(-dir,1);c.drawImage(art['barge-nozzle'],-42,-30,84,60);c.restore();energyGlow(c,true,x+dir*30,y,b.phase==='warn'?50:110,b.phase==='warn'?.6:.9);}
 }
 energyGlow(c,true,rig.core.x,rig.core.y,95,dead?0:.45+Math.sin(s.fxTime*6)*.12);
 // Animated crews keep tending their cannons; their hands and tools are in each frame.
 for(const [i,key]of ['upper','lower'].entries()){
  const m=rig[key],broken=parts[key].hp<=0,frame=(broken?12:b.phase==='warn'?4:0)+(reduced?0:Math.floor(s.fxTime*6+i)%4),size=120;
  if(dead||broken)continue;
  c.drawImage(art['barge-gunner'],frame%4*256,Math.floor(frame/4)*256,256,256,m.x+89-size*.61,m.y-10-size*250/256,size,size);
 }
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
  c.save();c.translate(q.x,q.y);c.scale(q.dir,1);c.globalAlpha=Math.min(1,q.life/.22);
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
  const label=b.phase==='transform'?(en?'THE FURNACE AWAKENS':'EL HORNO SE DESATA'):b.move==='vent'&&b.phase==='warn'?(en?'FLAMETHROWERS HEATING':'LOS LANZALLAMAS SE ENCIENDEN'):b.coreOpened?(en?'STRIKE THE HEART · DODGE THE FLAMES':'GOLPEA EL NÚCLEO · ESQUIVA LAS LLAMAS'):(en?'REACH THE HEART · CANNONS ARE OPTIONAL':'ACÉRCATE AL NÚCLEO · CAÑONES OPCIONALES');
  c.save();c.textAlign='center';c.font='bold 16px Nunito, sans-serif';c.shadowColor='#170b11';c.shadowBlur=5;c.fillStyle='#ffe4a4';c.fillText(label,480,92);c.restore();
 }
 if(!s.fortFade)return;c.save();c.globalAlpha=s.fortFade;c.fillStyle='#110e1b';c.fillRect(0,0,960,540);c.restore();
}
