import {drawWindCloth,drawCampWindTent,CAMP_FLAGS,SIDE_FLAGS} from './windClothCanvas';
const mod=(n,d)=>((n%d)+d)%d;
export const CAMP_PLANES=[{depth:.32,root:348,height:340,spacing:690},{depth:.56,root:389,height:435,spacing:790},{depth:.8,root:424,height:510,spacing:1170}];
// Horizons and rooted silhouettes have authored heights. Jumping never pulls
// trees out of the soil. Each plane has independent horizontal translation.
export const campPlaneX=(s,x,depth)=>x-s.camera.x*depth;
export function campSmokePlacement(s,i,layer,reduced=false){
 const time=reduced?0:s.time,spacing=layer===0?470:layer===1?610:530,depth=[.14,.29,.64][layer],travel=s.camera.x*depth+time*[5,9,6][layer];
 const tile=Math.floor(travel/spacing)+i,phase=time*.16+tile*.37+10;
 return{x:tile*spacing-travel,y:[40,210,351][layer],w:[500,680,550][layer],h:[260,185,110][layer],frame:mod(Math.floor(phase),4),mix:mod(phase,1),alpha:[.18,.2,.09][layer]};
}
function smoke(c,s,art,layer,reduced){
 const img=art['ember-smoke'],w=img.width/2,h=img.height/2;c.save();
 for(let i=-2;i<4;i++){
  const q=campSmokePlacement(s,i,layer,reduced);
  for(const [frame,a]of [[q.frame,1-q.mix],[(q.frame+1)%4,q.mix]]){c.globalAlpha=q.alpha*a;c.drawImage(img,frame%2*w,Math.floor(frame/2)*h,w,h,q.x,q.y,q.w,q.h);}
 }
 c.restore();
}
function rooted(c,img,x,y,h,flip=false){
 const w=h*img.width/img.height;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(img,-w/2,-h,w,h);c.restore();
}
function shadow(c,x,y,w,h=12,alpha=.28){
 c.save();c.translate(x,y);c.scale(1,h/w);const g=c.createRadialGradient(0,0,0,0,0,w);
 g.addColorStop(0,'rgba(10,9,16,'+alpha+')');g.addColorStop(.45,'rgba(10,9,16,'+alpha*.6+')');g.addColorStop(1,'rgba(10,9,16,0)');
 c.fillStyle=g;c.fillRect(-w,-w,w*2,w*2);c.restore();
}
export function drawCampBackdrop(c,s,art,reduced=false){
 const img=art['camp-panorama'],h=490,w=h*img.width/img.height,offset=-mod(s.camera.x*.12,w);
 c.save();c.filter='saturate(.65)';for(let x=offset-w;x<960;x+=w)c.drawImage(img,x,-50,w+1,h);c.restore();
 const veil=c.createLinearGradient(0,0,0,420);veil.addColorStop(0,'#82839520');veil.addColorStop(.7,'#9a9baa40');veil.addColorStop(1,'#68697918');c.fillStyle=veil;c.fillRect(0,0,960,440);
 smoke(c,s,art,0,reduced);
 for(const [j,p]of CAMP_PLANES.entries()){
  const first=Math.floor(s.camera.x*p.depth/p.spacing)-1;c.save();c.filter=j===0?'brightness(.85) saturate(.4)':'none';
  for(let i=first;i<first+5;i++){
   const x=campPlaneX(s,i*p.spacing+Math.sin(i*7.1)*85,p.depth);
   if(j===1&&i%2===0){const tent=art['camp-purple'],th=150+mod(i,3)*12,tw=th*tent.width/tent.height;drawWindCloth(c,tent,x+220-tw/2,p.root+5-th,tw,th,s.fxTime,{windArt:art,flags:[[.49,.01,.23,.22]],reduced});}
   rooted(c,art[i%2?'camp-trunk':'camp-pines'],x,p.root,p.height+mod(i,3)*34,i%3===0);
   rooted(c,art['camp-brush'],x+15,p.root+9,48+j*7,i%2===0);
  }
  c.restore();if(j===0)smoke(c,s,art,1,reduced);
 }
 smoke(c,s,art,2,reduced);
}
export function campTentPlacement(s){
 const door=s.level.circusEntrance,w=door.width,h=door.height||620;
 return{x:door.doorX-w*(door.doorFraction??.17),y:door.floor-h,w,h};
}
export function drawCampGround(c,s,art){
 const ground=s.level.circusEntrance.floor,img=art['camp-ash-ground'],w=1200,h=400,left=s.camera.x-100,right=s.camera.x+1060;
 // The irregular painted bank overlaps the background. All walking texture
 // translates at the same world speed, without vertical deformation.
 for(let i=Math.floor(left/w);i*w<right;i++)c.drawImage(img,i*w,ground-290,w+1,h);
}
export function drawCampForecourt(c,s,art,reduced=false){
 const left=s.camera.x-250,right=s.camera.x+1210,ground=s.level.circusEntrance.floor;
 drawCampGround(c,s,art);
 for(let i=Math.floor(left/710);i*710<right;i++){
  const x=i*710+Math.sin(i*4.6)*90;if(x>-1000)continue;
  if((s.campTents||[]).some(q=>Math.abs(x-q.x)<q.w/2+110))continue;
  shadow(c,x,ground-55,130,10,.19);rooted(c,art[mod(i,3)?'camp-brush':'camp-log'],x,ground-40,56+mod(i,3)*8,i%2===0);
 }
 for(const q of s.campTents||[]){
  if(q.x+q.w/2<left||q.x-q.w/2>right)continue;
  const open=q.state!=='closed'&&(q.state!=='opening'||q.age>.25),img=art[open?'camp-tent-open':'camp-tent-closed'],h=q.w*img.height/img.width;
  shadow(c,q.x,ground-7,q.w*.57,24,.38);
  // The common sprite cells include a narrow transparent bottom margin.
  c.save();c.filter='saturate(.73) brightness(.83)';drawCampWindTent(c,s,art,q.x-q.w/2,ground+10-h,q.w,h,open,reduced);c.restore();
 }
 const q=campTentPlacement(s);if(q.x<right&&q.x+q.w>left){
  shadow(c,q.x+q.w*.42,ground+2,q.w*.5,50,.36);
  c.save();c.filter='saturate(.9) brightness(.9)';drawWindCloth(c,art['camp-grand-side'],q.x,q.y,q.w,q.h,s.fxTime,{windArt:art,flags:SIDE_FLAGS,reduced});c.restore();
 }
}
export function drawCampForeground(c,s,art){
 if(!s.level.circusCamp||s.player.x>=0)return;
 const spacing=820,depth=1.06,first=Math.floor(s.camera.x*depth/spacing)-1;
 c.save();c.globalAlpha=.8;c.filter='brightness(.7)';
 for(let i=first;i<first+4;i++)rooted(c,art[i%2?'camp-brush':'camp-log'],campPlaneX(s,i*spacing+190,depth),575,82,i%2===0);
 c.restore();
}
