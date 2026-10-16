import {drawVillageGate} from './villageGateCanvas';
import {pumpkinDrawing} from '../engine/villagePumpkins';
import {villageNight} from '../engine/villageRescue';
import {groundY} from '../world/adventureTerrain';
import {villageVillagerProfile,villageVillagerRunFrame} from '../actors/villageVillagers';
import {drawVillageAbsorption,drawVillageDestruction} from './villageChaosCanvas';
import {drawVillageDust} from './villageDustCanvas';
import {HARVESTER_SIZE} from '../actors/harvesterRegistration';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const cel=(c,img,frame,x,y,size,flip=false)=>{const cell=img.width/4;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(img,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,-size/2,-size*250/256,size,size);c.restore();};
const shelter=(c,img,frame,x,y)=>{c.save();c.translate(x,y);c.scale(1,.7);cel(c,img,frame,0,0,153);c.restore();};
const graded=new WeakMap(),soilBeds=new WeakMap(),countryEdges=new WeakMap();
function grade(img,filter){
 let cache=graded.get(img);if(!cache){cache=new Map();graded.set(img,cache);}if(cache.has(filter))return cache.get(filter);
 const out=document.createElement('canvas');out.width=img.width;out.height=img.height;const c=out.getContext('2d');c.filter=filter;c.drawImage(img,0,0);cache.set(filter,out);return out;
}
function roadTiles(c,img,from,to,y,h,origin=0){
 const w=h*img.width/img.height;
 for(let x=Math.floor(from/w)*w;x<to;x+=w){c.save();c.translate(x-origin,y);if(Math.abs(Math.floor(x/w))%2){c.translate(w,0);c.scale(-1,1);}c.drawImage(img,0,0,w+1,h);c.restore();}
}
export function drawVillageRoad(c,q,art){
 const h=300,slope=((q.yEnd??q.y)-q.y)/q.w,entry=6150,exit=7050;
 c.save();c.translate(q.x,q.y);c.transform(1,slope,0,1,0,0);c.beginPath();c.rect(0,-114,q.w+.5,1000);c.clip();
 // An opaque soil bed follows the irregular painted edge. Even a partially
 // transparent texel in an art file can never reveal another scenery plane.
 let bed=soilBeds.get(art['village-berm-v5']);
 if(!bed){const img=art['village-berm-v5'];bed=document.createElement('canvas');bed.width=512;bed.height=96;const b=bed.getContext('2d');b.fillStyle='#29262b';b.fillRect(0,0,512,96);b.filter='brightness(.72) saturate(.65)';b.drawImage(img,0,img.height*.75,img.width,img.height*.24,0,0,512,96);soilBeds.set(img,bed);}
 c.beginPath();c.moveTo(0,1000);for(let x=0;x<=q.w+12;x+=12){const at=Math.min(q.w+.5,x),worldX=q.x+at;c.lineTo(at,-94+Math.sin(worldX*.11)*2+Math.sin(worldX*.043)*1.4);}c.lineTo(q.w+.5,1000);c.closePath();c.fillStyle=c.createPattern(bed,'repeat');c.fill();
 // Every ground pixel is opaque. The curb separates the rear terrace from the road.
 for(const [img,from,to] of [[art['village-country-road-v5'],q.x,Math.min(entry,q.x+q.w)],[art['village-road-v3'],Math.max(exit,q.x),q.x+q.w]]){
  if(to<=from)continue;c.save();c.beginPath();c.rect(from-q.x,-100,to-from,h);c.clip();roadTiles(c,grade(img,'brightness(.72) saturate(.65)'),from,to,-100,h,q.x);c.restore();
 }if(q.x<exit&&q.x+q.w>entry)c.drawImage(grade(art['village-road-entry-v5'],'brightness(.72) saturate(.65)'),entry-q.x,-100,exit-entry,h);
 // Cover the country tile's isolated upper cobbles with the same opaque soil
 // texture, following the route in world space, without a flat-color seam.
 const end=Math.min(q.w,entry-q.x);if(end>0){
  let edge=countryEdges.get(q);if(!edge){edge=document.createElement('canvas');edge.width=Math.ceil(end);edge.height=38;const b=edge.getContext('2d');b.beginPath();b.moveTo(0,0);b.lineTo(end,0);for(let x=end;x>=0;x-=5)b.lineTo(x,33+Math.sin((q.x+x)*.13)*2);b.lineTo(0,33+Math.sin(q.x*.13)*2);b.closePath();b.clip();b.fillStyle=b.createPattern(bed,'repeat');b.fillRect(0,0,end,38);roadTiles(b,grade(art['village-berm-v5'],'brightness(.70) saturate(.62)'),q.x,q.x+end,-201,420,q.x);countryEdges.set(q,edge);}c.drawImage(edge,0,-114);
 }c.restore();
}
export const VILLAGE_PLANES=[
 {key:'nightmare-depth-mountains-v2',depth:.068,root:280,height:165},
 {key:'nightmare-depth-woods-v2',depth:.153,root:315,height:150},
 {key:'village-town-bank-v2',depth:.255,root:400,height:300},
 {key:'village-berm-v5',depth:.43,root:420,height:260},
];
export const villagePlanePosition=(camera,x,p)=>({x:x-camera.x*p.depth,y:p.root});
function band(c,img,offset,root,h,fill,start=-Infinity){
 const w=h*img.width/img.height,first=Number.isFinite(start)?Math.max(0,Math.floor((offset-start)/w)):Math.floor(offset/w);
 for(let i=first;i*w+(Number.isFinite(start)?start:0)-offset<970;i++){
  const x=i*w+(Number.isFinite(start)?start:0)-offset;c.save();c.translate(x+(i%2?w:0),root-h);if(i%2)c.scale(-1,1);c.drawImage(img,0,0,w+1,h);
  if(fill){if(typeof fill==='string'){c.fillStyle=fill;c.fillRect(0,h-1,w+1,600);}else c.drawImage(fill,0,h-1,w+1,400);}c.restore();
 }
}
export function drawVillageBackdrop(c,s,art){
 const progress=villageNight(s),night=Math.round(progress*12)/12,worldX=s.camera.x+21060;
 // Color grading changes illumination; architecture never changes opacity.
 const sky=grade(art['village-night-sky-v4'],'brightness('+(1-night*.18)+') saturate('+(1-night*.15)+')');
 c.fillStyle='#19192e';c.fillRect(0,0,960,540);
 // Keep the painted moon circular and the sky projection fixed throughout dusk.
 c.drawImage(sky,0,0,960,320);
 // These cloud cutouts drift independently; the moon and stars stay fixed.
 band(c,grade(art['village-clouds-v6'],'brightness(.76)'),s.camera.x*.025-s.time*5,268,250,null);
 if(progress>0){
  const dusk=c.createRadialGradient(0,320,35,0,320,590);
  dusk.addColorStop(0,`rgba(22,23,45,${progress})`);dusk.addColorStop(.55,`rgba(22,23,45,${progress*.72})`);dusk.addColorStop(1,'#16172d00');
  c.fillStyle=dusk;c.fillRect(0,0,960,320);
 }

 for(const p of VILLAGE_PLANES){
  const far=p.depth<.4,filter='brightness('+(far?.50-night*.12:.75-night*.12)+') saturate('+(far?.40:.62)+')';
  band(c,grade(art[p.key],filter),(p.depth<.3?worldX:s.camera.x)*p.depth,p.root,p.height,null);
 }
 // Individual roof silhouettes arrive gradually; no cropped panorama wall.
 const houses=grade(art['village-blocks-v3'],'brightness(.48) saturate(.52)'),depth=.55;
 for(let i=0;i<72;i++){
  const home=6600+i*320,x=(home-s.camera.x)*depth;if(x< -320||x>1280)continue;
  const size=210+Math.min(100,i*24);cel(c,houses,[4,1,0,7,5,2][i%6],x,366,size);
 }

}
// Layer 2 shares the playable terrain's camera, slope and horizontal movement.
export function drawVillageGroundBank(c,s,art){
 const img=grade(art['village-berm-v5'],'brightness(.70) saturate(.62)');
 for(const q of s.level.route){
  if(q.x+q.w<s.camera.x-60||q.x>s.camera.x+960/(s.camera.zoom||1)+100)continue;
  c.save();c.translate(q.x,q.y);c.transform(1,((q.yEnd??q.y)-q.y)/q.w,0,1,0,0);c.beginPath();c.rect(0,-420,q.w+.5,900);c.clip();roadTiles(c,img,q.x,q.x+q.w,-315,420,q.x);c.restore();
 }
}
export function drawVillageScenery(c,s,art){
 const visible=q=>q.x+q.size/2>s.camera.x-50&&q.x-q.size/2<s.camera.x+960/(s.camera.zoom||1)+140;
 const gate=s.level.cemeteryExit;if(visible(gate))cel(c,grade(art['nightmare-props'],'saturate(.60) brightness(.87)'),9,gate.x,gate.y+7,gate.size);
 for(const [x,frame,size] of [[190,2,110],[570,3,125],[900,10,90]])if(visible({x,size}))cel(c,art['nightmare-props'],frame,x,groundY(s.level.route,x)-30,size);
 const houses=grade(art['village-blocks-v3'],'saturate(.75) brightness(.80)'),decor=grade(art['village-decor-v1'],'saturate(.72) brightness(.92)'),plaza=grade(art['village-plazas-v2'],'saturate(.74) brightness(.92)');
 for(const q of s.level.houses)if(visible(q)){
  c.fillStyle='#27253240';c.beginPath();c.ellipse(q.x,q.y-3,q.size*.39,12,0,0,Math.PI*2);c.fill();cel(c,houses,q.frame,q.x,q.y,q.size);
 }
 for(const q of s.level.plazaProps)if(visible(q))cel(c,plaza,q.frame,q.x,q.y,q.size);
 for(const q of s.level.decorations)if(visible(q))cel(c,decor,q.frame,q.x,q.y,q.size);
 drawVillageGate(c,s,art);
}
export function drawVillageCarriages(c,s,art,reduced){
 drawVillageDust(c,s,art,reduced,'carriage');
 for(const q of s.carriages||[])if(q.active&&q.x>s.camera.x-400&&q.x<s.camera.x+1350)cel(c,art['village-journey-v4'],4+(reduced?0:Math.floor(q.gait*8)%8),q.x,q.y,330*(q.scale||.82));
}
export function drawVillagers(c,s,art,reduced){
 drawVillageDust(c,s,art,reduced);
 const ordered=[...s.villagers.filter(q=>q.state!=='warning'),...s.villagers.filter(q=>q.state==='warning')];
 for(const q of ordered){if(['waiting','safe','absorbed','carried'].includes(q.state)||q.x<s.camera.x-160||q.x>s.camera.x+960/(s.camera.zoom||1)+160)continue;
  if(q.state==='flee'&&q.blocked&&q.blockedAge>.1){
   const p=villageVillagerProfile(q.style),key='village-climb-'+['adults','children','elders','neighbors'][Math.floor(q.style/2)]+'-v10',frame=q.style%2*8+(reduced?0:q.blockedFrame||0);
   cel(c,art[key],frame,q.x,q.y+(reduced?q.climbLift||0:0),p.size*1.5);continue;
  }
  if(q.state==='warning'){
   const frame=(q.style===2?4:0)+(reduced?2:q.age<.3?0:q.age<.65?1:q.age<2.45?2:3),p=villageVillagerProfile(q.style);
   cel(c,art['village-warning-v10'],frame,q.x,q.y,p.size*1.5);continue;
  }
  if(q.state==='hiding'){
   const frame=(q.style===7?4:0)+(reduced?0:Math.floor(q.age*2.8)%4),p=villageVillagerProfile(q.style),r=s.villageRubble.find(r=>r.id===q.hidingCover);
   cel(c,art['village-hiding-v9'],frame,q.x,q.y,p.size);
   if(r&&!r.freed){c.save();if(r.hit>0)c.filter='brightness(1.6)';shelter(c,art['village-hiding-v9'],8+(r.hp<3?1:0),r.x,r.y);c.restore();}continue;
  }
  if(q.state==='trapped'){
   cel(c,art['village-resistance-v5'],16+Math.floor((q.age||0)*3)%3,q.x,q.y,132);continue;
  }
  if(q.state==='defend'){
   const p=villageVillagerProfile(q.style),frame=q.throwFrame??0;
   cel(c,art[p.defendKey],frame,q.x,q.y,p.size,q.defendDir<0);continue;
  }
  const p=villageVillagerProfile(q.style),base=p.base,turn=q.state==='turning'||q.state==='rescue',candy=['candy','absorbing'].includes(q.state),age=q.state==='rescue'?Math.max(0,1.2-q.age*1.85):q.age,u=clamp((age-.6)/.6);
  const acting={warning:8,trip:9,fallen:9,recover:10,help:11}[q.state];
  const frame=candy?base+11:turn?base+8+Math.min(3,Math.floor(age/.3)):acting!==undefined?base+acting:q.blocked?p.runBase+1:villageVillagerRunFrame(q,reduced),sweet=p.child?44:53;
  const size=(candy?sweet:turn?p.size-(p.size-sweet)*u:p.size)*(q.state==='absorbing'?1-(q.absorbProgress||0)*.65:1);
  c.fillStyle='#15162350';c.beginPath();c.ellipse(q.x,q.y+1,candy?18:p.w*.48,5,0,0,Math.PI*2);c.fill();
  const key=turn||candy?p.key:acting!==undefined?p.actionKey:p.runKey;
  cel(c,art[key],frame,q.x,q.y-(candy?3+(reduced?0:Math.sin(q.age*3)*2):0),size,q.state==='help');
 }
}
export function drawCandyHexy(c,s,art,reduced){
 const q=s.player.candy;if(!q)return false;
 if(q.pumpkin){if(q.containerId)return true;const frame=q.convertAge<.9?Math.min(3,Math.floor(q.convertAge/.225)):4+(reduced?0:Math.floor(q.convertAge*8)%4);cel(c,art['village-hexy-pumpkin-v6'],frame,s.player.x,s.player.y,100);return true;}
 const turning=q.age<.9,frame=turning?4+Math.min(3,Math.floor(q.age/.23)):q.terminal?7:8+Math.min(2,Math.floor(q.effort/21*3));
 const size=(turning?128-(Math.max(0,q.age-.45)/.45)*48:80)*(1-(q.absorbProgress||0)*.25);
 c.save();c.globalAlpha=1;c.filter='none';c.translate(s.player.x,s.player.y);if(!turning&&!q.terminal&&!reduced)c.rotate(Math.sin(q.age*18)*q.pulse*.15);
 cel(c,art['village-candy-spell-v4'],frame,0,0,size);c.restore();return true;
}
export function drawFlyingWitchDefeat(c,e,art){
 if(!e.witchFall)return false;
 if(e.type===28){c.save();c.globalAlpha=Math.min(1,e.deadTime/.45);cel(c,art['harvester-ritual'],12+Math.min(3,Math.floor((e.witchFall.landed?e.witchFall.landAge+ .4:e.witchFall.age)*3)),e.x,e.y,HARVESTER_SIZE,e.dir>0);c.restore();return true;}
 const q=e.witchFall,frame=q.landed?14+Math.min(1,Math.floor(q.landAge*3)):8+Math.min(5,Math.floor(q.age*8));
 c.save();c.globalAlpha=Math.min(1,e.deadTime/.45);cel(c,art['village-witch-flight-v4'],frame,e.x,e.y,198,e.dir>0);c.restore();return true;
}
export function drawPumpkinDefeat(c,e,art){
 if(!e.pumpkinFall)return false;
 const {key,frame}=pumpkinDrawing(e);c.save();c.globalAlpha=Math.min(1,e.deadTime/.35);cel(c,art[key],frame,e.x,e.y,e.orbitEscort?86.4:120,e.dir>0);c.restore();return true;
}
export function drawVillageRubble(c,s,art){
 for(const r of s.villageRubble||[]){
  if(r.x<s.camera.x-160||r.x>s.camera.x+960/(s.camera.zoom||1)+160)continue;
  if(r.shelter){if(!r.freed&&s.villagers.some(q=>q.id===r.villager&&q.state==='hiding'))continue;shelter(c,art['village-hiding-v9'],r.freed?10+Math.min(1,Math.floor(r.age*3)):8,r.x,r.y);continue;}
  if(!r.freed&&s.villagers.some(q=>q.id===r.villager&&q.state==='trapped'))continue;
  const frame=r.freed?21+Math.min(2,Math.floor(r.age*5)):20;cel(c,art['village-resistance-v5'],frame,r.x,r.y,145);
 }
}
export function drawVillageResistance(c,s,art){
 for(const q of s.villageStones||[]){
  c.save();c.strokeStyle='#d9c6a9';c.globalAlpha=.65;c.lineWidth=2;c.beginPath();c.moveTo(q.x-q.vx*.045,q.y-q.vy*.045);c.lineTo(q.x,q.y);c.stroke();c.restore();
  fireCel(c,art['village-soul-effects-v5'],12+Math.floor(q.age*12)%4,q.x,q.y,26,q.age*9);
 }
}
function fireCel(c,img,frame,x,y,size,angle=0,flight=false,trailLength=Infinity,stretch=1){
 const cell=img.width/4;c.save();c.translate(x,y);c.rotate(angle);
 // Reveal the painted trail only as the projectile travels beyond the wand.
 if(Number.isFinite(trailLength)){c.beginPath();c.rect(-trailLength,-size/2,trailLength+size,size);c.clip();}
 c.drawImage(img,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,-size*stretch*(flight?218/256:.5),-size/2,size*stretch,size);c.restore();
}
function blueGlow(c,x,y,r,strength=.3){
 c.save();c.globalCompositeOperation='screen';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(88,220,255,${strength})`);g.addColorStop(.4,`rgba(33,121,255,${strength*.6})`);g.addColorStop(1,'#2255ff00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
}
// Art points left. Register the painted head to the physical collision center;
// reveal only the tail distance already travelled beyond the emitter.
let spellScratch;
function villageSpellCel(c,img,frame,q,size,headX=128,headY=128){
 const cell=img.width/4,scale=size/256,travel=Math.hypot(q.vx,q.vy)*q.age;
 c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(q.vy,q.vx)+Math.PI);
 const edge=headX+travel/scale;
 if(edge<280){
  spellScratch??=document.createElement('canvas');spellScratch.width=256;spellScratch.height=256;const b=spellScratch.getContext('2d');b.drawImage(img,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,0,0,256,256);
  // A feathered alpha reveal leaves a taper, never a vertical guillotine at
  // the wand. This masks only the live trail; the painted head stays anchored.
  b.globalCompositeOperation='destination-in';const g=b.createLinearGradient(Math.max(0,edge-12),0,edge+28,0);g.addColorStop(0,'#fff');g.addColorStop(.55,'#ffffffb0');g.addColorStop(1,'#ffffff00');b.fillStyle=g;b.fillRect(0,0,256,256);
  c.drawImage(spellScratch,-headX*scale,-headY*scale,size,size);
 }else c.drawImage(img,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,-headX*scale,-headY*scale,size,size);
 c.restore();
}
export function drawVillageProjectile(c,q,art,s){
 if(q.life<=0)return false;
 if(q.kind==='candy-ray'){
  const i=Math.floor(q.age*14)%4;villageSpellCel(c,art['village-spell-fx-v7'],12+i,q,300,[45,43,51,50][i]);return true;
 }
 if(q.kind==='soul-flame'||q.kind==='lantern-soul'){
  const i=(Math.floor(q.age*12)+(q.fireSeed||0))%8;
  blueGlow(c,q.x,q.y,78,.34);if(s){const floor=groundY(s.level.route,q.x);blueGlow(c,q.x,floor-8,100,.26*Math.max(0,1-Math.abs(floor-q.y)/250));}
  villageSpellCel(c,art['village-spell-fx-v7'],i,q,104,[110,75,77,83,53,54,55,55][i]);return true;
 }
 if(q.kind==='witch-drop'){
  fireCel(c,art['village-spell-fx-v7'],16+Math.floor(q.age*10)%4,q.x,q.y,94);return true;
 }
 if(q.kind==='witch-puddle'){
  c.save();c.translate(q.x,q.y+7);c.scale(1,.5);fireCel(c,art['village-spell-fx-v7'],22+Math.floor(q.age*5)%2,0,-13,110);c.restore();return true;
 }
 if(q.kind==='lantern-ember'){
  fireCel(c,art['village-fire-v2'],(Math.floor(q.age*14)+(q.fireSeed||0))%8,q.x,q.y,62,Math.atan2(q.vy,q.vx),true);return true;
 }return false;
}
export function drawVillageFog(c,s,art,reduced){
 drawVillageAbsorption(c,s,art,reduced);drawVillageDestruction(c,s,art);
 // Keep the street clear: no alpha mist band crossing buildings or pavement.
 for(const q of s.looseBones||[])if(q.key){c.save();c.globalAlpha=Math.min(1,q.life/2);c.translate(q.x,q.y);c.rotate(q.rotation||0);cel(c,art[q.key],q.frame,0,0,q.size);c.restore();}
 for(const q of s.villageFire||[]){
  if(q.kind==='soul-muzzle'){blueGlow(c,q.x,q.y,80,.35*(1-q.age/q.life));fireCel(c,art['village-spell-fx-v7'],8+Math.min(3,Math.floor(q.age/q.life*4)),q.x,q.y,45,q.angle);continue;}
  if(['ray-impact','soul-impact','drop-impact'].includes(q.kind)){if(q.kind==='soul-impact')blueGlow(c,q.x,q.y,90,.3*(1-q.age/q.life));fireCel(c,art['village-spell-fx-v7'],(q.kind==='soul-impact'?8:20)+Math.min(3,Math.floor(q.age/q.life*4)),q.x,q.y,95);continue;}
  fireCel(c,art['village-fire-v2'],(q.kind==='muzzle'?12:8)+Math.min(3,Math.floor(q.age/q.life*4)),q.x,q.y,68,q.angle);
 }
}
// Screen-plane foreground has a fixed baseline. Horizontal parallax cannot
// drag a decoration's roots up and down when Hexy crosses a hill or reverses.
export function drawVillageForeground(c,s,art){
 const decor=grade(art['village-decor-v1'],'brightness(.57) saturate(.6)'),depth=1.12;
 for(let i=Math.floor(s.camera.x*depth/600)-1;i*600-s.camera.x*depth<1200;i++){
  const home=i*600,x=home-s.camera.x*depth;if(home<7600)continue;
  if(i%4===0){cel(c,grade(art['village-journey-v4'],'brightness(.58) saturate(.7)'),2,x,600,260);continue;}
  cel(c,decor,i%3===0?4:i%3===1?7:1,x,574,i%3===0?168:i%3===1?115:98);
 }
}
