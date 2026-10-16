import {groundY} from '../world/adventureTerrain';
import {DRINKS} from '../world/adventureLevels';
const lights=new Map();
export function paintMagicLight(c,x,y,r,color='#bf63ff',strength=.3,flat=false){
 let img=lights.get(color);
 if(!img){img=document.createElement('canvas');img.width=128;img.height=128;const b=img.getContext('2d'),g=b.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#fff9eeaa');g.addColorStop(.18,color+'a0');g.addColorStop(.5,color+'48');g.addColorStop(1,color+'00');b.fillStyle=g;b.fillRect(0,0,128,128);lights.set(color,img);}
 c.save();c.globalCompositeOperation='screen';c.globalAlpha*=strength;c.filter='none';c.drawImage(img,x-r,y-r*(flat?.35:1),r*2,r*(flat?.7:2));c.restore();
}
export function drawProjectileLights(c,s){
 const route=s.level.route||s.platforms;
 for(const [shots,hostile] of [[s.shots,false],[s.hostile,true]])for(const q of shots){
  if(q.life<=0||q.hidden||q.rain==='wait'||!Number.isFinite(q.x+q.y))continue;
  if(hostile&&['bone','juggle','red-pellet','ball','bomb'].includes(q.kind))continue;
  const color=hostile?['candy-ray','witch-drop','witch-puddle'].includes(q.kind)?'#d163ff':['lantern-soul','soul-flame','bell-soul','bell-wisp'].includes(q.kind)?'#40cfff':q.element==='fire'||q.ember||q.harlequin?'#ff9146':'#8ebdff':DRINKS[q.kind]?.color||'#ffd870';
  const hex=/^#[a-f0-9]{6}$/i.test(color)?color:'#d695ff',r=Math.min(100,42+(q.r||8)*1.8+(q.heavy?20:0));
  paintMagicLight(c,q.x,q.y,r,hex,q.heavy?.55:.36);
  const floor=groundY(route,q.x),distance=Math.abs(floor-q.y);
  if(distance<180)paintMagicLight(c,q.x,floor-3,r*1.35,hex,.35*(1-distance/180),true);
 }
}
