import {groundY} from '../world/adventureTerrain';
import {villageVillagerProfile,villageVillagerRunFrame} from '../actors/villageVillagers';
import {paintMagicLight} from './projectileLightsCanvas';
import {drawNightmareArena} from './nightmareArenaCanvas';
import {drawNightmareMote} from './nightmareMotesCanvas';
const root='/arcade/act-two/episode-two-v1/';
export function episodeTwoArtPaths(){
 return {...Object.fromEntries(['castle','interior','ring','harlequin','couple','effects','hexy-double','harlequin-portrait','harlequin-walk','count-walk','rigging','minions','corn-sunset','corn-night'].map(name=>['episode-'+name,root+name+'.webp'])),
  ...Object.fromEntries(['phase-two','phase-two-walk','phase-three','phase-three-walk','madness-portrait','charge-portrait','candy-warehouse','candy-props'].map(name=>['nightmare-'+name,'/arcade/act-two/nightmare-madness-v2/'+name+'.webp'])),
  ...Object.fromEntries(['boss-air','boss-portraits'].map(name=>['pressure-'+name,'/arcade/act-two/nightmare-combat-v11/'+name+'.webp'])),
  ...Object.fromEntries([2,3].map(phase=>['nightmare-staff-sweep-'+phase,'/arcade/act-two/nightmare-combat-v11/staff-sweep-'+phase+'.webp'])),
  'nightmare-purple-detonation':'/arcade/act-two/nightmare-combat-v11/purple-detonation.webp',
  'pressure-hexy-portraits':'/arcade/act-two/nightmare-sprites-v6/hexy-portraits.webp',
  'nightmare-glee-portraits':'/arcade/act-two/nightmare-sprites-v6/boss-portraits.webp',
  'nightmare-purple-energy':'/arcade/act-two/nightmare-storm-v8/purple-energy.webp',
  'nightmare-speech-balloons':'/arcade/act-two/nightmare-performance-v10/speech-tails.webp',
  ...Object.fromEntries(['clash-plasma','fast-wind','city-plate','arena-cutout',...Array.from({length:4},(_,i)=>'cloth-'+i)].map(name=>['nightmare-'+name,'/arcade/act-two/nightmare-performance-v10/'+name+'.webp'])),
  ...Object.fromEntries([2,3].flatMap(phase=>['jump','staff-defense'].map(kind=>[`nightmare-${kind}-${phase}`,`/arcade/act-two/nightmare-performance-v10/${kind}-${phase}.webp`]))),
  ...Object.fromEntries([2,3].map(phase=>['nightmare-staff-'+phase,'/arcade/act-two/nightmare-storm-v8/staff-'+phase+'.webp'])),
  ...Object.fromEntries([2,3].map(phase=>['nightmare-staff-down-'+phase,'/arcade/act-two/nightmare-combo-v9/staff-down-'+phase+'.webp'])),
  'pressure-meter':'/arcade/act-two/nightmare-pressure-v4/meter.webp','nightmare-corner-magic':'/arcade/act-two/nightmare-corners-v5/corner-magic.webp',
  ...Object.fromEntries(['ground','air'].map(name=>['hexy-nightmare-pressure-'+name,'/arcade/act-two/nightmare-sprites-v6/hexy-'+name+'.webp'])),
  ...Object.fromEntries([1,2,3].flatMap(phase=>['idle','cast'].map(kind=>[`nightmare-phase-${phase}-${kind}`,`/arcade/act-two/nightmare-coherence-v7/phase-${phase}-${kind}.webp`]))),
  'nightmare-phase-one':'/arcade/act-two/nightmare-madness-v2/phase-two.webp','nightmare-phase-one-walk':'/arcade/act-two/nightmare-madness-v2/phase-two-walk.webp',
  'aerial-boss-air-actions':'/arcade/act-two/nightmare-storm-v8/boss-aerial-actions.webp',
  'aerial-candy-vortex':'/arcade/act-two/nightmare-performance-v10/halloween-vortex-16.webp'};
}
export function episodeCel(c,img,frame,x,y,size,flip=false,center=false,angle=0,anchorX=.5){
 if(!img)return;const side=img.width/4;c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);
 c.drawImage(img,frame%4*side,Math.floor(frame/4)*side,side,side,-size*anchorX,center?-size/2:-size*.975,size,size);c.restore();
}
export function drawEpisodeHorizon(c,s,art,reduced=false){
 if(!s.episodeTwo||s.level.badDreams||s.level.maskMansion&&s.castleInside)return;
 const img=art['episode-castle'];if(!img)return;
 const progress=Math.min(1,s.player.x/s.level.width),w=s.index===6?170:s.index===7?250:s.index===8?340+progress*170:1000;
 const h=w*img.height/img.width,x=s.index===9?730-(s.camera.x*.085):760-progress*190;
 c.save();c.globalAlpha=s.index===6?.58:s.index===7?.72:.9;c.filter=s.index<9?'brightness(.75) saturate(.75)':'brightness(.85)';
 c.drawImage(img,x-w/2,350-h,w,h);c.restore();
 if(!reduced&&s.index<9)paintMagicLight(c,x,350-h*.4,w*.5,'#b38dff',.08);
}
export function drawCastleBackdrop(c,s,art,reduced=false){
 if(s.level.openNightmare){drawNightmareArena(c,s,art,reduced);return true;}
 if(!s.level.castleCircus)return false;
 if(s.level.maskMansion&&!s.castleInside)return false;
 const img=art[s.level.badDreams?'episode-ring':'episode-interior'];if(!img)return false;
 const h=660,w=h*img.width/img.height,shift=s.camera.x*(s.level.badDreams?.025:.11),start=Math.floor(shift/w);
 c.save();if(s.level.badDreams&&s.boss.stage>=2)c.filter=s.boss.stage===3?'brightness(.74) saturate(1.25)':'hue-rotate(-10deg)';
 for(let i=start-1;i<=start+2;i++){c.save();c.translate(i*w-shift,-80);if(i%2){c.translate(w,0);c.scale(-1,1);}c.drawImage(img,0,0,w,h);c.restore();}
 c.restore();
 const warehouse=art['nightmare-candy-warehouse'],room=s.level.candyWarehouse;
 if(room&&warehouse&&s.player.x<room.right+200){
  const alpha=Math.max(0,Math.min(1,(room.right+200-s.player.x)/450)),height=670,width=height*warehouse.width/warehouse.height;
  c.save();c.globalAlpha=alpha;c.drawImage(warehouse,-s.camera.x*.07,-95,width,height);c.restore();
 }
 return true;
}
export function drawEpisodeScenery(c,s,art,reduced){
 if(!s.level.castleCircus)return;
 const viewW=960/(s.camera.zoom||1),left=s.camera.x-300,right=left+viewW+600;
 if(s.level.candyWarehouse){
  const props=[[170,3,140],[630,4,125],[1100,5,230],[1510,0,125],[1740,1,120],[1950,2,115],[s.level.arena.right-90,3,130]];
  for(const [x,frame,size]of props){
   if(x<left||x>right)continue;
   const y=Math.max(...[-size*.2,0,size*.2].map(dx=>groundY(s.level.route,x+dx)))+8;
   const released=s.episodeTwo?.released;
   episodeCel(c,art['nightmare-candy-props'],released?7:frame,x,y,size);
   if(!released&&!reduced)paintMagicLight(c,x,y-30,size*.55,'#cf9fff',.08+Math.sin(s.time*2+x)*.025);
  }
 }
 if(s.level.openNightmare)return;
 if(s.level.maskMansion&&!s.castleInside){
  const img=art['episode-castle'];if(img){const w=1900,h=w*img.height/img.width;c.drawImage(img,3450-w*.53,480-h,w,h);}
 }else{
  // Visible rigging belongs to the set: beams, pulleys and painted curtains.
  const start=s.level.badDreams?2200:10000;
  for(let x=Math.max(start,Math.floor(left/850)*850);x<right;x+=850){
   if(s.level.badDreams&&x>s.level.arena.left+180&&x<s.level.arena.right-180)continue;
   const y=Math.max(...[-65,0,65].map(dx=>groundY(s.level.route,x+dx)))+14,frame=Math.floor(x/850)%2;
   // Native foot centres, measured from the final atlas: the pulley extends
   // to the right of the second mast and must not shift its planted base.
   episodeCel(c,art['episode-rigging'],frame,x,y,800,false,false,0,[.49805,.38158][frame]);
  }
  if(s.level.badDreams){
   const a=s.level.arena,torn=s.dreamRoofTorn||s.boss.stage===3;
   if(torn){c.save();c.globalAlpha=.4;c.fillStyle='#1b1634';c.beginPath();c.moveTo(a.left+500,a.y-650);c.lineTo(a.left+720,a.y-530);c.lineTo(a.left+900,a.y-710);c.lineTo(a.left+1120,a.y-520);c.lineTo(a.left+1310,a.y-670);c.closePath();c.fill();c.restore();}
  }
 }
 if(!reduced&&!s.powerClash)for(let i=0;i<9;i++){
  const x=left+((i*191+s.time*(22+i%3*7))%(viewW+600)),y=groundY(s.level.route||s.platforms,x)-100-(i*79)%320;
  if(s.level.badDreams)drawNightmareMote(c,art,i%3?1:0,s.fxTime,x,y,13+i%3*4,s.time*.5+i,.65);
  else episodeCel(c,art['episode-effects'],i%4,x,y,13+i%3*4,false,true,s.time*.5+i);
 }
}
export function drawEpisodePeople(c,s,art,reduced){
 const q=s.episodeTwo;if(!q)return;
 for(const n of q.npcs){
  if(n.x<s.camera.x-150||n.x>s.camera.x+960/(s.camera.zoom||1)+150)continue;
  if(n.kind==='clown'){
   const img=art['red-clown-flee'];if(!img)continue;
   const frame=reduced?0:Math.floor(n.gait*8)%8,side=img.width/4;
   c.drawImage(img,frame%4*side,Math.floor(frame/4)*side,side,side,n.x-58,n.y-116,116,116);
  }else{
   const profile=villageVillagerProfile(n.style),img=art[profile.runKey];if(!img)continue;
   const frame=villageVillagerRunFrame(n,reduced),side=img.width/4,size=profile.size;
   c.save();c.translate(n.x,n.y);if(profile.runFlip)c.scale(-1,1);c.drawImage(img,frame%4*side,Math.floor(frame/4)*side,side,side,-size/2,-size*.975,size,size);c.restore();
  }
 }
 if(q.released&&s.level.badDreams){
  const a=s.level.arena;
  for(let i=0;i<3;i++){const x=a.left+450+i*180;episodeCel(c,art.clown,0,x,a.y,110);}
  for(let i=0;i<2;i++){const p=villageVillagerProfile(i?3:0),img=art[p.actionKey];episodeCel(c,img,p.base+11,a.left+1030+i*160,a.y,p.size,i===1);}
 }
}
export function drawEpisodeSlope(c,s,q,art){
 if(!s.level.castleCircus||q.kind!=='earth'||q.yEnd===undefined||q.yEnd===q.y)return false;
 const img=art['act-two-prop-'+(s.level.maskMansion?9:10)];if(!img)return false;
 c.save();c.beginPath();c.moveTo(q.x,q.y-6);c.lineTo(q.x+q.w,q.yEnd-6);c.lineTo(q.x+q.w,1600);c.lineTo(q.x,1600);c.closePath();c.clip();c.fillStyle=s.level.world.soil[1];c.fillRect(q.x,Math.min(q.y,q.yEnd),q.w,1600);
 const slope=(q.yEnd-q.y)/q.w,begin=Math.floor((Math.max(q.x,s.camera.x-250)-q.x)/240)*240,end=Math.min(q.w,s.camera.x+960/(s.camera.zoom||1)+250-q.x);
 c.translate(q.x,q.y-6);c.transform(1,slope,0,1,0,0);
 for(let x=begin;x<end;x+=240)c.drawImage(img,img.width*.12,0,img.width*.7,img.height,x,0,240.5,170);
 c.restore();return true;
}
export function drawEpisodeScreen(c,s,art,en){
 const q=s.episodeTwo;
 if(q?.captionAge>0&&q.caption&&!s.powerClash){
  c.save();c.globalAlpha=Math.min(1,q.captionAge/.3);c.font='bold 19px sans-serif';c.textAlign='center';c.lineWidth=5;c.lineJoin='round';c.strokeStyle='#21192b';c.fillStyle='#ffe981';
  c.strokeText(q.caption[en?1:0],480,494,850);c.fillText(q.caption[en?1:0],480,494,850);c.restore();
 }
 if(s.castleTransition){c.save();c.globalAlpha=s.castleTransition.alpha;c.fillStyle='#08060e';c.fillRect(0,0,960,540);c.restore();}
}
