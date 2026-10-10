export function drawEmberWildlife(c,s,art,reduced=false){
 const img=art['forest-wildlife'];if(!img)return;
 const cw=img.width/4,ch=img.height/4;
 for(const q of s.emberEnvironment?.wildlife?.animals||[]){
  if(q.age<0)continue;
  const frame=q.species*8+(reduced?2:Math.floor(q.stride/(q.species?15:12))%8),height=q.species?52:39,width=height*cw/ch;
  c.drawImage(img,frame%4*cw,Math.floor(frame/4)*ch,cw,ch,q.x-width/2,q.y-height*.88,width,height);
 }
}
