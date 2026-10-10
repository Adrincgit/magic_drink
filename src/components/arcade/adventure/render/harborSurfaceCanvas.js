const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Water beside the supports uses world coordinates, like the bridge itself.
// Only small ripples flow with time; camera movement never advects the water.
export function harborWaterPlacement(river){return{y:river.y-36,h:145};}
export function drawHarborSurface(c,s,art,reduced=false){
 const img=art['harbor-water'],time=reduced?0:s.time,width=960/(s.camera.zoom||1);
 for(const river of s.level.rivers){
  if(river.x+river.w<s.camera.x-40||river.x>s.camera.x+width+40)continue;
  const p=harborWaterPlacement(river),tileW=p.h*img.width/img.height,left=Math.max(river.x-32,s.camera.x-30),right=Math.min(river.x+river.w+32,s.camera.x+width+30);
  c.save();c.beginPath();c.rect(river.x-32,p.y,river.w+64,650);c.clip();
  for(let y=p.y;y<p.y+650;y+=5){
   const blend=clamp((y-p.y)/72,0,1);c.globalAlpha=blend*blend*(3-2*blend);
   const row=(y-p.y)/p.h,tileY=Math.floor(row),v=row-tileY,sy=(tileY%2?1-v:v)*img.height;
   const sh=Math.min(6/p.h*img.height,img.height),sourceY=clamp(sy,0,img.height-sh);
   const drift=Math.sin(time*1.6+y*.049)*2.2+Math.sin(time*.8+y*.023)*1.1;
   for(let tile=Math.floor((left-3)/tileW);tile*tileW<right;tile++){
    c.save();c.translate(tile*tileW+drift,y);if(Math.abs(tile)%2){c.translate(tileW,0);c.scale(-1,1);}
    c.drawImage(img,0,sourceY,img.width,sh,0,0,tileW,6);c.restore();
   }
  }
  c.restore();
 }
}
