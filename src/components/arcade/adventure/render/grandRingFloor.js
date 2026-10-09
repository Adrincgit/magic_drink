// The dark ring is a room with a floor, rather than a platform laid over a
// distant panorama. Keep its contact line stable while the combat lens zooms.
export const GRAND_RING_FLOOR='dark';
export const RING_CONTACT_Y=476;
export function grandRingFloorView(s,floor=GRAND_RING_FLOOR){
 if(floor!=='dark'||!s.level.grandRing||s.player.x<0)return s;
 const previous=s.camera.zoom||1,zoom=previous*.94,center=s.camera.x+480/previous;
 return {...s,ringPerspective:true,camera:{...s.camera,zoom,x:center-480/zoom,y:s.level.arena.y-RING_CONTACT_Y/zoom}};
}

export function grandRingFloorPlacement(s,img){
 const zoom=s.camera.zoom,h=Math.max(590,760*zoom),w=h*img.width/img.height;
 const rearY=RING_CONTACT_Y-140*zoom,center=s.camera.x+480/zoom,ring=(s.level.arena.left+s.level.arena.right)/2;
 return {x:480+(ring-center)*zoom*.22-w/2,y:rearY-h*.785,w,h,rearY};
}

export function grandRingFloorRow(s,img,q,y,height=3){
 const depth=Math.max(0,Math.min(1,(y-q.rearY)/(540-q.rearY)));
 // At the fighters' feet the texture travels at exactly the world's speed.
 // Rows near the rear wall move less; those nearer the camera move more.
 const contactDepth=(RING_CONTACT_Y-q.rearY)/(540-q.rearY),factor=.22+.78*depth/contactDepth;
 const period=(s.level.width+840)*s.camera.zoom*factor,center=s.camera.x+480/s.camera.zoom;
 const ring=(s.level.arena.left+s.level.arena.right)/2;
 return {x:480+(ring-center)*s.camera.zoom*factor-period/2,period,
  sourceY:img.height*(.815+depth*.184),sourceH:Math.max(.5,img.height*.184*height/(540-q.rearY)),alpha:Math.min(1,(y-q.rearY)/22)};
}

export function drawGrandRingFloor(c,s,art,q,layers){
 const img=art.world3,from=art[layers.from===3?'grand-ring-inferno':layers.from===2?'grand-ring-burning':'world3'];
 const to=art[layers.to===3?'grand-ring-inferno':layers.to===2?'grand-ring-burning':'world3'];
 c.save();
 for(let y=q.rearY;y<540;y+=3){
  const height=Math.min(3,540-y),row=grandRingFloorRow(s,img,q,y,height);
  const sourceH=Math.min(row.sourceH,img.height-row.sourceY);
  const start=row.x-Math.ceil(row.x/row.period)*row.period;
  for(let x=start;x<960;x+=row.period){
   c.globalAlpha=row.alpha;c.drawImage(from,0,row.sourceY,img.width,sourceH,x,y,row.period,height);
   if(from!==to){c.globalAlpha=row.alpha*layers.blend;c.drawImage(to,0,row.sourceY,img.width,sourceH,x,y,row.period,height);}
  }
 }
 c.restore();
}

export function drawRingContactShadow(c,x,y,width,alpha){
 c.save();c.translate(x,y+1);c.scale(1,.22);
 const radius=width*1.4,shade=c.createRadialGradient(0,0,width*.2,0,0,radius);
 shade.addColorStop(0,`rgba(6,5,9,${Math.min(.8,alpha*2.7)})`);shade.addColorStop(.5,`rgba(6,5,9,${alpha*1.7})`);shade.addColorStop(1,'rgba(6,5,9,0)');
 c.fillStyle=shade;c.fillRect(-radius,-radius,radius*2,radius*2);c.restore();
}
