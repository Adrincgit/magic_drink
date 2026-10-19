const clamp=n=>Math.max(0,Math.min(1,n));
// A held drawing breathes and bends continuously. The face, grip and wand
// stay registered; changing expressions never cycles unrelated silhouettes.
export function nightmareInkVertex(x,y,time,boss=false,force=1,face={x:.61,y:.34}){
 const faceDistance=Math.hypot((x-face.x)/(boss?.18:.13),(y-face.y)/(boss?.16:.1)),protect=clamp((faceDistance-1)*2);
 const back=boss?clamp((Math.abs(x-face.x)-.17)*4):clamp((face.x-.13-x)*3.5),hair=back*clamp((y-.12)*7)*clamp((.94-y)*8)*protect;
 const cloth=clamp((y-.69)*5)*clamp((.97-y)*10),arm=Math.exp(-(((x-.73)/.23)**2+((y-.39)/.12)**2))*protect,jaw=clamp((y-face.y-.07)*20)*Math.exp(-(((x-face.x)/.1)**2))*clamp((face.y+.25-y)*15);
 const wind=Math.sin(time*5.5-y*7),bend=Math.sin(time*17);
 return{x:x+(.018*hair*wind+.0035*arm*bend+.004*cloth*Math.sin(time*5-y*6))*force,y:y+(.011*hair*Math.sin(time*5-y*8)+.003*arm*bend+.003*cloth*Math.sin(time*6)+(boss?.004:.001)*jaw*Math.sin(time*7.5))*force};
}
function triangle(c,img,crop,uv,xy){
 const [a,b,d]=uv,[p,q,r]=xy,det=(b.x-a.x)*(d.y-a.y)-(d.x-a.x)*(b.y-a.y),A=((q.x-p.x)*(d.y-a.y)-(r.x-p.x)*(b.y-a.y))/det,B=((q.y-p.y)*(d.y-a.y)-(r.y-p.y)*(b.y-a.y))/det,C=((r.x-p.x)*(b.x-a.x)-(q.x-p.x)*(d.x-a.x))/det,D=((r.y-p.y)*(b.x-a.x)-(q.y-p.y)*(d.x-a.x))/det;
 const cx=(p.x+q.x+r.x)/3,cy=(p.y+q.y+r.y)/3;
 c.save();c.beginPath();for(const [i,v]of xy.entries()){const len=Math.max(1,Math.hypot(v.x-cx,v.y-cy)),x=v.x+(v.x-cx)/len*.45,y=v.y+(v.y-cy)/len*.45;if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.closePath();c.clip();
 c.transform(A,B,C,D,p.x-A*a.x-C*a.y,p.y-B*a.x-D*a.y);c.drawImage(img,...crop,0,0,1,1);c.restore();
}
export function drawNightmareLivingInk(c,img,crop,x,y,w,h,{time=0,boss=false,force=1,reduced=false,face}={}){
 if(reduced){c.drawImage(img,...crop,x,y,w,h);return;}
 const cols=5,rows=6,points=[];
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const u=i/cols,v=j/rows,p=nightmareInkVertex(u,v,time,boss,force,face);points.push({uv:{x:u,y:v},xy:{x:x+p.x*w,y:y+p.y*h}});}
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const a=j*(cols+1)+i,b=a+1,d=a+cols+1,e=d+1;
  for(const ids of [[a,b,e],[a,e,d]])triangle(c,img,crop,ids.map(k=>points[k].uv),ids.map(k=>points[k].xy));
 }
}
