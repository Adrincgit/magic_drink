// Authored raster wind frames. Rigid anchors retain their original painting.
export const FORT_FLAGS=[[.538,.022,.162,.108],[.345,.195,.082,.064],[.721,.211,.101,.07],[.092,.497,.078,.067],[.871,.433,.085,.066]];
export const CAMP_FLAGS=[[.36,.065,.198,.145],[.658,.105,.17,.135]];
export const SIDE_FLAGS=[[.155,.039,.096,.145],[.391,.205,.085,.1],[.585,.318,.07,.092],[.755,.436,.06,.074],[.908,.52,.055,.075]];
export const TENT_FLAGS=[[.512,.045,.30,.225]];
export const windFrame=(time,x=0,reduced=false)=>reduced?0:[0,1,2,3,2,1][((Math.floor((time+x*.0013)*6)%6)+6)%6];
export const clothOffset=()=>0;
export function drawWindCloth(c,img,x,y,w,h,time,{flags=[],source=null,reduced=false,windArt=null}={}){
 const [sx,sy,sw,sh]=source||[0,0,img.width,img.height],sheet=windArt?.['wind-flags-painted'];
 if(!sheet||!flags.length){c.drawImage(img,sx,sy,sw,sh,x,y,w,h);return;}
 c.save();c.beginPath();c.rect(x-1,y-1,w+2,h+2);for(const [fx,fy,fw,fh]of flags)c.rect(x+fx*w,y+fy*h,fw*w,fh*h);c.clip('evenodd');
 c.drawImage(img,sx,sy,sw,sh,x,y,w,h);c.restore();
 const row=/camp-purple|clown-outpost|\/tent\.webp|integrated-painted|pressure-barge/.test(img.src)?1:0,frame=windFrame(time,x,reduced);
 for(const [fx,fy,fw,fh]of flags)c.drawImage(sheet,frame*256,row*160,256,160,x+fx*w,y+fy*h,fw*w,fh*h);
}
export function drawCampWindTent(c,s,art,x,y,w,h,open,reduced=false){
 // Doorway darkness belongs to each painted cel and ends at its threshold.
 const frame=windFrame(s.fxTime,x,reduced)+(open?0:4),img=art['camp-wind-interior'];
 c.drawImage(img,frame%4*512,Math.floor(frame/4)*384,512,384,x,y,w,h);
}
