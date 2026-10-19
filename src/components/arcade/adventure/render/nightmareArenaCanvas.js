export const NIGHTMARE_CONTACT_Y=470;
export function nightmareFloorView(s){
 if(!s.level.openNightmare)return s;
 if(s.powerClash?.focus&&['travel','contest','boss-boost','hexy-boost','resolve'].includes(s.powerClash.state))return{...s,ringPerspective:true,nightmarePerspective:true};
 return{...s,ringPerspective:true,nightmarePerspective:true,camera:{...s.camera,y:s.level.arena.y-NIGHTMARE_CONTACT_Y/(s.camera.zoom||1)}};
}
export function nightmareFloorPlacement(s,img){
 const z=s.camera.zoom||1,cinematic=s.powerClash?.focus&&['travel','contest','boss-boost','hexy-boost','resolve'].includes(s.powerClash.state),floor=cinematic?(s.level.arena.y-s.camera.y)*z:NIGHTMARE_CONTACT_Y,h=Math.max(620,(cinematic?2700:760)*z),w=Math.max(h*img.width/img.height,960+s.level.width*.075),rearY=floor-140*z;
 const center=s.camera.x+480/z,ring=(s.level.arena.left+s.level.arena.right)/2;
 return{x:Math.max(960-w,Math.min(0,480+(ring-center)*z*.18-w/2)),y:rearY-h*.785,w,h,rearY,contactY:floor};
}
// Wind is authored into the four fabric drawings. Rigid scenery never enters
// a wave/deformation buffer; keep this explicit for visual regression tools.
export const nightmareRoomSway=()=>0;
export const nightmareFabricFrame=(s,reduced=false)=>reduced?0:[0,1,2,3,2,1][Math.floor((s.fxTime||0)*6)%6];
export function nightmareSkyPlacement(s,q){const z=s.camera.zoom||1,center=s.camera.x+480/z,ring=(s.level.arena.left+s.level.arena.right)/2;return{...q,x:q.x+(center-ring)*z*.12};}
function paintRoom(c,s,img,reduced,art=null){
 if(!img)return;const q=nightmareFloorPlacement(s,img);
 c.drawImage(img,q.x,q.y,q.w,q.h);
 const sky=art?.['nightmare-city-plate'],cloth=art?.['nightmare-cloth-'+nightmareFabricFrame(s,reduced)],rigid=art?.['nightmare-arena-cutout'];
 if(sky&&cloth&&rigid){
  const far=nightmareSkyPlacement(s,q);c.save();c.beginPath();c.rect(0,0,960,Math.max(0,Math.min(q.rearY,q.y+q.h*.72)));c.clip();
  c.fillStyle='#121127';c.fillRect(0,0,960,540);c.drawImage(sky,far.x,far.y,far.w,far.h);c.drawImage(cloth,q.x,q.y,q.w,q.h);
  // The pillars, ornaments and rear railing retain the original drawing and
  // positions. Only the separately authored fabric cels change with time.
  c.drawImage(rigid,q.x,q.y,q.w,q.h);c.restore();
 }
 const z=s.camera.zoom||1,center=s.camera.x+480/z,ring=(s.level.arena.left+s.level.arena.right)/2;
 for(let y=q.rearY;y<540;y+=3){
  const depth=Math.max(0,Math.min(1,(y-q.rearY)/(540-q.rearY))),contactDepth=(q.contactY-q.rearY)/(540-q.rearY),factor=Math.max(.02,.18+.82*depth/contactDepth);
  const period=Math.max(1,(s.level.width+900)*z*factor),origin=480+(ring-center)*z*factor-period/2,start=origin-Math.ceil(origin/period)*period;
  const sy=img.height*(.79+depth*.13),sh=Math.min(img.height-sy,Math.max(.5,img.height*.13*3/(540-q.rearY)));
  c.save();c.globalAlpha=Math.min(1,(y-q.rearY)/22);for(let x=start;x<960;x+=period)c.drawImage(img,0,sy,img.width,sh,x,y,period,Math.min(3,540-y));c.restore();
 }
}
export function drawNightmareArena(c,s,art,reduced=false){
 c.save();if(s.boss.stage===3)c.filter='brightness(.86) saturate(1.12)';else if(s.boss.stage===2)c.filter='hue-rotate(-8deg)';
 paintRoom(c,s,art['episode-ring'],reduced,art);
 const room=s.level.candyWarehouse,fade=Math.max(0,Math.min(1,(room.right+200-s.player.x)/450));
 if(fade>0){c.save();c.globalAlpha=fade;paintRoom(c,s,art['nightmare-candy-warehouse'],reduced);c.restore();}c.restore();
 const q=s.powerClash;
 if(q?.kind==='nightmare'&&q.focus){
  const z=s.camera.zoom||1,x=(q.focus.x-s.camera.x)*z,y=(q.focus.y-s.camera.y)*z,r=250+(q.bossAmplification||0)*180;
  c.save();c.globalCompositeOperation='screen';const g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,q.hexyBoost?'#ffd99a38':'#b976fb38');g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
 }
}
